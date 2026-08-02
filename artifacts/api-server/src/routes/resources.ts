import { Router, type IRouter } from "express";
import { eq, and, ilike, desc, or } from "drizzle-orm";
import { db, resourcesTable } from "@workspace/db";
import {
  ListResourcesQueryParams,
  ListResourcesResponse,
  CreateResourceBody,
  CreateResourceResponse,
  GetResourceParams,
  GetResourceResponse,
  UpdateResourceParams,
  UpdateResourceBody,
  UpdateResourceResponse,
  DeleteResourceParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/resources", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = ListResourcesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { search, resource_type, page = 1, limit = 20 } = params.data;
  const offset = (page - 1) * limit;
  const userId = req.user.id;

  const conditions = [eq(resourcesTable.userId, userId)];

  if (resource_type) {
    conditions.push(eq(resourcesTable.resourceType, resource_type));
  }

  if (search) {
    conditions.push(
      or(
        ilike(resourcesTable.title, `%${search}%`),
        ilike(resourcesTable.topic, `%${search}%`),
        ilike(resourcesTable.subject, `%${search}%`),
      )!
    );
  }

  const whereClause = and(...conditions);

  const [resources, countResult] = await Promise.all([
    db
      .select()
      .from(resourcesTable)
      .where(whereClause)
      .orderBy(desc(resourcesTable.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select()
      .from(resourcesTable)
      .where(whereClause),
  ]);

  res.json(ListResourcesResponse.parse({
    resources,
    total: countResult.length,
    page,
    limit,
  }));
});

router.post("/resources", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateResourceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [resource] = await db
    .insert(resourcesTable)
    .values({
      userId: req.user.id,
      ...parsed.data,
    })
    .returning();

  res.status(201).json(CreateResourceResponse.parse(resource));
});

router.get("/resources/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = GetResourceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [resource] = await db
    .select()
    .from(resourcesTable)
    .where(
      and(
        eq(resourcesTable.id, params.data.id),
        eq(resourcesTable.userId, req.user.id),
      )
    );

  if (!resource) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  res.json(GetResourceResponse.parse(resource));
});

router.patch("/resources/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = UpdateResourceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateResourceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [resource] = await db
    .update(resourcesTable)
    .set(parsed.data)
    .where(
      and(
        eq(resourcesTable.id, params.data.id),
        eq(resourcesTable.userId, req.user.id),
      )
    )
    .returning();

  if (!resource) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  res.json(UpdateResourceResponse.parse(resource));
});

router.delete("/resources/:id", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = DeleteResourceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [resource] = await db
    .delete(resourcesTable)
    .where(
      and(
        eq(resourcesTable.id, params.data.id),
        eq(resourcesTable.userId, req.user.id),
      )
    )
    .returning();

  if (!resource) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
