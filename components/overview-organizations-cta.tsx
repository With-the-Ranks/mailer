import { getSession } from "@/lib/auth";

import CreateOrganizationButton from "./create-organization-button";
import CreateOrganizationModal from "./modal/create-organization";

export default async function OverviewOrganizationCTA() {
  const session = await getSession();
  if (!session) {
    return 0;
  }

  return (
    <CreateOrganizationButton>
      <CreateOrganizationModal />
    </CreateOrganizationButton>
  );
}
