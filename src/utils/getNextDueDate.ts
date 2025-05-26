import { addDays, addWeeks, addMonths, addYears } from "date-fns";
import { RRule } from "rrule";

type FinancialEventFrequency =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "YEARLY"
  | "CUSTOM";

interface FinancialEventInput {
  nextDueDate: Date;
  frequency: FinancialEventFrequency;
  interval: number;
  rrule?: string | null;
  rruleStartDate?: Date | null;
}

export function getNextDueDate(event: FinancialEventInput): Date {
  const { nextDueDate, frequency, interval, rrule, rruleStartDate } = event;

  const anchorDate = rruleStartDate ?? nextDueDate;

  if (frequency === "CUSTOM") {
    if (!rrule) {
      throw new Error("Custom frequency requires a valid rrule.");
    }

    try {
      const rule = RRule.fromString(rrule);
      const afterDate = rule.after(anchorDate, false);

      if (!afterDate) {
        throw new Error("No future occurrence found for the custom rule.");
      }

      return afterDate;
    } catch (err) {
      console.error("Invalid rrule format:", err);
      throw new Error("Could not compute next due date for CUSTOM frequency.");
    }
  }

  switch (frequency) {
    case "DAILY":
      return addDays(nextDueDate, interval);
    case "WEEKLY":
      return addWeeks(nextDueDate, interval);
    case "MONTHLY":
      return addMonths(nextDueDate, interval);
    case "YEARLY":
      return addYears(nextDueDate, interval);
    default:
      throw new Error(`Unknown frequency: ${frequency}`);
  }
}
