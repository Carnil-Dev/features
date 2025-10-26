'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var zod = require('zod');
var react = require('react');

// src/currencies/currency-manager.ts
var CurrencySchema = zod.z.object({
  code: zod.z.string().length(3),
  // ISO 4217 currency code
  name: zod.z.string(),
  symbol: zod.z.string(),
  decimalPlaces: zod.z.number().min(0).max(4),
  isActive: zod.z.boolean().default(true),
  isSupported: zod.z.boolean().default(true),
  exchangeRate: zod.z.number().positive().optional(),
  lastUpdated: zod.z.date().optional()
});
var ExchangeRateSchema = zod.z.object({
  from: zod.z.string().length(3),
  to: zod.z.string().length(3),
  rate: zod.z.number().positive(),
  timestamp: zod.z.date(),
  provider: zod.z.string(),
  source: zod.z.enum(["api", "manual", "cached"])
});
var CurrencyConversionSchema = zod.z.object({
  amount: zod.z.number().nonnegative(),
  fromCurrency: zod.z.string().length(3),
  toCurrency: zod.z.string().length(3),
  convertedAmount: zod.z.number().nonnegative(),
  exchangeRate: zod.z.number().positive(),
  timestamp: zod.z.date(),
  fees: zod.z.number().nonnegative().default(0),
  totalAmount: zod.z.number().nonnegative()
});
var CurrencyManager = class {
  constructor() {
    this.currencies = /* @__PURE__ */ new Map();
    this.exchangeRates = /* @__PURE__ */ new Map();
    this.initializeDefaultCurrencies();
  }
  // ============================================================================
  // Currency Management
  // ============================================================================
  addCurrency(currency) {
    this.currencies.set(currency.code, currency);
  }
  getCurrency(code) {
    return this.currencies.get(code.toUpperCase()) || null;
  }
  getAllCurrencies() {
    return Array.from(this.currencies.values());
  }
  getSupportedCurrencies() {
    return this.getAllCurrencies().filter((currency) => currency.isSupported);
  }
  getActiveCurrencies() {
    return this.getAllCurrencies().filter((currency) => currency.isActive);
  }
  // ============================================================================
  // Exchange Rate Management
  // ============================================================================
  async updateExchangeRates(provider = "fixer") {
    try {
      const rates = await this.fetchExchangeRates(provider);
      for (const rate of rates) {
        this.exchangeRates.set(`${rate.from}-${rate.to}`, rate);
      }
    } catch (error) {
      console.error("Failed to update exchange rates:", error);
      throw error;
    }
  }
  getExchangeRate(from, to) {
    const key = `${from.toUpperCase()}-${to.toUpperCase()}`;
    return this.exchangeRates.get(key) || null;
  }
  async convertCurrency(amount, fromCurrency, toCurrency, fees = 0) {
    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
      return {
        amount,
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        convertedAmount: amount,
        exchangeRate: 1,
        timestamp: /* @__PURE__ */ new Date(),
        fees,
        totalAmount: amount + fees
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
      totalAmount
    };
  }
  // ============================================================================
  // Currency Formatting
  // ============================================================================
  formatCurrency(amount, currencyCode, locale = "en-US") {
    const currency = this.getCurrency(currencyCode);
    if (!currency) {
      throw new Error(`Currency ${currencyCode} not found`);
    }
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: currency.decimalPlaces,
        maximumFractionDigits: currency.decimalPlaces
      }).format(amount);
    } catch (error) {
      return `${currency.symbol}${amount.toFixed(currency.decimalPlaces)}`;
    }
  }
  parseCurrencyAmount(formattedAmount, currencyCode) {
    const currency = this.getCurrency(currencyCode);
    if (!currency) {
      throw new Error(`Currency ${currencyCode} not found`);
    }
    const cleanAmount = formattedAmount.replace(/[^\d.,-]/g, "");
    return parseFloat(cleanAmount.replace(",", "."));
  }
  // ============================================================================
  // Private Methods
  // ============================================================================
  initializeDefaultCurrencies() {
    const defaultCurrencies = [
      {
        code: "USD",
        name: "US Dollar",
        symbol: "$",
        decimalPlaces: 2,
        isActive: true,
        isSupported: true
      },
      {
        code: "EUR",
        name: "Euro",
        symbol: "\u20AC",
        decimalPlaces: 2,
        isActive: true,
        isSupported: true
      },
      {
        code: "GBP",
        name: "British Pound",
        symbol: "\xA3",
        decimalPlaces: 2,
        isActive: true,
        isSupported: true
      },
      {
        code: "INR",
        name: "Indian Rupee",
        symbol: "\u20B9",
        decimalPlaces: 2,
        isActive: true,
        isSupported: true
      },
      {
        code: "CAD",
        name: "Canadian Dollar",
        symbol: "C$",
        decimalPlaces: 2,
        isActive: true,
        isSupported: true
      },
      {
        code: "AUD",
        name: "Australian Dollar",
        symbol: "A$",
        decimalPlaces: 2,
        isActive: true,
        isSupported: true
      },
      {
        code: "JPY",
        name: "Japanese Yen",
        symbol: "\xA5",
        decimalPlaces: 0,
        isActive: true,
        isSupported: true
      },
      {
        code: "CNY",
        name: "Chinese Yuan",
        symbol: "\xA5",
        decimalPlaces: 2,
        isActive: true,
        isSupported: true
      },
      {
        code: "BRL",
        name: "Brazilian Real",
        symbol: "R$",
        decimalPlaces: 2,
        isActive: true,
        isSupported: true
      },
      {
        code: "MXN",
        name: "Mexican Peso",
        symbol: "$",
        decimalPlaces: 2,
        isActive: true,
        isSupported: true
      }
    ];
    for (const currency of defaultCurrencies) {
      this.addCurrency(currency);
    }
  }
  async fetchExchangeRates(provider) {
    const mockRates = [
      {
        from: "USD",
        to: "EUR",
        rate: 0.85,
        timestamp: /* @__PURE__ */ new Date(),
        provider,
        source: "api"
      },
      {
        from: "USD",
        to: "GBP",
        rate: 0.73,
        timestamp: /* @__PURE__ */ new Date(),
        provider,
        source: "api"
      },
      {
        from: "USD",
        to: "INR",
        rate: 83.25,
        timestamp: /* @__PURE__ */ new Date(),
        provider,
        source: "api"
      },
      {
        from: "USD",
        to: "CAD",
        rate: 1.35,
        timestamp: /* @__PURE__ */ new Date(),
        provider,
        source: "api"
      },
      {
        from: "USD",
        to: "AUD",
        rate: 1.52,
        timestamp: /* @__PURE__ */ new Date(),
        provider,
        source: "api"
      }
    ];
    return mockRates;
  }
};
var globalCurrencyManager = new CurrencyManager();
var TaxJurisdictionSchema = zod.z.object({
  id: zod.z.string(),
  name: zod.z.string(),
  country: zod.z.string().length(2),
  // ISO 3166-1 alpha-2
  region: zod.z.string().optional(),
  city: zod.z.string().optional(),
  postalCode: zod.z.string().optional(),
  taxId: zod.z.string().optional(),
  // Tax ID for the jurisdiction
  isActive: zod.z.boolean().default(true),
  metadata: zod.z.record(zod.z.string()).optional()
});
var TaxRateSchema = zod.z.object({
  id: zod.z.string(),
  jurisdictionId: zod.z.string(),
  name: zod.z.string(),
  rate: zod.z.number().min(0).max(1),
  // Decimal rate (0.1 = 10%)
  type: zod.z.enum(["vat", "sales", "gst", "hst", "pst", "qst", "custom"]),
  isInclusive: zod.z.boolean().default(false),
  // Whether tax is included in price
  isActive: zod.z.boolean().default(true),
  effectiveFrom: zod.z.date(),
  effectiveTo: zod.z.date().optional(),
  metadata: zod.z.record(zod.z.string()).optional()
});
var TaxCalculationSchema = zod.z.object({
  subtotal: zod.z.number().nonnegative(),
  taxes: zod.z.array(zod.z.object({
    jurisdictionId: zod.z.string(),
    taxRateId: zod.z.string(),
    name: zod.z.string(),
    rate: zod.z.number().min(0).max(1),
    amount: zod.z.number().nonnegative(),
    type: zod.z.enum(["vat", "sales", "gst", "hst", "pst", "qst", "custom"])
  })),
  total: zod.z.number().nonnegative(),
  currency: zod.z.string().length(3),
  jurisdiction: zod.z.string(),
  calculatedAt: zod.z.date()
});
var TaxExemptionSchema = zod.z.object({
  customerId: zod.z.string(),
  jurisdictionId: zod.z.string(),
  exemptionType: zod.z.enum(["business", "nonprofit", "government", "educational", "custom"]),
  exemptionNumber: zod.z.string().optional(),
  isActive: zod.z.boolean().default(true),
  validFrom: zod.z.date(),
  validTo: zod.z.date().optional(),
  metadata: zod.z.record(zod.z.string()).optional()
});
var TaxManager = class {
  constructor() {
    this.jurisdictions = /* @__PURE__ */ new Map();
    this.taxRates = /* @__PURE__ */ new Map();
    this.exemptions = /* @__PURE__ */ new Map();
    this.initializeDefaultJurisdictions();
  }
  // ============================================================================
  // Jurisdiction Management
  // ============================================================================
  addJurisdiction(jurisdiction) {
    this.jurisdictions.set(jurisdiction.id, jurisdiction);
  }
  getJurisdiction(id) {
    return this.jurisdictions.get(id) || null;
  }
  getJurisdictionsByCountry(country) {
    return Array.from(this.jurisdictions.values()).filter((j) => j.country === country.toUpperCase() && j.isActive);
  }
  findJurisdictionByLocation(location) {
    const { country, region, city, postalCode } = location;
    for (const jurisdiction of this.jurisdictions.values()) {
      if (jurisdiction.country === country.toUpperCase() && (!region || jurisdiction.region === region) && (!city || jurisdiction.city === city) && (!postalCode || jurisdiction.postalCode === postalCode)) {
        return jurisdiction;
      }
    }
    for (const jurisdiction of this.jurisdictions.values()) {
      if (jurisdiction.country === country.toUpperCase() && !jurisdiction.region && !jurisdiction.city && !jurisdiction.postalCode) {
        return jurisdiction;
      }
    }
    return null;
  }
  // ============================================================================
  // Tax Rate Management
  // ============================================================================
  addTaxRate(taxRate) {
    const existing = this.taxRates.get(taxRate.jurisdictionId) || [];
    this.taxRates.set(taxRate.jurisdictionId, [...existing, taxRate]);
  }
  getTaxRates(jurisdictionId, date = /* @__PURE__ */ new Date()) {
    const rates = this.taxRates.get(jurisdictionId) || [];
    return rates.filter((rate) => {
      if (!rate.isActive) return false;
      if (rate.effectiveFrom > date) return false;
      if (rate.effectiveTo && rate.effectiveTo < date) return false;
      return true;
    });
  }
  getTaxRate(jurisdictionId, type, date = /* @__PURE__ */ new Date()) {
    const rates = this.getTaxRates(jurisdictionId, date);
    return rates.find((rate) => rate.type === type) || null;
  }
  // ============================================================================
  // Tax Calculation
  // ============================================================================
  calculateTax(subtotal, jurisdictionId, customerId, date = /* @__PURE__ */ new Date()) {
    const jurisdiction = this.getJurisdiction(jurisdictionId);
    if (!jurisdiction) {
      throw new Error(`Jurisdiction ${jurisdictionId} not found`);
    }
    if (customerId) {
      const exemptions = this.getCustomerExemptions(customerId, jurisdictionId, date);
      if (exemptions.length > 0) {
        return {
          subtotal,
          taxes: [],
          total: subtotal,
          currency: "USD",
          // This should come from the payment context
          jurisdiction: jurisdiction.name,
          calculatedAt: date
        };
      }
    }
    const taxRates = this.getTaxRates(jurisdictionId, date);
    const taxes = taxRates.map((rate) => ({
      jurisdictionId,
      taxRateId: rate.id,
      name: rate.name,
      rate: rate.rate,
      amount: subtotal * rate.rate,
      type: rate.type
    }));
    const totalTax = taxes.reduce((sum, tax) => sum + tax.amount, 0);
    const total = subtotal + totalTax;
    return {
      subtotal,
      taxes,
      total,
      currency: "USD",
      // This should come from the payment context
      jurisdiction: jurisdiction.name,
      calculatedAt: date
    };
  }
  // ============================================================================
  // Tax Exemption Management
  // ============================================================================
  addExemption(exemption) {
    const existing = this.exemptions.get(exemption.customerId) || [];
    this.exemptions.set(exemption.customerId, [...existing, exemption]);
  }
  getCustomerExemptions(customerId, jurisdictionId, date = /* @__PURE__ */ new Date()) {
    const exemptions = this.exemptions.get(customerId) || [];
    return exemptions.filter((exemption) => {
      if (!exemption.isActive) return false;
      if (exemption.jurisdictionId !== jurisdictionId) return false;
      if (exemption.validFrom > date) return false;
      if (exemption.validTo && exemption.validTo < date) return false;
      return true;
    });
  }
  // ============================================================================
  // Tax Reporting
  // ============================================================================
  generateTaxReport(jurisdictionId, startDate, endDate) {
    const jurisdiction = this.getJurisdiction(jurisdictionId);
    if (!jurisdiction) {
      throw new Error(`Jurisdiction ${jurisdictionId} not found`);
    }
    const mockData = {
      jurisdiction,
      totalSales: 1e5,
      totalTax: 15e3,
      taxBreakdown: [
        { type: "VAT", rate: 0.15, amount: 15e3, sales: 1e5 }
      ],
      period: { start: startDate, end: endDate }
    };
    return mockData;
  }
  // ============================================================================
  // Private Methods
  // ============================================================================
  initializeDefaultJurisdictions() {
    const defaultJurisdictions = [
      {
        id: "us-federal",
        name: "United States Federal",
        country: "US",
        isActive: true
      },
      {
        id: "us-ca",
        name: "California",
        country: "US",
        region: "CA",
        isActive: true
      },
      {
        id: "us-ny",
        name: "New York",
        country: "US",
        region: "NY",
        isActive: true
      },
      {
        id: "us-tx",
        name: "Texas",
        country: "US",
        region: "TX",
        isActive: true
      },
      {
        id: "eu-germany",
        name: "Germany",
        country: "DE",
        isActive: true
      },
      {
        id: "eu-france",
        name: "France",
        country: "FR",
        isActive: true
      },
      {
        id: "eu-uk",
        name: "United Kingdom",
        country: "GB",
        isActive: true
      },
      {
        id: "in-india",
        name: "India",
        country: "IN",
        isActive: true
      },
      {
        id: "ca-canada",
        name: "Canada",
        country: "CA",
        isActive: true
      },
      {
        id: "au-australia",
        name: "Australia",
        country: "AU",
        isActive: true
      }
    ];
    for (const jurisdiction of defaultJurisdictions) {
      this.addJurisdiction(jurisdiction);
    }
    this.initializeDefaultTaxRates();
  }
  initializeDefaultTaxRates() {
    const defaultTaxRates = [
      // US Federal (no sales tax)
      {
        id: "us-federal-sales",
        jurisdictionId: "us-federal",
        name: "Federal Sales Tax",
        rate: 0,
        type: "sales",
        isActive: true,
        isInclusive: false,
        effectiveFrom: /* @__PURE__ */ new Date("2020-01-01")
      },
      // California
      {
        id: "us-ca-sales",
        jurisdictionId: "us-ca",
        name: "California Sales Tax",
        rate: 0.0725,
        type: "sales",
        isActive: true,
        isInclusive: false,
        effectiveFrom: /* @__PURE__ */ new Date("2020-01-01")
      },
      // New York
      {
        id: "us-ny-sales",
        jurisdictionId: "us-ny",
        name: "New York Sales Tax",
        rate: 0.08,
        type: "sales",
        isActive: true,
        isInclusive: false,
        effectiveFrom: /* @__PURE__ */ new Date("2020-01-01")
      },
      // Texas
      {
        id: "us-tx-sales",
        jurisdictionId: "us-tx",
        name: "Texas Sales Tax",
        rate: 0.0625,
        type: "sales",
        isActive: true,
        isInclusive: false,
        effectiveFrom: /* @__PURE__ */ new Date("2020-01-01")
      },
      // Germany
      {
        id: "eu-germany-vat",
        jurisdictionId: "eu-germany",
        name: "German VAT",
        rate: 0.19,
        type: "vat",
        isActive: true,
        isInclusive: true,
        effectiveFrom: /* @__PURE__ */ new Date("2020-01-01")
      },
      // France
      {
        id: "eu-france-vat",
        jurisdictionId: "eu-france",
        name: "French VAT",
        rate: 0.2,
        type: "vat",
        isActive: true,
        isInclusive: true,
        effectiveFrom: /* @__PURE__ */ new Date("2020-01-01")
      },
      // UK
      {
        id: "eu-uk-vat",
        jurisdictionId: "eu-uk",
        name: "UK VAT",
        rate: 0.2,
        type: "vat",
        isActive: true,
        isInclusive: true,
        effectiveFrom: /* @__PURE__ */ new Date("2020-01-01")
      },
      // India
      {
        id: "in-india-gst",
        jurisdictionId: "in-india",
        name: "Indian GST",
        rate: 0.18,
        type: "gst",
        isActive: true,
        isInclusive: false,
        effectiveFrom: /* @__PURE__ */ new Date("2020-01-01")
      },
      // Canada
      {
        id: "ca-canada-gst",
        jurisdictionId: "ca-canada",
        name: "Canadian GST",
        rate: 0.05,
        type: "gst",
        isActive: true,
        isInclusive: false,
        effectiveFrom: /* @__PURE__ */ new Date("2020-01-01")
      },
      // Australia
      {
        id: "au-australia-gst",
        jurisdictionId: "au-australia",
        name: "Australian GST",
        rate: 0.1,
        type: "gst",
        isActive: true,
        isInclusive: false,
        effectiveFrom: /* @__PURE__ */ new Date("2020-01-01")
      }
    ];
    for (const taxRate of defaultTaxRates) {
      this.addTaxRate(taxRate);
    }
  }
};
var globalTaxManager = new TaxManager();
var PaymentMethodSchema = zod.z.object({
  id: zod.z.string(),
  name: zod.z.string(),
  type: zod.z.enum(["card", "bank", "wallet", "upi", "qr", "cash", "crypto", "other"]),
  category: zod.z.enum(["credit", "debit", "prepaid", "bank_transfer", "digital_wallet", "crypto"]),
  isActive: zod.z.boolean().default(true),
  isSupported: zod.z.boolean().default(true),
  countries: zod.z.array(zod.z.string().length(2)),
  // ISO 3166-1 alpha-2
  currencies: zod.z.array(zod.z.string().length(3)),
  // ISO 4217
  minAmount: zod.z.number().nonnegative().optional(),
  maxAmount: zod.z.number().positive().optional(),
  fees: zod.z.object({
    fixed: zod.z.number().nonnegative().default(0),
    percentage: zod.z.number().min(0).max(1).default(0)
    // Decimal rate
  }),
  processingTime: zod.z.enum(["instant", "minutes", "hours", "days"]),
  metadata: zod.z.record(zod.z.string()).optional()
});
var LocalizedPaymentMethodSchema = zod.z.object({
  paymentMethodId: zod.z.string(),
  country: zod.z.string().length(2),
  currency: zod.z.string().length(3),
  displayName: zod.z.string(),
  description: zod.z.string().optional(),
  icon: zod.z.string().optional(),
  // URL or icon identifier
  isPopular: zod.z.boolean().default(false),
  isRecommended: zod.z.boolean().default(false),
  sortOrder: zod.z.number().default(0),
  metadata: zod.z.record(zod.z.string()).optional()
});
var PaymentMethodAvailabilitySchema = zod.z.object({
  country: zod.z.string().length(2),
  currency: zod.z.string().length(3),
  availableMethods: zod.z.array(zod.z.string()),
  popularMethods: zod.z.array(zod.z.string()),
  recommendedMethods: zod.z.array(zod.z.string()),
  lastUpdated: zod.z.date()
});
var PaymentMethodManager = class {
  constructor() {
    this.paymentMethods = /* @__PURE__ */ new Map();
    this.localizedMethods = /* @__PURE__ */ new Map();
    this.availability = /* @__PURE__ */ new Map();
    this.initializeDefaultPaymentMethods();
    this.initializeLocalizedMethods();
  }
  // ============================================================================
  // Payment Method Management
  // ============================================================================
  addPaymentMethod(paymentMethod) {
    this.paymentMethods.set(paymentMethod.id, paymentMethod);
  }
  getPaymentMethod(id) {
    return this.paymentMethods.get(id) || null;
  }
  getAllPaymentMethods() {
    return Array.from(this.paymentMethods.values());
  }
  getSupportedPaymentMethods(country, currency) {
    return this.getAllPaymentMethods().filter((method) => {
      if (!method.isSupported || !method.isActive) return false;
      if (!method.countries.includes(country.toUpperCase())) return false;
      if (!method.currencies.includes(currency.toUpperCase())) return false;
      return true;
    });
  }
  // ============================================================================
  // Localized Payment Methods
  // ============================================================================
  getLocalizedPaymentMethods(country, currency) {
    const key = `${country.toUpperCase()}-${currency.toUpperCase()}`;
    return this.localizedMethods.get(key) || [];
  }
  getPopularPaymentMethods(country, currency) {
    return this.getLocalizedPaymentMethods(country, currency).filter((method) => method.isPopular).sort((a, b) => a.sortOrder - b.sortOrder);
  }
  getRecommendedPaymentMethods(country, currency) {
    return this.getLocalizedPaymentMethods(country, currency).filter((method) => method.isRecommended).sort((a, b) => a.sortOrder - b.sortOrder);
  }
  // ============================================================================
  // Payment Method Availability
  // ============================================================================
  getPaymentMethodAvailability(country, currency) {
    const key = `${country.toUpperCase()}-${currency.toUpperCase()}`;
    return this.availability.get(key) || null;
  }
  updatePaymentMethodAvailability(country, currency, availability) {
    const key = `${country.toUpperCase()}-${currency.toUpperCase()}`;
    this.availability.set(key, availability);
  }
  // ============================================================================
  // Payment Method Selection
  // ============================================================================
  getBestPaymentMethods(country, currency, amount, preferences) {
    const methods = this.getLocalizedPaymentMethods(country, currency);
    const validMethods = methods.filter((method) => {
      const paymentMethod = this.getPaymentMethod(method.paymentMethodId);
      if (!paymentMethod) return false;
      if (paymentMethod.minAmount && amount < paymentMethod.minAmount) return false;
      if (paymentMethod.maxAmount && amount > paymentMethod.maxAmount) return false;
      return true;
    });
    return validMethods.sort((a, b) => {
      const methodA = this.getPaymentMethod(a.paymentMethodId);
      const methodB = this.getPaymentMethod(b.paymentMethodId);
      if (preferences?.instant) {
        if (methodA.processingTime === "instant" && methodB.processingTime !== "instant") return -1;
        if (methodB.processingTime === "instant" && methodA.processingTime !== "instant") return 1;
      }
      if (preferences?.lowFees) {
        const feeA = methodA.fees.fixed + amount * methodA.fees.percentage;
        const feeB = methodB.fees.fixed + amount * methodB.fees.percentage;
        if (feeA !== feeB) return feeA - feeB;
      }
      if (preferences?.popular) {
        if (a.isPopular && !b.isPopular) return -1;
        if (b.isPopular && !a.isPopular) return 1;
      }
      return a.sortOrder - b.sortOrder;
    });
  }
  // ============================================================================
  // Fee Calculation
  // ============================================================================
  calculatePaymentMethodFees(paymentMethodId, amount) {
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
  initializeDefaultPaymentMethods() {
    const defaultMethods = [
      // Credit Cards
      {
        id: "visa",
        name: "Visa",
        type: "card",
        category: "credit",
        isActive: true,
        isSupported: true,
        countries: ["US", "CA", "GB", "DE", "FR", "AU", "IN", "BR", "MX"],
        currencies: ["USD", "CAD", "GBP", "EUR", "AUD", "INR", "BRL", "MXN"],
        fees: { fixed: 0.3, percentage: 0.029 },
        processingTime: "instant"
      },
      {
        id: "mastercard",
        name: "Mastercard",
        type: "card",
        category: "credit",
        isActive: true,
        isSupported: true,
        countries: ["US", "CA", "GB", "DE", "FR", "AU", "IN", "BR", "MX"],
        currencies: ["USD", "CAD", "GBP", "EUR", "AUD", "INR", "BRL", "MXN"],
        fees: { fixed: 0.3, percentage: 0.029 },
        processingTime: "instant"
      },
      {
        id: "amex",
        name: "American Express",
        type: "card",
        category: "credit",
        isActive: true,
        isSupported: true,
        countries: ["US", "CA", "GB", "AU", "IN"],
        currencies: ["USD", "CAD", "GBP", "AUD", "INR"],
        fees: { fixed: 0.3, percentage: 0.035 },
        processingTime: "instant"
      },
      // UPI (India)
      {
        id: "upi",
        name: "UPI",
        type: "upi",
        category: "digital_wallet",
        isActive: true,
        isSupported: true,
        countries: ["IN"],
        currencies: ["INR"],
        fees: { fixed: 0, percentage: 0 },
        processingTime: "instant"
      },
      // PayPal
      {
        id: "paypal",
        name: "PayPal",
        type: "wallet",
        category: "digital_wallet",
        isActive: true,
        isSupported: true,
        countries: ["US", "CA", "GB", "DE", "FR", "AU", "BR", "MX"],
        currencies: ["USD", "CAD", "GBP", "EUR", "AUD", "BRL", "MXN"],
        fees: { fixed: 0.3, percentage: 0.034 },
        processingTime: "instant"
      },
      // Apple Pay
      {
        id: "apple_pay",
        name: "Apple Pay",
        type: "wallet",
        category: "digital_wallet",
        isActive: true,
        isSupported: true,
        countries: ["US", "CA", "GB", "DE", "FR", "AU", "IN", "BR", "MX"],
        currencies: ["USD", "CAD", "GBP", "EUR", "AUD", "INR", "BRL", "MXN"],
        fees: { fixed: 0.3, percentage: 0.029 },
        processingTime: "instant"
      },
      // Google Pay
      {
        id: "google_pay",
        name: "Google Pay",
        type: "wallet",
        category: "digital_wallet",
        isActive: true,
        isSupported: true,
        countries: ["US", "CA", "GB", "DE", "FR", "AU", "IN", "BR", "MX"],
        currencies: ["USD", "CAD", "GBP", "EUR", "AUD", "INR", "BRL", "MXN"],
        fees: { fixed: 0.3, percentage: 0.029 },
        processingTime: "instant"
      },
      // Bank Transfer
      {
        id: "bank_transfer",
        name: "Bank Transfer",
        type: "bank",
        category: "bank_transfer",
        isActive: true,
        isSupported: true,
        countries: ["US", "CA", "GB", "DE", "FR", "AU", "IN", "BR", "MX"],
        currencies: ["USD", "CAD", "GBP", "EUR", "AUD", "INR", "BRL", "MXN"],
        fees: { fixed: 0, percentage: 0 },
        processingTime: "days"
      }
    ];
    for (const method of defaultMethods) {
      this.addPaymentMethod(method);
    }
  }
  initializeLocalizedMethods() {
    this.localizedMethods.set("US-USD", [
      {
        paymentMethodId: "visa",
        country: "US",
        currency: "USD",
        displayName: "Visa",
        description: "Pay with your Visa card",
        isPopular: true,
        isRecommended: true,
        sortOrder: 1
      },
      {
        paymentMethodId: "mastercard",
        country: "US",
        currency: "USD",
        displayName: "Mastercard",
        description: "Pay with your Mastercard",
        isPopular: true,
        isRecommended: true,
        sortOrder: 2
      },
      {
        paymentMethodId: "amex",
        country: "US",
        currency: "USD",
        displayName: "American Express",
        description: "Pay with your Amex card",
        isPopular: false,
        isRecommended: false,
        sortOrder: 3
      },
      {
        paymentMethodId: "apple_pay",
        country: "US",
        currency: "USD",
        displayName: "Apple Pay",
        description: "Pay with Apple Pay",
        isPopular: true,
        isRecommended: true,
        sortOrder: 4
      },
      {
        paymentMethodId: "google_pay",
        country: "US",
        currency: "USD",
        displayName: "Google Pay",
        description: "Pay with Google Pay",
        isPopular: true,
        isRecommended: true,
        sortOrder: 5
      },
      {
        paymentMethodId: "paypal",
        country: "US",
        currency: "USD",
        displayName: "PayPal",
        description: "Pay with PayPal",
        isPopular: true,
        isRecommended: false,
        sortOrder: 6
      }
    ]);
    this.localizedMethods.set("IN-INR", [
      {
        paymentMethodId: "upi",
        country: "IN",
        currency: "INR",
        displayName: "UPI",
        description: "Pay with UPI",
        isPopular: true,
        isRecommended: true,
        sortOrder: 1
      },
      {
        paymentMethodId: "visa",
        country: "IN",
        currency: "INR",
        displayName: "Visa",
        description: "Pay with your Visa card",
        isPopular: true,
        isRecommended: true,
        sortOrder: 2
      },
      {
        paymentMethodId: "mastercard",
        country: "IN",
        currency: "INR",
        displayName: "Mastercard",
        description: "Pay with your Mastercard",
        isPopular: true,
        isRecommended: true,
        sortOrder: 3
      },
      {
        paymentMethodId: "google_pay",
        country: "IN",
        currency: "INR",
        displayName: "Google Pay",
        description: "Pay with Google Pay",
        isPopular: true,
        isRecommended: true,
        sortOrder: 4
      }
    ]);
  }
};
var globalPaymentMethodManager = new PaymentMethodManager();
var AdyenConfigSchema = zod.z.object({
  apiKey: zod.z.string(),
  merchantAccount: zod.z.string(),
  environment: zod.z.enum(["test", "live"]).default("test"),
  clientKey: zod.z.string().optional(),
  webhookSecret: zod.z.string().optional(),
  region: zod.z.enum(["EU", "US", "AU", "APSE"]).default("EU")
});
var AdyenPaymentMethodSchema = zod.z.object({
  type: zod.z.string(),
  name: zod.z.string(),
  isSupported: zod.z.boolean(),
  countries: zod.z.array(zod.z.string()),
  currencies: zod.z.array(zod.z.string()),
  metadata: zod.z.record(zod.z.string()).optional()
});
var AdyenProvider = class {
  // Adyen API client
  constructor(config) {
    this.name = "adyen";
    AdyenConfigSchema.parse(config);
    this.initializeApiClient();
  }
  // ============================================================================
  // Provider Interface Implementation
  // ============================================================================
  async init(config) {
    AdyenConfigSchema.parse(config);
    this.initializeApiClient();
  }
  // ============================================================================
  // Customer Management
  // ============================================================================
  async createCustomer(params) {
    const shopperReference = params.id || `customer_${Date.now()}`;
    return {
      id: shopperReference,
      email: params.email,
      name: params.name,
      metadata: params.metadata || {},
      created: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async retrieveCustomer(_params) {
    throw new Error(
      "Adyen does not support customer retrieval. Store customer data in your own database."
    );
  }
  async updateCustomer(_id, _params) {
    throw new Error(
      "Adyen does not support customer updates. Update customer data in your own database."
    );
  }
  async deleteCustomer(_id) {
    throw new Error(
      "Adyen does not support customer deletion. Delete customer data from your own database."
    );
  }
  async listCustomers(_params) {
    throw new Error(
      "Adyen does not support customer listing. List customers from your own database."
    );
  }
  // ============================================================================
  // Payment Methods
  // ============================================================================
  async createPaymentMethod(_params) {
    throw new Error(
      "Adyen handles payment methods during payment creation. Use createPaymentIntent instead."
    );
  }
  async retrievePaymentMethod(_params) {
    throw new Error("Adyen does not support payment method retrieval.");
  }
  async updatePaymentMethod(_id, _params) {
    throw new Error("Adyen does not support payment method updates.");
  }
  async deletePaymentMethod(_id) {
    throw new Error("Adyen does not support payment method deletion.");
  }
  async listPaymentMethods(_params) {
    throw new Error("Adyen does not support payment method listing.");
  }
  // ============================================================================
  // Payment Intents
  // ============================================================================
  async createPaymentIntent(params) {
    const paymentRequest = {
      amount: {
        currency: params.currency || "USD",
        value: params.amount || 0
      },
      reference: params.id || `payment_${Date.now()}`,
      paymentMethod: params.paymentMethod || {},
      returnUrl: params.returnUrl,
      shopperReference: params.customer,
      metadata: params.metadata || {}
    };
    try {
      const response = await this.apiClient.payments(paymentRequest);
      return {
        id: response.pspReference,
        amount: params.amount,
        currency: params.currency,
        status: this.mapPaymentStatus(response.resultCode),
        clientSecret: response.clientSecret,
        paymentMethod: response.paymentMethod,
        metadata: response.metadata,
        created: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Adyen payment creation failed: ${message}`);
    }
  }
  async retrievePaymentIntent(params) {
    try {
      const response = await this.apiClient.payments.get(params.id);
      return {
        id: response.pspReference,
        amount: response.amount.value,
        currency: response.amount.currency,
        status: this.mapPaymentStatus(response.resultCode),
        paymentMethod: response.paymentMethod,
        metadata: response.metadata,
        created: response.createdAt
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Adyen payment retrieval failed: ${message}`);
    }
  }
  async updatePaymentIntent(_id, _params) {
    throw new Error("Adyen does not support payment updates.");
  }
  async cancelPaymentIntent(id) {
    try {
      const response = await this.apiClient.payments.cancel({
        originalReference: id
      });
      return {
        id: response.pspReference,
        status: "cancelled",
        cancelled: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Adyen payment cancellation failed: ${message}`);
    }
  }
  async listPaymentIntents(_params) {
    throw new Error("Adyen does not support payment listing.");
  }
  // ============================================================================
  // Subscriptions
  // ============================================================================
  async createSubscription(_params) {
    throw new Error(
      "Adyen does not support native subscriptions. Implement using recurring payments."
    );
  }
  async retrieveSubscription(_params) {
    throw new Error("Adyen does not support subscription retrieval.");
  }
  async updateSubscription(_id, _params) {
    throw new Error("Adyen does not support subscription updates.");
  }
  async cancelSubscription(_id) {
    throw new Error("Adyen does not support subscription cancellation.");
  }
  async listSubscriptions(_params) {
    throw new Error("Adyen does not support subscription listing.");
  }
  // ============================================================================
  // Invoices
  // ============================================================================
  async retrieveInvoice(_params) {
    throw new Error("Adyen does not support invoice retrieval.");
  }
  async listInvoices(_params) {
    throw new Error("Adyen does not support invoice listing.");
  }
  // ============================================================================
  // Refunds
  // ============================================================================
  async createRefund(params) {
    try {
      const response = await this.apiClient.payments.refund({
        originalReference: params.payment,
        amount: {
          currency: params.currency,
          value: params.amount
        },
        reference: params.id || `refund_${Date.now()}`
      });
      return {
        id: response.pspReference,
        payment: params.payment,
        amount: params.amount,
        currency: params.currency,
        status: this.mapRefundStatus(response.resultCode),
        created: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Adyen refund creation failed: ${message}`);
    }
  }
  async retrieveRefund(params) {
    try {
      const response = await this.apiClient.payments.get(params.id);
      return {
        id: response.pspReference,
        payment: response.originalReference,
        amount: response.amount.value,
        currency: response.amount.currency,
        status: this.mapRefundStatus(response.resultCode),
        created: response.createdAt
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Adyen refund retrieval failed: ${message}`);
    }
  }
  async listRefunds(_params) {
    throw new Error("Adyen does not support refund listing.");
  }
  // ============================================================================
  // Disputes
  // ============================================================================
  async retrieveDispute(_params) {
    throw new Error("Adyen does not support dispute retrieval.");
  }
  async listDisputes(_params) {
    throw new Error("Adyen does not support dispute listing.");
  }
  // ============================================================================
  // Products and Prices
  // ============================================================================
  async createProduct(_params) {
    throw new Error("Adyen does not support product creation.");
  }
  async retrieveProduct(_params) {
    throw new Error("Adyen does not support product retrieval.");
  }
  async updateProduct(_id, _params) {
    throw new Error("Adyen does not support product updates.");
  }
  async listProducts(_params) {
    throw new Error("Adyen does not support product listing.");
  }
  async createPrice(_params) {
    throw new Error("Adyen does not support price creation.");
  }
  async retrievePrice(_params) {
    throw new Error("Adyen does not support price retrieval.");
  }
  async updatePrice(_id, _params) {
    throw new Error("Adyen does not support price updates.");
  }
  async listPrices(_params) {
    throw new Error("Adyen does not support price listing.");
  }
  // ============================================================================
  // Webhook Handling
  // ============================================================================
  async verifyWebhook(_payload, _signature) {
    return true;
  }
  async parseWebhook(payload) {
    try {
      const event = JSON.parse(payload);
      return {
        id: event.pspReference,
        type: this.mapWebhookEventType(event.eventCode),
        data: event,
        created: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Adyen webhook parsing failed: ${message}`);
    }
  }
  // ============================================================================
  // Private Methods
  // ============================================================================
  initializeApiClient() {
    this.apiClient = {
      payments: {
        async(paymentRequest) {
          return {
            pspReference: `psp_${Date.now()}`,
            resultCode: "Authorised",
            clientSecret: `client_secret_${Date.now()}`,
            paymentMethod: paymentRequest.paymentMethod,
            metadata: paymentRequest.metadata
          };
        },
        get: async (reference) => {
          return {
            pspReference: reference,
            resultCode: "Authorised",
            amount: { value: 1e3, currency: "USD" },
            paymentMethod: {},
            metadata: {},
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          };
        },
        cancel: async (_cancelRequest) => {
          return {
            pspReference: `psp_${Date.now()}`,
            resultCode: "Cancelled"
          };
        },
        refund: async (_refundRequest) => {
          return {
            pspReference: `psp_${Date.now()}`,
            resultCode: "Received"
          };
        }
      }
    };
  }
  mapPaymentStatus(resultCode) {
    const statusMap = {
      Authorised: "succeeded",
      Refused: "failed",
      Cancelled: "cancelled",
      Pending: "processing",
      Received: "processing"
    };
    return statusMap[resultCode] || "unknown";
  }
  mapRefundStatus(resultCode) {
    const statusMap = {
      Received: "processing",
      Authorised: "succeeded",
      Refused: "failed"
    };
    return statusMap[resultCode] || "unknown";
  }
  mapWebhookEventType(eventCode) {
    const eventMap = {
      AUTHORISATION: "payment_intent.succeeded",
      CANCELLATION: "payment_intent.cancelled",
      REFUND: "charge.refunded",
      CAPTURE: "payment_intent.captured"
    };
    return eventMap[eventCode] || "unknown";
  }
};
var GlobalizationManager = class {
  constructor() {
    this.currencyManager = globalCurrencyManager;
    this.taxManager = globalTaxManager;
    this.paymentMethodManager = globalPaymentMethodManager;
  }
  // ============================================================================
  // Currency Operations
  // ============================================================================
  async convertCurrency(amount, fromCurrency, toCurrency, fees = 0) {
    return this.currencyManager.convertCurrency(amount, fromCurrency, toCurrency, fees);
  }
  formatCurrency(amount, currencyCode, locale = "en-US") {
    return this.currencyManager.formatCurrency(amount, currencyCode, locale);
  }
  getSupportedCurrencies() {
    return this.currencyManager.getSupportedCurrencies();
  }
  // ============================================================================
  // Tax Operations
  // ============================================================================
  calculateTax(subtotal, jurisdictionId, customerId, date = /* @__PURE__ */ new Date()) {
    return this.taxManager.calculateTax(subtotal, jurisdictionId, customerId, date);
  }
  findJurisdictionByLocation(location) {
    return this.taxManager.findJurisdictionByLocation(location);
  }
  getTaxRates(jurisdictionId, date = /* @__PURE__ */ new Date()) {
    return this.taxManager.getTaxRates(jurisdictionId, date);
  }
  // ============================================================================
  // Payment Method Operations
  // ============================================================================
  getLocalizedPaymentMethods(country, currency) {
    return this.paymentMethodManager.getLocalizedPaymentMethods(country, currency);
  }
  getBestPaymentMethods(country, currency, amount, preferences) {
    return this.paymentMethodManager.getBestPaymentMethods(country, currency, amount, preferences);
  }
  calculatePaymentMethodFees(paymentMethodId, amount) {
    return this.paymentMethodManager.calculatePaymentMethodFees(paymentMethodId, amount);
  }
  // ============================================================================
  // Combined Operations
  // ============================================================================
  async calculateTotalCost(subtotal, currency, country, customerId, paymentMethodId) {
    const jurisdiction = this.taxManager.findJurisdictionByLocation({ country });
    if (!jurisdiction) {
      throw new Error(`No jurisdiction found for country: ${country}`);
    }
    const taxCalculation = this.taxManager.calculateTax(subtotal, jurisdiction.id, customerId);
    let paymentFees = 0;
    if (paymentMethodId) {
      const fees = this.paymentMethodManager.calculatePaymentMethodFees(paymentMethodId, subtotal);
      paymentFees = fees.total;
    }
    return {
      subtotal,
      tax: taxCalculation.total - subtotal,
      paymentFees,
      total: taxCalculation.total + paymentFees,
      currency,
      jurisdiction: jurisdiction.name,
      breakdown: {
        subtotal,
        tax: taxCalculation.total - subtotal,
        paymentFees,
        total: taxCalculation.total + paymentFees
      }
    };
  }
  // ============================================================================
  // Localization Helpers
  // ============================================================================
  getLocalizedPaymentOptions(country, currency, amount, preferences) {
    const paymentMethods = this.paymentMethodManager.getBestPaymentMethods(
      country,
      currency,
      amount,
      preferences
    );
    return paymentMethods.map((method) => ({
      id: method.paymentMethodId,
      name: method.displayName,
      description: method.description,
      icon: method.icon,
      fees: this.paymentMethodManager.calculatePaymentMethodFees(method.paymentMethodId, amount),
      isPopular: method.isPopular,
      isRecommended: method.isRecommended
    }));
  }
};
var globalGlobalizationManager = new GlobalizationManager();
function useCurrencyConversion(amount, fromCurrency, toCurrency) {
  const [conversion, setConversion] = react.useState(null);
  const [loading, setLoading] = react.useState(false);
  const [error, setError] = react.useState(null);
  react.useEffect(() => {
    if (!amount || !fromCurrency || !toCurrency) return;
    const convert = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await globalGlobalizationManager.convertCurrency(
          amount,
          fromCurrency,
          toCurrency
        );
        setConversion(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Conversion failed");
      } finally {
        setLoading(false);
      }
    };
    convert();
  }, [amount, fromCurrency, toCurrency]);
  return { conversion, loading, error };
}
function useLocalizedPaymentMethods(country, currency, amount) {
  const [paymentMethods, setPaymentMethods] = react.useState([]);
  const [loading, setLoading] = react.useState(false);
  const [error, setError] = react.useState(null);
  react.useEffect(() => {
    if (!country || !currency || !amount) return;
    const fetchPaymentMethods = async () => {
      setLoading(true);
      setError(null);
      try {
        const methods = globalGlobalizationManager.getLocalizedPaymentMethods(country, currency);
        setPaymentMethods(methods);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch payment methods");
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentMethods();
  }, [country, currency, amount]);
  return { paymentMethods, loading, error };
}
function useTaxCalculation(subtotal, country, customerId) {
  const [taxCalculation, setTaxCalculation] = react.useState(null);
  const [loading, setLoading] = react.useState(false);
  const [error, setError] = react.useState(null);
  react.useEffect(() => {
    if (!subtotal || !country) return;
    const calculate = async () => {
      setLoading(true);
      setError(null);
      try {
        const jurisdiction = globalGlobalizationManager.findJurisdictionByLocation({
          country
        });
        if (!jurisdiction) {
          throw new Error(`No jurisdiction found for country: ${country}`);
        }
        const calculation = globalGlobalizationManager.calculateTax(
          subtotal,
          jurisdiction.id,
          customerId
        );
        setTaxCalculation(calculation);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Tax calculation failed");
      } finally {
        setLoading(false);
      }
    };
    calculate();
  }, [subtotal, country, customerId]);
  return { taxCalculation, loading, error };
}
var index_default = GlobalizationManager;

exports.AdyenConfigSchema = AdyenConfigSchema;
exports.AdyenPaymentMethodSchema = AdyenPaymentMethodSchema;
exports.AdyenProvider = AdyenProvider;
exports.CurrencyConversionSchema = CurrencyConversionSchema;
exports.CurrencyManager = CurrencyManager;
exports.CurrencySchema = CurrencySchema;
exports.ExchangeRateSchema = ExchangeRateSchema;
exports.GlobalizationManager = GlobalizationManager;
exports.LocalizedPaymentMethodSchema = LocalizedPaymentMethodSchema;
exports.PaymentMethodAvailabilitySchema = PaymentMethodAvailabilitySchema;
exports.PaymentMethodManager = PaymentMethodManager;
exports.PaymentMethodSchema = PaymentMethodSchema;
exports.TaxCalculationSchema = TaxCalculationSchema;
exports.TaxExemptionSchema = TaxExemptionSchema;
exports.TaxJurisdictionSchema = TaxJurisdictionSchema;
exports.TaxManager = TaxManager;
exports.TaxRateSchema = TaxRateSchema;
exports.default = index_default;
exports.globalCurrencyManager = globalCurrencyManager;
exports.globalGlobalizationManager = globalGlobalizationManager;
exports.globalPaymentMethodManager = globalPaymentMethodManager;
exports.globalTaxManager = globalTaxManager;
exports.useCurrencyConversion = useCurrencyConversion;
exports.useLocalizedPaymentMethods = useLocalizedPaymentMethods;
exports.useTaxCalculation = useTaxCalculation;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map