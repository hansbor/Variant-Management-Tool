import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, Copy, Settings as SettingsIcon, CheckCircle, XCircle } from 'lucide-react';
import { ArrowUpDown } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { businessNxt } from '../lib/businessNxt';
import { useBrands } from '../hooks/useBrands';
import { GS1BarcodeGenerator } from '../utils/gs1';
import { useCollections } from '../hooks/useCollections';
import { useCategories } from '../hooks/useCategories';
import { useProductTypes } from '../hooks/useProductTypes';
import { useSizes } from '../hooks/useSizes';
import { useColors } from '../hooks/useColors';
import SizeCategoryForm from './SizeCategoryForm';
import BrandForm from './BrandForm';
import CollectionForm from './CollectionForm';
import CategoryForm from './CategoryForm';
import ProductTypeForm from './ProductTypeForm';
import SizeForm from './SizeForm';
import ColorForm from './ColorForm';
import { Brand, Collection, Category, ProductType, Size, Color } from '../types';

type TableType = 'brands' | 'collections' | 'categories' | 'productTypes' | 'sizes' | 'colors' | 'editor' | 'gs1' | 'business-nxt' | 'sku';
type SortField = 'name' | 'code' | 'category' | 'hex';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

interface BusinessNxtConfig {
  enabled: boolean;
  client_id: string;
  client_secret: string;
  tenant_id: string;
}

