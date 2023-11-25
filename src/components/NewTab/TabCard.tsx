import { Tab, Space } from ".";
import MoveToSpace from "./MoveToSpace";
import CloseBtn from "./CloseBtn";
interface TabProps {
  tab: Tab;
  spaces: Space[];
  popupId: string | undefined;
  onOpenLink: (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    tab: Tab,
  ) => void;
  onOpenSpacesPopup: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  onSelectSpace: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCloseTab: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  selectedSpace: string;
}

const TabCard = ({
  tab,
  spaces,
  popupId,
  onOpenLink,
  onOpenSpacesPopup,
  onSelectSpace,
  onCloseTab,
  selectedSpace,
}: TabProps) => {
  return (
    <li className="flex items-center gap-3 rounded-lg border px-4 py-2 text-lg hover:bg-slate-300">
      <img src={tab.favIconUrl} className="h-4 w-4 border bg-white" />
      <a
        onClick={(e) => onOpenLink(e, tab)}
        className="cursor-pointer hover:text-gray-500 hover:underline"
      >
        {tab.title}
      </a>
      <MoveToSpace
        spaces={spaces}
        id={tab.id?.toString()}
        onOpenSpacesPopup={onOpenSpacesPopup}
      />
      <CloseBtn id={tab.tabId?.toString()} onCloseTab={onCloseTab} />
      {tab.id?.toString() === popupId && (
        <div className="ml-5 h-14 w-52 rounded-md border px-3">
          <label htmlFor={tab.id?.toString() || "spaces"} className="text-xl">
            Move to space:
          </label>
          <select
            id={tab.id?.toString() || "spaces"}
            onChange={onSelectSpace}
            value={selectedSpace}
          >
            <option value="">Select a space</option>
            {spaces.map(({ id, title }) => {
              return (
                <option value={id} key={id}>
                  {title}
                </option>
              );
            })}
          </select>
        </div>
      )}
    </li>
  );
};

export default TabCard;
