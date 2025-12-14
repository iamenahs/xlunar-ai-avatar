"use client";

/**
 * XLunar AI Avatar - Demo Page
 * 
 * This page demonstrates the avatar speech renderer functionality.
 * The component is dynamically imported to prevent SSR issues with Three.js.
 */

import dynamic from "next/dynamic";

// Dynamic import with SSR disabled for Three.js components
const DemoPageClient = dynamic(
  () => import("@/components/demo/DemoPageClient"),
  { ssr: false }
);

export default function Page() {
  return <DemoPageClient />;
}
