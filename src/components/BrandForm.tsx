import React, { useState } from 'react';
import { Brand } from '../types';
import { useBrands, BrandFormProps } from '../hooks/useBrands';

const BrandForm: React.FC<BrandFormProps> = ({
  initialBrand,
  onSave,
  onCancel,
}) => {
  const { saveBrand, updateBrand, fetchBrands } = useBrands();
  const [brand, setBrand] = useState<Partial<Brand>>(
    initialBrand || {
      name: '',
      code: '',
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialBrand) {
        await updateBrand(initialBrand.id, brand);
      } else {
        await saveBrand(brand as Omit<Brand, 'id'>);
      }
      await fetchBrands();
      onSave();
    } catch (error) {
      console.error('Error saving brand:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Brand Name
        </label>
        <input
          type="text"
          value={brand.name}
          onChange={(e) => setBrand({ ...brand, name: e.target.value })}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Brand Code
        </label>
        <input
          type="text"
          value={brand.code}
          onChange={(e) => setBrand({ ...brand, code: e.target.value.toUpperCase() })}
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
          {initialBrand ? 'Update' : 'Create'} Brand
        </button>
      </div>
    </form>
  );
};

export default BrandForm
