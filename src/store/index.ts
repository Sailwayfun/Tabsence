import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCurrentDate } from "../utils/trackTime";

interface ArchivedSpaceStoreState {
  archivedSpaces: string[];
  addArchived: (id: string) => void;
  restoreArchived: (id: string) => void;
}
interface DateStoreState {
  date: string;
  increaseDate: () => void;
  decreaseDate: () => void;
  getPrevDate: () => string;
  getNextDate: () => string;
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

function setViewDate(date: string, days: number): string {
  const today = new Date(date);
  const newDate = new Date(today.setDate(today.getDate() + days));
  return `${newDate.getFullYear()}-${
    newDate.getMonth() + 1
  }-${newDate.getDate()}`;
}

const useDateStore = create<DateStoreState>
// ()
(
  // persist(
    (set, get) => ({
      date: getCurrentDate(),
      increaseDate: () =>
        set((state) => ({
          date: setViewDate(state.date, 1),
        })),
      decreaseDate: () =>
        set((state) => ({
          date: setViewDate(state.date, -1),
        })),
      getPrevDate: () => setViewDate(get().date, -1),
      getNextDate: () => setViewDate(get().date, 1),
    }),
  //   {
  //     name: "date-store",
  //     partialize: (state) => ({ date: state.date }),
  //   },
  // ),
);

export { useArchivedSpaceStore, useDateStore };
