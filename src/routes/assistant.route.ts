import { Router } from "express";
import { asyncHandler } from "../asyncHandler";
import checkAuth from "../utils/auth.utils";
import { postAssistant } from "../controllers/assistant.controller";

const assistantRouter = Router();

assistantRouter.post("/", asyncHandler(checkAuth), asyncHandler(postAssistant));

export default assistantRouter;
