import { Link } from "react-router-dom";
import { Space } from ".";
import AddSpaceBtn from "./AddSpaceBtn";
interface SpacesProps {
  spaces: Space[];
}
const Spaces = ({ spaces }: SpacesProps) => {
  return (
    <div className="flex min-h-screen w-40 flex-col bg-red-800">
      <AddSpaceBtn />
      <ul className="flex w-full flex-col">
        {spaces.map(({ id, title }) => {
          return (
            <li className="border px-2 py-4 text-white">
              <Link to={`/${id}`}>{title.toLowerCase()}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Spaces;
