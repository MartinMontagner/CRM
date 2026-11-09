import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { motion, AnimatePresence } from 'framer-motion';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  error?: string;
}

const predefinedColors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  '#64748b', '#374151', '#000000', '#ffffff'
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Color
      </label>
      
      {/* Color preview button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 rounded-lg border-2 flex items-center px-3 gap-3 transition-colors ${
          error ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div
          className="w-6 h-6 rounded-full border border-gray-300"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-mono">{color}</span>
      </button>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Color picker dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Picker content */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-[-150%] left-[10%] md:left-[40%] mt-2 bg-white rounded-lg shadow-lg border z-50 p-4"
            >
              {/* Predefined colors */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Colores predefinidos</p>
                <div className="grid grid-cols-6 gap-2">
                  {predefinedColors.map((preColor) => (
                    <button
                      key={preColor}
                      type="button"
                      onClick={() => {
                        onChange(preColor);
                        setIsOpen(false);
                      }}
                      className="w-8 h-8 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: preColor }}
                    />
                  ))}
                </div>
              </div>

              {/* Custom color picker */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Color personalizado</p>
                <HexColorPicker
                  color={color}
                  onChange={onChange}
                />
              </div>

              {/* Input para hex */}
              <div className="mt-3">
                <input
                  type="text"
                  value={color}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded font-mono"
                  placeholder="#000000"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};