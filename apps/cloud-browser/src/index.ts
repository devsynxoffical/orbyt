import path from "path";
import { fileURLToPath } from "url";
import Fastify from "fastify";
import websocket from "@fastify/websocket";
import dotenv from "dotenv";
import {
  assertUserToolAccess,
  generateToken,
  parseCookies,
  pickCloudAccount,
  prisma,
} from "./db.js";
import {
  attachScreencast,
  createCloudSession,
  destroySession,
  getSessionByToken,
  sessionCount,
  startJanitor,
} from "./sessions.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../../.env") });
dotenv.config();

function requireApiKey(header: string | string[] | undefined) {
  const expected = process.env.SESSION_SERVICE_API_KEY;
  if (!expected) throw new Error("SESSION_SERVICE_API_KEY is not set");
  const got = Array.isArray(header) ? header[0] : header;
  if (!got || got !== expected) {
    const err = new Error("Unauthorized");
    (err as Error & { statusCode?: number }).statusCode = 401;
    throw err;
  }
}

function publicBase() {
  return (
    process.env.CLOUD_BROWSER_PUBLIC_URL ||
    `http://127.0.0.1:${process.env.CLOUD_BROWSER_PORT || "4100"}`
  ).replace(/\/$/, "");
}

function viewerHtml(token: string) {
  const wsPath = `/ws/${encodeURIComponent(token)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <title>Rankmora cloud session</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; background: #0f0f0f; color: #fff; font-family: system-ui, sans-serif; }
    #bar { display: flex; gap: 8px; align-items: center; padding: 8px 12px; background: #1a1a1a; font-size: 12px; }
    #bar button { background: #197cc0; color: #fff; border: 0; border-radius: 8px; padding: 8px 12px; font-weight: 700; }
    #wrap { position: relative; height: calc(100% - 44px); overflow: auto; touch-action: none; }
    canvas { display: block; width: 100%; height: auto; max-width: 1280px; margin: 0 auto; background: #000; }
    #status { opacity: 0.7; }
  </style>
</head>
<body>
  <div id="bar">
    <strong>Cloud session</strong>
    <span id="status">Connecting…</span>
    <button type="button" id="reload">Reload page</button>
  </div>
  <div id="wrap"><canvas id="c" width="1280" height="800"></canvas></div>
  <script>
    const token = ${JSON.stringify(token)};
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    const status = document.getElementById('status');
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Support both root hosts (cloud.rankmora.io) and path proxies (/cloud-browser/v/…)
    const pathBase = location.pathname.replace(/\\/v\\/[^/]+\\/?$/, '');
    const ws = new WebSocket(proto + '//' + location.host + pathBase + ${JSON.stringify(wsPath)});
    let img = new Image();

    function scalePoint(e) {
      const r = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: ((clientX - r.left) / r.width) * canvas.width,
        y: ((clientY - r.top) / r.height) * canvas.height,
      };
    }

    function send(obj) {
      if (ws.readyState === 1) ws.send(JSON.stringify(obj));
    }

    ws.onopen = () => { status.textContent = 'Connected'; };
    ws.onclose = () => { status.textContent = 'Disconnected'; };
    ws.onerror = () => { status.textContent = 'Error'; };
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'frame' && msg.data) {
          img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          img.src = 'data:image/jpeg;base64,' + msg.data;
        }
      } catch (_) {}
    };

    function bindPointer(type, downType, upType) {
      canvas.addEventListener(type, (e) => {
        e.preventDefault();
        const p = scalePoint(e);
        send({ type: downType, x: p.x, y: p.y, button: 'left' });
      }, { passive: false });
      canvas.addEventListener(upType, (e) => {
        e.preventDefault();
        const p = scalePoint(e.changedTouches ? e.changedTouches[0] : e);
        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
        const r = canvas.getBoundingClientRect();
        send({
          type: 'mouseup',
          x: ((clientX - r.left) / r.width) * canvas.width,
          y: ((clientY - r.top) / r.height) * canvas.height,
          button: 'left',
        });
      }, { passive: false });
    }
    bindPointer('mousedown', 'mousedown', 'mouseup');
    bindPointer('touchstart', 'mousedown', 'touchend');

    canvas.addEventListener('mousemove', (e) => {
      if (e.buttons !== 1) return;
      const p = scalePoint(e);
      send({ type: 'mousemove', x: p.x, y: p.y, button: 'left' });
    });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const p = scalePoint(e);
      send({ type: 'mousemove', x: p.x, y: p.y, button: 'left' });
    }, { passive: false });
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const p = scalePoint(e);
      send({ type: 'wheel', x: p.x, y: p.y, deltaY: e.deltaY });
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
      send({ type: 'keydown', key: e.key, code: e.code, text: e.key.length === 1 ? e.key : undefined });
      if (e.key.length === 1) send({ type: 'char', text: e.key });
    });
    window.addEventListener('keyup', (e) => {
      send({ type: 'keyup', key: e.key, code: e.code });
    });

    document.getElementById('reload').onclick = () => location.reload();
  </script>
</body>
</html>`;
}

