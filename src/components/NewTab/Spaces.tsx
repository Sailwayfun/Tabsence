import { Link } from "react-router-dom";
interface SpacesProps {
  spaceNames: string[];
}
const Spaces = ({ spaceNames }: SpacesProps) => {
  return (
    <div className="flex w-40 bg-red-800">
      <ul className="my-44 flex w-full flex-col">
        {spaceNames.map((spaceName) => {
          return (
            <li className="border px-2 py-4 text-white">
              <Link to={`/${spaceName.toLowerCase()}`}>{spaceName}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Spaces;
