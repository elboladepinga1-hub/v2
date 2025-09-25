import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext';
import { useTranslation } from 'react-i18next';

const CTA = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { flags } = useFeatureFlags();

  const handleBooking = () => {
    if (!flags.pages.booking) return;
    navigate('/booking');
  };

  return (
    <section className="py-20 bg-accent/20">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="section-title mx-auto after:left-1/2 after:-translate-x-1/2 mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-gray-700 mb-8 text-lg">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={handleBooking} className="btn-primary">
              {t('home.cta.buttons.book')}
            </button>
            <Button to="/contact" variant="secondary">
              {t('home.cta.buttons.contact')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
