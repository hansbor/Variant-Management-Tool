import React from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpMenu: React.FC<HelpMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <HelpCircle className="text-primary" size={24} />
            Help & Documentation
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-medium mb-3">Products</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Creating Products</h4>
                  <p className="text-gray-600">
                    1. Click "New Product" to create a product
                    <br />
                    2. Fill in the required fields in order:
                    <br />
                    - Product Name
                    <br />
                    - Default Purchase & Sales Prices
                    <br />
                    - Select Supplier
                    <br />
                    - Choose Brand
                    <br />
                    - Select Collection
                    <br />
                    - Pick Category
                    <br />
                    - Choose Product Type
                    <br />
                    - Set Size Category
                    <br />
                    - Add Description
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Managing Variants</h4>
                  <p className="text-gray-600">
                    - Click "Add Single Variant" for individual variants
                    <br />
                    - Use "Add All Sizes" to create variants for all sizes in the selected category
                    <br />
                    - Each variant can have unique SKU, barcode, size, color, and pricing
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Exporting Data</h4>
                  <p className="text-gray-600">
                    - Use "Export" to save products as JSON
                    <br />
                    - "Export Excel" creates a detailed spreadsheet
                    <br />
                    - Individual products can export variants to CSV
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-3">Suppliers</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Managing Suppliers</h4>
                  <p className="text-gray-600">
                    - Add new suppliers with contact details
                    <br />
                    - Manage multiple addresses per supplier
                    <br />
                    - Set default billing and shipping addresses
                    <br />
                    - Link suppliers to products for better organization
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-3">Settings</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Configuration Options</h4>
                  <p className="text-gray-600">
                    - Manage brands, collections, and categories
                    <br />
                    - Configure product types
                    <br />
                    - Set up sizes and colors
                    <br />
                    - Configure GS1 barcode settings
                    <br />
                    - Set up automatic SKU generation
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Editor Settings</h4>
                  <p className="text-gray-600">
                    Choose between rich text or plain text editor for product descriptions
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-3">Tips & Shortcuts</h3>
              <div className="space-y-2 text-gray-600">
                <p>• Use filters to quickly find products</p>
                <p>• Expand product rows to view variants</p>
                <p>• Set default prices that apply to all variants</p>
                <p>• Use bulk size generation for faster variant creation</p>
                <p>• Keep supplier information updated for better inventory management</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpMenu;
