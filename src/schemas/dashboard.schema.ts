import { z } from "zod";

const strictBoolean = z.preprocess((v) => {
  if (typeof v === "string") {
    const t = v.toLowerCase();
    if (t === "true") return true;
    if (t === "false") return false;
  }
  return v;
}, z.boolean({ invalid_type_error: "isActive must be either true or false" }));

export const GetUpcomingFinancialEventsQueryParamsSchema = z
  .object({
    limit: z.coerce
      .number({ invalid_type_error: "limit must be a number" })
      .int("limit must be an integer")
      .positive("limit must be positive")
      .max(100, "limit cannot exceed 100")
      .default(5),

    daysAhead: z.coerce
      .number({ invalid_type_error: "daysAhead must be a number" })
      .int("daysAhead must be an integer")
      .positive("daysAhead must be positive")
      .max(365, "daysAhead cannot exceed 365")
      .default(30),

    isActive: strictBoolean.default(true),
  })
  .strict();