async function main() {
  const app = Fastify({ logger: true });
  await app.register(websocket);

  app.get("/health", async () => ({
    ok: true,
    service: "cloud-browser",
    sessions: sessionCount(),
  }));

  app.post<{
    Body: {
      userId?: string;
      toolId?: string;
      toolSlug?: string;
      openUrl?: string;
    };
  }>("/internal/cloud-launch", async (request, reply) => {
    try {
      requireApiKey(request.headers["x-api-key"]);
    } catch {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const body = request.body ?? {};
    const userId = body.userId?.trim();
    if (!userId) {
      return reply.code(400).send({ error: "userId is required" });
    }

    let tool =
      body.toolId
        ? await prisma.tool.findUnique({ where: { id: body.toolId } })
        : body.toolSlug
          ? await prisma.tool.findUnique({ where: { slug: body.toolSlug } })
          : null;

    if (!tool || !tool.active) {
      return reply.code(404).send({ error: "Tool not found" });
    }

    const openUrl = (body.openUrl || tool.launchUrl || "").trim();
    if (!openUrl) {
      return reply.code(400).send({ error: "Tool has no launch URL" });
    }

    const allowed = await assertUserToolAccess(userId, tool.id);
    if (!allowed) {
      return reply.code(403).send({ error: "No active access to this tool" });
    }

    const account = await pickCloudAccount(tool.id);
    if (!account) {
      return reply
        .code(503)
        .send({ error: "No active tool account with valid cookies" });
    }

    let cookies;
    try {
      cookies = parseCookies(account.cookieDataEnc);
    } catch {
      return reply.code(503).send({ error: "Could not decrypt cookies" });
    }

    const token = generateToken();
    try {
      await createCloudSession({
        token,
        userId,
        toolId: tool.id,
        toolAccountId: account.id,
        openUrl,
        cookies,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start cloud session";
      return reply.code(503).send({ error: message });
    }

    await prisma.toolLaunchLog.create({
      data: {
        userId,
        toolId: tool.id,
        toolAccountId: account.id,
      },
    });

    const streamUrl = `${publicBase()}/v/${token}`;
    return {
      mode: "CLOUD",
      streamUrl,
      toolAccountId: account.id,
      expiresAt: new Date(Date.now() + Number(process.env.CLOUD_BROWSER_TTL_MS ?? 1_800_000)).toISOString(),
    };
  });

  app.get<{ Params: { token: string } }>("/v/:token", async (request, reply) => {
    const session = getSessionByToken(request.params.token);
    if (!session) {
      return reply
        .code(410)
        .type("text/html")
        .send(
          "<h1>Session expired</h1><p>Go back to Rankmora and launch again.</p>"
        );
    }
    return reply.type("text/html").send(viewerHtml(request.params.token));
  });

  app.get<{ Params: { token: string } }>(
    "/ws/:token",
    { websocket: true },
    (socket, request) => {
      const session = getSessionByToken(request.params.token);
      if (!session) {
        socket.close();
        return;
      }
      void attachScreencast(session, socket);
    }
  );

  app.post<{ Params: { token: string } }>(
    "/internal/sessions/:token/close",
    async (request, reply) => {
      try {
        requireApiKey(request.headers["x-api-key"]);
      } catch {
        return reply.code(401).send({ error: "Unauthorized" });
      }
      await destroySession(request.params.token);
      return { ok: true };
    }
  );

  startJanitor();

  const host = process.env.CLOUD_BROWSER_BIND_HOST || "127.0.0.1";
  const port = Number(process.env.CLOUD_BROWSER_PORT || "4100");
  await app.listen({ host, port });
  console.log(`cloud-browser listening on ${host}:${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
