import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface FormButtonProps {
  isSubmitting: boolean;
  label: string;
}

const FormButton: React.FC<FormButtonProps> = ({ isSubmitting, label }) => (
  <Button
    type="submit"
    className="w-full"
    disabled={isSubmitting}
    aria-label={isSubmitting ? "Submitting" : label}
  >
    {isSubmitting ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        Submitting...
      </>
    ) : (
      label
    )}
  </Button>
);

export default FormButton;
