import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  type: 'portrait' | 'maternity' | 'events' | 'store';
  name: string;
  price: string;
  duration: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    console.log('🛒 CartContext: Adding item to cart', newItem);
    console.log('🛒 CartContext: Current items before add:', items);
    
    setItems(prevItems => {
      console.log('🛒 CartContext: Previous items', prevItems);
      const existingItem = prevItems.find(item => item.id === newItem.id);
      let newItems;
      
      if (existingItem) {
        console.log('🛒 CartContext: Item exists, updating quantity');
        newItems = prevItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        console.log('🛒 CartContext: Adding new item');
        newItems = [...prevItems, { ...newItem, quantity: 1 }];
      }
      
      console.log('🛒 CartContext: New items array', newItems);
      return newItems;
    });
    
    console.log('🛒 CartContext: Opening cart');
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      // item.price can be a formatted string (R$ 1.000) or a number
      // use parsePrice utility for robust parsing
      try {
        // lazy import to avoid circular deps
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { parsePrice } = require('../utils/format');
        const price = parsePrice(item.price);
        return total + (price * item.quantity);
      } catch (e) {
        // fallback
        const raw = typeof item.price === 'number' ? item.price : Number(String(item.price).replace(/[^0-9.-]/g, ''));
        const price = isNaN(raw) ? 0 : raw;
        return total + (price * item.quantity);
      }
    }, 0);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getItemCount,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};
