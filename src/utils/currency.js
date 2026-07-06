export const POPULAR_CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "NGN", name: "Nigerian Naira" },
  { code: "GHS", name: "Ghanaian Cedi" },
  { code: "ZAR", name: "South African Rand" },
  { code: "KES", name: "Kenyan Shilling" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "XOF", name: "West African CFA Franc" },
  { code: "XAF", name: "Central African CFA Franc" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "INR", name: "Indian Rupee" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "RUB", name: "Russian Ruble" },
  { code: "KRW", name: "South Korean Won" },
  { code: "PKR", name: "Pakistani Rupee" },
];

export const CURRENCY_CODES = POPULAR_CURRENCIES.map((c) => c.code);

const RATES_ENDPOINT = "https://open.er-api.com/v6/latest";

export function formatRateTimestamp(date) {
  if (!date) return "";
  return date.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function fetchRates(base, { bustCache = false } = {}) {
  const url = `${RATES_ENDPOINT}/${encodeURIComponent(base)}${bustCache ? `?_=${Date.now()}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch exchange rates");

  const data = await res.json();
  if (data.result !== "success" || !data.rates) {
    throw new Error("Unexpected exchange rate response");
  }

  const rateUpdatedAt = data.time_last_update_utc
    ? new Date(data.time_last_update_utc)
    : null;

  return {
    rates: data.rates,
    rateUpdatedAt,
    fetchedAt: new Date(),
  };
}
