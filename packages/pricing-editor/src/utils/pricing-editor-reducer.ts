import {
  PricingEditorState,
  PricingEditorAction,
  PricingPlan,
  PricingTier
} from '../types/pricing';

// ============================================================================
// Pricing Editor Reducer
// ============================================================================

export function pricingEditorReducer(
  state: PricingEditorState,
  action: PricingEditorAction
): PricingEditorState {
  switch (action.type) {
    case 'SET_PLAN':
      return {
        ...state,
        currentPlan: action.payload,
        selectedTier: null,
        isEditing: false,
        isPreviewMode: false,
      };

    case 'ADD_TIER':
      if (!state.currentPlan) return state;
      
      const newTier = {
        ...action.payload,
        sortOrder: state.currentPlan.tiers.length,
      };
      
      return {
        ...state,
        currentPlan: {
          ...state.currentPlan,
          tiers: [...state.currentPlan.tiers, newTier],
          updatedAt: new Date(),
        },
      };

    case 'UPDATE_TIER':
      if (!state.currentPlan) return state;
      
      const updatedTiers = state.currentPlan.tiers.map(tier =>
        tier.id === action.payload.id
          ? { ...tier, ...action.payload.updates }
          : tier
      );
      
      return {
        ...state,
        currentPlan: {
          ...state.currentPlan,
          tiers: updatedTiers,
          updatedAt: new Date(),
        },
        selectedTier: state.selectedTier?.id === action.payload.id
          ? { ...state.selectedTier, ...action.payload.updates }
          : state.selectedTier,
      };

    case 'DELETE_TIER':
      if (!state.currentPlan) return state;
      
      const filteredTiers = state.currentPlan.tiers.filter(
        tier => tier.id !== action.payload
      );
      
      return {
        ...state,
        currentPlan: {
          ...state.currentPlan,
          tiers: filteredTiers,
          updatedAt: new Date(),
        },
        selectedTier: state.selectedTier?.id === action.payload
          ? null
          : state.selectedTier,
      };

    case 'REORDER_TIERS':
      if (!state.currentPlan) return state;
      
      const reorderedTiers = action.payload
        .map((tierId, index) => {
          const tier = state.currentPlan!.tiers.find(t => t.id === tierId);
          return tier ? { ...tier, sortOrder: index } : null;
        })
        .filter(Boolean) as PricingTier[];
      
      return {
        ...state,
        currentPlan: {
          ...state.currentPlan,
          tiers: reorderedTiers,
          updatedAt: new Date(),
        },
      };

    case 'SET_SELECTED_TIER':
      if (!action.payload) {
        return {
          ...state,
          selectedTier: null,
        };
      }
      
      const selectedTier = state.currentPlan?.tiers.find(
        tier => tier.id === action.payload
      );
      
      return {
        ...state,
        selectedTier: selectedTier || null,
      };

    case 'TOGGLE_EDIT_MODE':
      return {
        ...state,
        isEditing: !state.isEditing,
        selectedTier: state.isEditing ? null : state.selectedTier,
      };

    case 'TOGGLE_PREVIEW_MODE':
      return {
        ...state,
        isPreviewMode: !state.isPreviewMode,
        selectedTier: state.isPreviewMode ? null : state.selectedTier,
      };

    case 'START_AB_TEST':
      return {
        ...state,
        activeABTest: action.payload,
      };

    case 'STOP_AB_TEST':
      return {
        ...state,
        activeABTest: null,
      };

    case 'ADD_GRANDFATHERING_RULE':
      return {
        ...state,
        grandfatheringRules: [...state.grandfatheringRules, action.payload],
      };

    case 'UPDATE_GRANDFATHERING_RULE':
      return {
        ...state,
        grandfatheringRules: state.grandfatheringRules.map(rule =>
          rule.id === action.payload.id
            ? { ...rule, ...action.payload.updates }
            : rule
        ),
      };

    case 'DELETE_GRANDFATHERING_RULE':
      return {
        ...state,
        grandfatheringRules: state.grandfatheringRules.filter(
          rule => rule.id !== action.payload
        ),
      };

    case 'SAVE_HISTORY':
      if (!state.currentPlan) return state;
      
      return {
        ...state,
        history: [...state.history, state.currentPlan],
        undoStack: [...state.undoStack, state.currentPlan],
        redoStack: [],
      };

    case 'UNDO':
      if (state.undoStack.length === 0) return state;
      
      const previousPlan = state.undoStack[state.undoStack.length - 1];
      const newUndoStack = state.undoStack.slice(0, -1);
      
      return {
        ...state,
        currentPlan: previousPlan,
        undoStack: newUndoStack,
        redoStack: [state.currentPlan!, ...state.redoStack],
        selectedTier: null,
      };

    case 'REDO':
      if (state.redoStack.length === 0) return state;
      
      const nextPlan = state.redoStack[0];
      const newRedoStack = state.redoStack.slice(1);
      
      return {
        ...state,
        currentPlan: nextPlan,
        undoStack: [...state.undoStack, state.currentPlan!],
        redoStack: newRedoStack,
        selectedTier: null,
      };

    case 'RESET':
      return {
        ...state,
        currentPlan: state.history.length > 0 ? state.history[0] : null,
        selectedTier: null,
        isEditing: false,
        isPreviewMode: false,
        activeABTest: null,
        undoStack: [],
        redoStack: [],
      };

    default:
      return state;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

export function createEmptyPlan(): PricingPlan {
  return {
    id: `plan-${Date.now()}`,
    name: 'New Pricing Plan',
    description: 'A new pricing plan',
    tiers: [],
    currency: 'USD',
    isActive: true,
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createEmptyTier(): PricingTier {
  return {
    id: `tier-${Date.now()}`,
    name: 'New Tier',
    description: 'Add your description here',
    price: 0,
    currency: 'USD',
    interval: 'month',
    intervalCount: 1,
    features: [],
    isPopular: false,
    isActive: true,
    sortOrder: 0,
  };
}

export function validatePlan(plan: PricingPlan): string[] {
  const errors: string[] = [];
  
  if (!plan.name.trim()) {
    errors.push('Plan name is required');
  }
  
  if (plan.tiers.length === 0) {
    errors.push('At least one pricing tier is required');
  }
  
  plan.tiers.forEach((tier, index) => {
    if (!tier.name.trim()) {
      errors.push(`Tier ${index + 1}: Name is required`);
    }
    
    if (tier.price < 0) {
      errors.push(`Tier ${index + 1}: Price cannot be negative`);
    }
    
    if (tier.intervalCount <= 0) {
      errors.push(`Tier ${index + 1}: Interval count must be positive`);
    }
  });
  
  return errors;
}

export function calculatePlanMetrics(plan: PricingPlan): {
  totalTiers: number;
  activeTiers: number;
  averagePrice: number;
  priceRange: { min: number; max: number };
  popularTier: PricingTier | null;
} {
  const activeTiers = plan.tiers.filter(tier => tier.isActive);
  const prices = activeTiers.map(tier => tier.price);
  
  return {
    totalTiers: plan.tiers.length,
    activeTiers: activeTiers.length,
    averagePrice: prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0,
    priceRange: {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    },
    popularTier: plan.tiers.find(tier => tier.isPopular) || null,
  };
}
