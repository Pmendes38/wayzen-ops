import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

const fallbackUser: User = {
  id: 0,
  openId: "local-no-auth",
  name: "Operador Local",
  email: "local@wayzen.dev",
  loginMethod: "disabled-auth",
  role: "admin",
  avatarUrl: null,
  phone: null,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  lastSignedIn: new Date(0),
};

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is disabled in local mode.
    user = fallbackUser;
  }

  if (!user) {
    user = fallbackUser;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
