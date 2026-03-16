import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/auth/login", async (req: Request, res: Response) => {
    const devOpenId = process.env.DEV_OPEN_ID ?? "wayzen-admin";
    const devName = process.env.DEV_USER_NAME ?? "Wayzen Admin";
    const devEmail = process.env.DEV_USER_EMAIL ?? "admin@wayzen.local";
    const devRole = process.env.DEV_USER_ROLE === "user" ? "user" : "admin";

    await db.upsertUser({
      openId: devOpenId,
      name: devName,
      email: devEmail,
      loginMethod: "dev",
      role: devRole,
      lastSignedIn: new Date(),
    });

    const sessionToken = await sdk.createSessionToken(devOpenId, {
      name: devName,
      expiresInMs: ONE_YEAR_MS,
    });

    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    res.redirect(302, "/");
  });

  app.get("/api/oauth/callback", (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    res.status(410).json({
      error: "OAuth callback is disabled",
      details: {
        code: code ?? null,
        state: state ?? null,
      },
    });
  });
}
