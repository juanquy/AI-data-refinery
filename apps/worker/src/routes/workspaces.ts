import { Hono } from "hono";
import { Env } from "../types";

export const workspacesRouter = new Hono<{ Bindings: Env }>();

// 1. List Workspaces
workspacesRouter.get("/", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM workspaces ORDER BY created_at DESC"
    ).all();
    return c.json({ status: "success", workspaces: results });
  } catch (err: any) {
    return c.json({ error: `Failed to fetch workspaces: ${err.message}` }, 500);
  }
});

// 2. Create Workspace
workspacesRouter.post("/", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const plan = body.plan || "ENTERPRISE";
  const ownerId = body.ownerUserId || "usr_founder_001";

  if (!name) {
    return c.json({ error: "Workspace name is required" }, 400);
  }

  const workspaceId = `ws_${crypto.randomUUID()}`;

  try {
    await c.env.DB.prepare(
      `INSERT INTO workspaces (id, name, owner_user_id, plan, created_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
    )
      .bind(workspaceId, name, ownerId, plan)
      .run();

    // Add owner as workspace member
    await c.env.DB.prepare(
      `INSERT INTO workspace_members (workspace_id, user_id, role, joined_at)
       VALUES (?, ?, 'OWNER', CURRENT_TIMESTAMP)`
    )
      .bind(workspaceId, ownerId)
      .run();

    return c.json({
      status: "success",
      workspace: { id: workspaceId, name, plan, ownerId }
    });
  } catch (err: any) {
    return c.json({ error: `Failed to create workspace: ${err.message}` }, 500);
  }
});

// 3. List Workspace Members
workspacesRouter.get("/:id/members", async (c) => {
  const workspaceId = c.req.param("id");
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT wm.role, wm.joined_at, u.id, u.email, u.display_name
       FROM workspace_members wm
       JOIN admin_users u ON wm.user_id = u.id
       WHERE wm.workspace_id = ?`
    )
      .bind(workspaceId)
      .all();

    return c.json({ status: "success", members: results });
  } catch (err: any) {
    return c.json({ error: `Failed to fetch members: ${err.message}` }, 500);
  }
});

// 4. Invite / Add Workspace Member
workspacesRouter.post("/:id/members", async (c) => {
  const workspaceId = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const email = String(body.email || "").trim();
  const displayName = String(body.displayName || email.split("@")[0]).trim();
  const role = body.role || "BUILDER";

  if (!email || !email.includes("@")) {
    return c.json({ error: "Valid email is required" }, 400);
  }

  try {
    // 1. Find or create user
    let user: any = await c.env.DB.prepare(
      "SELECT id FROM admin_users WHERE email = ? LIMIT 1"
    ).bind(email).first();

    let userId = user?.id;
    if (!userId) {
      userId = `usr_${crypto.randomUUID()}`;
      await c.env.DB.prepare(
        `INSERT INTO admin_users (id, email, display_name, role, passcode_hash, status, created_at)
         VALUES (?, ?, ?, 'MEMBER', 'refinery-member-2026', 'ACTIVE', CURRENT_TIMESTAMP)`
      )
        .bind(userId, email, displayName)
        .run();
    }

    // 2. Add to workspace_members
    await c.env.DB.prepare(
      `INSERT OR REPLACE INTO workspace_members (workspace_id, user_id, role, joined_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
    )
      .bind(workspaceId, userId, role)
      .run();

    return c.json({
      status: "success",
      message: `Member '${email}' added to workspace as ${role}`
    });
  } catch (err: any) {
    return c.json({ error: `Failed to add member: ${err.message}` }, 500);
  }
});
