import React, { useState } from 'react';
import { Collection } from '../types';
import { useCollections, CollectionFormProps } from '../hooks/useCollections';

const CollectionForm: React.FC<CollectionFormProps> = ({
  initialCollection,
  onSave,
  onCancel,
}) => {
  const { saveCollection, updateCollection, fetchCollections } = useCollections();
  const [collection, setCollection] = useState<Partial<Collection>>(
    initialCollection || {
      name: '',
      code: '',
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialCollection) {
        await updateCollection(initialCollection.id, collection);
      } else {
        await saveCollection(collection as Omit<Collection, 'id'>);
      }
      await fetchCollections();
      onSave();
    } catch (error) {
      console.error('Error saving collection:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Collection Name
        </label>
        <input
          type="text"
          value={collection.name}
          onChange={(e) => setCollection({ ...collection, name: e.target.value })}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Collection Code
        </label>
        <input
          type="text"
          value={collection.code}
          onChange={(e) => setCollection({ ...collection, code: e.target.value.toUpperCase() })}
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
          {initialCollection ? 'Update' : 'Create'} Collection
        </button>
      </div>
    </form>
  );
};

export default CollectionForm
