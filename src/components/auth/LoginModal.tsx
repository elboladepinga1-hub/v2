import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Phone, CreditCard } from 'lucide-react';
import app, { auth, db, storage } from '../../utils/firebaseClient'; // <-- import corregido
import { useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  adminOnly?: boolean; // if true, only show email/password login
  onSuccess?: () => void; // callback invoked after successful login
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, initialMode = 'login', adminOnly = false, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(adminOnly ? true : (initialMode === 'login'));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    cpf: '',
    phone: ''
  });

  useEffect(() => {
    if (!adminOnly) setIsLogin(initialMode === 'login');
  }, [initialMode, adminOnly]);

  const { signIn, signUp, resetPassword } = useAuth();

  const mapAuthError = (error: any, mode: 'login' | 'register' | 'reset') => {
    const code = error?.code || '';
    const msg = error?.message || '';

    if (mode === 'login') {
      if (
        code.includes('auth/invalid-credential') ||
        code.includes('auth/wrong-password') ||
        code.includes('auth/user-not-found')
      ) {
        return 'Email ou senha incorretos';
      }
    }

    if (mode === 'register') {
      if (code.includes('auth/email-already-in-use')) return 'Este email já está cadastrado';
      if (code.includes('auth/invalid-email')) return 'Email inválido';
      if (code.includes('auth/weak-password')) return 'A senha deve ter pelo menos 6 caracteres';
      if (code.includes('auth/operation-not-allowed')) return 'Método de login desativado. Ative Email/Senha no Firebase.';
      if (msg.includes('CONFIGURATION_NOT_FOUND') || code.includes('invalid-api-key') || code.includes('auth/invalid-api-key')) {
        return 'Configuração de autenticação inválida. Verifique a API key e ative Email/Senha no Firebase.';
      }
    }

    if (mode === 'reset') {
      if (code.includes('auth/user-not-found')) return 'Email não encontrado';
      if (code.includes('auth/invalid-email')) return 'Email inválido';
    }

    if (code.includes('auth/network-request-failed')) return 'Falha de rede. Verifique sua conexão e tente novamente.';

    if (mode === 'login') return 'Erro ao fazer login. Tente novamente.';
    if (mode === 'register') return 'Erro ao criar conta. Tente novamente.';
    return 'Erro ao enviar email de recuperação';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setMessage(mapAuthError(error, 'login'));
        } else {
          // call onSuccess if provided (e.g., Header wants to check admin claims)
          if (onSuccess) {
            try {
              const ok = await onSuccess();
              if (!ok) {
                setMessage('No tienes permisos de administrador.');
                setLoading(false);
                return;
              }
            } catch (e) {
              // ignore
            }
          }

          setMessage('Login realizado com sucesso!');
          setTimeout(() => onClose(), 300);
        }
      } else {
        if (adminOnly) {
          setMessage('Registro não permitido aqui. Use login por email e senha.');
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setMessage('As senhas não coincidem');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setMessage('A senha deve ter pelo menos 6 caracteres');
          setLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password);

        if (error) {
          setMessage(mapAuthError(error, 'register'));
        } else {
          setMessage('Conta criada com sucesso! Verifique seu email para confirmar.');
        }
      }
    } catch (error) {
      setMessage('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setMessage('Digite seu email primeiro');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(formData.email);
    
    if (error) {
      setMessage(mapAuthError(error, 'reset'));
    } else {
      setMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-playfair">{isLogin ? 'Entrar na Conta' : 'Criar Conta'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Sua senha"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Confirme sua senha"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {message && (
              <div className={`p-3 rounded-lg text-sm ${message.includes('sucesso') || message.includes('enviado') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </button>
          </form>

          {isLogin && !adminOnly && (
            <div className="mt-4 text-center">
              <button onClick={handleForgotPassword} className="text-sm text-primary hover:text-opacity-80" disabled={loading}>Esqueci minha senha</button>
            </div>
          )}

          {!adminOnly && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                <button onClick={() => { setIsLogin(!isLogin); setMessage(''); setFormData({ email:'', password:'', confirmPassword:'', name:'', cpf:'', phone:'' }); }} className="ml-1 text-primary hover:text-opacity-80 font-medium underline">
                  {isLogin ? 'Criar conta' : 'Fazer login'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
