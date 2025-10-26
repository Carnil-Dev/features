import { z } from 'zod';

// ============================================================================
// Payment Method Schemas
// ============================================================================

export const PaymentMethodSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['card', 'bank', 'wallet', 'upi', 'qr', 'cash', 'crypto', 'other']),
  category: z.enum(['credit', 'debit', 'prepaid', 'bank_transfer', 'digital_wallet', 'crypto']),
  isActive: z.boolean().default(true),
  isSupported: z.boolean().default(true),
  countries: z.array(z.string().length(2)), // ISO 3166-1 alpha-2
  currencies: z.array(z.string().length(3)), // ISO 4217
  minAmount: z.number().nonnegative().optional(),
  maxAmount: z.number().positive().optional(),
  fees: z.object({
    fixed: z.number().nonnegative().default(0),
    percentage: z.number().min(0).max(1).default(0), // Decimal rate
  }),
  processingTime: z.enum(['instant', 'minutes', 'hours', 'days']),
  metadata: z.record(z.string()).optional(),
});

export const LocalizedPaymentMethodSchema = z.object({
  paymentMethodId: z.string(),
  country: z.string().length(2),
  currency: z.string().length(3),
  displayName: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(), // URL or icon identifier
  isPopular: z.boolean().default(false),
  isRecommended: z.boolean().default(false),
  sortOrder: z.number().default(0),
  metadata: z.record(z.string()).optional(),
});

