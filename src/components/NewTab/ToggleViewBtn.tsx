interface ToggleViewBtnProps {
  onToggleView: () => void;
  className: string;
}

const ToggleViewBtn = ({ onToggleView, className }: ToggleViewBtnProps) => {
  return (
    <button onClick={onToggleView} className={className}>
      List / Grid View
    </button>
  );
};

export default ToggleViewBtn;
