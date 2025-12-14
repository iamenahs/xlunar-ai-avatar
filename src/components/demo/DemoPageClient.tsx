"use client";

/**
 * Demo Page Client Component
 * Demonstrates all avatar customization options
 */

import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  AvatarStage,
  AvatarSpeechScene,
  PRESET_SKINS,
  BACKGROUND_PRESETS,
  CAMERA_PRESETS,
  POSE_PRESETS,
  HAND_GESTURES,
  BODY_GESTURES,
  BODY_MOTIONS,
  type AvatarSkin,
  type BackgroundPreset,
  type CameraPreset,
  type PosePreset,
  type HandGesture,
  type BodyGesture,
  type BodyMotion,
} from "@/lib/avatar";
import { synthesizeToObjectUrl } from "@/lib/tts/client";

// Available OpenAI voices for gpt-4o-mini-tts
const VOICES = ["alloy", "ash", "ballad", "coral", "echo", "fable", "nova", "onyx", "sage", "shimmer"] as const;

export default function DemoPageClient() {
  // TTS state
  const [text, setText] = useState("Hello! I can customize my pose, gestures, and animations.");
  const [voice, setVoice] = useState<string>("alloy");
  const [format, setFormat] = useState<"mp3" | "wav">("mp3");
  const [speed, setSpeed] = useState(1.0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Model/Skin state
  const [selectedSkin, setSelectedSkin] = useState<AvatarSkin>(PRESET_SKINS[0]);
  const [customModelUrl, setCustomModelUrl] = useState("");

  // Environment state
  const [selectedBackground, setSelectedBackground] = useState<BackgroundPreset>(BACKGROUND_PRESETS[0]);
  const [selectedCamera, setSelectedCamera] = useState<CameraPreset>(CAMERA_PRESETS[0]);

  // Transform state
  const [avatarScale, setAvatarScale] = useState(1);
  const [avatarRotationY, setAvatarRotationY] = useState(0);
  const [avatarPositionY, setAvatarPositionY] = useState(0);

  // Pose/Gesture state
  const [selectedPose, setSelectedPose] = useState<PosePreset | null>(null);
  const [selectedHandGesture, setSelectedHandGesture] = useState<HandGesture | null>(null);
  const [selectedBodyGesture, setSelectedBodyGesture] = useState<BodyGesture | null>(null);
  // Default to "Natural Idle" for smooth breathing and sway
  const [selectedBodyMotion, setSelectedBodyMotion] = useState<BodyMotion>(
    BODY_MOTIONS.find(m => m.id === "idleNatural") || BODY_MOTIONS[BODY_MOTIONS.length - 1]
  );

  // Active tab
  const [activeTab, setActiveTab] = useState<"speech" | "model" | "pose" | "environment">("speech");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get the effective model URL
  const effectiveModelUrl = selectedSkin.id === "custom" 
    ? customModelUrl 
    : selectedSkin.modelUrl;

  const handleSpeak = useCallback(async () => {
    if (!text.trim()) return;
    setError(null);
    setIsLoading(true);
    try {
      const url = await synthesizeToObjectUrl({ text, voice, format, speed });
      const audio = audioRef.current;
      if (!audio) return;
      audio.src = url;
      audio.currentTime = 0;
      audio.onplay = () => setIsSpeaking(true);
      audio.onpause = () => setIsSpeaking(false);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, [text, voice, format, speed]);

  const handleStop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsSpeaking(false);
  }, []);

  return (
    <div className="demo-container">
      {/* Avatar Panel */}
      <div className="avatar-panel">
        {effectiveModelUrl && (
          <AvatarStage
            stage={{
              backgroundColor: selectedBackground.backgroundColor,
              ambientLightIntensity: selectedBackground.ambientLight,
              directionalLightIntensity: selectedBackground.directionalLight,
              directionalLightPosition: selectedBackground.lightPosition,
              showGrid: selectedBackground.showGrid,
              environmentPreset: selectedBackground.environmentPreset,
            }}
            camera={{
              position: selectedCamera.position,
              fov: selectedCamera.fov,
              controlsTarget: selectedCamera.target,
              enableZoom: true,
              enablePan: true,
            }}
          >
            <AvatarSpeechScene
              appearance={{ modelUrl: effectiveModelUrl }}
              transform={{
                position: [0, avatarPositionY, 0],
                rotation: [0, avatarRotationY * Math.PI / 180, 0],
                scale: avatarScale,
              }}
              audioRef={audioRef}
              mouthConfig={selectedSkin.mouthConfig || {
                threshold: 0.01,
                sensitivity: 2.0,
                smoothing: 0.3,
                maxOpen: 1.0,
              }}
              pose={selectedPose}
              handGesture={selectedHandGesture}
              bodyGesture={selectedBodyGesture}
              bodyMotion={selectedBodyMotion}
            />
          </AvatarStage>
        )}
        {!effectiveModelUrl && (
          <div className="no-model">
            <p>Select a model or enter a custom URL</p>
          </div>
        )}
      </div>

      {/* Controls Panel */}
      <div className="controls-panel">
        <header className="header">
          <h1>xlunar-ai-avatar</h1>
          <p className="subtitle">Full Customization Demo</p>
        </header>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === "speech" ? "active" : ""}`}
            onClick={() => setActiveTab("speech")}
          >
            🔊 Speech
          </button>
          <button 
            className={`tab ${activeTab === "model" ? "active" : ""}`}
            onClick={() => setActiveTab("model")}
          >
            🎭 Model
          </button>
          <button 
            className={`tab ${activeTab === "pose" ? "active" : ""}`}
            onClick={() => setActiveTab("pose")}
          >
            🤸 Pose
          </button>
          <button 
            className={`tab ${activeTab === "environment" ? "active" : ""}`}
            onClick={() => setActiveTab("environment")}
          >
            🌍 Scene
          </button>
        </div>

        {/* Speech Tab */}
        {activeTab === "speech" && (
          <section className="section">
            <div className="form-group">
              <label>Text to Speak</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="Enter text..."
              />
            </div>

            <div className="options-row">
              <div className="form-group">
                <label>Voice</label>
                <select value={voice} onChange={(e) => setVoice(e.target.value)}>
                  {VOICES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Format</label>
                <select value={format} onChange={(e) => setFormat(e.target.value as "mp3" | "wav")}>
                  <option value="mp3">MP3</option>
                  <option value="wav">WAV</option>
                </select>
              </div>
              <div className="form-group">
                <label>Speed: {speed.toFixed(1)}x</label>
                <input type="range" min="0.5" max="2.0" step="0.1" value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))} />
              </div>
            </div>

            <div className="button-row">
              <button onClick={handleSpeak} disabled={isLoading || !text.trim() || !effectiveModelUrl}
                className="btn-primary">
                {isLoading ? "Loading..." : isSpeaking ? "Speaking..." : "🔊 Speak"}
              </button>
              <button onClick={handleStop} disabled={!isSpeaking} className="btn-secondary">
                ⏹ Stop
              </button>
            </div>

            {error && <div className="error-box"><strong>Error:</strong> {error}</div>}
          </section>
        )}

        {/* Model Tab */}
        {activeTab === "model" && (
          <section className="section">
            <h3>📦 Model Selection</h3>
            <div className="form-group">
              <label>Select Model</label>
              <select
                value={selectedSkin.id}
                onChange={(e) => {
                  const skin = PRESET_SKINS.find(s => s.id === e.target.value);
                  if (skin) setSelectedSkin(skin);
                }}
              >
                {PRESET_SKINS.map((skin) => (
                  <option key={skin.id} value={skin.id}>{skin.name}</option>
                ))}
              </select>
              {selectedSkin.description && <p className="hint">{selectedSkin.description}</p>}
              {selectedSkin.attribution && <p className="hint">Credit: {selectedSkin.attribution}</p>}
            </div>

            {selectedSkin.id === "custom" && (
              <div className="form-group">
                <label>Custom Model URL</label>
                <input
                  type="url"
                  value={customModelUrl}
                  onChange={(e) => setCustomModelUrl(e.target.value)}
                  placeholder="https://... or /avatars/model.vrm"
                />
              </div>
            )}

            <h3>📏 Transform</h3>
            <div className="options-row">
              <div className="form-group">
                <label>Scale: {avatarScale.toFixed(2)}</label>
                <input type="range" min="0.5" max="2.0" step="0.05" value={avatarScale}
                  onChange={(e) => setAvatarScale(parseFloat(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Rotation: {avatarRotationY}°</label>
                <input type="range" min="-180" max="180" step="5" value={avatarRotationY}
                  onChange={(e) => setAvatarRotationY(parseInt(e.target.value))} />
              </div>
            </div>
            <div className="form-group">
              <label>Height Offset: {avatarPositionY.toFixed(2)}</label>
              <input type="range" min="-1" max="1" step="0.05" value={avatarPositionY}
                onChange={(e) => setAvatarPositionY(parseFloat(e.target.value))} />
            </div>

            <div className="info-box">
              <strong>💡 Local Files:</strong> Place VRM/GLB files in <code>/public/avatars/</code> folder
            </div>
          </section>
        )}

        {/* Pose Tab */}
        {activeTab === "pose" && (
          <section className="section">
            <h3>🧍 Body Poses ({POSE_PRESETS.length})</h3>
            <div className="preset-grid">
              {POSE_PRESETS.map((pose) => (
                <button
                  key={pose.id}
                  className={`preset-btn ${selectedPose?.id === pose.id ? "active" : ""}`}
                  onClick={() => setSelectedPose(pose)}
                  title={pose.description}
                >
                  {pose.name}
                </button>
              ))}
            </div>

            <h3>✋ Hand Gestures ({HAND_GESTURES.length})</h3>
            <div className="preset-grid">
              {HAND_GESTURES.map((gesture) => (
                <button
                  key={gesture.id}
                  className={`preset-btn ${selectedHandGesture?.id === gesture.id ? "active" : ""}`}
                  onClick={() => setSelectedHandGesture(gesture)}
                  title={gesture.description}
                >
                  {gesture.name}
                </button>
              ))}
            </div>

            <h3>💃 Body Gestures ({BODY_GESTURES.length})</h3>
            <div className="preset-grid">
              {BODY_GESTURES.map((gesture) => (
                <button
                  key={gesture.id}
                  className={`preset-btn ${selectedBodyGesture?.id === gesture.id ? "active" : ""}`}
                  onClick={() => setSelectedBodyGesture(gesture)}
                  title={gesture.description}
                >
                  {gesture.name}
                </button>
              ))}
            </div>

            <h3>🌊 Body Motions ({BODY_MOTIONS.length})</h3>
            <div className="preset-grid">
              {BODY_MOTIONS.map((motion) => (
                <button
                  key={motion.id}
                  className={`preset-btn ${selectedBodyMotion?.id === motion.id ? "active" : ""}`}
                  onClick={() => setSelectedBodyMotion(motion)}
                  title={motion.description}
                >
                  {motion.name}
                </button>
              ))}
            </div>

            <div className="info-box">
              <strong>Note:</strong> Pose/gesture application requires VRM models with standard humanoid bones.
              Some features may not work with all models.
            </div>
          </section>
        )}

        {/* Environment Tab */}
        {activeTab === "environment" && (
          <section className="section">
            <h3>🖼️ Background ({BACKGROUND_PRESETS.length})</h3>
            <div className="preset-grid">
              {BACKGROUND_PRESETS.map((bg) => (
                <button
                  key={bg.id}
                  className={`preset-btn ${selectedBackground.id === bg.id ? "active" : ""}`}
                  onClick={() => setSelectedBackground(bg)}
                  style={{ backgroundColor: bg.backgroundColor }}
                >
                  {bg.name}
                </button>
              ))}
            </div>

            <h3>📷 Camera ({CAMERA_PRESETS.length})</h3>
            <div className="preset-grid">
              {CAMERA_PRESETS.map((cam) => (
                <button
                  key={cam.id}
                  className={`preset-btn ${selectedCamera.id === cam.id ? "active" : ""}`}
                  onClick={() => setSelectedCamera(cam)}
                >
                  {cam.name}
                </button>
              ))}
            </div>
          </section>
        )}

        <footer className="footer">
          <p className="hint">
            📊 Total Customizations: {PRESET_SKINS.length} skins • {POSE_PRESETS.length} poses • {HAND_GESTURES.length} hand gestures • {BODY_GESTURES.length} body gestures • {BODY_MOTIONS.length} motions • {BACKGROUND_PRESETS.length} backgrounds • {CAMERA_PRESETS.length} cameras
          </p>
        </footer>

        <audio ref={audioRef} />
      </div>

      <style jsx>{`
        .demo-container {
          display: flex;
          height: 100vh;
          width: 100vw;
          background: #0a0a0a;
          font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .avatar-panel {
          flex: 1;
          min-width: 400px;
          border-right: 1px solid #222;
        }

        .no-model {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #666;
        }

        .controls-panel {
          width: 420px;
          padding: 20px;
          overflow-y: auto;
          background: linear-gradient(180deg, #111 0%, #0a0a0a 100%);
          color: #e0e0e0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .header h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          margin: 4px 0 0;
          font-size: 12px;
          color: #666;
        }

        .tabs {
          display: flex;
          gap: 4px;
          background: #1a1a1a;
          padding: 4px;
          border-radius: 8px;
        }

        .tab {
          flex: 1;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 500;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #888;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab:hover {
          background: #252525;
          color: #ccc;
        }

        .tab.active {
          background: #00d4ff;
          color: #000;
        }

        .section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section h3 {
          margin: 8px 0 4px;
          font-size: 12px;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 11px;
          font-weight: 500;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        textarea, select, input[type="url"], input[type="range"] {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 13px;
          color: #e0e0e0;
          transition: border-color 0.2s;
        }

        textarea:focus, select:focus, input[type="url"]:focus {
          outline: none;
          border-color: #00d4ff;
        }

        textarea { resize: vertical; min-height: 60px; }

        select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
        }

        input[type="range"] {
          padding: 0;
          height: 6px;
          -webkit-appearance: none;
          cursor: pointer;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          background: #00d4ff;
          border-radius: 50%;
          cursor: pointer;
        }

        .options-row {
          display: flex;
          gap: 10px;
        }

        .options-row .form-group { flex: 1; }

        .button-row {
          display: flex;
          gap: 8px;
        }

        button {
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          flex: 1;
          background: linear-gradient(135deg, #00d4ff 0%, #00a5cc 100%);
          color: #000;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
        }

        .btn-primary:disabled, .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          flex: 1;
          background: #222;
          color: #888;
          border: 1px solid #333;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #2a2a2a;
          color: #fff;
        }

        .preset-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .preset-btn {
          padding: 8px 6px;
          font-size: 11px;
          font-weight: 500;
          background: #1a1a1a;
          border: 1px solid #333;
          color: #aaa;
        }

        .preset-btn:hover {
          background: #252525;
          border-color: #444;
          color: #fff;
        }

        .preset-btn.active {
          background: #00d4ff22;
          border-color: #00d4ff;
          color: #00d4ff;
        }

        .error-box {
          background: rgba(255, 59, 48, 0.15);
          border: 1px solid rgba(255, 59, 48, 0.3);
          color: #ff6b6b;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
        }

        .info-box {
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.2);
          color: #88d4ff;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 11px;
        }

        .info-box code {
          background: rgba(0, 0, 0, 0.3);
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
        }

        .footer {
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid #222;
        }

        .hint {
          font-size: 10px;
          color: #555;
          margin: 2px 0;
        }

        @media (max-width: 900px) {
          .demo-container { flex-direction: column; }
          .avatar-panel { min-height: 50vh; border-right: none; border-bottom: 1px solid #222; }
          .controls-panel { width: 100%; }
        }
      `}</style>
    </div>
  );
}
