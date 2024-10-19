import { cn } from "@/utils/cn";

interface TooltipProps {
  "data-tip": string;
  children: React.ReactNode;
  className?: string;
  orderClass?: string;
}

const Tooltip = ({
  className,
  orderClass,
  children,
  "data-tip": dataTip,
}: TooltipProps) => {
  return (
    <div className={cn("tooltip", className, orderClass)} data-tip={dataTip}>
      {children}
    </div>
  );
};

export default Tooltip;
