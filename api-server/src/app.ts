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
