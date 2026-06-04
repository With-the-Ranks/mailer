// a bunch of loading divs

export default function Loading() {
  return (
    <>
      <div className="h-10 w-48 animate-pulse rounded-lg bg-stone-100 dark:bg-[#2D2D2D]" />
      <div className="h-96 w-full max-w-(--breakpoint-md) animate-pulse rounded-lg bg-stone-100 dark:bg-[#2D2D2D]" />
    </>
  );
}
