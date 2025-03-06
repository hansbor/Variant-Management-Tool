import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, ChevronDown, ChevronRight, FileText, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
import { PurchaseOrder, PurchaseOrderStatus } from '../types';
import { businessNxt } from '../lib/businessNxt';

interface PurchaseOrderListProps {
  onNewOrder: () => void;
  onEditOrder: (id: string) => void;
}

const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({
  onNewOrder,
  onEditOrder,
}) => {
  const { purchaseOrders, loading, deletePurchaseOrder, updateOrderStatus, fetchPurchaseOrders } = usePurchaseOrders();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'order_number' | 'order_date'>('order_number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPurchaseOrders(searchTerm, sortBy, sortOrder);
    setIsRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this purchase order?')) {
      await deletePurchaseOrder(id);
    }
  };

  const handleSubmitOrder = async (orderId: string, orderNumber: string) => {
    try {
      setSubmitting(orderId);
      await businessNxt.submitPurchaseOrder(orderNumber);
      await fetchPurchaseOrders(searchTerm, sortBy, sortOrder);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order to Business NXT');
    } finally {
      setSubmitting(null);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const getStatusColor = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'submitted':
        return <Clock className="w-4 h-4" />;
      case 'received':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const calculateTotal = (order: PurchaseOrder) => {
    return order.items.reduce((total, item) => total + (item.quantity * item.purchase_price), 0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'order_number' | 'order_date';
    setSortBy(value);
  };

  const handleSortOrderChange = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  useEffect(() => {
    fetchPurchaseOrders(searchTerm, sortBy, sortOrder);
  }, [searchTerm, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-text-base">Purchase Orders</h1>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className={`btn btn-outline ${
                isRefreshing ? 'cursor-not-allowed opacity-50' : ''
              }`}
              title="Refresh purchase orders"
              disabled={isRefreshing}
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onNewOrder}
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span>New Order</span>
            </button>
          </div>
        </div>

        <div className="flex bg-gray-50 rounded-md p-4 items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span>Filter by:</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="search"
              placeholder="Search purchase orders..."
              className="input input-bordered input-sm w-full max-w-xs"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              id="sort"
              className="select select-bordered select-sm"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="order_number">Order Number</option>
              <option value="order_date">Order Date</option>
            </select>
            <button
              onClick={handleSortOrderChange}
              className="btn btn-sm btn-ghost"
            >
              {sortOrder === 'asc' ? 'Asc' : 'Desc'}
            </button>
          </div>

          <div className="ml-auto text-sm text-gray-500">
            Showing {purchaseOrders.length} of {purchaseOrders.length} purchase orders
          </div>
        </div>
      </div>

      {purchaseOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            No purchase orders yet
          </h2>
          <p className="text-gray-500 mb-4">
            Get started by creating your first purchase order
          </p>
          <button
            onClick={onNewOrder}
            className="btn btn-primary btn-icon"
          >
            <Plus size={16} /> Create Order
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y">
          {purchaseOrders.map((order) => (
            <div
              key={order.id}
              className="p-4 hover:bg-gray-50 space-y-4"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => toggleOrderExpansion(order.id)}
                    className="mt-1 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    {expandedOrders.has(order.id) ? (
                      <ChevronDown size={20} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-500" />
                    )}
                  </button>
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      {order.order_number}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs inline-flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                    </h3>
                    <div className="text-sm text-gray-600">
                      Supplier: {order.supplier?.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      Order Date: {formatDate(order.order_date)}
                    </div>
                    {order.expected_delivery && (
                      <div className="text-sm text-gray-600">
                        Expected Delivery: {formatDate(order.expected_delivery)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {order.status === 'draft' && (
                    <>
                      <button
                        onClick={() => handleSubmitOrder(order.id, order.order_number)}
                        disabled={submitting === order.id}
                        className={`btn btn-primary ${
                          submitting === order.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {submitting === order.id ? 'Submitting...' : 'Submit to Business NXT'}
                      </button>
                      <button
                        onClick={() => onEditOrder(order.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Edit order"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        title="Delete order"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                  {order.status === 'submitted' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'received')}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Mark Received
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {order.notes && (
                <div className="text-gray-600 mb-4">
                  <h4 className="font-medium mb-1">Notes</h4>
                  <p className="whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}

              <div className={`mt-4 transition-all duration-200 ${
                expandedOrders.has(order.id) ? 'block' : 'hidden'
              }`}>
                <h4 className="font-medium mb-2">
                  Order Items ({order.items.length})
                </h4>
                <div className="grid gap-2 animate-fadeIn">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 p-3 rounded-md grid grid-cols-5 gap-4 text-sm border border-gray-100"
                    >
                      <div>
                        <span className="text-gray-600">Product:</span>
                        <div className="font-medium">{item.variant?.product?.name}</div>
                        <div className="text-gray-500">{item.variant?.sku}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Size:</span>{' '}
                        {item.variant?.size}
                      </div>
                      <div>
                        <span className="text-gray-600">Color:</span>{' '}
                        {item.variant?.color}
                      </div>
                      <div>
                        <span className="text-gray-600">Quantity:</span>{' '}
                        {item.quantity}
                      </div>
                      <div>
                        <span className="text-gray-600">Price:</span>{' '}
                        {item.purchase_price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <div className="text-right font-medium mt-2">
                    Total: {calculateTotal(order).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderList;
