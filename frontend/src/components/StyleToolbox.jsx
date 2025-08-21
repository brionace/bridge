import React from "react";
import {
  Wand2,
  Rows,
  Columns,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
} from "lucide-react";

// Configurable style options
export const STYLE_OPTIONS = [
  {
    label: "Flex Row",
    icon: <Rows size={20} />,
    css: "display: flex; flex-direction: row;",
  },
  {
    label: "Flex Column",
    icon: <Columns size={20} />,
    css: "display: flex; flex-direction: column;",
  },
  {
    label: "Center Vertically",
    icon: <AlignVerticalJustifyCenter size={20} />,
    css: "align-items: center;",
  },
  {
    label: "Center Horizontally",
    icon: <AlignHorizontalJustifyCenter size={20} />,
    css: "justify-content: center;",
  },
  {
    label: "Magic (Example)",
    icon: <Wand2 size={20} />,
    css: "box-shadow: 0 2px 8px #888;",
  },
  // Add more styles here
];

export default function StyleToolbox({ onInsert, onClose }) {
  const [selected, setSelected] = React.useState([]);

  function handleToggle(css) {
    setSelected((prev) =>
      prev.includes(css) ? prev.filter((s) => s !== css) : [...prev, css]
    );
  }

  function handleInsert() {
    if (selected.length) {
      onInsert(selected.join(" "));
      setSelected([]);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
        <h3 className="font-semibold mb-2">Style Toolbox</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              className={`flex items-center gap-2 px-2 py-1 rounded border ${
                selected.includes(opt.css)
                  ? "bg-blue-100 border-blue-400"
                  : "bg-gray-50"
              }`}
              onClick={() => handleToggle(opt.css)}
              type="button"
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-1 rounded bg-gray-200" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white"
            onClick={handleInsert}
          >
            Insert Styles
          </button>
        </div>
      </div>
    </div>
  );
}
