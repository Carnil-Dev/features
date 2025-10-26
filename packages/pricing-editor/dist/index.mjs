import { useState, useReducer, useCallback, useMemo } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Star, Check, X, Trash2, GripVertical } from 'lucide-react';
import { jsxs, jsx } from 'react/jsx-runtime';
import { z } from 'zod';

// src/components/pricing-editor.tsx
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function PricingTierCard({
  tier,
  index: _index,
  isSelected,
  isEditing,
  onSelect,
  onUpdate,
  onDelete,
  onReorder: _onReorder
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [{ isDragging }, drag] = useDrag({
    type: "tier",
    item: { type: "tier", id: tier.id, data: tier },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "tier",
    drop: (item, _monitor) => {
      if (item.id === tier.id) return;
      const dropResult = {
        dropEffect: "move",
        targetId: tier.id,
        position: "after"
      };
      return dropResult;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });
  const handleNameEdit = (newName) => {
    if (newName.trim() && newName !== tier.name) {
      onUpdate({ name: newName.trim() });
    }
    setIsEditingName(false);
  };
  const handlePriceEdit = (newPrice) => {
    const price = parseFloat(newPrice);
    if (!isNaN(price) && price >= 0 && price !== tier.price) {
      onUpdate({ price });
    }
    setIsEditingPrice(false);
  };
  const handleDescriptionEdit = (newDescription) => {
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
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: (node) => drag(drop(node)),
      className: cn(
        "relative bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer",
        isSelected ? "border-blue-500 shadow-lg" : "border-gray-200 hover:border-gray-300",
        isDragging ? "opacity-50" : "opacity-100",
        isOver && canDrop ? "border-green-500" : "",
        tier.isPopular ? "ring-2 ring-yellow-400" : ""
      ),
      onClick: onSelect,
      children: [
        tier.isPopular && /* @__PURE__ */ jsx("div", { className: "absolute -top-2 left-1/2 transform -translate-x-1/2", children: /* @__PURE__ */ jsxs("div", { className: "bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center", children: [
          /* @__PURE__ */ jsx(Star, { className: "w-3 h-3 mr-1" }),
          "Most Popular"
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              isEditingName ? /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  defaultValue: tier.name,
                  className: "text-xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none",
                  onBlur: (e) => handleNameEdit(e.target.value),
                  onKeyDown: (e) => {
                    if (e.key === "Enter") {
                      handleNameEdit(e.currentTarget.value);
                    } else if (e.key === "Escape") {
                      setIsEditingName(false);
                    }
                  },
                  autoFocus: true
                }
              ) : /* @__PURE__ */ jsx(
                "h3",
                {
                  className: "text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600",
                  onDoubleClick: () => setIsEditingName(true),
                  children: tier.name
                }
              ),
              isEditingDescription ? /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  defaultValue: tier.description || "",
                  placeholder: "Add description...",
                  className: "text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none w-full mt-1",
                  onBlur: (e) => handleDescriptionEdit(e.target.value),
                  onKeyDown: (e) => {
                    if (e.key === "Enter") {
                      handleDescriptionEdit(e.currentTarget.value);
                    } else if (e.key === "Escape") {
                      setIsEditingDescription(false);
                    }
                  },
                  autoFocus: true
                }
              ) : /* @__PURE__ */ jsx(
                "p",
                {
                  className: "text-sm text-gray-600 mt-1 cursor-pointer hover:text-blue-600",
                  onDoubleClick: () => setIsEditingDescription(true),
                  children: tier.description || "Click to add description..."
                }
              )
            ] }),
            isEditing && /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 ml-4", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    handlePopularToggle();
                  },
                  className: cn(
                    "p-1 rounded transition-colors",
                    tier.isPopular ? "text-yellow-600 hover:text-yellow-700" : "text-gray-400 hover:text-yellow-600"
                  ),
                  title: tier.isPopular ? "Remove popular badge" : "Mark as popular",
                  children: /* @__PURE__ */ jsx(Star, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    handleActiveToggle();
                  },
                  className: cn(
                    "p-1 rounded transition-colors",
                    tier.isActive ? "text-green-600 hover:text-green-700" : "text-gray-400 hover:text-green-600"
                  ),
                  title: tier.isActive ? "Deactivate tier" : "Activate tier",
                  children: tier.isActive ? /* @__PURE__ */ jsx(Check, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    onDelete();
                  },
                  className: "p-1 text-red-600 hover:text-red-700 rounded transition-colors",
                  title: "Delete tier",
                  children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4", children: isEditingPrice ? /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold text-gray-900", children: "$" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                defaultValue: tier.price,
                className: "text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none w-24",
                onBlur: (e) => handlePriceEdit(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter") {
                    handlePriceEdit(e.currentTarget.value);
                  } else if (e.key === "Escape") {
                    setIsEditingPrice(false);
                  }
                },
                autoFocus: true
              }
            )
          ] }) : /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex items-center cursor-pointer hover:text-blue-600",
              onDoubleClick: () => setIsEditingPrice(true),
              children: [
                /* @__PURE__ */ jsxs("span", { className: "text-3xl font-bold text-gray-900", children: [
                  "$",
                  tier.price.toFixed(2)
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-500 ml-2", children: [
                  "/ ",
                  tier.interval
                ] })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-gray-700 mb-2", children: "Features" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-1", children: tier.features.length > 0 ? tier.features.map((feature, featureIndex) => /* @__PURE__ */ jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [
              /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-green-500 mr-2 flex-shrink-0" }),
              /* @__PURE__ */ jsx("span", { children: feature })
            ] }, featureIndex)) : /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 italic", children: "No features added yet" }) })
          ] }),
          tier.limits && Object.keys(tier.limits).length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-gray-700 mb-2", children: "Limits" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-1", children: Object.entries(tier.limits).map(([key, value]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm text-gray-600", children: [
              /* @__PURE__ */ jsx("span", { className: "capitalize", children: key.replace(/([A-Z])/g, " $1").toLowerCase() }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: value.toLocaleString() })
            ] }, key)) })
          ] }),
          tier.metadata && Object.keys(tier.metadata).length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-gray-700 mb-2", children: "Metadata" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-1", children: Object.entries(tier.metadata).map(([key, value]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm text-gray-600", children: [
              /* @__PURE__ */ jsx("span", { className: "capitalize", children: key }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: String(value) })
            ] }, key)) })
          ] })
        ] }),
        isEditing && /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx(GripVertical, { className: "w-4 h-4 text-gray-400" }) }),
        /* @__PURE__ */ jsxs("div", { className: "absolute bottom-2 right-2 flex items-center space-x-2", children: [
          !tier.isActive && /* @__PURE__ */ jsx("div", { className: "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium", children: "Inactive" }),
          tier.isPopular && /* @__PURE__ */ jsx("div", { className: "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium", children: "Popular" })
        ] })
      ]
    }
  );
}
function PricingTierEditor({
  tier,
  onUpdate,
  onClose,
  currency,
  supportedCurrencies,
  features,
  limits
}) {
  const [formData, setFormData] = useState({
    name: tier.name,
    description: tier.description,
    price: tier.price,
    currency: tier.currency,
    interval: tier.interval,
    intervalCount: tier.intervalCount,
    features: tier.features,
    isActive: tier.isActive
  });
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      onUpdate(formData);
      onClose();
    },
    [formData, onUpdate, onClose]
  );
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Edit Tier" }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: "\xD7" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Name" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: formData.name,
            onChange: (e) => handleChange("name", e.target.value),
            className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: formData.description,
            onChange: (e) => handleChange("description", e.target.value),
            rows: 3,
            className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Price" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: formData.price,
              onChange: (e) => handleChange("price", parseFloat(e.target.value) || 0),
              className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Currency" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: formData.currency,
              onChange: (e) => handleChange("currency", e.target.value),
              className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
              children: supportedCurrencies.map((curr) => /* @__PURE__ */ jsx("option", { value: curr, children: curr }, curr))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Interval" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: formData.interval,
              onChange: (e) => handleChange("interval", e.target.value),
              className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "month", children: "Monthly" }),
                /* @__PURE__ */ jsx("option", { value: "year", children: "Yearly" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Interval Count" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: formData.intervalCount,
              onChange: (e) => handleChange("intervalCount", parseInt(e.target.value) || 1),
              min: "1",
              className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Features" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: features.map((feature, index) => /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: formData.features.includes(feature),
              onChange: (e) => {
                const newFeatures = e.target.checked ? [...formData.features, feature] : formData.features.filter((f) => f !== feature);
                handleChange("features", newFeatures);
              },
              className: "mr-2"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-700", children: feature })
        ] }, index)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            id: "isActive",
            checked: formData.isActive,
            onChange: (e) => handleChange("isActive", e.target.checked),
            className: "mr-2"
          }
        ),
        /* @__PURE__ */ jsx("label", { htmlFor: "isActive", className: "text-sm text-gray-700", children: "Active" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "px-4 py-2 text-sm text-gray-600 hover:text-gray-800",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700",
            children: "Save Changes"
          }
        )
      ] })
    ] })
  ] });
}
function ABTestPanel({ activeTest, onStart, onStop, currentPlan }) {
  const [isCreating, setIsCreating] = useState(false);
  const [testConfig, setTestConfig] = useState({
    name: "",
    description: "",
    variantName: "",
    trafficSplit: 50,
    duration: 30
  });
  const handleStartTest = () => {
    const newTest = {
      id: `test-${Date.now()}`,
      name: testConfig.name,
      description: testConfig.description,
      variantName: testConfig.variantName,
      trafficSplit: testConfig.trafficSplit,
      duration: testConfig.duration,
      startDate: /* @__PURE__ */ new Date(),
      status: "running",
      metrics: {
        conversions: 0,
        revenue: 0,
        users: 0
      }
    };
    onStart(newTest);
    setIsCreating(false);
    setTestConfig({
      name: "",
      description: "",
      variantName: "",
      trafficSplit: 50,
      duration: 30
    });
  };
  if (activeTest) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Active A/B Test" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onStop,
            className: "px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700",
            children: "Stop Test"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "font-medium text-gray-900", children: activeTest.name }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: activeTest.description })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Variant:" }),
            /* @__PURE__ */ jsx("span", { className: "ml-2 font-medium", children: activeTest.variantName })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Traffic Split:" }),
            /* @__PURE__ */ jsxs("span", { className: "ml-2 font-medium", children: [
              activeTest.trafficSplit,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Duration:" }),
            /* @__PURE__ */ jsxs("span", { className: "ml-2 font-medium", children: [
              activeTest.duration,
              " days"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Status:" }),
            /* @__PURE__ */ jsx("span", { className: "ml-2 font-medium text-green-600 capitalize", children: activeTest.status })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t", children: [
          /* @__PURE__ */ jsx("h5", { className: "font-medium text-gray-900 mb-2", children: "Metrics" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Users:" }),
              /* @__PURE__ */ jsx("span", { className: "ml-2 font-medium", children: activeTest.metrics.users })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Conversions:" }),
              /* @__PURE__ */ jsx("span", { className: "ml-2 font-medium", children: activeTest.metrics.conversions })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Revenue:" }),
              /* @__PURE__ */ jsxs("span", { className: "ml-2 font-medium", children: [
                "$",
                activeTest.metrics.revenue
              ] })
            ] })
          ] })
        ] })
      ] })
    ] });
  }
  if (isCreating) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Create A/B Test" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setIsCreating(false),
            className: "text-gray-400 hover:text-gray-600",
            children: "\xD7"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Test Name" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: testConfig.name,
              onChange: (e) => setTestConfig((prev) => ({ ...prev, name: e.target.value })),
              className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: testConfig.description,
              onChange: (e) => setTestConfig((prev) => ({ ...prev, description: e.target.value })),
              rows: 2,
              className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Variant Name" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: testConfig.variantName,
              onChange: (e) => setTestConfig((prev) => ({ ...prev, variantName: e.target.value })),
              className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Traffic Split (%)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "1",
                max: "99",
                value: testConfig.trafficSplit,
                onChange: (e) => setTestConfig((prev) => ({ ...prev, trafficSplit: parseInt(e.target.value) || 50 })),
                className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Duration (days)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "1",
                value: testConfig.duration,
                onChange: (e) => setTestConfig((prev) => ({ ...prev, duration: parseInt(e.target.value) || 30 })),
                className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setIsCreating(false),
              className: "px-4 py-2 text-sm text-gray-600 hover:text-gray-800",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleStartTest,
              disabled: !testConfig.name || !testConfig.variantName,
              className: "px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50",
              children: "Start Test"
            }
          )
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "A/B Testing" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setIsCreating(true),
          className: "px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700",
          children: "New Test"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsx("div", { className: "text-gray-400 mb-2", children: /* @__PURE__ */ jsx("svg", { className: "w-12 h-12 mx-auto", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx(
        "path",
        {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
          d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        }
      ) }) }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "No active A/B tests" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs mt-1", children: "Create a test to compare pricing strategies" })
    ] })
  ] });
}
function GrandfatheringPanel({
  rules,
  onAdd,
  onUpdate,
  onDelete
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    customerSegment: "",
    originalPrice: 0,
    grandfatheredPrice: 0,
    startDate: "",
    endDate: "",
    isActive: true
  });
  const handleSubmit = () => {
    const newRule = {
      id: editingRule || `rule-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      customerSegment: formData.customerSegment,
      originalPrice: formData.originalPrice,
      grandfatheredPrice: formData.grandfatheredPrice,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : null,
      isActive: formData.isActive,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (editingRule) {
      onUpdate(editingRule, newRule);
    } else {
      onAdd(newRule);
    }
    setIsCreating(false);
    setEditingRule(null);
    setFormData({
      name: "",
      description: "",
      customerSegment: "",
      originalPrice: 0,
      grandfatheredPrice: 0,
      startDate: "",
      endDate: "",
      isActive: true
    });
  };
  const handleEdit = (rule) => {
    setFormData({
      name: rule.name,
      description: rule.description,
      customerSegment: rule.customerSegment,
      originalPrice: rule.originalPrice,
      grandfatheredPrice: rule.grandfatheredPrice,
      startDate: rule.startDate.toISOString().split("T")[0],
      endDate: rule.endDate ? rule.endDate.toISOString().split("T")[0] : "",
      isActive: rule.isActive
    });
    setEditingRule(rule.id);
    setIsCreating(true);
  };
  const handleCancel = () => {
    setIsCreating(false);
    setEditingRule(null);
    setFormData({
      name: "",
      description: "",
      customerSegment: "",
      originalPrice: 0,
      grandfatheredPrice: 0,
      startDate: "",
      endDate: "",
      isActive: true
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Grandfathering Rules" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setIsCreating(true),
          className: "px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700",
          children: "Add Rule"
        }
      )
    ] }),
    isCreating ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Rule Name" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: formData.name,
            onChange: (e) => setFormData((prev) => ({ ...prev, name: e.target.value })),
            className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: formData.description,
            onChange: (e) => setFormData((prev) => ({ ...prev, description: e.target.value })),
            rows: 2,
            className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Customer Segment" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: formData.customerSegment,
            onChange: (e) => setFormData((prev) => ({ ...prev, customerSegment: e.target.value })),
            placeholder: "e.g., Early adopters, Enterprise customers",
            className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Original Price" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: formData.originalPrice,
              onChange: (e) => setFormData((prev) => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 })),
              className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Grandfathered Price" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: formData.grandfatheredPrice,
              onChange: (e) => setFormData((prev) => ({
                ...prev,
                grandfatheredPrice: parseFloat(e.target.value) || 0
              })),
              className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Start Date" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: formData.startDate,
              onChange: (e) => setFormData((prev) => ({ ...prev, startDate: e.target.value })),
              className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "End Date (optional)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: formData.endDate,
              onChange: (e) => setFormData((prev) => ({ ...prev, endDate: e.target.value })),
              className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            id: "isActive",
            checked: formData.isActive,
            onChange: (e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked })),
            className: "mr-2"
          }
        ),
        /* @__PURE__ */ jsx("label", { htmlFor: "isActive", className: "text-sm text-gray-700", children: "Active" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleCancel,
            className: "px-4 py-2 text-sm text-gray-600 hover:text-gray-800",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSubmit,
            disabled: !formData.name || !formData.customerSegment,
            className: "px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50",
            children: editingRule ? "Update Rule" : "Add Rule"
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: rules.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsx("div", { className: "text-gray-400 mb-2", children: /* @__PURE__ */ jsx(
        "svg",
        {
          className: "w-12 h-12 mx-auto",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            }
          )
        }
      ) }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "No grandfathering rules" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs mt-1", children: "Add rules to protect existing customers from price changes" })
    ] }) : rules.map((rule) => /* @__PURE__ */ jsx("div", { className: "border rounded-lg p-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "font-medium text-gray-900", children: rule.name }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: rule.description }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 text-xs text-gray-500", children: [
          /* @__PURE__ */ jsxs("span", { className: "mr-4", children: [
            "Segment: ",
            rule.customerSegment
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "mr-4", children: [
            "Original: $",
            rule.originalPrice
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "mr-4", children: [
            "Grandfathered: $",
            rule.grandfatheredPrice
          ] }),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: `px-2 py-1 rounded text-xs ${rule.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`,
              children: rule.isActive ? "Active" : "Inactive"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleEdit(rule),
            className: "text-blue-600 hover:text-blue-800 text-sm",
            children: "Edit"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onDelete(rule.id),
            className: "text-red-600 hover:text-red-800 text-sm",
            children: "Delete"
          }
        )
      ] })
    ] }) }, rule.id)) })
  ] });
}
function PricingPreview({ plan, currency }) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-white border rounded-lg p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-2", children: plan.name }),
      /* @__PURE__ */ jsx("p", { className: "text-lg text-gray-600", children: plan.description })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: plan.tiers.map((tier, index) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: `relative border rounded-lg p-6 ${index === 1 ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}`,
        children: [
          index === 1 && /* @__PURE__ */ jsx("div", { className: "absolute -top-3 left-1/2 transform -translate-x-1/2", children: /* @__PURE__ */ jsx("span", { className: "bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium", children: "Most Popular" }) }),
          /* @__PURE__ */ jsxs("div", { className: "text-center mb-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-2", children: tier.name }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm mb-4", children: tier.description }),
            /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold text-gray-900", children: tier.price === 0 ? "Free" : `$${tier.price}` }),
              tier.price > 0 && /* @__PURE__ */ jsxs("span", { className: "text-gray-600 ml-1", children: [
                "/",
                tier.interval === "month" ? "month" : "year"
              ] })
            ] }),
            tier.price > 0 && tier.intervalCount > 1 && /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
              "Billed every ",
              tier.intervalCount,
              " ",
              tier.interval === "month" ? "months" : "years"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3 mb-6", children: tier.features.map((feature, featureIndex) => /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: "w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0",
                fill: "currentColor",
                viewBox: "0 0 20 20",
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    fillRule: "evenodd",
                    d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                    clipRule: "evenodd"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-700", children: feature })
          ] }, featureIndex)) }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `w-full py-3 px-4 rounded-lg font-medium transition-colors ${index === 1 ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`,
              children: tier.price === 0 ? "Get Started" : "Choose Plan"
            }
          )
        ]
      },
      tier.id
    )) }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "All plans include 24/7 support and a 30-day money-back guarantee" }) })
  ] });
}
function TemplateSelector({ templates, onSelect, onCreate }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const categories = ["all", ...new Set(templates.map((t) => t.category))];
  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) || template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  return /* @__PURE__ */ jsxs("div", { className: "bg-white border rounded-lg p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-2", children: "Choose a Template" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Start with a pre-built pricing structure or create your own" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 space-y-4", children: [
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: "Search templates...",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: categories.map((category) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setSelectedCategory(category),
          className: `px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedCategory === category ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
          children: category === "all" ? "All Templates" : category
        },
        category
      )) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6", children: filteredTemplates.map((template) => /* @__PURE__ */ jsxs(
      "div",
      {
        onClick: () => onSelect(template),
        className: "border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
            /* @__PURE__ */ jsx("h4", { className: "font-medium text-gray-900 mb-1", children: template.name }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: template.description })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsx("div", { className: "bg-gray-50 rounded p-3 text-xs text-gray-600 font-mono", children: template.preview }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded", children: template.category }),
            /* @__PURE__ */ jsx("button", { className: "text-blue-600 hover:text-blue-800 text-sm font-medium", children: "Use Template \u2192" })
          ] })
        ]
      },
      template.id
    )) }),
    filteredTemplates.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsx("div", { className: "text-gray-400 mb-2", children: /* @__PURE__ */ jsx(
        "svg",
        {
          className: "w-12 h-12 mx-auto",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            }
          )
        }
      ) }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "No templates found" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs mt-1", children: "Try adjusting your search or filters" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border-t pt-6", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Don't see what you need?" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Create a custom pricing plan from scratch" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onCreate,
          className: "px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors",
          children: "Create Custom Plan"
        }
      )
    ] }) })
  ] });
}
function PricingCalculator({ plan, currency }) {
  const [inputs, setInputs] = useState({
    monthlyRevenue: 0,
    customerCount: 0,
    churnRate: 5,
    growthRate: 10
  });
  const calculations = useMemo(() => {
    const { monthlyRevenue, customerCount, churnRate, growthRate } = inputs;
    const tierMetrics = plan.tiers.map((tier) => {
      const monthlyPrice = tier.price;
      const customersAtTier = Math.floor(customerCount * (1 / plan.tiers.length));
      const monthlyRevenueFromTier = customersAtTier * monthlyPrice;
      const annualRevenueFromTier = monthlyRevenueFromTier * 12;
      const monthlyChurn = customersAtTier * (churnRate / 100);
      const monthlyNewCustomers = customersAtTier * (growthRate / 100);
      const netGrowth = monthlyNewCustomers - monthlyChurn;
      return {
        tier,
        customersAtTier,
        monthlyRevenueFromTier,
        annualRevenueFromTier,
        monthlyChurn,
        monthlyNewCustomers,
        netGrowth
      };
    });
    const totalMonthlyRevenue = tierMetrics.reduce(
      (sum, tier) => sum + tier.monthlyRevenueFromTier,
      0
    );
    const totalAnnualRevenue = totalMonthlyRevenue * 12;
    const totalMonthlyChurn = tierMetrics.reduce((sum, tier) => sum + tier.monthlyChurn, 0);
    const totalMonthlyNewCustomers = tierMetrics.reduce(
      (sum, tier) => sum + tier.monthlyNewCustomers,
      0
    );
    const totalNetGrowth = totalMonthlyNewCustomers - totalMonthlyChurn;
    return {
      tierMetrics,
      totalMonthlyRevenue,
      totalAnnualRevenue,
      totalMonthlyChurn,
      totalMonthlyNewCustomers,
      totalNetGrowth
    };
  }, [inputs, plan.tiers]);
  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-4", children: "Revenue Calculator" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Current Monthly Revenue" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: inputs.monthlyRevenue,
            onChange: (e) => handleInputChange("monthlyRevenue", parseFloat(e.target.value) || 0),
            className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Customer Count" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: inputs.customerCount,
            onChange: (e) => handleInputChange("customerCount", parseInt(e.target.value) || 0),
            className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Churn Rate (%)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: inputs.churnRate,
              onChange: (e) => handleInputChange("churnRate", parseFloat(e.target.value) || 0),
              className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Growth Rate (%)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: inputs.growthRate,
              onChange: (e) => handleInputChange("growthRate", parseFloat(e.target.value) || 0),
              className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [
        /* @__PURE__ */ jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "Projected Revenue" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Monthly:" }),
            /* @__PURE__ */ jsxs("span", { className: "ml-2 font-medium", children: [
              "$",
              calculations.totalMonthlyRevenue.toLocaleString()
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Annual:" }),
            /* @__PURE__ */ jsxs("span", { className: "ml-2 font-medium", children: [
              "$",
              calculations.totalAnnualRevenue.toLocaleString()
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [
        /* @__PURE__ */ jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "Customer Metrics" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Monthly Churn:" }),
            /* @__PURE__ */ jsx("span", { className: "ml-2 font-medium", children: calculations.totalMonthlyChurn.toFixed(0) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "New Customers:" }),
            /* @__PURE__ */ jsx("span", { className: "ml-2 font-medium", children: calculations.totalMonthlyNewCustomers.toFixed(0) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Net Growth:" }),
            /* @__PURE__ */ jsxs(
              "span",
              {
                className: `ml-2 font-medium ${calculations.totalNetGrowth >= 0 ? "text-green-600" : "text-red-600"}`,
                children: [
                  calculations.totalNetGrowth >= 0 ? "+" : "",
                  calculations.totalNetGrowth.toFixed(0)
                ]
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "Tier Breakdown" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: calculations.tierMetrics.map((tier, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: tier.tier.name }),
            /* @__PURE__ */ jsxs("span", { className: "text-gray-500 ml-2", children: [
              "(",
              tier.customersAtTier.toFixed(0),
              " customers)"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxs("div", { className: "font-medium", children: [
              "$",
              tier.monthlyRevenueFromTier.toLocaleString(),
              "/mo"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-gray-500", children: [
              "$",
              tier.annualRevenueFromTier.toLocaleString(),
              "/yr"
            ] })
          ] })
        ] }, tier.tier.id)) })
      ] })
    ] })
  ] });
}

