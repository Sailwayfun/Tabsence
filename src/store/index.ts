import { create } from "zustand";

interface SpaceStoreState {
  archivedSpaces: string[];
  addArchived: (id: string) => void;
  restoreArchived: (id: string) => void;
}

const useSpaceStore = create<SpaceStoreState>((set) => ({
  archivedSpaces: [],
  addArchived: (id) =>
    set((state) => ({
      archivedSpaces: [...state.archivedSpaces, id],
    })),
  restoreArchived: (id) =>
    set((state) => ({
      archivedSpaces: state.archivedSpaces.filter((spaceId) => spaceId !== id),
    })),
}));

export { useSpaceStore };
