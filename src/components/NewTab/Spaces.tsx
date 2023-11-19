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
              <a>{spaceName}</a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Spaces;
