"use client";

import { useEffect, useRef, useState, type CSSProperties, type DetailedHTMLProps, type HTMLAttributes } from "react";

type ModelViewerElement = HTMLElement & { canActivateAR?: boolean; cameraOrbit: string; fieldOfView: string; jumpCameraToGoal?: () => void; resetTurntableRotation?: (theta?: number) => void };

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, string | number | boolean | undefined | CSSProperties | object>;
    }
  }
}

export type ProductModel = { glb: string; usdz?: string; poster: string; alt: string };

const DEFAULT_ORBIT = "25deg 72deg 105%";

/**
 * A Shopify 3D model (GLB) inside the gallery, rendered by Google's <model-viewer>.
 *
 * The gallery-standard pattern (Shopify Dawn, IKEA, Amazon): the slide first shows the model's poster with one clear
 * "Turn it around" action. Only that tap loads the ~1 MB viewer and the model, and only then does dragging rotate it,
 * so until the shopper opts in, swipes keep moving the gallery. Leaving the slide puts the poster back and frees the GPU.
 * Phones that support it get "View in your space" (Scene Viewer on Android, Quick Look on iOS).
 */
export function ProductModelViewer({ model, active }: { model: ProductModel; active: boolean }) {
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [engaged, setEngaged] = useState(false);
  const [libReady, setLibReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [touched, setTouched] = useState(false);

  // Fetch the viewer code as soon as the 3D slide is on screen, so the tap feels instant. It is never in the page bundle.
  useEffect(() => {
    if (!active || libReady) return;
    let cancelled = false;
    import("@google/model-viewer").then(() => { if (!cancelled) setLibReady(true); }).catch(() => { if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; };
  }, [active, libReady]);

  // Leaving the slide returns it to its poster, so swiping works again and the WebGL context is released.
  useEffect(() => {
    if (active) return;
    setEngaged(false);
    setTouched(false);
    setStatus((value) => (value === "error" ? value : "idle"));
  }, [active]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !engaged || !libReady) return;
    const onProgress = (event: Event) => setProgress((event as CustomEvent<{ totalProgress: number }>).detail.totalProgress);
    const onLoad = () => setStatus("ready");
    const onError = () => setStatus("error");
    // Auto-rotate also fires camera-change; only the shopper's own drag or zoom hides the hint.
    const onInteract = (event: Event) => { if ((event as CustomEvent<{ source?: string }>).detail?.source === "user-interaction") setTouched(true); };
    viewer.addEventListener("progress", onProgress);
    viewer.addEventListener("load", onLoad);
    viewer.addEventListener("error", onError);
    viewer.addEventListener("camera-change", onInteract as EventListener);
    return () => {
      viewer.removeEventListener("progress", onProgress);
      viewer.removeEventListener("load", onLoad);
      viewer.removeEventListener("error", onError);
      viewer.removeEventListener("camera-change", onInteract as EventListener);
    };
  }, [engaged, libReady]);

  const engage = () => {
    setStatus("loading");
    setProgress(0);
    setEngaged(true);
  };

  const resetView = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.cameraOrbit = DEFAULT_ORBIT;
    viewer.fieldOfView = "auto";
    viewer.resetTurntableRotation?.(0);
    setTouched(false);
  };

  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const live = engaged && libReady && status !== "error";

  return <div
    className={`pdp6-model${active ? " is-active" : ""}${live ? " is-live" : ""}${status === "ready" ? " is-ready" : ""}`}
    aria-hidden={!active}
    // Once the model is live, drags belong to the model, not the gallery swipe or the full-screen viewer.
    onPointerDown={live ? (event) => event.stopPropagation() : undefined}
    onPointerUp={live ? (event) => event.stopPropagation() : undefined}
  >
    <img className="pdp6-model-poster" src={model.poster} alt={active && !live ? model.alt : ""} draggable={false} />

    {live && <model-viewer
      ref={(element: HTMLElement | null) => { viewerRef.current = element as ModelViewerElement | null; }}
      class="pdp6-model-canvas"
      src={model.glb}
      ios-src={model.usdz}
      poster={model.poster}
      alt={model.alt}
      camera-controls=""
      touch-action="pan-y"
      interaction-prompt="none"
      camera-orbit={DEFAULT_ORBIT}
      min-camera-orbit="auto auto 60%"
      max-camera-orbit="auto auto 180%"
      shadow-intensity="0.9"
      shadow-softness="0.8"
      exposure="1.05"
      environment-image="neutral"
      auto-rotate={reducedMotion ? undefined : ""}
      auto-rotate-delay="600"
      rotation-per-second="18deg"
      ar=""
      ar-modes="webxr scene-viewer quick-look"
      ar-scale="fixed"
      loading="eager"
      reveal="auto"
    >
      <button slot="ar-button" type="button" className="pdp6-model-ar">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zm0 0v9m0 0l8-4.5M12 12l-8-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
        View in your space
      </button>
    </model-viewer>}

    {!engaged && active && status !== "error" && <button type="button" className="pdp6-model-start" onClick={engage}>
      <OrbitIcon />
      <span>Turn it around in 3D</span>
    </button>}

    {engaged && status === "loading" && <div className="pdp6-model-loading" role="status">
      <span className="pdp6-model-bar"><i style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} /></span>
      <span className="sr-only">Loading 3D model</span>
    </div>}

    {live && status === "ready" && <>
      <p className={`pdp6-model-hint${touched ? " is-gone" : ""}`} aria-hidden="true">Drag to turn it. Pinch or scroll to zoom.</p>
      <button type="button" className="pdp6-model-reset" onClick={resetView} aria-label="Reset 3D view">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </>}

    {status === "error" && active && <p className="pdp6-model-error" role="status">The 3D view could not load here. The photos show every side of the pack.</p>}
  </div>;
}

export function OrbitIcon({ size = 20 }: { size?: number }) {
  return <svg className="pdp6-orbit-icon" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <ellipse cx="12" cy="12" rx="9.5" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 4.5l5 2.8v5.6l-5 2.8-5-2.8V7.3l5-2.8zM12 10.1v5.6M12 10.1l5-2.8M12 10.1L7 7.3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>;
}
