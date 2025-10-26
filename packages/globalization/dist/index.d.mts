import { z } from 'zod';
import { PaymentProvider } from '@carnil/core';

declare const CurrencySchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    symbol: z.ZodString;
    decimalPlaces: z.ZodNumber;
    isActive: z.ZodDefault<z.ZodBoolean>;
    isSupported: z.ZodDefault<z.ZodBoolean>;
    exchangeRate: z.ZodOptional<z.ZodNumber>;
    lastUpdated: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    code: string;
    name: string;
    decimalPlaces: number;
    isActive: boolean;
    isSupported: boolean;
    exchangeRate?: number | undefined;
    lastUpdated?: Date | undefined;
}, {
    symbol: string;
    code: string;
    name: string;
    decimalPlaces: number;
    exchangeRate?: number | undefined;
    isActive?: boolean | undefined;
    isSupported?: boolean | undefined;
    lastUpdated?: Date | undefined;
}>;
declare const ExchangeRateSchema: z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
    rate: z.ZodNumber;
    timestamp: z.ZodDate;
    provider: z.ZodString;
    source: z.ZodEnum<["api", "manual", "cached"]>;
}, "strip", z.ZodTypeAny, {
    timestamp: Date;
    rate: number;
    from: string;
    to: string;
    provider: string;
    source: "api" | "manual" | "cached";
}, {
    timestamp: Date;
    rate: number;
    from: string;
    to: string;
    provider: string;
    source: "api" | "manual" | "cached";
}>;
declare const CurrencyConversionSchema: z.ZodObject<{
    amount: z.ZodNumber;
    fromCurrency: z.ZodString;
    toCurrency: z.ZodString;
    convertedAmount: z.ZodNumber;
    exchangeRate: z.ZodNumber;
    timestamp: z.ZodDate;
    fees: z.ZodDefault<z.ZodNumber>;
    totalAmount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    convertedAmount: number;
    exchangeRate: number;
    timestamp: Date;
    fees: number;
    totalAmount: number;
}, {
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    convertedAmount: number;
    exchangeRate: number;
    timestamp: Date;
    totalAmount: number;
    fees?: number | undefined;
}>;
type Currency = z.infer<typeof CurrencySchema>;
type ExchangeRate = z.infer<typeof ExchangeRateSchema>;
type CurrencyConversion = z.infer<typeof CurrencyConversionSchema>;
declare class CurrencyManager {
    private currencies;
    private exchangeRates;
    constructor();
    addCurrency(currency: Currency): void;
    getCurrency(code: string): Currency | null;
    getAllCurrencies(): Currency[];
    getSupportedCurrencies(): Currency[];
    getActiveCurrencies(): Currency[];
    updateExchangeRates(provider?: 'fixer' | 'exchangerate' | 'manual'): Promise<void>;
    getExchangeRate(from: string, to: string): ExchangeRate | null;
    convertCurrency(amount: number, fromCurrency: string, toCurrency: string, fees?: number): Promise<CurrencyConversion>;
    formatCurrency(amount: number, currencyCode: string, locale?: string): string;
    parseCurrencyAmount(formattedAmount: string, currencyCode: string): number;
    private initializeDefaultCurrencies;
    private fetchExchangeRates;
}
declare const globalCurrencyManager: CurrencyManager;

