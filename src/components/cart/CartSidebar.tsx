import React from 'react';
import { X, ShoppingCart, Minus, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { formatPrice as formatBRL } from '../../utils/format';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const navigate = useNavigate();
  
  console.log('🛒 CartSidebar: Rendering with items:', items);
  console.log('🛒 CartSidebar: Is open:', isOpen);
  console.log('🛒 CartSidebar: Items length:', items.length);

  const handleReservar = () => {
    if (items.length === 0) return;
    
    // Navigate to booking page - the cart items will be passed through context
    navigate('/booking');
    onClose();
  };

  const formatPrice = (price: string) => {
    try {
      const num = parseFloat(price.replace(/[^0-9.,-]/g, '').replace(/\./g, '').replace(/,/g, '.'));
      return formatBRL(isNaN(num) ? 0 : num);
    } catch (e) {
      return price;
    }
  };

  if (!isOpen) {
    console.log('🛒 CartSidebar: Not rendering because isOpen is false');
    return null;
  }

  console.log('🛒 CartSidebar: Rendering sidebar...');

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        {/* Backdrop overlay for desktop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-10 z-40"
          onClick={onClose}
        />
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart size={24} className="text-primary" />
              <h2 className="text-xl font-playfair font-medium">Carrinho</h2>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingCart size={48} className="mb-4 opacity-50" />
                <p>Seu carrinho está vazio</p>
              </div>
            ) : (
              <div className="p-4 space-y-6">
                {(() => {
                  const packageItems = items.filter(item => item.type !== 'store');
                  const extraItems = items.filter(item => item.type === 'store');
                  return (
                    <>
                      {packageItems.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Paquete contratado</h4>
                          <div className="space-y-4">
                            {packageItems.map((item) => (
                              <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex gap-3">
                                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                    <img loading="lazy" src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm text-gray-900 truncate">{item.name}</h3>
                                    <p className="text-xs text-gray-600 mb-2">{item.duration}</p>
                                    <p className="text-sm font-medium text-primary">{formatPrice(item.price)}</p>
                                  </div>
                                  <button onClick={() => removeFromCart(item.id)} className="p-1 hover:bg-gray-200 rounded">
                                    <Trash2 size={16} className="text-gray-500" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center gap-3">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-white border-2 border-yellow-400 flex items-center justify-center hover:bg-yellow-50 transition-colors"><span className="text-yellow-600 font-bold text-lg leading-none">-</span></button>
                                    <span className="w-8 text-center font-bold text-lg text-black">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-white border-2 border-yellow-400 flex items-center justify-center hover:bg-yellow-50 transition-colors"><span className="text-yellow-600 font-bold text-lg leading-none">+</span></button>
                                  </div>
                                  <p className="text-sm font-medium">Total: {formatBRL(parseFloat(item.price.replace('R$ ', '').replace('.', '').replace(',', '.')) * item.quantity)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {extraItems.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Serviços adicionais</h4>
                          <div className="space-y-4">
                            {extraItems.map((item) => (
                              <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex gap-3">
                                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                    <img loading="lazy" src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm text-gray-900 truncate">{item.name}</h3>
                                    <p className="text-xs text-gray-600 mb-2">{item.duration}</p>
                                    <p className="text-sm font-medium text-primary">{formatPrice(item.price)}</p>
                                  </div>
                                  <button onClick={() => removeFromCart(item.id)} className="p-1 hover:bg-gray-200 rounded">
                                    <Trash2 size={16} className="text-gray-500" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center gap-3">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-white border-2 border-yellow-400 flex items-center justify-center hover:bg-yellow-50 transition-colors"><span className="text-yellow-600 font-bold text-lg leading-none">-</span></button>
                                    <span className="w-8 text-center font-bold text-lg text-black">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-white border-2 border-yellow-400 flex items-center justify-center hover:bg-yellow-50 transition-colors"><span className="text-yellow-600 font-bold text-lg leading-none">+</span></button>
                                  </div>
                                  <p className="text-sm font-medium">Total: {formatBRL(parseFloat(item.price.replace('R$ ', '').replace('.', '').replace(',', '.')) * item.quantity)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-6 space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Subtotal:</span>
                <span className="text-xl font-bold text-primary">
                  {formatBRL(getTotalPrice())}
                </span>
              </div>
              
              {/* Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleReservar}
                  className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-opacity-90 transition-colors font-medium"
                >
                  Reservar Serviços
                </button>
                <button
                  onClick={clearCart}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm"
                >
                  Limpar Carrinho
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Bottom Drawer */}
      <div className="md:hidden">
        {/* Backdrop overlay - semi-transparent */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-10 z-40"
          onClick={onClose}
        />
        
        {/* Bottom drawer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 transform transition-all duration-300 ease-out"
             style={{ height: '70vh', maxHeight: '500px' }}>
          {/* Handle bar and summary */}
          <div 
            className="p-4 border-b bg-white"
          >
            {/* Handle bar */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3"></div>
            
            {items.length > 0 ? (
              <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600">Adicionado ao carrinho</p>
                    <p className="text-xs text-gray-600">
                      Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} {items.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'produto' : 'produtos'}): 
                      <span className="font-bold text-primary ml-1">
                        {formatBRL(getTotalPrice())}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReservar();
                    }}
                    className="bg-yellow-400 text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-500 transition-colors"
                  >
                    Finalizar
                  </button> */}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Seguir Comprando
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReservar();
                  }}
                  className="flex-1 bg-yellow-400 text-black py-2 px-4 rounded-md text-sm font-medium hover:bg-yellow-500 transition-colors"
                >
                  Reservar Serviços
                </button>
              </div>
              </>
            ) : (
              <div className="flex items-center justify-center">
                <p className="text-gray-500">Seu carrinho está vazio</p>
              </div>
            )}
          </div>

          {/* Expanded content */}
          <div className="flex-1 overflow-y-auto">
            {items.length > 0 && (
              <>
              <div className="p-4 space-y-6">
                {(() => {
                  const packageItems = items.filter(item => item.type !== 'store');
                  const extraItems = items.filter(item => item.type === 'store');
                  return (
                    <>
                      {packageItems.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Paquete contratado</h4>
                          <div className="space-y-4">
                            {packageItems.map((item) => (
                              <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex gap-3">
                                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                    <img loading="lazy" src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm text-gray-900 truncate">{item.name}</h3>
                                    <p className="text-xs text-gray-600 mb-2">{item.duration}</p>
                                    <div className="text-xs text-gray-600 mb-2">
                                      <p>Tipo: {item.type === 'portrait' ? 'Retratos' : item.type === 'maternity' ? 'Gestantes' : 'Eventos'}</p>
                                    </div>
                                    <p className="text-sm font-bold text-primary">{formatPrice(item.price)}</p>
                                  </div>
                                  <button onClick={() => removeFromCart(item.id)} className="p-2 hover:bg-gray-200 rounded-full">
                                    <Trash2 size={14} className="text-gray-500" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-3">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-white border-2 border-yellow-400 flex items-center justify-center hover:bg-yellow-50 transition-colors"><span className="text-yellow-600 font-bold text-lg leading-none">-</span></button>
                                    <span className="w-8 text-center font-bold text-lg text-black">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-white border-2 border-yellow-400 flex items-center justify-center hover:bg-yellow-50 transition-colors"><span className="text-yellow-600 font-bold text-lg leading-none">+</span></button>
                                  </div>
                                  <p className="text-sm font-bold text-primary">Total: {formatBRL(parseFloat(item.price.replace('R$ ', '').replace('.', '').replace(',', '.')) * item.quantity)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {extraItems.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Serviços adicionais</h4>
                          <div className="space-y-4">
                            {extraItems.map((item) => (
                              <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex gap-3">
                                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                    <img loading="lazy" src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm text-gray-900 truncate">{item.name}</h3>
                                    <p className="text-xs text-gray-600 mb-2">{item.duration}</p>
                                    <div className="text-xs text-gray-600 mb-2">
                                      <p>Tipo: Loja</p>
                                    </div>
                                    <p className="text-sm font-bold text-primary">{formatPrice(item.price)}</p>
                                  </div>
                                  <button onClick={() => removeFromCart(item.id)} className="p-2 hover:bg-gray-200 rounded-full">
                                    <Trash2 size={14} className="text-gray-500" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-3">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-white border-2 border-yellow-400 flex items-center justify-center hover:bg-yellow-50 transition-colors"><span className="text-yellow-600 font-bold text-lg leading-none">-</span></button>
                                    <span className="w-8 text-center font-bold text-lg text-black">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-white border-2 border-yellow-400 flex items-center justify-center hover:bg-yellow-50 transition-colors"><span className="text-yellow-600 font-bold text-lg leading-none">+</span></button>
                                  </div>
                                  <p className="text-sm font-bold text-primary">Total: {formatBRL(parseFloat(item.price.replace('R$ ', '').replace('.', '').replace(',', '.')) * item.quantity)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
                
                {/* Bottom action area */}
                <div className="border-t p-4 bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-xl font-bold text-primary">
                      {formatBRL(getTotalPrice())}
                    </span>
                  </div>
                  <button
                    onClick={clearCart}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm mb-2"
                  >
                    Limpar Carrinho
                  </button>
                </div>
              </>
          )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
