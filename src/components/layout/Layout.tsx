import { ReactNode, useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Camera } from 'lucide-react';
import ImageAdminOverlay from '../admin/ImageAdminOverlay';
import FloatingWhatsApp from './FloatingWhatsApp';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 1000);

    // Add intersection observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('appear');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(element => {
      observer.observe(element);
    });

    return () => {
      fadeElements.forEach(element => {
        observer.unobserve(element);
      });
    };
  }, []);

  // Admin image overlay: enable when site_admin_mode is set
  useEffect(() => {
    const handler = (e: any) => {
      const val = e?.detail ?? (localStorage.getItem('site_admin_mode') ? true : false);
      if (val) {
        ImageAdminOverlay.initImageAdminOverlay();
      } else {
        ImageAdminOverlay.destroyImageAdminOverlay();
      }
    };
    window.addEventListener('siteAdminModeChanged', handler as EventListener);
    // run once based on current value
    if (typeof window !== 'undefined' && localStorage.getItem('site_admin_mode')) {
      ImageAdminOverlay.initImageAdminOverlay();
    }
    return () => {
      window.removeEventListener('siteAdminModeChanged', handler as EventListener);
      ImageAdminOverlay.destroyImageAdminOverlay();
    };
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <Camera size={48} className="text-primary animate-pulse mx-auto mb-4" />
          <div className="text-primary font-playfair text-2xl">Wild Pictures Studio</div>
          <div className="text-primary/80 text-sm uppercase tracking-widest mt-1">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen opacity-100 transition-opacity duration-500 bg-background text-primary">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />

      <FloatingWhatsApp />
    </div>
  );
};

export default Layout;
