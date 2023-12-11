import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SpaceStoreState {
  archivedSpaces: string[];
  addArchived: (id: string) => void;
  restoreArchived: (id: string) => void;
}

const useSpaceStore = create<SpaceStoreState>()(
  persist(
    (set) => ({
      archivedSpaces: [],
      addArchived: (id) =>
        set((state) => ({
          archivedSpaces: [...state.archivedSpaces, id],
        })),
      restoreArchived: (id) =>
        set((state) => ({
          archivedSpaces: state.archivedSpaces.filter(
            (spaceId) => spaceId !== id,
          ),
        })),
    }),
    {
      name: "space-store",
      partialize: (state) => ({ archivedSpaces: state.archivedSpaces }),
    },
  ),
);

export { useSpaceStore };
