import { IconProps } from "../../types";
import { cn } from "@/utils/cn";

interface ToggleOrderIconProps extends IconProps {
  className: string;
  direction: "ascend" | "descend";
}

const ToggleOrder = ({ className, direction }: ToggleOrderIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn(className, direction === "ascend" ? "" : "rotate-180")}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25"
      />
    </svg>
  );
};

export default ToggleOrder;
