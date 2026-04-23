import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200/90 dark:bg-gray-700/60",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
