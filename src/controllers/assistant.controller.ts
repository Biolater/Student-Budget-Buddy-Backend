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

export const postAssistantStream = async (
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

    // Set headers for streaming (avoid overriding CORS headers)
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    // Hint some proxies not to buffer
    res.setHeader('X-Accel-Buffering', 'no');
    // Flush headers early if available
    // @ts-ignore - not always present depending on server setup
    if (typeof (res as any).flushHeaders === 'function') {
      (res as any).flushHeaders();
    }

    const stream = await AssistantService.generateStreamResponse(userId, message);

    // Handle the stream
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error) {
    next(error);
  }
};
