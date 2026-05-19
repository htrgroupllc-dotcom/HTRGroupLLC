import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/voice/status", (_req, res) => {
  res.json({ ok: true, via: "health-router", build: "voice-v3" });
});

export default router;
