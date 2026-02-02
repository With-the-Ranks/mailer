import Logo from "@/components/logo";

export default function NotFoundPost() {
  return (
    <div className="mt-20 flex flex-col items-center justify-center space-y-6 py-20">
      <h1 className="text-4xl dark:text-white">404</h1>
      <div className="scale-150">
        <Logo showText={false} clickable={false} />
      </div>
      <p className="text-lg text-stone-500 dark:text-stone-400">
        Post does not exist, or you do not have permission to edit it
      </p>
    </div>
  );
}
