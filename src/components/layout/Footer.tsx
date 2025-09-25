import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import ContactBlock from './ContactBlock';
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext';

const Footer = () => {
  const { t } = useTranslation();

  const handleBooking = () => {
    const message = t('nav.bookMessage');
    window.open(`https://wa.me/5541984875565?text=${encodeURIComponent(message)}`, '_blank');
  };

  const { flags } = useFeatureFlags();
  const navLinks = [
    { name: t('nav.home'), path: '/' , key: 'home'},
    { name: t('nav.portraits'), path: '/portrait', key: 'portrait' },
    { name: t('nav.maternity'), path: '/maternity', key: 'maternity' },
    { name: t('nav.events'), path: '/events', key: 'events' },
    { name: t('nav.book'), action: handleBooking, key: 'booking' },
    { name: t('nav.contact'), path: '/contact', key: 'contact' },
  ].filter(l => !l.key || flags.pages[l.key as keyof typeof flags.pages]);

  return (
    <footer className="bg-primary text-white py-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col space-y-4">
            <Logo />
            <p className="text-white/70 text-sm mt-4 max-w-xs">
              {t('footer.description')}
            </p>
          </div>
          
          <div className="flex flex-col space-y-4">
            <h3 className="text-xl font-playfair mb-2">{t('footer.links')}</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  {link.path ? (
                    <Link 
                      to={link.path} 
                      className="text-white/70 hover:text-secondary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <button
                      onClick={link.action}
                      className="text-white/70 hover:text-secondary transition-colors text-sm"
                    >
                      {link.name}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex flex-col space-y-4">
            <h3 className="text-xl font-playfair mb-2">{t('footer.contact')}</h3>
            <ContactBlock iconOnly={false} />
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-10 pt-8 text-center">
          <p className="text-white/70 text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
