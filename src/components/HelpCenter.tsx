import React from 'react';
import { HelpCircle, Box, Tag, Barcode, Package2, Settings as SettingsIcon, FileSpreadsheet, ShoppingCart, Truck, ClipboardCheck } from 'lucide-react';

const HelpCenter: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
          </div>
          <p className="mt-2 text-gray-600">
            Welcome to the Product Management System documentation. Here you'll find detailed information about how to use the system effectively.
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Core Concepts */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Core Concepts</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Box className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Products</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Products are the main entities in the system. Each product can have multiple variants with different sizes, colors, and prices.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Variants</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Variants represent different versions of a product, typically with unique combinations of size, color, and other attributes.
                </p>
              </div>
            </div>
          </section>

          {/* Key Features */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Features</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Product Management</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                  <li>Create and edit products with detailed information</li>
                  <li>Manage multiple variants per product</li>
                  <li>Track stock levels and prices</li>
                  <li>Rich text editor for product descriptions</li>
                </ul>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Variant Generation</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                  <li>Add individual variants manually</li>
                  <li>Generate variants for all sizes in a category automatically</li>
                  <li>Automatic SKU and barcode generation</li>
                  <li>Bulk price updates</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Data Management</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                  <li>Import and export product data</li>
                  <li>Export to Excel for detailed analysis</li>
                  <li>Filter and search functionality</li>
                  <li>Bulk operations support</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Settings & Configuration */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Settings & Configuration</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Barcode className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">GS1 Configuration</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Configure GS1 settings for standardized barcode generation, including company prefix and location reference.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package2 className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">SKU Generation</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Set up automatic SKU generation with custom prefixes and sequential numbering.
                </p>
              </div>
            </div>
          </section>

          {/* Common Tasks */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Common Tasks</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Creating a New Product</h3>
                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
                  <li>Click "New Product" in the product list view</li>
                  <li>Fill in the basic product information</li>
                  <li>Add variants using either single or bulk generation</li>
                  <li>Set prices and stock levels</li>
                  <li>Save the product</li>
                </ol>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Managing Size Categories</h3>
                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
                  <li>Navigate to Settings</li>
                  <li>Select the Sizes section</li>
                  <li>Create or edit size categories</li>
                  <li>Add sizes to categories</li>
                </ol>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Exporting Data</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>The system offers two export formats:</p>
                  <div className="ml-4">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <p><strong>Excel Export:</strong> Comprehensive product data with all variants and details</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Package2 className="w-4 h-4" />
                      <p><strong>CSV Export:</strong> Simple format for specific product variants</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Purchase Orders */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Purchase Orders</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Order Management</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                      <h4 className="font-medium">Creating Orders</h4>
                    </div>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>Select supplier from your supplier list</li>
                      <li>Set order date and expected delivery</li>
                      <li>Add products and variants to the order</li>
                      <li>Specify quantities and purchase prices</li>
                      <li>Add notes for special instructions</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-primary" />
                      <h4 className="font-medium">Order Status</h4>
                    </div>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li><strong>Draft:</strong> Initial state, can be edited</li>
                      <li><strong>Submitted:</strong> Order sent to supplier</li>
                      <li><strong>Received:</strong> Products have arrived</li>
                      <li><strong>Cancelled:</strong> Order was cancelled</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardCheck className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Order Processing</h3>
                </div>
                <div className="space-y-4 text-sm text-gray-600">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">1. Creating an Order</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Click "New Order" in the Purchase Orders view</li>
                      <li>Select a supplier from your supplier list</li>
                      <li>Set the order date and expected delivery date</li>
                      <li>Add any relevant notes or special instructions</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">2. Adding Items</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Select products from the supplier's catalog</li>
                      <li>Choose specific variants (size/color)</li>
                      <li>Set quantities for each item</li>
                      <li>Adjust purchase prices if needed</li>
                      <li>Add multiple items to the same order</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">3. Order Workflow</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Save order as draft for later editing</li>
                      <li>Submit order when ready to send to supplier</li>
                      <li>Mark as received when products arrive</li>
                      <li>Cancel order if needed</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">4. Managing Orders</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>View all orders in the Purchase Orders list</li>
                      <li>Filter and sort orders by status</li>
                      <li>Track expected deliveries</li>
                      <li>Monitor order totals and quantities</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                <h4 className="font-medium text-blue-800 mb-2">Tips for Efficient Order Management</h4>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                  <li>Keep supplier information up to date</li>
                  <li>Review draft orders before submission</li>
                  <li>Track expected delivery dates</li>
                  <li>Add detailed notes for special requirements</li>
                  <li>Regularly check order status updates</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Settings Overview */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Settings Overview</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <SettingsIcon className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Available Settings</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Master Data</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Brands</li>
                    <li>Collections</li>
                    <li>Categories</li>
                    <li>Product Types</li>
                    <li>Sizes</li>
                    <li>Colors</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">System Settings</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Editor Configuration</li>
                    <li>GS1 Settings</li>
                    <li>SKU Generation</li>
                    <li>Size Categories</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
