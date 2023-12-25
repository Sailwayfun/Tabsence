import { getToastVariant } from "./toastConfig";
import { Space } from "../types/space";
import { toast } from "react-hot-toast";

type ErrorToastId = string;

function showErrorToast(message: string, style: "large" | "larger" = "large") {
  return toast.error(message, getToastVariant(style));
}

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
    return showErrorToast("Please enter a space title");
  }
  if (spaceLimitReached) {
    return showErrorToast("You can only create up to 5 spaces");
  }
  if (nameExists) {
    return showErrorToast("Space name already exists");
  }
  if (nameTooLong) {
    return showErrorToast(
      "Space name should be less than 10 characters",
      "larger",
    );
  }

  return null;
}

export { validateSpaceTitle };
