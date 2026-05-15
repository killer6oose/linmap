import { type MetaFunction } from "@remix-run/cloudflare";
import { LocationMarker } from "~/components/markers/location-marker";
import { LZMarker } from "~/components/markers/lz-marker";
import { ObjectiveMarker } from "~/components/markers/objective-marker";
import Map from "~/components/map/Map";
import { Popup } from "~/components/map/Popup";
import { AppSidebarTrigger } from "~/components/sidebar/app-sidebar-trigger";
import { useSidebar } from "~/components/ui/sidebar";
import { useData } from "~/context/DataContext";
import { useMapFilters } from "~/context/MapFiltersContext";
import { AppSidebar } from "~/components/sidebar/app-sidebar";
import { KeyMarker } from "~/components/markers/key-marker";
import { GridOverlay } from "~/components/map/Grid";
import { CopMarker } from "~/components/markers/cop-marker";
import { SubPoiMarker } from "~/components/markers/sub-poi-marker";
import { EasterEggMarker } from "~/components/markers/easter-egg-marker";
import { OperationBaseMarker } from "~/components/markers/operation-base-marker";
import { DoorMarker } from "~/components/markers/door-marker";
import { IntelMarker } from "~/components/markers/intel-marker";
import { CacheMarker } from "~/components/markers/cache-marker";
import { ContainerGroupMarkers } from "~/components/markers/container-marker";

export const meta: MetaFunction = () => {
  return [
    { title: "Gray Zone Warfare Map" },
    { name: "description", content: "An interactive map tool to find objectives, landing zones, locked doors, and more. Track your progress and see what you've completed in the game." },
  ];
};

export default function Index() {
  const { isMobile } = useSidebar();
  const { tasks, keys, lzs, locations, cops, subPois, easterEggs, operationBases, containers, caches, doors, intel } = useData();
  const { filters } = useMapFilters();

  return (
    <div className="relative flex w-full items-center justify-center">
      <div className="absolute top-0 left-0 z-50">
        <AppSidebar />
      </div>
      <Map />
      <GridOverlay />
      <Popup />

      {/* General */}
      {filters.objectives && tasks.map((task) => task.objectives.map((objective, index) => (
        <ObjectiveMarker key={index} task={task} objective={objective} />
      )))}
      {filters.keys && keys.map((key, index) => (
        <KeyMarker key={index} cKey={key} />
      ))}
      {filters.lzs && lzs.map((lz, index) => (
        <LZMarker key={index} lz={lz} />
      ))}
      {filters.operationBases && operationBases.map((base, index) => (
        <OperationBaseMarker key={index} base={base} />
      ))}
      {filters.easterEggs && easterEggs.map((egg, index) => (
        <EasterEggMarker key={index} egg={egg} />
      ))}

      {/* Locations */}
      {filters.locationPois && locations.map((location, index) => (
        <LocationMarker key={index} location={location} />
      ))}
      {filters.locationCops && cops.map((cop, index) => (
        <CopMarker key={index} cop={cop} />
      ))}
      {filters.locationSubPois && subPois.map((sp, index) => (
        <SubPoiMarker key={index} subPoi={sp} />
      ))}

      {/* Doors & Intel */}
      {filters.lockedDoors && doors.filter(d => d.type === 'key').map((door, index) => (
        <DoorMarker key={index} door={door} />
      ))}
      {filters.codedDoors && doors.filter(d => d.type === 'code').map((door, index) => (
        <DoorMarker key={index} door={door} />
      ))}
      {filters.intel && intel.map((item, index) => (
        <IntelMarker key={index} intel={item} />
      ))}

      {/* Loot */}
      {filters.caches && caches.map((cache, index) => (
        <CacheMarker key={index} cache={cache} />
      ))}
      {filters.containers && containers.map((group, index) => (
        <ContainerGroupMarkers key={index} group={group} />
      ))}

      {isMobile && (
        <div className="absolute top-0 left-0">
          <AppSidebarTrigger />
        </div>
      )}
    </div>
  );
}
