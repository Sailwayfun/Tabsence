import { cn } from "../../utils";

interface TooltipProps {
  ["data-tip"]: string;
  children: React.ReactNode;
  className?: string;
}

const Tooltip = ({
  className,
  children,
  ["data-tip"]: dataTip,
}: TooltipProps) => {
  return (
    <div className={cn("tooltip", className)} data-tip={dataTip}>
      {children}
    </div>
  );
};

export default Tooltip;
