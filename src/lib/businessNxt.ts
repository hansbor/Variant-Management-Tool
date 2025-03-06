import { supabase } from './supabase';

const BUSINESS_NXT_API_URL = 'https://business.visma.net';
const BUSINESS_NXT_AUTH_URL = `${BUSINESS_NXT_API_URL}/connect/token`;
const BUSINESS_NXT_GRAPHQL_URL = `${BUSINESS_NXT_API_URL}/api/graphql`;

interface BusinessNxtConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
}

interface BusinessNxtOrder {
  orderNumber: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  supplierNumber: string;
  items: BusinessNxtOrderItem[];
  notes?: string;
}

interface BusinessNxtOrderItem {
  productNumber: string;
  quantity: number;
  unitPrice: number;
}

class BusinessNxtService {
  private config: BusinessNxtConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private enabled: boolean = true;

  constructor(config: BusinessNxtConfig) {
    this.config = config;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  async testConnection(): Promise<void> {
    try {
      // Test authentication first
      await this.getAccessToken();

      // Test connection by querying a simple field
      const query = `
        query {
          __schema {
            types {
              name
            }
          }
        }
      `;
      
      await this.makeGraphQLRequest(query);
    } catch (error) {
      console.error('Connection test failed:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to connect to Business NXT: ${error.message}`);
      } else {
        throw new Error('Failed to connect to Business NXT: Unknown error');
      }
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    const response = await fetch(BUSINESS_NXT_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        scope: 'api offline_access',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get access token');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);
    return this.accessToken;
  }

  private async makeGraphQLRequest(query: string, variables?: Record<string, any>) {
    const token = await this.getAccessToken();
    const response = await fetch(BUSINESS_NXT_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Tenant-ID': this.config.tenantId,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Business NXT API request failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data;
  }

  async submitPurchaseOrder(orderNumber: string): Promise<void> {
    try {
      if (!this.enabled) {
        throw new Error('Business NXT integration is disabled');
      }

      // Get order details from Supabase
      const { data: order, error: orderError } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(supplier_number),
          items:purchase_order_items(
            *,
            variant:variants(
              sku,
              product:products(name)
            )
          )
        `)
        .eq('order_number', orderNumber)
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error('Order not found');

      // Transform to Business NXT format
      const businessNxtOrder: BusinessNxtOrder = {
        orderNumber: order.order_number,
        orderDate: order.order_date,
        expectedDeliveryDate: order.expected_delivery,
        supplierNumber: order.supplier.supplier_number,
        notes: order.notes,
        items: order.items.map((item: any) => ({
          productNumber: item.variant.sku,
          quantity: item.quantity,
          unitPrice: item.purchase_price,
        })),
      };

      // Submit order using GraphQL mutation
      const mutation = `
        mutation CreatePurchaseOrder($input: CreatePurchaseOrderInput!) {
          createPurchaseOrder(input: $input) {
            purchaseOrder {
              id
              orderNumber
              status
            }
          }
        }
      `;

      await this.makeGraphQLRequest(mutation, {
        input: {
          orderNumber: businessNxtOrder.orderNumber,
          orderDate: businessNxtOrder.orderDate,
          expectedDeliveryDate: businessNxtOrder.expectedDeliveryDate,
          supplierNumber: businessNxtOrder.supplierNumber,
          notes: businessNxtOrder.notes,
          items: businessNxtOrder.items.map(item => ({
            productNumber: item.productNumber,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      });

      // Update order status in Supabase
      const { error: updateError } = await supabase
        .from('purchase_orders')
        .update({ status: 'submitted' })
        .eq('order_number', orderNumber);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error submitting purchase order to Business NXT:', error);
      throw error;
    }
  }

  async getPurchaseOrderStatus(orderNumber: string): Promise<string> {
    const query = `
      query GetPurchaseOrder($orderNumber: String!) {
        purchaseOrder(orderNumber: $orderNumber) {
          status
        }
      }
    `;

    const result = await this.makeGraphQLRequest(query, { orderNumber });
    return result.purchaseOrder.status;
  }
}

// Create and export a singleton instance
export const businessNxt = new BusinessNxtService({
  clientId: import.meta.env.VITE_BUSINESS_NXT_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_BUSINESS_NXT_CLIENT_SECRET || '',
  tenantId: import.meta.env.VITE_BUSINESS_NXT_TENANT_ID || '',
});
