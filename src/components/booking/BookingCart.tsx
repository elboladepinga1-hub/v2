import { useMemo } from 'react';
import { CartItem, PaymentMethod } from '../../types/booking';
import { MapPin, CreditCard, Wallet, QrCode, ChevronRight, AlertCircle } from 'lucide-react';
import { formatPrice as formatBRL } from '../../utils/format';

interface BookingCartProps {
  cartItems: any[];
  travelCost: number;
  paymentMethod: PaymentMethod;
  formData?: any;
}

const BookingCart = ({ cartItems, travelCost, paymentMethod, formData = {} }: BookingCartProps) => {
  const calculateItemTotal = (item: any): number => {
    let price = formatPrice(item.price);
    
    return price * item.quantity;
  };

  const formatPrice = (price: string | number): number => {
    if (typeof price === 'string') {
      return Number(price.replace(/[^0-9]/g, ''));
    }
    return price;
  };

  const calculateTotal = (): { subtotal: number; discount: number; total: number; deposit: number; remaining: number; depositServices: number; depositStore: number } => {
    const itemsTotal = cartItems.reduce((sum, item, index) => {
      const itemTotal = calculateItemTotal(item);
      const coupon = formData[`discountCoupon_${index}`];
      
      // Apply item-specific discount for FREE coupon on prewedding items (excluding teaser)
      if (coupon === 'FREE' && item.id && item.id.includes('prewedding') && !item.id.includes('teaser')) {
        return sum; // FREE coupon makes the item free (0 cost)
      }
      
      return sum + itemTotal;
    }, 0);
    
    // Store items total (no coupons)
    const storeItemsTotal = (formData.storeItems || []).reduce((sum: number, s: any) => sum + (Number(s.price) * Number(s.quantity)), 0);

    const subtotal = itemsTotal + storeItemsTotal + travelCost;

    // Apply payment method discount (cash discount)
    const paymentDiscount = paymentMethod === 'cash' ? Math.round(subtotal * 0.05) : 0;
    
    // Calculate total item discounts for display
    const itemDiscounts = cartItems.reduce((sum, item, index) => {
      const coupon = formData[`discountCoupon_${index}`];
      if (coupon === 'FREE' && item.id && item.id.includes('prewedding') && !item.id.includes('teaser')) {
        return sum + calculateItemTotal(item);
      }
      return sum;
    }, 0);
    
    const totalDiscount = itemDiscounts + paymentDiscount;
    const total = subtotal - totalDiscount;

    // Deposit: 20% of photo packages (after coupons) + 50% of additional services (store items). Travel cost is excluded.
    const servicesAfterCoupons = cartItems.reduce((sum, item, index) => {
      const itemTotal = calculateItemTotal(item);
      const coupon = formData[`discountCoupon_${index}`];
      if (coupon === 'FREE' && item.id && item.id.includes('prewedding') && !item.id.includes('teaser')) {
        return sum; // item becomes free
      }
      return sum + itemTotal;
    }, 0);

    const depositServices = Math.max(0, Math.round(servicesAfterCoupons * 0.2));
    const depositStore = Math.max(0, Math.round(storeItemsTotal * 0.5));
    const deposit = Math.max(0, Math.round(depositServices + depositStore));
    const remaining = Math.max(0, Math.round(total - deposit));

    return {
      subtotal,
      discount: totalDiscount,
      total,
      deposit,
      remaining,
      depositServices,
      depositStore
    };
  };

  const { subtotal, discount, total, deposit, remaining, depositServices, depositStore } = calculateTotal();

  const paymentIcons = {
    cash: <Wallet className="w-4 h-4" />,
    credit: <CreditCard className="w-4 h-4" />,
    pix: <QrCode className="w-4 h-4" />
  };

  const paymentLabels = {
    cash: 'Dinheiro (5% desconto)',
    credit: 'Cartão de Crédito',
    pix: 'PIX'
  };

  if (!cartItems || (cartItems.length === 0 && (!formData.storeItems || formData.storeItems.length === 0))) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Resumo do Pedido</h3>
        <p className="text-gray-500">Nenhum serviço selecionado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Cart */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Price Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="text-right">
            <div className="text-2xl font-normal text-red-600 mb-1">
              {formatBRL(total)}
            </div>
            {discount > 0 && (
              <div className="text-sm text-gray-600 line-through">
                Você economizou {formatBRL(discount)}!
              </div>
            )}
          </div>

          {/* Botones comentados temporalmente */}
          {/*
          <div className="mt-4 space-y-2">
            <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-4 rounded-md text-sm transition-colors">
              Voltar ao contrato
            </button>
            <button className="w-full bg-orange-400 hover:bg-orange-500 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors">
              Revisar e assinar
            </button>
          </div>
          */}
        </div> {/* Cierre del Price Section */}

        {/* Package Details */}
        <div className="p-6">
          {cartItems.length > 0 && (
            <>
              <h3 className="font-medium text-gray-900 mb-3">Serviços Contratados</h3>
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={`cart-item-${index}`} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img loading="lazy"
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">{item.name}</h4>
                        <p className="text-xs text-gray-600">{item.duration}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="text-gray-900 capitalize">
                          {item.type === 'events' ? 'Eventos' : item.type === 'portrait' ? 'Retratos' : item.type === 'maternity' ? 'Gestantes' : item.type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantidade:</span>
                        <span className="text-gray-900">{item.quantity}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Preço unitário:</span>
                        <span className="text-gray-900">{item.price}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-900">Subtotal:</span>
                        <span className="text-gray-900">
                          {(() => {
                            const coupon = formData[`discountCoupon_${index}`];
                            const itemTotal = calculateItemTotal(item);
                            const hasDiscount = coupon === 'FREE' && item.id && item.id.includes('prewedding') && !item.id.includes('teaser');

                            if (hasDiscount) {
                              return (
                                <span className="space-x-2">
                                  <span className="line-through text-gray-500">{formatBRL(itemTotal)}</span>
                                  <span className="text-green-600 font-bold">{formatBRL(0)}</span>
                                </span>
                              );
                            }

                            return formatBRL(itemTotal);
                          })()}
                        </span>
                      </div>
                      {(() => {
                        const coupon = formData[`discountCoupon_${index}`];
                        const hasDiscount = coupon === 'FREE' && item.id && item.id.includes('prewedding') && !item.id.includes('teaser');

                        if (hasDiscount) {
                          return (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-center">
                              <span className="text-green-600 text-sm font-medium">🎉 Cupom FREE aplicado!</span>
                            </div>
                          );
                        }

                        return null;
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {formData.storeItems && formData.storeItems.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Serviços adicionais</h4>
              <div className="space-y-2">
                {formData.storeItems.map((s: any, idx: number) => (
                  <div key={`store-item-${idx}`} className="flex justify-between items-center text-sm bg-white rounded border p-2">
                    <div className="flex items-center gap-3">
                      {s.image_url ? (
                        <div className="w-10 h-10 rounded overflow-hidden">
                          <img src={s.image_url} alt={s.name} className="w-full h-full object-cover" />
                        </div>
                      ) : null}
                      <span className="text-gray-800">{s.name} ({s.quantity}x)</span>
                    </div>
                    <span className="font-medium text-gray-900">{formatBRL(Number(s.price) * Number(s.quantity))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 space-y-2 text-sm">
            {travelCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Taxa de deslocamento:</span>
                <span className="text-gray-900">{formatBRL(travelCost)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Forma de pagamento:</span>
              <span className="text-gray-900 flex items-center gap-1">
                {paymentIcons[paymentMethod]}
                {paymentLabels[paymentMethod]}
              </span>
            </div>
          </div>

          {/* Features */}
          {cartItems.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">O que está incluído:</h4>
              <div className="space-y-2">
                {cartItems.map((item, index) => (
                  <div key={`features-${index}`}>
                    <p className="text-sm font-medium text-gray-800">{item.name}:</p>
                    <ul className="space-y-1 ml-4">
                      {item.features?.slice(0, 3).map((feature: string, fIndex: number) => (
                        <li key={fIndex} className="text-sm text-gray-600 flex items-start">
                          <span className="text-green-600 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">i</span>
          </div>
          <span className="font-medium text-gray-900">Entrega</span>
        </div>
        <div className="text-sm text-gray-600 ml-8">
          <div className="mb-1">
            <span className="font-medium text-gray-900">Fotos digitais:</span> 15 dias úteis
          </div>
          <div>
            <span className="font-medium text-gray-900">Material físico:</span> 30 dias úteis
          </div>
        </div>
      </div>

      {/* Payment Terms */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Condições de Pagamento</span>
        </div>
        
        <div className="space-y-3">
          {depositServices > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-900">Sinal 20% Pacotes</span>
                <span className="text-lg font-bold text-gray-900">{formatBRL(depositServices)}</span>
              </div>
              <div className="text-xs text-gray-600">Sobre os pacotes de fotos</div>
            </div>
          )}

          {depositStore > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-900">Sinal 50% Adicionais</span>
                <span className="text-lg font-bold text-gray-900">{formatBRL(depositStore)}</span>
              </div>
              <div className="text-xs text-gray-600">Sobre os serviços adicionais</div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-900">Sinal Total</span>
              <span className="text-lg font-bold text-gray-900">{formatBRL(deposit)}</span>
            </div>
            <div className="text-xs text-gray-600">Para confirmar a reserva</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-900">Restante</span>
              <span className="text-lg font-bold text-gray-900">{formatBRL(remaining)}</span>
            </div>
            <div className="text-xs text-gray-600">No dia do evento</div>
          </div>

          {/* Cupons aplicados */}
          {(() => {
            const appliedCoupons = cartItems.filter((item, index) => {
              const coupon = formData[`discountCoupon_${index}`];
              return coupon === 'FREE' && item.id && item.id.includes('prewedding') && !item.id.includes('teaser');
            });
            
            if (appliedCoupons.length > 0) {
              return (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-green-700">Cupons Aplicados</span>
                    <span className="text-lg font-bold text-green-600">
                      - {formatBRL(appliedCoupons.reduce((sum, item) => sum + calculateItemTotal(item), 0))}
                    </span>
                  </div>
                  <div className="text-xs text-green-600">
                    {appliedCoupons.map((item, index) => (
                      <div key={index}>• {item.name} - Cupom FREE</div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {discount > 0 && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-green-700">Desconto Pagamento (5%)</span>
                <span className="text-lg font-bold text-green-600">- {formatBRL(discount)}</span>
              </div>
              <div className="text-xs text-green-600">Por pagamento em dinheiro</div>
            </div>
          )}

          <div className="border-t pt-3 mt-3">
            <div className="bg-white rounded-lg p-3 border-2 border-green-500">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total Final</span>
                <span className="text-2xl font-bold text-green-600">{formatBRL(total)}</span>
              </div>
              {discount > 0 && (
                <div className="text-sm text-green-600 text-right mt-1">
                  Você economizou {formatBRL(discount)}!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCart;
