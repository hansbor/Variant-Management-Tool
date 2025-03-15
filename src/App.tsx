import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from './lib/supabase';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import Settings from './components/Settings';
import SupplierList from './components/SupplierList';
import PurchaseOrderList from './components/PurchaseOrderList';
import PurchaseOrderForm from './components/PurchaseOrderForm';
import HelpCenter from './components/HelpCenter';
import ChatBot from './components/ChatBot';
import { Product } from './types';
import TableExplorer from './components/TableExplorer';

type View = 'products' | 'suppliers' | 'settings' | 'product-form' | 'purchase-orders' | 'purchase-order-form' | 'auth' | 'help-center' | 'table-explorer' | 'chat-bot';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email to reset your password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}`,
      });

      if (error) {
        setError(error.message);
      } else {
        alert('Password reset link sent! Check your email.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-center mb-6">
            {/* Replace with your actual logo */}
            <div className="w-16 h-16 bg-visma-blue rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.5 17.4c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm0-4.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm0-4.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5z"/>
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-center text-gray-800 mb-2">Variant Management Tool</h1>


          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              E-post
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Lösenord
            </label>
            <div className="relative">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {/* Replace with eye icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          <button
            className="w-full bg-visma-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={handleSignIn}
            disabled={loading}
          >
            {loading ? 'Loggar in...' : 'Logga in'}
          </button>

          <button
            className="w-full text-gray-500 hover:text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"
            type="button"
            onClick={handleForgotPassword}
          >
            Glömt ditt lösenord?
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState<View>('products');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editPurchaseOrder, setEditPurchaseOrder] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('general');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  const handleNewProduct = useCallback(() => {
    setEditProduct(null);
    setView('product-form');
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    setEditProduct(product);
    setView('product-form');
  }, []);

  const handleProductFormClose = useCallback(() => {
    setEditProduct(null);
    setView('products');
  }, []);


  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-primary text-white px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-medium">Varianthantering</h1>
          <nav className="flex gap-4">
            <button
              onClick={() => setView('products')}
              className={`text-white hover:text-gray-200 ${
                view === 'products' || view === 'product-form' ? 'border-b-2 border-white' : ''
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setView('suppliers')}
              className={`text-white hover:text-gray-200 ${
                view === 'suppliers' ? 'border-b-2 border-white' : ''
              }`}
            >
              Suppliers
            </button>
            <button
              onClick={() => setView('purchase-orders')}
              className={`text-white hover:text-gray-200 ${
                view === 'purchase-orders' || view === 'purchase-order-form' ? 'border-b-2 border-white' : ''
              }`}
            >
              Purchase Orders
            </button>
            <button
              onClick={() => setView('settings')}
              className={`text-white hover:text-gray-200 ${
                view === 'settings' ? 'border-b-2 border-white' : ''
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setView('help-center')}
              className={`text-white hover:text-gray-200 ${
                view === 'help-center' ? 'border-b-2 border-white' : ''
              }`}
            >
              Help Center
            </button>
            <button
              onClick={() => setView('table-explorer')}
              className={`text-white hover:text-gray-200 ${
                view === 'table-explorer' ? 'border-b-2 border-white' : ''
              }`}
            >
              Table Explorer
            </button>
            <button
              onClick={() => setView('chat-bot')}
              className={`text-white hover:text-gray-200 ${
                view === 'chat-bot' ? 'border-b-2 border-white' : ''
              }`}
            >
              Chat Bot
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className={`text-white hover:text-gray-200`}
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <div className="flex">
        {view === 'settings' && (
          <Settings />
        )}
        {view === 'chat-bot' && <ChatBot />}
        {view === 'help-center' && <HelpCenter />}
        {view === 'table-explorer' && <TableExplorer />}
      </div>

      {view === 'products' && (
        <ProductList
          onNewProduct={handleNewProduct}
          onEditProduct={handleEditProduct}
        />
      )}
      {view === 'product-form' && (
        <ProductForm
          initialProduct={editProduct}
          onSave={handleProductFormClose}
          onCancel={handleProductFormClose}
        />
      )}
      {view === 'suppliers' && (
        <SupplierList />
      )}
      {view === 'purchase-orders' && (
        <PurchaseOrderList
          onNewOrder={() => {
            setEditPurchaseOrder(null);
            setView('purchase-order-form');
          }}
          onEditOrder={(id) => {
            setEditPurchaseOrder(id);
            setView('purchase-order-form');
          }}
        />
      )}
      {view === 'purchase-order-form' && (
        <PurchaseOrderForm
          orderId={editPurchaseOrder}
          onSave={() => {
            setEditPurchaseOrder(null);
            setView('purchase-orders');
          }}
          onCancel={() => {
            setEditPurchaseOrder(null);
            setView('purchase-orders');
          }}
        />
      )}
    </div>
  );
}

export default App;