declare const TaxJurisdictionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    country: z.ZodString;
    region: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    taxId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    id: string;
    country: string;
    region?: string | undefined;
    city?: string | undefined;
    postalCode?: string | undefined;
    taxId?: string | undefined;
    metadata?: Record<string, string> | undefined;
}, {
    name: string;
    id: string;
    country: string;
    isActive?: boolean | undefined;
    region?: string | undefined;
    city?: string | undefined;
    postalCode?: string | undefined;
    taxId?: string | undefined;
    metadata?: Record<string, string> | undefined;
}>;
declare const TaxRateSchema: z.ZodObject<{
    id: z.ZodString;
    jurisdictionId: z.ZodString;
    name: z.ZodString;
    rate: z.ZodNumber;
    type: z.ZodEnum<["vat", "sales", "gst", "hst", "pst", "qst", "custom"]>;
    isInclusive: z.ZodDefault<z.ZodBoolean>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    effectiveFrom: z.ZodDate;
    effectiveTo: z.ZodOptional<z.ZodDate>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    type: "custom" | "vat" | "sales" | "gst" | "hst" | "pst" | "qst";
    name: string;
    isActive: boolean;
    jurisdictionId: string;
    rate: number;
    id: string;
    isInclusive: boolean;
    effectiveFrom: Date;
    metadata?: Record<string, string> | undefined;
    effectiveTo?: Date | undefined;
}, {
    type: "custom" | "vat" | "sales" | "gst" | "hst" | "pst" | "qst";
    name: string;
    jurisdictionId: string;
    rate: number;
    id: string;
    effectiveFrom: Date;
    isActive?: boolean | undefined;
    metadata?: Record<string, string> | undefined;
    isInclusive?: boolean | undefined;
    effectiveTo?: Date | undefined;
}>;
declare const TaxCalculationSchema: z.ZodObject<{
    subtotal: z.ZodNumber;
    taxes: z.ZodArray<z.ZodObject<{
        jurisdictionId: z.ZodString;
        taxRateId: z.ZodString;
        name: z.ZodString;
        rate: z.ZodNumber;
        amount: z.ZodNumber;
        type: z.ZodEnum<["vat", "sales", "gst", "hst", "pst", "qst", "custom"]>;
    }, "strip", z.ZodTypeAny, {
        amount: number;
        type: "custom" | "vat" | "sales" | "gst" | "hst" | "pst" | "qst";
        name: string;
        jurisdictionId: string;
        taxRateId: string;
        rate: number;
    }, {
        amount: number;
        type: "custom" | "vat" | "sales" | "gst" | "hst" | "pst" | "qst";
        name: string;
        jurisdictionId: string;
        taxRateId: string;
        rate: number;
    }>, "many">;
    total: z.ZodNumber;
    currency: z.ZodString;
    jurisdiction: z.ZodString;
    calculatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    subtotal: number;
    taxes: {
        amount: number;
        type: "custom" | "vat" | "sales" | "gst" | "hst" | "pst" | "qst";
        name: string;
        jurisdictionId: string;
        taxRateId: string;
        rate: number;
    }[];
    total: number;
    currency: string;
    jurisdiction: string;
    calculatedAt: Date;
}, {
    subtotal: number;
    taxes: {
        amount: number;
        type: "custom" | "vat" | "sales" | "gst" | "hst" | "pst" | "qst";
        name: string;
        jurisdictionId: string;
        taxRateId: string;
        rate: number;
    }[];
    total: number;
    currency: string;
    jurisdiction: string;
    calculatedAt: Date;
}>;
declare const TaxExemptionSchema: z.ZodObject<{
    customerId: z.ZodString;
    jurisdictionId: z.ZodString;
    exemptionType: z.ZodEnum<["business", "nonprofit", "government", "educational", "custom"]>;
    exemptionNumber: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    validFrom: z.ZodDate;
    validTo: z.ZodOptional<z.ZodDate>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    isActive: boolean;
    jurisdictionId: string;
    customerId: string;
    exemptionType: "custom" | "business" | "nonprofit" | "government" | "educational";
    validFrom: Date;
    metadata?: Record<string, string> | undefined;
    exemptionNumber?: string | undefined;
    validTo?: Date | undefined;
}, {
    jurisdictionId: string;
    customerId: string;
    exemptionType: "custom" | "business" | "nonprofit" | "government" | "educational";
    validFrom: Date;
    isActive?: boolean | undefined;
    metadata?: Record<string, string> | undefined;
    exemptionNumber?: string | undefined;
    validTo?: Date | undefined;
}>;
type TaxJurisdiction = z.infer<typeof TaxJurisdictionSchema>;
type TaxRate = z.infer<typeof TaxRateSchema>;
type TaxCalculation = z.infer<typeof TaxCalculationSchema>;
type TaxExemption = z.infer<typeof TaxExemptionSchema>;
declare class TaxManager {
    private jurisdictions;
    private taxRates;
    private exemptions;
    constructor();
    addJurisdiction(jurisdiction: TaxJurisdiction): void;
    getJurisdiction(id: string): TaxJurisdiction | null;
    getJurisdictionsByCountry(country: string): TaxJurisdiction[];
    findJurisdictionByLocation(location: {
        country: string;
        region?: string;
        city?: string;
        postalCode?: string;
    }): TaxJurisdiction | null;
    addTaxRate(taxRate: TaxRate): void;
    getTaxRates(jurisdictionId: string, date?: Date): TaxRate[];
    getTaxRate(jurisdictionId: string, type: TaxRate['type'], date?: Date): TaxRate | null;
    calculateTax(subtotal: number, jurisdictionId: string, customerId?: string, date?: Date): TaxCalculation;
    addExemption(exemption: TaxExemption): void;
    getCustomerExemptions(customerId: string, jurisdictionId: string, date?: Date): TaxExemption[];
    generateTaxReport(jurisdictionId: string, startDate: Date, endDate: Date): {
        jurisdiction: TaxJurisdiction;
        totalSales: number;
        totalTax: number;
        taxBreakdown: Array<{
            type: string;
            rate: number;
            amount: number;
            sales: number;
        }>;
        period: {
            start: Date;
            end: Date;
        };
    };
    private initializeDefaultJurisdictions;
    private initializeDefaultTaxRates;
}
declare const globalTaxManager: TaxManager;