// src/utils/pricing-editor-reducer.ts
function pricingEditorReducer(state, action) {
  switch (action.type) {
    case "SET_PLAN":
      return {
        ...state,
        currentPlan: action.payload,
        selectedTier: null,
        isEditing: false,
        isPreviewMode: false
      };
    case "ADD_TIER":
      if (!state.currentPlan) return state;
      const newTier = {
        ...action.payload,
        sortOrder: state.currentPlan.tiers.length
      };
      return {
        ...state,
        currentPlan: {
          ...state.currentPlan,
          tiers: [...state.currentPlan.tiers, newTier],
          updatedAt: /* @__PURE__ */ new Date()
        }
      };
    case "UPDATE_TIER":
      if (!state.currentPlan) return state;
      const updatedTiers = state.currentPlan.tiers.map(
        (tier) => tier.id === action.payload.id ? { ...tier, ...action.payload.updates } : tier
      );
      return {
        ...state,
        currentPlan: {
          ...state.currentPlan,
          tiers: updatedTiers,
          updatedAt: /* @__PURE__ */ new Date()
        },
        selectedTier: state.selectedTier?.id === action.payload.id ? { ...state.selectedTier, ...action.payload.updates } : state.selectedTier
      };
    case "DELETE_TIER":
      if (!state.currentPlan) return state;
      const filteredTiers = state.currentPlan.tiers.filter(
        (tier) => tier.id !== action.payload
      );
      return {
        ...state,
        currentPlan: {
          ...state.currentPlan,
          tiers: filteredTiers,
          updatedAt: /* @__PURE__ */ new Date()
        },
        selectedTier: state.selectedTier?.id === action.payload ? null : state.selectedTier
      };
    case "REORDER_TIERS":
      if (!state.currentPlan) return state;
      const reorderedTiers = action.payload.map((tierId, index) => {
        const tier = state.currentPlan.tiers.find((t) => t.id === tierId);
        return tier ? { ...tier, sortOrder: index } : null;
      }).filter(Boolean);
      return {
        ...state,
        currentPlan: {
          ...state.currentPlan,
          tiers: reorderedTiers,
          updatedAt: /* @__PURE__ */ new Date()
        }
      };
    case "SET_SELECTED_TIER":
      if (!action.payload) {
        return {
          ...state,
          selectedTier: null
        };
      }
      const selectedTier = state.currentPlan?.tiers.find(
        (tier) => tier.id === action.payload
      );
      return {
        ...state,
        selectedTier: selectedTier || null
      };
    case "TOGGLE_EDIT_MODE":
      return {
        ...state,
        isEditing: !state.isEditing,
        selectedTier: state.isEditing ? null : state.selectedTier
      };
    case "TOGGLE_PREVIEW_MODE":
      return {
        ...state,
        isPreviewMode: !state.isPreviewMode,
        selectedTier: state.isPreviewMode ? null : state.selectedTier
      };
    case "START_AB_TEST":
      return {
        ...state,
        activeABTest: action.payload
      };
    case "STOP_AB_TEST":
      return {
        ...state,
        activeABTest: null
      };
    case "ADD_GRANDFATHERING_RULE":
      return {
        ...state,
        grandfatheringRules: [...state.grandfatheringRules, action.payload]
      };
    case "UPDATE_GRANDFATHERING_RULE":
      return {
        ...state,
        grandfatheringRules: state.grandfatheringRules.map(
          (rule) => rule.id === action.payload.id ? { ...rule, ...action.payload.updates } : rule
        )
      };
    case "DELETE_GRANDFATHERING_RULE":
      return {
        ...state,
        grandfatheringRules: state.grandfatheringRules.filter(
          (rule) => rule.id !== action.payload
        )
      };
    case "SAVE_HISTORY":
      if (!state.currentPlan) return state;
      return {
        ...state,
        history: [...state.history, state.currentPlan],
        undoStack: [...state.undoStack, state.currentPlan],
        redoStack: []
      };
    case "UNDO":
      if (state.undoStack.length === 0) return state;
      const previousPlan = state.undoStack[state.undoStack.length - 1];
      const newUndoStack = state.undoStack.slice(0, -1);
      return {
        ...state,
        currentPlan: previousPlan || null,
        undoStack: newUndoStack,
        redoStack: state.currentPlan ? [state.currentPlan, ...state.redoStack] : state.redoStack,
        selectedTier: null
      };
    case "REDO":
      if (state.redoStack.length === 0) return state;
      const nextPlan = state.redoStack[0];
      const newRedoStack = state.redoStack.slice(1);
      return {
        ...state,
        currentPlan: nextPlan || null,
        undoStack: state.currentPlan ? [...state.undoStack, state.currentPlan] : state.undoStack,
        redoStack: newRedoStack,
        selectedTier: null
      };
    case "RESET":
      return {
        ...state,
        currentPlan: state.history.length > 0 ? state.history[0] || null : null,
        selectedTier: null,
        isEditing: false,
        isPreviewMode: false,
        activeABTest: null,
        undoStack: [],
        redoStack: []
      };
    default:
      return state;
  }
}
function createEmptyPlan() {
  return {
    id: `plan-${Date.now()}`,
    name: "New Pricing Plan",
    description: "A new pricing plan",
    tiers: [],
    currency: "USD",
    isActive: true,
    version: "1.0.0",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  };
}
function createEmptyTier() {
  return {
    id: `tier-${Date.now()}`,
    name: "New Tier",
    description: "Add your description here",
    price: 0,
    currency: "USD",
    interval: "month",
    intervalCount: 1,
    features: [],
    isPopular: false,
    isActive: true,
    sortOrder: 0
  };
}
function validatePlan(plan) {
  const errors = [];
  if (!plan.name.trim()) {
    errors.push("Plan name is required");
  }
  if (plan.tiers.length === 0) {
    errors.push("At least one pricing tier is required");
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
function calculatePlanMetrics(plan) {
  const activeTiers = plan.tiers.filter((tier) => tier.isActive);
  const prices = activeTiers.map((tier) => tier.price);
  return {
    totalTiers: plan.tiers.length,
    activeTiers: activeTiers.length,
    averagePrice: prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0,
    priceRange: {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0
    },
    popularTier: plan.tiers.find((tier) => tier.isPopular) || null
  };
}
function PricingEditor({
  initialPlan,
  onSave,
  onPublish,
  onABTestStart,
  onABTestStop,
  onGrandfatheringRuleAdd,
  onGrandfatheringRuleUpdate,
  onGrandfatheringRuleDelete,
  templates = [],
  onTemplateSelect,
  currency = "USD",
  supportedCurrencies = ["USD", "EUR", "GBP", "CAD", "AUD"],
  features = [],
  limits = [],
  className,
  style
}) {
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
    redoStack: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const handleTierAdd = useCallback((tier) => {
    dispatch({ type: "ADD_TIER", payload: tier });
  }, []);
  const handleTierUpdate = useCallback((id, updates) => {
    dispatch({ type: "UPDATE_TIER", payload: { id, updates } });
  }, []);
  const handleTierDelete = useCallback((id) => {
    dispatch({ type: "DELETE_TIER", payload: id });
  }, []);
  const handleTierReorder = useCallback((tierIds) => {
    dispatch({ type: "REORDER_TIERS", payload: tierIds });
  }, []);
  const handleTierSelect = useCallback((tierId) => {
    dispatch({ type: "SET_SELECTED_TIER", payload: tierId });
  }, []);
  const handleEditToggle = useCallback(() => {
    dispatch({ type: "TOGGLE_EDIT_MODE" });
  }, []);
  const handlePreviewToggle = useCallback(() => {
    dispatch({ type: "TOGGLE_PREVIEW_MODE" });
  }, []);
  const handleSave = useCallback(async () => {
    if (!state.currentPlan || !onSave) return;
    setIsLoading(true);
    try {
      await onSave(state.currentPlan);
      dispatch({ type: "SAVE_HISTORY" });
    } catch (error) {
      console.error("Failed to save plan:", error);
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
      console.error("Failed to publish plan:", error);
    } finally {
      setIsLoading(false);
    }
  }, [state.currentPlan, onPublish]);
  const handleABTestStart = useCallback(async (abTest) => {
    dispatch({ type: "START_AB_TEST", payload: abTest });
    await onABTestStart?.(abTest);
  }, [onABTestStart]);
  const handleABTestStop = useCallback(async () => {
    if (!state.activeABTest) return;
    dispatch({ type: "STOP_AB_TEST" });
    await onABTestStop?.(state.activeABTest.id);
  }, [state.activeABTest, onABTestStop]);
  const handleUndo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);
  const handleRedo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);
  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);
  if (!state.currentPlan) {
    return /* @__PURE__ */ jsx("div", { className: cn("flex items-center justify-center h-96", className), style, children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-700 mb-2", children: "No Pricing Plan" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 mb-4", children: "Select a template or create a new plan to get started." }),
      /* @__PURE__ */ jsx(
        TemplateSelector,
        {
          templates,
          onSelect: onTemplateSelect || ((_template) => {
          }),
          onCreate: () => {
          }
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsx(DndProvider, { backend: HTML5Backend, children: /* @__PURE__ */ jsxs("div", { className: cn("pricing-editor", className), style, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900", children: state.currentPlan.name }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: state.currentPlan.description })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleEditToggle,
            className: cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              state.isEditing ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            ),
            children: state.isEditing ? "Exit Edit" : "Edit"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handlePreviewToggle,
            className: cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              state.isPreviewMode ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            ),
            children: state.isPreviewMode ? "Exit Preview" : "Preview"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSave,
            disabled: isLoading,
            className: "px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50",
            children: isLoading ? "Saving..." : "Save"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handlePublish,
            disabled: isLoading,
            className: "px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50",
            children: isLoading ? "Publishing..." : "Publish"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Pricing Tiers" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Drag and drop to reorder tiers. Click to edit details." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsx(AnimatePresence, { children: state.currentPlan.tiers.map((tier, index) => /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 },
            transition: { duration: 0.2 },
            children: /* @__PURE__ */ jsx(
              PricingTierCard,
              {
                tier,
                index,
                isSelected: state.selectedTier?.id === tier.id,
                isEditing: state.isEditing,
                onSelect: () => handleTierSelect(tier.id),
                onUpdate: (updates) => handleTierUpdate(tier.id, updates),
                onDelete: () => handleTierDelete(tier.id),
                onReorder: handleTierReorder
              }
            )
          },
          tier.id
        )) }) }),
        state.isEditing && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              const newTier = {
                id: `tier-${Date.now()}`,
                name: "New Tier",
                description: "Add your description here",
                price: 0,
                currency,
                interval: "month",
                intervalCount: 1,
                features: [],
                isPopular: false,
                isActive: true,
                sortOrder: state.currentPlan.tiers.length
              };
              handleTierAdd(newTier);
            },
            className: "w-full mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors",
            children: "+ Add New Tier"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        state.selectedTier && /* @__PURE__ */ jsx(
          PricingTierEditor,
          {
            tier: state.selectedTier,
            onUpdate: (updates) => handleTierUpdate(state.selectedTier.id, updates),
            onClose: () => handleTierSelect(null),
            currency,
            supportedCurrencies,
            features,
            limits
          }
        ),
        /* @__PURE__ */ jsx(
          ABTestPanel,
          {
            activeTest: state.activeABTest,
            onStart: handleABTestStart,
            onStop: handleABTestStop,
            currentPlan: state.currentPlan
          }
        ),
        /* @__PURE__ */ jsx(
          GrandfatheringPanel,
          {
            rules: state.grandfatheringRules,
            onAdd: onGrandfatheringRuleAdd || (() => {
            }),
            onUpdate: onGrandfatheringRuleUpdate || (() => {
            }),
            onDelete: onGrandfatheringRuleDelete || (() => {
            })
          }
        ),
        /* @__PURE__ */ jsx(
          PricingCalculator,
          {
            plan: state.currentPlan,
            currency
          }
        )
      ] })
    ] }),
    state.isPreviewMode && /* @__PURE__ */ jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsx(
      PricingPreview,
      {
        plan: state.currentPlan,
        currency
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleUndo,
            disabled: state.undoStack.length === 0,
            className: "px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50",
            children: "Undo"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleRedo,
            disabled: state.redoStack.length === 0,
            className: "px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50",
            children: "Redo"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleReset,
            className: "px-3 py-1 text-sm text-red-600 hover:text-red-800",
            children: "Reset"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-500", children: [
        "Version ",
        state.currentPlan.version,
        " \u2022 Last updated ",
        state.currentPlan.updatedAt.toLocaleDateString()
      ] })
    ] })
  ] }) });
}
var PricingTierSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  currency: z.string().default("USD"),
  interval: z.enum(["day", "week", "month", "year"]),
  intervalCount: z.number().positive().default(1),
  features: z.array(z.string()),
  limits: z.record(z.string(), z.number().nonnegative()).optional(),
  metadata: z.record(z.string()).optional(),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0)
});
var PricingPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tiers: z.array(PricingTierSchema),
  currency: z.string().default("USD"),
  isActive: z.boolean().default(true),
  version: z.string().default("1.0.0"),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.string()).optional()
});
var ABTestSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  planA: z.string(),
  // Plan ID
  planB: z.string(),
  // Plan ID
  trafficSplit: z.number().min(0).max(1).default(0.5),
  // 50/50 split
  startDate: z.date(),
  endDate: z.date().optional(),
  isActive: z.boolean().default(true),
  metrics: z.object({
    planAConversions: z.number().default(0),
    planBConversions: z.number().default(0),
    planARevenue: z.number().default(0),
    planBRevenue: z.number().default(0)
  }),
  createdAt: z.date(),
  updatedAt: z.date()
});
var GrandfatheringRuleSchema = z.object({
  id: z.string(),
  planId: z.string(),
  customerSegment: z.string(),
  // e.g., "early-adopters", "enterprise"
  conditions: z.object({
    signupDateBefore: z.date().optional(),
    hasFeature: z.string().optional(),
    customCondition: z.string().optional()
  }),
  actions: z.object({
    keepCurrentPrice: z.boolean().default(true),
    addBonusFeatures: z.array(z.string()).default([]),
    extendTrial: z.number().optional(),
    // days
    customDiscount: z.number().optional()
    // percentage
  }),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
});
var PricingTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(["saas", "ecommerce", "marketplace", "api", "ai", "custom"]),
  preview: z.string(),
  template: PricingPlanSchema,
  isPublic: z.boolean().default(false),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export { ABTestSchema, GrandfatheringRuleSchema, PricingEditor, PricingPlanSchema, PricingTemplateSchema, PricingTierCard, PricingTierSchema, calculatePlanMetrics, cn, createEmptyPlan, createEmptyTier, PricingEditor as default, pricingEditorReducer, validatePlan };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map