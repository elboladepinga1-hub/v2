import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import CartSidebar from './CartSidebar';

const CartIcon: React.FC = () => {
  const { getItemCount, isCartOpen, setIsCartOpen } = useCart();
  const itemCount = getItemCount();
  
  console.log('🛒 CartIcon: Current item count:', itemCount);
  console.log('🛒 CartIcon: Is cart open:', isCartOpen);

  return (
    <>
      <button
        onClick={() => setIsCartOpen(!isCartOpen)}
        className="relative p-2 text-white hover:text-secondary transition-colors z-50"
        aria-label="Carrinho"
      >
        <ShoppingCart size={20} />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-secondary text-primary text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>
      
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  );
};

export default CartIcon;