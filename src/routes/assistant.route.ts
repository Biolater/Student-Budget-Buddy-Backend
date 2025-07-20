import { Router } from "express";
import { asyncHandler } from "../asyncHandler";
import checkAuth from "../utils/auth.utils";


const assistantRouter = Router();

assistantRouter.post(
    "/",
/*     asyncHandler(checkAuth),

 */    asyncHandler((req, res) => res.json({
        success: true,
        data: "Hello",
        error: null
    }))
)


export default assistantRouter;
