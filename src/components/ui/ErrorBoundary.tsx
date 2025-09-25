import React from 'react';

interface State { hasError: boolean; error: Error | null }

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('ErrorBoundary caught an error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-2xl text-center">
            <h2 className="text-2xl font-bold mb-4">Ha ocurrido un error</h2>
            <p className="text-gray-600 mb-4">Por favor recarga la página. Si el error persiste, revisa la consola para más detalles.</p>
            <pre className="text-sm bg-gray-100 p-3 rounded text-left overflow-auto max-h-64">{String(this.state.error)}</pre>
            <div className="mt-4">
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded">Recargar</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}

export default ErrorBoundary;
