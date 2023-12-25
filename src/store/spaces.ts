import { create } from "zustand";
import { Space } from "../types";
import { toast } from "react-hot-toast";
import { validateSpaceTitle, getToastVariant } from "../utils";

interface SpacesState {
  spaces: Space[];
  setSpaces: (spacesFromFirestore: Space[]) => void;
  removeSpace: (spaceId: string) => void;
  startEditingSpaceTitle: (spaceId: string) => void;
  inputSpaceTitle: (newTitle: string, editingSpaceId: string) => void;
  changeSpaceTitle: (newTitle: string, editingSpaceId: string) => void;
}

const useSpaceStore = create<SpacesState>((set) => ({
  spaces: [],
  setSpaces: (spaces) => set({ spaces }),
  removeSpace: (spaceId) =>
    set((state) => ({
      spaces: state.spaces.filter((space) => space.id !== spaceId),
    })),
  startEditingSpaceTitle: (spaceId) =>
    set((state) => ({
      spaces: state.spaces.map((space) => ({
        ...space,
        isEditing: space.id === spaceId,
      })),
    })),
  inputSpaceTitle: (newTitle, editingSpaceId) =>
    set((state) => ({
      spaces: state.spaces.map((space) => {
        if (space.id !== editingSpaceId) return space;
        if (newTitle.length === 11) {
          toast.error(
            "Space name should be less than 10 characters",
            getToastVariant("larger"),
          );
          return space;
        }
        return {
          ...space,
          title: newTitle,
        };
      }),
    })),
  changeSpaceTitle: (newTitle, editingSpaceId) =>
    set((state) => {
      if (!newTitle) return state;
      const errorToastId = validateSpaceTitle(
        state.spaces,
        editingSpaceId,
        newTitle,
      );
      if (errorToastId) return state;
      return {
        spaces: state.spaces.map((space) => ({
          ...space,
          isEditing: false,
          title: newTitle,
        })),
      };
    }),
}));

export { useSpaceStore };
