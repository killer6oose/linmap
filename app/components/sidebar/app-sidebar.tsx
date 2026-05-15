/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { AppSidebarTrigger } from "./app-sidebar-trigger";
import { Link } from "@remix-run/react";
import { Button } from "../ui/button";
import {
  Command,
  Settings,
  X,
  MapPin,
  Target,
  Key,
  Map,
  Handshake,
  Crosshair,
  FlaskConical,
  Hammer,
  EyeOff,
  Ghost,
  ChevronRight,
} from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { KBInput, Keybind } from "../common/Keybind";
import { useData } from "~/context/DataContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { useMap } from "~/context/MapContext";
import { key, KeySpawnMarker, lz, objective, task } from "~/lib/types";
import { usePopup } from "~/context/PopupContext";
import { ObjectivePopupContent } from "../popups/objective-popup";
import { KeyPopupContent } from "../popups/key-popup";
import { useLocalStorage } from "~/context/LocalStorageContext";
import { useMapFilters, MapFilters } from "~/context/MapFiltersContext";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { SetStateAction, useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { LZPopupContent } from "../popups/lz-popup";
import { KeyItem, LZItem, MultipleObjectiveTask, SingleObjectiveTask } from "./search-items";
import {
  getCompletableObjectives,
  getCompletableTasks,
  getCompletedObjectives,
  getCompletedTasks,
  getDiscoverableLZs,
  getDiscoveredLZs,
} from "~/util/task-utils";

type SidebarTab = 'home' | 'tasks' | 'keys';

const keybinds: KBInput[] = [
  { name: "Toggle sidebar", windows: "Ctrl + B", mac: "cmd + B", type: 'keyboard' },
  { name: "Complete objective", action: "right", type: 'mouse' },
];

const VENDOR_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  'Handshake': { icon: Handshake, color: 'text-blue-400' },
  'Gunny':     { icon: Crosshair, color: 'text-red-400' },
  'Lab Rat':   { icon: FlaskConical, color: 'text-green-400' },
  'Artisan':   { icon: Hammer, color: 'text-yellow-400' },
  'Turncoat':  { icon: EyeOff, color: 'text-purple-400' },
  'Banshee':   { icon: Ghost, color: 'text-cyan-400' },
};

const FILTER_ITEMS: { key: keyof MapFilters; label: string; icon: React.ElementType }[] = [
  { key: 'lzs',        label: 'Landing Zones',   icon: MapPin },
  { key: 'objectives', label: 'Task Objectives',  icon: Target },
  { key: 'keys',       label: 'Keys',             icon: Key },
  { key: 'locations',  label: 'Locations',        icon: Map },
];

function getKeySpawns(k: key, keySpawns: KeySpawnMarker[]): KeySpawnMarker[] {
  const keyNameLower = k.name.toLowerCase();
  return keySpawns.filter(spawn =>
    spawn.name.toLowerCase().startsWith(keyNameLower)
  );
}

