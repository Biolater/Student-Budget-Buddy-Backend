import { getConversionRate } from "../actions/budget.actions";

const convertToBudgetCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> => {
  if (fromCurrency === toCurrency) return amount;

  const conversionRate = await getConversionRate(fromCurrency, toCurrency);
  return amount * conversionRate;
};
