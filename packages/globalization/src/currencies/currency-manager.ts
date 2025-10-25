import { z } from 'zod';

// ============================================================================
// Currency Schemas
// ============================================================================

export const CurrencySchema = z.object({
  code: z.string().length(3), // ISO 4217 currency code
  name: z.string(),
  symbol: z.string(),
  decimalPlaces: z.number().min(0).max(4),
  isActive: z.boolean().default(true),
  isSupported: z.boolean().default(true),
  exchangeRate: z.number().positive().optional(),
  lastUpdated: z.date().optional(),
});

export const ExchangeRateSchema = z.object({
  from: z.string().length(3),
  to: z.string().length(3),
  rate: z.number().positive(),
  timestamp: z.date(),
  provider: z.string(),
  source: z.enum(['api', 'manual', 'cached']),
});

export const CurrencyConversionSchema = z.object({
  amount: z.number().nonnegative(),
  fromCurrency: z.string().length(3),
  toCurrency: z.string().length(3),
  convertedAmount: z.number().nonnegative(),
  exchangeRate: z.number().positive(),
  timestamp: z.date(),
  fees: z.number().nonnegative().default(0),
  totalAmount: z.number().nonnegative(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type Currency = z.infer<typeof CurrencySchema>;
export type ExchangeRate = z.infer<typeof ExchangeRateSchema>;
export type CurrencyConversion = z.infer<typeof CurrencyConversionSchema>;

// ============================================================================
// Currency Manager
// ============================================================================

export class CurrencyManager {
  private currencies: Map<string, Currency> = new Map();
  private exchangeRates: Map<string, ExchangeRate> = new Map();
  private lastUpdate: Date | null = null;
  private updateInterval: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.initializeDefaultCurrencies();
  }

  // ============================================================================
  // Currency Management
  // ============================================================================

  addCurrency(currency: Currency): void {
    this.currencies.set(currency.code, currency);
  }

  getCurrency(code: string): Currency | null {
    return this.currencies.get(code.toUpperCase()) || null;
  }

  getAllCurrencies(): Currency[] {
    return Array.from(this.currencies.values());
  }

  getSupportedCurrencies(): Currency[] {
    return this.getAllCurrencies().filter(currency => currency.isSupported);
  }

  getActiveCurrencies(): Currency[] {
    return this.getAllCurrencies().filter(currency => currency.isActive);
  }

  // ============================================================================
  // Exchange Rate Management
  // ============================================================================

  async updateExchangeRates(provider: 'fixer' | 'exchangerate' | 'manual' = 'fixer'): Promise<void> {
    try {
      const rates = await this.fetchExchangeRates(provider);
      
      for (const rate of rates) {
        this.exchangeRates.set(`${rate.from}-${rate.to}`, rate);
      }
      
      this.lastUpdate = new Date();
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
      throw error;
    }
  }

  getExchangeRate(from: string, to: string): ExchangeRate | null {
    const key = `${from.toUpperCase()}-${to.toUpperCase()}`;
    return this.exchangeRates.get(key) || null;
  }

  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    fees: number = 0
  ): Promise<CurrencyConversion> {
    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
      return {
        amount,
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        convertedAmount: amount,
        exchangeRate: 1,
        timestamp: new Date(),
        fees,
        totalAmount: amount + fees,
      };
    }

    const exchangeRate = this.getExchangeRate(fromCurrency, toCurrency);
    
    if (!exchangeRate) {
      throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    }

    const convertedAmount = amount * exchangeRate.rate;
    const totalAmount = convertedAmount + fees;

    return {
      amount,
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      convertedAmount,
      exchangeRate: exchangeRate.rate,
      timestamp: exchangeRate.timestamp,
      fees,
      totalAmount,
    };
  }

  // ============================================================================
  // Currency Formatting
  // ============================================================================

  formatCurrency(
    amount: number,
    currencyCode: string,
    locale: string = 'en-US'
  ): string {
    const currency = this.getCurrency(currencyCode);
    if (!currency) {
      throw new Error(`Currency ${currencyCode} not found`);
    }

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: currency.decimalPlaces,
        maximumFractionDigits: currency.decimalPlaces,
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      return `${currency.symbol}${amount.toFixed(currency.decimalPlaces)}`;
    }
  }

  parseCurrencyAmount(formattedAmount: string, currencyCode: string): number {
    const currency = this.getCurrency(currencyCode);
    if (!currency) {
      throw new Error(`Currency ${currencyCode} not found`);
    }

    // Remove currency symbol and parse
    const cleanAmount = formattedAmount.replace(/[^\d.,-]/g, '');
    return parseFloat(cleanAmount.replace(',', '.'));
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private initializeDefaultCurrencies(): void {
    const defaultCurrencies: Currency[] = [
      {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        decimalPlaces: 2,
        isActive: true,
        isSupported: true,
      },
      {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        decimalPlaces: 2,
        isActive: true,
        isSupported: true,
      },
      {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        decimalPlaces: 2,
        isActive: true,
        isSupported: true,
      },
      {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        decimalPlaces: 2,
        isActive: true,
        isSupported: true,
      },
      {
        code: 'CAD',
        name: 'Canadian Dollar',
        symbol: 'C$',
        decimalPlaces: 2,
        isActive: true,
        isSupported: true,
      },
      {
        code: 'AUD',
        name: 'Australian Dollar',
        symbol: 'A$',
        decimalPlaces: 2,
        isActive: true,
        isSupported: true,
      },
      {
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        decimalPlaces: 0,
        isActive: true,
        isSupported: true,
      },
      {
        code: 'CNY',
        name: 'Chinese Yuan',
        symbol: '¥',
        decimalPlaces: 2,
        isActive: true,
        isSupported: true,
      },
      {
        code: 'BRL',
        name: 'Brazilian Real',
        symbol: 'R$',
        decimalPlaces: 2,
        isActive: true,
        isSupported: true,
      },
      {
        code: 'MXN',
        name: 'Mexican Peso',
        symbol: '$',
        decimalPlaces: 2,
        isActive: true,
        isSupported: true,
      },
    ];

    for (const currency of defaultCurrencies) {
      this.addCurrency(currency);
    }
  }

  private async fetchExchangeRates(provider: string): Promise<ExchangeRate[]> {
    // This would integrate with real exchange rate APIs
    // For now, return mock data
    const mockRates: ExchangeRate[] = [
      {
        from: 'USD',
        to: 'EUR',
        rate: 0.85,
        timestamp: new Date(),
        provider,
        source: 'api',
      },
      {
        from: 'USD',
        to: 'GBP',
        rate: 0.73,
        timestamp: new Date(),
        provider,
        source: 'api',
      },
      {
        from: 'USD',
        to: 'INR',
        rate: 83.25,
        timestamp: new Date(),
        provider,
        source: 'api',
      },
      {
        from: 'USD',
        to: 'CAD',
        rate: 1.35,
        timestamp: new Date(),
        provider,
        source: 'api',
      },
      {
        from: 'USD',
        to: 'AUD',
        rate: 1.52,
        timestamp: new Date(),
        provider,
        source: 'api',
      },
    ];

    return mockRates;
  }
}

// ============================================================================
// Global Currency Manager Instance
// ============================================================================

export const globalCurrencyManager = new CurrencyManager();
