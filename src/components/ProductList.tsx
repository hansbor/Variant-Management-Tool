import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Upload, Download, RefreshCw, Filter, ChevronDown, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types';
import { useBrands } from '../hooks/useBrands';
import { useCollections } from '../hooks/useCollections';
import { useCategories } from '../hooks/useCategories';
import { useProductTypes } from '../hooks/useProductTypes';

interface ProductListProps {
  onNewProduct: () => void;
  onEditProduct: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ onNewProduct, onEditProduct }) => {
  const { products, deleteProduct, importProducts, exportProducts, fetchProducts } = useProducts();
  const { brands } = useBrands();
  const { collections } = useCollections();
  const { categories } = useCategories();
  const { productTypes } = useProductTypes();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProductType, setSelectedProductType] = useState<string>('');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Transform data for Excel
      const excelData = products.flatMap(product => {
        // Get brand and collection names instead of codes
        const brand = brands.find(b => b.code === product.brand)?.name || product.brand;
        const collection = collections.find(c => c.code === product.collection)?.name || product.collection;
        const category = categories.find(c => c.code === product.category)?.name || product.category;
        const productType = productTypes.find(pt => pt.code === product.product_type)?.name || product.product_type;
        
        return product.variants.map(variant => ({
          'Product Name': product.name,
          'Brand': brand,
          'Collection': collection,
          'Category': category,
          'Product Type': productType,
          'Size Category': product.size_category,
          'SKU': variant.sku,
          'Barcode': variant.barcode,
          'Size': variant.size,
          'Color': variant.color,
          'Purchase Price': variant.purchasePrice,
          'Sales Price': variant.salesPrice,
          'Stock': variant.stock,
          'Description': product.description?.replace(/<[^>]*>/g, '') || '' // Strip HTML tags
        }));
      });

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 30 }, // Product Name
        { wch: 15 }, // Brand
        { wch: 15 }, // Collection
        { wch: 15 }, // Category
        { wch: 15 }, // Product Type
        { wch: 15 }, // Size Category
        { wch: 15 }, // SKU
        { wch: 15 }, // Barcode
        { wch: 10 }, // Size
        { wch: 15 }, // Color
        { wch: 12 }, // Purchase Price
        { wch: 12 }, // Sales Price
        { wch: 10 }, // Stock
        { wch: 50 }  // Description
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Products');

      // Generate Excel file
      XLSX.writeFile(wb, 'products-export.xlsx');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProducts();
    setIsRefreshing(false);
  };

  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesBrand = !selectedBrand || product.brand === selectedBrand;
    const matchesCollection = !selectedCollection || product.collection === selectedCollection;
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesProductType = !selectedProductType || product.product_type === selectedProductType;
    return matchesBrand && matchesCollection && matchesCategory && matchesProductType;
  });

  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedCollection('');
    setSelectedCategory('');
    setSelectedProductType('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-text-base">Produkter</h1>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className={`btn btn-outline ${
                isRefreshing ? 'cursor-not-allowed opacity-50' : ''
              }`}
              title="Refresh product list"
              disabled={isRefreshing}
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <button
              onClick={importProducts}
              className="btn btn-outline"
              title="Import products from file"
            >
              <Upload size={16} />
              <span>Import</span>
            </button>
            {products.length > 0 && (
              <>
                <button
                  onClick={exportProducts}
                  className="btn btn-outline"
                  title="Export products to file"
                >
                  <Download size={16} />
                  <span>Export</span>
                </button>
                <button
                  onClick={exportToExcel}
                  className="btn btn-outline"
                  title="Export to Excel"
                >
                  <FileSpreadsheet size={16} />
                  <span>Export Excel</span>
                </button>
              </>
            )}
            <button
              onClick={onNewProduct}
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span>New Product</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>
          
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.code}>
                {brand.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Collections</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.code}>
                {collection.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.code}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={selectedProductType}
            onChange={(e) => setSelectedProductType(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Product Types</option>
            {productTypes.map((productType) => (
              <option key={productType.id} value={productType.code}>
                {productType.name}
              </option>
            ))}
          </select>

          {(selectedBrand || selectedCollection) && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          )}

          <div className="ml-auto text-sm text-gray-500">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            {products.length === 0 ? 'No products yet' : 'No matching products'}
          </h2>
          <p className="text-gray-500 mb-4">
            {products.length === 0
              ? 'Get started by adding your first product'
              : 'Try adjusting your filters'}
          </p>
          <button
            onClick={products.length === 0 ? onNewProduct : clearFilters}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mx-auto"
          >
            {products.length === 0 ? (
              <>
                <Plus size={16} /> Add Product
              </>
            ) : (
              'Clear Filters'
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className={`p-4 space-y-4 border-b last:border-b-0 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              } hover:bg-blue-50/50 transition-colors duration-200`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => toggleProductExpansion(product.id)}
                    className="mt-1 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    {expandedProducts.has(product.id) ? (
                      <ChevronDown size={20} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-500" />
                    )}
                  </button>
                  <div>
                    <h3 className="text-lg font-medium mb-2">{product.name}</h3>
                    <div className="text-sm text-gray-600">Brand: {product.brand}</div>
                    <div className="text-sm text-gray-600">Collection: {product.collection}</div>
                    <div className="text-sm text-gray-600">Category: {product.category || '-'}</div>
                    <div className="text-sm text-gray-600">Product Type: {product.product_type || '-'}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditProduct(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Edit product"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Delete product"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {product.description && (
                <div 
                  className="text-gray-600 mb-4 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}

              <div className={`mt-4 transition-all duration-200 ${expandedProducts.has(product.id) ? 'block' : 'hidden'}`}>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  Variants ({product.variants.length})
                </h4>
                <div className="grid gap-2 animate-fadeIn">
                  {product.variants?.map((variant) => (
                    <div
                      key={variant.id}
                      className="bg-gray-50 p-3 rounded-md grid grid-cols-8 gap-4 text-sm border border-gray-100"
                    >
                      <div>
                        <span className="text-gray-600">SKU:</span> {variant.sku}
                      </div>
                      <div>
                        <span className="text-gray-600">Barcode:</span> {variant.barcode || '-'}
                      </div>
                      <div>
                        <span className="text-gray-600">Size:</span> {variant.size}
                      </div>
                      <div>
                        <span className="text-gray-600">Color:</span> {variant.color}
                      </div>
                      <div>
                        <span className="text-gray-600">Purchase Price:</span> {variant.purchasePrice}
                      </div>
                      <div>
                        <span className="text-gray-600">Sales Price:</span> {variant.salesPrice}
                      </div>
                      <div>
                        <span className="text-gray-600">Stock:</span> {variant.stock}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
