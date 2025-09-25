import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Calendar, PlugZap } from 'lucide-react';
import { googleCalendar } from '../../utils/googleCalendar';

declare global {
  interface Window {
    google?: any;
  }
}

const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

const GoogleCalendarConnect: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [connected, setConnected] = useState(googleCalendar.isAuthenticated());
  const loadingRef = useRef(false);

  // Load GIS script
  useEffect(() => {
    if (window.google?.accounts?.oauth2) { setReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    script.onerror = () => setReady(false);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const connect = useCallback(() => {
    if (!ready || loadingRef.current) return;
    const clientId = import.meta.env.VITE_GCAL_CLIENT_ID as string;
    if (!clientId) {
      alert('VITE_GCAL_CLIENT_ID no configurado. Agrega este valor en variables de entorno.');
      return;
    }
    loadingRef.current = true;
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: (tokenResponse: any) => {
          loadingRef.current = false;
          if (tokenResponse?.access_token) {
            googleCalendar.setAccessToken(tokenResponse.access_token);
            setConnected(true);
          } else {
            alert('No se pudo obtener el token de acceso.');
          }
        },
      });
      tokenClient.requestAccessToken();
    } catch (e) {
      loadingRef.current = false;
      alert('Error iniciando OAuth de Google: ' + (e as Error).message);
    }
  }, [ready]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={20} className="text-primary" />
        <h4 className="font-medium">Conectar Google Calendar</h4>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Autoriza el acceso a tu Google Calendar para crear eventos automáticamente tras una reserva.
      </p>
      <button
        onClick={connect}
        disabled={!ready || connected}
        className={`px-4 py-2 rounded-lg text-white ${connected ? 'bg-green-600' : 'bg-primary hover:bg-opacity-90'} disabled:opacity-50`}
      >
        <span className="inline-flex items-center gap-2">
          <PlugZap size={16} />
          {connected ? 'Conectado' : 'Conectar'}
        </span>
      </button>
      {!import.meta.env.VITE_GCAL_CLIENT_ID && (
        <p className="text-xs text-red-600 mt-2">Define VITE_GCAL_CLIENT_ID en variables de entorno.</p>
      )}
    </div>
  );
};

export default GoogleCalendarConnect;
