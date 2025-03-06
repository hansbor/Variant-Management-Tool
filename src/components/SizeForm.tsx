import React, { useState } from 'react';
import { Size } from '../types';
import { useSizes, SizeFormProps } from '../hooks/useSizes';
import { AlertCircle } from 'lucide-react';

const SizeForm: React.FC<SizeFormProps> = ({
  initialSize,
  onSave,
  onCancel,
}) => {
  const { sizes, saveSize, updateSize, fetchSizes } = useSizes();
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState<Partial<Size>>(
    initialSize || {
      name: '',
      code: '',
      category: 'General',
    }
  );

  const categories = [
    'General',
    'Clothing',
    'Footwear',
    'Accessories',
    'Headwear',
    'Underwear'
  ];

  const getDefaultCode = (category: string) => {
    switch (category) {
      case 'Clothing':
        return 'M';  // Medium is a common default
      case 'Footwear':
        return '41'; // Common EU size
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check for duplicate code
    const isDuplicateCode = sizes.some(
      existingSize => 
        existingSize.code === size.code && 
        existingSize.id !== initialSize?.id
    );

    if (isDuplicateCode) {
      setError(`Size code "${size.code}" already exists. Please use a unique code.`);
      return;
    }

    try {
      if (initialSize) {
        await updateSize(initialSize.id, size);
      } else {
        await saveSize(size as Omit<Size, 'id'>);
      }
      await fetchSizes();
      onSave();
    } catch (error) {
      console.error('Error saving size:', error);
      setError('Failed to save size. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Size Name
        </label>
        <input
          type="text"
          value={size.name}
          onChange={(e) => setSize({ ...size, name: e.target.value })}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Size Code
        </label>
        <input
          type="text"
          value={size.code}
          onChange={(e) => setSize({ ...size, code: e.target.value.toUpperCase() })}
          onFocus={() => setError(null)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Size Category
          <span className="text-sm text-gray-500 ml-1">(Choose carefully - this affects available sizes for products)</span>
        </label>
        <select
          value={size.category}
          onChange={(e) => {
            const newCategory = e.target.value;
            setSize({
              ...size,
              category: newCategory,
              code: size.code || getDefaultCode(newCategory)
            });
          }}
          className="w-full p-2 border rounded-md"
          required
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
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
          {initialSize ? 'Update' : 'Create'} Size
        </button>
      </div>
    </form>
  );
};

export default SizeForm;
