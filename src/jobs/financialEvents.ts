// jobs/updateFinancialEvents.ts

import cron from "node-cron";
import prisma from "../prisma";
import { getNextDueDate } from "../utils/getNextDueDate";

export function scheduleFinancialEventUpdater() {
  cron.schedule("*/30 * * * *", async () => {
    const now = new Date();
    console.log(`[Cron] Checking due financial events at ${now.toISOString()}`);

    try {
      const events = await prisma.financialEvent.findMany({
        where: {
          isActive: true,
          nextDueDate: {
            lte: now,
          },
        },
      });

      for (const event of events) {
        try {
          const nextDue = getNextDueDate({
            nextDueDate: event.nextDueDate,
            frequency: event.frequency,
            interval: event.interval,
            rrule: event.rrule,
            rruleStartDate: event.rruleStartDate ?? undefined,
          });

          await prisma.financialEvent.update({
            where: { id: event.id },
            data: {
              nextDueDate: nextDue,
              lastProcessedAt: now,
            },
          });

          console.log(
            `[Cron] Updated event '${
              event.name
            }' → Next: ${nextDue.toISOString()}`
          );
        } catch (innerErr) {
          console.error(
            `[Cron] Failed to update event '${event.name}':`,
            innerErr
          );
        }
      }
    } catch (err) {
      console.error("[Cron] Failed to process financial events:", err);
    }
  });
}
