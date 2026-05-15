import React, { useEffect, useRef, useState } from "react";
import { Overlay } from "ol";
import { createPortal } from "react-dom";
import { useMap } from "~/context/MapContext";
import { markerSizes } from "~/lib/map";
import { useLocalStorage } from "~/context/LocalStorageContext";

interface MarkerWrapperProps {
  position: [number, number];
  hide?: boolean;
  children: React.ReactNode;
  enableHoverEffect?: boolean;
}

const MarkerComponent = ({ position, hide = false, children, enableHoverEffect = false }: MarkerWrapperProps) => {
  const { map } = useMap();
  const { data } = useLocalStorage();
  const markerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<Overlay | null>(null);
  // Force a re-render after the marker element is created so the portal renders
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!map) {
      return;
    }

    if (hide) {
      if (overlayRef.current) {
        overlayRef.current.setPosition(undefined);
        map.removeOverlay(overlayRef.current);
        overlayRef.current = null;
      }
      return;
    }

    let needsUpdate = false;

    if (!markerRef.current) {
      markerRef.current = document.createElement("div");
      markerRef.current.style.userSelect = "none";
      needsUpdate = true;
    }

    if (!overlayRef.current) {
      overlayRef.current = new Overlay({
        element: markerRef.current,
        positioning: "center-center",
        stopEvent: false,
      });
      map.addOverlay(overlayRef.current);
    }

    if (overlayRef.current) {
      overlayRef.current.setPosition(position);
    }

    // Trigger a re-render so the portal can mount into the new element
    if (needsUpdate) {
      forceUpdate(n => n + 1);
    }

    return () => {
      if (overlayRef.current) {
        map.removeOverlay(overlayRef.current);
        overlayRef.current = null;
      }
    };
  }, [map, position, hide]);

  return markerRef.current && !hide ? (
    createPortal(
      <div
        onMouseEnter={enableHoverEffect ? () => (markerRef.current!.parentElement!.style.zIndex = "1000") : undefined}
        onMouseLeave={enableHoverEffect ? () => (markerRef.current!.parentElement!.style.zIndex = "0") : undefined}
        onContextMenu={(e) => { e.preventDefault() }}
        className={markerSizes(data.user.settings.markerSize)}
      >
        {children}
      </div>,
      markerRef.current
    )
  ) : null;
};

const areEqual = (prevProps: MarkerWrapperProps, nextProps: MarkerWrapperProps) => {
  return (
    prevProps.position[0] === nextProps.position[0] &&
    prevProps.position[1] === nextProps.position[1] &&
    prevProps.hide === nextProps.hide &&
    prevProps.enableHoverEffect === nextProps.enableHoverEffect &&
    prevProps.children === nextProps.children
  );
};

export const Marker = React.memo(MarkerComponent, areEqual);
