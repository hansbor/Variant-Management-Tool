export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          brand: string
          collection: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          brand: string
          collection: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string
          collection?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      variants: {
        Row: {
          id: string
          product_id: string
          sku: string
          size: string
          color: string
          barcode: string | null
          purchase_price: number
          sales_price: number
          stock: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          sku: string
          size: string
          color: string
          barcode?: string | null
          purchase_price: number
          sales_price: number
          stock: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          sku?: string
          size?: string
          color?: string
          barcode?: string | null
          purchase_price?: number
          sales_price?: number
          stock?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
