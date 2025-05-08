import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import { errorResponse } from "./response";

const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json(errorResponse(401, "User is not authenticated"));
    return;
  }

  next();
};

export default checkAuth;
