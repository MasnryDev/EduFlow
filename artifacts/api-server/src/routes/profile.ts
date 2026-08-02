import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import { GetProfileResponse, UpdateProfileBody, UpdateProfileResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/profile", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user.id;

  let [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.userId, userId));

  if (!profile) {
    [profile] = await db
      .insert(profilesTable)
      .values({
        userId,
        email: req.user.email ?? null,
        displayName: req.user.firstName ?? req.user.lastName ?? null,
      })
      .returning();
  }

  res.json(GetProfileResponse.parse(profile));
});

router.patch("/profile", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = req.user.id;

  let [profile] = await db
    .update(profilesTable)
    .set({
      ...(parsed.data.displayName !== undefined && { displayName: parsed.data.displayName }),
      ...(parsed.data.email !== undefined && { email: parsed.data.email }),
    })
    .where(eq(profilesTable.userId, userId))
    .returning();

  if (!profile) {
    [profile] = await db
      .insert(profilesTable)
      .values({ userId, ...parsed.data })
      .returning();
  }

  res.json(UpdateProfileResponse.parse(profile));
});

export default router;
