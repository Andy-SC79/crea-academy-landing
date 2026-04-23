import { useTheme } from "next-themes";
import { createPortal } from "react-dom";
import { Toaster as Sonner, toast } from "sonner";

import { cn } from "@/lib/utils";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const TOAST_LAYER_Z_INDEX = 2147483647;
const DEFAULT_TOAST_CLASSNAMES = {
  toast:
    "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
  description: "group-[.toast]:text-muted-foreground",
  actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
  cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
};

const Toaster = ({ className, style, toastOptions, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  const toaster = (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      expand
      visibleToasts={8}
      className={cn("toaster group", className)}
      style={{ zIndex: TOAST_LAYER_Z_INDEX, ...style }}
      toastOptions={{
        ...toastOptions,
        classNames: {
          ...DEFAULT_TOAST_CLASSNAMES,
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );

  if (typeof document === "undefined") {
    return toaster;
  }

  return createPortal(toaster, document.body);
};

export { Toaster, toast };
