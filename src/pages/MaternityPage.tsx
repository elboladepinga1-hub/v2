import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Eye } from 'lucide-react';
import { maternityPackages } from '../data/maternityData';
import { useCart } from '../contexts/CartContext';
import { fetchPackages, DBPackage } from '../utils/packagesService';
import { formatPrice } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';
import PackageEditorModal from '../components/admin/PackageEditorModal';

const galleryImages = [
  {
    id: 1,
    src: 'https://images.pexels.com/photos/3662503/pexels-photo-3662503.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Ensaio gestante ao ar livre'
  },
  {
    id: 2,
    src: 'https://images.pexels.com/photos/3875080/pexels-photo-3875080.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Ensaio gestante em estúdio'
  },
  {
    id: 3,
    src: 'https://images.pexels.com/photos/3662850/pexels-photo-3662850.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Ensaio gestante com flores'
  },
  {
    id: 4,
    src: 'https://images.pexels.com/photos/3662544/pexels-photo-3662544.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Ensaio gestante em casa'
  },
  {
    id: 5,
    src: 'https://images.pexels.com/photos/3662479/pexels-photo-3662479.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Ensaio gestante ao pôr do sol'
  },
  {
    id: 6,
    src: 'https://images.pexels.com/photos/3662534/pexels-photo-3662534.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Ensaio gestante minimalista'
  }
];

const MaternityPage = () => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [dbPackages, setDbPackages] = useState<DBPackage[] | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<DBPackage | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPackages('maternity');
        setDbPackages(data);
      } catch (e) {
        console.warn('MaternityPage: falling back to static packages');
        setDbPackages(null);
      }
    })();
  }, []);

  const handleAddToCart = (pkg: any) => {
    try {
      console.log('📱 MaternityPage: Button clicked', pkg);
      console.log('📱 MaternityPage: addToCart function:', addToCart);

      const cartItem = {
        id: pkg.id,
        type: 'maternity' as const,
        name: pkg.title,
        price: pkg.price,
        duration: pkg.duration,
        image: pkg.image,
        features: pkg.features || []
      };

      console.log('📱 MaternityPage: Cart item to add', cartItem);
      addToCart(cartItem);
      console.log('📱 MaternityPage: addToCart called successfully');

      // Verificar que se agregó
      setTimeout(() => console.log('📱 MaternityPage: Checking cart after add'), 100);

    } catch (error) {
      console.error('📱 MaternityPage: Error adding to cart:', error);
      alert('Error al agregar al carrito: ' + (error as Error).message);
    }
  };

  return (
    <>
      <section className="pt-32 pb-16 bg-accent/30">
        <div className="container-custom">
          <div className="max-w-2xl">
            <h1 className="section-title text-4xl md:text-5xl mb-6">Fotografia de Gestantes</h1>
            <p className="text-gray-700 mb-6">
              Eternize o momento mais especial da maternidade com um ensaio fotográfico profissional.
              Nossas sessões são pensadas para valorizar a beleza única deste período, criando
              memórias emocionantes para você e sua família.
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
              : maternityPackages
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
                  <img
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
                    console.log('📱 MaternityPage: Touch start event', e);
                  }}
                  onTouchEnd={(e) => {
                    console.log('📱 MaternityPage: Touch end event', e);
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
                <img
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

export default MaternityPage;
