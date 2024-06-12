import { cn } from "@/lib/utils";
import LoadingDots from "@/components/icons/loading-dots";

interface FormButtonProps {
  isSubmitting: boolean;
  label: string;
}

const FormButton: React.FC<FormButtonProps> = ({ isSubmitting, label }) => (
  <button
    type="submit"
    className={cn(
      "flex h-8 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none sm:h-10",
      isSubmitting
        ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
        : "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
    )}
    disabled={isSubmitting}
  >
    {isSubmitting ? <LoadingDots color="#808080" /> : <p>{label}</p>}
  </button>
);

export default FormButton;
