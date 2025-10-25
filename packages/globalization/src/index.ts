// ============================================================================
// Globalization Package Exports
// ============================================================================

// Currency Management
export * from './currencies/currency-manager';

// Tax Management
export * from './tax/tax-manager';

// Localization
export * from './localization/payment-methods';

// Additional Providers
export * from './providers/adyen-provider';

// ============================================================================
// Main Globalization Manager
// ============================================================================

import { CurrencyManager, globalCurrencyManager } from './currencies/currency-manager';
import { TaxManager, globalTaxManager } from './tax/tax-manager';
import { PaymentMethodManager, globalPaymentMethodManager } from './localization/payment-methods';

export class GlobalizationManager {
  private currencyManager: CurrencyManager;
  private taxManager: TaxManager;
  private paymentMethodManager: PaymentMethodManager;

  constructor() {
    this.currencyManager = globalCurrencyManager;
    this.taxManager = globalTaxManager;
    this.paymentMethodManager = globalPaymentMethodManager;
  }

  // ============================================================================
  // Currency Operations
  // ============================================================================

  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    fees: number = 0
  ) {
    return this.currencyManager.convertCurrency(amount, fromCurrency, toCurrency, fees);
  }

  formatCurrency(amount: number, currencyCode: string, locale: string = 'en-US') {
    return this.currencyManager.formatCurrency(amount, currencyCode, locale);
  }

  getSupportedCurrencies() {
    return this.currencyManager.getSupportedCurrencies();
  }

  // ============================================================================
  // Tax Operations
  // ============================================================================

  calculateTax(
    subtotal: number,
    jurisdictionId: string,
    customerId?: string,
    date: Date = new Date()
  ) {
    return this.taxManager.calculateTax(subtotal, jurisdictionId, customerId, date);
  }

  findJurisdictionByLocation(location: {
    country: string;
    region?: string;
    city?: string;
    postalCode?: string;
  }) {
    return this.taxManager.findJurisdictionByLocation(location);
  }

  getTaxRates(jurisdictionId: string, date: Date = new Date()) {
    return this.taxManager.getTaxRates(jurisdictionId, date);
  }

  // ============================================================================
  // Payment Method Operations
  // ============================================================================

  getLocalizedPaymentMethods(country: string, currency: string) {
    return this.paymentMethodManager.getLocalizedPaymentMethods(country, currency);
  }

  getBestPaymentMethods(
    country: string,
    currency: string,
    amount: number,
    preferences?: {
      instant?: boolean;
      lowFees?: boolean;
      popular?: boolean;
    }
  ) {
    return this.paymentMethodManager.getBestPaymentMethods(country, currency, amount, preferences);
  }

  calculatePaymentMethodFees(paymentMethodId: string, amount: number) {
    return this.paymentMethodManager.calculatePaymentMethodFees(paymentMethodId, amount);
  }

  // ============================================================================
  // Combined Operations
  // ============================================================================

  async calculateTotalCost(
    subtotal: number,
    currency: string,
    country: string,
    customerId?: string,
    paymentMethodId?: string
  ) {
    // Find jurisdiction for tax calculation
    const jurisdiction = this.taxManager.findJurisdictionByLocation({ country });
    if (!jurisdiction) {
      throw new Error(`No jurisdiction found for country: ${country}`);
    }

    // Calculate tax
    const taxCalculation = this.taxManager.calculateTax(
      subtotal,
      jurisdiction.id,
      customerId
    );

    // Calculate payment method fees if provided
    let paymentFees = 0;
    if (paymentMethodId) {
      const fees = this.paymentMethodManager.calculatePaymentMethodFees(
        paymentMethodId,
        subtotal
      );
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
        total: taxCalculation.total + paymentFees,
      },
    };
  }

  // ============================================================================
  // Localization Helpers
  // ============================================================================

  getLocalizedPaymentOptions(
    country: string,
    currency: string,
    amount: number,
    preferences?: {
      instant?: boolean;
      lowFees?: boolean;
      popular?: boolean;
    }
  ) {
    const paymentMethods = this.paymentMethodManager.getBestPaymentMethods(
      country,
      currency,
      amount,
      preferences
    );

    return paymentMethods.map(method => ({
      id: method.paymentMethodId,
      name: method.displayName,
      description: method.description,
      icon: method.icon,
      fees: this.paymentMethodManager.calculatePaymentMethodFees(
        method.paymentMethodId,
        amount
      ),
      isPopular: method.isPopular,
      isRecommended: method.isRecommended,
    }));
  }
}

// ============================================================================
// Global Globalization Manager Instance
// ============================================================================

export const globalGlobalizationManager = new GlobalizationManager();

// ============================================================================
// React Hooks for Globalization
// ============================================================================

import React, { useState, useEffect } from 'react';

export function useCurrencyConversion(
  amount: number,
  fromCurrency: string,
  toCurrency: string
) {
  const [conversion, setConversion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        setError(err instanceof Error ? err.message : 'Conversion failed');
      } finally {
        setLoading(false);
      }
    };

    convert();
  }, [amount, fromCurrency, toCurrency]);

  return { conversion, loading, error };
}

export function useLocalizedPaymentMethods(
  country: string,
  currency: string,
  amount: number
) {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!country || !currency || !amount) return;

    const fetchPaymentMethods = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const methods = globalGlobalizationManager.getLocalizedPaymentMethods(
          country,
          currency
        );
        setPaymentMethods(methods);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch payment methods');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [country, currency, amount]);

  return { paymentMethods, loading, error };
}

export function useTaxCalculation(
  subtotal: number,
  country: string,
  customerId?: string
) {
  const [taxCalculation, setTaxCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subtotal || !country) return;

    const calculate = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const jurisdiction = globalGlobalizationManager.findJurisdictionByLocation({
          country,
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
        setError(err instanceof Error ? err.message : 'Tax calculation failed');
      } finally {
        setLoading(false);
      }
    };

    calculate();
  }, [subtotal, country, customerId]);

  return { taxCalculation, loading, error };
}

// ============================================================================
// Default Export
// ============================================================================

export default GlobalizationManager;
