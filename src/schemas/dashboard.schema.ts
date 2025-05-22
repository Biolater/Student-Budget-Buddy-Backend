import z from "zod";

export const GetUpcomingFinancialEventsQueryParamsSchema = z
  .object({
    limit: z.preprocess((a) => {
      if (a === undefined) return undefined;
      return parseInt(z.string().parse(a), 10);
    }, z.number().int().positive().optional().default(5)),
    daysAhead: z.preprocess((a) => {
      if (a === undefined) return undefined;
      return parseInt(z.string().parse(a), 10);
    }, z.number().int().positive().optional().default(30)),
    isActive: z.preprocess((a) => {
      if (a === undefined) return undefined;
      if (typeof a === "string") {
        const lowerCaseA = a.toLowerCase();
        if (lowerCaseA === "true") return true;
        if (lowerCaseA === "false") return false;
      }
      return undefined;
    }, z.boolean().optional().default(true)),
  })
  .strict();