export const PaymentMethodAvailabilitySchema = z.object({
  country: z.string().length(2),
  currency: z.string().length(3),
  availableMethods: z.array(z.string()),
  popularMethods: z.array(z.string()),
  recommendedMethods: z.array(z.string()),
  lastUpdated: z.date(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type LocalizedPaymentMethod = z.infer<typeof LocalizedPaymentMethodSchema>;
export type PaymentMethodAvailability = z.infer<typeof PaymentMethodAvailabilitySchema>;

// ============================================================================
// Payment Method Manager
// ============================================================================

export class PaymentMethodManager {
  private paymentMethods: Map<string, PaymentMethod> = new Map();
  private localizedMethods: Map<string, LocalizedPaymentMethod[]> = new Map();
  private availability: Map<string, PaymentMethodAvailability> = new Map();

  constructor() {
    this.initializeDefaultPaymentMethods();
    this.initializeLocalizedMethods();
  }

  // ============================================================================
  // Payment Method Management
  // ============================================================================

  addPaymentMethod(paymentMethod: PaymentMethod): void {
    this.paymentMethods.set(paymentMethod.id, paymentMethod);
  }

  getPaymentMethod(id: string): PaymentMethod | null {
    return this.paymentMethods.get(id) || null;
  }

  getAllPaymentMethods(): PaymentMethod[] {
    return Array.from(this.paymentMethods.values());
  }

  getSupportedPaymentMethods(country: string, currency: string): PaymentMethod[] {
    return this.getAllPaymentMethods().filter(method => {
      if (!method.isSupported || !method.isActive) return false;
      if (!method.countries.includes(country.toUpperCase())) return false;
      if (!method.currencies.includes(currency.toUpperCase())) return false;
      return true;
    });
  }

  // ============================================================================
  // Localized Payment Methods
  // ============================================================================

  getLocalizedPaymentMethods(country: string, currency: string): LocalizedPaymentMethod[] {
    const key = `${country.toUpperCase()}-${currency.toUpperCase()}`;
    return this.localizedMethods.get(key) || [];
  }

  getPopularPaymentMethods(country: string, currency: string): LocalizedPaymentMethod[] {
    return this.getLocalizedPaymentMethods(country, currency)
      .filter(method => method.isPopular)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getRecommendedPaymentMethods(country: string, currency: string): LocalizedPaymentMethod[] {
    return this.getLocalizedPaymentMethods(country, currency)
      .filter(method => method.isRecommended)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // ============================================================================
  // Payment Method Availability
  // ============================================================================

  getPaymentMethodAvailability(country: string, currency: string): PaymentMethodAvailability | null {
    const key = `${country.toUpperCase()}-${currency.toUpperCase()}`;
    return this.availability.get(key) || null;
  }

  updatePaymentMethodAvailability(
    country: string,
    currency: string,
    availability: PaymentMethodAvailability
  ): void {
    const key = `${country.toUpperCase()}-${currency.toUpperCase()}`;
    this.availability.set(key, availability);
  }

  // ============================================================================
  // Payment Method Selection
  // ============================================================================

  getBestPaymentMethods(
    country: string,
    currency: string,
    amount: number,
    preferences?: {
      instant?: boolean;
      lowFees?: boolean;
      popular?: boolean;
    }
  ): LocalizedPaymentMethod[] {
    const methods = this.getLocalizedPaymentMethods(country, currency);
    
    // Filter by amount constraints
    const validMethods = methods.filter(method => {
      const paymentMethod = this.getPaymentMethod(method.paymentMethodId);
      if (!paymentMethod) return false;
      
      if (paymentMethod.minAmount && amount < paymentMethod.minAmount) return false;
      if (paymentMethod.maxAmount && amount > paymentMethod.maxAmount) return false;
      
      return true;
    });

    // Sort by preferences
    return validMethods.sort((a, b) => {
      const methodA = this.getPaymentMethod(a.paymentMethodId)!;
      const methodB = this.getPaymentMethod(b.paymentMethodId)!;

      // Prefer instant payments
      if (preferences?.instant) {
        if (methodA.processingTime === 'instant' && methodB.processingTime !== 'instant') return -1;
        if (methodB.processingTime === 'instant' && methodA.processingTime !== 'instant') return 1;
      }

      // Prefer low fees
      if (preferences?.lowFees) {
        const feeA = methodA.fees.fixed + (amount * methodA.fees.percentage);
        const feeB = methodB.fees.fixed + (amount * methodB.fees.percentage);
        if (feeA !== feeB) return feeA - feeB;
      }

      // Prefer popular methods
      if (preferences?.popular) {
        if (a.isPopular && !b.isPopular) return -1;
        if (b.isPopular && !a.isPopular) return 1;
      }

      // Default sort by order
      return a.sortOrder - b.sortOrder;
    });
  }

  // ============================================================================
  // Fee Calculation
  // ============================================================================

  calculatePaymentMethodFees(
    paymentMethodId: string,
    amount: number
  ): { fixed: number; percentage: number; total: number } {
    const paymentMethod = this.getPaymentMethod(paymentMethodId);
    if (!paymentMethod) {
      throw new Error(`Payment method ${paymentMethodId} not found`);
    }

    const fixed = paymentMethod.fees.fixed;
    const percentage = amount * paymentMethod.fees.percentage;
    const total = fixed + percentage;

    return { fixed, percentage, total };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private initializeDefaultPaymentMethods(): void {
    const defaultMethods: PaymentMethod[] = [
      // Credit Cards
      {
        id: 'visa',
        name: 'Visa',
        type: 'card',
        category: 'credit',
        isActive: true,
        isSupported: true,
        countries: ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'IN', 'BR', 'MX'],
        currencies: ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'INR', 'BRL', 'MXN'],
        fees: { fixed: 0.30, percentage: 0.029 },
        processingTime: 'instant',
      },
      {
        id: 'mastercard',
        name: 'Mastercard',
        type: 'card',
        category: 'credit',
        isActive: true,
        isSupported: true,
        countries: ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'IN', 'BR', 'MX'],
        currencies: ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'INR', 'BRL', 'MXN'],
        fees: { fixed: 0.30, percentage: 0.029 },
        processingTime: 'instant',
      },
      {
        id: 'amex',
        name: 'American Express',
        type: 'card',
        category: 'credit',
        isActive: true,
        isSupported: true,
        countries: ['US', 'CA', 'GB', 'AU', 'IN'],
        currencies: ['USD', 'CAD', 'GBP', 'AUD', 'INR'],
        fees: { fixed: 0.30, percentage: 0.035 },
        processingTime: 'instant',
      },
      // UPI (India)
      {
        id: 'upi',
        name: 'UPI',
        type: 'upi',
        category: 'digital_wallet',
        isActive: true,
        isSupported: true,
        countries: ['IN'],
        currencies: ['INR'],
        fees: { fixed: 0, percentage: 0 },
        processingTime: 'instant',
      },
      // PayPal
      {
        id: 'paypal',
        name: 'PayPal',
        type: 'wallet',
        category: 'digital_wallet',
        isActive: true,
        isSupported: true,
        countries: ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'BR', 'MX'],
        currencies: ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'BRL', 'MXN'],
        fees: { fixed: 0.30, percentage: 0.034 },
        processingTime: 'instant',
      },
      // Apple Pay
      {
        id: 'apple_pay',
        name: 'Apple Pay',
        type: 'wallet',
        category: 'digital_wallet',
        isActive: true,
        isSupported: true,
        countries: ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'IN', 'BR', 'MX'],
        currencies: ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'INR', 'BRL', 'MXN'],
        fees: { fixed: 0.30, percentage: 0.029 },
        processingTime: 'instant',
      },
      // Google Pay
      {
        id: 'google_pay',
        name: 'Google Pay',
        type: 'wallet',
        category: 'digital_wallet',
        isActive: true,
        isSupported: true,
        countries: ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'IN', 'BR', 'MX'],
        currencies: ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'INR', 'BRL', 'MXN'],
        fees: { fixed: 0.30, percentage: 0.029 },
        processingTime: 'instant',
      },
      // Bank Transfer
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        type: 'bank',
        category: 'bank_transfer',
        isActive: true,
        isSupported: true,
        countries: ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'IN', 'BR', 'MX'],
        currencies: ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'INR', 'BRL', 'MXN'],
        fees: { fixed: 0, percentage: 0 },
        processingTime: 'days',
      },
    ];

    for (const method of defaultMethods) {
      this.addPaymentMethod(method);
    }
  }

  private initializeLocalizedMethods(): void {
    // US - USD
    this.localizedMethods.set('US-USD', [
      {
        paymentMethodId: 'visa',
        country: 'US',
        currency: 'USD',
        displayName: 'Visa',
        description: 'Pay with your Visa card',
        isPopular: true,
        isRecommended: true,
        sortOrder: 1,
      },
      {
        paymentMethodId: 'mastercard',
        country: 'US',
        currency: 'USD',
        displayName: 'Mastercard',
        description: 'Pay with your Mastercard',
        isPopular: true,
        isRecommended: true,
        sortOrder: 2,
      },
      {
        paymentMethodId: 'amex',
        country: 'US',
        currency: 'USD',
        displayName: 'American Express',
        description: 'Pay with your Amex card',
        isPopular: false,
        isRecommended: false,
        sortOrder: 3,
      },
      {
        paymentMethodId: 'apple_pay',
        country: 'US',
        currency: 'USD',
        displayName: 'Apple Pay',
        description: 'Pay with Apple Pay',
        isPopular: true,
        isRecommended: true,
        sortOrder: 4,
      },
      {
        paymentMethodId: 'google_pay',
        country: 'US',
        currency: 'USD',
        displayName: 'Google Pay',
        description: 'Pay with Google Pay',
        isPopular: true,
        isRecommended: true,
        sortOrder: 5,
      },
      {
        paymentMethodId: 'paypal',
        country: 'US',
        currency: 'USD',
        displayName: 'PayPal',
        description: 'Pay with PayPal',
        isPopular: true,
        isRecommended: false,
        sortOrder: 6,
      },
    ]);

    // India - INR
    this.localizedMethods.set('IN-INR', [
      {
        paymentMethodId: 'upi',
        country: 'IN',
        currency: 'INR',
        displayName: 'UPI',
        description: 'Pay with UPI',
        isPopular: true,
        isRecommended: true,
        sortOrder: 1,
      },
      {
        paymentMethodId: 'visa',
        country: 'IN',
        currency: 'INR',
        displayName: 'Visa',
        description: 'Pay with your Visa card',
        isPopular: true,
        isRecommended: true,
        sortOrder: 2,
      },
      {
        paymentMethodId: 'mastercard',
        country: 'IN',
        currency: 'INR',
        displayName: 'Mastercard',
        description: 'Pay with your Mastercard',
        isPopular: true,
        isRecommended: true,
        sortOrder: 3,
      },
      {
        paymentMethodId: 'google_pay',
        country: 'IN',
        currency: 'INR',
        displayName: 'Google Pay',
        description: 'Pay with Google Pay',
        isPopular: true,
        isRecommended: true,
        sortOrder: 4,
      },
    ]);

    // Add more localized methods for other countries...
  }
}

// ============================================================================
// Global Payment Method Manager Instance
// ============================================================================

export const globalPaymentMethodManager = new PaymentMethodManager();
