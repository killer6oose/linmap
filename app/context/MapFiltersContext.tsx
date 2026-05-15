import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface MapFilters {
  lzs: boolean;
  objectives: boolean;
  keys: boolean;
  locations: boolean;
}

interface MapFiltersContextType {
  filters: MapFilters;
  setFilter: (key: keyof MapFilters, value: boolean) => void;
}

const defaultFilters: MapFilters = {
  lzs: true,
  objectives: true,
  keys: true,
  locations: true,
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

  return (
    <MapFiltersContext.Provider value={{ filters, setFilter }}>
      {children}
    </MapFiltersContext.Provider>
  );
};

export const useMapFilters = () => {
  const context = useContext(MapFiltersContext);
  if (!context) throw new Error('useMapFilters must be used within MapFiltersProvider');
  return context;
};
