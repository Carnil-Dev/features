import { z } from 'zod';

// ============================================================================
// Tax Schemas
// ============================================================================

export const TaxJurisdictionSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string().length(2), // ISO 3166-1 alpha-2
  region: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  taxId: z.string().optional(), // Tax ID for the jurisdiction
  isActive: z.boolean().default(true),
  metadata: z.record(z.string()).optional(),
});

export const TaxRateSchema = z.object({
  id: z.string(),
  jurisdictionId: z.string(),
  name: z.string(),
  rate: z.number().min(0).max(1), // Decimal rate (0.1 = 10%)
  type: z.enum(['vat', 'sales', 'gst', 'hst', 'pst', 'qst', 'custom']),
  isInclusive: z.boolean().default(false), // Whether tax is included in price
  isActive: z.boolean().default(true),
  effectiveFrom: z.date(),
  effectiveTo: z.date().optional(),
  metadata: z.record(z.string()).optional(),
});

export const TaxCalculationSchema = z.object({
  subtotal: z.number().nonnegative(),
  taxes: z.array(z.object({
    jurisdictionId: z.string(),
    taxRateId: z.string(),
    name: z.string(),
    rate: z.number().min(0).max(1),
    amount: z.number().nonnegative(),
    type: z.enum(['vat', 'sales', 'gst', 'hst', 'pst', 'qst', 'custom']),
  })),
  total: z.number().nonnegative(),
  currency: z.string().length(3),
  jurisdiction: z.string(),
  calculatedAt: z.date(),
});

