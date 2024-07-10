import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { addAudience } from "@/lib/actions/audience-list";

interface AddAudienceModalProps {
  closeModal: () => void;
  audienceListId: string;
}

export function AddAudienceModal({
  closeModal,
  audienceListId,
}: AddAudienceModalProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("audienceListId", audienceListId);

    const response = await addAudience(formData);
    setLoading(false);

    if ("error" in response) {
      setError(response.error);
    } else {
      router.refresh();
      toast.success("Audience added successfully");
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-4">
        <h2 className="mb-4 text-xl font-bold">Add New Audience</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border p-2"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full rounded border p-2"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full rounded border p-2"
            />
          </div>
          {error && <p className="mb-4 text-red-600">{error}</p>}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="custom" disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
