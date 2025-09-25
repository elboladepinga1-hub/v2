import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../utils/firebaseClient';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  Mail, 
  Phone, 
  CreditCard,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut,
  Download,
  Eye,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generatePDF } from '../utils/pdf';

interface Contract {
  id: string;
  clientName: string;
  clientEmail: string;
  eventType: string;
  eventDate: string;
  contractDate: string;
  totalAmount: number;
  travelFee: number;
  paymentMethod: string;
  depositPaid: boolean;
  finalPaymentPaid: boolean;
  eventCompleted: boolean;
  createdAt: string;
  packageTitle?: string;
  packageDuration?: string;
  teamMemberName?: string;
  eventLocation?: string;
  eventTime?: string;
  services?: any[];
  storeItems?: any[];
  message?: string;
}

const ClientDashboardPage: React.FC = () => {
  const { user, userProfile, signOut } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contracts');

  useEffect(() => {
    if (user && userProfile) {
      fetchUserContracts();
    }
  }, [user, userProfile]);

  const fetchUserContracts = async () => {
    try {
      setLoading(true);
      
      // Query contracts by client email
      const contractsQuery = query(
        collection(db, 'contracts'),
        where('clientEmail', '==', user?.email || ''),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(contractsQuery);
      const contractsData: Contract[] = [];

      querySnapshot.forEach((doc) => {
        contractsData.push({
          id: doc.id,
          ...doc.data()
        } as Contract);
      });

      setContracts(contractsData);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (contract: Contract) => {
    if (contract.eventCompleted) return 'text-green-600';
    if (contract.finalPaymentPaid) return 'text-blue-600';
    if (contract.depositPaid) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (contract: Contract) => {
    if (contract.eventCompleted) return <CheckCircle size={20} className="text-green-600" />;
    if (contract.finalPaymentPaid) return <Clock size={20} className="text-blue-600" />;
    if (contract.depositPaid) return <AlertCircle size={20} className="text-yellow-600" />;
    return <XCircle size={20} className="text-red-600" />;
  };

  const getStatusText = (contract: Contract) => {
    if (contract.eventCompleted) return 'Evento Concluído';
    if (contract.finalPaymentPaid) return 'Aguardando Evento';
    if (contract.depositPaid) return 'Aguardando Pagamento Final';
    return 'Aguardando Sinal';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const handleDownloadContract = async (contract: Contract) => {
    try {
      // Create a temporary contract element for PDF generation
      const contractElement = document.createElement('div');
      contractElement.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #121212; padding-bottom: 20px;">
            <h1 style="color: #121212; font-size: 24px; margin-bottom: 10px;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS</h1>
            <p style="color: #666; font-size: 16px;">Wild Pictures Studio</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #121212; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #D4AF37; padding-bottom: 5px;">DADOS DO CONTRATO</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <h3 style="color: #121212; font-size: 14px; margin-bottom: 10px;">CONTRATADA:</h3>
                <p style="font-size: 12px; line-height: 1.5; color: #333;">
                  <strong>Razão Social:</strong> Wild Pictures Studio<br>
                  <strong>CNPJ:</strong> 52.074.297/0001-33<br>
                  <strong>Endereço:</strong> R. Ouro Verde, 314 - Jardim Santa Monica, Piraquara - PR<br>
                  <strong>Contato:</strong> +55 41 98487-5565
                </p>
              </div>
              <div>
                <h3 style="color: #121212; font-size: 14px; margin-bottom: 10px;">CONTRATANTE:</h3>
                <p style="font-size: 12px; line-height: 1.5; color: #333;">
                  <strong>Nome:</strong> ${contract.clientName}<br>
                  <strong>Email:</strong> ${contract.clientEmail}<br>
                  <strong>Evento:</strong> ${contract.eventType}<br>
                  <strong>Data:</strong> ${formatDate(contract.eventDate)}
                </p>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #121212; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #D4AF37; padding-bottom: 5px;">RESUMO FINANCEIRO</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Valor Total:</span>
                <span style="font-weight: bold;">${formatCurrency(contract.totalAmount)}</span>
              </div>
              ${contract.travelFee > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span>Taxa de Deslocamento:</span>
                  <span>${formatCurrency(contract.travelFee)}</span>
                </div>
              ` : ''}
              <div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <span>Sinal (20%):</span>
                  <span style="font-weight: bold;">${formatCurrency(Math.round(contract.totalAmount * 0.2))}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Restante (80%):</span>
                  <span style="font-weight: bold;">${formatCurrency(Math.round(contract.totalAmount * 0.8))}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 40px; color: #666; font-size: 12px;">
            Curitiba, ${formatDate(contract.contractDate)}
          </div>
        </div>
      `;
      
      document.body.appendChild(contractElement);
      
      const pdfUrl = await generatePDF(contractElement);
      
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `contrato-wild-pictures-${contract.clientName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      document.body.removeChild(contractElement);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar o PDF. Por favor, tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 pt-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando seus dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-32">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="card mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-playfair mb-2">
                Olá, {userProfile?.name || user?.email || 'Cliente'}!
              </h1>
              <p className="text-gray-600">Bem-vindo ao seu painel de cliente</p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/store"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 text-sm"
              >
                Comprar serviços extras
              </a>
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut size={20} />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('contracts')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'contracts'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="inline-block mr-2" size={20} />
                Meus Contratos
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'services'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Package className="inline-block mr-2" size={20} />
                Meus Serviços
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="inline-block mr-2" size={20} />
                Meu Perfil
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'contracts' && (
              <div>
                <h2 className="text-2xl font-playfair mb-6">Meus Contratos</h2>
                
                {contracts.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum contrato encontrado
                    </h3>
                    <p className="text-gray-600">
                      Você ainda não possui contratos em nosso sistema.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {contracts.map((contract) => (
                      <div key={contract.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                              {contract.eventType}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(contract)}
                              <span className={`font-medium ${getStatusColor(contract)}`}>
                                {getStatusText(contract)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              {formatCurrency(contract.totalAmount)}
                            </p>
                            {contract.travelFee > 0 && (
                              <p className="text-sm text-gray-600">
                                + {formatCurrency(contract.travelFee)} (deslocamento)
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="text-gray-400" size={16} />
                            <span className="text-sm text-gray-600">
                              Data do Evento: {formatDate(contract.eventDate)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <FileText className="text-gray-400" size={16} />
                            <span className="text-sm text-gray-600">
                              Contrato: {formatDate(contract.contractDate)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <CreditCard className="text-gray-400" size={16} />
                            <span className="text-sm text-gray-600">
                              Pagamento: {contract.paymentMethod === 'cash' ? 'Dinheiro' : 
                                         contract.paymentMethod === 'credit' ? 'Cartão' : 'PIX'}
                            </span>
                          </div>
                        </div>

                        {/* Payment Status */}
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-gray-900 mb-3">Status dos Pagamentos</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Sinal (20%)</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {formatCurrency(contract.totalAmount * 0.2)}
                                </span>
                                {contract.depositPaid ? (
                                  <CheckCircle size={16} className="text-green-600" />
                                ) : (
                                  <XCircle size={16} className="text-red-600" />
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Restante (80%)</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {formatCurrency(contract.totalAmount * 0.8)}
                                </span>
                                {contract.finalPaymentPaid ? (
                                  <CheckCircle size={16} className="text-green-600" />
                                ) : (
                                  <XCircle size={16} className="text-red-600" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownloadContract(contract)}
                            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 text-sm"
                          >
                            <Download size={16} />
                            Baixar Contrato
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <h2 className="text-2xl font-playfair mb-6">Meus Serviços</h2>
                
                {contracts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum serviço contratado
                    </h3>
                    <p className="text-gray-600">
                      Você ainda não contratou nenhum serviço conosco.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contracts.map((contract) => (
                      <div key={contract.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            {getStatusIcon(contract)}
                            <h3 className="text-lg font-medium text-gray-900">
                              {contract.eventType}
                            </h3>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              <span>{formatDate(contract.eventDate)}</span>
                            </div>
                            {contract.eventTime && (
                              <div className="flex items-center gap-2">
                                <Clock size={14} />
                                <span>{contract.eventTime}</span>
                              </div>
                            )}
                            {contract.eventLocation && (
                              <div className="flex items-center gap-2">
                                <MapPin size={14} />
                                <span className="truncate">{contract.eventLocation}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">Valor Total</span>
                              <span className="font-bold text-primary">
                                {formatCurrency(contract.totalAmount)}
                              </span>
                            </div>
                            {contract.travelFee > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">+ Deslocamento</span>
                                <span className="text-xs text-gray-600">
                                  {formatCurrency(contract.travelFee)}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <button
                              onClick={() => handleDownloadContract(contract)}
                              className="w-full bg-primary text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-opacity-90 text-sm"
                            >
                              <Download size={16} />
                              Baixar Contrato
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-playfair mb-6">Meu Perfil</h2>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <User className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Nome</p>
                        <p className="font-medium">{userProfile?.name || 'Não informado'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CreditCard className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">CPF</p>
                        <p className="font-medium">{userProfile?.cpf || 'Não informado'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Telefone</p>
                        <p className="font-medium">{userProfile?.phone || 'Não informado'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 md:col-span-2">
                      <MapPin className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Endereço</p>
                        <p className="font-medium">{userProfile?.address || 'Não informado'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Membro desde:</strong> {userProfile?.createdAt ? formatDate(userProfile.createdAt) : 'Data não disponível'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardPage;
