import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Eye, EyeOff } from 'lucide-react';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../../utils/firebaseClient';
import { useTranslation } from 'react-i18next';
import Logo from '../ui/Logo';
import CartIcon from '../cart/CartIcon';
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../auth/LoginModal';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(Boolean(typeof window !== 'undefined' && sessionStorage.getItem('site_admin_mode')));
  const { user, isAdmin: userIsAdmin, loading: authLoading, refreshClaims } = useAuth();
  const [showAdminEmailLogin, setShowAdminEmailLogin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const handler = (e: Event | any) => {
      const val = e?.detail ?? (sessionStorage.getItem('site_admin_mode') ? true : false);
      setIsAdmin(Boolean(val));
    };
    window.addEventListener('siteAdminModeChanged', handler as EventListener);
    return () => {
      window.removeEventListener('siteAdminModeChanged', handler as EventListener);
    };
  }, []);

  const notifyAdminChange = async (val: boolean) => {
    try {
      if (val) sessionStorage.setItem('site_admin_mode', '1'); else sessionStorage.removeItem('site_admin_mode');
    } catch (_) {}
    if (!val) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.error('Error signing out', e);
      }
    }
    window.dispatchEvent(new CustomEvent('siteAdminModeChanged', { detail: val }));
    setIsAdmin(val);
  };

  const toggleAdminFromHeader = async () => {
    if (!isAdmin) {
      // If user is authenticated and has admin claim, enable admin mode
      if (user) {
        if (userIsAdmin) {
          try {
            notifyAdminChange(true);
            navigate('/admin');
          } catch (e) {
            console.error('Failed to enable admin mode', e);
          }
        } else {
          // Try refreshing claims in case they were just set
          await refreshClaims();
          if (authLoading) return;
          const token = await auth.currentUser?.getIdTokenResult();
          if (token?.claims?.admin) {
            notifyAdminChange(true);
            navigate('/admin');
          } else {
            // Prompt for email/password login to check admin claims
            setShowAdminEmailLogin(true);
          }
        }
      } else {
        // Not authenticated: show email/password login modal
        setShowAdminEmailLogin(true);
      }
    } else {
      // If already in admin mode, just navigate to admin panel
      navigate('/admin');
    }
  };

  const checkAdminAfterLogin = async () => {
    try {
      await refreshClaims();
      const token = await auth.currentUser?.getIdTokenResult(true);
      const claims = token?.claims || {};
      if (claims.admin) {
        notifyAdminChange(true);
        navigate('/admin');
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.error('Error checking admin claims:', e);
      return false;
    }
  };

  const handleAdminEmailLoginClose = async () => {
    setShowAdminEmailLogin(false);
    // small delay for auth state propagation
    setTimeout(() => {
      checkAdminAfterLogin();
    }, 600);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  const handleBooking = () => {
    // Navigate to booking page (same behavior as Hero)
    navigate('/booking');
  };

  const { flags } = useFeatureFlags();
  const navLinks = useMemo(() => {
    const scrollToServices = () => {
      const el = document.getElementById('nossos-servicos');
      if (!el) return;
      const header = document.querySelector('header');
      const headerHeight = header ? (header as HTMLElement).offsetHeight : 0;
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const extraDown = 80; // push the section a bit lower in the viewport
      const target = rect.top + scrollTop - headerHeight + extraDown;
      window.scrollTo({ top: target, behavior: 'smooth' });
    };

    const links: { name: string; path?: string; action?: () => void; key?: string }[] = [
      { name: t('nav.home'), path: '/', key: 'home' },
      { name: 'Serviços', action: scrollToServices },
      { name: t('nav.portfolio'), path: '/portfolio', key: 'portfolio' },
      { name: t('nav.store'), path: '/store', key: 'store' },
      { name: t('nav.book'), action: handleBooking, key: 'booking' },
      { name: t('nav.contact'), path: '/contact', key: 'contact' },
    ];
    // do not include a separate Admin link here; admin is toggled via the eye icon
    return links.filter(l => !l.key || flags.pages[l.key as keyof typeof flags.pages]);
  }, [t, flags]);

  const isHomePage = location.pathname === '/';

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled || !isHomePage
          ? 'bg-primary py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container-custom flex justify-between items-center">

        {/* Desktop: split navigation into left / center logo / right */}
        <div className="container-custom px-0 flex justify-between items-center md:grid md:grid-cols-3">
          <div className="hidden md:flex items-center">
            <ul className="flex items-center space-x-8">
              <li>
                <button onClick={toggleAdminFromHeader} aria-label={'Ir ao painel de administração'} className="p-2 text-white hover:text-secondary transition-colors">
                  <Eye size={18} />
                </button>
              </li>
              {navLinks.slice(0, Math.ceil(navLinks.length / 2)).map((link) => (
                <li key={link.name}>
                  {link.path ? (
                    <Link
                      to={link.path}
                      className={`font-lato text-sm tracking-wide uppercase ${isScrolled || !isHomePage ? 'text-white' : 'text-primary'} hover:text-secondary transition-colors`}
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <button
                      onClick={link.action}
                      className={`font-lato text-sm tracking-wide uppercase ${isScrolled || !isHomePage ? 'text-white' : 'text-primary'} hover:text-secondary transition-colors`}
                    >
                      {link.name}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center z-50">
            <Link to="/" className="z-50">
              <Logo dark={!(isScrolled || !isHomePage)} />
            </Link>
          </div>

          <div className="hidden md:flex items-center justify-end space-x-6">
            <ul className="flex space-x-8">
              {navLinks.slice(Math.ceil(navLinks.length / 2)).map((link) => (
                <li key={link.name}>
                  {link.path ? (
                    <Link
                      to={link.path}
                      className={`font-lato text-sm tracking-wide uppercase ${isScrolled || !isHomePage ? 'text-white' : 'text-primary'} hover:text-secondary transition-colors`}
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <button
                      onClick={link.action}
                      className={`font-lato text-sm tracking-wide uppercase ${isScrolled || !isHomePage ? 'text-white' : 'text-primary'} hover:text-secondary transition-colors`}
                    >
                      {link.name}
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <div className="flex items-center space-x-6 text-white">
              <CartIcon />
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <CartIcon />
            <button
              className="z-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X size={24} className={`${isScrolled || !isHomePage ? 'text-white' : 'text-primary'}`} />
              ) : (
                <Menu size={24} className={`${isScrolled || !isHomePage ? 'text-white' : 'text-primary'}`} />
              )}
            </button>
          </div>
        </div>

        <div className={`fixed top-0 bottom-0 right-4 bg-white z-40 md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`} style={{ width: 'calc(100% - 64px)', borderRadius: 12 }}>
          <div className="flex flex-col h-full pt-24 px-6">
            <ul className="flex flex-col space-y-6 text-center">
              {navLinks.map((link) => (
                <li key={link.name}>
                  {link.key === 'admin' ? (
                    <button
                      onClick={toggleAdminFromHeader}
                      className="text-primary font-lato text-lg uppercase tracking-wide hover:text-secondary transition-colors"
                    >
                      {link.name}
                    </button>
                  ) : link.path ? (
                    <Link
                      to={link.path}
                      className="text-primary font-lato text-lg uppercase tracking-wide hover:text-secondary transition-colors"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <button
                      onClick={link.action}
                      className="text-primary font-lato text-lg uppercase tracking-wide hover:text-secondary transition-colors"
                    >
                      {link.name}
                    </button>
                  )}
                </li>
              ))}

            </ul>
          </div>
        </div>
      </div>

      {showAdminEmailLogin && (
        <LoginModal isOpen={true} onClose={handleAdminEmailLoginClose} initialMode={'login'} adminOnly={true} onSuccess={checkAdminAfterLogin} />
      )}

    </header>
  );
};

export default Header;
