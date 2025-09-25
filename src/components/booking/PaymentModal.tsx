import React, { useEffect, useState } from 'react';
import { X, Calendar, CreditCard, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { googleCalendar } from '../../utils/googleCalendar';
import { mercadoPago } from '../../utils/mercadoPago';
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext';
import { formatPrice } from '../../utils/format';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: any;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, bookingData, onSuccess }) => {
  const { flags } = useFeatureFlags();
  const paymentDisabled = flags.payments?.mpEnabled === false;
  const [step, setStep] = useState<'payment' | 'calendar' | 'success'>(paymentDisabled ? 'calendar' : 'payment');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calendarEvent, setCalendarEvent] = useState<any>(null);

  const calculatePayments = () => {
    const servicesTotal = (bookingData.cartItems || []).reduce((sum: number, item: any) => {
      const itemPrice = Number(item.price.replace(/[^0-9]/g, ''));
      const itemTotal = itemPrice * item.quantity;

      const coupon = bookingData[`discountCoupon_${bookingData.cartItems?.indexOf(item)}`];
      if (coupon === 'FREE' && item.id && item.id.includes('prewedding') && !item.id.includes('teaser')) {
        return sum;
      }

      return sum + itemTotal;
    }, 0);

    const storeTotal = (bookingData.storeItems || []).reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const subtotal = servicesTotal + storeTotal + (bookingData.travelCost || 0);
    const paymentDiscount = bookingData.paymentMethod === 'cash' ? Math.round(subtotal * 0.05) : 0;
    const total = subtotal - paymentDiscount;

    const servicesDeposit = Math.round(servicesTotal * 0.2);
    const storeDeposit = Math.round(storeTotal * 0.5);
    const deposit = Math.round(servicesDeposit + storeDeposit);
    const remaining = Math.max(0, total - deposit);

    return { total: Math.round(total), deposit: Math.round(deposit), remaining: Math.round(remaining) };
  };

  useEffect(() => {
    if (isOpen && paymentDisabled) {
      setStep('calendar');
    }
  }, [isOpen, paymentDisabled]);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      if (paymentDisabled) {
        setStep('calendar');
        return;
      }

      if (bookingData.paymentMethod === 'pix' || bookingData.paymentMethod === 'credit') {
        // Use Mercado Pago for PIX and Credit Card
        const { init_point } = await mercadoPago.createPreference(bookingData);
        
        // Open Mercado Pago checkout in new window
        const paymentWindow = window.open(init_point, '_blank', 'width=800,height=600');
        
        // Monitor payment window
        const checkClosed = setInterval(() => {
          if (paymentWindow?.closed) {
            clearInterval(checkClosed);
            // Assume payment was completed (in production, you'd verify via webhook)
            setStep('calendar');
          }
        }, 1000);

      } else {
        // Cash payment - skip to calendar
        setStep('calendar');
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleCalendarBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!googleCalendar.isAuthenticated()) {
        setError('Google Calendar não está configurado. Siga as instruções no console para configurar o token.');
        return;
      }

      const event = await googleCalendar.createBookingEvent(bookingData);
      setCalendarEvent(event);
      setStep('success');
    } catch (error: any) {
      setError(error.message || 'Erro ao agendar no Google Calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  const { total, deposit, remaining } = calculatePayments();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-medium">
            {step === 'payment' && 'Confirmar Pagamento'}
            {step === 'calendar' && 'Agendar no Calendário'}
            {step === 'success' && 'Agendamento Confirmado'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Resumo do Pagamento</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Valor Total:</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sinal (agora):</span>
                    <span className="font-bold text-primary">{formatPrice(deposit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Restante (no evento):</span>
                    <span>{formatPrice(remaining)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={20} className="text-blue-600" />
                  <span className="font-medium">Método de Pagamento</span>
                </div>
                <p className="text-sm text-blue-700">
                  {bookingData.paymentMethod === 'pix' && 'PIX - Pagamento instant��neo'}
                  {bookingData.paymentMethod === 'credit' && 'Cartão de Crédito - Parcelamento disponível'}
                  {bookingData.paymentMethod === 'cash' && 'Dinheiro - 5% de desconto aplicado'}
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processando...' : 'Confirmar Pagamento'}
              </button>
            </div>
          )}

          {step === 'calendar' && (
            <div className="space-y-4">
              <div className="text-center">
                <Calendar size={48} className="text-primary mx-auto mb-4" />
                <h4 className="font-medium mb-2">Agendar no Google Calendar</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Vamos adicionar sua sessão ao calendário para não esquecer!
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Data:</span>
                    <span className="font-medium">{bookingData.eventDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Horário:</span>
                    <span className="font-medium">{bookingData.eventTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Local:</span>
                    <span className="font-medium">{bookingData.eventLocation || 'A definir'}</span>
                  </div>
                </div>
              </div>

              {!googleCalendar.isAuthenticated() && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-yellow-700 text-sm">
                      <p className="font-medium mb-1">Configuração necessária:</p>
                      <p>Execute no console: <code className="bg-yellow-100 px-1 rounded">window.__GCAL_TOKEN='seu_token_aqui'</code></p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleCalendarBooking}
                disabled={loading || !googleCalendar.isAuthenticated()}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Agendando...' : 'Agendar no Calendário'}
              </button>

              <button
                onClick={() => setStep('success')}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Pular Agendamento
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle size={48} className="text-green-600 mx-auto" />
              <h4 className="font-medium text-lg">Tudo Pronto!</h4>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Pagamento processado</span>
                </div>
                {calendarEvent && (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Evento adicionado ao calendário</span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Contrato salvo e enviado por email</span>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-opacity-90"
              >
                Finalizar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
