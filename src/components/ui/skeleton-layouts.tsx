import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type SkeletonLayoutProps = React.HTMLAttributes<HTMLDivElement>;

type DocumentViewerSkeletonProps = SkeletonLayoutProps & {
  showHeader?: boolean;
};

export function DocumentViewerSkeleton({
  className,
  showHeader = true,
  ...props
}: DocumentViewerSkeletonProps) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)} {...props}>
      {showHeader ? (
        <div className="flex items-center justify-between gap-3 px-1 py-1.5 pb-3">
          <Skeleton className="h-5 w-[68%] max-w-[24rem]" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ) : null}

      <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-border/45 bg-background/45 p-3">
        <div className="flex h-full min-h-0 flex-col gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

type ChatSkeletonProps = SkeletonLayoutProps & {
  messages?: 2 | 3;
};

function MessageBubbleLines() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  );
}

export function ChatSkeleton({
  className,
  messages = 3,
  ...props
}: ChatSkeletonProps) {
  return (
    <div className={cn("w-full space-y-4", className)} {...props}>
      <div className="flex items-start gap-3">
        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
        <div className="max-w-[80%] flex-1 rounded-2xl border border-border/50 bg-card/75 p-3">
          <MessageBubbleLines />
        </div>
      </div>

      <div className="flex items-start justify-end gap-3">
        <div className="max-w-[80%] flex-1 rounded-2xl border border-border/50 bg-card/75 p-3">
          <MessageBubbleLines />
        </div>
        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      </div>

      {messages === 3 ? (
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="max-w-[80%] flex-1 rounded-2xl border border-border/50 bg-card/75 p-3">
            <MessageBubbleLines />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AvatarCardSkeleton({ className, ...props }: SkeletonLayoutProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-3",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-[4.5rem] rounded-full" />
      </div>

      <div className="mt-2 mx-auto w-full max-w-[220px]">
        <Skeleton className="aspect-square w-full rounded-xl" />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

type NewsGallerySkeletonProps = SkeletonLayoutProps & {
  cards?: number;
};

export function NewsCardSkeleton({ className, ...props }: SkeletonLayoutProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[30px] border border-border/60 bg-card shadow-soft",
        className,
      )}
      {...props}
    >
      <Skeleton className="absolute right-4 top-4 z-10 h-9 w-9 rounded-full" />

      <div className="h-44 overflow-hidden bg-muted/70 p-4">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="space-y-2.5">
          <Skeleton className="h-7 w-[88%]" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-[92%]" />
          <Skeleton className="h-5 w-[78%]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border/40 px-5 py-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function NewsGallerySkeleton({
  className,
  cards = 6,
  ...props
}: NewsGallerySkeletonProps) {
  const totalCards = Math.max(1, Math.min(cards, 12));

  return (
    <div
      className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)}
      {...props}
    >
      {Array.from({ length: totalCards }).map((_, index) => (
        <NewsCardSkeleton key={`news-skeleton-${index}`} />
      ))}
    </div>
  );
}

type RouteMediaFilesSkeletonProps = SkeletonLayoutProps & {
  compact?: boolean;
  rows?: number;
};

export function RouteMediaFilesSkeleton({
  className,
  compact = false,
  rows = 6,
  ...props
}: RouteMediaFilesSkeletonProps) {
  const totalRows = Math.max(3, Math.min(rows, 12));

  if (compact) {
    return (
      <div className={cn("flex h-full min-h-0 flex-col", className)} {...props}>
        <div className="flex justify-center p-0">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="min-h-0 flex-1 space-y-1.5 pt-1">
          {Array.from({ length: totalRows }).map((_, index) => (
            <div key={`route-media-compact-skeleton-${index}`} className="flex justify-center">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2.5", className)} {...props}>
      <div className="space-y-2">
        <div className="px-0.5 pr-1">
          <Skeleton className="h-9 w-full rounded-full" />
        </div>
        <div className="max-h-[42vh] overflow-hidden rounded-2xl border border-border/60 bg-card/70 px-2 py-1.5">
          <div className="space-y-1">
            {Array.from({ length: totalRows }).map((_, index) => (
              <div
                key={`route-media-skeleton-row-${index}`}
                className="grid w-full grid-cols-[16px_minmax(0,1fr)_32px] items-center gap-2 rounded-lg px-2 py-1.5"
              >
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className={cn("h-4", index % 3 === 0 ? "w-[94%]" : index % 3 === 1 ? "w-[82%]" : "w-[68%]")} />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type LearningRoutesGridSkeletonProps = SkeletonLayoutProps & {
  viewMode?: "mosaic" | "list";
  showCreateCard?: boolean;
  cards?: number;
};

function LearningRouteMosaicCardSkeleton() {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft">
      <Skeleton className="absolute right-3 top-3 z-20 h-8 w-8 rounded-full" />

      <div className="h-44 w-full overflow-hidden rounded-t-2xl rounded-b-none p-3">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>

      <div className="space-y-4 px-4 pb-4 pt-3">
        <Skeleton className="h-6 w-[92%]" />
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}

function LearningRouteListRowSkeleton() {
  return (
    <div className="grid min-w-0 gap-3 rounded-2xl border border-border/65 bg-card/80 px-3 py-4 shadow-soft md:grid-cols-[minmax(0,2.7fr)_170px_180px_120px_44px] md:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
        <div className="min-w-0 space-y-1">
          <Skeleton className="h-5 w-[15rem] max-w-full" />
          <Skeleton className="h-4 w-[22rem] max-w-full" />
        </div>
      </div>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-20" />
      <div className="flex items-center justify-end">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

function LearningRouteCreateMosaicSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary/30 bg-card/95 shadow-soft">
      <div className="flex min-h-[310px] flex-col items-center justify-center gap-6 p-8 text-center">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="mx-auto h-10 w-56" />
          <Skeleton className="mx-auto h-5 w-64 max-w-full" />
        </div>
      </div>
    </div>
  );
}

function LearningRouteCreateListSkeleton() {
  return (
    <div className="rounded-2xl border border-primary/35 bg-card/80 px-3 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton className="h-7 w-7 rounded-full" />
        <div className="min-w-0 space-y-1">
          <Skeleton className="h-5 w-44 max-w-full" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
      </div>
    </div>
  );
}

export function LearningRoutesGridSkeleton({
  className,
  viewMode = "mosaic",
  showCreateCard = false,
  cards = 4,
  ...props
}: LearningRoutesGridSkeletonProps) {
  const totalCards = Math.max(1, Math.min(cards, 12));
  const isListView = viewMode === "list";

  if (isListView) {
    return (
      <div className={cn("flex flex-col gap-2", className)} {...props}>
        <div className="hidden border-b border-border/70 px-3 pb-2 md:grid md:grid-cols-[minmax(0,2.7fr)_170px_180px_120px_44px]">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-4 justify-self-end" />
        </div>
        {showCreateCard ? <LearningRouteCreateListSkeleton /> : null}
        {Array.from({ length: totalCards }).map((_, index) => (
          <LearningRouteListRowSkeleton key={`learning-route-list-skeleton-${index}`} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6 md:grid-cols-2 xl:grid-cols-4", className)} {...props}>
      {showCreateCard ? <LearningRouteCreateMosaicSkeleton /> : null}
      {Array.from({ length: totalCards }).map((_, index) => (
        <LearningRouteMosaicCardSkeleton key={`learning-route-mosaic-skeleton-${index}`} />
      ))}
    </div>
  );
}
