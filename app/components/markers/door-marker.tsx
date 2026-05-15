import { Marker } from "../map/Marker";
import { doorMarker } from "~/lib/types";
import clsx from "clsx";

interface DoorMarkerProps {
  door: doorMarker;
}

export const DoorMarker = ({ door }: DoorMarkerProps) => {
  const isCode = door.type === 'code';
  return (
    <Marker position={door.position} enableHoverEffect>
      <div className="flex flex-col items-center">
        <div className={clsx(
          "flex items-center justify-center border px-1 py-[1px]",
          isCode
            ? "bg-[#1c1c0a] border-[#ca8a04] text-[#fde68a]"
            : "bg-[#0a0a1c] border-[#6366f1] text-[#c7d2fe]"
        )}>
          <span className="text-[8px] font-bold tracking-wider">
            {isCode ? "CODE" : "KEY"}
          </span>
        </div>
        <span className="bg-black/80 text-gray-300/90 text-[7px] text-center tracking-widest px-1 py-[1px] whitespace-nowrap max-w-[80px] truncate">
          {door.name}
        </span>
      </div>
    </Marker>
  );
};
