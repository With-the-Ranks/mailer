import LoadingDots from "@/components/icons/loading-dots";

export default function Loading() {
  return (
    <>
      <div className="h-10 w-48 animate-pulse rounded-lg bg-stone-100 dark:bg-[#2D2D2D]" />
      <div className="flex h-full w-full items-center justify-center">
        <LoadingDots />
      </div>
    </>
  );
}
