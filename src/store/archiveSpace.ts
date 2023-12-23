import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ArchivedSpaceStoreState {
  archivedSpaces: string[];
  addArchived: (id: string) => void;
  restoreArchived: (id: string) => void;
}

const useArchivedSpaceStore = create<ArchivedSpaceStoreState>()(
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

export { useArchivedSpaceStore };
