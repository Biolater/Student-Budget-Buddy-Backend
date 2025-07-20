import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { ApiError } from "../utils/ApiError";
import { successResponse } from "../utils/response";
import { AssistantService } from "../services/assistant.service";

export const postAssistant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message } = req.body;
    const { userId } = getAuth(req);

    if (!userId) {
      throw new ApiError(401, "User is not authenticated");
    }

    if (typeof message !== "string" || !message.trim()) {
      throw new ApiError(400, "Message is required");
    }

    const reply = await AssistantService.generateResponse(userId, message);
    res.json(successResponse(reply));
  } catch (error) {
    next(error);
  }
};
