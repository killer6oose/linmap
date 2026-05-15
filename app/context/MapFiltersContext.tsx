import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface MapFilters {
  // General
  lzs: boolean;
  objectives: boolean;
  keys: boolean;
  operationBases: boolean;
  easterEggs: boolean;
  // Locations group
  locations: boolean;
  locationPois: boolean;
  locationCops: boolean;
  locationSubPois: boolean;
  // Doors & Intel
  lockedDoors: boolean;
  codedDoors: boolean;
  intel: boolean;
  // Loot
  containers: boolean;
  caches: boolean;
}

interface MapFiltersContextType {
  filters: MapFilters;
  setFilter: (key: keyof MapFilters, value: boolean) => void;
  setLocationGroup: (value: boolean) => void;
  setGroup: (keys: (keyof MapFilters)[], value: boolean) => void;
}

const defaultFilters: MapFilters = {
  lzs: true,
  objectives: true,
  keys: true,
  operationBases: false,
  easterEggs: false,
  locations: true,
  locationPois: true,
  locationCops: false,
  locationSubPois: false,
  lockedDoors: false,
  codedDoors: false,
  intel: false,
  containers: false,
  caches: false,
};

const STORAGE_KEY = 'lin_mapFilters';

const MapFiltersContext = createContext<MapFiltersContextType | undefined>(undefined);

export const MapFiltersProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<MapFilters>(defaultFilters);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setFilters({ ...defaultFilters, ...JSON.parse(stored) });
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const setFilter = (key: keyof MapFilters, value: boolean) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const setGroup = (keys: (keyof MapFilters)[], value: boolean) => {
    setFilters(prev => {
      const next = { ...prev };
      keys.forEach(k => { next[k] = value; });
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const setLocationGroup = (value: boolean) => {
    setGroup(['locations', 'locationPois', 'locationCops', 'locationSubPois'], value);
  };

  return (
    <MapFiltersContext.Provider value={{ filters, setFilter, setLocationGroup, setGroup }}>
      {children}
    </MapFiltersContext.Provider>
  );
};

export const useMapFilters = () => {
  const context = useContext(MapFiltersContext);
  if (!context) throw new Error('useMapFilters must be used within MapFiltersProvider');
  return context;
};
