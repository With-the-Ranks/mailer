import { getEmailStatsByOrganization } from "@/lib/getEmailStats";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get("organizationId");

  if (!organizationId) {
    return new Response("Missing organizationId", { status: 400 });
  }

  const stats = await getEmailStatsByOrganization(organizationId);
  return Response.json(stats);
}
