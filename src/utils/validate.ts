import { Space } from "../types/space";
import { toast } from "react-hot-toast";

type ErrorToastId = string;

function validateSpaceTitle(
  spaces: Space[],
  id?: string,
  title?: string,
): ErrorToastId | null {
  const nameExists: boolean =
    title !== undefined &&
    spaces.some((space) => space.id !== id && space.title === title.trim());
  const nameEmpty: boolean = title === undefined || title.trim().length === 0;
  const nameTooLong: boolean = title !== undefined && title.trim().length > 10;
  const spaceLimitReached: boolean =
    spaces.length >= 5 && spaces.every((space) => space.id !== id);
  if (nameEmpty) {
    return toast.error("Please enter a space title", {
      className: "w-72 text-lg rounded-md shadow",
    });
  }
  if (spaceLimitReached) {
    return toast.error("You can only create up to 5 spaces", {
      className: "w-72 text-lg rounded-md shadow",
    });
  }
  if (nameExists) {
    return toast.error("Space name already exists", {
      className: "w-72 text-lg rounded-md shadow",
    });
  }
  if (nameTooLong) {
    return toast.error("Space name should be less than 10 characters", {
      className: "w-[400px] text-lg rounded-md shadow",
    });
  }

  return null;
}

export { validateSpaceTitle };
