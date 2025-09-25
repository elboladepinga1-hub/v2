import { useEffect, useRef, useState } from 'react';

const PHONE = '5541984875565';

const FloatingWhatsApp = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);

  const [isDesktop, setIsDesktop] = useState<boolean>(typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.matchMedia('(min-width: 768px)').matches);
    window.addEventListener('resize', onResize);

    // Auto-open only once per user (per browser)
    const shown = localStorage.getItem('floatingWhatsAppShown');
    if (!shown) {
      // On desktop show expanded panel on first load, on mobile keep only widget
      if (window.matchMedia('(min-width: 768px)').matches) {
        setOpen(true);
      } else {
        setOpen(false);
      }
      localStorage.setItem('floatingWhatsAppShown', '1');
    }

    const handleClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleScroll = () => {
      setOpen(false);
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const sendWhatsApp = () => {
    const text = message && message.trim() ? message.trim() : 'Olá, quero agendar uma sessão';
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setMessage('');
    setOpen(false);
  };

  const panelWidth = 360; // approx w-96
  const panelRightOpen = 48; // more space from right edge when open
  const gap = 24; // gap between panel and widget when open

  const panelRight = open ? panelRightOpen : (isDesktop ? -panelWidth - 16 : 16);
  // When open on desktop, place widget to the left of the panel (further left = larger right value)
  const buttonRight = open && isDesktop ? panelRightOpen + panelWidth + gap : (isDesktop ? 8 : 16);

  return (
    <>
      {/* Panel */}
      <div ref={ref} className={`fixed bottom-6 z-50 transition-all duration-300`} style={{ right: panelRight }}>
        <div className={`transform transition-all duration-300 ${open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'} mb-3`}>
          <div className="bg-gray-50 text-gray-800 rounded-xl shadow-lg p-4 border border-gray-200" style={{ width: isDesktop ? undefined : 'calc(100% - 32px)' }}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {/* message icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800">Deseja entrar em contato?</div>
                <div className="text-sm text-gray-600">Envie-nos uma mensagem pelo WhatsApp e ajudaremos a agendar sua sessão.</div>

                <div className="mt-3 flex gap-2">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escreva sua mensagem..."
                    className="flex-1 p-3 rounded-md bg-white border border-gray-200 text-gray-800 focus:outline-none"
                  />
                  <button onClick={sendWhatsApp} className="bg-gray-700 text-white px-4 rounded-md">Enviar</button>
                </div>

                <div className="mt-2 text-xs text-gray-500">Ao enviar, o WhatsApp será aberto com sua mensagem.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed button (always visible at edge) */}
      <div className="fixed bottom-6 z-50" style={{ right: buttonRight }}>
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
          className="w-12 h-12 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow-lg"
          aria-label="Abrir chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-gray-700">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default FloatingWhatsApp;