declare const PaymentMethodSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["card", "bank", "wallet", "upi", "qr", "cash", "crypto", "other"]>;
    category: z.ZodEnum<["credit", "debit", "prepaid", "bank_transfer", "digital_wallet", "crypto"]>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    isSupported: z.ZodDefault<z.ZodBoolean>;
    countries: z.ZodArray<z.ZodString, "many">;
    currencies: z.ZodArray<z.ZodString, "many">;
    minAmount: z.ZodOptional<z.ZodNumber>;
    maxAmount: z.ZodOptional<z.ZodNumber>;
    fees: z.ZodObject<{
        fixed: z.ZodDefault<z.ZodNumber>;
        percentage: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        fixed: number;
        percentage: number;
    }, {
        fixed?: number | undefined;
        percentage?: number | undefined;
    }>;
    processingTime: z.ZodEnum<["instant", "minutes", "hours", "days"]>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    fees: {
        fixed: number;
        percentage: number;
    };
    type: "card" | "bank" | "wallet" | "upi" | "qr" | "cash" | "crypto" | "other";
    name: string;
    isActive: boolean;
    isSupported: boolean;
    id: string;
    category: "crypto" | "credit" | "debit" | "prepaid" | "bank_transfer" | "digital_wallet";
    countries: string[];
    currencies: string[];
    processingTime: "instant" | "minutes" | "hours" | "days";
    metadata?: Record<string, string> | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}, {
    fees: {
        fixed?: number | undefined;
        percentage?: number | undefined;
    };
    type: "card" | "bank" | "wallet" | "upi" | "qr" | "cash" | "crypto" | "other";
    name: string;
    id: string;
    category: "crypto" | "credit" | "debit" | "prepaid" | "bank_transfer" | "digital_wallet";
    countries: string[];
    currencies: string[];
    processingTime: "instant" | "minutes" | "hours" | "days";
    isActive?: boolean | undefined;
    isSupported?: boolean | undefined;
    metadata?: Record<string, string> | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}>;
