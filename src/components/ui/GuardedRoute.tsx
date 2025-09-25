import React from 'react';
import { useFeatureFlags, PageKey } from '../../contexts/FeatureFlagsContext';

interface GuardedRouteProps {
  page: PageKey;
  children: React.ReactElement;
}

const GuardedRoute: React.FC<GuardedRouteProps> = ({ page, children }) => {
  const { flags, loading } = useFeatureFlags();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  const enabled = flags.pages[page];
  if (!enabled) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 pt-32">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="card">
            <h1 className="text-2xl font-playfair mb-4">Sección no disponible</h1>
            <p className="text-gray-600 mb-6">
              Esta página aún no está lista para ser publicada. Vuelve pronto.
            </p>
            <a href="/" className="btn-primary">Ir al inicio</a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default GuardedRoute;
