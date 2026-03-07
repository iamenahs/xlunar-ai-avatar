"use client";

/**
 * Control Tab Component
 *
 * Developer-oriented panel for testing the programmable avatar control API.
 * Features:
 * - Command Console: type JSON commands and execute them
 * - Quick Actions: pre-built compound actions (greet, think, present, etc.)
 * - State Inspector: real-time avatar state display
 * - Event Log: stream of controller events
 * - Integration Code: auto-generated code snippets
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import type { AvatarController } from "@/lib/avatar/controller/AvatarController";
import type { AvatarCommand, AvatarEventDetail, AvatarState } from "@/lib/avatar/controller/types";
import {
  POSE_PRESETS,
  HAND_GESTURES,
  BODY_GESTURES,
  BODY_MOTIONS,
  EXPRESSION_PRESETS,
  ANIMATION_PRESETS,
  MOTION_SEQUENCES,
} from "@/lib/avatar";

// ============================================================================
// Quick Action Presets
// ============================================================================

interface QuickAction {
  id: string;
  name: string;
  description: string;
  category: string;
  commands: AvatarCommand[];
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "friendly-greeting",
    name: "Friendly Greeting",
    description: "Wave, smile, then relax",
    category: "social",
    commands: [
      { type: "pose", id: "waving" },
      { type: "expression", id: "happy" },
      { type: "wait", duration: 2000 },
      { type: "pose", id: "relaxed" },
      { type: "wait", duration: 500 },
      { type: "reset-expression" },
    ],
  },
  {
    id: "thinking-moment",
    name: "Thinking",
    description: "Adopt thinking pose with contemplative expression",
    category: "cognitive",
    commands: [
      { type: "pose", id: "thinking" },
      { type: "expression", id: "thoughtful" },
      { type: "body-motion", id: "gentleSway" },
    ],
  },
  {
    id: "presenting",
    name: "Presenting",
    description: "Confident presenting stance",
    category: "professional",
    commands: [
      { type: "pose", id: "presenting" },
      { type: "hand-gesture", id: "open" },
      { type: "expression", id: "confident" },
      { type: "body-motion", id: "subtleBreathing" },
    ],
  },
  {
    id: "excited-reaction",
    name: "Excited!",
    description: "Surprised then happy reaction",
    category: "emotion",
    commands: [
      { type: "expression", id: "surprised" },
      { type: "body-gesture", id: "nod" },
      { type: "wait", duration: 800 },
      { type: "expression", id: "happy" },
      { type: "hand-gesture", id: "thumbsUp" },
      { type: "wait", duration: 1500 },
      { type: "reset" },
    ],
  },
  {
    id: "agreeing",
    name: "Agreeing",
    description: "Nod with a smile",
    category: "social",
    commands: [
      { type: "expression", id: "happy" },
      { type: "body-gesture", id: "nod" },
      { type: "hand-gesture", id: "thumbsUp" },
    ],
  },
  {
    id: "disagreeing",
    name: "Disagreeing",
    description: "Head shake with concerned look",
    category: "social",
    commands: [
      { type: "expression", id: "sad" },
      { type: "body-gesture", id: "shakeHead" },
      { type: "wait", duration: 1200 },
      { type: "reset-expression" },
    ],
  },
  {
    id: "idle-breathing",
    name: "Calm Idle",
    description: "Relaxed with natural breathing",
    category: "idle",
    commands: [
      { type: "pose", id: "relaxed" },
      { type: "body-motion", id: "idleNatural" },
      { type: "reset-expression" },
    ],
  },
  {
    id: "full-reset",
    name: "Full Reset",
    description: "Reset everything to defaults",
    category: "utility",
    commands: [
      { type: "reset" },
    ],
  },
];

// ============================================================================
// Command Templates
// ============================================================================

const COMMAND_TEMPLATES: { label: string; value: string }[] = [
  {
    label: "Single pose",
    value: JSON.stringify({ type: "pose", id: "relaxed" }, null, 2),
  },
  {
    label: "Expression",
    value: JSON.stringify({ type: "expression", id: "happy" }, null, 2),
  },
  {
    label: "Raw pose (LLM direct)",
    value: JSON.stringify({
      type: "raw-pose",
      bones: {
        head: [10, -8, -3],
        rightUpperArm: [-55, -20, 25],
        rightLowerArm: [0, -35, 140],
      },
    }, null, 2),
  },
  {
    label: "Raw expression (LLM direct)",
    value: JSON.stringify({
      type: "raw-expression",
      values: { happy: 0.7, surprised: 0.3, blinkLeft: 0.2 },
    }, null, 2),
  },
  {
    label: "VRMA animation",
    value: JSON.stringify({ type: "vrma", url: "/animations/idle_loop.vrma", loop: true }, null, 2),
  },
  {
    label: "Sequence (queue)",
    value: JSON.stringify([
      { type: "pose", id: "waving" },
      { type: "expression", id: "happy" },
      { type: "wait", duration: 2000 },
      { type: "pose", id: "relaxed" },
      { type: "reset-expression" },
    ], null, 2),
  },
  {
    label: "Batch (simultaneous)",
    value: JSON.stringify([
      { type: "pose", id: "presenting" },
      { type: "expression", id: "confident" },
      { type: "hand-gesture", id: "open" },
    ], null, 2),
  },
  {
    label: "LLM choreography",
    value: JSON.stringify([
      { type: "raw-pose", bones: { rightUpperArm: [-10, -15, -20], rightLowerArm: [-15, 0, 100] } },
      { type: "raw-expression", values: { happy: 0.8 } },
      { type: "wait", duration: 2000 },
      { type: "raw-pose", bones: { head: [10, -8, -3], rightUpperArm: [-55, -20, 25], rightLowerArm: [0, -35, 140] } },
      { type: "raw-expression", values: { happy: 0, surprised: 0.5 } },
      { type: "wait", duration: 1500 },
      { type: "reset" },
    ], null, 2),
  },
];

// ============================================================================
// Component
// ============================================================================

interface ControlTabProps {
  controller: AvatarController;
}

export default function ControlTab({ controller }: ControlTabProps) {
  const [commandInput, setCommandInput] = useState(COMMAND_TEMPLATES[0].value);
  const [activeSubTab, setActiveSubTab] = useState<"console" | "quick" | "state" | "log" | "code">("console");
  const [events, setEvents] = useState<AvatarEventDetail[]>([]);
  const [state, setState] = useState<AvatarState>(controller.getState());
  const [execError, setExecError] = useState<string | null>(null);
  const [queueRunning, setQueueRunning] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // Subscribe to controller events
  useEffect(() => {
    const unsub = controller.on("*", (detail) => {
      setEvents((prev) => [...prev.slice(-99), detail]);

      if (detail.type === "state-change") {
        setState(controller.getState());
      }
      if (detail.type === "queue-start") {
        setQueueRunning(true);
      }
      if (detail.type === "queue-complete") {
        setQueueRunning(false);
      }
      if (detail.type === "error" && detail.data) {
        setExecError(String(detail.data.message ?? "Unknown error"));
      }
    });

    return unsub;
  }, [controller]);

  // Auto-scroll event log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [events]);

  const handleExecute = useCallback(() => {
    setExecError(null);
    try {
      const parsed = JSON.parse(commandInput);

      if (Array.isArray(parsed)) {
        const hasWaits = parsed.some((c: AvatarCommand) => c.type === "wait");
        if (hasWaits) {
          controller.queue(parsed);
        } else {
          controller.batch(parsed);
        }
      } else {
        controller.execute(parsed);
      }
    } catch (err) {
      setExecError(err instanceof Error ? err.message : String(err));
    }
  }, [commandInput, controller]);

  const handleQuickAction = useCallback((action: QuickAction) => {
    setExecError(null);
    const hasWaits = action.commands.some((c) => c.type === "wait");
    if (hasWaits) {
      controller.queue(action.commands);
    } else {
      controller.batch(action.commands);
    }
  }, [controller]);

  const generateIntegrationCode = useCallback(() => {
    const s = controller.getState();
    const lines: string[] = [];
    lines.push("import { useAvatarController, AvatarStage, AvatarSpeechScene } from '@/lib/avatar';");
    lines.push("");
    lines.push("function MyApp() {");
    lines.push("  const controller = useAvatarController();");
    lines.push("  const audioRef = useRef<HTMLAudioElement>(null);");
    lines.push("");
    lines.push("  // Control the avatar programmatically:");
    if (s.pose) lines.push(`  controller.setPose('${s.pose}');`);
    if (s.handGesture) lines.push(`  controller.setHandGesture('${s.handGesture}');`);
    if (s.bodyMotion) lines.push(`  controller.setBodyMotion('${s.bodyMotion}');`);
    if (s.expression) lines.push(`  controller.setExpression('${s.expression}');`);
    if (s.vrmaUrl) lines.push(`  controller.playVrma('${s.vrmaUrl}');`);
    if (!s.pose && !s.expression && !s.vrmaUrl) {
      lines.push("  controller.setPose('relaxed');");
      lines.push("  controller.setExpression('happy');");
    }
    lines.push("");
    lines.push("  return (");
    lines.push("    <AvatarStage>");
    lines.push("      <AvatarSpeechScene");
    lines.push("        controller={controller}");
    lines.push("        appearance={{ modelUrl: '/avatars/model.vrm' }}");
    lines.push("        audioRef={audioRef}");
    lines.push("      />");
    lines.push("    </AvatarStage>");
    lines.push("  );");
    lines.push("}");
    return lines.join("\n");
  }, [controller]);

  const generatePostMessageCode = useCallback(() => {
    return `// Embed avatar in an iframe and control via postMessage
const iframe = document.getElementById('avatar-iframe');

// Send a command
iframe.contentWindow.postMessage({
  source: 'xlunar-avatar',
  command: { type: 'pose', id: 'relaxed' }
}, '*');

// Send a sequence (with waits)
iframe.contentWindow.postMessage({
  source: 'xlunar-avatar',
  commands: [
    { type: 'pose', id: 'waving' },
    { type: 'expression', id: 'happy' },
    { type: 'wait', duration: 2000 },
    { type: 'pose', id: 'relaxed' },
  ]
}, '*');

// Query current state
iframe.contentWindow.postMessage({
  source: 'xlunar-avatar',
  getState: true
}, '*');

// Listen for events
window.addEventListener('message', (e) => {
  if (e.data?.source === 'xlunar-avatar-response') {
    console.log('Avatar event:', e.data);
  }
});`;
  }, []);

  return (
    <section className="section control-tab">
      {/* Sub-tabs */}
      <div className="control-subtabs">
        {(["console", "quick", "state", "log", "code"] as const).map((tab) => (
          <button
            key={tab}
            className={`control-subtab ${activeSubTab === tab ? "active" : ""}`}
            onClick={() => setActiveSubTab(tab)}
          >
            {tab === "console" && "> Console"}
            {tab === "quick" && "Quick Actions"}
            {tab === "state" && "State"}
            {tab === "log" && `Log (${events.length})`}
            {tab === "code" && "</> Code"}
          </button>
        ))}
      </div>

      {/* Console Sub-tab */}
      {activeSubTab === "console" && (
        <div className="control-section">
          <div className="control-row">
            <label className="control-label">Template</label>
            <select
              className="control-select"
              onChange={(e) => {
                const tpl = COMMAND_TEMPLATES[parseInt(e.target.value)];
                if (tpl) setCommandInput(tpl.value);
              }}
            >
              {COMMAND_TEMPLATES.map((tpl, i) => (
                <option key={tpl.label} value={i}>{tpl.label}</option>
              ))}
            </select>
          </div>

          <textarea
            className="control-editor"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            spellCheck={false}
            rows={8}
          />

          <div className="control-actions">
            <button className="btn-primary" onClick={handleExecute} disabled={queueRunning}>
              {queueRunning ? "Running..." : "Execute"}
            </button>
            {queueRunning && (
              <button className="btn-secondary" onClick={() => controller.abortQueue()}>
                Abort Queue
              </button>
            )}
          </div>

          {execError && (
            <div className="error-box">{execError}</div>
          )}

          <div className="control-ref">
            <h4>Available IDs</h4>
            <div className="ref-grid">
              <div className="ref-col">
                <span className="ref-label">Poses</span>
                <span className="ref-values">{POSE_PRESETS.map((p) => p.id).join(", ")}</span>
              </div>
              <div className="ref-col">
                <span className="ref-label">Hand Gestures</span>
                <span className="ref-values">{HAND_GESTURES.map((g) => g.id).join(", ")}</span>
              </div>
              <div className="ref-col">
                <span className="ref-label">Body Gestures</span>
                <span className="ref-values">{BODY_GESTURES.map((g) => g.id).join(", ")}</span>
              </div>
              <div className="ref-col">
                <span className="ref-label">Body Motions</span>
                <span className="ref-values">{BODY_MOTIONS.map((m) => m.id).join(", ")}</span>
              </div>
              <div className="ref-col">
                <span className="ref-label">Expressions</span>
                <span className="ref-values">{EXPRESSION_PRESETS.map((e) => e.id).join(", ")}</span>
              </div>
              <div className="ref-col">
                <span className="ref-label">VRMA Presets</span>
                <span className="ref-values">{ANIMATION_PRESETS.map((a) => a.id).join(", ")}</span>
              </div>
              <div className="ref-col">
                <span className="ref-label">Sequences</span>
                <span className="ref-values">{MOTION_SEQUENCES.map((s) => s.id).join(", ")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Sub-tab */}
      {activeSubTab === "quick" && (
        <div className="control-section">
          {["social", "cognitive", "professional", "emotion", "idle", "utility"].map((cat) => {
            const actions = QUICK_ACTIONS.filter((a) => a.category === cat);
            if (actions.length === 0) return null;
            return (
              <div key={cat}>
                <h4 style={{ textTransform: "capitalize", margin: "8px 0 6px" }}>{cat}</h4>
                <div className="quick-grid">
                  {actions.map((action) => (
                    <button
                      key={action.id}
                      className="quick-btn"
                      onClick={() => handleQuickAction(action)}
                      disabled={queueRunning}
                    >
                      <span className="quick-name">{action.name}</span>
                      <span className="quick-desc">{action.description}</span>
                      <span className="quick-steps">{action.commands.length} commands</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* State Sub-tab */}
      {activeSubTab === "state" && (
        <div className="control-section">
          <div className="state-grid">
            <StateRow label="Ready" value={state.ready ? "Yes" : "No"} active={state.ready} />
            <StateRow label="Pose" value={state.pose ?? "—"} active={!!state.pose} />
            <StateRow label="Hand Gesture" value={state.handGesture ?? "—"} active={!!state.handGesture} />
            <StateRow label="Body Gesture" value={state.bodyGesture ?? "—"} active={!!state.bodyGesture} />
            <StateRow label="Body Motion" value={state.bodyMotion ?? "—"} active={!!state.bodyMotion} />
            <StateRow label="Expression" value={state.expression ?? "—"} active={!!state.expression} />
            <StateRow label="VRMA URL" value={state.vrmaUrl ?? "—"} active={!!state.vrmaUrl} />
            <StateRow label="VRMA Playing" value={state.vrmaPlaying ? "Yes" : "No"} active={state.vrmaPlaying} />
            <StateRow label="Sequence" value={state.sequenceId ?? "—"} active={!!state.sequenceId} />
            <StateRow label="Sequence Playing" value={state.sequencePlaying ? "Yes" : "No"} active={state.sequencePlaying} />
            <StateRow label="Queue Running" value={state.queueRunning ? `Yes (${state.queueLength} remaining)` : "No"} active={state.queueRunning} />
          </div>

          <div className="state-json">
            <h4>Raw State JSON</h4>
            <pre className="control-pre">{JSON.stringify(state, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Event Log Sub-tab */}
      {activeSubTab === "log" && (
        <div className="control-section">
          <div className="log-header">
            <span>{events.length} events</span>
            <button className="btn-sm" onClick={() => setEvents([])}>Clear</button>
          </div>
          <div className="event-log" ref={logRef}>
            {events.length === 0 && (
              <div className="log-empty">No events yet. Execute a command to see events here.</div>
            )}
            {events.map((evt, i) => (
              <div key={i} className={`log-entry log-${evt.type}`}>
                <span className="log-time">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                <span className={`log-type type-${evt.type}`}>{evt.type}</span>
                {evt.data && evt.type !== "state-change" && (
                  <span className="log-data">{JSON.stringify(evt.data)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Sub-tab */}
      {activeSubTab === "code" && (
        <div className="control-section">
          <h4>React Integration</h4>
          <pre className="control-pre">{generateIntegrationCode()}</pre>

          <h4 style={{ marginTop: 16 }}>postMessage (iframe)</h4>
          <pre className="control-pre">{generatePostMessageCode()}</pre>

          <h4 style={{ marginTop: 16 }}>LLM Direct Bone Control (raw-pose)</h4>
          <pre className="control-pre">{`// LLMs can create ANY pose by specifying bone rotations
// instead of choosing from presets. This is the key API
// for making the avatar fully programmable.

controller.setRawPose({
  head: [10, -8, -3],       // tilt down, look right, slight lean
  rightUpperArm: [-55, -20, 25], // arm forward & raised
  rightLowerArm: [0, -35, 140],  // tight elbow bend (hand to chin)
});

controller.setRawExpression({
  happy: 0.7,
  surprised: 0.3,
  blinkLeft: 0.2,
});

// AXIS CONVENTION (degrees, Euler XYZ):
// ─────────────────────────────────────
// Upper arms (from T-pose = horizontal):
//   X: negative = pitch forward, positive = backward
//   Y: left +/right - = outward twist
//   Z: left -/right + = lower arm toward body
//      Z=0 → horizontal (T-pose)
//      Z=±90 → arm at side
//
// Lower arms (forearm):
//   Z: left -/right + = bend elbow (more = tighter bend)
//
// Head/Spine/Chest:
//   X: positive = tilt forward (chin down)
//   Y: positive = turn left, negative = turn right
//   Z: positive = lean left, negative = lean right
//
// Available bones:
//   spine, chest, neck, head, hips,
//   leftUpperArm, leftLowerArm, leftHand,
//   rightUpperArm, rightLowerArm, rightHand,
//   leftUpperLeg, leftLowerLeg, leftFoot,
//   rightUpperLeg, rightLowerLeg, rightFoot`}</pre>

          <h4 style={{ marginTop: 16 }}>LLM / Chatbot Integration</h4>
          <pre className="control-pre">{`// When LLM responds, parse avatar instructions:
function handleLLMResponse(response) {
  // Preset-based (simple)
  if (response.avatar_action) {
    controller.execute(response.avatar_action);
  }

  // LLM-generated custom pose (flexible)
  if (response.avatar_pose) {
    controller.setRawPose(response.avatar_pose);
  }

  // LLM-generated expression blend
  if (response.avatar_expression) {
    controller.setRawExpression(response.avatar_expression);
  }

  // Choreographed sequence
  if (response.avatar_sequence) {
    controller.queue(response.avatar_sequence);
  }
}

// Example: LLM response with raw bone control
{
  "text": "Hmm, let me think about that...",
  "avatar_pose": {
    "head": [10, -8, -3],
    "rightUpperArm": [-55, -20, 25],
    "rightLowerArm": [0, -35, 140]
  },
  "avatar_expression": { "happy": 0.2 }
}`}</pre>

          <h4 style={{ marginTop: 16 }}>Command Reference</h4>
          <pre className="control-pre">{`// Preset-based commands:
{ type: "pose", id: "<pose-id>" }
{ type: "hand-gesture", id: "<gesture-id>" }
{ type: "body-gesture", id: "<gesture-id>" }
{ type: "body-motion", id: "<motion-id>" }
{ type: "expression", id: "<expression-id>" }
{ type: "vrma", url: "<url>", loop: true }
{ type: "sequence", id: "<sequence-id>" }

// Raw LLM-driven commands:
{ type: "raw-pose", bones: { boneName: [x, y, z], ... } }
{ type: "raw-expression", values: { name: 0-1, ... } }

// Flow control:
{ type: "wait", duration: <ms> }
{ type: "reset" }
{ type: "reset-pose" }
{ type: "reset-expression" }
{ type: "stop-vrma" }
{ type: "stop-sequence" }`}</pre>
        </div>
      )}

      <style jsx>{`
        .control-tab {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .control-subtabs {
          display: flex;
          gap: 2px;
          background: #151515;
          padding: 3px;
          border-radius: 6px;
        }

        .control-subtab {
          flex: 1;
          padding: 6px 8px;
          font-size: 11px;
          font-weight: 500;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .control-subtab:hover {
          background: #1a1a1a;
          color: #aaa;
        }

        .control-subtab.active {
          background: #7c3aed;
          color: #fff;
        }

        .control-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .control-section h4 {
          margin: 4px 0 2px;
          font-size: 11px;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .control-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .control-label {
          font-size: 11px;
          color: #666;
          white-space: nowrap;
        }

        .control-select {
          flex: 1;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 4px;
          padding: 6px 8px;
          font-size: 11px;
          color: #e0e0e0;
          cursor: pointer;
        }

        .control-editor {
          background: #0d0d0d;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 10px;
          font-family: "SF Mono", "Fira Code", "Cascadia Code", monospace;
          font-size: 12px;
          color: #00d4ff;
          resize: vertical;
          min-height: 120px;
          line-height: 1.5;
          tab-size: 2;
        }

        .control-editor:focus {
          outline: none;
          border-color: #7c3aed;
        }

        .control-actions {
          display: flex;
          gap: 6px;
        }

        .control-pre {
          background: #0d0d0d;
          border: 1px solid #252525;
          border-radius: 6px;
          padding: 10px;
          font-family: "SF Mono", "Fira Code", "Cascadia Code", monospace;
          font-size: 11px;
          color: #8b8b8b;
          overflow-x: auto;
          white-space: pre;
          line-height: 1.5;
          max-height: 200px;
          overflow-y: auto;
        }

        .control-ref {
          margin-top: 8px;
          background: #111;
          border: 1px solid #252525;
          border-radius: 6px;
          padding: 10px;
        }

        .control-ref h4 {
          margin: 0 0 8px;
        }

        .ref-grid {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ref-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ref-label {
          font-size: 10px;
          font-weight: 600;
          color: #7c3aed;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ref-values {
          font-size: 10px;
          color: #555;
          font-family: monospace;
          word-break: break-all;
          line-height: 1.4;
        }

        /* Quick Actions */
        .quick-grid {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .quick-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
          padding: 10px 12px;
          font-size: 12px;
          background: #1a1a1a;
          border: 1px solid #333;
          text-align: left;
          transition: all 0.2s;
        }

        .quick-btn:hover:not(:disabled) {
          background: #222;
          border-color: #7c3aed;
        }

        .quick-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quick-name {
          font-weight: 600;
          color: #e0e0e0;
          font-size: 13px;
        }

        .quick-desc {
          color: #888;
          font-size: 11px;
        }

        .quick-steps {
          color: #555;
          font-size: 10px;
          font-family: monospace;
        }

        /* State */
        .state-grid {
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: #111;
          border: 1px solid #252525;
          border-radius: 6px;
          padding: 10px;
        }

        .state-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          border-bottom: 1px solid #1a1a1a;
        }

        .state-row:last-child {
          border-bottom: none;
        }

        .state-label {
          font-size: 11px;
          color: #666;
        }

        .state-value {
          font-size: 11px;
          font-family: monospace;
          color: #555;
        }

        .state-value.active {
          color: #7c3aed;
          font-weight: 600;
        }

        .state-json {
          margin-top: 8px;
        }

        /* Event Log */
        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #666;
        }

        .btn-sm {
          padding: 4px 10px;
          font-size: 10px;
          background: #1a1a1a;
          border: 1px solid #333;
          color: #888;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-sm:hover {
          background: #222;
          color: #fff;
        }

        .event-log {
          background: #0d0d0d;
          border: 1px solid #252525;
          border-radius: 6px;
          padding: 8px;
          max-height: 350px;
          overflow-y: auto;
          font-family: "SF Mono", "Fira Code", "Cascadia Code", monospace;
          font-size: 10px;
        }

        .log-empty {
          color: #444;
          text-align: center;
          padding: 20px;
        }

        .log-entry {
          display: flex;
          gap: 8px;
          padding: 3px 0;
          border-bottom: 1px solid #151515;
          align-items: flex-start;
        }

        .log-time {
          color: #444;
          flex-shrink: 0;
        }

        .log-type {
          padding: 1px 4px;
          border-radius: 3px;
          font-size: 9px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .type-ready { background: #064e3b; color: #6ee7b7; }
        .type-command { background: #1e1b4b; color: #a5b4fc; }
        .type-state-change { background: #1a1a2e; color: #666; }
        .type-sequence-complete { background: #312e81; color: #c4b5fd; }
        .type-vrma-complete { background: #312e81; color: #c4b5fd; }
        .type-queue-start { background: #3b0764; color: #d8b4fe; }
        .type-queue-complete { background: #064e3b; color: #6ee7b7; }
        .type-error { background: #450a0a; color: #fca5a5; }

        .log-data {
          color: #555;
          word-break: break-all;
          flex: 1;
        }
      `}</style>
    </section>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function StateRow({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div className="state-row">
      <span className="state-label">{label}</span>
      <span className={`state-value ${active ? "active" : ""}`}>{value}</span>
    </div>
  );
}
