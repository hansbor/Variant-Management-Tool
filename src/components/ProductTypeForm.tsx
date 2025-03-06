import React, { useState } from 'react';
import { ProductType } from '../types';
import { useProductTypes, ProductTypeFormProps } from '../hooks/useProductTypes';

const ProductTypeForm: React.FC<ProductTypeFormProps> = ({
  initialProductType,
  onSave,
  onCancel,
}) => {
  const { saveProductType, updateProductType, fetchProductTypes } = useProductTypes();
  const [productType, setProductType] = useState<Partial<ProductType>>(
    initialProductType || {
      name: '',
      code: '',
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialProductType) {
        await updateProductType(initialProductType.id, productType);
      } else {
        await saveProductType(productType as Omit<ProductType, 'id'>);
      }
      await fetchProductTypes();
      onSave();
    } catch (error) {
      console.error('Error saving product type:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Type Name
        </label>
        <input
          type="text"
          value={productType.name}
          onChange={(e) => setProductType({ ...productType, name: e.target.value })}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Type Code
        </label>
        <input
          type="text"
          value={productType.code}
          onChange={(e) => setProductType({ ...productType, code: e.target.value.toUpperCase() })}
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
          {initialProductType ? 'Update' : 'Create'} Product Type
        </button>
      </div>
    </form>
  );
};

export default ProductTypeForm;
