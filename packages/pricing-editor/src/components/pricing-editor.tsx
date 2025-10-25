import React, { useReducer, useCallback, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PricingEditorProps, 
  PricingEditorState, 
  PricingEditorAction,
  PricingPlan,
  PricingTier,
  ABTest,
  GrandfatheringRule
} from '../types/pricing';
import { PricingTierCard } from './pricing-tier-card';
import { PricingTierEditor } from './pricing-tier-editor';
import { ABTestPanel } from './ab-test-panel';
import { GrandfatheringPanel } from './grandfathering-panel';
import { PricingPreview } from './pricing-preview';
import { TemplateSelector } from './template-selector';
import { PricingCalculator } from './pricing-calculator';
import { pricingEditorReducer } from '../utils/pricing-editor-reducer';
import { cn } from '../utils/cn';

// ============================================================================
// Pricing Editor Component
// ============================================================================

export function PricingEditor({
  initialPlan,
  onPlanChange,
  onSave,
  onPublish,
  onABTestStart,
  onABTestStop,
  onGrandfatheringRuleAdd,
  onGrandfatheringRuleUpdate,
  onGrandfatheringRuleDelete,
  templates = [],
  onTemplateSelect,
  onTemplateCreate,
  currency = 'USD',
  supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
  features = [],
  limits = [],
  className,
  style,
}: PricingEditorProps) {
  const [state, dispatch] = useReducer(pricingEditorReducer, {
    currentPlan: initialPlan || null,
    selectedTier: null,
    isEditing: false,
    isPreviewMode: false,
    activeABTest: null,
    grandfatheringRules: [],
    templates,
    history: [],
    undoStack: [],
    redoStack: [],
  });

  const [isLoading, setIsLoading] = useState(false);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handlePlanChange = useCallback((plan: PricingPlan) => {
    dispatch({ type: 'SET_PLAN', payload: plan });
    onPlanChange?.(plan);
  }, [onPlanChange]);

  const handleTierAdd = useCallback((tier: PricingTier) => {
    dispatch({ type: 'ADD_TIER', payload: tier });
  }, []);

  const handleTierUpdate = useCallback((id: string, updates: Partial<PricingTier>) => {
    dispatch({ type: 'UPDATE_TIER', payload: { id, updates } });
  }, []);

  const handleTierDelete = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TIER', payload: id });
  }, []);

  const handleTierReorder = useCallback((tierIds: string[]) => {
    dispatch({ type: 'REORDER_TIERS', payload: tierIds });
  }, []);

  const handleTierSelect = useCallback((tierId: string | null) => {
    dispatch({ type: 'SET_SELECTED_TIER', payload: tierId });
  }, []);

  const handleEditToggle = useCallback(() => {
    dispatch({ type: 'TOGGLE_EDIT_MODE' });
  }, []);

  const handlePreviewToggle = useCallback(() => {
    dispatch({ type: 'TOGGLE_PREVIEW_MODE' });
  }, []);

  const handleSave = useCallback(async () => {
    if (!state.currentPlan || !onSave) return;
    
    setIsLoading(true);
    try {
      await onSave(state.currentPlan);
      dispatch({ type: 'SAVE_HISTORY' });
    } catch (error) {
      console.error('Failed to save plan:', error);
    } finally {
      setIsLoading(false);
    }
  }, [state.currentPlan, onSave]);

  const handlePublish = useCallback(async () => {
    if (!state.currentPlan || !onPublish) return;
    
    setIsLoading(true);
    try {
      await onPublish(state.currentPlan);
    } catch (error) {
      console.error('Failed to publish plan:', error);
    } finally {
      setIsLoading(false);
    }
  }, [state.currentPlan, onPublish]);

  const handleABTestStart = useCallback(async (abTest: ABTest) => {
    dispatch({ type: 'START_AB_TEST', payload: abTest });
    await onABTestStart?.(abTest);
  }, [onABTestStart]);

  const handleABTestStop = useCallback(async () => {
    if (!state.activeABTest) return;
    
    dispatch({ type: 'STOP_AB_TEST' });
    await onABTestStop?.(state.activeABTest.id);
  }, [state.activeABTest, onABTestStop]);

  const handleUndo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const handleRedo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  if (!state.currentPlan) {
    return (
      <div className={cn('flex items-center justify-center h-96', className)} style={style}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Pricing Plan</h3>
          <p className="text-gray-500 mb-4">Select a template or create a new plan to get started.</p>
          <TemplateSelector
            templates={templates}
            onSelect={onTemplateSelect}
            onCreate={onTemplateCreate}
          />
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn('pricing-editor', className)} style={style}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{state.currentPlan.name}</h2>
            <p className="text-gray-600">{state.currentPlan.description}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEditToggle}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                state.isEditing
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              )}
            >
              {state.isEditing ? 'Exit Edit' : 'Edit'}
            </button>
            
            <button
              onClick={handlePreviewToggle}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                state.isPreviewMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              )}
            >
              {state.isPreviewMode ? 'Exit Preview' : 'Preview'}
            </button>
            
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            
            <button
              onClick={handlePublish}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pricing Tiers */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing Tiers</h3>
              <p className="text-sm text-gray-600">
                Drag and drop to reorder tiers. Click to edit details.
              </p>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence>
                {state.currentPlan.tiers.map((tier, index) => (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PricingTierCard
                      tier={tier}
                      index={index}
                      isSelected={state.selectedTier?.id === tier.id}
                      isEditing={state.isEditing}
                      onSelect={() => handleTierSelect(tier.id)}
                      onUpdate={(updates) => handleTierUpdate(tier.id, updates)}
                      onDelete={() => handleTierDelete(tier.id)}
                      onReorder={handleTierReorder}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {state.isEditing && (
              <button
                onClick={() => {
                  const newTier: PricingTier = {
                    id: `tier-${Date.now()}`,
                    name: 'New Tier',
                    description: 'Add your description here',
                    price: 0,
                    currency,
                    interval: 'month',
                    intervalCount: 1,
                    features: [],
                    isActive: true,
                    sortOrder: state.currentPlan!.tiers.length,
                  };
                  handleTierAdd(newTier);
                }}
                className="w-full mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                + Add New Tier
              </button>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Tier Editor */}
            {state.selectedTier && (
              <PricingTierEditor
                tier={state.selectedTier}
                onUpdate={(updates) => handleTierUpdate(state.selectedTier!.id, updates)}
                onClose={() => handleTierSelect(null)}
                currency={currency}
                supportedCurrencies={supportedCurrencies}
                features={features}
                limits={limits}
              />
            )}

            {/* A/B Testing Panel */}
            <ABTestPanel
              activeTest={state.activeABTest}
              onStart={handleABTestStart}
              onStop={handleABTestStop}
              currentPlan={state.currentPlan}
            />

            {/* Grandfathering Panel */}
            <GrandfatheringPanel
              rules={state.grandfatheringRules}
              onAdd={onGrandfatheringRuleAdd}
              onUpdate={onGrandfatheringRuleUpdate}
              onDelete={onGrandfatheringRuleDelete}
            />

            {/* Pricing Calculator */}
            <PricingCalculator
              plan={state.currentPlan}
              currency={currency}
            />
          </div>
        </div>

        {/* Preview Mode */}
        {state.isPreviewMode && (
          <div className="mt-8">
            <PricingPreview
              plan={state.currentPlan}
              currency={currency}
            />
          </div>
        )}

        {/* History Controls */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUndo}
              disabled={state.undoStack.length === 0}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={state.redoStack.length === 0}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Redo
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
            >
              Reset
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            Version {state.currentPlan.version} • Last updated {state.currentPlan.updatedAt.toLocaleDateString()}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
