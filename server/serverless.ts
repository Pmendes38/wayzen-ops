import "dotenv/config";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "./_core/app";

const app = createApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
