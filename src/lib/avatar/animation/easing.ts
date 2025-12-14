/**
 * Easing Functions Library
 * Provides smooth animation curves for natural motion
 * 
 * Based on Robert Penner's easing equations
 * https://easings.net/
 */

// ============================================================================
// BASIC EASING FUNCTIONS
// ============================================================================

/**
 * Linear interpolation (no easing)
 */
export function linear(t: number): number {
  return t;
}

/**
 * Sine easing - smooth, natural feel for breathing
 */
export function easeInSine(t: number): number {
  return 1 - Math.cos((t * Math.PI) / 2);
}

export function easeOutSine(t: number): number {
  return Math.sin((t * Math.PI) / 2);
}

export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/**
 * Quadratic easing - smooth acceleration/deceleration
 */
export function easeInQuad(t: number): number {
  return t * t;
}

export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Cubic easing - more pronounced than quadratic
 */
export function easeInCubic(t: number): number {
  return t * t * t;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Exponential easing - dramatic acceleration
 */
export function easeInExpo(t: number): number {
  return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
}

export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function easeInOutExpo(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

/**
 * Back easing - overshoots slightly for organic feel
 */
export function easeInBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function easeInOutBack(t: number): number {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
}

/**
 * Elastic easing - spring-like bounce
 */
export function easeInElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
}

export function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

/**
 * Bounce easing - bouncing ball effect
 */
export function easeOutBounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

// ============================================================================
// SPRING PHYSICS (for natural settling)
// ============================================================================

export interface SpringConfig {
  stiffness: number;    // Spring constant (higher = faster)
  damping: number;      // Damping ratio (higher = less bounce)
  mass: number;         // Mass (higher = more inertia)
}

export const SPRING_PRESETS: Record<string, SpringConfig> = {
  default: { stiffness: 100, damping: 10, mass: 1 },
  gentle: { stiffness: 60, damping: 15, mass: 1 },
  snappy: { stiffness: 300, damping: 20, mass: 1 },
  bouncy: { stiffness: 180, damping: 12, mass: 1 },
  slow: { stiffness: 40, damping: 8, mass: 1 },
};

export interface SpringState {
  position: number;
  velocity: number;
}

/**
 * Update spring physics simulation
 */
export function updateSpring(
  state: SpringState,
  target: number,
  config: SpringConfig,
  deltaTime: number
): SpringState {
  const { stiffness, damping, mass } = config;
  
  // Calculate spring force
  const displacement = state.position - target;
  const springForce = -stiffness * displacement;
  const dampingForce = -damping * state.velocity;
  
  // F = ma, so a = F/m
  const acceleration = (springForce + dampingForce) / mass;
  
  // Update velocity and position using semi-implicit Euler
  const newVelocity = state.velocity + acceleration * deltaTime;
  const newPosition = state.position + newVelocity * deltaTime;
  
  return {
    position: newPosition,
    velocity: newVelocity,
  };
}

/**
 * Check if spring has settled (close enough to target with low velocity)
 */
export function isSpringSettled(
  state: SpringState,
  target: number,
  positionThreshold = 0.001,
  velocityThreshold = 0.001
): boolean {
  return (
    Math.abs(state.position - target) < positionThreshold &&
    Math.abs(state.velocity) < velocityThreshold
  );
}

// ============================================================================
// SMOOTHING UTILITIES
// ============================================================================

/**
 * Smooth damp - critically damped spring for smooth camera-like motion
 * Similar to Unity's SmoothDamp
 */
export interface SmoothDampState {
  value: number;
  velocity: number;
}

export function smoothDamp(
  current: number,
  target: number,
  currentVelocityRef: { value: number },
  smoothTime: number,
  deltaTime: number,
  maxSpeed = Infinity
): number {
  // Clamp smooth time to prevent division by zero
  smoothTime = Math.max(0.0001, smoothTime);
  
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  
  let change = current - target;
  const originalTo = target;
  
  // Clamp maximum speed
  const maxChange = maxSpeed * smoothTime;
  change = Math.max(-maxChange, Math.min(maxChange, change));
  target = current - change;
  
  const temp = (currentVelocityRef.value + omega * change) * deltaTime;
  currentVelocityRef.value = (currentVelocityRef.value - omega * temp) * exp;
  
  let output = target + (change + temp) * exp;
  
  // Prevent overshooting
  if (originalTo - current > 0 === output > originalTo) {
    output = originalTo;
    currentVelocityRef.value = (output - originalTo) / deltaTime;
  }
  
  return output;
}

/**
 * Exponential smoothing with variable smoothing factor
 */
export function exponentialSmooth(
  current: number,
  target: number,
  smoothing: number,
  deltaTime: number
): number {
  // Convert smoothing to frame-rate independent factor
  const factor = 1 - Math.pow(smoothing, deltaTime * 60);
  return current + (target - current) * factor;
}

// ============================================================================
// ANIMATION CURVE INTERPOLATION
// ============================================================================

export type EasingFunction = (t: number) => number;

/**
 * Interpolate between two values with an easing function
 */
export function interpolate(
  from: number,
  to: number,
  t: number,
  easing: EasingFunction = linear
): number {
  const easedT = easing(Math.max(0, Math.min(1, t)));
  return from + (to - from) * easedT;
}

/**
 * Interpolate between two 3D vectors with easing
 */
export function interpolateVec3(
  from: [number, number, number],
  to: [number, number, number],
  t: number,
  easing: EasingFunction = linear
): [number, number, number] {
  const easedT = easing(Math.max(0, Math.min(1, t)));
  return [
    from[0] + (to[0] - from[0]) * easedT,
    from[1] + (to[1] - from[1]) * easedT,
    from[2] + (to[2] - from[2]) * easedT,
  ];
}

// ============================================================================
// OSCILLATION FUNCTIONS (for idle animations)
// ============================================================================

/**
 * Create smooth oscillation with multiple harmonics for organic feel
 * Returns value between -1 and 1
 */
export function organicOscillation(time: number, baseFrequency: number): number {
  // Primary wave
  const primary = Math.sin(time * baseFrequency * Math.PI * 2);
  
  // Add subtle harmonics for organic feel (varies the rhythm slightly)
  const harmonic1 = Math.sin(time * baseFrequency * 1.5 * Math.PI * 2) * 0.2;
  const harmonic2 = Math.sin(time * baseFrequency * 0.7 * Math.PI * 2) * 0.15;
  
  // Combine and normalize
  const combined = (primary + harmonic1 + harmonic2) / 1.35;
  
  return combined;
}

/**
 * Breathing pattern - asymmetric inhale/exhale
 * Returns 0 at rest, peaks at 1 during inhale
 */
export function breathingCurve(time: number, breathsPerMinute: number = 14): number {
  const cyclesPerSecond = breathsPerMinute / 60;
  const phase = (time * cyclesPerSecond) % 1;
  
  // Inhale is faster (40% of cycle), exhale is slower (60% of cycle)
  // This creates a more natural breathing pattern
  if (phase < 0.4) {
    // Inhale - smooth rise
    return easeOutSine(phase / 0.4);
  } else {
    // Exhale - smooth fall
    return 1 - easeInSine((phase - 0.4) / 0.6);
  }
}

/**
 * Natural head micro-movement pattern
 */
export function headMicroMovement(
  time: number
): { yaw: number; pitch: number; roll: number } {
  return {
    yaw: organicOscillation(time, 0.1) * 0.5 + organicOscillation(time, 0.17) * 0.3,
    pitch: organicOscillation(time, 0.08) * 0.3 + organicOscillation(time, 0.13) * 0.2,
    roll: organicOscillation(time, 0.05) * 0.15,
  };
}

// ============================================================================
// POSE TRANSITION HELPER
// ============================================================================

export interface PoseTransition {
  startTime: number;
  duration: number;
  fromPose: Record<string, [number, number, number]>;
  toPose: Record<string, [number, number, number]>;
  easing: EasingFunction;
}

/**
 * Calculate current pose values during transition
 */
export function evaluatePoseTransition(
  transition: PoseTransition,
  currentTime: number
): { pose: Record<string, [number, number, number]>; complete: boolean } {
  const elapsed = currentTime - transition.startTime;
  const progress = Math.min(elapsed / transition.duration, 1);
  const easedProgress = transition.easing(progress);
  
  const result: Record<string, [number, number, number]> = {};
  
  // Get all unique bone names
  const allBones = new Set([
    ...Object.keys(transition.fromPose),
    ...Object.keys(transition.toPose),
  ]);
  
  for (const bone of allBones) {
    const from = transition.fromPose[bone] || [0, 0, 0];
    const to = transition.toPose[bone] || [0, 0, 0];
    
    result[bone] = [
      from[0] + (to[0] - from[0]) * easedProgress,
      from[1] + (to[1] - from[1]) * easedProgress,
      from[2] + (to[2] - from[2]) * easedProgress,
    ];
  }
  
  return {
    pose: result,
    complete: progress >= 1,
  };
}
