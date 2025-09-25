import { useState, useEffect } from 'react';
import { eventPackages, eventGalleryImages } from '../data/eventsData';
import { fetchPackages, DBPackage } from '../utils/packagesService';
import { ChevronRight, Eye } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/format';
import PackageEditorModal from '../components/admin/PackageEditorModal';

const EventsPage = () => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [dbEvents, setDbEvents] = useState<DBPackage[] | null>(null); // ← solo una vez
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<DBPackage | null>(null);

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'wedding', name: 'Casamentos' },
    { id: 'civil', name: 'Civil' },
    { id: 'party', name: 'Festas' },
    { id: 'anniversary', name: 'Aniversários' },
  ];

  const filteredImages = filter === 'all' 
    ? eventGalleryImages 
    : eventGalleryImages.filter(img => img.category === filter);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPackages('events');
        setDbEvents(data);
      } catch (e) {
        console.warn('EventsPage: falling back to static packages');
        setDbEvents(null);
      }
    })();
  }, []);

  // Separar pacotes por tipo sem duplicar
  const preWeddingPackages = (dbEvents && dbEvents.length > 0
    ? dbEvents.filter(p => (p as any).active !== false && ((p.category || '').startsWith('prewedding') || p.id.startsWith('prewedding'))).map(p => ({
        id: p.id,
        title: p.title,
        price: formatPrice(Number(p.price)),
        duration: p.duration,
        description: p.description,
        features: p.features || [],
        image: p.image_url
      }))
    : eventPackages.filter(pkg => pkg.id.startsWith('prewedding'))
  );

  const weddingPackages = (dbEvents && dbEvents.length > 0
    ? dbEvents.filter(p => (p as any).active !== false && ((p.category || '').startsWith('wedding') || p.id.startsWith('wedding'))).map(p => ({
        id: p.id,
        title: p.title,
        price: formatPrice(Number(p.price)),
        duration: p.duration,
        description: p.description,
        features: p.features || [],
        image: p.image_url
      }))
    : eventPackages.filter(pkg => pkg.id.startsWith('wedding'))
  );

  const handleAddToCart = (pkg: any) => {
    try {
      console.log('📱 EventsPage: Button clicked', pkg);
      const cartItem = {
        id: pkg.id,
        type: 'events' as const,
        name: pkg.title,
        price: pkg.price,
        duration: pkg.duration,
        image: pkg.image
      };
      addToCart(cartItem);
      setTimeout(() => console.log('📱 EventsPage: Checking cart after add'), 100);
    } catch (error) {
      console.error('📱 EventsPage: Error adding to cart:', error);
      alert('Error al agregar al carrito: ' + error.message);
    }
  };

  return (
    <>
      <section className="pt-32 pb-16 bg-primary text-white">
        <div className="container-custom">
          <div className="max-w-2xl">
            <h1 className="section-title text-4xl md:text-5xl mb-6 text-white">Casamentos e Eventos</h1>
            <p className="text-white/80 mb-6">
              Eternizamos cada momento especial do seu casamento ou evento. Nossa equipe 
              captura com sensibilidade e excelência técnica todos os detalhes, emoções e 
              momentos marcantes, transformando seu dia especial em memórias inesquecíveis.
            </p>
          </div>
        </div>
      </section>

      {/* Seção Pré-Wedding */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="section-title mb-12">Ensaios Pré-Wedding</h2>
          <p className="text-gray-700 mb-8 text-center max-w-3xl mx-auto">
            Capture a magia do seu amor antes do grande dia com nossos ensaios pré-wedding. 
            Momentos únicos e românticos que eternizam a expectativa e a alegria do casal.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {preWeddingPackages.map((pkg) => (
              <div key={pkg.id} className="bg-accent/20 shadow-sm p-6 flex flex-col h-full relative">
                {user && dbEvents && (
                  <button
                    className="absolute top-2 right-2 p-2 rounded-full bg-white shadow hover:bg-gray-50"
                    title="Editar"
                    onClick={() => {
                      const original = dbEvents.find(p => p.id === pkg.id);
                      if (original) { setEditingPkg(original); setEditorOpen(true); }
                    }}
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
                    console.log('📱 EventsPage: Touch start event', e);
                  }}
                  onTouchEnd={(e) => {
                    console.log('📱 EventsPage: Touch end event', e);
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

      {/* Seção Casamentos */}
      <section className="py-16 bg-accent/10">
        <div className="container-custom">
          <h2 className="section-title mb-12">Pacotes para Casamentos</h2>
          <p className="text-gray-700 mb-8 text-center max-w-3xl mx-auto">
            Cobertura completa para o seu dia especial. Desde a preparação até a festa, 
            capturamos cada emoção e momento único do seu casamento.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {weddingPackages.map((pkg) => (
              <div key={pkg.id} className="card flex flex-col h-full relative">
                {user && dbEvents && (
                  <button
                    className="absolute top-2 right-2 p-2 rounded-full bg-white shadow hover:bg-gray-50"
                    title="Editar"
                    onClick={() => {
                      const original = dbEvents.find(p => p.id === pkg.id);
                      if (original) { setEditingPkg(original); setEditorOpen(true); }
                    }}
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
                    console.log('📱 EventsPage: Touch start event', e);
                  }}
                  onTouchEnd={(e) => {
                    console.log('📱 EventsPage: Touch end event', e);
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
          setDbEvents(prev => (prev ? prev.map(p => (p.id === updated.id ? updated : p)) : prev));
        }}
      />

      {/* Galería de Eventos */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="section-title mb-8">Galeria de Eventos</h2>
          
          <div className="flex flex-wrap justify-center space-x-2 mb-12">
            {categories.map((category) => (
              <button 
                key={category.id}
                className={`px-4 py-2 mb-2 ${
                  filter === category.id 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-primary hover:bg-gray-100'
                }`}
                onClick={() => setFilter(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredImages.map((image) => (
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
        </div>
      </section>
    </>
  );
};

export default EventsPage;
