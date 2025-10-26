import * as react_jsx_runtime from 'react/jsx-runtime';
import { z } from 'zod';
import { ClassValue } from 'clsx';

declare const PricingTierSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    interval: z.ZodEnum<["day", "week", "month", "year"]>;
    intervalCount: z.ZodDefault<z.ZodNumber>;
    features: z.ZodArray<z.ZodString, "many">;
    limits: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    isPopular: z.ZodDefault<z.ZodBoolean>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: "day" | "week" | "month" | "year";
    intervalCount: number;
    features: string[];
    isPopular: boolean;
    isActive: boolean;
    sortOrder: number;
    description?: string | undefined;
    limits?: Record<string, number> | undefined;
    metadata?: Record<string, string> | undefined;
}, {
    id: string;
    name: string;
    price: number;
    interval: "day" | "week" | "month" | "year";
    features: string[];
    description?: string | undefined;
    currency?: string | undefined;
    intervalCount?: number | undefined;
    limits?: Record<string, number> | undefined;
    metadata?: Record<string, string> | undefined;
    isPopular?: boolean | undefined;
    isActive?: boolean | undefined;
    sortOrder?: number | undefined;
}>;
declare const PricingPlanSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    tiers: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        price: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        interval: z.ZodEnum<["day", "week", "month", "year"]>;
        intervalCount: z.ZodDefault<z.ZodNumber>;
        features: z.ZodArray<z.ZodString, "many">;
        limits: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        isPopular: z.ZodDefault<z.ZodBoolean>;
        isActive: z.ZodDefault<z.ZodBoolean>;
        sortOrder: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        price: number;
        currency: string;
        interval: "day" | "week" | "month" | "year";
        intervalCount: number;
        features: string[];
        isPopular: boolean;
        isActive: boolean;
        sortOrder: number;
        description?: string | undefined;
        limits?: Record<string, number> | undefined;
        metadata?: Record<string, string> | undefined;
    }, {
        id: string;
        name: string;
        price: number;
        interval: "day" | "week" | "month" | "year";
        features: string[];
        description?: string | undefined;
        currency?: string | undefined;
        intervalCount?: number | undefined;
        limits?: Record<string, number> | undefined;
        metadata?: Record<string, string> | undefined;
        isPopular?: boolean | undefined;
        isActive?: boolean | undefined;
        sortOrder?: number | undefined;
    }>, "many">;
    currency: z.ZodDefault<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    version: z.ZodDefault<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    currency: string;
    isActive: boolean;
    tiers: {
        id: string;
        name: string;
        price: number;
        currency: string;
        interval: "day" | "week" | "month" | "year";
        intervalCount: number;
        features: string[];
        isPopular: boolean;
        isActive: boolean;
        sortOrder: number;
        description?: string | undefined;
        limits?: Record<string, number> | undefined;
        metadata?: Record<string, string> | undefined;
    }[];
    version: string;
    createdAt: Date;
    updatedAt: Date;
    description?: string | undefined;
    metadata?: Record<string, string> | undefined;
}, {
    id: string;
    name: string;
    tiers: {
        id: string;
        name: string;
        price: number;
        interval: "day" | "week" | "month" | "year";
        features: string[];
        description?: string | undefined;
        currency?: string | undefined;
        intervalCount?: number | undefined;
        limits?: Record<string, number> | undefined;
        metadata?: Record<string, string> | undefined;
        isPopular?: boolean | undefined;
        isActive?: boolean | undefined;
        sortOrder?: number | undefined;
    }[];
    createdAt: Date;
    updatedAt: Date;
    description?: string | undefined;
    currency?: string | undefined;
    metadata?: Record<string, string> | undefined;
    isActive?: boolean | undefined;
    version?: string | undefined;
}>;
declare const ABTestSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    planA: z.ZodString;
    planB: z.ZodString;
    trafficSplit: z.ZodDefault<z.ZodNumber>;
    startDate: z.ZodDate;
    endDate: z.ZodOptional<z.ZodDate>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    metrics: z.ZodObject<{
        planAConversions: z.ZodDefault<z.ZodNumber>;
        planBConversions: z.ZodDefault<z.ZodNumber>;
        planARevenue: z.ZodDefault<z.ZodNumber>;
        planBRevenue: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        planAConversions: number;
        planBConversions: number;
        planARevenue: number;
        planBRevenue: number;
    }, {
        planAConversions?: number | undefined;
        planBConversions?: number | undefined;
        planARevenue?: number | undefined;
        planBRevenue?: number | undefined;
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    planA: string;
    planB: string;
    trafficSplit: number;
    startDate: Date;
    metrics: {
        planAConversions: number;
        planBConversions: number;
        planARevenue: number;
        planBRevenue: number;
    };
    description?: string | undefined;
    endDate?: Date | undefined;
}, {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    planA: string;
    planB: string;
    startDate: Date;
    metrics: {
        planAConversions?: number | undefined;
        planBConversions?: number | undefined;
        planARevenue?: number | undefined;
        planBRevenue?: number | undefined;
    };
    description?: string | undefined;
    isActive?: boolean | undefined;
    trafficSplit?: number | undefined;
    endDate?: Date | undefined;
}>;
declare const GrandfatheringRuleSchema: z.ZodObject<{
    id: z.ZodString;
    planId: z.ZodString;
    customerSegment: z.ZodString;
    conditions: z.ZodObject<{
        signupDateBefore: z.ZodOptional<z.ZodDate>;
        hasFeature: z.ZodOptional<z.ZodString>;
        customCondition: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        signupDateBefore?: Date | undefined;
        hasFeature?: string | undefined;
        customCondition?: string | undefined;
    }, {
        signupDateBefore?: Date | undefined;
        hasFeature?: string | undefined;
        customCondition?: string | undefined;
    }>;
    actions: z.ZodObject<{
        keepCurrentPrice: z.ZodDefault<z.ZodBoolean>;
        addBonusFeatures: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        extendTrial: z.ZodOptional<z.ZodNumber>;
        customDiscount: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        keepCurrentPrice: boolean;
        addBonusFeatures: string[];
        extendTrial?: number | undefined;
        customDiscount?: number | undefined;
    }, {
        keepCurrentPrice?: boolean | undefined;
        addBonusFeatures?: string[] | undefined;
        extendTrial?: number | undefined;
        customDiscount?: number | undefined;
    }>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    planId: string;
    customerSegment: string;
    conditions: {
        signupDateBefore?: Date | undefined;
        hasFeature?: string | undefined;
        customCondition?: string | undefined;
    };
    actions: {
        keepCurrentPrice: boolean;
        addBonusFeatures: string[];
        extendTrial?: number | undefined;
        customDiscount?: number | undefined;
    };
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    planId: string;
    customerSegment: string;
    conditions: {
        signupDateBefore?: Date | undefined;
        hasFeature?: string | undefined;
        customCondition?: string | undefined;
    };
    actions: {
        keepCurrentPrice?: boolean | undefined;
        addBonusFeatures?: string[] | undefined;
        extendTrial?: number | undefined;
        customDiscount?: number | undefined;
    };
    isActive?: boolean | undefined;
}>;
declare const PricingTemplateSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<["saas", "ecommerce", "marketplace", "api", "ai", "custom"]>;
    preview: z.ZodString;
    template: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        tiers: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            price: z.ZodNumber;
            currency: z.ZodDefault<z.ZodString>;
            interval: z.ZodEnum<["day", "week", "month", "year"]>;
            intervalCount: z.ZodDefault<z.ZodNumber>;
            features: z.ZodArray<z.ZodString, "many">;
            limits: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
            metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            isPopular: z.ZodDefault<z.ZodBoolean>;
            isActive: z.ZodDefault<z.ZodBoolean>;
            sortOrder: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            price: number;
            currency: string;
            interval: "day" | "week" | "month" | "year";
            intervalCount: number;
            features: string[];
            isPopular: boolean;
            isActive: boolean;
            sortOrder: number;
            description?: string | undefined;
            limits?: Record<string, number> | undefined;
            metadata?: Record<string, string> | undefined;
        }, {
            id: string;
            name: string;
            price: number;
            interval: "day" | "week" | "month" | "year";
            features: string[];
            description?: string | undefined;
            currency?: string | undefined;
            intervalCount?: number | undefined;
            limits?: Record<string, number> | undefined;
            metadata?: Record<string, string> | undefined;
            isPopular?: boolean | undefined;
            isActive?: boolean | undefined;
            sortOrder?: number | undefined;
        }>, "many">;
        currency: z.ZodDefault<z.ZodString>;
        isActive: z.ZodDefault<z.ZodBoolean>;
        version: z.ZodDefault<z.ZodString>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        currency: string;
        isActive: boolean;
        tiers: {
            id: string;
            name: string;
            price: number;
            currency: string;
            interval: "day" | "week" | "month" | "year";
            intervalCount: number;
            features: string[];
            isPopular: boolean;
            isActive: boolean;
            sortOrder: number;
            description?: string | undefined;
            limits?: Record<string, number> | undefined;
            metadata?: Record<string, string> | undefined;
        }[];
        version: string;
        createdAt: Date;
        updatedAt: Date;
        description?: string | undefined;
        metadata?: Record<string, string> | undefined;
    }, {
        id: string;
        name: string;
        tiers: {
            id: string;
            name: string;
            price: number;
            interval: "day" | "week" | "month" | "year";
            features: string[];
            description?: string | undefined;
            currency?: string | undefined;
            intervalCount?: number | undefined;
            limits?: Record<string, number> | undefined;
            metadata?: Record<string, string> | undefined;
            isPopular?: boolean | undefined;
            isActive?: boolean | undefined;
            sortOrder?: number | undefined;
        }[];
        createdAt: Date;
        updatedAt: Date;
        description?: string | undefined;
        currency?: string | undefined;
        metadata?: Record<string, string> | undefined;
        isActive?: boolean | undefined;
        version?: string | undefined;
    }>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    createdBy: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    category: "custom" | "saas" | "ecommerce" | "marketplace" | "api" | "ai";
    preview: string;
    template: {
        id: string;
        name: string;
        currency: string;
        isActive: boolean;
        tiers: {
            id: string;
            name: string;
            price: number;
            currency: string;
            interval: "day" | "week" | "month" | "year";
            intervalCount: number;
            features: string[];
            isPopular: boolean;
            isActive: boolean;
            sortOrder: number;
            description?: string | undefined;
            limits?: Record<string, number> | undefined;
            metadata?: Record<string, string> | undefined;
        }[];
        version: string;
        createdAt: Date;
        updatedAt: Date;
        description?: string | undefined;
        metadata?: Record<string, string> | undefined;
    };
    isPublic: boolean;
    createdBy: string;
}, {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    category: "custom" | "saas" | "ecommerce" | "marketplace" | "api" | "ai";
    preview: string;
    template: {
        id: string;
        name: string;
        tiers: {
            id: string;
            name: string;
            price: number;
            interval: "day" | "week" | "month" | "year";
            features: string[];
            description?: string | undefined;
            currency?: string | undefined;
            intervalCount?: number | undefined;
            limits?: Record<string, number> | undefined;
            metadata?: Record<string, string> | undefined;
            isPopular?: boolean | undefined;
            isActive?: boolean | undefined;
            sortOrder?: number | undefined;
        }[];
        createdAt: Date;
        updatedAt: Date;
        description?: string | undefined;
        currency?: string | undefined;
        metadata?: Record<string, string> | undefined;
        isActive?: boolean | undefined;
        version?: string | undefined;
    };
    createdBy: string;
    isPublic?: boolean | undefined;
}>;
type PricingTier = z.infer<typeof PricingTierSchema>;
type PricingPlan = z.infer<typeof PricingPlanSchema>;
type ABTest = z.infer<typeof ABTestSchema>;
type GrandfatheringRule = z.infer<typeof GrandfatheringRuleSchema>;
type PricingTemplate = z.infer<typeof PricingTemplateSchema>;
interface PricingEditorState {
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
interface DragItem {
    type: 'tier' | 'feature' | 'template';
    id: string;
    data: any;
}
interface DropResult {
    dropEffect: 'move' | 'copy';
    targetId: string;
    position: 'before' | 'after' | 'inside';
}
interface PricingCalculation {
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
interface PricingComparison {
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
type PricingEditorAction = {
    type: 'SET_PLAN';
    payload: PricingPlan;
} | {
    type: 'ADD_TIER';
    payload: PricingTier;
} | {
    type: 'UPDATE_TIER';
    payload: {
        id: string;
        updates: Partial<PricingTier>;
    };
} | {
    type: 'DELETE_TIER';
    payload: string;
} | {
    type: 'REORDER_TIERS';
    payload: string[];
} | {
    type: 'SET_SELECTED_TIER';
    payload: string | null;
} | {
    type: 'TOGGLE_EDIT_MODE';
} | {
    type: 'TOGGLE_PREVIEW_MODE';
} | {
    type: 'START_AB_TEST';
    payload: ABTest;
} | {
    type: 'STOP_AB_TEST';
} | {
    type: 'ADD_GRANDFATHERING_RULE';
    payload: GrandfatheringRule;
} | {
    type: 'UPDATE_GRANDFATHERING_RULE';
    payload: {
        id: string;
        updates: Partial<GrandfatheringRule>;
    };
} | {
    type: 'DELETE_GRANDFATHERING_RULE';
    payload: string;
} | {
    type: 'SAVE_HISTORY';
} | {
    type: 'UNDO';
} | {
    type: 'REDO';
} | {
    type: 'RESET';
};
interface PricingEditorProps {
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

declare function PricingEditor({ initialPlan, onSave, onPublish, onABTestStart, onABTestStop, onGrandfatheringRuleAdd, onGrandfatheringRuleUpdate, onGrandfatheringRuleDelete, templates, onTemplateSelect, currency, supportedCurrencies, features, limits, className, style, }: PricingEditorProps): react_jsx_runtime.JSX.Element;

interface PricingTierCardProps {
    tier: PricingTier;
    index: number;
    isSelected: boolean;
    isEditing: boolean;
    onSelect: () => void;
    onUpdate: (updates: Partial<PricingTier>) => void;
    onDelete: () => void;
    onReorder: (tierIds: string[]) => void;
}
declare function PricingTierCard({ tier, index: _index, isSelected, isEditing, onSelect, onUpdate, onDelete, onReorder: _onReorder, }: PricingTierCardProps): react_jsx_runtime.JSX.Element;

declare function pricingEditorReducer(state: PricingEditorState, action: PricingEditorAction): PricingEditorState;
declare function createEmptyPlan(): PricingPlan;
declare function createEmptyTier(): PricingTier;
declare function validatePlan(plan: PricingPlan): string[];
declare function calculatePlanMetrics(plan: PricingPlan): {
    totalTiers: number;
    activeTiers: number;
    averagePrice: number;
    priceRange: {
        min: number;
        max: number;
    };
    popularTier: PricingTier | null;
};

declare function cn(...inputs: ClassValue[]): string;

export { type ABTest, ABTestSchema, type DragItem, type DropResult, type GrandfatheringRule, GrandfatheringRuleSchema, type PricingCalculation, type PricingComparison, PricingEditor, type PricingEditorAction, type PricingEditorProps, type PricingEditorState, type PricingPlan, PricingPlanSchema, type PricingTemplate, PricingTemplateSchema, type PricingTier, PricingTierCard, PricingTierSchema, calculatePlanMetrics, cn, createEmptyPlan, createEmptyTier, PricingEditor as default, pricingEditorReducer, validatePlan };
