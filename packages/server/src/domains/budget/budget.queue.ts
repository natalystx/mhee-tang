import { transactionQueue } from "@/domains/transaction/transaction.queue";
import { transactionService } from "@/domains/transaction/transaction.service";
import { budgetService } from "./budget.service";
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isBefore,
  isAfter,
  isEqual,
} from "date-fns";

/**
 * Determines if a transaction's date falls within a budget's cycle
 * @param transactionDate The date of the transaction
 * @param cycle The budget cycle type (daily, weekly, monthly, yearly, custom)
 * @param startDate The start date of the budget
 * @param endDate The end date of the budget (only used for custom cycles)
 * @returns Boolean indicating if the transaction is within the budget cycle
 */
const isTransactionInBudgetCycle = (
  transactionDate: Date,
  cycle: string,
  startDate: Date,
  endDate?: Date | null
): boolean => {
  // Ensure all dates are proper Date objects
  const txnDate = new Date(transactionDate);
  const budgetStart = new Date(startDate);

  // Calculate the cycle end date based on the budget cycle type
  let cycleEnd: Date;

  switch (cycle) {
    case "daily":
      cycleEnd = addDays(budgetStart, 1);
      break;
    case "weekly":
      cycleEnd = addWeeks(budgetStart, 1);
      break;
    case "monthly":
      cycleEnd = addMonths(budgetStart, 1);
      break;
    case "yearly":
      cycleEnd = addYears(budgetStart, 1);
      break;
    case "custom":
      cycleEnd = endDate ? new Date(endDate) : addMonths(budgetStart, 1);
      break;
    default:
      cycleEnd = addMonths(budgetStart, 1); // Default to monthly if cycle is unknown
  }

  // Check if transaction date is within the cycle (inclusive of start date, exclusive of end date)
  // A transaction exactly at the start date is included, but one exactly at the end date is not
  return (
    (isEqual(txnDate, budgetStart) || isAfter(txnDate, budgetStart)) &&
    isBefore(txnDate, cycleEnd)
  );
};

const onUpdatedTransaction = () => {
  transactionQueue.onUpdatedTransaction.listen(async (data) => {
    try {
      if (!data.categoryId) return;

      const existingBudgets = await budgetService.findByCategory(
        data.userId,
        data.categoryId!
      );

      const transaction = await transactionService.findByUid(data.uid);
      if (!transaction) return;

      const transactionDate = transaction.transactionDate;

      for (const budget of existingBudgets) {
        // Check if the transaction date falls within this budget's cycle
        const isInCycle = isTransactionInBudgetCycle(
          new Date(transactionDate),
          budget.cycle,
          new Date(budget.startDate),
          budget.endDate ? new Date(budget.endDate) : null
        );

        // Only update the budget if the transaction is within the cycle
        if (isInCycle) {
          const newAmount =
            data.actionType === "add"
              ? Number(budget.currentAmount || 0) + data.amount
              : Number(budget.currentAmount || 0) - data.amount;
          await budgetService.updateCurrentAmount({
            categoryId: data.categoryId!,
            userId: data.userId,
            amount: newAmount,
            type: "expense",
          });
        }
      }
    } catch (error) {
      console.error("Error updating budget on transaction update:", error);
    }
  });
};

export const budgetQueue = {
  onUpdatedTransaction,
  isTransactionInBudgetCycle,
};
