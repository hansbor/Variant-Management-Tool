import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface SizeCategoryFormProps {
  initialCategory?: string;
  existingCategories: string[];
  onSave: (category: string) => void;
  onCancel: () => void;
}

const SizeCategoryForm: React.FC<SizeCategoryFormProps> = ({
  initialCategory,
  existingCategories,
  onSave,
  onCancel,
}) => {
  const [category, setCategory] = useState(initialCategory || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate category name
    if (!category.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    // Check for duplicates (case insensitive)
    if (!initialCategory && existingCategories.some(c => c.toLowerCase() === category.toLowerCase())) {
      setError('This category already exists');
      return;
    }

    onSave(category);
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
          Size Category Name
        </label>
        <input
          type="text"
          value={category}
          onChange={(e) => {
            setError(null);
            setCategory(e.target.value);
          }}
          className="w-full p-2 border rounded-md"
          placeholder="Enter category name"
          required
        />
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
          {initialCategory ? 'Update' : 'Create'} Category
        </button>
      </div>
    </form>
  );
};

export default SizeCategoryForm
