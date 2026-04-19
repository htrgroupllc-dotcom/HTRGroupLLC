import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";
import bookingRouter from "./booking";
import chatRouter from "./chat";
import chatLeadRouter from "./chat-lead";
import waRouter from "./whatsapp";
import galleryRouter from "./gallery";
import { authRouter } from "./auth";
import { watchdogRouter } from "../watchdog.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contactRouter);
router.use(bookingRouter);
router.use(chatRouter);
router.use(chatLeadRouter);
router.use(waRouter);
router.use(galleryRouter);
router.use(authRouter);
router.use(watchdogRouter);

export default router;