export const TaxExemptionSchema = z.object({
  customerId: z.string(),
  jurisdictionId: z.string(),
  exemptionType: z.enum(['business', 'nonprofit', 'government', 'educational', 'custom']),
  exemptionNumber: z.string().optional(),
  isActive: z.boolean().default(true),
  validFrom: z.date(),
  validTo: z.date().optional(),
  metadata: z.record(z.string()).optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type TaxJurisdiction = z.infer<typeof TaxJurisdictionSchema>;
export type TaxRate = z.infer<typeof TaxRateSchema>;
export type TaxCalculation = z.infer<typeof TaxCalculationSchema>;
export type TaxExemption = z.infer<typeof TaxExemptionSchema>;

// ============================================================================
// Tax Manager
// ============================================================================

export class TaxManager {
  private jurisdictions: Map<string, TaxJurisdiction> = new Map();
  private taxRates: Map<string, TaxRate[]> = new Map();
  private exemptions: Map<string, TaxExemption[]> = new Map();

  constructor() {
    this.initializeDefaultJurisdictions();
  }

  // ============================================================================
  // Jurisdiction Management
  // ============================================================================

  addJurisdiction(jurisdiction: TaxJurisdiction): void {
    this.jurisdictions.set(jurisdiction.id, jurisdiction);
  }

  getJurisdiction(id: string): TaxJurisdiction | null {
    return this.jurisdictions.get(id) || null;
  }

  getJurisdictionsByCountry(country: string): TaxJurisdiction[] {
    return Array.from(this.jurisdictions.values())
      .filter(j => j.country === country.toUpperCase() && j.isActive);
  }

  findJurisdictionByLocation(location: {
    country: string;
    region?: string;
    city?: string;
    postalCode?: string;
  }): TaxJurisdiction | null {
    const { country, region, city, postalCode } = location;
    
    // Try to find exact match first
    for (const jurisdiction of this.jurisdictions.values()) {
      if (
        jurisdiction.country === country.toUpperCase() &&
        (!region || jurisdiction.region === region) &&
        (!city || jurisdiction.city === city) &&
        (!postalCode || jurisdiction.postalCode === postalCode)
      ) {
        return jurisdiction;
      }
    }

    // Fallback to country-level jurisdiction
    for (const jurisdiction of this.jurisdictions.values()) {
      if (
        jurisdiction.country === country.toUpperCase() &&
        !jurisdiction.region &&
        !jurisdiction.city &&
        !jurisdiction.postalCode
      ) {
        return jurisdiction;
      }
    }

    return null;
  }

  // ============================================================================
  // Tax Rate Management
  // ============================================================================

  addTaxRate(taxRate: TaxRate): void {
    const existing = this.taxRates.get(taxRate.jurisdictionId) || [];
    this.taxRates.set(taxRate.jurisdictionId, [...existing, taxRate]);
  }

  getTaxRates(jurisdictionId: string, date: Date = new Date()): TaxRate[] {
    const rates = this.taxRates.get(jurisdictionId) || [];
    return rates.filter(rate => {
      if (!rate.isActive) return false;
      if (rate.effectiveFrom > date) return false;
      if (rate.effectiveTo && rate.effectiveTo < date) return false;
      return true;
    });
  }

  getTaxRate(jurisdictionId: string, type: TaxRate['type'], date: Date = new Date()): TaxRate | null {
    const rates = this.getTaxRates(jurisdictionId, date);
    return rates.find(rate => rate.type === type) || null;
  }

  // ============================================================================
  // Tax Calculation
  // ============================================================================

  calculateTax(
    subtotal: number,
    jurisdictionId: string,
    customerId?: string,
    date: Date = new Date()
  ): TaxCalculation {
    const jurisdiction = this.getJurisdiction(jurisdictionId);
    if (!jurisdiction) {
      throw new Error(`Jurisdiction ${jurisdictionId} not found`);
    }

    // Check for exemptions
    if (customerId) {
      const exemptions = this.getCustomerExemptions(customerId, jurisdictionId, date);
      if (exemptions.length > 0) {
        return {
          subtotal,
          taxes: [],
          total: subtotal,
          currency: 'USD', // This should come from the payment context
          jurisdiction: jurisdiction.name,
          calculatedAt: date,
        };
      }
    }

    const taxRates = this.getTaxRates(jurisdictionId, date);
    const taxes = taxRates.map(rate => ({
      jurisdictionId,
      taxRateId: rate.id,
      name: rate.name,
      rate: rate.rate,
      amount: subtotal * rate.rate,
      type: rate.type,
    }));

    const totalTax = taxes.reduce((sum, tax) => sum + tax.amount, 0);
    const total = subtotal + totalTax;

    return {
      subtotal,
      taxes,
      total,
      currency: 'USD', // This should come from the payment context
      jurisdiction: jurisdiction.name,
      calculatedAt: date,
    };
  }

  // ============================================================================
  // Tax Exemption Management
  // ============================================================================

  addExemption(exemption: TaxExemption): void {
    const existing = this.exemptions.get(exemption.customerId) || [];
    this.exemptions.set(exemption.customerId, [...existing, exemption]);
  }

  getCustomerExemptions(
    customerId: string,
    jurisdictionId: string,
    date: Date = new Date()
  ): TaxExemption[] {
    const exemptions = this.exemptions.get(customerId) || [];
    return exemptions.filter(exemption => {
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

  generateTaxReport(
    jurisdictionId: string,
    startDate: Date,
    endDate: Date
  ): {
    jurisdiction: TaxJurisdiction;
    totalSales: number;
    totalTax: number;
    taxBreakdown: Array<{
      type: string;
      rate: number;
      amount: number;
      sales: number;
    }>;
    period: { start: Date; end: Date };
  } {
    const jurisdiction = this.getJurisdiction(jurisdictionId);
    if (!jurisdiction) {
      throw new Error(`Jurisdiction ${jurisdictionId} not found`);
    }

    // This would integrate with actual transaction data
    // For now, return mock data
    const mockData = {
      jurisdiction,
      totalSales: 100000,
      totalTax: 15000,
      taxBreakdown: [
        { type: 'VAT', rate: 0.15, amount: 15000, sales: 100000 },
      ],
      period: { start: startDate, end: endDate },
    };

    return mockData;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private initializeDefaultJurisdictions(): void {
    const defaultJurisdictions: TaxJurisdiction[] = [
      {
        id: 'us-federal',
        name: 'United States Federal',
        country: 'US',
        isActive: true,
      },
      {
        id: 'us-ca',
        name: 'California',
        country: 'US',
        region: 'CA',
        isActive: true,
      },
      {
        id: 'us-ny',
        name: 'New York',
        country: 'US',
        region: 'NY',
        isActive: true,
      },
      {
        id: 'us-tx',
        name: 'Texas',
        country: 'US',
        region: 'TX',
        isActive: true,
      },
      {
        id: 'eu-germany',
        name: 'Germany',
        country: 'DE',
        isActive: true,
      },
      {
        id: 'eu-france',
        name: 'France',
        country: 'FR',
        isActive: true,
      },
      {
        id: 'eu-uk',
        name: 'United Kingdom',
        country: 'GB',
        isActive: true,
      },
      {
        id: 'in-india',
        name: 'India',
        country: 'IN',
        isActive: true,
      },
      {
        id: 'ca-canada',
        name: 'Canada',
        country: 'CA',
        isActive: true,
      },
      {
        id: 'au-australia',
        name: 'Australia',
        country: 'AU',
        isActive: true,
      },
    ];

    for (const jurisdiction of defaultJurisdictions) {
      this.addJurisdiction(jurisdiction);
    }

    // Add default tax rates
    this.initializeDefaultTaxRates();
  }

  private initializeDefaultTaxRates(): void {
    const defaultTaxRates: TaxRate[] = [
      // US Federal (no sales tax)
      {
        id: 'us-federal-sales',
        jurisdictionId: 'us-federal',
        name: 'Federal Sales Tax',
        rate: 0,
        type: 'sales',
        isActive: true,
        isInclusive: false,
        effectiveFrom: new Date('2020-01-01'),
      },
      // California
      {
        id: 'us-ca-sales',
        jurisdictionId: 'us-ca',
        name: 'California Sales Tax',
        rate: 0.0725,
        type: 'sales',
        isActive: true,
        isInclusive: false,
        effectiveFrom: new Date('2020-01-01'),
      },
      // New York
      {
        id: 'us-ny-sales',
        jurisdictionId: 'us-ny',
        name: 'New York Sales Tax',
        rate: 0.08,
        type: 'sales',
        isActive: true,
        isInclusive: false,
        effectiveFrom: new Date('2020-01-01'),
      },
      // Texas
      {
        id: 'us-tx-sales',
        jurisdictionId: 'us-tx',
        name: 'Texas Sales Tax',
        rate: 0.0625,
        type: 'sales',
        isActive: true,
        isInclusive: false,
        effectiveFrom: new Date('2020-01-01'),
      },
      // Germany
      {
        id: 'eu-germany-vat',
        jurisdictionId: 'eu-germany',
        name: 'German VAT',
        rate: 0.19,
        type: 'vat',
        isActive: true,
        isInclusive: true,
        effectiveFrom: new Date('2020-01-01'),
      },
      // France
      {
        id: 'eu-france-vat',
        jurisdictionId: 'eu-france',
        name: 'French VAT',
        rate: 0.20,
        type: 'vat',
        isActive: true,
        isInclusive: true,
        effectiveFrom: new Date('2020-01-01'),
      },
      // UK
      {
        id: 'eu-uk-vat',
        jurisdictionId: 'eu-uk',
        name: 'UK VAT',
        rate: 0.20,
        type: 'vat',
        isActive: true,
        isInclusive: true,
        effectiveFrom: new Date('2020-01-01'),
      },
      // India
      {
        id: 'in-india-gst',
        jurisdictionId: 'in-india',
        name: 'Indian GST',
        rate: 0.18,
        type: 'gst',
        isActive: true,
        isInclusive: false,
        effectiveFrom: new Date('2020-01-01'),
      },
      // Canada
      {
        id: 'ca-canada-gst',
        jurisdictionId: 'ca-canada',
        name: 'Canadian GST',
        rate: 0.05,
        type: 'gst',
        isActive: true,
        isInclusive: false,
        effectiveFrom: new Date('2020-01-01'),
      },
      // Australia
      {
        id: 'au-australia-gst',
        jurisdictionId: 'au-australia',
        name: 'Australian GST',
        rate: 0.10,
        type: 'gst',
        isActive: true,
        isInclusive: false,
        effectiveFrom: new Date('2020-01-01'),
      },
    ];

    for (const taxRate of defaultTaxRates) {
      this.addTaxRate(taxRate);
    }
  }
}

// ============================================================================
// Global Tax Manager Instance
// ============================================================================

export const globalTaxManager = new TaxManager();
