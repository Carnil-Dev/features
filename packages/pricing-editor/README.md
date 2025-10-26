# @carnil/pricing-editor

[![npm version](https://badge.fury.io/js/%40carnil%2Fpricing-editor.svg)](https://badge.fury.io/js/%40carnil%2Fpricing-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Pricing editor component for Carnil unified payments platform. This package provides a comprehensive pricing management system with visual editors, A/B testing, grandfathering, and template management.

## Features

- 🎨 **Visual Pricing Editor** - Drag-and-drop pricing tier management
- 🧪 **A/B Testing** - Built-in A/B testing for pricing strategies
- 👴 **Grandfathering** - Legacy pricing management for existing customers
- 📊 **Pricing Calculator** - Real-time pricing calculations
- 🎯 **Template System** - Pre-built pricing templates
- 📱 **Responsive Design** - Mobile-friendly pricing editor
- 🔄 **Real-time Preview** - Live pricing preview as you edit

## Installation

```bash
npm install @carnil/pricing-editor
```

## Peer Dependencies

```bash
npm install react react-dom framer-motion lucide-react react-dnd react-dnd-html5-backend
```

## Quick Start

```tsx
import {
  PricingEditor,
  PricingCalculator,
  ABTestPanel,
  GrandfatheringPanel,
} from "@carnil/pricing-editor";

function PricingPage() {
  const [pricing, setPricing] = useState({
    tiers: [
      {
        id: "basic",
        name: "Basic",
        price: 9,
        currency: "USD",
        interval: "month",
        features: ["Feature 1", "Feature 2"],
      },
      {
        id: "pro",
        name: "Pro",
        price: 29,
        currency: "USD",
        interval: "month",
        features: ["All Basic features", "Feature 3", "Feature 4"],
      },
    ],
  });

  return (
    <div>
      <PricingEditor
        pricing={pricing}
        onChange={setPricing}
        currency="USD"
        showPreview={true}
      />

      <PricingCalculator
        pricing={pricing}
        onCalculate={(calculation) => console.log(calculation)}
      />
    </div>
  );
}
```

## API Reference

### PricingEditor Component

```tsx
interface PricingEditorProps {
  pricing: PricingPlan;
  onChange: (pricing: PricingPlan) => void;
  currency?: string;
  showPreview?: boolean;
  enableABTesting?: boolean;
  enableGrandfathering?: boolean;
  templates?: PricingTemplate[];
  onTemplateSelect?: (template: PricingTemplate) => void;
}
```

### PricingCalculator Component

```tsx
interface PricingCalculatorProps {
  pricing: PricingPlan;
  onCalculate: (calculation: PricingCalculation) => void;
  defaultUsage?: UsageMetrics;
  showBreakdown?: boolean;
  currency?: string;
}
```

### ABTestPanel Component

```tsx
interface ABTestPanelProps {
  pricing: PricingPlan;
  onChange: (pricing: PricingPlan) => void;
  onTestCreate: (test: ABTest) => void;
  activeTests?: ABTest[];
  onTestUpdate?: (test: ABTest) => void;
  onTestDelete?: (testId: string) => void;
}
```

### GrandfatheringPanel Component

```tsx
interface GrandfatheringPanelProps {
  pricing: PricingPlan;
  onChange: (pricing: PricingPlan) => void;
  grandfatheringRules?: GrandfatheringRule[];
  onRuleCreate?: (rule: GrandfatheringRule) => void;
  onRuleUpdate?: (rule: GrandfatheringRule) => void;
  onRuleDelete?: (ruleId: string) => void;
}
```

## Types

### PricingPlan

```typescript
interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  tiers: PricingTier[];
  currency: string;
  billingInterval: "month" | "year";
  features: PricingFeature[];
  metadata?: Record<string, any>;
}
```

### PricingTier

```typescript
interface PricingTier {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
  limits?: {
    maxUsers?: number;
    maxStorage?: number;
    maxApiCalls?: number;
  };
  popular?: boolean;
  ctaText?: string;
  metadata?: Record<string, any>;
}
```

### PricingFeature

```typescript
interface PricingFeature {
  id: string;
  name: string;
  description?: string;
  type: "boolean" | "numeric" | "text";
  value?: any;
  includedInTiers: string[];
  metadata?: Record<string, any>;
}
```

### PricingTemplate

```typescript
interface PricingTemplate {
  id: string;
  name: string;
  description: string;
  category: "saas" | "ecommerce" | "marketplace" | "api" | "custom";
  pricing: PricingPlan;
  preview?: string;
  tags?: string[];
}
```

### ABTest

```typescript
interface ABTest {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "running" | "paused" | "completed";
  variants: {
    control: PricingPlan;
    variant: PricingPlan;
  };
  trafficSplit: number; // 0-100
  startDate?: Date;
  endDate?: Date;
  metrics: {
    conversionRate?: number;
    revenue?: number;
    churnRate?: number;
  };
  results?: ABTestResults;
}
```

### GrandfatheringRule

```typescript
interface GrandfatheringRule {
  id: string;
  name: string;
  description?: string;
  conditions: {
    customerSegment?: string;
    signupDate?: {
      before: Date;
    };
    currentPlan?: string;
  };
  pricing: PricingPlan;
  effectiveDate: Date;
  expirationDate?: Date;
  status: "active" | "inactive" | "expired";
}
```

## Components

### PricingEditor

The main pricing editor component with drag-and-drop functionality.

```tsx
import { PricingEditor } from "@carnil/pricing-editor";

function MyPricingEditor() {
  const [pricing, setPricing] = useState<PricingPlan>({
    id: "my-plan",
    name: "My Pricing Plan",
    tiers: [],
    currency: "USD",
    billingInterval: "month",
    features: [],
  });

  return (
    <PricingEditor
      pricing={pricing}
      onChange={setPricing}
      currency="USD"
      showPreview={true}
      enableABTesting={true}
      enableGrandfathering={true}
      templates={[
        {
          id: "saas-starter",
          name: "SaaS Starter",
          description: "Perfect for small teams",
          category: "saas",
          pricing: {
            // ... template pricing
          },
        },
      ]}
      onTemplateSelect={(template) => {
        setPricing(template.pricing);
      }}
    />
  );
}
```

### PricingCalculator

Real-time pricing calculator with usage-based calculations.

```tsx
import { PricingCalculator } from "@carnil/pricing-editor";

function MyPricingCalculator() {
  const [pricing, setPricing] = useState<PricingPlan>(/* ... */);

  const handleCalculate = (calculation: PricingCalculation) => {
    console.log("Pricing calculation:", calculation);
  };

  return (
    <PricingCalculator
      pricing={pricing}
      onCalculate={handleCalculate}
      defaultUsage={{
        users: 10,
        storage: 1000, // GB
        apiCalls: 10000,
      }}
      showBreakdown={true}
      currency="USD"
    />
  );
}
```

### ABTestPanel

A/B testing management panel for pricing strategies.

```tsx
import { ABTestPanel } from "@carnil/pricing-editor";

function MyABTestPanel() {
  const [pricing, setPricing] = useState<PricingPlan>(/* ... */);
  const [activeTests, setActiveTests] = useState<ABTest[]>([]);

  const handleTestCreate = (test: ABTest) => {
    setActiveTests([...activeTests, test]);
  };

  const handleTestUpdate = (test: ABTest) => {
    setActiveTests(activeTests.map((t) => (t.id === test.id ? test : t)));
  };

  const handleTestDelete = (testId: string) => {
    setActiveTests(activeTests.filter((t) => t.id !== testId));
  };

  return (
    <ABTestPanel
      pricing={pricing}
      onChange={setPricing}
      onTestCreate={handleTestCreate}
      activeTests={activeTests}
      onTestUpdate={handleTestUpdate}
      onTestDelete={handleTestDelete}
    />
  );
}
```

### GrandfatheringPanel

Grandfathering rules management for existing customers.

```tsx
import { GrandfatheringPanel } from "@carnil/pricing-editor";

function MyGrandfatheringPanel() {
  const [pricing, setPricing] = useState<PricingPlan>(/* ... */);
  const [grandfatheringRules, setGrandfatheringRules] = useState<
    GrandfatheringRule[]
  >([]);

  const handleRuleCreate = (rule: GrandfatheringRule) => {
    setGrandfatheringRules([...grandfatheringRules, rule]);
  };

  const handleRuleUpdate = (rule: GrandfatheringRule) => {
    setGrandfatheringRules(
      grandfatheringRules.map((r) => (r.id === rule.id ? rule : r))
    );
  };

  const handleRuleDelete = (ruleId: string) => {
    setGrandfatheringRules(grandfatheringRules.filter((r) => r.id !== ruleId));
  };

  return (
    <GrandfatheringPanel
      pricing={pricing}
      onChange={setPricing}
      grandfatheringRules={grandfatheringRules}
      onRuleCreate={handleRuleCreate}
      onRuleUpdate={handleRuleUpdate}
      onRuleDelete={handleRuleDelete}
    />
  );
}
```

## Pricing Templates

### Pre-built Templates

```typescript
import { PricingTemplate } from "@carnil/pricing-editor";

const saasTemplates: PricingTemplate[] = [
  {
    id: "saas-starter",
    name: "SaaS Starter",
    description: "Perfect for small teams getting started",
    category: "saas",
    pricing: {
      id: "starter",
      name: "Starter Plan",
      tiers: [
        {
          id: "basic",
          name: "Basic",
          price: 9,
          currency: "USD",
          interval: "month",
          features: ["Up to 5 users", "10GB storage", "Basic support"],
        },
        {
          id: "pro",
          name: "Pro",
          price: 29,
          currency: "USD",
          interval: "month",
          features: ["Up to 25 users", "100GB storage", "Priority support"],
          popular: true,
        },
        {
          id: "enterprise",
          name: "Enterprise",
          price: 99,
          currency: "USD",
          interval: "month",
          features: ["Unlimited users", "Unlimited storage", "24/7 support"],
        },
      ],
      currency: "USD",
      billingInterval: "month",
      features: [],
    },
  },
];
```

## A/B Testing

### Creating A/B Tests

```typescript
import { ABTest } from "@carnil/pricing-editor";

const abTest: ABTest = {
  id: "pricing-test-1",
  name: "Pricing Page A/B Test",
  description: "Testing different pricing strategies",
  status: "draft",
  variants: {
    control: {
      // Original pricing
      id: "control",
      name: "Control",
      tiers: [
        {
          id: "basic",
          name: "Basic",
          price: 9,
          currency: "USD",
          interval: "month",
          features: [],
        },
      ],
      currency: "USD",
      billingInterval: "month",
      features: [],
    },
    variant: {
      // New pricing
      id: "variant",
      name: "Variant",
      tiers: [
        {
          id: "basic",
          name: "Basic",
          price: 7,
          currency: "USD",
          interval: "month",
          features: [],
        },
      ],
      currency: "USD",
      billingInterval: "month",
      features: [],
    },
  },
  trafficSplit: 50, // 50% traffic to variant
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  metrics: {},
};
```

## Grandfathering

### Creating Grandfathering Rules

```typescript
import { GrandfatheringRule } from "@carnil/pricing-editor";

const grandfatheringRule: GrandfatheringRule = {
  id: "legacy-customers",
  name: "Legacy Customer Pricing",
  description: "Special pricing for customers who signed up before 2024",
  conditions: {
    signupDate: {
      before: new Date("2024-01-01"),
    },
    currentPlan: "legacy-plan",
  },
  pricing: {
    id: "legacy-pricing",
    name: "Legacy Pricing",
    tiers: [
      {
        id: "legacy-basic",
        name: "Legacy Basic",
        price: 5, // Reduced price for legacy customers
        currency: "USD",
        interval: "month",
        features: ["All basic features", "Legacy support"],
      },
    ],
    currency: "USD",
    billingInterval: "month",
    features: [],
  },
  effectiveDate: new Date(),
  status: "active",
};
```

## Styling

### Custom CSS Classes

The pricing editor uses CSS classes that can be customized:

```css
/* Pricing Editor */
.carnil-pricing-editor {
  /* Main editor container */
}

.carnil-pricing-tier {
  /* Individual pricing tier */
}

.carnil-pricing-tier-popular {
  /* Popular tier styling */
}

.carnil-pricing-calculator {
  /* Calculator container */
}

.carnil-ab-test-panel {
  /* A/B testing panel */
}

.carnil-grandfathering-panel {
  /* Grandfathering panel */
}
```

### Tailwind CSS Integration

The components are built with Tailwind CSS and can be customized:

```tsx
<PricingEditor
  pricing={pricing}
  onChange={setPricing}
  className="bg-white rounded-lg shadow-lg p-6"
  tierClassName="border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
  popularTierClassName="border-2 border-blue-500 bg-blue-50"
/>
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
