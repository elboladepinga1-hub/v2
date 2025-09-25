import { useRef, useEffect } from 'react';
import { eventPackages } from '../../data/eventsData';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../contexts/CartContext';

const FeaturedEvents = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();
  const { addToCart } = useCart();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          const elements = sectionRef.current?.querySelectorAll('.slide-up');
          elements?.forEach((el, index) => {
            setTimeout(() => {
              el.classList.add(`slide-up-visible`);
            }, 200 * index);
          });
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleAddToCart = (pkg: any) => {
    try {
      console.log('Adding to cart:', pkg); // Debug log
    addToCart({
      id: pkg.id,
      type: 'events',
      name: pkg.title,
      price: pkg.price,
      duration: pkg.duration,
      image: pkg.image
    });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <section ref={sectionRef} className="py-20">
      <div className="container-custom">
        <div className="text-center mb-16 slide-up">
          <h2 className="section-title mx-auto after:left-1/2 after:-translate-x-1/2">
            {t('events.title')}
          </h2>
          <p className="mt-4 text-gray-700 max-w-2xl mx-auto">
            {t('events.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {eventPackages.map((pkg, index) => (
            <div 
              key={pkg.id} 
              className={`bg-accent/20 shadow-sm p-6 flex flex-col h-full slide-up delay-${index + 1}`}
            >
              <div className="h-56 overflow-hidden mb-4">
                <img 
                  src={pkg.image} 
                  alt={t('events.packageImageAlt', { package: pkg.title })} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-playfair font-medium mb-2">{pkg.title}</h3>
              <p className="text-gray-600 mb-4">{pkg.description}</p>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl font-playfair text-primary">{pkg.price}</span>
                <span className="text-gray-500 text-sm">/{pkg.duration}</span>
              </div>
              <ul className="mb-6 flex-grow">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start mb-2">
                    <ChevronRight size={16} className="text-secondary mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleAddToCart(pkg)}
                className="btn-primary mt-auto touch-manipulation"
                onTouchStart={() => {}} // Ensure touch events work
              >
                Adicionar ao carrinho
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center slide-up">
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;