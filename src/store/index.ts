import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCurrentDate } from "../utils/trackTime";

interface SpaceStoreState {
  archivedSpaces: string[];
  addArchived: (id: string) => void;
  restoreArchived: (id: string) => void;
}
interface DateStoreState {
  date: string;
  increaseDate: () => void;
  decreaseDate: () => void;
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

function setViewDate(date: string, days: number): string {
  const today = new Date(date);
  const newDate = new Date(today.setDate(today.getDate() + days));
  return `${newDate.getFullYear()}-${
    newDate.getMonth() + 1
  }-${newDate.getDate()}`;
}

const useDateStore = create<DateStoreState>((set) => ({
  date: getCurrentDate(),
  increaseDate: () =>
    set((state) => ({
      date: setViewDate(state.date, 1),
    })),
  decreaseDate: () =>
    set((state) => ({
      date: setViewDate(state.date, -1),
    })),
}));

export { useSpaceStore, useDateStore };
