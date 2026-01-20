export type WizardStep = 1 | 2 | 3 | 4;

export interface WizardFormData {
  title: string; // campaign name
  subject: string;
  from: string;
  replyTo: string;
  previewText: string;
  content: string; // Maily JSON
  template: string | null;
  selectedSegment: string | null;
  audienceListId: string | null;
  scheduledTime: string | null;
}

export interface WizardState {
  emailId: string | null;
  organizationId: string;
  currentStep: WizardStep;
  formData: WizardFormData;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
}

export interface WizardContextValue extends WizardState {
  setCurrentStep: (step: WizardStep) => void;
  updateFormData: (data: Partial<WizardFormData>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canProceedToNextStep: () => boolean;
  saveEmail: () => Promise<void>;
  leavePrompt: { href: string } | null;
  setLeavePrompt: (v: { href: string } | null) => void;
  requestLeave: (href: string) => void;
}
