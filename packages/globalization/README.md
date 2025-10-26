# @carnil/globalization

[![npm version](https://badge.fury.io/js/%40carnil%2Fglobalization.svg)](https://badge.fury.io/js/%40carnil%2Fglobalization)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Globalization tools for Carnil unified payments platform. This package provides comprehensive internationalization features including currency management, tax calculations, localization, and payment method support for global markets.

## Features

- 💱 **Currency Management** - Multi-currency support with real-time exchange rates
- 🏛️ **Tax Management** - Automated tax calculations for different jurisdictions
- 🌍 **Localization** - Payment methods and UI localization for global markets
- 💳 **Payment Methods** - Region-specific payment method support
- 🏦 **Payment Providers** - Integration with regional payment providers
- 📊 **Tax Reporting** - Comprehensive tax reporting and compliance
- 🔄 **Exchange Rates** - Real-time currency conversion

## Installation

```bash
npm install @carnil/globalization
```

## Quick Start

```typescript
import { 
  CurrencyManager, 
  TaxManager, 
  PaymentMethodsManager,
  AdyenProvider 
} from '@carnil/globalization';

// Initialize currency manager
const currencyManager = new CurrencyManager({
  baseCurrency: 'USD',
  exchangeRateProvider: 'fixer' // or 'openexchangerates'
});

// Initialize tax manager
const taxManager = new TaxManager({
  taxProvider: 'avalara', // or 'taxjar'
  defaultTaxRate: 0.08
});

// Initialize payment methods manager
const paymentMethodsManager = new PaymentMethodsManager({
  region: 'EU',
  supportedMethods: ['card', 'sepa', 'ideal', 'sofort']
});

// Convert currency
const convertedAmount = await currencyManager.convertAmount(100, 'USD', 'EUR');

// Calculate tax
const taxCalculation = await taxManager.calculateTax({
  amount: 100,
  currency: 'USD',
  country: 'US',
  state: 'CA',
  taxType: 'sales'
});

// Get available payment methods for region
const paymentMethods = await paymentMethodsManager.getPaymentMethods('DE');
```

## API Reference

### CurrencyManager Class

```typescript
class CurrencyManager {
  constructor(config: CurrencyManagerConfig);
  
  // Currency conversion
  convertAmount(amount: number, fromCurrency: string, toCurrency: string): Promise<number>;
  convertAmountWithRate(amount: number, exchangeRate: number): number;
  
  // Exchange rates
  getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number>;
  getExchangeRates(baseCurrency: string): Promise<ExchangeRates>;
  updateExchangeRates(): Promise<void>;
  
  // Currency formatting
  formatAmount(amount: number, currency: string, locale?: string): string;
  parseAmount(formattedAmount: string, currency: string): number;
  
  // Currency validation
  isValidCurrency(currency: string): boolean;
  getSupportedCurrencies(): string[];
}
```

### TaxManager Class

```typescript
class TaxManager {
  constructor(config: TaxManagerConfig);
  
  // Tax calculation
  calculateTax(request: TaxCalculationRequest): Promise<TaxCalculation>;
  calculateTaxForOrder(order: OrderTaxRequest): Promise<OrderTaxCalculation>;
  
  // Tax rates
  getTaxRate(country: string, state?: string, city?: string): Promise<number>;
  getTaxRates(country: string): Promise<TaxRate[]>;
  
  // Tax reporting
  generateTaxReport(period: string, country?: string): Promise<TaxReport>;
  exportTaxData(format: 'json' | 'csv'): Promise<string>;
  
  // Tax validation
  validateTaxId(taxId: string, country: string): Promise<boolean>;
  getTaxIdFormat(country: string): TaxIdFormat;
}
```

### PaymentMethodsManager Class

```typescript
class PaymentMethodsManager {
  constructor(config: PaymentMethodsConfig);
  
  // Payment method management
  getPaymentMethods(country: string): Promise<PaymentMethod[]>;
  getPaymentMethodDetails(methodId: string): Promise<PaymentMethodDetails>;
  validatePaymentMethod(methodId: string, country: string): Promise<boolean>;
  
  // Regional support
  getSupportedCountries(): string[];
  getSupportedRegions(): Region[];
  isPaymentMethodSupported(methodId: string, country: string): boolean;
  
  // Payment method configuration
  configurePaymentMethod(methodId: string, config: PaymentMethodConfig): Promise<void>;
  getPaymentMethodConfig(methodId: string): Promise<PaymentMethodConfig>;
}
```

### AdyenProvider Class

```typescript
class AdyenProvider {
  constructor(config: AdyenConfig);
  
  // Payment processing
  processPayment(payment: AdyenPaymentRequest): Promise<AdyenPaymentResponse>;
  processRefund(refund: AdyenRefundRequest): Promise<AdyenRefundResponse>;
  
  // Payment methods
  getAvailablePaymentMethods(country: string, currency: string): Promise<AdyenPaymentMethod[]>;
  getPaymentMethodDetails(methodId: string): Promise<AdyenPaymentMethodDetails>;
  
  // Webhooks
  verifyWebhook(payload: string, signature: string): Promise<boolean>;
  parseWebhook(payload: string): Promise<AdyenWebhookEvent>;
}
```

## Types

### CurrencyManagerConfig

```typescript
interface CurrencyManagerConfig {
  baseCurrency: string;
  exchangeRateProvider: 'fixer' | 'openexchangerates' | 'custom';
  apiKey?: string;
  updateInterval?: number; // minutes
  cacheEnabled?: boolean;
  cacheTtl?: number; // seconds
}
```

### TaxManagerConfig

```typescript
interface TaxManagerConfig {
  taxProvider: 'avalara' | 'taxjar' | 'custom';
  apiKey?: string;
  defaultTaxRate?: number;
  enableTaxCalculation?: boolean;
  enableTaxReporting?: boolean;
}
```

### PaymentMethodsConfig

```typescript
interface PaymentMethodsConfig {
  region: 'US' | 'EU' | 'APAC' | 'LATAM' | 'MENA';
  supportedMethods: string[];
  enableLocalMethods?: boolean;
  enableDigitalWallets?: boolean;
  enableBankTransfers?: boolean;
}
```

### ExchangeRates

```typescript
interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}
```

### TaxCalculation

```typescript
interface TaxCalculation {
  amount: number;
  currency: string;
  taxAmount: number;
  taxRate: number;
  taxType: 'sales' | 'vat' | 'gst' | 'hst';
  jurisdiction: {
    country: string;
    state?: string;
    city?: string;
  };
  breakdown?: TaxBreakdown[];
}
```

### PaymentMethod

```typescript
interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'bank_transfer' | 'digital_wallet' | 'local_method';
  supportedCountries: string[];
  supportedCurrencies: string[];
  fees?: {
    percentage?: number;
    fixed?: number;
    currency?: string;
  };
  processingTime?: string;
  minAmount?: number;
  maxAmount?: number;
}
```

## Currency Management

### Basic Currency Operations

```typescript
import { CurrencyManager } from '@carnil/globalization';

const currencyManager = new CurrencyManager({
  baseCurrency: 'USD',
  exchangeRateProvider: 'fixer',
  apiKey: 'your_api_key'
});

// Convert currency
const convertedAmount = await currencyManager.convertAmount(100, 'USD', 'EUR');
console.log(`$100 USD = €${convertedAmount.toFixed(2)} EUR`);

// Get exchange rate
const rate = await currencyManager.getExchangeRate('USD', 'EUR');
console.log(`USD/EUR rate: ${rate}`);

// Format currency
const formatted = currencyManager.formatAmount(1234.56, 'USD', 'en-US');
console.log(formatted); // $1,234.56

// Parse currency
const parsed = currencyManager.parseAmount('$1,234.56', 'USD');
console.log(parsed); // 1234.56
```

### Exchange Rate Management

```typescript
// Get all exchange rates
const rates = await currencyManager.getExchangeRates('USD');
console.log('EUR rate:', rates.rates.EUR);
console.log('GBP rate:', rates.rates.GBP);

// Update exchange rates
await currencyManager.updateExchangeRates();

// Check if currency is supported
const isSupported = currencyManager.isValidCurrency('EUR');
console.log('EUR supported:', isSupported);

// Get supported currencies
const currencies = currencyManager.getSupportedCurrencies();
console.log('Supported currencies:', currencies);
```

## Tax Management

### Tax Calculation

```typescript
import { TaxManager } from '@carnil/globalization';

const taxManager = new TaxManager({
  taxProvider: 'avalara',
  apiKey: 'your_api_key',
  defaultTaxRate: 0.08
});

// Calculate tax for a single item
const taxCalculation = await taxManager.calculateTax({
  amount: 100,
  currency: 'USD',
  country: 'US',
  state: 'CA',
  taxType: 'sales'
});

console.log(`Tax amount: $${taxCalculation.taxAmount}`);
console.log(`Tax rate: ${(taxCalculation.taxRate * 100).toFixed(2)}%`);

// Calculate tax for an order
const orderTax = await taxManager.calculateTaxForOrder({
  items: [
    { amount: 50, quantity: 2, taxCode: 'P0000000' },
    { amount: 25, quantity: 1, taxCode: 'P0000000' }
  ],
  currency: 'USD',
  country: 'US',
  state: 'CA',
  shippingAddress: {
    country: 'US',
    state: 'CA',
    city: 'San Francisco'
  }
});

console.log(`Total tax: $${orderTax.totalTax}`);
```

### Tax Rates and Reporting

```typescript
// Get tax rate for a location
const taxRate = await taxManager.getTaxRate('US', 'CA', 'San Francisco');
console.log(`Tax rate: ${(taxRate * 100).toFixed(2)}%`);

// Get all tax rates for a country
const taxRates = await taxManager.getTaxRates('US');
console.log('US tax rates:', taxRates);

// Generate tax report
const taxReport = await taxManager.generateTaxReport('2024-01', 'US');
console.log('Tax report:', taxReport);

// Export tax data
const taxData = await taxManager.exportTaxData('csv');
console.log('Tax data exported');
```

## Payment Methods

### Regional Payment Methods

```typescript
import { PaymentMethodsManager } from '@carnil/globalization';

const paymentMethodsManager = new PaymentMethodsManager({
  region: 'EU',
  supportedMethods: ['card', 'sepa', 'ideal', 'sofort', 'bancontact']
});

// Get payment methods for a country
const paymentMethods = await paymentMethodsManager.getPaymentMethods('DE');
console.log('Available payment methods in Germany:', paymentMethods);

// Get payment method details
const methodDetails = await paymentMethodsManager.getPaymentMethodDetails('ideal');
console.log('iDEAL details:', methodDetails);

// Check if payment method is supported
const isSupported = paymentMethodsManager.isPaymentMethodSupported('sepa', 'DE');
console.log('SEPA supported in Germany:', isSupported);

// Get supported countries
const countries = paymentMethodsManager.getSupportedCountries();
console.log('Supported countries:', countries);
```

### Payment Method Configuration

```typescript
// Configure payment method
await paymentMethodsManager.configurePaymentMethod('ideal', {
  enabled: true,
  minAmount: 1,
  maxAmount: 10000,
  currencies: ['EUR'],
  countries: ['NL', 'DE', 'BE']
});

// Get payment method configuration
const config = await paymentMethodsManager.getPaymentMethodConfig('ideal');
console.log('iDEAL configuration:', config);
```

## Adyen Integration

### Payment Processing

```typescript
import { AdyenProvider } from '@carnil/globalization';

const adyenProvider = new AdyenProvider({
  apiKey: 'your_api_key',
  merchantAccount: 'your_merchant_account',
  environment: 'test' // or 'live'
});

// Process payment
const paymentResponse = await adyenProvider.processPayment({
  amount: {
    value: 2000,
    currency: 'EUR'
  },
  paymentMethod: {
    type: 'ideal',
    issuer: 'ING'
  },
  reference: 'order_123',
  returnUrl: 'https://your-site.com/return'
});

console.log('Payment result:', paymentResponse.resultCode);

// Process refund
const refundResponse = await adyenProvider.processRefund({
  originalReference: 'payment_123',
  amount: {
    value: 1000,
    currency: 'EUR'
  },
  reference: 'refund_123'
});

console.log('Refund result:', refundResponse.resultCode);
```

### Payment Methods

```typescript
// Get available payment methods
const paymentMethods = await adyenProvider.getAvailablePaymentMethods('NL', 'EUR');
console.log('Available payment methods:', paymentMethods);

// Get payment method details
const methodDetails = await adyenProvider.getPaymentMethodDetails('ideal');
console.log('iDEAL details:', methodDetails);
```

## Configuration

### Environment Variables

```bash
# Currency Management
CURRENCY_BASE=USD
EXCHANGE_RATE_PROVIDER=fixer
EXCHANGE_RATE_API_KEY=your_api_key

# Tax Management
TAX_PROVIDER=avalara
TAX_API_KEY=your_api_key
DEFAULT_TAX_RATE=0.08

# Payment Methods
PAYMENT_REGION=EU
ENABLE_LOCAL_METHODS=true
ENABLE_DIGITAL_WALLETS=true

# Adyen
ADYEN_API_KEY=your_api_key
ADYEN_MERCHANT_ACCOUNT=your_merchant_account
ADYEN_ENVIRONMENT=test
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/Carnil-Dev/carnil-sdk/blob/main/CONTRIBUTING.md) for details.

## License

MIT © [Carnil Team](https://carnil.dev)

## Support

- 📖 [Documentation](https://docs.carnil.dev)
- 💬 [Discord Community](https://discord.gg/carnil)
- 🐛 [Report Issues](https://github.com/Carnil-Dev/carnil-sdk/issues)
- 📧 [Email Support](mailto:hello@carnil.dev)
