interface DropdownProps {
  children: React.ReactNode;
  button: React.ReactNode;
}

const Dropdown = ({ children, button }: DropdownProps) => {
  return (
    <div className="dropdown dropdown-top">
      <div tabIndex={0} role="button">
        {button}
      </div>
      <ul
        tabIndex={0}
        className="menu dropdown-content -bottom-4 z-[1] w-52 rounded-box border-none bg-base-100 shadow xl:right-0 xl:top-0"
      >
        {children}
      </ul>
    </div>
  );
};

export default Dropdown;