const Settings: React.FC = () => {
  const [activeTable, setActiveTable] = useState<TableType>('brands');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', direction: 'asc' });
  const { settings, updateSettings } = useSettings();
  const [editorSettings, setEditorSettings] = useState({ enable_tinymce: false });
  const [businessNxtConfig, setBusinessNxtConfig] = useState<BusinessNxtConfig>({
    enabled: true,
    client_id: import.meta.env.VITE_BUSINESS_NXT_CLIENT_ID || '',
    client_secret: import.meta.env.VITE_BUSINESS_NXT_CLIENT_SECRET || '',
    tenant_id: import.meta.env.VITE_BUSINESS_NXT_TENANT_ID || '',
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null);
  const [connectionLog, setConnectionLog] = useState<string[]>([]);
  const [showConnectionLog, setShowConnectionLog] = useState(false);
  const { brands, deleteBrand, fetchBrands } = useBrands();
  const { collections, deleteCollection, fetchCollections } = useCollections();
  const { categories, deleteCategory, fetchCategories } = useCategories();
  const { productTypes, deleteProductType, fetchProductTypes } = useProductTypes();
  const { sizes, deleteSize, fetchSizes } = useSizes();
  const { colors, deleteColor, fetchColors } = useColors();
  const [isRefreshingBrands, setIsRefreshingBrands] = useState(false);
  const [isRefreshingCollections, setIsRefreshingCollections] = useState(false);
  const [isRefreshingCategories, setIsRefreshingCategories] = useState(false);
  const [isRefreshingProductTypes, setIsRefreshingProductTypes] = useState(false);
  const [isRefreshingSizes, setIsRefreshingSizes] = useState(false);
  const [isRefreshingColors, setIsRefreshingColors] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showProductTypeForm, setShowProductTypeForm] = useState(false);
  const [showSizeForm, setShowSizeForm] = useState(false);
  const [showColorForm, setShowColorForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | undefined>();
  const [editingCollection, setEditingCollection] = useState<Collection | undefined>();
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [editingProductType, setEditingProductType] = useState<ProductType | undefined>();
  const [editingSize, setEditingSize] = useState<Size | undefined>();
  const [editingColor, setEditingColor] = useState<Color | undefined>();

  useEffect(() => {
    if (settings.editor_config) {
      setEditorSettings(settings.editor_config);
    }
    if (settings.business_nxt_config) {
      setBusinessNxtConfig(settings.business_nxt_config);
      businessNxt.setEnabled(settings.business_nxt_config.enabled);
    }
  }, [settings]);

  const handleSaveEditorSettings = async () => {
    try {
      await updateSettings('editor_config', editorSettings);
    } catch (error) {
      console.error('Error saving editor settings:', error);
    }
  };

  const handleSaveBusinessNxtConfig = async () => {
    try {
      await updateSettings('business_nxt_config', businessNxtConfig);
      businessNxt.setEnabled(businessNxtConfig.enabled);
    } catch (error) {
      console.error('Error saving Business NXT config:', error);
    }
  };

  const handleSort = (field: SortField) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedData = <T extends { name: string; code: string; category?: string; hex?: string }>(
    data: T[]
  ): T[] => {
    return [...data].sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      const aValue = String(a[sortConfig.field] || '').toLowerCase();
      const bValue = String(b[sortConfig.field] || '').toLowerCase();
      return aValue > bValue ? direction : -direction;
    });
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        {label}
        <ArrowUpDown size={14} className={`transition-transform ${
          sortConfig.field === field 
            ? 'text-primary' + (sortConfig.direction === 'desc' ? ' rotate-180' : '')
            : 'text-gray-400'
        }`} />
      </button>
    </div>
  );

  const handleRefreshBrands = async () => {
    setIsRefreshingBrands(true);
    await fetchBrands();
    setIsRefreshingBrands(false);
  };

  const handleRefreshCollections = async () => {
    setIsRefreshingCollections(true);
    await fetchCollections();
    setIsRefreshingCollections(false);
  };

  const handleRefreshCategories = async () => {
    setIsRefreshingCategories(true);
    await fetchCategories();
    setIsRefreshingCategories(false);
  };

  const handleRefreshProductTypes = async () => {
    setIsRefreshingProductTypes(true);
    await fetchProductTypes();
    setIsRefreshingProductTypes(false);
  };

  const handleRefreshSizes = async () => {
    setIsRefreshingSizes(true);
    await fetchSizes();
    setIsRefreshingSizes(false);
  };

  const handleRefreshColors = async () => {
    setIsRefreshingColors(true);
    await fetchColors();
    setIsRefreshingColors(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex gap-8">
        {/* Sidebar Menu */}
        <div className="w-64 bg-white rounded-lg shadow p-4 h-fit">
          <div className="flex items-center gap-2 mb-4 p-2 border-b">
            <SettingsIcon className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveTable('brands')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTable === 'brands'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              Brands ({brands.length})
            </button>
            <button
              onClick={() => setActiveTable('collections')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTable === 'collections'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              Collections ({collections.length})
            </button>
            <button
              onClick={() => setActiveTable('categories')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTable === 'categories'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTable('productTypes')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTable === 'productTypes'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              Product Types ({productTypes.length})
            </button>
            <button
              onClick={() => setActiveTable('sizes')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTable === 'sizes'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              Sizes ({sizes.length})
            </button>
            <button
              onClick={() => setActiveTable('colors')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTable === 'colors'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              Colors ({colors.length})
            </button>
            <button
              onClick={() => setActiveTable('editor')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTable === 'editor'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              Editor Settings
            </button>
            <button
              onClick={() => setActiveTable('gs1')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTable === 'gs1'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              GS1 Settings
            </button>
            <button
              onClick={() => setActiveTable('business-nxt')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTable === 'business-nxt'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              Business NXT Integration
            </button>
            <button
              onClick={() => setActiveTable('sku')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTable === 'sku'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              SKU Settings
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Brands Table */}
          <div className={`bg-white rounded-lg shadow p-6 ${activeTable !== 'brands' ? 'hidden' : ''}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Brands</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleRefreshBrands}
                  className={`btn btn-outline ${isRefreshingBrands ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isRefreshingBrands}
                >
                  <RefreshCw size={16} className={isRefreshingBrands ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => {
                    setEditingBrand(undefined);
                    setShowBrandForm(true);
                  }}
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  <span>New Brand</span>
                </button>
              </div>
            </div>

            {showBrandForm ? (
              <BrandForm
                initialBrand={editingBrand}
                onSave={() => {
                  setShowBrandForm(false);
                  setEditingBrand(undefined);
                  handleRefreshBrands();
                }}
                onCancel={() => {
                  setShowBrandForm(false);
                  setEditingBrand(undefined);
                }}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">
                        <SortHeader field="name" label="Name" />
                      </th>
                      <th className="text-left py-2 px-4">
                        <SortHeader field="code" label="Code" />
                      </th>
                      <th className="text-right py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedData(brands).map((brand) => (
                      <tr key={brand.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{brand.name}</td>
                        <td className="py-2 px-4">{brand.code}</td>
                        <td className="py-2 px-4 text-right">
                          <button
                            onClick={() => {
                              setEditingBrand(brand);
                              setShowBrandForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteBrand(brand.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Collections Table */}
          <div className={`bg-white rounded-lg shadow p-6 ${activeTable !== 'collections' ? 'hidden' : ''}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Collections</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleRefreshCollections}
                  className={`btn btn-outline ${isRefreshingCollections ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isRefreshingCollections}
                >
                  <RefreshCw size={16} className={isRefreshingCollections ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => {
                    setEditingCollection(undefined);
                    setShowCollectionForm(true);
                  }}
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  <span>New Collection</span>
                </button>
              </div>
            </div>

            {showCollectionForm ? (
              <CollectionForm
                initialCollection={editingCollection}
                onSave={() => {
                  setShowCollectionForm(false);
                  setEditingCollection(undefined);
                  handleRefreshCollections();
                }}
                onCancel={() => {
                  setShowCollectionForm(false);
                  setEditingCollection(undefined);
                }}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">
                        <SortHeader field="name" label="Name" />
                      </th>
                      <th className="text-left py-2 px-4">
                        <SortHeader field="code" label="Code" />
                      </th>
                      <th className="text-right py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedData(collections).map((collection) => (
                      <tr key={collection.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{collection.name}</td>
                        <td className="py-2 px-4">{collection.code}</td>
                        <td className="py-2 px-4 text-right">
                          <button
                            onClick={() => {
                              setEditingCollection(collection);
                              setShowCollectionForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteCollection(collection.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Categories Table */}
          <div className={`bg-white rounded-lg shadow p-6 ${activeTable !== 'categories' ? 'hidden' : ''}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Categories</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleRefreshCategories}
                  className={`btn btn-outline ${isRefreshingCategories ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isRefreshingCategories}
                >
                  <RefreshCw size={16} className={isRefreshingCategories ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => {
                    setEditingCategory(undefined);
                    setShowCategoryForm(true);
                  }}
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  <span>New Category</span>
                </button>
              </div>
            </div>

            {showCategoryForm ? (
              <CategoryForm
                initialCategory={editingCategory}
                onSave={() => {
                  setShowCategoryForm(false);
                  setEditingCategory(undefined);
                  handleRefreshCategories();
                }}
                onCancel={() => {
                  setShowCategoryForm(false);
                  setEditingCategory(undefined);
                }}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">
                        <SortHeader field="name" label="Name" />
                      </th>
                      <th className="text-left py-2 px-4">
                        <SortHeader field="code" label="Code" />
                      </th>
                      <th className="text-right py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedData(categories).map((category) => (
                      <tr key={category.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{category.name}</td>
                        <td className="py-2 px-4">{category.code}</td>
                        <td className="py-2 px-4 text-right">
                          <button
                            onClick={() => {
                              setEditingCategory(category);
                              setShowCategoryForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteCategory(category.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Product Types Table */}
          <div className={`bg-white rounded-lg shadow p-6 ${activeTable !== 'productTypes' ? 'hidden' : ''}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Product Types</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleRefreshProductTypes}
                  className={`btn btn-outline ${isRefreshingProductTypes ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isRefreshingProductTypes}
                >
                  <RefreshCw size={16} className={isRefreshingProductTypes ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => {
                    setEditingProductType(undefined);
                    setShowProductTypeForm(true);
                  }}
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  <span>New Product Type</span>
                </button>
              </div>
            </div>

            {showProductTypeForm ? (
              <ProductTypeForm
                initialProductType={editingProductType}
                onSave={() => {
                  setShowProductTypeForm(false);
                  setEditingProductType(undefined);
                  handleRefreshProductTypes();
                }}
                onCancel={() => {
                  setShowProductTypeForm(false);
                  setEditingProductType(undefined);
                }}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">
                        <SortHeader field="name" label="Name" />
                      </th>
                      <th className="text-left py-2 px-4">
                        <SortHeader field="code" label="Code" />
                      </th>
                      <th className="text-right py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedData(productTypes).map((productType) => (
                      <tr key={productType.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{productType.name}</td>
                        <td className="py-2 px-4">{productType.code}</td>
                        <td className="py-2 px-4 text-right">
                          <button
                            onClick={() => {
                              setEditingProductType(productType);
                              setShowProductTypeForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteProductType(productType.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sizes Table */}
          <div className={`bg-white rounded-lg shadow p-6 ${activeTable !== 'sizes' ? 'hidden' : ''}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Sizes</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleRefreshSizes}
                  className={`btn btn-outline ${isRefreshingSizes ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isRefreshingSizes}
                >
                  <RefreshCw size={16} className={isRefreshingSizes ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => {
                    setEditingSize(undefined);
                    setShowSizeForm(true);
                  }}
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  <span>New Size</span>
                </button>
              </div>
            </div>

            {showSizeForm ? (
              <SizeForm
                initialSize={editingSize}
                onSave={() => {
                  setShowSizeForm(false);
                  setEditingSize(undefined);
                  handleRefreshSizes();
                }}
                onCancel={() => {
                  setShowSizeForm(false);
                  setEditingSize(undefined);
                }}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">
                        <SortHeader field="name" label="Name" />
                      </th>
                      <th className="text-left py-2 px-4">
                        <SortHeader field="code" label="Code" />
                      </th>
                      <th className="text-left py-2 px-4">
                        <SortHeader field="category" label="Category" />
                      </th>
                      <th className="text-right py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedData(sizes).map((size) => (
                      <tr key={size.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{size.name}</td>
                        <td className="py-2 px-4">{size.code}</td>
                        <td className="py-2 px-4">{size.category}</td>
                        <td className="py-2 px-4 text-right">
                          <button
                            onClick={() => {
                              setEditingSize(size);
                              setShowSizeForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteSize(size.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Colors Table */}
          <div className={`bg-white rounded-lg shadow p-6 ${activeTable !== 'colors' ? 'hidden' : ''}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Colors</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleRefreshColors}
                  className={`btn btn-outline ${isRefreshingColors ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isRefreshingColors}
                >
                  <RefreshCw size={16} className={isRefreshingColors ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => {
                    setEditingColor(undefined);
                    setShowColorForm(true);
                  }}
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  <span>New Color</span>
                </button>
              </div>
            </div>

            {showColorForm ? (
              <ColorForm
                initialColor={editingColor}
                onSave={() => {
                  setShowColorForm(false);
                  setEditingColor(undefined);
                  handleRefreshColors();
                }}
                onCancel={() => {
                  setShowColorForm(false);
                  setEditingColor(undefined);
                }}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">
                        <SortHeader field="name" label="Name" />
                      </th>
                      <th className="text-left py-2 px-4">
                        <SortHeader field="code" label="Code" />
                      </th>
                      <th className="text-left py-2 px-4">
                        <SortHeader field="hex" label="Color" />
                      </th>
                      <th className="text-right py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedData(colors).map((color) => (
                      <tr key={color.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{color.name}</td>
                        <td className="py-2 px-4">{color.code}</td>
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: color.hex }}
                            />
                            {color.hex}
                          </div>
                        </td>
                        <td className="py-2 px-4 text-right">
                          <button
                            onClick={() => {
                              setEditingColor(color);
                              setShowColorForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteColor(color.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Editor Settings Section */}
          <div className={`bg-white rounded-lg shadow p-6 ${activeTable !== 'editor' ? 'hidden' : ''}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Editor Settings</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                  <h3 className="font-medium">Enable TinyMCE Editor</h3>
                  <p className="text-sm text-gray-600">
                    Use TinyMCE for rich text editing in product descriptions
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={editorSettings.enable_tinymce}
                    onChange={(e) => {
                      setEditorSettings(prev => ({
                        ...prev,
                        enable_tinymce: e.target.checked
                      }));
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveEditorSettings}
                  className="btn btn-primary"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>

          {/* GS1 Settings Section */}
          <div className={`bg-white rounded-lg shadow p-6 ${activeTable !== 'gs1' ? 'hidden' : ''}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">GS1 Settings</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                  <h3 className="font-medium">Enable Auto Generation</h3>
                  <p className="text-sm text-gray-600">
                    Automatically generate GS1-compliant barcodes for new variants
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"                    checked={settings.gs1_config?.enable_auto_generation || false}
                    onChange={(e) => {
                      const newConfig = {
                        ...settings.gs1_config,
                        enable_auto_generation: e.target.checked
                      };
                      updateSettings('gs1_config', newConfig);
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Prefix
                  </label>
                  <input
                    type="text"
                    value={settings.gs1_config?.company_prefix || ''}
                    onChange={(e) => {
                      const newConfig = {
                        ...settings.gs1_config,
                        company_prefix: e.target.value
                      };
                      updateSettings('gs1_config', newConfig);
                    }}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter your GS1 Company Prefix"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Reference
                  </label>
                  <input
                    type="text"
                    value={settings.gs1_config?.location_reference || ''}
                    onChange={(e) => {
                      const newConfig = {
                        ...settings.gs1_config,
                        location_reference: e.target.value
                      };
                      updateSettings('gs1_config', newConfig);
                    }}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter your Location Reference"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode Format
                  </label>
                  <select
                    value={settings.gs1_config?.barcode_format || 'GTIN-13'}
                    onChange={(e) => {
                      const newConfig = {
                        ...settings.gs1_config,
                        barcode_format: e.target.value as 'GTIN-13' | 'GTIN-14' | 'SSCC'
                      };
                      updateSettings('gs1_config', newConfig);
                    }}
                    className="w-full p-2 border rounded-md bg-white"
                  >
                    <option value="GTIN-13">GTIN-13</option>
                    <option value="GTIN-14">GTIN-14</option>
                    <option value="SSCC">SSCC</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                <h4 className="font-medium text-blue-800 mb-2">GS1 Information</h4>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                  <li>GTIN-13: Standard retail barcode format</li>
                  <li>GTIN-14: Used for packaging hierarchies</li>
                  <li>SSCC: Serial Shipping Container Code for logistics</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Business NXT Settings Section */}
          <div className={`bg-white rounded-lg shadow p-6 ${activeTable !== 'business-nxt' ? 'hidden' : ''}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Business NXT Integration</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                  <h3 className="font-medium">Enable Integration</h3>
                  <p className="text-sm text-gray-600">
                    Enable or disable the Business NXT integration
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={businessNxtConfig.enabled}
                    onChange={(e) => {
                      setBusinessNxtConfig(prev => ({
                        ...prev,
                        enabled: e.target.checked
                      }));
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={businessNxtConfig.client_id}
                    onChange={(e) => setBusinessNxtConfig(prev => ({
                      ...prev,
                      client_id: e.target.value
                    }))}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter your Business NXT Client ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    value={businessNxtConfig.client_secret}
                    onChange={(e) => setBusinessNxtConfig(prev => ({
                      ...prev,
                      client_secret: e.target.value
                    }))}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter your Business NXT Client Secret"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tenant ID
                  </label>
                  <input
                    type="text"
                    value={businessNxtConfig.tenant_id}
                    onChange={(e) => setBusinessNxtConfig(prev => ({
                      ...prev,
                      tenant_id: e.target.value
                    }))}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter your Business NXT Tenant ID"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSaveBusinessNxtConfig}
                  className="btn btn-primary"
                >
                  Save Settings
                </button>

                <button
                  onClick={async () => {
                    setTestingConnection(true);
                    setConnectionStatus(null);
                    try {
                      await businessNxt.testConnection();
                      setConnectionStatus('success');
                    } catch (error) {
                      console.error('Connection test failed:', error);
                      setConnectionStatus('error');
                    } finally {
                      setTestingConnection(false);
                    }
                  }}
                  disabled={testingConnection}
                  className={`btn btn-secondary ${testingConnection ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {testingConnection ? 'Testing...' : 'Test Connection'}
                </button>

                {connectionStatus === 'success' && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Connection successful
                  </div>
                )}

                {connectionStatus === 'error' && (
                  <div className="flex items-center text-red-600">
                    <XCircle className="w-5 h-5 mr-2" />
                    Connection failed
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SKU Settings Section */}
          <div className={`bg-white rounded-lg shadow p-6 ${activeTable !== 'sku' ? 'hidden' : ''}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">SKU Settings</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU Prefix
                  </label>
                  <input
                    type="text"
                    value={settings.sku_config?.prefix || ''}
                    onChange={(e) => {
                      const newConfig = {
                        ...settings.sku_config,
                        prefix: e.target.value
                      };
                      updateSettings('sku_config', newConfig);
                    }}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter your SKU Prefix"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
