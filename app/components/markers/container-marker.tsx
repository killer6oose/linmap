import { Marker } from "../map/Marker";
import { containerGroup } from "~/lib/types";

interface ContainerGroupMarkersProps {
  group: containerGroup;
}

// Small dot markers for each container position in a group
export const ContainerGroupMarkers = ({ group }: ContainerGroupMarkersProps) => {
  return (
    <>
      {group.positions.map((position, index) => (
        <Marker key={index} position={position} enableHoverEffect>
          <div className="flex flex-col items-center">
            <div className="w-[8px] h-[8px] rounded-sm border border-[#6b7280] bg-[#374151]" title={group.name} />
          </div>
        </Marker>
      ))}
    </>
  );
};
