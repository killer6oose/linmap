import { Marker } from "../map/Marker";
import { cop } from "~/lib/types";
import clsx from "clsx";

interface CopMarkerProps {
  cop: cop;
}

const levelColors = {
  1: "bg-[#4ade80] border-[#166534]",   // green - tier 1
  2: "bg-[#facc15] border-[#854d0e]",   // yellow - tier 2
  3: "bg-[#f87171] border-[#7f1d1d]",   // red - tier 3
};

const levelTextColors = {
  1: "text-[#14532d]",
  2: "text-[#713f12]",
  3: "text-[#7f1d1d]",
};

export const CopMarker = ({ cop }: CopMarkerProps) => {
  return (
    <Marker position={cop.position} enableHoverEffect>
      <div className="flex flex-col items-center">
        <div
          className={clsx(
            "flex items-center justify-center border-2 px-1 py-[1px]",
            levelColors[cop.level]
          )}
        >
          <span className={clsx("text-[8px] font-bold tracking-wider", levelTextColors[cop.level])}>
            COP
          </span>
        </div>
        <span className="bg-black/80 text-gray-200/95 text-[7px] text-center tracking-widest px-1 py-[1px] whitespace-nowrap">
          {cop.name.replace("Outpost ", "")}
        </span>
      </div>
    </Marker>
  );
};
