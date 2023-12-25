import { cn } from "./cn";

const toastVariants = {
  baseStyle: "text-lg rounded-md shadow",
  size: {
    small: "w-52",
    normal: "w-60",
    large: "w-72",
    larger: "w-[400px]",
  },
  duration: 2000,
};

function getToastVariant(size: "small" | "normal" | "large" | "larger") {
  return {
    className: cn(toastVariants.baseStyle, toastVariants.size[size]),
    duration: toastVariants.duration,
  };
}

export { getToastVariant };
