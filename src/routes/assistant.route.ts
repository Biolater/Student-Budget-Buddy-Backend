import { Router } from "express";
import { asyncHandler } from "../asyncHandler";
import checkAuth from "../utils/auth.utils";
import { postAssistant, postAssistantStream } from "../controllers/assistant.controller";

const assistantRouter = Router();

// Regular assistant endpoint
assistantRouter.post("/", asyncHandler(checkAuth), asyncHandler(postAssistant));

// Streaming assistant endpoint
assistantRouter.post("/stream", asyncHandler(checkAuth), asyncHandler(postAssistantStream));

export default assistantRouter;
