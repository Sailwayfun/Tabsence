import React from "react";
import { Link } from "react-router-dom";
interface HeaderLinkProps {
  to: string;
  icon: React.ReactNode;
  className: string;
  content: string;
}

const HeaderLink = ({ to, icon, className, content }: HeaderLinkProps) => {
  return (
    <Link to={to} className={className}>
      <button className="btn btn-ghost">
        <div className="flex items-center">
          {icon}
          <span className="text-lg">{content}</span>
        </div>
      </button>
    </Link>
  );
};

export default HeaderLink;
