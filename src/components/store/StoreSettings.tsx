import React, { useEffect, useMemo, useState } from 'react';
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext';

// Mercado Pago config is validated via Firebase Functions, not stored locally.

const StoreSettings: React.FC = () => {
  const { flags, setPageEnabled, setPaymentEnabled } = useFeatureFlags();
  const [mpEnabledLocal, setMpEnabledLocal] = useState<boolean>(Boolean(flags.payments?.mpEnabled ?? true));
  const [mpConfigured, setMpConfigured] = useState<'unknown' | 'ok' | 'missing'>('unknown');

  useEffect(() => {
    setMpEnabledLocal(Boolean(flags.payments?.mpEnabled ?? true));
  }, [flags.payments?.mpEnabled]);

  useEffect(() => {
    const verify = async () => {
      try {
        const { httpsCallable } = await import('firebase/functions');
        const { functions } = await import('../../utils/firebaseClient');
        const call: any = httpsCallable(functions as any, 'mpCheckConfig');
        const resp: any = await call({});
        setMpConfigured(resp?.data?.configured ? 'ok' : 'missing');
      } catch (_) {
        setMpConfigured('missing');
      }
    };
    verify();
  }, []);

  const pageEntries = useMemo(() => Object.entries(flags.pages), [flags.pages]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="section-title">Ajustes da Loja</h2>
        <p className="text-gray-600">Configure a visibilidade de páginas e opções de pagamento.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-medium mb-3">Visibilidade de Páginas</h3>
          <p className="text-sm text-gray-600 mb-3">Habilite ou desabilite páginas para ocultá-las do site.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pageEntries.map(([key, value]) => (
              <label key={key} className="flex items-center gap-3 border rounded-lg p-2">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => setPageEnabled(key as any, e.target.checked)}
                />
                <span className="capitalize text-sm">{key.replace(/([A-Z])/g, ' $1').replace(/\s+/g, ' ').trim()}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-medium mb-3">Pagamentos</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={mpEnabledLocal}
                onChange={async (e) => {
                  setMpEnabledLocal(e.target.checked);
                  await setPaymentEnabled(e.target.checked);
                }}
              />
              <span className="text-sm">Ativar pagamento com Mercado Pago</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mercado Pago</label>
              <div className="flex items-center justify-between border border-gray-200 rounded px-3 py-2">
                <span className="text-sm">Configuração via Firebase Functions</span>
                {mpConfigured === 'unknown' && <span className="text-gray-500 text-sm">Verificando...</span>}
                {mpConfigured === 'ok' && <span className="text-green-600 text-sm">Configuração detectada</span>}
                {mpConfigured === 'missing' && <span className="text-red-600 text-sm">Token ausente nas variáveis do Firebase</span>}
              </div>
              <p className="text-xs text-gray-500 mt-2">O Access Token é lido no backend (Firebase Functions) por variável de ambiente/config (MP_ACCESS_TOKEN). Ele não é configurado pela interface.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;
