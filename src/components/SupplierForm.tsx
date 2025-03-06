import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Supplier, Address } from '../types';
import { useSuppliers } from '../hooks/useSuppliers';

interface SupplierFormProps {
  initialSupplier?: Supplier;
  onSave: () => void;
  onCancel: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({
  initialSupplier,
  onSave,
  onCancel,
}) => {
  const { saveSupplier, updateSupplier } = useSuppliers();
  const [error, setError] = useState<string | null>(null);
  const [supplier, setSupplier] = useState<Partial<Supplier>>(
    initialSupplier || {
      name: '',
      email: undefined,
      phone: undefined,
      website: undefined,
      notes: undefined,
      addresses: [],
    }
  );

  const addAddress = () => {
    const newAddress: Address = {
      id: crypto.randomUUID(),
      supplier_id: supplier.id || '',
      type: 'billing',
      street: '',
      city: '',
      country: '',
      is_default: supplier.addresses?.length === 0,
    };

    setSupplier({
      ...supplier,
      addresses: [...(supplier.addresses || []), newAddress],
    });
  };

  const removeAddress = (id: string) => {
    setSupplier({
      ...supplier,
      addresses: supplier.addresses?.filter((addr) => addr.id !== id) || [],
    });
  };

  const updateAddress = (id: string, field: keyof Address, value: string | boolean) => {
    setSupplier({
      ...supplier,
      addresses: supplier.addresses?.map((addr) =>
        addr.id === id ? { ...addr, [field]: value } : addr
      ) || [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!supplier.name) {
        setError('Supplier name is required');
        return;
      }

      // Validate addresses
      const invalidAddresses = supplier.addresses?.filter(
        addr => !addr.street || !addr.city || !addr.country
      );

      if (invalidAddresses?.length) {
        setError('Please complete all required address fields');
        return;
      }

      if (initialSupplier) {
        await updateSupplier(initialSupplier.id, supplier);
      } else {
        await saveSupplier(supplier as Omit<Supplier, 'id' | 'supplier_number'>);
      }
      onSave();
    } catch (error) {
      console.error('Error saving supplier:', error);
      setError(error instanceof Error ? error.message : 'Failed to save supplier');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">
        {initialSupplier ? 'Edit Supplier' : 'New Supplier'}
      </h2>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier Name
            </label>
            <input
              type="text"
              value={supplier.name}
              onChange={(e) => setSupplier({ ...supplier, name: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter supplier name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={supplier.email || ''}
              onChange={(e) => setSupplier({ ...supplier, email: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={supplier.phone || ''}
              onChange={(e) => setSupplier({ ...supplier, phone: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={supplier.website || ''}
              onChange={(e) => setSupplier({ ...supplier, website: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter website URL"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={supplier.notes || ''}
            onChange={(e) => setSupplier({ ...supplier, notes: e.target.value })}
            className="w-full p-2 border rounded-md"
            rows={3}
            placeholder="Enter any additional notes"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Addresses</h3>
            <button
              type="button"
              onClick={addAddress}
              className="btn btn-primary btn-icon"
            >
              <Plus size={16} /> Add Address
            </button>
          </div>

          <div className="space-y-4">
            {supplier.addresses?.map((address) => (
              <div
                key={address.id}
                className="p-4 border rounded-md bg-gray-50 relative"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Type
                    </label>
                    <select
                      value={address.type}
                      onChange={(e) => updateAddress(address.id, 'type', e.target.value)}
                      className="w-full p-2 border rounded-md bg-white"
                    >
                      <option value="billing">Billing</option>
                      <option value="shipping">Shipping</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={address.is_default}
                        onChange={(e) => updateAddress(address.id, 'is_default', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Default Address</span>
                    </label>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => updateAddress(address.id, 'street', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter street address"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address 2
                    </label>
                    <input
                      type="text"
                      value={address.street2 || ''}
                      onChange={(e) => updateAddress(address.id, 'street2', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="Apartment, suite, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => updateAddress(address.id, 'city', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter city"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={address.state || ''}
                      onChange={(e) => updateAddress(address.id, 'state', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter state/province"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={address.postal_code || ''}
                      onChange={(e) => updateAddress(address.id, 'postal_code', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter postal code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={address.country}
                      onChange={(e) => updateAddress(address.id, 'country', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter country"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeAddress(address.id)}
                  className="absolute top-2 right-2 p-2 text-red-600 hover:bg-red-50 rounded-full"
                  title="Remove address"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            {initialSupplier ? 'Update' : 'Create'} Supplier
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierForm;
