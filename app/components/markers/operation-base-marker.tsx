import { Marker } from "../map/Marker";
import { operationBase } from "~/lib/types";
import clsx from "clsx";

interface OperationBaseMarkerProps {
  base: operationBase;
}

const factionColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
  LRI: { bg: "bg-[#1e3a5f]", border: "border-[#3b82f6]", text: "text-[#93c5fd]", label: "LRI" },
  MSS: { bg: "bg-[#3b1a1a]", border: "border-[#ef4444]", text: "text-[#fca5a5]", label: "MSS" },
  CSI: { bg: "bg-[#1a3b1a]", border: "border-[#22c55e]", text: "text-[#86efac]", label: "CSI" },
};

export const OperationBaseMarker = ({ base }: OperationBaseMarkerProps) => {
  const colors = factionColors[base.faction] ?? factionColors.LRI;

  return (
    <Marker position={base.position} enableHoverEffect>
      <div className="flex flex-col items-center">
        <div className={clsx("flex items-center gap-1 border-2 px-1.5 py-0.5", colors.bg, colors.border)}>
          <span className={clsx("text-[8px] font-bold tracking-widest", colors.text)}>
            {colors.label}
          </span>
          <span className={clsx("text-[7px] tracking-wide", colors.text)}>BASE</span>
        </div>
        <span className="bg-black/80 text-gray-200/90 text-[7px] tracking-widest px-1 py-[1px] whitespace-nowrap">
          {base.poi}
        </span>
      </div>
    </Marker>
  );
};
