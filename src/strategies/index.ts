import { Direction } from "../types";

type DirectionStrategy = {
  [K in "isFirst" | "isLast" | "isMiddle"]: Direction[];
};

export const directionStrategies: {
  [K in "grid" | "list"]: DirectionStrategy;
} = {
  grid: {
    isFirst: ["right"],
    isLast: ["left"],
    isMiddle: ["left", "right"],
  },
  list: {
    isFirst: ["down"],
    isLast: ["up"],
    isMiddle: ["up", "down"],
  },
};
