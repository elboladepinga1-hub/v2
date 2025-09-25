import Hero from '../components/home/Hero';
import Testimonials from '../components/home/Testimonials';
import CTA from '../components/home/CTA';
import { Camera, Users, Baby } from 'lucide-react';
import Button from '../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { t } = useTranslation();
  const { flags } = useFeatureFlags();
  const { user } = useAuth();

  const isAdmin = !!user && user.email === 'javierevents2@gmail.com';

  return (
    <>
      <Hero />

      <section id="nossos-servicos" className="py-20 bg-accent/10">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="section-title mx-auto after:left-1/2 after:-translate-x-1/2 mb-8">
              {t('home.services.title')}
            </h2>
            <p className="text-gray-700 mb-12 text-lg">
              {t('home.services.subtitle')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {flags.pages.portrait && (
                <div className="bg-white p-8 text-center rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300 flex flex-col">
                  <Camera size={48} className="text-secondary mx-auto mb-6" />
                  <h3 className="text-2xl font-playfair mb-4">{t('home.services.portraits.title')}</h3>
                  <p className="text-gray-600 mb-6 flex-grow">
                    {t('home.services.portraits.description')}
                  </p>
                  <Button to="/portrait" variant="primary" className="w-full">
                    {t('nav.portraits')}
                  </Button>
                </div>
              )}

              {flags.pages.maternity && (
                <div className="bg-white p-8 text-center rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300 flex flex-col">
                  <Baby size={48} className="text-secondary mx-auto mb-6" />
                  <h3 className="text-2xl font-playfair mb-4">{t('home.services.maternity.title')}</h3>
                  <p className="text-gray-600 mb-6 flex-grow">
                    {t('home.services.maternity.description')}
                  </p>
                  <Button to="/maternity" variant="primary" className="w-full">
                    {t('nav.maternity')}
                  </Button>
                </div>
              )}

              {flags.pages.events && (
                <div className="bg-white p-8 text-center rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300 flex flex-col">
                  <Users size={48} className="text-secondary mx-auto mb-6" />
                  <h3 className="text-2xl font-playfair mb-4">{t('home.services.events.title')}</h3>
                  <p className="text-gray-600 mb-6 flex-grow">
                    {t('home.services.events.description')}
                  </p>
                  <Button to="/events" variant="primary" className="w-full">
                    {t('nav.events')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt="Fotógrafa em ação"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="section-title mb-6">{t('home.about.title')}</h2>
              <p className="text-gray-700 mb-6 text-lg">
                {t('home.about.description')}
              </p>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-3xl font-playfair text-primary mb-2">500+</p>
                  <p className="text-gray-600">{t('home.about.stats.clients')}</p>
                </div>
                <div>
                  <p className="text-3xl font-playfair text-primary mb-2">5</p>
                  <p className="text-gray-600">{t('home.about.stats.experience')}</p>
                </div>
                <div>
                  <p className="text-3xl font-playfair text-primary mb-2">1000+</p>
                  <p className="text-gray-600">{t('home.about.stats.sessions')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />
      <CTA />

      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button to="/admin" variant="secondary" className="px-4 py-2">
            {t('admin.title')}
          </Button>
        </div>
      )}
    </>
  );
}

export default HomePage;
