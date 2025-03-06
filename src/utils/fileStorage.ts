import { Product } from '../types';

const DATA_FILE = 'products.json';

export const saveToFile = async (products: Product[]) => {
  try {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = DATA_FILE;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error saving products:', error);
    throw error;
  }
};

export const loadFromFile = async (): Promise<Product[]> => {
  try {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve([]);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const products = JSON.parse(event.target?.result as string);
            resolve(products);
          } catch {
            console.error('Invalid JSON file');
            resolve([]);
          }
        };
        reader.readAsText(file);
      };

      input.click();
    });
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
};
