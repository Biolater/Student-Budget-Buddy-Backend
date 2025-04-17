type ConversionRateResponse = {
  result: string;
  base_code: string;
  conversion_rates: Record<string, number>;
};

export async function getConversionRate(
  baseCurrency: string,
  targetCurrency: string
) {
  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATES_API_KEY}/latest/${baseCurrency}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch exchange rates from API Ro: ${response.statusText}`
      );
    }

    const data: ConversionRateResponse = await response.json();

    return data.conversion_rates[targetCurrency];
  } catch (error) {
    console.error("Failed to fetch conversion rate:", error);
    throw new Error("Could not fetch conversion rate");
  }
}
