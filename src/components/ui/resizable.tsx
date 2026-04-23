import { useRef } from "react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle,
  className,
  onToggle,
  onDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
  onToggle?: () => void;
}) => {
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const movedRef = useRef(false);
  const draggingRef = useRef(false);
  const draggedSincePointerDownRef = useRef(false);

  return (
    <ResizablePrimitive.PanelResizeHandle
      className={cn(
        "group relative flex w-px items-center justify-center bg-border/80 after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className,
      )}
      onDragging={(isDragging) => {
        if (isDragging) {
          draggedSincePointerDownRef.current = true;
        }
        draggingRef.current = isDragging;
        onDragging?.(isDragging);
      }}
      onPointerDown={(event) => {
        pointerStartRef.current = { x: event.clientX, y: event.clientY };
        movedRef.current = false;
        draggedSincePointerDownRef.current = false;
        onPointerDown?.(event);
      }}
      onPointerMove={(event) => {
        const start = pointerStartRef.current;
        if (start) {
          const movedDistance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
          if (movedDistance > 4) {
            movedRef.current = true;
          }
        }
        onPointerMove?.(event);
      }}
      onPointerUp={(event) => {
        if (!draggedSincePointerDownRef.current && !movedRef.current) {
          onToggle?.();
        }
        pointerStartRef.current = null;
        draggingRef.current = false;
        movedRef.current = false;
        draggedSincePointerDownRef.current = false;
        onPointerUp?.(event);
      }}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && onToggle) {
          event.preventDefault();
          onToggle();
        }
        onKeyDown?.(event);
      }}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-8 w-3 items-center justify-center">
          <span className="block h-5 w-[1.5px] rounded-full bg-muted-foreground/45 transition-colors duration-150 group-hover:bg-muted-foreground/65 group-active:bg-muted-foreground/75" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
};

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
