import type { Direction } from "../../types";
import { cn } from "@/utils/cn";
import { forwardRef } from "react";

interface IconButtonOptions {
  tabId: number;
  direction: Direction;
}

type Ref = HTMLButtonElement;

interface IconButtonProps {
  onClick: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    options?: IconButtonOptions,
  ) => Promise<void> | void;
  options?: IconButtonOptions;
  customClasses?: string;
  icon: React.ReactNode;
}

const IconButton = forwardRef<Ref, IconButtonProps>(
  ({ onClick, options, customClasses, icon }, ref) => {
    const baseClasses = "h-6 w-6";
    return (
      <button
        onClick={(e) => onClick(e, options)}
        className={cn(baseClasses, customClasses)}
        ref={ref}
      >
        {icon}
      </button>
    );
  },
);

export default IconButton;
