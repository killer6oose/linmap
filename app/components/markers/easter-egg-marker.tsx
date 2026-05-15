import { Marker } from "../map/Marker";
import { easterEgg } from "~/lib/types";

interface EasterEggMarkerProps {
  egg: easterEgg;
}

export const EasterEggMarker = ({ egg }: EasterEggMarkerProps) => {
  return (
    <Marker position={egg.position} enableHoverEffect>
      <div className="flex flex-col items-center">
        <div className="w-[22px] h-[22px] rounded-full border-2 border-[#a855f7] bg-[#1e0a35] flex items-center justify-center">
          <span className="text-[10px]">🥚</span>
        </div>
        <span className="bg-black/80 text-[#d8b4fe] text-[7px] text-center tracking-widest px-1 py-[1px] whitespace-nowrap mt-0.5">
          {egg.name}
        </span>
      </div>
    </Marker>
  );
};
