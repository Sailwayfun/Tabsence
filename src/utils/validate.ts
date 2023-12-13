import { Space } from "../components/NewTab";
import { toast } from "react-hot-toast";

type ErrorToastId = string;

function validateSpaceTitle(
  spaces: Space[],
  action: "create" | "edit",
  title?: string,
): ErrorToastId | null {
  const nameExists: boolean =
    title !== undefined &&
    spaces.some(
      (s) => s.title.trim().toLowerCase() === title.trim().toLowerCase(),
    );
  const nameEmpty: boolean = title === undefined || title.trim().length === 0;
  const nameTooLong: boolean = title !== undefined && title.trim().length > 10;
  const spaceLimitReached: boolean = spaces.length >= 5;
  if (nameEmpty) {
    return toast.error("Please enter a space title", {
      className: "w-60 text-lg rounded-md shadow",
    });
  }
  if (spaceLimitReached) {
    return toast.error("You can only create up to 5 spaces", {
      className: "w-72 text-lg rounded-md shadow",
    });
  }
  if (nameExists && action === "create") {
    return toast.error("Space name already exists", {
      className: "w-60 text-lg rounded-md shadow",
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
