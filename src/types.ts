export interface Variant {
  id: string;
  sku: string;
  size: string;
  color: string;
  barcode: string;
  purchasePrice: number;
  salesPrice: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  collection: string;
  category: string;
  size_category: string;
  product_type: string;
  supplier_id?: string;
  description: string;
  purchasePrice: number;
  salesPrice: number;
  variants: Variant[];
}

export interface Brand {
  id: string;
  name: string;
  code: string;
}

export interface Size {
  id: string;
  name: string;
  code: string;
  category: string;
}

export interface Color {
  id: string;
  name: string;
  code: string;
  hex: string;
}

export interface Address {
  id: string;
  supplier_id: string;
  type: 'billing' | 'shipping' | 'other';
  street: string;
  street2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
}

export interface Supplier {
  id: string;
  supplier_number: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  addresses: Address[];
}

export type PurchaseOrderStatus = 'draft' | 'submitted' | 'received' | 'cancelled';

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  variant_id: string;
  quantity: number;
  purchase_price: number;
  variant?: Variant & {
    product?: {
      name: string;
    };
  };
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  status: PurchaseOrderStatus;
  order_date: string;
  expected_delivery?: string;
  notes?: string;
  items: PurchaseOrderItem[];
  supplier?: Supplier;
}

export interface Collection {
  id: string;
  name: string;
  code: string;
}

export interface Category {
  id: string;
  name: string;
  code: string;
}

export interface ProductType {
  id: string;
  name: string;
  code: string;
}

export interface Address {
  id: string;
  supplier_id: string;
  type: 'billing' | 'shipping' | 'other';
  street: string;
  street2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
}

export interface Supplier {
  id: string;
  supplier_number: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  addresses: Address[];
}

export interface GS1Settings {
  company_prefix: string;
  location_reference: string;
  sequence_counter: number;
  enable_auto_generation: boolean;
  barcode_format: 'GTIN-13' | 'GTIN-14' | 'SSCC';
}

export interface Settings {
  editor_config: {
    enable_tinymce: boolean;
  };
  sku_config: {
    prefix: string;
    sequence_counter: number;
    enable_auto_generation: boolean;
  };
  gs1_config: GS1Settings;
}
