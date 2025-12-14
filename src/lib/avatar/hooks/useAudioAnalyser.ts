"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { AudioAnalyserState, AudioPlayerConfig } from "../types";

const DEFAULT_CONFIG: Required<AudioPlayerConfig> = {
  fftSize: 256,
  smoothingTimeConstant: 0.8,
};

export interface UseAudioAnalyserReturn extends AudioAnalyserState {
  analyzeAudio: (audioElement: HTMLAudioElement) => void;
  stopAnalysis: () => void;
}

/**
 * Hook to analyze audio amplitude from an HTMLAudioElement
 * Uses Web Audio API AnalyserNode to extract real-time amplitude
 */
export function useAudioAnalyser(
  config: AudioPlayerConfig = {}
): UseAudioAnalyserReturn {
  const [state, setState] = useState<AudioAnalyserState>({
    amplitude: 0,
    isPlaying: false,
    isAnalyzing: false,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const analyze = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) {
      rafIdRef.current = requestAnimationFrame(analyze);
      return;
    }

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    // Get time domain data for amplitude
    analyser.getByteTimeDomainData(dataArray);

    // Calculate RMS (Root Mean Square) amplitude
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const value = (dataArray[i] - 128) / 128; // Normalize to -1 to 1
      sum += value * value;
    }
    const rms = Math.sqrt(sum / dataArray.length);

    // Normalize RMS to 0-1 range (typical speech is ~0.1-0.3 RMS)
    const normalizedAmplitude = Math.min(rms * 3, 1);

    const audioEl = audioElementRef.current;
    const isPlaying = audioEl ? !audioEl.paused && !audioEl.ended : false;

    setState({
      amplitude: isPlaying ? normalizedAmplitude : 0,
      isPlaying,
      isAnalyzing: true,
    });

    rafIdRef.current = requestAnimationFrame(analyze);
  }, []);

  const analyzeAudio = useCallback(
    (audioElement: HTMLAudioElement) => {
      // Cleanup previous
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Store reference
      audioElementRef.current = audioElement;

      // Create or resume AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;

      // Resume if suspended (browser autoplay policy)
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      // Only create source once per audio element
      if (!sourceRef.current) {
        sourceRef.current = audioContext.createMediaElementSource(audioElement);
      }

      // Create analyser if needed
      if (!analyserRef.current) {
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = mergedConfig.fftSize;
        analyserRef.current.smoothingTimeConstant =
          mergedConfig.smoothingTimeConstant;
        dataArrayRef.current = new Uint8Array(
          analyserRef.current.frequencyBinCount
        );

        // Connect: source -> analyser -> destination
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContext.destination);
      }

      // Start analysis loop
      analyze();
    },
    [analyze, mergedConfig.fftSize, mergedConfig.smoothingTimeConstant]
  );

  const stopAnalysis = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    setState({
      amplitude: 0,
      isPlaying: false,
      isAnalyzing: false,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
    };
  }, []);

  return {
    ...state,
    analyzeAudio,
    stopAnalysis,
  };
}

/**
 * Simpler hook that returns amplitude getter for use in useFrame
 */
export function useAudioEnergy(audioRef: React.RefObject<HTMLAudioElement | null>) {
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);
  const sourceCreatedRef = useRef(false);

  const ensureGraph = useCallback(async () => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;

    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    if (!analyserRef.current && !sourceCreatedRef.current) {
      sourceCreatedRef.current = true;
      const source = ctx.createMediaElementSource(audioEl);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.75;

      source.connect(analyser);
      analyser.connect(ctx.destination);

      analyserRef.current = analyser;
      dataRef.current = new Uint8Array(analyser.fftSize);
    }
  }, [audioRef]);

  const getEnergy = useCallback(() => {
    const analyser = analyserRef.current;
    const data = dataRef.current;
    if (!analyser || !data) return 0;

    analyser.getByteTimeDomainData(data);

    // RMS calculation
    let sumSq = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sumSq += v * v;
    }
    const rms = Math.sqrt(sumSq / data.length);

    // Normalize to roughly 0..1
    return Math.min(1, rms * 3);
  }, []);

  return { ensureGraph, getEnergy };
}

