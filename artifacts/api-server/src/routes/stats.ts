import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, resourcesTable } from "@workspace/db";
import { GetStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user.id;

  const [allResources, recentResources] = await Promise.all([
    db
      .select()
      .from(resourcesTable)
      .where(eq(resourcesTable.userId, userId)),
    db
      .select()
      .from(resourcesTable)
      .where(eq(resourcesTable.userId, userId))
      .orderBy(desc(resourcesTable.createdAt))
      .limit(5),
  ]);

  const typeCount: Record<string, number> = {};
  for (const resource of allResources) {
    typeCount[resource.resourceType] = (typeCount[resource.resourceType] ?? 0) + 1;
  }

  const resourcesByType = Object.entries(typeCount).map(([resourceType, count]) => ({
    resourceType,
    count,
  }));

  res.json(
    GetStatsResponse.parse({
      totalResources: allResources.length,
      resourcesByType,
      recentResources,
    })
  );
});

export default router;
