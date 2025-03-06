import React, { useState } from 'react';
import { Color } from '../types';
import { useColors, ColorFormProps } from '../hooks/useColors';

const ColorForm: React.FC<ColorFormProps> = ({
  initialColor,
  onSave,
  onCancel,
}) => {
  const { saveColor, updateColor, fetchColors } = useColors();
  const [color, setColor] = useState<Partial<Color>>(
    initialColor || {
      name: '',
      code: '',
      hex: '#000000',
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialColor) {
        await updateColor(initialColor.id, color);
      } else {
        await saveColor(color as Omit<Color, 'id'>);
      }
      await fetchColors();
      onSave();
    } catch (error) {
      console.error('Error saving color:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color Name
        </label>
        <input
          type="text"
          value={color.name}
          onChange={(e) => setColor({ ...color, name: e.target.value })}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color Code
        </label>
        <input
          type="text"
          value={color.code}
          onChange={(e) => setColor({ ...color, code: e.target.value.toUpperCase() })}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color Hex
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={color.hex}
            onChange={(e) => setColor({ ...color, hex: e.target.value })}
            className="w-12 h-12 p-1 rounded cursor-pointer"
          />
          <input
            type="text"
            value={color.hex}
            onChange={(e) => setColor({ ...color, hex: e.target.value })}
            className="flex-1 p-2 border rounded-md"
            pattern="^#[0-9A-Fa-f]{6}$"
            title="Please enter a valid hex color code (e.g., #FF0000)"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {initialColor ? 'Update' : 'Create'} Color
        </button>
      </div>
    </form>
  );
};

export default ColorForm;
