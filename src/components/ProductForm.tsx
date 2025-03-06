import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';
import { Product, Variant } from '../types';
import { useSettings } from '../hooks/useSettings';
import { useSuppliers } from '../hooks/useSuppliers';
import { GS1BarcodeGenerator } from '../utils/gs1';
import { useBrands } from '../hooks/useBrands';
import { useCollections } from '../hooks/useCollections';
import { useCategories } from '../hooks/useCategories';
import { useProductTypes } from '../hooks/useProductTypes';
import { useSizes } from '../hooks/useSizes';
import { useColors } from '../hooks/useColors';
import { useProducts, generateNextBarcode } from '../hooks/useProducts';

interface ProductFormProps {
  initialProduct: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialProduct,
  onSave,
  onCancel,
}) => {
  const { saveProduct } = useProducts();
  const { generateNextBarcode, generateNextSku } = useProducts();
  const { settings } = useSettings();
  const { brands } = useBrands();
  const { collections } = useCollections();
  const { suppliers } = useSuppliers();
  const { categories } = useCategories();
  const { productTypes } = useProductTypes();
  const { sizes } = useSizes();
  const { colors } = useColors();
  const [isLoading, setIsLoading] = useState(true);
  const [barcodeGenerator, setBarcodeGenerator] = useState<GS1BarcodeGenerator | null>(null);
  const { updateSettings } = useSettings();
  const [error, setError] = useState<string | null>(null);
  const [barcodeErrors, setBarcodeErrors] = useState<Record<string, string>>({});
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);
  const [product, setProduct] = useState<Product>(initialProduct || {
    id: initialProduct?.id || crypto.randomUUID(),
    name: initialProduct?.name || '',
    brand: initialProduct?.brand || brands[0]?.code || '',
    collection: initialProduct?.collection || collections[0]?.code || '',
    category: initialProduct?.category || categories[0]?.code || '',
    supplier_id: initialProduct?.supplier_id || '',
    size_category: initialProduct?.size_category || 'Clothing',
    product_type: initialProduct?.product_type || productTypes[0]?.code || '',
    description: initialProduct?.description || '',
    purchasePrice: Number(initialProduct?.purchasePrice) || 0,
    salesPrice: Number(initialProduct?.salesPrice) || 0,
    variants: initialProduct?.variants || [],
  });

  useEffect(() => {
    const checkDataLoaded = () => {
      if (brands.length > 0 && collections.length > 0 && categories.length > 0 && productTypes.length > 0 && sizes.length > 0 && colors.length > 0) {
        // Set default values only when data is loaded
        setProduct(prev => ({
          ...prev,
          name: prev.name || '',
          brand: prev.brand || brands[0]?.code || '',
          collection: prev.collection || collections[0]?.code || '',
          size_category: prev.size_category || 'Clothing',
          category: prev.category || categories[0]?.code || '',
          product_type: prev.product_type || productTypes[0]?.code || '',
          description: prev.description || '',
          purchasePrice: Number(prev.purchasePrice) || 0,
          salesPrice: Number(prev.salesPrice) || 0
        }));
        setIsLoading(false);
      }
    };
    checkDataLoaded();
  }, [brands, collections, categories, productTypes, sizes, colors]);

  useEffect(() => {
    if (settings.gs1_config) {
      setBarcodeGenerator(new GS1BarcodeGenerator(settings.gs1_config));
    }
  }, [settings.gs1_config]);

  const addVariant = async () => {
    if (!product) return;

    // Generate next SKU if auto-generation is enabled
    let newSku = '';
    if (settings.sku_config?.enable_auto_generation) {
      try {
        newSku = await generateNextSku(settings.sku_config.prefix);
      } catch (error) {
        console.error('Failed to generate SKU:', error);
      }
    }

    // Filter sizes by the selected category and get the first available size
    const availableSizes = sizes.filter(size => size.category === product.size_category);
    const defaultSize = availableSizes.length > 0 ? availableSizes[0].code : '';

    let newBarcode;
    try {
      newBarcode = await generateNextBarcode();
    } catch (error) {
      console.error('Failed to generate barcode:', error);
      newBarcode = '';
    }

    const newVariant: Variant = {
      id: crypto.randomUUID(),
      sku: newSku,
      barcode: newBarcode,
      size: defaultSize,
      color: colors[0]?.code || '',
      purchasePrice: product.purchasePrice,
      salesPrice: product.salesPrice,
      stock: 0,
    };
    setProduct({ ...product, variants: [...product.variants, newVariant] });
  };

  const addAllSizeVariants = async () => {
    if (!product) return;
    setIsGeneratingVariants(true);

    try {
      // Get all sizes for the current category
      const availableSizes = sizes.filter(size => size.category === product.size_category);
      
      // Create a variant for each size
      const newVariants = await Promise.all(availableSizes.map(async size => {
        // Generate SKU and barcode for each variant
        let newSku = '';
        if (settings.sku_config?.enable_auto_generation) {
          try {
            newSku = await generateNextSku(settings.sku_config.prefix);
          } catch (error) {
            console.error('Failed to generate SKU:', error);
          }
        }

        let newBarcode;
        try {
          newBarcode = await generateNextBarcode();
        } catch (error) {
          console.error('Failed to generate barcode:', error);
          newBarcode = '';
        }

        return {
          id: crypto.randomUUID(),
          sku: newSku,
          barcode: newBarcode,
          size: size.code,
          color: colors[0]?.code || '',
          purchasePrice: product.purchasePrice,
          salesPrice: product.salesPrice,
          stock: 0,
        };
      }));

      setProduct(prev => ({
        ...prev,
        variants: [...prev.variants, ...newVariants]
      }));
    } catch (error) {
      console.error('Error generating variants:', error);
      setError('Failed to generate variants. Please try again.');
    } finally {
      setIsGeneratingVariants(false);
    }
  };

  const handlePriceChange = (field: 'purchasePrice' | 'salesPrice', value: number) => {
    setProduct({
      ...product,
      [field]: value,
      variants: product.variants.map(variant => ({
        ...variant,
        [field]: value
      }))
    });
  };

  const removeVariant = (id: string, e: React.MouseEvent) => {
    if (!product) return;

    // Prevent event bubbling
    e.preventDefault();
    e.stopPropagation();

    setProduct({
      ...product,
      variants: product.variants.filter((v) => v.id !== id),
    });
  };

  const updateVariant = (id: string, field: keyof Variant, value: string | number) => {
    if (!product) return;

    // Clear any existing barcode error when the barcode is changed
    if (field === 'barcode') {
      setBarcodeErrors(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      // Check for duplicate barcode
      const barcode = value as string;
      if (barcode && barcode.trim() !== '') {
        const duplicateVariant = product.variants.find(
          v => v.id !== id && v.barcode === barcode
        );
        
        if (duplicateVariant) {
          setBarcodeErrors(prev => ({
            ...prev,
            [id]: `Barcode "${barcode}" is already used by another variant`
          }));
          return;
        }
      }
    }

    setProduct({
      ...product,
      variants: product.variants.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      ),
    });
  };

  const exportToCSV = () => {
    if (!product) return;

    const headers = ['Brand', 'Barcode', 'Collection', 'SKU', 'Size', 'Color', 'Inköpspris', 'Försäljningspris', 'Stock'];
    const rows = product.variants.map((v) => [
      product.brand,
      v.barcode,
      product.collection,
      v.sku,
      v.size,
      v.color,
      v.purchasePrice,
      v.salesPrice,
      v.stock,
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${product.name.toLowerCase().replace(/\s+/g, '-')}-variants.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    try {
      setError(null);
      setBarcodeErrors({});
      
      // Check for duplicate barcodes within variants
      const barcodes = product.variants
        .map(v => v.barcode)
        .filter(barcode => barcode && barcode.trim() !== '');
      
      // Find duplicates and mark them in the UI
      const duplicates = new Map();
      product.variants.forEach(variant => {
        if (variant.barcode && variant.barcode.trim() !== '') {
          const count = barcodes.filter(b => b === variant.barcode).length;
          if (count > 1) {
            duplicates.set(variant.id, variant.barcode);
          }
        }
      });
      
      if (duplicates.size > 0) {
        const newBarcodeErrors: Record<string, string> = {};
        duplicates.forEach((barcode, variantId) => {
          newBarcodeErrors[variantId] = `Duplicate barcode: ${barcode}`;
        });
        setBarcodeErrors(newBarcodeErrors);
        setError('Please fix duplicate barcodes before saving');
        return;
      }

      if (product) {
        await saveProduct(product);
        onSave();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to save product. Please check for duplicate barcodes and try again.'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white border border-border rounded-md p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }
  if (!product) return null;
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white border border-border rounded-md">
        {error && (
          <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {initialProduct ? 'Edit Product' : 'New Product'}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
            >
              Save Product
            </button>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              1. Product Name
            </label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter product name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                2. Default Purchase Price
              </label>
              <input
                type="number"
                value={product.purchasePrice}
                onChange={(e) => handlePriceChange('purchasePrice', Number(e.target.value))}
                className="w-full p-2 border rounded-md"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                2. Default Sales Price
              </label>
              <input
                type="number"
                value={product.salesPrice}
                onChange={(e) => handlePriceChange('salesPrice', Number(e.target.value))}
                className="w-full p-2 border rounded-md"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              3. Supplier
            </label>
            <select
              value={product.supplier_id || ''}
              onChange={(e) => setProduct({ ...product, supplier_id: e.target.value })}
              className="w-full p-2 border rounded-md bg-white"
            >
              <option value="">Select a supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name} ({supplier.supplier_number})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              4. Varumärke
            </label>
            <select
              value={product.brand}
              onChange={(e) => setProduct({ ...product, brand: e.target.value })}
              className="w-full p-2 border rounded-md bg-white"
            >
              {brands.map((brand) => (
                <option key={brand.id} value={brand.code}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              5. Kollektion
            </label>
            <select
              value={product.collection}
              onChange={(e) => setProduct({ ...product, collection: e.target.value })}
              className="w-full p-2 border rounded-md bg-white"
            >
              {collections.map((collection) => (
                <option key={collection.id} value={collection.code}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              6. Category
            </label>
            <select
              value={product.category}
              onChange={(e) => setProduct({ ...product, category: e.target.value })}
              className="w-full p-2 border rounded-md bg-white"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.code}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              7. Product Type
            </label>
            <select
              value={product.product_type}
              onChange={(e) => setProduct({ ...product, product_type: e.target.value })}
              className="w-full p-2 border rounded-md bg-white"
            >
              {productTypes.map((productType) => (
                <option key={productType.id} value={productType.code}>
                  {productType.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              8. Size Category
              <span className="text-sm text-gray-500 ml-1">(This determines available sizes for variants)</span>
            </label>
            <select
              value={product.size_category}
              onChange={(e) => {
                const newCategory = e.target.value;
                const availableSizes = sizes.filter(size => size.category === newCategory);
                const defaultSize = availableSizes.length > 0 ? availableSizes[0].code : '';
                
                // Update size_category and reset all variant sizes to the first available size
                setProduct({
                  ...product,
                  size_category: newCategory,
                  variants: product.variants.map(variant => ({
                    ...variant,
                    size: defaultSize || ''
                  }))
                });
              }}
              className="w-full p-2 border rounded-md bg-white"
            >
              {Array.from(new Set(sizes.map(size => size.category))).map(category => (
                <option key={category} value={category} disabled={sizes.filter(s => s.category === category).length === 0}>
                  {category}
                  {sizes.filter(s => s.category === category).length === 0 ? ' (No sizes available)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              9. Description
            </label>
            {settings?.editor_config?.enable_tinymce && import.meta.env.VITE_TINYMCE_API_KEY ? (
              <Editor
                apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                textareaName="description"
                init={{
                  height: 300,
                  menubar: false,
                  skin: 'oxide',
                  content_css: 'default',
                  readonly: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'charmap',
                    'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'table', 'wordcount'
                  ],
                  toolbar: 'undo redo | formatselect | ' +
                    'bold italic backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat',
                  content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px }',
                  branding: false,
                  promotion: false,
                  statusbar: false,
                  entity_encoding: 'raw'
                }}
                onInit={(evt, editor) => {
                  editor.setContent(product.description || '');
                }}
                value={product.description}
                onEditorChange={(content) => setProduct({ ...product, description: content })}
              />
            ) : (
              <textarea
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                className="w-full p-2 border rounded-md"
                rows={8}
                placeholder="Enter product description"
              />
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Variants</h2>
            <div className="flex gap-2">
              <button
                onClick={addAllSizeVariants}
                disabled={isGeneratingVariants}
                className={`btn btn-primary btn-icon ${
                  isGeneratingVariants ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Plus size={16} />
                {isGeneratingVariants ? 'Generating...' : `Add All ${product.size_category} Sizes`}
              </button>
              <button
                onClick={addVariant}
                className="btn btn-primary btn-icon"
              >
                <Plus size={16} /> Add Single Variant
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {product.variants.map((variant) => (
              <div
                key={variant.id}
                className="p-4 border rounded-md bg-gray-50 relative"
              >
                <div className="grid grid-cols-9 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Produktnr.
                    </label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter SKU"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barcode
                    </label>
                    <input
                      type="text"
                      value={variant.barcode || ''}
                      onChange={(e) => {
                        setError(null);
                        const barcode = e.target.value.trim();
                        updateVariant(variant.id, 'barcode', barcode);
                      }}
                      className={`w-full p-2 border rounded-md ${
                        barcodeErrors[variant.id] ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter barcode"
                    />
                    {barcodeErrors[variant.id] && (
                      <p className="mt-1 text-sm text-red-600">
                        {barcodeErrors[variant.id]}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size
                    </label>
                    <select
                      value={variant.size}
                      onChange={(e) => updateVariant(variant.id, 'size', e.target.value)}
                      className="w-full p-2 border rounded-md bg-white"
                      required
                    >
                      <option value="" disabled>Select a size</option>
                      {sizes.filter(size => size.category === product.size_category).length > 0 ? (
                        sizes
                          .filter(size => size.category === product.size_category)
                          .map(size => (
                            <option key={size.id} value={size.code}>
                              {size.name}
                            </option>
                          ))
                      ) : (
                        <option value="" disabled>No sizes available for {product.size_category}</option>
                      )}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <select
                      value={variant.color}
                      onChange={(e) => updateVariant(variant.id, 'color', e.target.value)}
                      className="w-full p-2 border rounded-md bg-white"
                    >
                      {colors.map((color) => (
                        <option key={color.id} value={color.code}>
                          {color.name} ({color.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Price
                    </label>
                    <input
                      type="number"
                      value={variant.purchasePrice}
                      onChange={(e) => updateVariant(variant.id, 'purchasePrice', Number(e.target.value))}
                      className="w-full p-2 border rounded-md"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sales Price
                    </label>
                    <input
                      type="number"
                      value={variant.salesPrice}
                      onChange={(e) => updateVariant(variant.id, 'salesPrice', Number(e.target.value))}
                      className="w-full p-2 border rounded-md"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(variant.id, 'stock', Number(e.target.value))}
                      className="w-full p-2 border rounded-md"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => removeVariant(variant.id, e)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove variant"
                    >
                      <Trash2 size={16} />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {product.variants.length > 0 && (
          <div className="flex justify-end gap-2">
            <button
              onClick={exportToCSV}
              className="btn btn-success btn-icon"
            >
              <Download size={16} /> Export to CSV
            </button>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
          >
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm
