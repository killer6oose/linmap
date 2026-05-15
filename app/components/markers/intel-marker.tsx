import { Marker } from "../map/Marker";
import { intelMarker } from "~/lib/types";

interface IntelMarkerProps {
  intel: intelMarker;
}

export const IntelMarker = ({ intel }: IntelMarkerProps) => {
  return (
    <Marker position={intel.position} enableHoverEffect>
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center border border-[#0d9488] bg-[#042f2e] px-1 py-[1px]">
          <span className="text-[8px] font-bold tracking-wider text-[#5eead4]">INT</span>
        </div>
        <span className="bg-black/80 text-[#99f6e4] text-[7px] text-center tracking-widest px-1 py-[1px] whitespace-nowrap max-w-[80px] truncate">
          {intel.name}
        </span>
      </div>
    </Marker>
  );
};