export function AppSidebar() {
  const { map } = useMap();
  const { isMobile, toggleSidebar } = useSidebar();
  const { data, actions } = useLocalStorage();
  const { showPopup } = usePopup();
  const { tasks, locations, keys, lzs, keySpawns, loaded } = useData();
  const { filters, setFilter } = useMapFilters();

  const [activeTab, setActiveTab] = useState<SidebarTab>('home');
  const [searchCategory, setSearchCategory] = useState("tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<lz[] | task[] | key[]>([]);
  const [expandedTask, setExpandedTask] = useState<task | null>(null);

  const handleObjectiveClick = (task: task, objective: objective) => {
    if (!map) return;
    const mapView = map.getView();
    if (!mapView) return;
    mapView.animate({ center: objective.position, zoom: 6, duration: 1000 });
    showPopup(objective.position, <ObjectivePopupContent task={task} objective={objective} />, [0, -20]);
    toggleSidebar();
    setIsSuggestionsOpen(false);
  };

  const handleKeyClick = (k: key) => {
    if (!map) return;
    const mapView = map.getView();
    if (!mapView) return;
    const pos = Array.isArray(k.position[0])
      ? (k.position as [number, number][])[0]
      : k.position as [number, number];
    mapView.animate({ center: pos, zoom: 6, duration: 1000 });
    showPopup(pos, <KeyPopupContent cKey={k} />, [0, -20]);
    toggleSidebar();
    setIsSuggestionsOpen(false);
    setExpandedTask(null);
  };

  const handleKeySpawnClick = (spawn: KeySpawnMarker) => {
    if (!map) return;
    const mapView = map.getView();
    if (!mapView) return;
    mapView.animate({ center: spawn.position, zoom: 7, duration: 1000 });
    toggleSidebar();
  };

  const handleLZClick = (lz: lz) => {
    if (!map) return;
    const mapView = map.getView();
    if (!mapView) return;
    mapView.animate({ center: lz.position, zoom: 6, duration: 1000 });
    showPopup(lz.position, <LZPopupContent lz={lz} />, [0, -27]);
    toggleSidebar();
    setIsSuggestionsOpen(false);
    setExpandedTask(null);
  };

  function filterByFaction<T extends { faction?: { id: string } }>(items: T[], userFaction: string): T[] {
    return items.filter(item => !item.faction || item.faction.id === userFaction);
  }

  useEffect(() => {
    let filteredSuggestions: lz[] | task[] | key[] = [];
    const query = searchQuery.toLowerCase();
    if (searchCategory === "tasks") {
      filteredSuggestions = tasks.filter(t =>
        t.name.toLowerCase().includes(query) &&
        (t.faction === undefined || t.faction.id === data.user.faction)
      );
    } else if (searchCategory === "keys") {
      filteredSuggestions = keys.filter(k => k.name.toLowerCase().includes(query));
    } else if (searchCategory === "lzs") {
      filteredSuggestions = lzs.filter(l => l.name.toLowerCase().includes(query));
    }
    setSuggestions(filteredSuggestions);
  }, [searchQuery, searchCategory, tasks, keys, lzs, data.user.faction]);

  const completedTasks = () => getCompletedTasks(tasks, data.user.completedObjectives, data.user.faction);
  const totalTasks = () => getCompletableTasks(tasks, data.user.completedObjectives, data.user.faction);
  const completedObjectives = () => getCompletedObjectives(tasks, data.user.completedObjectives, data.user.faction);
  const totalObjectives = () => getCompletableObjectives(tasks, data.user.completedObjectives, data.user.faction);
  const discoveredLZs = () => getDiscoveredLZs(lzs, data.user.discoveredLZs, data.user.faction);
  const totalLZs = () => getDiscoverableLZs(lzs, data.user.faction);

  const tasksByVendor = tasks.reduce<Record<string, task[]>>((acc, t) => {
    const vn = t.vendor.name;
    if (!acc[vn]) acc[vn] = [];
    acc[vn].push(t);
    return acc;
  }, {});

  const vendorOrder = ['Handshake', 'Gunny', 'Lab Rat', 'Artisan', 'Turncoat', 'Banshee'];

  const tabs: SidebarTab[] = ['home', 'tasks', 'keys'];

  return (
    <Sidebar className="grid-bg p-2">
      <SidebarHeader className="bg-transparent">
        <SidebarMenu>
          <div className="flex justify-between items-center">
            <Link to="/">
              <h1 className="text-2xl font-semibold">GZW Map</h1>
            </Link>
            <div className="flex space-x-2">
              <Link
                to="/settings"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                prefetch="render"
              >
                <Button variant="ghost" size="icon">
                  <Settings />
                </Button>
              </Link>
            </div>
          </div>
        </SidebarMenu>

        {/* Tab navigation */}
        <div className="flex border-b border-border mt-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary -mb-px'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-transparent py-2">

        {/* HOME TAB */}
        {activeTab === 'home' && loaded && (
          <div className="flex flex-col gap-3 px-1">

            {/* Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search..."
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSuggestionsOpen(true)}
                onBlur={() => setIsSuggestionsOpen(false)}
                className="h-10 pr-24"
              />
              <div className="absolute inset-y-0 right-24 h-10 flex items-center">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setExpandedTask(null);
                    setIsSuggestionsOpen(false);
                  }}
                >
                  <div className="hover:bg-primary/10 p-1">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              </div>
              <div className="absolute inset-y-0 right-0 w-24 h-10">
                <Select
                  value={searchCategory}
                  onValueChange={(value: SetStateAction<string>) => {
                    setSearchCategory(value);
                    setExpandedTask(null);
                  }}
                >
                  <SelectTrigger className="h-full border-none focus:ring-0">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tasks">Tasks</SelectItem>
                    <SelectItem value="keys">Keys</SelectItem>
                    <SelectItem value="lzs">LZs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div
                className={`transition-all duration-300 ease-in-out bg-black/20 overflow-x-hidden ${
                  isSuggestionsOpen ? "max-h-64 ring-1 ring-ring" : "max-h-0 ring-0"
                }`}
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="shadow">
                  {suggestions.length > 0 ? (
                    <ul>
                      <li className="p-2 font-bold">Results</li>
                      {suggestions.map((item, index) => {
                        if (searchCategory === "tasks" && "objectives" in item) {
                          const factionObjectives = filterByFaction(item.objectives, data.user.faction);
                          if (factionObjectives.length === 1) {
                            return (
                              <SingleObjectiveTask
                                key={index}
                                task={item}
                                objective={factionObjectives[0]}
                                onClick={() => handleObjectiveClick(item, factionObjectives[0])}
                              />
                            );
                          }
                          return (
                            <MultipleObjectiveTask
                              key={index}
                              task={item}
                              objectives={factionObjectives}
                              expandedTask={expandedTask}
                              onExpand={() => setExpandedTask(expandedTask?.name === item.name ? null : item)}
                              onClick={(obj) => handleObjectiveClick(item, obj)}
                            />
                          );
                        } else if (searchCategory === "keys" && "size" in item) {
                          return (
                            <KeyItem
                              key={index}
                              keyItem={item}
                              faction={data.user.faction}
                              onClick={() => handleKeyClick(item)}
                            />
                          );
                        } else if (searchCategory === "lzs" && "discoverable" in item) {
                          return (
                            <LZItem
                              key={index}
                              lz={item}
                              faction={data.user.faction}
                              onClick={() => handleLZClick(item)}
                            />
                          );
                        }
                        return null;
                      })}
                    </ul>
                  ) : (
                    <p className="p-2 text-sm text-muted-foreground">No results found</p>
                  )}
                </div>
              </div>
            </div>

            {/* GENERAL filters */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">General</p>
              <div className="flex flex-col gap-1">
                {FILTER_ITEMS.map(({ key: fkey, label, icon: Icon }) => (
                  <label
                    key={fkey}
                    className="flex items-center gap-2.5 px-1 py-1 rounded hover:bg-white/5 cursor-pointer select-none"
                  >
                    <Checkbox
                      checked={filters[fkey]}
                      onCheckedChange={(checked) => setFilter(fkey, !!checked)}
                      className="pointer-events-none"
                    />
                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && loaded && (
          <SidebarMenu>
            {vendorOrder.map(vendorName => {
              const vendorTasks = (tasksByVendor[vendorName] || []).filter(
                t => !t.faction || t.faction.id === data.user.faction
              );
              if (vendorTasks.length === 0) return null;

              const cfg = VENDOR_CONFIG[vendorName];
              const VendorIcon = cfg?.icon;

              return (
                <Collapsible key={vendorName}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="group">
                        <div className="flex items-center gap-2 w-full">
                          {VendorIcon && <VendorIcon className={`w-4 h-4 shrink-0 ${cfg?.color ?? ''}`} />}
                          <span className="text-sm font-semibold">{vendorName}</span>
                          <ChevronRight className="ml-auto w-3.5 h-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <SidebarMenuBadge>{vendorTasks.length}</SidebarMenuBadge>
                    <CollapsibleContent>
                      {vendorTasks.map((t, idx) => {
                        const factionObjectives = filterByFaction(t.objectives, data.user.faction);
                        if (factionObjectives.length === 0) return null;

                        if (factionObjectives.length === 1) {
                          return (
                            <SidebarMenuSub key={idx}>
                              <SidebarMenuSubItem>
                                <SidebarMenuButton
                                  onClick={() => handleObjectiveClick(t, factionObjectives[0])}
                                  className="text-xs"
                                >
                                  {t.name}
                                </SidebarMenuButton>
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          );
                        }

                        return (
                          <SidebarMenu key={idx}>
                            <Collapsible className="group/inner">
                              <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuButton className="text-xs group/inner">
                                    <span>{t.name}</span>
                                    <ChevronRight className="ml-auto w-3 h-3 text-muted-foreground transition-transform group-data-[state=open]/inner:rotate-90" />
                                  </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <SidebarMenuBadge>{factionObjectives.length}</SidebarMenuBadge>
                                <CollapsibleContent>
                                  {factionObjectives.map((obj, oIdx) => (
                                    <SidebarMenuSub key={oIdx}>
                                      <SidebarMenuSubItem>
                                        <SidebarMenuButton
                                          onClick={() => handleObjectiveClick(t, obj)}
                                          className="text-xs"
                                        >
                                          {obj.name}
                                        </SidebarMenuButton>
                                      </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                  ))}
                                </CollapsibleContent>
                              </SidebarMenuItem>
                            </Collapsible>
                          </SidebarMenu>
                        );
                      })}
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        )}

        {/* KEYS TAB */}
        {activeTab === 'keys' && loaded && (
          <SidebarMenu>
            {locations.map((location, idx) => {
              const locationKeys = keys.filter(k => k.location.id === location.id);
              if (locationKeys.length === 0) return null;

              return (
                <Collapsible key={idx}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="group">
                        <div className="flex items-center gap-2 w-full">
                          <span className="text-sm font-semibold">{location.name}</span>
                          <ChevronRight className="ml-auto w-3.5 h-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <SidebarMenuBadge>{locationKeys.length}</SidebarMenuBadge>
                    <CollapsibleContent>
                      {locationKeys.map((k, kIdx) => {
                        const spawns = getKeySpawns(k, keySpawns);
                        return (
                          <SidebarMenuSub key={kIdx}>
                            <SidebarMenuSubItem>
                              <div className="flex items-center w-full pr-2 gap-1.5 min-h-[28px]">
                                <button
                                  onClick={() => handleKeyClick(k)}
                                  className="flex-1 text-left text-xs py-1 px-2 hover:bg-white/5 rounded transition-colors truncate"
                                >
                                  {k.name}
                                </button>
                                {spawns.length > 0 && (
                                  <button
                                    onClick={() => handleKeySpawnClick(spawns[0])}
                                    title={`${spawns.length} static spawn${spawns.length > 1 ? 's' : ''} - click to navigate`}
                                    className="shrink-0 flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold bg-emerald-600/80 hover:bg-emerald-500 text-white transition-colors"
                                  >
                                    S
                                  </button>
                                )}
                                <Checkbox
                                  className="pointer-events-auto shrink-0"
                                  checked={data.user.collectedKeys.includes(k.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      actions.user.addCollectedKey(k.id);
                                    } else {
                                      actions.user.removeCollectedKey(k.id);
                                    }
                                  }}
                                />
                              </div>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        );
                      })}
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        )}

      </SidebarContent>

      <SidebarFooter className="pb-1">
        <div className="flex flex-row justify-center items-center space-x-2">
          <div className="w-full h-[1px] bg-border" />
          {!isMobile && (
            <div className="flex flex-row justify-around items-center space-x-3 text-[10px] text-border">
              <HoverCard>
                <HoverCardTrigger>
                  <Command className="w-3 h-3 duration-300 transition-colors hover:text-muted-foreground" />
                </HoverCardTrigger>
                <HoverCardContent side="right">
                  <div className="flex flex-col">
                    <h2 className="text-base font-semibold mb-2">Keybinds</h2>
                    <ul className="space-y-1.5 w-full">
                      {keybinds.map((input, index) => (
                        <li key={index} className="flex justify-between items-end text-muted-foreground/90">
                          <span className="text-xs">{input.name}</span>
                          <span className="flex-1 mx-1.5 mb-[2px] border-b border-dashed border-muted-foreground/30"></span>
                          <Keybind input={input} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-1 text-muted-foreground/90 px-1.5">
          {[
            {
              label: "Objectives Completed",
              value: `${completedObjectives().toString().padStart(3, '0')} / ${totalObjectives().toString().padStart(3, '0')}`,
            },
            {
              label: "Tasks Completed",
              value: `${completedTasks().toString().padStart(3, '0')} / ${totalTasks().toString().padStart(3, '0')}`,
            },
            {
              label: "LZs Discovered",
              value: `${discoveredLZs().toString().padStart(3, '0')} / ${totalLZs().toString().padStart(3, '0')}`,
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-end justify-between">
              <span className="text-xs font-mono">{label}</span>
              <span className="flex-1 mx-1.5 mb-[2px] border-b border-dashed border-muted-foreground/30"></span>
              <span className="text-xs font-mono">{value}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-row items-center space-x-2">
          <div className="w-full h-[1px] bg-border" />
          <div className="flex w-full flex-row justify-around items-center space-x-2 text-[10px] text-border">
            <Link
              to="https://github.com/killer6oose/linmap"
              className="duration-300 transition-colors hover:text-muted-foreground"
            >
              Github
            </Link>
            <Link
              to="/about"
              className="duration-300 transition-colors hover:text-muted-foreground"
            >
              Updates
            </Link>
          </div>
          <div className="w-full h-[1px] bg-border" />
        </div>
      </SidebarFooter>

      {!isMobile && (
        <div className="absolute right-0 top-0">
          <AppSidebarTrigger />
        </div>
      )}
    </Sidebar>
  );
}
