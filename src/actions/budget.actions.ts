type ConversionRateResponse = {
  result: string;
  base_code: string;
  conversion_rates: Record<string, number>;
};

// Fallback exchange rates (approximate values)
const FALLBACK_RATES: Record<string, Record<string, number>> = {
  USD: {
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110,
    CAD: 1.25,
    AUD: 1.35,
    CHF: 0.92,
    CNY: 6.45,
    TRY: 27.5,
    AZN: 1.7,
  },
  EUR: {
    USD: 1.18,
    GBP: 0.86,
    JPY: 129,
    CAD: 1.47,
    AUD: 1.59,
    CHF: 1.08,
    CNY: 7.59,
    TRY: 32.4,
    AZN: 2.0,
  },
  // Add more base currencies as needed
};

export async function getConversionRate(
  baseCurrency: string,
  targetCurrency: string
): Promise<number> {
  console.log(`🔄 getConversionRate called with: baseCurrency='${baseCurrency}', targetCurrency='${targetCurrency}'`);
  
  // If same currency, return 1
  if (baseCurrency === targetCurrency) {
    console.log(`✅ Same currency detected, returning 1`);
    return 1;
  }

  // Check if API key is available
  if (!process.env.EXCHANGE_RATES_API_KEY) {
    console.warn("EXCHANGE_RATES_API_KEY not found, using fallback rates");
    return getFallbackRate(baseCurrency, targetCurrency);
  }

  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATES_API_KEY}/latest/${baseCurrency}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      console.warn(`API request failed: ${response.status}, using fallback rates`);
      return getFallbackRate(baseCurrency, targetCurrency);
    }

    const data: ConversionRateResponse = await response.json();
    
    if (!data.conversion_rates || !data.conversion_rates[targetCurrency]) {
      console.warn(`Conversion rate not found for ${targetCurrency}, using fallback`);
      return getFallbackRate(baseCurrency, targetCurrency);
    }

    return data.conversion_rates[targetCurrency];
  } catch (error) {
    console.warn("Failed to fetch conversion rate from API, using fallback:", error);
    return getFallbackRate(baseCurrency, targetCurrency);
  }
}

function getFallbackRate(baseCurrency: string, targetCurrency: string): number {
  // Check direct conversion
  if (FALLBACK_RATES[baseCurrency]?.[targetCurrency]) {
    return FALLBACK_RATES[baseCurrency][targetCurrency];
  }
  
  // Check reverse conversion
  if (FALLBACK_RATES[targetCurrency]?.[baseCurrency]) {
    return 1 / FALLBACK_RATES[targetCurrency][baseCurrency];
  }
  
  // Convert through USD if neither direct conversion exists
  if (baseCurrency !== 'USD' && targetCurrency !== 'USD') {
    const baseToUSD = FALLBACK_RATES[baseCurrency]?.USD || (FALLBACK_RATES.USD[baseCurrency] ? 1 / FALLBACK_RATES.USD[baseCurrency] : 1);
    const usdToTarget = FALLBACK_RATES.USD[targetCurrency] || (FALLBACK_RATES[targetCurrency]?.USD ? 1 / FALLBACK_RATES[targetCurrency].USD : 1);
    return (1 / baseToUSD) * usdToTarget;
  }
  
  // Default fallback
  console.warn(`No conversion rate found for ${baseCurrency} to ${targetCurrency}, using 1:1`);
  return 1;
}
