import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Eye } from 'lucide-react';
import { sessionPackages } from '../data/sessionsData';
import { fetchPackages, DBPackage } from '../utils/packagesService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/format';
import PackageEditorModal from '../components/admin/PackageEditorModal';

const portraitPackagesFallback = sessionPackages;

const galleryImages = [
  {
    id: 1,
    src: 'https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Retrato artístico feminino'
  },
  {
    id: 2,
    src: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Retrato em preto e branco'
  },
  {
    id: 3,
    src: 'https://images.pexels.com/photos/2613256/pexels-photo-2613256.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Retrato ao ar livre'
  },
  {
    id: 4,
    src: 'https://images.pexels.com/photos/2773977/pexels-photo-2773977.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Retrato familiar'
  },
  {
    id: 5,
    src: 'https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Retrato em estúdio'
  },
  {
    id: 6,
    src: 'https://images.pexels.com/photos/2698935/pexels-photo-2698935.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Retrato masculino'
  }
];

const PortraitPage = () => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [dbPackages, setDbPackages] = useState<DBPackage[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<DBPackage | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPackages('portrait');
        setDbPackages(data);
      } catch (e) {
        console.warn('PortraitPage: falling back to static packages');
        setDbPackages(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddToCart = (pkg: any) => {
    try {
      console.log('📱 PortraitPage: Button clicked', pkg);
      console.log('📱 PortraitPage: addToCart function:', addToCart);
      
      const cartItem = {
        id: pkg.id,
        type: 'portrait' as const,
        name: pkg.title,
        price: pkg.price,
        duration: pkg.duration,
        image: pkg.image
      };
      
      console.log('📱 PortraitPage: Cart item to add', cartItem);
      addToCart(cartItem);
      console.log('📱 PortraitPage: addToCart called successfully');
      
      // Verificar que se agregó
      setTimeout(() => console.log('📱 PortraitPage: Checking cart after add'), 100);
      
    } catch (error) {
      console.error('📱 PortraitPage: Error adding to cart:', error);
      alert('Error al agregar al carrito: ' + error.message);
    }
  };

  return (
    <>
      <section className="pt-32 pb-16 bg-accent/30">
        <div className="container-custom">
          <div className="max-w-2xl">
            <h1 className="section-title text-4xl md:text-5xl mb-6">Fotografia de Retratos</h1>
            <p className="text-gray-700 mb-6">
              Capturamos a essência única de cada pessoa em nossos ensaios fotográficos. 
              Seja para retratos individuais, familiares ou profissionais, criamos imagens 
              que transmitem personalidade e emoção.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom">
          <h2 className="section-title mb-12">Nossos Pacotes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(dbPackages && dbPackages.length > 0
              ? dbPackages.map((p) => ({
                  id: p.id,
                  title: p.title,
                  price: formatPrice(Number(p.price)),
                  duration: p.duration,
                  description: p.description,
                  features: p.features || [],
                  image: p.image_url,
                  __db: p as DBPackage
                }))
              : portraitPackagesFallback
            ).filter((p: any) => (p as any)?.__db ? ((p as any).__db.active ?? true) : true).map((pkg: any) => (
              <div key={pkg.id} className="card flex flex-col h-full relative">
                {user && pkg.__db && (
                  <button
                    className="absolute top-2 right-2 p-2 rounded-full bg-white shadow hover:bg-gray-50"
                    title="Editar"
                    onClick={() => { setEditingPkg(pkg.__db as DBPackage); setEditorOpen(true); }}
                  >
                    <Eye size={18} className="text-gray-700" />
                  </button>
                )}
                <div className="h-56 overflow-hidden mb-4">
                  <img loading="lazy"
                    src={pkg.image}
                    alt={pkg.title}
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
                  className="btn-primary mt-auto touch-manipulation mobile-cart-btn"
                  onTouchStart={(e) => {
                    console.log('📱 PortraitPage: Touch start event', e);
                  }}
                  onTouchEnd={(e) => {
                    console.log('📱 PortraitPage: Touch end event', e);
                    e.preventDefault();
                    handleAddToCart(pkg);
                  }}
                  style={{ 
                    minHeight: '48px',
                    minWidth: '48px',
                    WebkitTapHighlightColor: 'rgba(212, 175, 55, 0.3)'
                  }}
                >
                  Adicionar ao carrinho
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PackageEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        pkg={editingPkg}
        onSaved={(updated) => {
          setDbPackages(prev => (prev ? prev.map(p => (p.id === updated.id ? updated : p)) : prev));
        }}
      />

      <section className="py-16 bg-accent/10">
        <div className="container-custom">
          <h2 className="section-title mb-12">Galeria de Fotos</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((image) => (
              <div key={image.id} className="gallery-item">
                <img loading="lazy"
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-80 object-cover"
                />
                <div className="gallery-overlay">
                  <span className="text-white font-playfair text-xl">
                    {image.alt}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
          </div>
        </div>
      </section>
    </>
  );
};

export default PortraitPage;
