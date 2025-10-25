import { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import {
  PricingTier,
  DragItem,
  DropResult
} from '../types/pricing';
import { cn } from '../utils/cn';
import {
  Trash2,
  GripVertical,
  Star,
  Check,
  X
} from 'lucide-react';

// ============================================================================
// Pricing Tier Card Component
// ============================================================================

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

export function PricingTierCard({
  tier,
  index: _index,
  isSelected,
  isEditing,
  onSelect,
  onUpdate,
  onDelete,
  onReorder: _onReorder,
}: PricingTierCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  // ============================================================================
  // Drag and Drop
  // ============================================================================

  const [{ isDragging }, drag] = useDrag({
    type: 'tier',
    item: { type: 'tier', id: tier.id, data: tier } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'tier',
    drop: (item: DragItem, _monitor) => {
      if (item.id === tier.id) return;
      
      const dropResult: DropResult = {
        dropEffect: 'move',
        targetId: tier.id,
        position: 'after',
      };
      
      // Handle reordering logic here
      return dropResult;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleNameEdit = (newName: string) => {
    if (newName.trim() && newName !== tier.name) {
      onUpdate({ name: newName.trim() });
    }
    setIsEditingName(false);
  };

  const handlePriceEdit = (newPrice: string) => {
    const price = parseFloat(newPrice);
    if (!isNaN(price) && price >= 0 && price !== tier.price) {
      onUpdate({ price });
    }
    setIsEditingPrice(false);
  };

  const handleDescriptionEdit = (newDescription: string) => {
    if (newDescription !== tier.description) {
      onUpdate({ description: newDescription.trim() });
    }
    setIsEditingDescription(false);
  };

  const handlePopularToggle = () => {
    onUpdate({ isPopular: !tier.isPopular });
  };

  const handleActiveToggle = () => {
    onUpdate({ isActive: !tier.isActive });
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={cn(
        'relative bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer',
        isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300',
        isDragging ? 'opacity-50' : 'opacity-100',
        isOver && canDrop ? 'border-green-500' : '',
        tier.isPopular ? 'ring-2 ring-yellow-400' : ''
      )}
      onClick={onSelect}
    >
      {/* Popular Badge */}
      {tier.isPopular && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
            <Star className="w-3 h-3 mr-1" />
            Most Popular
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditingName ? (
              <input
                type="text"
                defaultValue={tier.name}
                className="text-xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none"
                // @ts-ignore - DOM types not available in DTS build
                onBlur={(e) => handleNameEdit((e.target as HTMLInputElement).value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // @ts-ignore - DOM types not available in DTS build
                    handleNameEdit(e.currentTarget.value);
                  } else if (e.key === 'Escape') {
                    setIsEditingName(false);
                  }
                }}
                autoFocus
              />
            ) : (
              <h3 
                className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600"
                onDoubleClick={() => setIsEditingName(true)}
              >
                {tier.name}
              </h3>
            )}

            {isEditingDescription ? (
              <input
                type="text"
                defaultValue={tier.description || ''}
                placeholder="Add description..."
                className="text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none w-full mt-1"
                // @ts-ignore - DOM types not available in DTS build
                onBlur={(e) => handleDescriptionEdit((e.target as HTMLInputElement).value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // @ts-ignore - DOM types not available in DTS build
                    handleDescriptionEdit(e.currentTarget.value);
                  } else if (e.key === 'Escape') {
                    setIsEditingDescription(false);
                  }
                }}
                autoFocus
              />
            ) : (
              <p 
                className="text-sm text-gray-600 mt-1 cursor-pointer hover:text-blue-600"
                onDoubleClick={() => setIsEditingDescription(true)}
              >
                {tier.description || 'Click to add description...'}
              </p>
            )}
          </div>

          {/* Actions */}
          {isEditing && (
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePopularToggle();
                }}
                className={cn(
                  'p-1 rounded transition-colors',
                  tier.isPopular 
                    ? 'text-yellow-600 hover:text-yellow-700' 
                    : 'text-gray-400 hover:text-yellow-600'
                )}
                title={tier.isPopular ? 'Remove popular badge' : 'Mark as popular'}
              >
                <Star className="w-4 h-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleActiveToggle();
                }}
                className={cn(
                  'p-1 rounded transition-colors',
                  tier.isActive 
                    ? 'text-green-600 hover:text-green-700' 
                    : 'text-gray-400 hover:text-green-600'
                )}
                title={tier.isActive ? 'Deactivate tier' : 'Activate tier'}
              >
                {tier.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 text-red-600 hover:text-red-700 rounded transition-colors"
                title="Delete tier"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mt-4">
          {isEditingPrice ? (
            <div className="flex items-center">
              <span className="text-3xl font-bold text-gray-900">$</span>
              <input
                type="number"
                defaultValue={tier.price}
                className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none w-24"
                // @ts-ignore - DOM types not available in DTS build
                onBlur={(e) => handlePriceEdit((e.target as HTMLInputElement).value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // @ts-ignore - DOM types not available in DTS build
                    handlePriceEdit(e.currentTarget.value);
                  } else if (e.key === 'Escape') {
                    setIsEditingPrice(false);
                  }
                }}
                autoFocus
              />
            </div>
          ) : (
            <div 
              className="flex items-center cursor-pointer hover:text-blue-600"
              onDoubleClick={() => setIsEditingPrice(true)}
            >
              <span className="text-3xl font-bold text-gray-900">
                ${tier.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                / {tier.interval}
              </span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Features</h4>
          <div className="space-y-1">
            {tier.features.length > 0 ? (
              tier.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">No features added yet</p>
            )}
          </div>
        </div>

        {/* Limits */}
        {tier.limits && Object.keys(tier.limits).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Limits</h4>
            <div className="space-y-1">
              {Object.entries(tier.limits).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm text-gray-600">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                  <span className="font-medium">{value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        {tier.metadata && Object.keys(tier.metadata).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Metadata</h4>
            <div className="space-y-1">
              {Object.entries(tier.metadata).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm text-gray-600">
                  <span className="capitalize">{key}</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drag Handle */}
      {isEditing && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      )}

      {/* Status Indicators */}
      <div className="absolute bottom-2 right-2 flex items-center space-x-2">
        {!tier.isActive && (
          <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
            Inactive
          </div>
        )}
        {tier.isPopular && (
          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            Popular
          </div>
        )}
      </div>
    </div>
  );
}
