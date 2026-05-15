import { SidebarProvider } from "~/components/ui/sidebar";
import { Outlet, useLoaderData, } from "@remix-run/react";
import { MapProvider } from "~/context/MapContext";
import { useState } from "react";
import { PopupProvider } from "~/context/PopupContext";
import { DataProvider } from "~/context/DataContext";
import { MapFiltersProvider } from "~/context/MapFiltersContext";
import { faction, item, key, KeySpawnMarker, location, lz, objective, task } from "~/lib/types";
import { fetchData } from "~/lib/utils";

export async function loader() {
  const [
    tasksData,
    objectivesData,
    lzsData,
    locationsData,
    factionsData,
    itemsData,
    keysData,
    keySpawnsData,
  ] = await Promise.all([
    fetchData<task>('tasks'),
    fetchData<objective>('objectives'),
    fetchData<lz>('lzs'),
    fetchData<location>('locations'),
    fetchData<faction>('factions'),
    fetchData<item>('items'),
    fetchData<key>('keys'),
    fetchData<KeySpawnMarker>('key-spawns'),
  ]);
  return { loaderData: {
    tasks: tasksData,
    objectives: objectivesData,
    lzs: lzsData,
    locations: locationsData,
    factions: factionsData,
    items: itemsData,
    keys: keysData,
    keySpawns: keySpawnsData,
  }};
}

export default function AppLayout() {
  const { loaderData } = useLoaderData<typeof loader>();
  const [open, setOpen] = useState(false)

  return (
    <DataProvider data={loaderData} loaded>
    <MapFiltersProvider>
    <MapProvider>
    <PopupProvider>
    <SidebarProvider open={open} onOpenChange={setOpen} className="bg-transparent">
      <div className="relative w-screen">
        <div className="relative flex flex-1 w-full h-full">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
    </PopupProvider>
    </MapProvider>
    </MapFiltersProvider>
    </DataProvider>
  )
}
