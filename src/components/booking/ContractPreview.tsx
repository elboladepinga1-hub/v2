import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useRef } from 'react';
import { BookingFormData } from '../../types/booking';
import { sessionPackages } from '../../data/sessionsData';
import { eventPackages } from '../../data/eventsData';
import { maternityPackages } from '../../data/maternityData';
import { dressOptions } from '../../data/dressData';
import SignaturePad from './SignaturePad';
import Button from '../ui/Button';
import { generatePDF } from '../../utils/pdf';
import { Camera, X, CheckCircle } from 'lucide-react';
import { saveContract, updateContractStatus } from '../../utils/contractService';
import { storage } from '../../utils/firebaseClient';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PaymentModal from './PaymentModal';

function parseBRL(value: string): number {
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9.,-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '');
  const normalized = cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned.replace(/\./g, '');
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
}

interface ContractPreviewProps {
  data: BookingFormData;
  onConfirm: () => void;
  onBack: () => void;
}

const ContractPreview = ({ data, onConfirm, onBack }: ContractPreviewProps) => {
  const [clientSignature, setClientSignature] = useState<string>('');
  const [isSignatureComplete, setIsSignatureComplete] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);

  const photographerSignature = 'https://i.imgur.com/QqWZGHc.png';

  const allPackages = [...sessionPackages, ...eventPackages, ...maternityPackages];
  const selectedPackage = allPackages.find(pkg => pkg.id === data.packageId);

  const handleSignatureSave = (signature: string) => {
    setClientSignature(signature);
    setIsSignatureComplete(true);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    onConfirm();
  };

  const handleConfirm = async () => {
    if (!contractRef.current || !isSignatureComplete) return;

    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    
    // Open payment modal instead of directly generating PDF
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      setIsGeneratingPDF(true);
      
      // Generate PDF data URL
      const pdfDataUrl = await generatePDF(contractRef.current!);

      // Save contract data to Firestore
      const contractId = await saveContract(data);

      // Convert data URL to Blob
      const dataUrlToBlob = (dataUrl: string) => {
        const arr = dataUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      };

      const pdfBlob = dataUrlToBlob(pdfDataUrl);

      // Upload to Firebase Storage
      const fileRef = ref(storage, `contracts/${(typeof window !== 'undefined' && localStorage.getItem('uid')) || 'anonymous'}/${contractId}.pdf`);
      try {
        await uploadBytes(fileRef, pdfBlob, { contentType: 'application/pdf' });
        const downloadUrl = await getDownloadURL(fileRef);

        // Update contract with PDF URL
        await updateContractStatus(contractId, { pdfUrl: downloadUrl } as any);

        // Trigger download for the user
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `contrato-wild-pictures-studio-${data.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e: any) {
        console.error('Upload to storage failed', e);
        if (e && e.code === 'storage/unauthorized') {
          alert('No tienes permiso para subir el contrato al Storage. Por favor inicia sesión o contacta al administrador.');
        } else {
          alert('Error al subir el contrato al storage. El contrato fue guardado en Firestore, pero no se pudo subir el archivo.');
        }
      }

      // Trigger download for the user
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `contrato-wild-pictures-studio-${data.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error finalizing contract:', error);
      alert('Erro ao gerar/salvar o contrato. Por favor, tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (timeStr: string) => {
    return format(new Date(`2000-01-01T${timeStr}`), 'HH:mm');
  };

  const calculateTotal = () => {
    // Calculate items total considering coupon discounts (handles empty services)
    const itemsTotal = (data.cartItems || []).reduce((sum, item, index) => {
      const itemPrice = parseBRL(item.price);
      const itemTotal = itemPrice * item.quantity;
      const coupon = data[`discountCoupon_${index}`];

      // Apply item-specific discount for FREE coupon on prewedding items (excluding teaser)
      if (coupon === 'FREE' && item.id && item.id.includes('prewedding') && !item.id.includes('teaser')) {
        return sum; // FREE coupon makes the item free (0 cost)
      }

      return sum + itemTotal;
    }, 0);

    // Add store items to total
    const storeItemsTotal = (data.storeItems || []).reduce((sum, item) => {
      return sum + (Number(item.price) * Number(item.quantity));
    }, 0);

    const subtotal = itemsTotal + storeItemsTotal + (data.travelCost || 0);

    // Calculate coupon discounts for display
    const couponDiscount = (data.cartItems || []).reduce((sum, item, index) => {
      const coupon = data[`discountCoupon_${index}`];
      if (coupon === 'FREE' && item.id && item.id.includes('prewedding') && !item.id.includes('teaser')) {
        const itemPrice = parseBRL(item.price);
        return sum + (itemPrice * item.quantity);
      }
      return sum;
    }, 0);

    // Calculate original subtotal for payment discount calculation
    const originalSubtotal = (data.cartItems || []).reduce((sum, item) => {
      const itemPrice = parseBRL(item.price);
      return sum + (itemPrice * item.quantity);
    }, 0) + storeItemsTotal + (data.travelCost || 0);

    const paymentDiscount = data.paymentMethod === 'cash' ? originalSubtotal * 0.05 : 0;
    const total = subtotal - paymentDiscount;

    return {
      subtotal,
      couponDiscount,
      paymentDiscount,
      total
    };
  };

  const calculatePayments = () => {
    const { total } = calculateTotal();

    const isStoreOnly = (!(data.cartItems && data.cartItems.length) && (data.storeItems && data.storeItems.length));

    if (isStoreOnly) {
      const deposit = Math.ceil(total * 0.5);
      const remaining = Math.max(0, total - deposit);
      return { deposit, remaining, storeOnly: true as const };
    }

    // Calculate effective totals: services (with coupons) + travel, and store items
    const servicesEffective = (data.cartItems || []).reduce((sum, item, index) => {
      const itemPrice = parseBRL(item.price);
      const itemTotal = itemPrice * item.quantity;
      const coupon = data[`discountCoupon_${index}`];
      if (coupon === 'FREE' && item.id && item.id.includes('prewedding') && !item.id.includes('teaser')) {
        return sum; // FREE for eligible items
      }
      return sum + itemTotal;
    }, 0) + (data.travelCost || 0);

    const storeItemsTotal = (data.storeItems || []).reduce((sum, s) => sum + (Number(s.price) * Number(s.quantity)), 0);

    const deposit = Math.ceil(servicesEffective * 0.2 + storeItemsTotal * 0.5);
    const remaining = Math.max(0, total - deposit);
    return { deposit, remaining, storeOnly: false as const };
  };

  const { subtotal, couponDiscount, paymentDiscount, total } = calculateTotal();
  const payments = calculatePayments();
  const { deposit, remaining } = payments;

  const selectedDresses = data.selectedDresses?.map(dressId => 
    dressOptions.find(dress => dress.id === dressId)
  ).filter(Boolean) || [];

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 pt-32">
      <div ref={contractRef} className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white p-8 text-center relative">
          <div className="absolute top-4 left-4">
            <Camera size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-playfair mb-2">Contrato de Prestação de Serviços Fotográficos</h1>
          <p className="text-lg text-white/80">Wild Pictures Studio</p>
        </div>

        <div className="p-8 space-y-8">
          {/* CLÁUSULAS CONTRATUAIS */}
          {((!data.cartItems || data.cartItems.length === 0) && (data.storeItems && data.storeItems.length > 0)) ? null : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
            <div className="bg-primary text-white px-8 py-4 border-b">
              <h2 className="text-xl font-playfair font-medium">Cláusulas Contratuais</h2>
            </div>

            <div className="p-8 space-y-8">
              {/* Cláusula 1 */}
              <section>
                <h3 className="text-lg font-medium text-primary mb-4 pb-2 border-b border-secondary">
                  CLÁUSULA 1ª – DAS OBRIGAÇÕES DA CONTRATADA
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>1.1. Comparecer ao evento com antecedência suficiente, garantindo o fiel cumprimento do tempo de cobertura contratado.</p>
                  <p>1.2. Entregar todas as fotografias editadas, com correção de cores, no prazo máximo de 15 (quinze) dias úteis após a realização do evento.</p>
                  <p>1.3. Disponibilizar todos os arquivos digitais em alta resolução, devidamente editados e sem marca d'água.</p>
                  <p>1.4. Manter sigilo sobre as informações pessoais e familiares dos contratantes.</p>
                </div>
              </section>

              {/* Cláusula 2 */}
              <section>
                <h3 className="text-lg font-medium text-primary mb-4 pb-2 border-b border-secondary">
                  CLÁUSULA 2ª – DAS OBRIGAÇÕES DA CONTRATANTE
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>2.1. Realizar o pagamento conforme estipulado: 20% do valor total como sinal de reserva e o restante no dia do evento.</p>
                  <p>2.2. Fornecer todas as informações necessárias sobre o evento (horários, locais, pessoas importantes).</p>
                  <p>2.3. Garantir acesso aos locais do evento e cooperação das pessoas envolvidas.</p>
                  <p>2.4. Comunicar qualquer alteração com antecedência mínima de 48 horas.</p>
                </div>
              </section>

              {/* Cláusula 3 */}
              <section>
                <h3 className="text-lg font-medium text-primary mb-4 pb-2 border-b border-secondary">
                  CLÁUSULA 3ª – DA ENTREGA E DIREITOS AUTORAIS
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>3.1. As fotografias serão entregues em formato digital através de galeria online privada.</p>
                  <p>3.2. Os direitos autorais das fotografias pertencem ao fotógrafo, sendo concedido ao contratante o direito de uso pessoal.</p>
                  <p>3.3. É vedada a reprodução comercial das imagens sem autorização expressa da contratada.</p>
                  <p>3.4. A contratada poderá utilizar as imagens para fins de divulgação de seu trabalho.</p>
                </div>
              </section>

              {/* Cláusula 4 */}
              <section>
                <h3 className="text-lg font-medium text-primary mb-4 pb-2 border-b border-secondary">
                  CLÁUSULA 4ª – DO CANCELAMENTO E REAGENDAMENTO
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>4.1. Em caso de cancelamento pela contratante com mais de 30 dias de antecedência, será devolvido 50% do valor pago.</p>
                  <p>4.2. Cancelamentos com menos de 30 dias não terão devolução do valor pago.</p>
                  <p>4.3. Reagendamentos estão sujeitos à disponibilidade da agenda da contratada.</p>
                  <p>4.4. Casos de força maior serão analisados individualmente.</p>
                </div>
              </section>

              {/* Cláusula 5 */}
              <section>
                <h3 className="text-lg font-medium text-primary mb-4 pb-2 border-b border-secondary">
                  CLÁUSULA 5ª – DAS DISPOSIÇÕES GERAIS
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>5.1. Este contrato é regido pelas leis brasileiras.</p>
                  <p>5.2. Eventuais conflitos serão resolvidos preferencialmente por mediação.</p>
                  <p>5.3. As partes elegem o foro da comarca de Curitiba/PR para dirimir questões oriundas deste contrato.</p>
                  <p>5.4. Este contrato entra em vigor na data de sua assinatura.</p>
                </div>
              </section>

              {/* Cláusula 6 */}
              <section>
                <h3 className="text-lg font-medium text-primary mb-4 pb-2 border-b border-secondary">
                  CLÁUSULA 6ª – DA CLÁUSULA PENAL
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>6.1. O descumprimento, por qualquer das partes, das obrigações assumidas neste contrato, sujeitará a parte infratora ao pagamento de multa equivalente a 1/3 (um terço) do valor total do contrato, sem prejuízo de eventuais perdas e danos.</p>
                  <p>6.2. A cláusula penal não afasta a possibilidade de cobrança judicial ou extrajudicial de danos adicionais comprovadamente sofridos pela parte prejudicada.</p>
                  <p>6.3. No caso de a CONTRATADA não comparecer no dia do evento ou não entregar o material contratado nos prazos estabelecidos, a multa será aplicada de forma imediata, facultando ao(à) CONTRATANTE a execução do contrato e o ajuizamento de ação para reparação integral dos prejuízos, incluindo eventual indenização por danos morais.</p>
                  <p>6.4. Em caso fortuito ou força maior, devidamente comprovados, não se aplicam as penalidades acima descritas, sendo o contrato desfeito sem prejuízo a ambas as partes.</p>
                </div>
              </section>
            </div>
          </div>
          )}

          {/* DADOS DO CONTRATO */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
            <div className="bg-primary text-white px-8 py-4 border-b">
              <h2 className="text-xl font-playfair font-medium">Dados do Contrato</h2>
            </div>
            
            <div className="p-8">
              {/* Contract Parties */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-primary mb-4 pb-2 border-b border-secondary">
                  PARTES CONTRATANTES
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">CONTRATADA:</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Razão Social:</strong> Wild Pictures Studio</p>
                       <p><strong>CNPJ:</strong> 52.074.297/0001-33 </p>
                      <p><strong>Atividade:</strong> Serviços Fotográficos Profissionais</p>
                      <p><strong>Endereço:</strong> R. Ouro Verde, 314 - Jardim Santa Monica, Piraquara - PR, 83302-080 </p>
                      <p><strong>Contato:</strong> +55 41 98487-5565</p>
                      <p><strong>Dados de cobrança via PIX:</strong> 713.343.922-00</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">CONTRATANTE:</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Nome:</strong> {data.name}</p>
                      <p><strong>CPF:</strong> {data.cpf}</p>
                      <p><strong>RG:</strong> {data.rg}</p>
                      <p><strong>Email:</strong> {data.email}</p>
                      <p><strong>Telefone:</strong> {data.phone}</p>
                      <p><strong>Endereço:</strong> {data.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Object - hidden for store-only checkout */}
          {((data.cartItems && data.cartItems.length > 0) || (data.storeItems && data.storeItems.length > 0)) && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-primary mb-4 pb-2 border-b border-secondary">
                OBJETO DO CONTRATO
              </h3>
              {data.cartItems && data.cartItems.length > 0 ? (
                <div className="space-y-6">
                  {data.cartItems.map((item, index) => (
                    <div key={`service-${index}`} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h4 className="text-lg font-medium text-primary mb-4">
                        Serviço #{index + 1}: {item.name}
                      </h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                          <div className="flex items-center">
                            <span className="text-gray-600">Tipo de Serviço:</span>
                            <span className="font-medium text-gray-900 ml-2">
                              {item.type === 'events' ? 'Eventos' : item.type === 'portrait' ? 'Retratos' : 'Gestantes'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600">Pacote Contratado:</span>
                            <span className="font-medium text-gray-900 ml-2">{item.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600">Duração:</span>
                            <span className="font-medium text-gray-900 ml-2">{item.duration}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600">Quantidade:</span>
                            <span className="font-medium text-gray-900 ml-2">{item.quantity}x</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600">Data do Evento:</span>
                            <span className="font-medium text-gray-900 ml-2">
                              {data[`date_${index}`] ? formatDate(data[`date_${index}`]) : 'Não informada'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600">Horário:</span>
                            <span className="font-medium text-gray-900 ml-2">
                              {data[`time_${index}`] ? formatTime(data[`time_${index}`]) : 'Não informado'}
                            </span>
                          </div>
                          <div className="flex items-center md:col-span-2">
                            <span className="text-gray-600">Local:</span>
                            <span className="font-medium text-gray-900 ml-2">
                              {data[`eventLocation_${index}`] || 'Não informado'}
                            </span>
                          </div>
                        </div>

                        {item.type === 'maternity' && selectedDresses.length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-medium text-primary mb-2">Vestidos Selecionados</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {selectedDresses.map((dress) => (
                                <div key={dress.id} className="text-center">
                                  <div className="aspect-square overflow-hidden rounded-lg mb-2">
                                    <img loading="lazy" src={dress.image} alt={dress.name} className="w-full h-full object-cover" />
                                  </div>
                                  <p className="text-sm font-medium text-gray-900">{dress.name}</p>
                                  <p className="text-xs text-gray-600">{dress.color}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {data.storeItems && data.storeItems.length > 0 && (
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h4 className="text-lg font-medium text-primary mb-4">Produtos da Loja</h4>
                      <div className="space-y-3">
                        {data.storeItems.map((s, i) => (
                          <div key={`obj-store-${i}`} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {s.image_url ? (
                                <img loading="lazy" src={s.image_url} alt={s.name} className="w-12 h-12 object-cover rounded" />
                              ) : null}
                              <div>
                                <div className="font-medium text-gray-900">{s.name}</div>
                                <div className="text-sm text-gray-600">Quantidade: {s.quantity}</div>
                              </div>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              R$ {(Number(s.price) * Number(s.quantity)).toFixed(2).replace('.', ',')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-600">Nenhum serviço contratado</p>
                </div>
              )}
            </div>
          )}



              {/* Entrega */}
              {(() => {
                const hasServices = Boolean(data.cartItems && data.cartItems.length);
                const hasStore = Boolean(data.storeItems && data.storeItems.length);
                const getPackageDeliveryDays = (): number | null => {
                  if (!selectedPackage) return null;
                  const feat = (selectedPackage.features || []).find(f => /Entrega em\s+\d+\s+dias/i.test(f));
                  if (!feat) return null;
                  const m = feat.match(/Entrega em\s+(\d+)\s+dias/i);
                  return m ? parseInt(m[1], 10) : null;
                };
                const pkgDays = getPackageDeliveryDays();
                return (hasServices || hasStore) ? (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-primary mb-4 pb-2 border-b border-secondary">ENTREGA</h3>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="space-y-2 text-sm text-gray-700">
                        {hasServices && (
                          <p>
                            <strong>Fotos digitais:</strong> {pkgDays ?? 15} dias úteis
                          </p>
                        )}
                        {hasStore && (
                          <p>
                            <strong>Material físico:</strong> 30 dias úteis
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Summary and Totals */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-primary mb-4 pb-2 border-b border-secondary">
                  RESUMO DOS SERVIÇOS
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="space-y-4">
                    {data.cartItems?.map((item, index) => {
                      const itemPrice = parseBRL(item.price);
                      const itemTotal = itemPrice * item.quantity;
                      const coupon = data[`discountCoupon_${index}`];
                      const hasDiscount = coupon === 'FREE' && item.id && item.id.includes('prewedding') && !item.id.includes('teaser');
                      
                      return (
                        <div key={`summary-${index}`} className="flex justify-between items-center">
                          <span className="text-gray-700">
                            {item.name} ({item.quantity}x):
                          </span>
                          {hasDiscount ? (
                            <span className="space-x-2">
                              <span className="line-through text-gray-500">R$ {itemTotal.toFixed(2).replace('.', ',')}</span>
                              <span className="text-green-600 font-bold">R$ 0,00</span>
                            </span>
                          ) : (
                            <span className="font-medium text-gray-900">
                              R$ {itemTotal.toFixed(2).replace('.', ',')}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {data.storeItems && data.storeItems.length > 0 && (
                      <>
                        {data.storeItems.map((item, index) => (
                          <div key={`store-financial-${index}`} className="flex justify-between items-center">
                            <span className="text-gray-700">
                              {item.name} ({item.quantity}x):
                            </span>
                            <span className="font-medium text-gray-900">
                              R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                    {data.travelCost > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Taxa de Deslocamento:</span>
                        <span className="font-medium text-gray-900">R$ {data.travelCost.toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="font-medium">Desconto por Cupons:</span>
                        <span className="font-medium">- R$ {couponDiscount.toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                    {paymentDiscount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="font-medium">Desconto (Pagamento à Vista):</span>
                        <span className="font-medium">- R$ {paymentDiscount.toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                   <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-medium text-primary">VALOR TOTAL:</span>
                      <span className="text-2xl font-bold text-green-600">
                      R$ {total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-300">
                    <h4 className="font-medium text-gray-900 mb-4">Forma de Pagamento:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">{payments.storeOnly ? 'Sinal (50%)' : 'Sinal (20% de sinal + 50% serv. adicional)'}</p>
                          <p className="text-xl font-bold text-primary">R$ {deposit.toFixed(2).replace('.', ',')}</p>
                          <p className="text-xs text-gray-500 mt-1">Na assinatura do contrato</p>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">{payments.storeOnly ? 'Saldo Restante (50%)' : 'Saldo Restante (80%)'}</p>
                          <p className="text-xl font-bold text-green-600">R$ {remaining.toFixed(2).replace('.', ',')}</p>
                          <p className="text-xs text-gray-500 mt-1">No dia do evento</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Cupons aplicados */}
                    {(() => {
                      const appliedCoupons = data.cartItems?.filter((item, index) => {
                        const coupon = data[`discountCoupon_${index}`];
                        return coupon === 'FREE' && item.id && item.id.includes('prewedding') && !item.id.includes('teaser');
                      }) || [];
                      
                      if (appliedCoupons.length > 0) {
                        const couponDiscount = appliedCoupons.reduce((sum, item) => {
                          const itemPrice = parseBRL(item.price);
                          return sum + (itemPrice * item.quantity);
                        }, 0);
                        
                        return (
                          <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-green-700">Cupons Aplicados</span>
                              <span className="text-lg font-bold text-green-600">
                                - R$ {couponDiscount.toFixed(2).replace('.', ',')}
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
                    
                    <div className="mt-4 text-sm text-gray-600">
                      <p><strong>Método de Pagamento:</strong> {
                        data.paymentMethod === 'cash' ? 'Dinheiro (5% desconto)' :
                        data.paymentMethod === 'credit' ? 'Cartão de Crédito' : 'PIX'
                      }</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {data.message && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-primary mb-4 pb-2 border-b border-secondary">
                    OBSERVAÇÕES ADICIONAIS
                  </h3>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700">{data.message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Signatures Section */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
            <div className="bg-primary text-white px-8 py-4 border-b">
              <h2 className="text-xl font-playfair font-medium">Assinaturas das Partes</h2>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="text-center">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-primary mb-4">CONTRATADA</h4>
                    <div className="mb-4 h-20 flex items-center justify-center">
                      <img
                        src="/firma_fotografo.png"
                        alt="Assinatura do Fotógrafo"
                        width={150}  // ajusta según necesites
                        height={64}  // ajusta según necesites
                        className="max-h-16"
                      />
                    </div>
                    <div className="border-t border-gray-300 pt-4">
                      <p className="font-medium text-gray-900">Wild Pictures Studio</p>
                      <p className="text-sm text-gray-600">CNPJ: 52.074.297/0001-33</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-primary mb-4">CONTRATANTE</h4>
                    {!isSignatureComplete ? (
                      <SignaturePad
                        onSave={handleSignatureSave}
                        label="Assinatura do Cliente"
                      />
                    ) : (
                      <>
                        <div className="mb-4 h-20 flex items-center justify-center">
                          <img
                            src={clientSignature}
                            alt="Assinatura do Cliente"
                            className="max-h-16"
                          />
                        </div>
                        <div className="border-t border-gray-300 pt-4">
                          <p className="font-medium text-gray-900">{data.name}</p>
                          <p className="text-sm text-gray-600">CPF: {data.cpf}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-600 mb-8">
            Curitiba, {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>

      {/* Action Buttons - Outside PDF container */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="flex justify-center space-x-4 mt-8">
          <Button variant="secondary" onClick={onBack} disabled={isGeneratingPDF}>
            Voltar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm}
            disabled={!isSignatureComplete || isGeneratingPDF}
          >
            {isGeneratingPDF ? 'Gerando PDF...' : 'Confirmar Pagamento e Agendar'}
          </Button>
        </div>
      </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={handleCloseSuccessModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Contrato Enviado com Sucesso!
              </h3>
              
              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Cópia enviada para o estúdio</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Cópia enviada para: <strong>{data.email}</strong></span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>PDF gerado e baixado automaticamente</span>
                </div>
              </div>
              
              <button
                onClick={handleCloseSuccessModal}
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bookingData={data}
        onSuccess={handlePaymentSuccess}
      />

    </>
  );
};

export default ContractPreview;