declare const LocalizedPaymentMethodSchema: z.ZodObject<{
    paymentMethodId: z.ZodString;
    country: z.ZodString;
    currency: z.ZodString;
    displayName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    isPopular: z.ZodDefault<z.ZodBoolean>;
    isRecommended: z.ZodDefault<z.ZodBoolean>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    country: string;
    paymentMethodId: string;
    displayName: string;
    isPopular: boolean;
    isRecommended: boolean;
    sortOrder: number;
    metadata?: Record<string, string> | undefined;
    description?: string | undefined;
    icon?: string | undefined;
}, {
    currency: string;
    country: string;
    paymentMethodId: string;
    displayName: string;
    metadata?: Record<string, string> | undefined;
    description?: string | undefined;
    icon?: string | undefined;
    isPopular?: boolean | undefined;
    isRecommended?: boolean | undefined;
    sortOrder?: number | undefined;
}>;
declare const PaymentMethodAvailabilitySchema: z.ZodObject<{
    country: z.ZodString;
    currency: z.ZodString;
    availableMethods: z.ZodArray<z.ZodString, "many">;
    popularMethods: z.ZodArray<z.ZodString, "many">;
    recommendedMethods: z.ZodArray<z.ZodString, "many">;
    lastUpdated: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    lastUpdated: Date;
    currency: string;
    country: string;
    availableMethods: string[];
    popularMethods: string[];
    recommendedMethods: string[];
}, {
    lastUpdated: Date;
    currency: string;
    country: string;
    availableMethods: string[];
    popularMethods: string[];
    recommendedMethods: string[];
}>;
type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
type LocalizedPaymentMethod = z.infer<typeof LocalizedPaymentMethodSchema>;
type PaymentMethodAvailability = z.infer<typeof PaymentMethodAvailabilitySchema>;
declare class PaymentMethodManager {
    private paymentMethods;
    private localizedMethods;
    private availability;
    constructor();
    addPaymentMethod(paymentMethod: PaymentMethod): void;
    getPaymentMethod(id: string): PaymentMethod | null;
    getAllPaymentMethods(): PaymentMethod[];
    getSupportedPaymentMethods(country: string, currency: string): PaymentMethod[];
    getLocalizedPaymentMethods(country: string, currency: string): LocalizedPaymentMethod[];
    getPopularPaymentMethods(country: string, currency: string): LocalizedPaymentMethod[];
    getRecommendedPaymentMethods(country: string, currency: string): LocalizedPaymentMethod[];
    getPaymentMethodAvailability(country: string, currency: string): PaymentMethodAvailability | null;
    updatePaymentMethodAvailability(country: string, currency: string, availability: PaymentMethodAvailability): void;
    getBestPaymentMethods(country: string, currency: string, amount: number, preferences?: {
        instant?: boolean;
        lowFees?: boolean;
        popular?: boolean;
    }): LocalizedPaymentMethod[];
    calculatePaymentMethodFees(paymentMethodId: string, amount: number): {
        fixed: number;
        percentage: number;
        total: number;
    };
    private initializeDefaultPaymentMethods;
    private initializeLocalizedMethods;
}
declare const globalPaymentMethodManager: PaymentMethodManager;

