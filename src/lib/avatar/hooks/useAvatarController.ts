/**
 * useAvatarController Hook
 *
 * Creates and manages an AvatarController instance for React components.
 * Pass the returned controller to AvatarSpeechScene or AvatarRenderer
 * via the `controller` prop.
 *
 * @example
 * ```tsx
 * function MyApp() {
 *   const controller = useAvatarController();
 *
 *   const greet = () => {
 *     controller.queue([
 *       { type: 'pose', id: 'waving' },
 *       { type: 'expression', id: 'happy' },
 *       { type: 'wait', duration: 2000 },
 *       { type: 'pose', id: 'relaxed' },
 *     ]);
 *   };
 *
 *   return (
 *     <AvatarStage>
 *       <AvatarSpeechScene
 *         controller={controller}
 *         appearance={{ modelUrl: "/avatars/model.vrm" }}
 *         audioRef={audioRef}
 *       />
 *     </AvatarStage>
 *   );
 * }
 * ```
 */

import { useRef, useEffect } from "react";
import { AvatarController } from "../controller/AvatarController";
import type { PostMessageBridge } from "../controller/PostMessageBridge";

interface UseAvatarControllerOptions {
  /** Enable postMessage bridge for iframe embedding */
  enablePostMessage?: boolean;
  /** Allowed origin for postMessage ('*' for any) */
  postMessageOrigin?: string;
}

export function useAvatarController(
  options: UseAvatarControllerOptions = {}
): AvatarController {
  const controllerRef = useRef<AvatarController | null>(null);
  const bridgeRef = useRef<PostMessageBridge | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new AvatarController();
  }

  useEffect(() => {
    const controller = controllerRef.current!;

    if (options.enablePostMessage && typeof window !== "undefined") {
      import("../controller/PostMessageBridge").then(({ PostMessageBridge: Bridge }) => {
        const bridge = new Bridge(controller, options.postMessageOrigin);
        bridge.start();
        bridgeRef.current = bridge;
      });
    }

    return () => {
      bridgeRef.current?.stop();
      bridgeRef.current = null;
      controller.dispose();
    };
  }, []);

  return controllerRef.current;
}
