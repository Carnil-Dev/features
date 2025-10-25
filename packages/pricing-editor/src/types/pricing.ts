import { z } from 'zod';

// ============================================================================
// Pricing Plan Schemas
// ============================================================================

export const PricingTierSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  currency: z.string().default('USD'),
  interval: z.enum(['day', 'week', 'month', 'year']),
  intervalCount: z.number().positive().default(1),
  features: z.array(z.string()),
  limits: z.record(z.string(), z.number().nonnegative()).optional(),
  metadata: z.record(z.string()).optional(),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export const PricingPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tiers: z.array(PricingTierSchema),
  currency: z.string().default('USD'),
  isActive: z.boolean().default(true),
  version: z.string().default('1.0.0'),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.string()).optional(),
});

export const ABTestSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  planA: z.string(), // Plan ID
  planB: z.string(), // Plan ID
  trafficSplit: z.number().min(0).max(1).default(0.5), // 50/50 split
  startDate: z.date(),
  endDate: z.date().optional(),
  isActive: z.boolean().default(true),
  metrics: z.object({
    planAConversions: z.number().default(0),
    planBConversions: z.number().default(0),
    planARevenue: z.number().default(0),
    planBRevenue: z.number().default(0),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GrandfatheringRuleSchema = z.object({
  id: z.string(),
  planId: z.string(),
  customerSegment: z.string(), // e.g., "early-adopters", "enterprise"
  conditions: z.object({
    signupDateBefore: z.date().optional(),
    hasFeature: z.string().optional(),
    customCondition: z.string().optional(),
  }),
  actions: z.object({
    keepCurrentPrice: z.boolean().default(true),
    addBonusFeatures: z.array(z.string()).default([]),
    extendTrial: z.number().optional(), // days
    customDiscount: z.number().optional(), // percentage
  }),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PricingTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['saas', 'ecommerce', 'marketplace', 'api', 'ai', 'custom']),
  template: PricingPlanSchema,
  isPublic: z.boolean().default(false),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type PricingTier = z.infer<typeof PricingTierSchema>;
export type PricingPlan = z.infer<typeof PricingPlanSchema>;
export type ABTest = z.infer<typeof ABTestSchema>;
export type GrandfatheringRule = z.infer<typeof GrandfatheringRuleSchema>;
export type PricingTemplate = z.infer<typeof PricingTemplateSchema>;

// ============================================================================
// Pricing Editor State
// ============================================================================

export interface PricingEditorState {
  currentPlan: PricingPlan | null;
  selectedTier: PricingTier | null;
  isEditing: boolean;
  isPreviewMode: boolean;
  activeABTest: ABTest | null;
  grandfatheringRules: GrandfatheringRule[];
  templates: PricingTemplate[];
  history: PricingPlan[];
  undoStack: PricingPlan[];
  redoStack: PricingPlan[];
}

// ============================================================================
// Drag and Drop Types
// ============================================================================

export interface DragItem {
  type: 'tier' | 'feature' | 'template';
  id: string;
  data: any;
}

export interface DropResult {
  dropEffect: 'move' | 'copy';
  targetId: string;
  position: 'before' | 'after' | 'inside';
}

// ============================================================================
// Pricing Calculator Types
// ============================================================================

export interface PricingCalculation {
  basePrice: number;
  discounts: Array<{
    type: 'percentage' | 'fixed';
    value: number;
    reason: string;
  }>;
  taxes: Array<{
    type: 'vat' | 'sales' | 'gst';
    rate: number;
    amount: number;
  }>;
  total: number;
  breakdown: {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
  };
}

export interface PricingComparison {
  planA: PricingPlan;
  planB: PricingPlan;
  metrics: {
    planARevenue: number;
    planBRevenue: number;
    planAConversions: number;
    planBConversions: number;
    planAConversionRate: number;
    planBConversionRate: number;
    planAARPU: number;
    planBARPU: number;
  };
  recommendation: 'planA' | 'planB' | 'inconclusive';
  confidence: number;
}

// ============================================================================
// Pricing Editor Actions
// ============================================================================

export type PricingEditorAction =
  | { type: 'SET_PLAN'; payload: PricingPlan }
  | { type: 'ADD_TIER'; payload: PricingTier }
  | { type: 'UPDATE_TIER'; payload: { id: string; updates: Partial<PricingTier> } }
  | { type: 'DELETE_TIER'; payload: string }
  | { type: 'REORDER_TIERS'; payload: string[] }
  | { type: 'SET_SELECTED_TIER'; payload: string | null }
  | { type: 'TOGGLE_EDIT_MODE' }
  | { type: 'TOGGLE_PREVIEW_MODE' }
  | { type: 'START_AB_TEST'; payload: ABTest }
  | { type: 'STOP_AB_TEST' }
  | { type: 'ADD_GRANDFATHERING_RULE'; payload: GrandfatheringRule }
  | { type: 'UPDATE_GRANDFATHERING_RULE'; payload: { id: string; updates: Partial<GrandfatheringRule> } }
  | { type: 'DELETE_GRANDFATHERING_RULE'; payload: string }
  | { type: 'SAVE_HISTORY' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' };

// ============================================================================
// Pricing Editor Props
// ============================================================================

export interface PricingEditorProps {
  initialPlan?: PricingPlan;
  onPlanChange?: (plan: PricingPlan) => void;
  onSave?: (plan: PricingPlan) => Promise<void>;
  onPublish?: (plan: PricingPlan) => Promise<void>;
  onABTestStart?: (abTest: ABTest) => Promise<void>;
  onABTestStop?: (abTestId: string) => Promise<void>;
  onGrandfatheringRuleAdd?: (rule: GrandfatheringRule) => Promise<void>;
  onGrandfatheringRuleUpdate?: (ruleId: string, updates: Partial<GrandfatheringRule>) => Promise<void>;
  onGrandfatheringRuleDelete?: (ruleId: string) => Promise<void>;
  templates?: PricingTemplate[];
  onTemplateSelect?: (template: PricingTemplate) => void;
  onTemplateCreate?: (template: Omit<PricingTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  currency?: string;
  supportedCurrencies?: string[];
  features?: string[];
  limits?: string[];
  className?: string;
  style?: React.CSSProperties;
}
