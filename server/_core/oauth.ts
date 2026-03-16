import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/auth/login", async (req: Request, res: Response) => {
    const portalUrl = process.env.OAUTH_PORTAL_URL ?? process.env.VITE_OAUTH_PORTAL_URL;
    const host = req.get("host");
    const origin = `${req.protocol}://${host}`;
    const redirectUri = `${origin}/api/oauth/callback`;

    if (portalUrl && ENV.appId) {
      try {
        const state = Buffer.from(redirectUri).toString("base64");
        const url = new URL("/app-auth", portalUrl);
        url.searchParams.set("appId", ENV.appId);
        url.searchParams.set("redirectUri", redirectUri);
        url.searchParams.set("state", state);
        url.searchParams.set("type", "signIn");
        res.redirect(302, url.toString());
        return;
      } catch (error) {
        console.warn("[Auth] Failed to build OAuth login URL, falling back to local dev login", error);
      }
    }

    if (ENV.isProduction) {
      res.status(500).json({ error: "OAuth login is not configured" });
      return;
    }

    const devOpenId = process.env.DEV_OPEN_ID ?? "local-dev-user";
    const devName = process.env.DEV_USER_NAME ?? "Local Developer";
    const devEmail = process.env.DEV_USER_EMAIL ?? "dev@localhost";

    await db.upsertUser({
      openId: devOpenId,
      name: devName,
      email: devEmail,
      loginMethod: "dev",
      role: "admin",
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

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