declare const AdyenConfigSchema: z.ZodObject<{
    apiKey: z.ZodString;
    merchantAccount: z.ZodString;
    environment: z.ZodDefault<z.ZodEnum<["test", "live"]>>;
    clientKey: z.ZodOptional<z.ZodString>;
    webhookSecret: z.ZodOptional<z.ZodString>;
    region: z.ZodDefault<z.ZodEnum<["EU", "US", "AU", "APSE"]>>;
}, "strip", z.ZodTypeAny, {
    region: "US" | "AU" | "EU" | "APSE";
    apiKey: string;
    merchantAccount: string;
    environment: "test" | "live";
    clientKey?: string | undefined;
    webhookSecret?: string | undefined;
}, {
    apiKey: string;
    merchantAccount: string;
    region?: "US" | "AU" | "EU" | "APSE" | undefined;
    environment?: "test" | "live" | undefined;
    clientKey?: string | undefined;
    webhookSecret?: string | undefined;
}>;
declare const AdyenPaymentMethodSchema: z.ZodObject<{
    type: z.ZodString;
    name: z.ZodString;
    isSupported: z.ZodBoolean;
    countries: z.ZodArray<z.ZodString, "many">;
    currencies: z.ZodArray<z.ZodString, "many">;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    type: string;
    name: string;
    isSupported: boolean;
    countries: string[];
    currencies: string[];
    metadata?: Record<string, string> | undefined;
}, {
    type: string;
    name: string;
    isSupported: boolean;
    countries: string[];
    currencies: string[];
    metadata?: Record<string, string> | undefined;
}>;
type AdyenConfig = z.infer<typeof AdyenConfigSchema>;
type AdyenPaymentMethod = z.infer<typeof AdyenPaymentMethodSchema>;
declare class AdyenProvider implements PaymentProvider {
    name: string;
    private apiClient;
    constructor(config: AdyenConfig);
    init(config: Record<string, any>): Promise<void>;
    createCustomer(params: any): Promise<any>;
    retrieveCustomer(_params: any): Promise<any>;
    updateCustomer(_id: string, _params: any): Promise<any>;
    deleteCustomer(_id: string): Promise<void>;
    listCustomers(_params?: any): Promise<any[]>;
    createPaymentMethod(_params: any): Promise<any>;
    retrievePaymentMethod(_params: any): Promise<any>;
    updatePaymentMethod(_id: string, _params: any): Promise<any>;
    deletePaymentMethod(_id: string): Promise<void>;
    listPaymentMethods(_params?: any): Promise<any[]>;
    createPaymentIntent(params: any): Promise<any>;
    retrievePaymentIntent(params: any): Promise<any>;
    updatePaymentIntent(_id: string, _params: any): Promise<any>;
    cancelPaymentIntent(id: string): Promise<any>;
    listPaymentIntents(_params?: any): Promise<any[]>;
    createSubscription(_params: any): Promise<any>;
    retrieveSubscription(_params: any): Promise<any>;
    updateSubscription(_id: string, _params: any): Promise<any>;
    cancelSubscription(_id: string): Promise<any>;
    listSubscriptions(_params?: any): Promise<any[]>;
    retrieveInvoice(_params: any): Promise<any>;
    listInvoices(_params?: any): Promise<any[]>;
    createRefund(params: any): Promise<any>;
    retrieveRefund(params: any): Promise<any>;
    listRefunds(_params?: any): Promise<any[]>;
    retrieveDispute(_params: any): Promise<any>;
    listDisputes(_params?: any): Promise<any[]>;
    createProduct(_params: any): Promise<any>;
    retrieveProduct(_params: any): Promise<any>;
    updateProduct(_id: string, _params: any): Promise<any>;
    listProducts(_params?: any): Promise<any[]>;
    createPrice(_params: any): Promise<any>;
    retrievePrice(_params: any): Promise<any>;
    updatePrice(_id: string, _params: any): Promise<any>;
    listPrices(_params?: any): Promise<any[]>;
    verifyWebhook(_payload: string, _signature: string): Promise<boolean>;
    parseWebhook(payload: string): Promise<any>;
    private initializeApiClient;
    private mapPaymentStatus;
    private mapRefundStatus;
    private mapWebhookEventType;
}

