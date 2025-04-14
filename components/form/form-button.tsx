import LoadingDots from "@/components/icons/loading-dots";
import { cn } from "@/lib/utils";

interface FormButtonProps {
  isSubmitting: boolean;
  label: string;
}

const FormButton: React.FC<FormButtonProps> = ({ isSubmitting, label }) => (
  <button
    type="submit"
    className={cn(
      "btn w-full",
      isSubmitting && "cursor-not-allowed opacity-50",
    )}
    disabled={isSubmitting}
  >
    {isSubmitting ? <LoadingDots color="#FFFCF7" /> : <span>{label}</span>}
  </button>
);

export default FormButton;
