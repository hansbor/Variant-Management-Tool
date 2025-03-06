import React, { useState } from 'react';
import { Category } from '../types';
import { useCategories, CategoryFormProps } from '../hooks/useCategories';

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialCategory,
  onSave,
  onCancel,
}) => {
  const { saveCategory, updateCategory, fetchCategories } = useCategories();
  const [category, setCategory] = useState<Partial<Category>>(
    initialCategory || {
      name: '',
      code: '',
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialCategory) {
        await updateCategory(initialCategory.id, category);
      } else {
        await saveCategory(category as Omit<Category, 'id'>);
      }
      await fetchCategories();
      onSave();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category Name
        </label>
        <input
          type="text"
          value={category.name}
          onChange={(e) => setCategory({ ...category, name: e.target.value })}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category Code
        </label>
        <input
          type="text"
          value={category.code}
          onChange={(e) => setCategory({ ...category, code: e.target.value.toUpperCase() })}
          className="w-full p-2 border rounded-md"
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

export default CategoryForm;
