import React, { useState } from 'react';
import { Calendar, ExternalLink, Copy, CheckCircle, AlertCircle } from 'lucide-react';

const CalendarSetupInstructions: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [tokenInput, setTokenInput] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSetToken = () => {
    if (tokenInput.trim()) {
      (window as any).__GCAL_TOKEN = tokenInput.trim();
      alert('Token configurado com sucesso! Agora você pode usar o agendamento no calendário.');
      setTokenInput('');
    }
  };

  const steps = [
    {
      title: '1. Acesse o Google Cloud Console',
      content: (
        <div>
          <p className="mb-2">Vá para o Google Cloud Console e crie um novo projeto ou selecione um existente.</p>
          <a 
            href="https://console.cloud.google.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ExternalLink size={16} />
            Abrir Google Cloud Console
          </a>
        </div>
      )
    },
    {
      title: '2. Ative a API do Google Calendar',
      content: (
        <div>
          <p className="mb-2">No console, vá para "APIs & Services" → "Library" e ative a Google Calendar API.</p>
          <a 
            href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ExternalLink size={16} />
            Ativar Calendar API
          </a>
        </div>
      )
    },
    {
      title: '3. Crie credenciais OAuth',
      content: (
        <div>
          <p className="mb-2">Vá para "APIs & Services" → "Credentials" → "Create Credentials" → "OAuth Client ID"</p>
          <div className="bg-gray-50 p-3 rounded-lg mt-2">
            <p className="text-sm"><strong>Tipo:</strong> Web application</p>
            <p className="text-sm"><strong>Authorized redirect URIs:</strong> {window.location.origin}</p>
            <p className="text-sm"><strong>Scope necessário:</strong> https://www.googleapis.com/auth/calendar.events</p>
          </div>
        </div>
      )
    },
    {
      title: '4. Obtenha o Access Token',
      content: (
        <div>
          <p className="mb-2">Use o OAuth Playground ou faça login via OAuth flow para obter um access token.</p>
          <a 
            href="https://developers.google.com/oauthplayground/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ExternalLink size={16} />
            OAuth 2.0 Playground
          </a>
        </div>
      )
    },
    {
      title: '5. Configure o Token',
      content: (
        <div className="space-y-3">
          <p>Cole seu access token aqui para configurar:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="ya29.a0AfH6SMC..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={handleSetToken}
              disabled={!tokenInput.trim()}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50 text-sm"
            >
              Configurar
            </button>
          </div>
          <p className="text-xs text-gray-600">
            Ou execute no console: 
            <code 
              className="bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200 ml-1"
              onClick={() => copyToClipboard("window.__GCAL_TOKEN='SEU_TOKEN_AQUI'")}
            >
              window.__GCAL_TOKEN='SEU_TOKEN_AQUI'
              {copied && <CheckCircle size={12} className="inline ml-1 text-green-600" />}
            </code>
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={24} className="text-blue-600" />
        <h3 className="text-lg font-medium text-blue-800">Configuração do Google Calendar</h3>
      </div>
      
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="border-l-2 border-blue-300 pl-4">
            <h4 className="font-medium text-blue-800 mb-2">{step.title}</h4>
            <div className="text-blue-700 text-sm">{step.content}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-yellow-700 text-sm">
            <p className="font-medium mb-1">Importante para produção:</p>
            <p>Configure um callback OAuth adequado e armazene tokens de forma segura. Não exponha access tokens no código cliente.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarSetupInstructions;