import { getEmailStatsByUser } from "@/lib/getEmailStats";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return new Response("Missing userId", { status: 400 });

  const stats = await getEmailStatsByUser(userId);
  return Response.json(stats);
}
