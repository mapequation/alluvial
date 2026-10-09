import { useCallback } from "react";
import { toaster } from "../components/ui/toaster";

export type ToastOptions = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  type?: "success" | "error" | "warning" | "info" | "loading";
  duration?: number;
  closable?: boolean;
};

export type OnError = (props: ToastOptions) => void;

export function useError(warn = false): OnError {
  return useCallback(
    ({ title, description, ...props }) => {
      if (warn && typeof description === "string") console.warn(description);
      toaster.create({
        title,
        description,
        type: "error",
        duration: 5000,
        closable: true,
        ...props,
      });
    },
    [warn]
  );
}
