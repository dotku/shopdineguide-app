import { create } from 'zustand';
import type { Business, BusinessSection, ContentFilter } from '../types/business';

interface AppState {
  // Filters
  activeFilter: ContentFilter;
  activeCity: string | null;
  activeNeighborhood: string | null;
  activeCategory: string | null;

  // Sync
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncError: string | null;
  isDbReady: boolean;

  // Search
  searchQuery: string;
  searchResults: Business[];
  isSearching: boolean;

  // Actions
  setActiveFilter: (filter: ContentFilter) => void;
  setActiveCity: (city: string | null) => void;
  setActiveNeighborhood: (neighborhood: string | null) => void;
  setActiveCategory: (category: string | null) => void;
  setSyncing: (isSyncing: boolean) => void;
  setLastSyncTime: (time: string) => void;
  setSyncError: (error: string | null) => void;
  setDbReady: (ready: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Business[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  resetFilters: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeFilter: 'all',
  activeCity: null,
  activeNeighborhood: null,
  activeCategory: null,
  isSyncing: false,
  lastSyncTime: null,
  syncError: null,
  isDbReady: false,
  searchQuery: '',
  searchResults: [],
  isSearching: false,

  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setActiveCity: (city) => set({ activeCity: city, activeNeighborhood: null }),
  setActiveNeighborhood: (neighborhood) => set({ activeNeighborhood: neighborhood }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
  setSyncError: (error) => set({ syncError: error }),
  setDbReady: (ready) => set({ isDbReady: ready }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsSearching: (isSearching) => set({ isSearching }),
  resetFilters: () =>
    set({
      activeFilter: 'all',
      activeCity: null,
      activeNeighborhood: null,
      activeCategory: null,
    }),
}));
