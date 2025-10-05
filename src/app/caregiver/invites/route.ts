import { requireRole } from "@/lib/guards";
import { createInvite } from "@/lib/db-firestore";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

export async function POST() {
  const user = await requireRole(["CAREGIVER"]);
  const token = randomBytes(16).toString("hex");
  await createInvite(user.auth0Id || user.id, token);
  return Response.json({ token });
}
