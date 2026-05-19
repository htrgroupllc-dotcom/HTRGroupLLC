import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import voiceRouter, { handleVoiceIncoming } from "./routes/voice";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({
  origin: "*",
  allowedHeaders: ["Content-Type", "x-admin-pin", "Authorization"],
  exposedHeaders: ["Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Voice health — registered first so Replit always exposes this route after deploy
app.get(["/api/voice/status", "/voice/status"], (_req, res) => {
  res.json({
    ok: true,
    mode: process.env["VOICE_MODE"] ?? "gather",
    build: "voice-v3",
    gemini: Boolean(
      process.env["AI_INTEGRATIONS_GEMINI_API_KEY"] &&
        process.env["AI_INTEGRATIONS_GEMINI_BASE_URL"],
    ),
  });
});

app.use("/api", router);
app.use(voiceRouter);

// Guaranteed voice webhook (even if router order changes)
app.post("/api/voice/incoming", (req, res) => handleVoiceIncoming(req, res));
app.post("/voice/incoming", (req, res) => handleVoiceIncoming(req, res));

app.post("/sms/incoming", (req, res, next) => {
  if (req.body?.CallSid) {
    handleVoiceIncoming(req, res);
    return;
  }
  req.url = "/sms/incoming";
  router(req, res, next);
});

export default app;
