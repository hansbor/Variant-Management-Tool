import React, { useState, useCallback, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { staticTableNames } from './TableExplorer';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "Hello! I'm your assistant. I can help you with information about products, suppliers, orders, and more. How can I help you today?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const analyzeIntent = async (text: string) => {
    // Simple rule-based intent analysis
    const text_lower = text.toLowerCase();
    
    // Check for negative sentiment words
    const negativeWords = ['not', 'no', 'bad', 'wrong', 'error', 'issue', 'problem', 'fail', 'broken'];
    const hasNegative = negativeWords.some(word => text_lower.includes(word));
    
    return {
      label: hasNegative ? 'NEGATIVE' : 'POSITIVE',
      score: hasNegative ? 0.9 : 0.7
    };
  };

  const fetchTableData = async (tableName: string, searchTerm?: string) => {
    try {
      let query = supabase.from(tableName).select('*');
      
      // Add search condition if term provided
      if (searchTerm) {
        // Try to match against any text column
        const conditions = [];
        conditions.push(`name.ilike.%${searchTerm}%`);
        conditions.push(`description.ilike.%${searchTerm}%`);
        query = query.or(conditions.join(','));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching from ${tableName}:`, error);
      return null;
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') {
      if (String(value).includes('.')) {
        return formatPrice(value);
      }
      return String(value);
    }
    if (typeof value === 'object') {
      if (value instanceof Date) return value.toLocaleDateString();
      return JSON.stringify(value);
    }
    return String(value);
  };

  const findProduct = async (query: string) => {
    // Clean and prepare search terms
    const searchTerm = query.trim();

    const { data: products } = await supabase
      .from('products')
      .select(`
        *,
        variants:variants(*),
        brand:brands!brand(name),
        collection:collections!collection(name)
      `)
      .ilike('name', `%${searchTerm}%`);

    return products;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(price);
  };

  const handleQuery = async (text: string) => {
    const lowercaseText = text.toLowerCase();
    
    // Query type detection
    const priceKeywords = ['price', 'cost', 'how much', 'what is the price', 'what does it cost', 'costs', 'pricing'];
    const stockKeywords = ['stock', 'available', 'in store', 'have', 'got', 'inventory', 'can i buy'];
    const listKeywords = ['list', 'show', 'display', 'what', 'tell me about', 'find'];
    const countKeywords = ['how many', 'count', 'total'];
    
    const isPriceQuery = priceKeywords.some(keyword => lowercaseText.includes(keyword));
    const isStockQuery = stockKeywords.some(keyword => lowercaseText.includes(keyword));
    const isListQuery = listKeywords.some(keyword => lowercaseText.includes(keyword));
    const isCountQuery = countKeywords.some(keyword => lowercaseText.includes(keyword));
    
    // Check if query mentions any table name
    const mentionedTable = staticTableNames.find(table => 
      lowercaseText.includes(table.toLowerCase()) ||
      lowercaseText.includes(table.slice(0, -1).toLowerCase()) // Check singular form
    );
    
    if (mentionedTable) {
      if (isCountQuery) {
        const data = await fetchTableData(mentionedTable);
        if (!data) return `Sorry, I couldn't fetch data from ${mentionedTable}.`;
        return `There are ${data.length} records in ${mentionedTable}.`;
      }

      if (isListQuery) {
        const data = await fetchTableData(mentionedTable);
        if (!data) return `Sorry, I couldn't fetch data from ${mentionedTable}.`;
        
        // Get first few records
        const sampleSize = Math.min(5, data.length);
        const samples = data.slice(0, sampleSize);
        
        let response = `Here are ${sampleSize} records from ${mentionedTable}:\n\n`;
        samples.forEach((record, index) => {
          response += `${index + 1}. `;
          if (record.name) {
            response += record.name;
          } else if (record.id) {
            response += `ID: ${record.id}`;
          }
          
          // Add a few key details if available
          const details = [];
          if (record.code) details.push(`Code: ${record.code}`);
          if (record.description) details.push(`Description: ${record.description}`);
          if (record.status) details.push(`Status: ${record.status}`);
          
          if (details.length > 0) {
            response += ` (${details.join(', ')})`;
          }
          
          response += '\n';
        });
        
        if (data.length > sampleSize) {
          response += `\n...and ${data.length - sampleSize} more records.`;
        }
        
        return response;
      }
    }
    
    if (!isPriceQuery && !isStockQuery) {
      return `I can help you with:

1. Product information:
   - Prices: "How much does [product] cost?"
   - Stock: "Is [product] in stock?"

2. Data queries:
   - Lists: "Show me the suppliers"
   - Counts: "How many products do we have?"
   - Details: "Tell me about [table name]"

Available tables: ${staticTableNames.join(', ')}`;
    }

    // Enhanced product name extraction
    const words = text.split(' ');
    const stopWords = [
      'price', 'cost', 'stock', 'available', 'how', 'much', 'does', 'is', 'in', 'store',
      'the', 'a', 'an', 'any', 'what', 'have', 'you', 'got', 'do', 'can', 'i', 'buy', '?',
      'tell', 'me', 'about', 'check', 'pricing', 'inventory', 'costs'
    ];
    
    const productQuery = words.filter(word => 
      !stopWords.includes(word.toLowerCase())
    ).join(' ').trim();

    if (!productQuery) {
      return "Which product would you like to know about?";
    }

    const products = await findProduct(productQuery);

    if (!products || products.length === 0) {
      return `I couldn't find any products matching "${productQuery}". Please try using the exact product name or brand.`;
    }

    if (products.length > 1) {
      let response = `I found ${products.length} products matching "${productQuery}":\n\n`;
      products.slice(0, 5).forEach((product, index) => {
        response += `${index + 1}. ${product.brand?.name || ''} ${product.name} (${product.collection?.name || ''})\n`;
      });
      if (products.length > 5) {
        response += `\n...and ${products.length - 5} more products.`;
      }
      response += '\n\nCould you be more specific?';
      return response;
    }

    const product = products[0];
    const productFullName = `${product.brand?.name || ''} ${product.name} (${product.collection?.name || ''})`.trim();
    const variants = product.variants || [];

    if (isPriceQuery) {
      const prices = variants.map(v => v.sales_price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice === maxPrice) {
        return `${productFullName} costs ${formatPrice(minPrice)}.`;
      } else {
        return `${productFullName} costs between ${formatPrice(minPrice)} and ${formatPrice(maxPrice)} depending on the size and color variant.`;
      }
    }

    if (isStockQuery) {
      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
      const inStockVariants = variants.filter(v => v.stock > 0);
      
      if (totalStock === 0) {
        return `${productFullName} is currently out of stock.`;
      }
      
      const variantDetails = inStockVariants
        .map(v => `${v.size}/${v.color}: ${v.stock} units`)
        .join('\n');

      return `${productFullName} is available in ${inStockVariants.length} variants with a total of ${totalStock} units in stock.

Available variants:\n${variantDetails}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsTyping(true);

    try {
      // Analyze user intent
      const intent = await analyzeIntent(userMessage);

      const response = await handleQuery(userMessage);
      
      // Enhance response based on sentiment
      let enhancedResponse = response;
      if (intent && intent.label === 'NEGATIVE' && intent.score > 0.8) {
        enhancedResponse = `I understand your concern. Let me help you with that.\n\n${response}`;
      }

      setMessages(prev => [...prev, {
        text: enhancedResponse,
        isUser: false 
      }]);
    } catch (error) {
      console.error('Error handling query:', error);
      setMessages(prev => [...prev, {
        text: "I'm sorry, I encountered an error while processing your request.",
        isUser: false
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-primary text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Chat Assistant</h2>
        </div>

        <div className="h-[500px] flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isUser
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-gray-800">
                  <div className="flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;