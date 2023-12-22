import { cn } from "../../utils";

interface MainContainerProps {
  children: React.ReactNode;
  isWebTime: boolean;
}

const MainContainer = ({ children, isWebTime }: MainContainerProps) => {
  return (
    <div
      className={cn(
        "flex min-h-screen gap-5 overflow-x-hidden py-8 pl-[400px]",
        !isWebTime && "xl:ml-2",
        isWebTime && "px-24",
      )}
    >
      {children}
    </div>
  );
};

export default MainContainer;
