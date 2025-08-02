type ConversionRateResponse = {
  result: string;
  base_code: string;
  conversion_rates: Record<string, number>;
};

// Cache for conversion rates to avoid multiple API calls
const conversionCache = new Map<string, number>();
const cacheExpiry = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Track if API is failing to avoid repeated calls
let apiFailureCount = 0;
const MAX_API_FAILURES = 3;
let lastApiFailure = 0;
const API_COOLDOWN = 60 * 1000; // 1 minute cooldown after failures

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
  AZN: {
    USD: 0.59,
    EUR: 0.50,
    GBP: 0.43,
    TRY: 16.2,
  },
  // Add more base currencies as needed
};

export async function getConversionRate(
  baseCurrency: string,
  targetCurrency: string
): Promise<number> {
  const cacheKey = `${baseCurrency}-${targetCurrency}`;
  console.log(`🔄 getConversionRate called with: baseCurrency='${baseCurrency}', targetCurrency='${targetCurrency}'`);
  
  // If same currency, return 1
  if (baseCurrency === targetCurrency) {
    console.log(`✅ Same currency detected, returning 1`);
    return 1;
  }

  // Check cache first
  const cachedRate = conversionCache.get(cacheKey);
  const cacheTime = cacheExpiry.get(cacheKey);
  if (cachedRate && cacheTime && Date.now() < cacheTime) {
    console.log(`💾 Using cached rate: ${cachedRate}`);
    return cachedRate;
  }

  // Check if we should skip API due to recent failures
  const now = Date.now();
  if (apiFailureCount >= MAX_API_FAILURES && (now - lastApiFailure) < API_COOLDOWN) {
    console.log(`⚠️ API in cooldown due to failures, using fallback`);
    const fallbackRate = getFallbackRate(baseCurrency, targetCurrency);
    // Cache the fallback rate briefly
    conversionCache.set(cacheKey, fallbackRate);
    cacheExpiry.set(cacheKey, now + (CACHE_DURATION / 10)); // Shorter cache for fallback
    return fallbackRate;
  }

  // Check if API key is available
  if (!process.env.EXCHANGE_RATES_API_KEY) {
    console.log(`🔑 No API key, using fallback rates`);
    const fallbackRate = getFallbackRate(baseCurrency, targetCurrency);
    conversionCache.set(cacheKey, fallbackRate);
    cacheExpiry.set(cacheKey, now + CACHE_DURATION);
    return fallbackRate;
  }

  try {
    console.log(`🌐 Fetching from API...`);
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATES_API_KEY}/latest/${baseCurrency}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data: ConversionRateResponse = await response.json();
    
    if (!data.conversion_rates || !data.conversion_rates[targetCurrency]) {
      throw new Error(`Rate not found for ${targetCurrency}`);
    }

    const rate = data.conversion_rates[targetCurrency];
    
    // Cache the successful result
    conversionCache.set(cacheKey, rate);
    cacheExpiry.set(cacheKey, now + CACHE_DURATION);
    
    // Reset failure count on success
    apiFailureCount = 0;
    
    console.log(`✅ API success, rate: ${rate}`);
    return rate;
  } catch (error) {
    // Track API failures
    apiFailureCount++;
    lastApiFailure = now;
    
    console.log(`❌ API failed (${apiFailureCount}/${MAX_API_FAILURES}), using fallback`);
    const fallbackRate = getFallbackRate(baseCurrency, targetCurrency);
    
    // Cache the fallback rate
    conversionCache.set(cacheKey, fallbackRate);
    cacheExpiry.set(cacheKey, now + (CACHE_DURATION / 10)); // Shorter cache for fallback
    
    return fallbackRate;
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
