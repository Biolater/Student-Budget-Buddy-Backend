type ConversionRateResponse = {
  result: string;
  base_code: string;
  conversion_rates: Record<string, number>;
};

export async function getConversionRate(
  baseCurrency: string,
  targetCurrency: string
): Promise<number> {
  const maxRetries = 3;
  const timeoutMs = 10000; // 10 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATES_API_KEY}/latest/${baseCurrency}`,
        {
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch exchange rates from API: ${response.status} ${response.statusText}`
        );
      }

      const data: ConversionRateResponse = await response.json();
      
      if (!data.conversion_rates || !data.conversion_rates[targetCurrency]) {
        throw new Error(`Conversion rate not found for ${targetCurrency}`);
      }

      return data.conversion_rates[targetCurrency];
    } catch (error) {
      console.error(`Failed to fetch conversion rate (attempt ${attempt}/${maxRetries}):`, error);
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error("Request timeout: Currency conversion service is not responding");
        }
        throw new Error(`Could not fetch conversion rate after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s...
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw new Error("Unexpected error: All retry attempts failed");
}
