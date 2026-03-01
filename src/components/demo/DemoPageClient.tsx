"use client";

/**
 * Demo Page Client Component
 * Demonstrates all avatar customization options
 */

import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import {
  AvatarStage,
  AvatarSpeechScene,
  PRESET_SKINS,
  getSkinsGrouped,
  BACKGROUND_PRESETS,
  CAMERA_PRESETS,
  POSE_PRESETS,
  HAND_GESTURES,
  BODY_GESTURES,
  BODY_MOTIONS,
  MOTION_SEQUENCES,
  ANIMATION_PRESETS,
  type AvatarSkin,
  type BackgroundPreset,
  type CameraPreset,
  type PosePreset,
  type HandGesture,
  type BodyGesture,
  type BodyMotion,
  type MotionSequenceDefinition,
  type VrmaAnimationPreset,
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
  
  // API Key state
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("openai_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("openai_api_key", apiKey);
    } else {
      localStorage.removeItem("openai_api_key");
    }
  }, [apiKey]);

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

  // Motion Sequence state
  const [activeSequence, setActiveSequence] = useState<MotionSequenceDefinition | null>(null);
  const [sequencePlaying, setSequencePlaying] = useState(false);

  // VRMA Animation state
  const [activeVrma, setActiveVrma] = useState<VrmaAnimationPreset | null>(null);
  const [vrmaLoop, setVrmaLoop] = useState(true);
  const [customVrmaUrl, setCustomVrmaUrl] = useState("");

  // Active tab
  const [activeTab, setActiveTab] = useState<"speech" | "model" | "pose" | "sequences" | "animations" | "environment">("speech");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get the effective model URL
  const effectiveModelUrl = selectedSkin.id === "custom" 
    ? customModelUrl 
    : selectedSkin.modelUrl;

  // Memoize mouthConfig to prevent setup useEffect from re-running every render
  const mouthConfig = useMemo(() => selectedSkin.mouthConfig || {
    threshold: 0.01,
    sensitivity: 2.0,
    smoothing: 0.3,
    maxOpen: 1.0,
  }, [selectedSkin.mouthConfig]);

  // Memoize onSequenceComplete to prevent useEffect re-runs
  const handleSequenceComplete = useCallback(() => {
    setActiveSequence(null);
    setSequencePlaying(false);
  }, []);

  const handleSpeak = useCallback(async () => {
    if (!text.trim()) return;
    setError(null);
    setIsLoading(true);
    try {
      const url = await synthesizeToObjectUrl({ 
        text, 
        voice, 
        format, 
        speed,
        apiKey: apiKey.trim() || undefined,
      });
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
  }, [text, voice, format, speed, apiKey]);

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
              mouthConfig={mouthConfig}
              pose={selectedPose}
              handGesture={selectedHandGesture}
              bodyGesture={selectedBodyGesture}
              bodyMotion={selectedBodyMotion}
              motionSequence={activeSequence}
              onSequenceComplete={handleSequenceComplete}
              vrmaUrl={activeVrma?.url ?? null}
              vrmaLoop={vrmaLoop}
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
            className={`tab ${activeTab === "sequences" ? "active" : ""}`}
            onClick={() => setActiveTab("sequences")}
          >
            🎬 Combos
          </button>
          <button
            className={`tab ${activeTab === "animations" ? "active" : ""}`}
            onClick={() => setActiveTab("animations")}
          >
            🎞️ VRMA
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
            {/* API Key Section */}
            <div className="api-key-section">
              <div className="api-key-header" onClick={() => setShowApiKey(!showApiKey)}>
                <span className="api-key-status">
                  {apiKey ? "🔑 API Key Set" : "⚠️ API Key Required"}
                </span>
                <span className="api-key-toggle">{showApiKey ? "▲" : "▼"}</span>
              </div>
              {showApiKey && (
                <div className="api-key-content">
                  <div className="form-group">
                    <label>OpenAI API Key</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="api-key-input"
                    />
                  </div>
                  <p className="hint">
                    Your API key is stored locally in your browser and sent securely to generate speech.
                    Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com</a>
                  </p>
                </div>
              )}
            </div>

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
                {Array.from(getSkinsGrouped().entries()).map(([group, skins]) => (
                  <optgroup key={group} label={group}>
                    {skins.map((skin) => (
                      <option key={skin.id} value={skin.id}>{skin.name}</option>
                    ))}
                  </optgroup>
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

        {/* Sequences Tab */}
        {activeTab === "sequences" && (
          <section className="section">
            <h3>🎬 Motion Sequences ({MOTION_SEQUENCES.length})</h3>
            <p className="hint" style={{ marginBottom: 8 }}>
              Each sequence is a choreographed combination of poses, gestures, and facial expressions that play out over time.
            </p>

            {(["emotion", "social", "thinking", "reaction", "presentation"] as const).map((cat) => {
              const seqs = MOTION_SEQUENCES.filter(s => s.category === cat);
              if (seqs.length === 0) return null;
              return (
                <div key={cat}>
                  <h3 style={{ textTransform: "capitalize" }}>
                    {cat === "emotion" ? "💫" : cat === "social" ? "👋" : cat === "thinking" ? "🤔" : cat === "reaction" ? "😲" : "📊"} {cat}
                  </h3>
                  <div className="sequence-grid">
                    {seqs.map((seq) => {
                      const isActive = activeSequence?.id === seq.id && sequencePlaying;
                      return (
                        <button
                          key={seq.id}
                          className={`sequence-btn ${isActive ? "playing" : ""}`}
                          onClick={() => {
                            if (isActive) {
                              setActiveSequence(null);
                              setSequencePlaying(false);
                            } else {
                              setActiveSequence(null);
                              setSequencePlaying(false);
                              setTimeout(() => {
                                setActiveSequence(seq);
                                setSequencePlaying(true);
                              }, 50);
                            }
                          }}
                          title={seq.description}
                        >
                          <span className="sequence-name">{seq.name}</span>
                          <span className="sequence-desc">{seq.description}</span>
                          <span className="sequence-steps">{seq.steps.length} steps</span>
                          {isActive && <span className="sequence-indicator">Playing...</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="info-box">
              <strong>How it works:</strong> Click a sequence to play it. The avatar will perform the full choreographed motion and return to its idle pose. Click again to stop early.
            </div>
          </section>
        )}

        {/* Animations Tab (VRMA) */}
        {activeTab === "animations" && (
          <section className="section">
            <h3>🎞️ VRMA Animations</h3>
            <p className="hint" style={{ marginBottom: 8 }}>
              VRM Animation files (.vrma) provide retargetable humanoid animations that work across all VRM models.
            </p>

            {ANIMATION_PRESETS.length > 0 && (
              <>
                <h3>📁 Preset Animations ({ANIMATION_PRESETS.length})</h3>
                <div className="preset-grid">
                  {ANIMATION_PRESETS.map((anim) => (
                    <button
                      key={anim.id}
                      className={`preset-btn ${activeVrma?.id === anim.id ? "active" : ""}`}
                      onClick={() => {
                        if (activeVrma?.id === anim.id) {
                          setActiveVrma(null);
                        } else {
                          setActiveVrma(anim);
                          setVrmaLoop(anim.loop ?? true);
                        }
                      }}
                      title={anim.description}
                    >
                      {anim.name}
                    </button>
                  ))}
                </div>
              </>
            )}

            <h3>🔗 Load Custom VRMA</h3>
            <div className="form-group">
              <label>VRMA File URL</label>
              <input
                type="url"
                value={customVrmaUrl}
                onChange={(e) => setCustomVrmaUrl(e.target.value)}
                placeholder="/animations/my-anim.vrma or https://..."
              />
            </div>
            <div className="options-row">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={vrmaLoop}
                    onChange={(e) => setVrmaLoop(e.target.checked)}
                    style={{ marginRight: 6 }}
                  />
                  Loop
                </label>
              </div>
              <button
                className="btn-primary"
                style={{ flex: "none", padding: "8px 16px" }}
                disabled={!customVrmaUrl.trim()}
                onClick={() => {
                  setActiveVrma({
                    id: "custom-vrma",
                    name: "Custom",
                    url: customVrmaUrl.trim(),
                    category: "custom",
                    loop: vrmaLoop,
                  });
                }}
              >
                ▶ Play
              </button>
            </div>

            {activeVrma && (
              <div className="button-row" style={{ marginTop: 8 }}>
                <button
                  className="btn-secondary"
                  onClick={() => setActiveVrma(null)}
                >
                  ⏹ Stop Animation
                </button>
              </div>
            )}

            <div className="info-box" style={{ marginTop: 8 }}>
              <strong>💡 Tip:</strong> Place .vrma files in <code>/public/animations/</code> and add entries to <code>animations.ts</code> config to make them appear as presets. VRMA animations are automatically retargeted to any VRM model.
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
            📊 Customizations: {PRESET_SKINS.length} skins • {POSE_PRESETS.length} poses • {HAND_GESTURES.length} hand gestures • {BODY_GESTURES.length} body gestures • {BODY_MOTIONS.length} motions • {MOTION_SEQUENCES.length} sequences • {BACKGROUND_PRESETS.length} backgrounds • {CAMERA_PRESETS.length} cameras
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

        .sequence-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sequence-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 3px;
          padding: 10px 12px;
          font-size: 12px;
          background: #1a1a1a;
          border: 1px solid #333;
          text-align: left;
          position: relative;
          overflow: hidden;
        }

        .sequence-btn:hover {
          background: #222;
          border-color: #555;
        }

        .sequence-btn.playing {
          background: linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(124,58,237,0.12) 100%);
          border-color: #00d4ff;
        }

        .sequence-btn.playing::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          background: linear-gradient(90deg, #00d4ff, #7c3aed);
          animation: sequenceProgress 4s linear forwards;
        }

        @keyframes sequenceProgress {
          from { width: 0%; }
          to { width: 100%; }
        }

        .sequence-name {
          font-weight: 600;
          color: #e0e0e0;
          font-size: 13px;
        }

        .sequence-desc {
          color: #888;
          font-size: 11px;
        }

        .sequence-steps {
          color: #555;
          font-size: 10px;
        }

        .sequence-indicator {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #00d4ff;
          font-size: 10px;
          font-weight: 600;
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

        .hint a {
          color: #00d4ff;
          text-decoration: none;
        }

        .hint a:hover {
          text-decoration: underline;
        }

        .api-key-section {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 8px;
          overflow: hidden;
        }

        .api-key-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .api-key-header:hover {
          background: #222;
        }

        .api-key-status {
          font-size: 12px;
          font-weight: 500;
        }

        .api-key-toggle {
          font-size: 10px;
          color: #666;
        }

        .api-key-content {
          padding: 12px;
          border-top: 1px solid #333;
          background: #151515;
        }

        .api-key-input {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 13px;
          color: #e0e0e0;
          width: 100%;
          font-family: monospace;
          transition: border-color 0.2s;
        }

        .api-key-input:focus {
          outline: none;
          border-color: #00d4ff;
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
