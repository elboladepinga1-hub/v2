import { useState, useEffect } from 'react';
import { X, Plus, ShoppingCart } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../utils/firebaseClient';
import { Product } from '../../types/store';
import { formatPrice } from '../../utils/format';

interface StorePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProducts: (products: { id: string; quantity: number; name: string; price: number; image_url?: string }[]) => void;
}

interface StoreProduct extends Product {
  custom_text?: string;
}

const StorePopup: React.FC<StorePopupProps> = ({ isOpen, onClose, onAddProducts }) => {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hiddenCategories = new Set(['vestidos', 'vestido']);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const col = collection(db, 'products');
      let q: any = col;
      try { q = query(col, orderBy('created_at', 'desc')); } catch (_) { q = col; }
      const snap = await getDocs(q);
      const raw = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as StoreProduct[];
      const seen = new Set<string>();
      const unique: StoreProduct[] = [];
      for (const p of raw) {
        const key = `${String(p.name||'').trim().toLowerCase()}|${Number(p.price)||0}|${String(p.category||'').trim().toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(p);
        }
      }
      const filtered = unique.filter(p => (p as any).active !== false && !hiddenCategories.has(String(p.category||'').toLowerCase()));
      setProducts(filtered);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('No se pudieron cargar los productos. Puedes continuar sin productos adicionales.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      const newSelected = { ...selectedProducts };
      delete newSelected[productId];
      setSelectedProducts(newSelected);
    } else {
      setSelectedProducts(prev => ({
        ...prev,
        [productId]: quantity
      }));
    }
  };

  const handleAddToBooking = () => {
    const productsToAdd = Object.entries(selectedProducts).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return {
        id: productId,
        quantity,
        name: product?.name || '',
        price: product?.price || 0,
        image_url: product?.image_url || ''
      };
    });

    onAddProducts(productsToAdd);
    onClose();
  };

  const getTotalPrice = () => {
    return Object.entries(selectedProducts).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product?.price || 0) * quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(selectedProducts).reduce((total, quantity) => total + quantity, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-primary text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-playfair">Tem interesse em algum produto adicional?</h2>
            <p className="text-white/80 mt-1">Complemente sua sessão com nossos produtos exclusivos</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 p-2"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando produtos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Produtos não disponíveis</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <p className="text-sm text-gray-500">Você pode continuar com sua reserva sem produtos adicionais.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Não há produtos disponíveis</h3>
              <p className="text-gray-600">Atualmente não temos produtos adicionais para oferecer.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                  <div className="relative">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-40 object-cover"
                    />
                    {/* Custom Text Overlay */}
                    {product.custom_text && (
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                        {product.custom_text}
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-primary bg-opacity-80 text-white px-2 py-1 rounded text-xs">
                      FOTO
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(product.id, (selectedProducts[product.id] || 0) - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50"
                          disabled={!selectedProducts[product.id]}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">
                          {selectedProducts[product.id] || 0}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(product.id, (selectedProducts[product.id] || 0) + 1)}
                          className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-opacity-90"
                        >
                          +
                        </button>
                      </div>
                      
                      {selectedProducts[product.id] && (
                        <span className="text-sm font-medium text-green-600">
                          {formatPrice(product.price * selectedProducts[product.id])}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <ShoppingCart size={20} />
                <span>{getTotalItems()} produtos selecionados</span>
              </div>
              {getTotalItems() > 0 && (
                <div className="text-lg font-bold text-primary">
                  Total: {formatPrice(getTotalPrice())}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors min-h-[48px]"
            >
              Não, obrigado
            </button>
            <button
              onClick={handleAddToBooking}
              className="flex-1 bg-primary text-white py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors min-h-[48px]"
            >
              {getTotalItems() > 0 ? 'Adicionar à minha reserva' : 'Continuar sem produtos adicionais'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePopup;
