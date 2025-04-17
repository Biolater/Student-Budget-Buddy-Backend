import { getConversionRate } from "../actions/budget.actions";

const convertToBudgetCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string
) => {
  if (fromCurrency === toCurrency) return amount;

  const conversion_rate = await getConversionRate(fromCurrency, toCurrency);
  return amount * conversion_rate;
};
