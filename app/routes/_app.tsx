import { SidebarProvider } from "~/components/ui/sidebar";
import { Outlet, useLoaderData, } from "@remix-run/react";
import { MapProvider } from "~/context/MapContext";
import { useState } from "react";
import { PopupProvider } from "~/context/PopupContext";
import { DataProvider } from "~/context/DataContext";
import { MapFiltersProvider } from "~/context/MapFiltersContext";
import {
  cacheMarker, containerGroup, cop, doorMarker, easterEgg,
  faction, intelMarker, item, key, KeySpawnMarker, location,
  lz, objective, operationBase, subPoi, task
} from "~/lib/types";
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
    copsData,
    subPoisData,
    easterEggsData,
    operationBasesData,
    containersData,
    cachesData,
    doorsData,
    intelData,
  ] = await Promise.all([
    fetchData<task>('tasks'),
    fetchData<objective>('objectives'),
    fetchData<lz>('lzs'),
    fetchData<location>('locations'),
    fetchData<faction>('factions'),
    fetchData<item>('items'),
    fetchData<key>('keys'),
    fetchData<KeySpawnMarker>('key-spawns'),
    fetchData<cop>('cops'),
    fetchData<subPoi>('sub-pois'),
    fetchData<easterEgg>('easter-eggs'),
    fetchData<operationBase>('operation-bases'),
    fetchData<containerGroup>('containers'),
    fetchData<cacheMarker>('caches'),
    fetchData<doorMarker>('doors'),
    fetchData<intelMarker>('intel'),
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
    cops: copsData,
    subPois: subPoisData,
    easterEggs: easterEggsData,
    operationBases: operationBasesData,
    containers: containersData,
    caches: cachesData,
    doors: doorsData,
    intel: intelData,
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