declare class GlobalizationManager {
    private currencyManager;
    private taxManager;
    private paymentMethodManager;
    constructor();
    convertCurrency(amount: number, fromCurrency: string, toCurrency: string, fees?: number): Promise<{
        amount: number;
        fromCurrency: string;
        toCurrency: string;
        convertedAmount: number;
        exchangeRate: number;
        timestamp: Date;
        fees: number;
        totalAmount: number;
    }>;
    formatCurrency(amount: number, currencyCode: string, locale?: string): string;
    getSupportedCurrencies(): {
        symbol: string;
        code: string;
        name: string;
        decimalPlaces: number;
        isActive: boolean;
        isSupported: boolean;
        exchangeRate?: number | undefined;
        lastUpdated?: Date | undefined;
    }[];
    calculateTax(subtotal: number, jurisdictionId: string, customerId?: string, date?: Date): {
        subtotal: number;
        taxes: {
            amount: number;
            type: "custom" | "vat" | "sales" | "gst" | "hst" | "pst" | "qst";
            name: string;
            jurisdictionId: string;
            taxRateId: string;
            rate: number;
        }[];
        total: number;
        currency: string;
        jurisdiction: string;
        calculatedAt: Date;
    };
    findJurisdictionByLocation(location: {
        country: string;
        region?: string;
        city?: string;
        postalCode?: string;
    }): {
        name: string;
        isActive: boolean;
        id: string;
        country: string;
        region?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        taxId?: string | undefined;
        metadata?: Record<string, string> | undefined;
    } | null;
    getTaxRates(jurisdictionId: string, date?: Date): {
        type: "custom" | "vat" | "sales" | "gst" | "hst" | "pst" | "qst";
        name: string;
        isActive: boolean;
        jurisdictionId: string;
        rate: number;
        id: string;
        isInclusive: boolean;
        effectiveFrom: Date;
        metadata?: Record<string, string> | undefined;
        effectiveTo?: Date | undefined;
    }[];
    getLocalizedPaymentMethods(country: string, currency: string): {
        currency: string;
        country: string;
        paymentMethodId: string;
        displayName: string;
        isPopular: boolean;
        isRecommended: boolean;
        sortOrder: number;
        metadata?: Record<string, string> | undefined;
        description?: string | undefined;
        icon?: string | undefined;
    }[];
    getBestPaymentMethods(country: string, currency: string, amount: number, preferences?: {
        instant?: boolean;
        lowFees?: boolean;
        popular?: boolean;
    }): {
        currency: string;
        country: string;
        paymentMethodId: string;
        displayName: string;
        isPopular: boolean;
        isRecommended: boolean;
        sortOrder: number;
        metadata?: Record<string, string> | undefined;
        description?: string | undefined;
        icon?: string | undefined;
    }[];
    calculatePaymentMethodFees(paymentMethodId: string, amount: number): {
        fixed: number;
        percentage: number;
        total: number;
    };
    calculateTotalCost(subtotal: number, currency: string, country: string, customerId?: string, paymentMethodId?: string): Promise<{
        subtotal: number;
        tax: number;
        paymentFees: number;
        total: number;
        currency: string;
        jurisdiction: string;
        breakdown: {
            subtotal: number;
            tax: number;
            paymentFees: number;
            total: number;
        };
    }>;
    getLocalizedPaymentOptions(country: string, currency: string, amount: number, preferences?: {
        instant?: boolean;
        lowFees?: boolean;
        popular?: boolean;
    }): {
        id: string;
        name: string;
        description: string | undefined;
        icon: string | undefined;
        fees: {
            fixed: number;
            percentage: number;
            total: number;
        };
        isPopular: boolean;
        isRecommended: boolean;
    }[];
}
declare const globalGlobalizationManager: GlobalizationManager;
declare function useCurrencyConversion(amount: number, fromCurrency: string, toCurrency: string): {
    conversion: any;
    loading: boolean;
    error: string | null;
};
declare function useLocalizedPaymentMethods(country: string, currency: string, amount: number): {
    paymentMethods: any[];
    loading: boolean;
    error: string | null;
};
declare function useTaxCalculation(subtotal: number, country: string, customerId?: string): {
    taxCalculation: any;
    loading: boolean;
    error: string | null;
};

export { type AdyenConfig, AdyenConfigSchema, type AdyenPaymentMethod, AdyenPaymentMethodSchema, AdyenProvider, type Currency, type CurrencyConversion, CurrencyConversionSchema, CurrencyManager, CurrencySchema, type ExchangeRate, ExchangeRateSchema, GlobalizationManager, type LocalizedPaymentMethod, LocalizedPaymentMethodSchema, type PaymentMethod, type PaymentMethodAvailability, PaymentMethodAvailabilitySchema, PaymentMethodManager, PaymentMethodSchema, type TaxCalculation, TaxCalculationSchema, type TaxExemption, TaxExemptionSchema, type TaxJurisdiction, TaxJurisdictionSchema, TaxManager, type TaxRate, TaxRateSchema, GlobalizationManager as default, globalCurrencyManager, globalGlobalizationManager, globalPaymentMethodManager, globalTaxManager, useCurrencyConversion, useLocalizedPaymentMethods, useTaxCalculation };
