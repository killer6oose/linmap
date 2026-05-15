import { Marker } from "../map/Marker";
import { cacheMarker } from "~/lib/types";

interface CacheMarkerProps {
  cache: cacheMarker;
}

export const CacheMarker = ({ cache }: CacheMarkerProps) => {
  return (
    <Marker position={cache.position} enableHoverEffect>
      <div className="flex flex-col items-center">
        <div className="w-[14px] h-[14px] border-2 border-[#92400e] bg-[#78350f] rotate-45 flex items-center justify-center">
          <span className="text-[6px] -rotate-45 text-[#fef3c7] font-bold">C</span>
        </div>
      </div>
    </Marker>
  );
};
