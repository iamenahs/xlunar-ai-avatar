"use client";

/**
 * AvatarStage Component
 * Provides a configurable Canvas wrapper with lights, camera, and controls
 * Can be used standalone or as a convenience wrapper
 */

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import type { StageConfig, CameraConfig } from "../types";

type Vec3 = [number, number, number];

export interface AvatarStageProps {
  children: React.ReactNode;
  stage?: StageConfig;
  camera?: CameraConfig;
  className?: string;
  style?: React.CSSProperties;
}

// Default configurations
const DEFAULT_CAMERA: Required<CameraConfig> = {
  position: [0, 1.4, 2.2],
  fov: 32,
  near: 0.1,
  far: 100,
  enableControls: true,
  controlsTarget: [0, 1.0, 0],
  minDistance: 1,
  maxDistance: 10,
  enableZoom: true,
  enablePan: true,
};

const DEFAULT_STAGE: Required<Omit<StageConfig, "environmentPreset">> & {
  environmentPreset?: StageConfig["environmentPreset"];
} = {
  backgroundColor: "#1a1a1a",
  ambientLightIntensity: 0.6,
  ambientLightColor: "#ffffff",
  directionalLightIntensity: 1.1,
  directionalLightPosition: [3, 4, 2],
  directionalLightColor: "#ffffff",
  showGrid: false,
  environmentPreset: undefined,
};

export function AvatarStage({
  children,
  stage,
  camera,
  className,
  style,
}: AvatarStageProps) {
  const mergedCamera = { ...DEFAULT_CAMERA, ...camera };
  const mergedStage = { ...DEFAULT_STAGE, ...stage };

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        ...style,
      }}
    >
      <Canvas
        camera={{
          position: mergedCamera.position as Vec3,
          fov: mergedCamera.fov,
          near: mergedCamera.near,
          far: mergedCamera.far,
        }}
        style={{ background: mergedStage.backgroundColor }}
      >
        {/* Lighting */}
        <ambientLight
          intensity={mergedStage.ambientLightIntensity}
          color={mergedStage.ambientLightColor}
        />
        <directionalLight
          position={mergedStage.directionalLightPosition as Vec3}
          intensity={mergedStage.directionalLightIntensity}
          color={mergedStage.directionalLightColor}
          castShadow
        />

        {/* Environment preset (optional) */}
        {mergedStage.environmentPreset && (
          <Suspense fallback={null}>
            <Environment preset={mergedStage.environmentPreset} />
          </Suspense>
        )}

        {/* Camera controls */}
        {mergedCamera.enableControls && (
          <OrbitControls
            target={mergedCamera.controlsTarget as Vec3}
            minDistance={mergedCamera.minDistance}
            maxDistance={mergedCamera.maxDistance}
            enableZoom={mergedCamera.enableZoom}
            enablePan={mergedCamera.enablePan}
          />
        )}

        {/* Grid helper (optional) */}
        {mergedStage.showGrid && (
          <gridHelper args={[10, 10, "#444444", "#222222"]} />
        )}

        {/* Children (Avatar components) */}
        {children}
      </Canvas>
    </div>
  );
}

