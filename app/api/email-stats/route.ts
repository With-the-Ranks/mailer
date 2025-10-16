import {
  getEmailStatsByOrganization,
  getEmailStatsByUser,
} from "@/lib/getEmailStats";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const organizationId = searchParams.get("organizationId");

  if (organizationId) {
    const stats = await getEmailStatsByOrganization(organizationId);
    return Response.json(stats);
  }

  if (userId) {
    const stats = await getEmailStatsByUser(userId);
    return Response.json(stats);
  }

  return new Response("Missing userId or organizationId", { status: 400 });
}
