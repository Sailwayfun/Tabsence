import { create } from "zustand";

interface SpaceStoreState {
  archivedSpaces: string[];
  setArchivedSpaces: (id: string) => void;
}

const useSpaceStore = create<SpaceStoreState>((set) => ({
  archivedSpaces: [],
  setArchivedSpaces: (id) =>
    set((state) => ({
      archivedSpaces: [...state.archivedSpaces, id],
    })),
}));

export { useSpaceStore };
