import React3, { useState, useReducer, useCallback, useMemo } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Star, Check, X, Trash2, GripVertical } from 'lucide-react';
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
  return /* @__PURE__ */ React.createElement(
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
      onClick: onSelect
    },
    tier.isPopular && /* @__PURE__ */ React.createElement("div", { className: "absolute -top-2 left-1/2 transform -translate-x-1/2" }, /* @__PURE__ */ React.createElement("div", { className: "bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center" }, /* @__PURE__ */ React.createElement(Star, { className: "w-3 h-3 mr-1" }), "Most Popular")),
    /* @__PURE__ */ React.createElement("div", { className: "p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, isEditingName ? /* @__PURE__ */ React.createElement(
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
    ) : /* @__PURE__ */ React.createElement(
      "h3",
      {
        className: "text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600",
        onDoubleClick: () => setIsEditingName(true)
      },
      tier.name
    ), isEditingDescription ? /* @__PURE__ */ React.createElement(
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
    ) : /* @__PURE__ */ React.createElement(
      "p",
      {
        className: "text-sm text-gray-600 mt-1 cursor-pointer hover:text-blue-600",
        onDoubleClick: () => setIsEditingDescription(true)
      },
      tier.description || "Click to add description..."
    )), isEditing && /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2 ml-4" }, /* @__PURE__ */ React.createElement(
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
        title: tier.isPopular ? "Remove popular badge" : "Mark as popular"
      },
      /* @__PURE__ */ React.createElement(Star, { className: "w-4 h-4" })
    ), /* @__PURE__ */ React.createElement(
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
        title: tier.isActive ? "Deactivate tier" : "Activate tier"
      },
      tier.isActive ? /* @__PURE__ */ React.createElement(Check, { className: "w-4 h-4" }) : /* @__PURE__ */ React.createElement(X, { className: "w-4 h-4" })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: (e) => {
          e.stopPropagation();
          onDelete();
        },
        className: "p-1 text-red-600 hover:text-red-700 rounded transition-colors",
        title: "Delete tier"
      },
      /* @__PURE__ */ React.createElement(Trash2, { className: "w-4 h-4" })
    ))), /* @__PURE__ */ React.createElement("div", { className: "mt-4" }, isEditingPrice ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("span", { className: "text-3xl font-bold text-gray-900" }, "$"), /* @__PURE__ */ React.createElement(
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
    )) : /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "flex items-center cursor-pointer hover:text-blue-600",
        onDoubleClick: () => setIsEditingPrice(true)
      },
      /* @__PURE__ */ React.createElement("span", { className: "text-3xl font-bold text-gray-900" }, "$", tier.price.toFixed(2)),
      /* @__PURE__ */ React.createElement("span", { className: "text-sm text-gray-500 ml-2" }, "/ ", tier.interval)
    )), /* @__PURE__ */ React.createElement("div", { className: "mt-4" }, /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-semibold text-gray-700 mb-2" }, "Features"), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, tier.features.length > 0 ? tier.features.map((feature, featureIndex) => /* @__PURE__ */ React.createElement("div", { key: featureIndex, className: "flex items-center text-sm text-gray-600" }, /* @__PURE__ */ React.createElement(Check, { className: "w-4 h-4 text-green-500 mr-2 flex-shrink-0" }), /* @__PURE__ */ React.createElement("span", null, feature))) : /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-400 italic" }, "No features added yet"))), tier.limits && Object.keys(tier.limits).length > 0 && /* @__PURE__ */ React.createElement("div", { className: "mt-4" }, /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-semibold text-gray-700 mb-2" }, "Limits"), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, Object.entries(tier.limits).map(([key, value]) => /* @__PURE__ */ React.createElement("div", { key, className: "flex items-center justify-between text-sm text-gray-600" }, /* @__PURE__ */ React.createElement("span", { className: "capitalize" }, key.replace(/([A-Z])/g, " $1").toLowerCase()), /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, value.toLocaleString()))))), tier.metadata && Object.keys(tier.metadata).length > 0 && /* @__PURE__ */ React.createElement("div", { className: "mt-4" }, /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-semibold text-gray-700 mb-2" }, "Metadata"), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, Object.entries(tier.metadata).map(([key, value]) => /* @__PURE__ */ React.createElement("div", { key, className: "flex items-center justify-between text-sm text-gray-600" }, /* @__PURE__ */ React.createElement("span", { className: "capitalize" }, key), /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, String(value))))))),
    isEditing && /* @__PURE__ */ React.createElement("div", { className: "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" }, /* @__PURE__ */ React.createElement(GripVertical, { className: "w-4 h-4 text-gray-400" })),
    /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-2 right-2 flex items-center space-x-2" }, !tier.isActive && /* @__PURE__ */ React.createElement("div", { className: "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium" }, "Inactive"), tier.isPopular && /* @__PURE__ */ React.createElement("div", { className: "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium" }, "Popular"))
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
  return /* @__PURE__ */ React3.createElement("div", { className: "bg-white border rounded-lg p-4" }, /* @__PURE__ */ React3.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React3.createElement("h3", { className: "text-lg font-semibold" }, "Edit Tier"), /* @__PURE__ */ React3.createElement("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600" }, "\xD7")), /* @__PURE__ */ React3.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Name"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "text",
      value: formData.name,
      onChange: (e) => handleChange("name", e.target.value),
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    }
  )), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Description"), /* @__PURE__ */ React3.createElement(
    "textarea",
    {
      value: formData.description,
      onChange: (e) => handleChange("description", e.target.value),
      rows: 3,
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    }
  )), /* @__PURE__ */ React3.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Price"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "number",
      value: formData.price,
      onChange: (e) => handleChange("price", parseFloat(e.target.value) || 0),
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    }
  )), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Currency"), /* @__PURE__ */ React3.createElement(
    "select",
    {
      value: formData.currency,
      onChange: (e) => handleChange("currency", e.target.value),
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    },
    supportedCurrencies.map((curr) => /* @__PURE__ */ React3.createElement("option", { key: curr, value: curr }, curr))
  ))), /* @__PURE__ */ React3.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Interval"), /* @__PURE__ */ React3.createElement(
    "select",
    {
      value: formData.interval,
      onChange: (e) => handleChange("interval", e.target.value),
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    },
    /* @__PURE__ */ React3.createElement("option", { value: "month" }, "Monthly"),
    /* @__PURE__ */ React3.createElement("option", { value: "year" }, "Yearly")
  )), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Interval Count"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "number",
      value: formData.intervalCount,
      onChange: (e) => handleChange("intervalCount", parseInt(e.target.value) || 1),
      min: "1",
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    }
  ))), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Features"), /* @__PURE__ */ React3.createElement("div", { className: "space-y-2" }, features.map((feature, index) => /* @__PURE__ */ React3.createElement("label", { key: index, className: "flex items-center" }, /* @__PURE__ */ React3.createElement(
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
  ), /* @__PURE__ */ React3.createElement("span", { className: "text-sm text-gray-700" }, feature))))), /* @__PURE__ */ React3.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "checkbox",
      id: "isActive",
      checked: formData.isActive,
      onChange: (e) => handleChange("isActive", e.target.checked),
      className: "mr-2"
    }
  ), /* @__PURE__ */ React3.createElement("label", { htmlFor: "isActive", className: "text-sm text-gray-700" }, "Active")), /* @__PURE__ */ React3.createElement("div", { className: "flex justify-end space-x-2" }, /* @__PURE__ */ React3.createElement(
    "button",
    {
      type: "button",
      onClick: onClose,
      className: "px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
    },
    "Cancel"
  ), /* @__PURE__ */ React3.createElement(
    "button",
    {
      type: "submit",
      className: "px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
    },
    "Save Changes"
  ))));
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
    return /* @__PURE__ */ React3.createElement("div", { className: "bg-white border rounded-lg p-4" }, /* @__PURE__ */ React3.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React3.createElement("h3", { className: "text-lg font-semibold" }, "Active A/B Test"), /* @__PURE__ */ React3.createElement(
      "button",
      {
        onClick: onStop,
        className: "px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
      },
      "Stop Test"
    )), /* @__PURE__ */ React3.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("h4", { className: "font-medium text-gray-900" }, activeTest.name), /* @__PURE__ */ React3.createElement("p", { className: "text-sm text-gray-600" }, activeTest.description)), /* @__PURE__ */ React3.createElement("div", { className: "grid grid-cols-2 gap-4 text-sm" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("span", { className: "text-gray-500" }, "Variant:"), /* @__PURE__ */ React3.createElement("span", { className: "ml-2 font-medium" }, activeTest.variantName)), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("span", { className: "text-gray-500" }, "Traffic Split:"), /* @__PURE__ */ React3.createElement("span", { className: "ml-2 font-medium" }, activeTest.trafficSplit, "%")), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("span", { className: "text-gray-500" }, "Duration:"), /* @__PURE__ */ React3.createElement("span", { className: "ml-2 font-medium" }, activeTest.duration, " days")), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("span", { className: "text-gray-500" }, "Status:"), /* @__PURE__ */ React3.createElement("span", { className: "ml-2 font-medium text-green-600 capitalize" }, activeTest.status))), /* @__PURE__ */ React3.createElement("div", { className: "pt-3 border-t" }, /* @__PURE__ */ React3.createElement("h5", { className: "font-medium text-gray-900 mb-2" }, "Metrics"), /* @__PURE__ */ React3.createElement("div", { className: "grid grid-cols-3 gap-4 text-sm" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("span", { className: "text-gray-500" }, "Users:"), /* @__PURE__ */ React3.createElement("span", { className: "ml-2 font-medium" }, activeTest.metrics.users)), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("span", { className: "text-gray-500" }, "Conversions:"), /* @__PURE__ */ React3.createElement("span", { className: "ml-2 font-medium" }, activeTest.metrics.conversions)), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("span", { className: "text-gray-500" }, "Revenue:"), /* @__PURE__ */ React3.createElement("span", { className: "ml-2 font-medium" }, "$", activeTest.metrics.revenue))))));
  }
  if (isCreating) {
    return /* @__PURE__ */ React3.createElement("div", { className: "bg-white border rounded-lg p-4" }, /* @__PURE__ */ React3.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React3.createElement("h3", { className: "text-lg font-semibold" }, "Create A/B Test"), /* @__PURE__ */ React3.createElement(
      "button",
      {
        onClick: () => setIsCreating(false),
        className: "text-gray-400 hover:text-gray-600"
      },
      "\xD7"
    )), /* @__PURE__ */ React3.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Test Name"), /* @__PURE__ */ React3.createElement(
      "input",
      {
        type: "text",
        value: testConfig.name,
        onChange: (e) => setTestConfig((prev) => ({ ...prev, name: e.target.value })),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      }
    )), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Description"), /* @__PURE__ */ React3.createElement(
      "textarea",
      {
        value: testConfig.description,
        onChange: (e) => setTestConfig((prev) => ({ ...prev, description: e.target.value })),
        rows: 2,
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      }
    )), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Variant Name"), /* @__PURE__ */ React3.createElement(
      "input",
      {
        type: "text",
        value: testConfig.variantName,
        onChange: (e) => setTestConfig((prev) => ({ ...prev, variantName: e.target.value })),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      }
    )), /* @__PURE__ */ React3.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Traffic Split (%)"), /* @__PURE__ */ React3.createElement(
      "input",
      {
        type: "number",
        min: "1",
        max: "99",
        value: testConfig.trafficSplit,
        onChange: (e) => setTestConfig((prev) => ({ ...prev, trafficSplit: parseInt(e.target.value) || 50 })),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      }
    )), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Duration (days)"), /* @__PURE__ */ React3.createElement(
      "input",
      {
        type: "number",
        min: "1",
        value: testConfig.duration,
        onChange: (e) => setTestConfig((prev) => ({ ...prev, duration: parseInt(e.target.value) || 30 })),
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      }
    ))), /* @__PURE__ */ React3.createElement("div", { className: "flex justify-end space-x-2" }, /* @__PURE__ */ React3.createElement(
      "button",
      {
        onClick: () => setIsCreating(false),
        className: "px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
      },
      "Cancel"
    ), /* @__PURE__ */ React3.createElement(
      "button",
      {
        onClick: handleStartTest,
        disabled: !testConfig.name || !testConfig.variantName,
        className: "px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
      },
      "Start Test"
    ))));
  }
  return /* @__PURE__ */ React3.createElement("div", { className: "bg-white border rounded-lg p-4" }, /* @__PURE__ */ React3.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React3.createElement("h3", { className: "text-lg font-semibold" }, "A/B Testing"), /* @__PURE__ */ React3.createElement(
    "button",
    {
      onClick: () => setIsCreating(true),
      className: "px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
    },
    "New Test"
  )), /* @__PURE__ */ React3.createElement("div", { className: "text-center py-8" }, /* @__PURE__ */ React3.createElement("div", { className: "text-gray-400 mb-2" }, /* @__PURE__ */ React3.createElement("svg", { className: "w-12 h-12 mx-auto", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React3.createElement(
    "path",
    {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
      d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    }
  ))), /* @__PURE__ */ React3.createElement("p", { className: "text-gray-500 text-sm" }, "No active A/B tests"), /* @__PURE__ */ React3.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Create a test to compare pricing strategies")));
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
  return /* @__PURE__ */ React3.createElement("div", { className: "bg-white border rounded-lg p-4" }, /* @__PURE__ */ React3.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React3.createElement("h3", { className: "text-lg font-semibold" }, "Grandfathering Rules"), /* @__PURE__ */ React3.createElement(
    "button",
    {
      onClick: () => setIsCreating(true),
      className: "px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
    },
    "Add Rule"
  )), isCreating ? /* @__PURE__ */ React3.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Rule Name"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "text",
      value: formData.name,
      onChange: (e) => setFormData((prev) => ({ ...prev, name: e.target.value })),
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    }
  )), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Description"), /* @__PURE__ */ React3.createElement(
    "textarea",
    {
      value: formData.description,
      onChange: (e) => setFormData((prev) => ({ ...prev, description: e.target.value })),
      rows: 2,
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    }
  )), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Customer Segment"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "text",
      value: formData.customerSegment,
      onChange: (e) => setFormData((prev) => ({ ...prev, customerSegment: e.target.value })),
      placeholder: "e.g., Early adopters, Enterprise customers",
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    }
  )), /* @__PURE__ */ React3.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Original Price"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "number",
      value: formData.originalPrice,
      onChange: (e) => setFormData((prev) => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 })),
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    }
  )), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Grandfathered Price"), /* @__PURE__ */ React3.createElement(
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
  ))), /* @__PURE__ */ React3.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Start Date"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "date",
      value: formData.startDate,
      onChange: (e) => setFormData((prev) => ({ ...prev, startDate: e.target.value })),
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    }
  )), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "End Date (optional)"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "date",
      value: formData.endDate,
      onChange: (e) => setFormData((prev) => ({ ...prev, endDate: e.target.value })),
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    }
  ))), /* @__PURE__ */ React3.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "checkbox",
      id: "isActive",
      checked: formData.isActive,
      onChange: (e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked })),
      className: "mr-2"
    }
  ), /* @__PURE__ */ React3.createElement("label", { htmlFor: "isActive", className: "text-sm text-gray-700" }, "Active")), /* @__PURE__ */ React3.createElement("div", { className: "flex justify-end space-x-2" }, /* @__PURE__ */ React3.createElement(
    "button",
    {
      onClick: handleCancel,
      className: "px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
    },
    "Cancel"
  ), /* @__PURE__ */ React3.createElement(
    "button",
    {
      onClick: handleSubmit,
      disabled: !formData.name || !formData.customerSegment,
      className: "px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
    },
    editingRule ? "Update Rule" : "Add Rule"
  ))) : /* @__PURE__ */ React3.createElement("div", { className: "space-y-3" }, rules.length === 0 ? /* @__PURE__ */ React3.createElement("div", { className: "text-center py-8" }, /* @__PURE__ */ React3.createElement("div", { className: "text-gray-400 mb-2" }, /* @__PURE__ */ React3.createElement(
    "svg",
    {
      className: "w-12 h-12 mx-auto",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24"
    },
    /* @__PURE__ */ React3.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      }
    )
  )), /* @__PURE__ */ React3.createElement("p", { className: "text-gray-500 text-sm" }, "No grandfathering rules"), /* @__PURE__ */ React3.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Add rules to protect existing customers from price changes")) : rules.map((rule) => /* @__PURE__ */ React3.createElement("div", { key: rule.id, className: "border rounded-lg p-3" }, /* @__PURE__ */ React3.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("h4", { className: "font-medium text-gray-900" }, rule.name), /* @__PURE__ */ React3.createElement("p", { className: "text-sm text-gray-600" }, rule.description), /* @__PURE__ */ React3.createElement("div", { className: "mt-2 text-xs text-gray-500" }, /* @__PURE__ */ React3.createElement("span", { className: "mr-4" }, "Segment: ", rule.customerSegment), /* @__PURE__ */ React3.createElement("span", { className: "mr-4" }, "Original: $", rule.originalPrice), /* @__PURE__ */ React3.createElement("span", { className: "mr-4" }, "Grandfathered: $", rule.grandfatheredPrice), /* @__PURE__ */ React3.createElement(
    "span",
    {
      className: `px-2 py-1 rounded text-xs ${rule.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`
    },
    rule.isActive ? "Active" : "Inactive"
  ))), /* @__PURE__ */ React3.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ React3.createElement(
    "button",
    {
      onClick: () => handleEdit(rule),
      className: "text-blue-600 hover:text-blue-800 text-sm"
    },
    "Edit"
  ), /* @__PURE__ */ React3.createElement(
    "button",
    {
      onClick: () => onDelete(rule.id),
      className: "text-red-600 hover:text-red-800 text-sm"
    },
    "Delete"
  )))))));
}
function PricingPreview({ plan, currency }) {
  return /* @__PURE__ */ React3.createElement("div", { className: "bg-white border rounded-lg p-6" }, /* @__PURE__ */ React3.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React3.createElement("h2", { className: "text-3xl font-bold text-gray-900 mb-2" }, plan.name), /* @__PURE__ */ React3.createElement("p", { className: "text-lg text-gray-600" }, plan.description)), /* @__PURE__ */ React3.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" }, plan.tiers.map((tier, index) => /* @__PURE__ */ React3.createElement(
    "div",
    {
      key: tier.id,
      className: `relative border rounded-lg p-6 ${index === 1 ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}`
    },
    index === 1 && /* @__PURE__ */ React3.createElement("div", { className: "absolute -top-3 left-1/2 transform -translate-x-1/2" }, /* @__PURE__ */ React3.createElement("span", { className: "bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium" }, "Most Popular")),
    /* @__PURE__ */ React3.createElement("div", { className: "text-center mb-6" }, /* @__PURE__ */ React3.createElement("h3", { className: "text-xl font-semibold text-gray-900 mb-2" }, tier.name), /* @__PURE__ */ React3.createElement("p", { className: "text-gray-600 text-sm mb-4" }, tier.description), /* @__PURE__ */ React3.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React3.createElement("span", { className: "text-4xl font-bold text-gray-900" }, tier.price === 0 ? "Free" : `$${tier.price}`), tier.price > 0 && /* @__PURE__ */ React3.createElement("span", { className: "text-gray-600 ml-1" }, "/", tier.interval === "month" ? "month" : "year")), tier.price > 0 && tier.intervalCount > 1 && /* @__PURE__ */ React3.createElement("p", { className: "text-sm text-gray-500" }, "Billed every ", tier.intervalCount, " ", tier.interval === "month" ? "months" : "years")),
    /* @__PURE__ */ React3.createElement("div", { className: "space-y-3 mb-6" }, tier.features.map((feature, featureIndex) => /* @__PURE__ */ React3.createElement("div", { key: featureIndex, className: "flex items-start" }, /* @__PURE__ */ React3.createElement(
      "svg",
      {
        className: "w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0",
        fill: "currentColor",
        viewBox: "0 0 20 20"
      },
      /* @__PURE__ */ React3.createElement(
        "path",
        {
          fillRule: "evenodd",
          d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
          clipRule: "evenodd"
        }
      )
    ), /* @__PURE__ */ React3.createElement("span", { className: "text-sm text-gray-700" }, feature)))),
    /* @__PURE__ */ React3.createElement(
      "button",
      {
        className: `w-full py-3 px-4 rounded-lg font-medium transition-colors ${index === 1 ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`
      },
      tier.price === 0 ? "Get Started" : "Choose Plan"
    )
  ))), /* @__PURE__ */ React3.createElement("div", { className: "mt-8 text-center" }, /* @__PURE__ */ React3.createElement("p", { className: "text-sm text-gray-500" }, "All plans include 24/7 support and a 30-day money-back guarantee")));
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
  return /* @__PURE__ */ React3.createElement("div", { className: "bg-white border rounded-lg p-6" }, /* @__PURE__ */ React3.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React3.createElement("h3", { className: "text-xl font-semibold text-gray-900 mb-2" }, "Choose a Template"), /* @__PURE__ */ React3.createElement("p", { className: "text-gray-600" }, "Start with a pre-built pricing structure or create your own")), /* @__PURE__ */ React3.createElement("div", { className: "mb-6 space-y-4" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search templates...",
      value: searchQuery,
      onChange: (e) => setSearchQuery(e.target.value),
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    }
  )), /* @__PURE__ */ React3.createElement("div", { className: "flex flex-wrap gap-2" }, categories.map((category) => /* @__PURE__ */ React3.createElement(
    "button",
    {
      key: category,
      onClick: () => setSelectedCategory(category),
      className: `px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedCategory === category ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`
    },
    category === "all" ? "All Templates" : category
  )))), /* @__PURE__ */ React3.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6" }, filteredTemplates.map((template) => /* @__PURE__ */ React3.createElement(
    "div",
    {
      key: template.id,
      onClick: () => onSelect(template),
      className: "border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
    },
    /* @__PURE__ */ React3.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React3.createElement("h4", { className: "font-medium text-gray-900 mb-1" }, template.name), /* @__PURE__ */ React3.createElement("p", { className: "text-sm text-gray-600" }, template.description)),
    /* @__PURE__ */ React3.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React3.createElement("div", { className: "bg-gray-50 rounded p-3 text-xs text-gray-600 font-mono" }, template.preview)),
    /* @__PURE__ */ React3.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React3.createElement("span", { className: "text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded" }, template.category), /* @__PURE__ */ React3.createElement("button", { className: "text-blue-600 hover:text-blue-800 text-sm font-medium" }, "Use Template \u2192"))
  ))), filteredTemplates.length === 0 && /* @__PURE__ */ React3.createElement("div", { className: "text-center py-8" }, /* @__PURE__ */ React3.createElement("div", { className: "text-gray-400 mb-2" }, /* @__PURE__ */ React3.createElement(
    "svg",
    {
      className: "w-12 h-12 mx-auto",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24"
    },
    /* @__PURE__ */ React3.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      }
    )
  )), /* @__PURE__ */ React3.createElement("p", { className: "text-gray-500 text-sm" }, "No templates found"), /* @__PURE__ */ React3.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Try adjusting your search or filters")), /* @__PURE__ */ React3.createElement("div", { className: "border-t pt-6" }, /* @__PURE__ */ React3.createElement("div", { className: "text-center" }, /* @__PURE__ */ React3.createElement("h4", { className: "font-medium text-gray-900 mb-2" }, "Don't see what you need?"), /* @__PURE__ */ React3.createElement("p", { className: "text-sm text-gray-600 mb-4" }, "Create a custom pricing plan from scratch"), /* @__PURE__ */ React3.createElement(
    "button",
    {
      onClick: onCreate,
      className: "px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
    },
    "Create Custom Plan"
  ))));
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
  return /* @__PURE__ */ React3.createElement("div", { className: "bg-white border rounded-lg p-4" }, /* @__PURE__ */ React3.createElement("h3", { className: "text-lg font-semibold mb-4" }, "Revenue Calculator"), /* @__PURE__ */ React3.createElement("div", { className: "space-y-4 mb-6" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Current Monthly Revenue"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "number",
      value: inputs.monthlyRevenue,
      onChange: (e) => handleInputChange("monthlyRevenue", parseFloat(e.target.value) || 0),
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    }
  )), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Customer Count"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "number",
      value: inputs.customerCount,
      onChange: (e) => handleInputChange("customerCount", parseInt(e.target.value) || 0),
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    }
  )), /* @__PURE__ */ React3.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Churn Rate (%)"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "number",
      value: inputs.churnRate,
      onChange: (e) => handleInputChange("churnRate", parseFloat(e.target.value) || 0),
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    }
  )), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Growth Rate (%)"), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "number",
      value: inputs.growthRate,
      onChange: (e) => handleInputChange("growthRate", parseFloat(e.target.value) || 0),
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    }
  )))), /* @__PURE__ */ React3.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React3.createElement("div", { className: "bg-gray-50 rounded-lg p-4" }, /* @__PURE__ */ React3.createElement("h4", { className: "font-medium text-gray-900 mb-3" }, "Projected Revenue"), /* @__PURE__ */ React3.createElement("div", { className: "grid grid-cols-2 gap-4 text-sm" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("span", { className: "text-gray-500" }, "Monthly:"), /* @__PURE__ */ React3.createElement("span", { className: "ml-2 font-medium" }, "$", calculations.totalMonthlyRevenue.toLocaleString())), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("span", { className: "text-gray-500" }, "Annual:"), /* @__PURE__ */ React3.createElement("span", { className: "ml-2 font-medium" }, "$", calculations.totalAnnualRevenue.toLocaleString())))), /* @__PURE__ */ React3.createElement("div", { className: "bg-gray-50 rounded-lg p-4" }, /* @__PURE__ */ React3.createElement("h4", { className: "font-medium text-gray-900 mb-3" }, "Customer Metrics"), /* @__PURE__ */ React3.createElement("div", { className: "grid grid-cols-2 gap-4 text-sm" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("span", { className: "text-gray-500" }, "Monthly Churn:"), /* @__PURE__ */ React3.createElement("span", { className: "ml-2 font-medium" }, calculations.totalMonthlyChurn.toFixed(0))), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("span", { className: "text-gray-500" }, "New Customers:"), /* @__PURE__ */ React3.createElement("span", { className: "ml-2 font-medium" }, calculations.totalMonthlyNewCustomers.toFixed(0))), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("span", { className: "text-gray-500" }, "Net Growth:"), /* @__PURE__ */ React3.createElement(
    "span",
    {
      className: `ml-2 font-medium ${calculations.totalNetGrowth >= 0 ? "text-green-600" : "text-red-600"}`
    },
    calculations.totalNetGrowth >= 0 ? "+" : "",
    calculations.totalNetGrowth.toFixed(0)
  )))), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("h4", { className: "font-medium text-gray-900 mb-3" }, "Tier Breakdown"), /* @__PURE__ */ React3.createElement("div", { className: "space-y-2" }, calculations.tierMetrics.map((tier, index) => /* @__PURE__ */ React3.createElement("div", { key: tier.tier.id, className: "flex items-center justify-between text-sm" }, /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("span", { className: "font-medium" }, tier.tier.name), /* @__PURE__ */ React3.createElement("span", { className: "text-gray-500 ml-2" }, "(", tier.customersAtTier.toFixed(0), " customers)")), /* @__PURE__ */ React3.createElement("div", { className: "text-right" }, /* @__PURE__ */ React3.createElement("div", { className: "font-medium" }, "$", tier.monthlyRevenueFromTier.toLocaleString(), "/mo"), /* @__PURE__ */ React3.createElement("div", { className: "text-gray-500" }, "$", tier.annualRevenueFromTier.toLocaleString(), "/yr"))))))));
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
        currentPlan: previousPlan,
        undoStack: newUndoStack,
        redoStack: [state.currentPlan, ...state.redoStack],
        selectedTier: null
      };
    case "REDO":
      if (state.redoStack.length === 0) return state;
      const nextPlan = state.redoStack[0];
      const newRedoStack = state.redoStack.slice(1);
      return {
        ...state,
        currentPlan: nextPlan,
        undoStack: [...state.undoStack, state.currentPlan],
        redoStack: newRedoStack,
        selectedTier: null
      };
    case "RESET":
      return {
        ...state,
        currentPlan: state.history.length > 0 ? state.history[0] : null,
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

// src/components/pricing-editor.tsx
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
    return /* @__PURE__ */ React.createElement("div", { className: cn("flex items-center justify-center h-96", className), style }, /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-semibold text-gray-700 mb-2" }, "No Pricing Plan"), /* @__PURE__ */ React.createElement("p", { className: "text-gray-500 mb-4" }, "Select a template or create a new plan to get started."), /* @__PURE__ */ React.createElement(
      TemplateSelector,
      {
        templates,
        onSelect: onTemplateSelect || ((_template) => {
        }),
        onCreate: () => {
        }
      }
    )));
  }
  return /* @__PURE__ */ React.createElement(DndProvider, { backend: HTML5Backend }, /* @__PURE__ */ React.createElement("div", { className: cn("pricing-editor", className), style }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-gray-900" }, state.currentPlan.name), /* @__PURE__ */ React.createElement("p", { className: "text-gray-600" }, state.currentPlan.description)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleEditToggle,
      className: cn(
        "px-4 py-2 rounded-md text-sm font-medium transition-colors",
        state.isEditing ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      )
    },
    state.isEditing ? "Exit Edit" : "Edit"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handlePreviewToggle,
      className: cn(
        "px-4 py-2 rounded-md text-sm font-medium transition-colors",
        state.isPreviewMode ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      )
    },
    state.isPreviewMode ? "Exit Preview" : "Preview"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleSave,
      disabled: isLoading,
      className: "px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
    },
    isLoading ? "Saving..." : "Save"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handlePublish,
      disabled: isLoading,
      className: "px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
    },
    isLoading ? "Publishing..." : "Publish"
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "lg:col-span-2" }, /* @__PURE__ */ React.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, "Pricing Tiers"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-600" }, "Drag and drop to reorder tiers. Click to edit details.")), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement(AnimatePresence, null, state.currentPlan.tiers.map((tier, index) => /* @__PURE__ */ React.createElement(
    motion.div,
    {
      key: tier.id,
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.2 }
    },
    /* @__PURE__ */ React.createElement(
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
  )))), state.isEditing && /* @__PURE__ */ React.createElement(
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
      className: "w-full mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
    },
    "+ Add New Tier"
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, state.selectedTier && /* @__PURE__ */ React.createElement(
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
  ), /* @__PURE__ */ React.createElement(
    ABTestPanel,
    {
      activeTest: state.activeABTest,
      onStart: handleABTestStart,
      onStop: handleABTestStop,
      currentPlan: state.currentPlan
    }
  ), /* @__PURE__ */ React.createElement(
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
  ), /* @__PURE__ */ React.createElement(
    PricingCalculator,
    {
      plan: state.currentPlan,
      currency
    }
  ))), state.isPreviewMode && /* @__PURE__ */ React.createElement("div", { className: "mt-8" }, /* @__PURE__ */ React.createElement(
    PricingPreview,
    {
      plan: state.currentPlan,
      currency
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "mt-6 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleUndo,
      disabled: state.undoStack.length === 0,
      className: "px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
    },
    "Undo"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleRedo,
      disabled: state.redoStack.length === 0,
      className: "px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
    },
    "Redo"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleReset,
      className: "px-3 py-1 text-sm text-red-600 hover:text-red-800"
    },
    "Reset"
  )), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-gray-500" }, "Version ", state.currentPlan.version, " \u2022 Last updated ", state.currentPlan.updatedAt.toLocaleDateString()))));
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