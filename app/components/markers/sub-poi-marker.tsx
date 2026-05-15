import { Marker } from "../map/Marker";
import { subPoi } from "~/lib/types";

interface SubPoiMarkerProps {
  subPoi: subPoi;
}

export const SubPoiMarker = ({ subPoi }: SubPoiMarkerProps) => {
  return (
    <Marker position={subPoi.position}>
      <div className="flex flex-col items-center">
        <p className="w-fit tracking-wide font-semibold text-[9px] px-1 py-[1px] text-[#c8c4a0]/80 text-center whitespace-nowrap select-none">
          {subPoi.name}
        </p>
      </div>
    </Marker>
  );
};
