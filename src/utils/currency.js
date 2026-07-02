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

const RATES_ENDPOINT = "https://api.frankfurter.dev/v2/rates";

export async function fetchRates(base) {
  const res = await fetch(`${RATES_ENDPOINT}?base=${encodeURIComponent(base)}`);
  if (!res.ok) throw new Error("Failed to fetch exchange rates");

  const rows = await res.json();
  if (!Array.isArray(rows)) throw new Error("Unexpected exchange rate response");

  const rates = { [base]: 1 };
  let date = null;
  for (const row of rows) {
    rates[row.quote] = row.rate;
    date = row.date;
  }
  return { rates, date };
}
