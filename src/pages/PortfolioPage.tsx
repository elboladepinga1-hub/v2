import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Photo {
  id: string;
  src: string;
  alt: string;
  category: string;
  width: number;
  height: number;
}

const photos: Photo[] = [
  // Retratos
  {
    id: '1',
    src: 'https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg',
    alt: 'Retrato artístico feminino',
    category: 'retratos',
    width: 1600,
    height: 2400
  },
  {
    id: '2',
    src: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    alt: 'Retrato em preto e branco',
    category: 'retratos',
    width: 1600,
    height: 2000
  },
  {
    id: '3',
    src: 'https://images.pexels.com/photos/2698935/pexels-photo-2698935.jpeg',
    alt: 'Retrato masculino',
    category: 'retratos',
    width: 1600,
    height: 2400
  },
  
  // Gestantes
  {
    id: '4',
    src: 'https://images.pexels.com/photos/3662503/pexels-photo-3662503.jpeg',
    alt: 'Ensaio gestante ao ar livre',
    category: 'gestantes',
    width: 1600,
    height: 2400
  },
  {
    id: '5',
    src: 'https://images.pexels.com/photos/3875080/pexels-photo-3875080.jpeg',
    alt: 'Ensaio gestante em estúdio',
    category: 'gestantes',
    width: 1600,
    height: 2000
  },
  {
    id: '6',
    src: 'https://images.pexels.com/photos/3662850/pexels-photo-3662850.jpeg',
    alt: 'Ensaio gestante com flores',
    category: 'gestantes',
    width: 1600,
    height: 2400
  },
  
  // Casamentos
  {
    id: '7',
    src: 'https://images.pexels.com/photos/1855211/pexels-photo-1855211.jpeg',
    alt: 'Cerimônia de casamento',
    category: 'casamentos',
    width: 1600,
    height: 1067
  },
  {
    id: '8',
    src: 'https://images.pexels.com/photos/2959192/pexels-photo-2959192.jpeg',
    alt: 'Noiva preparação',
    category: 'casamentos',
    width: 1600,
    height: 2400
  },
  {
    id: '9',
    src: 'https://images.pexels.com/photos/3620173/pexels-photo-3620173.jpeg',
    alt: 'Casamento civil',
    category: 'casamentos',
    width: 1600,
    height: 2133
  },
  
  // Eventos
  {
    id: '10',
    src: 'https://images.pexels.com/photos/1405766/pexels-photo-1405766.jpeg',
    alt: 'Comemoração de aniversário',
    category: 'eventos',
    width: 1600,
    height: 1067
  },
  {
    id: '11',
    src: 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg',
    alt: 'Detalhes de evento',
    category: 'eventos',
    width: 1600,
    height: 2400
  },
  {
    id: '12',
    src: 'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg',
    alt: 'Festa de casamento',
    category: 'eventos',
    width: 1600,
    height: 2400
  }
];

const categories = [
  { id: 'all', name: 'Todos' },
  { id: 'retratos', name: 'Retratos' },
  { id: 'gestantes', name: 'Gestantes' },
  { id: 'casamentos', name: 'Casamentos' },
  { id: 'eventos', name: 'Eventos' }
];

const PortfolioPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading of images
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredPhotos = selectedCategory === 'all'
    ? photos
    : photos.filter(photo => photo.category === selectedCategory);

  const calculateSpans = (photo: Photo) => {
    const aspectRatio = photo.width / photo.height;
    return aspectRatio > 1.5 ? 2 : 1;
  };

  return (
    <>
      <section className="pt-32 pb-16 bg-primary text-white">
        <div className="container-custom">
          <div className="max-w-2xl">
            <h1 className="section-title text-4xl md:text-5xl mb-6 text-white">
              Portfólio
            </h1>
            <p className="text-white/80 mb-6">
              Uma seleção cuidadosa dos nossos melhores trabalhos, organizados por categoria 
              para você explorar e se inspirar.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPhotos.map(photo => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`relative cursor-pointer overflow-hidden rounded-lg ${
                  calculateSpans(photo) > 1 ? 'md:col-span-2' : ''
                }`}
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="aspect-[4/3]">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white text-lg font-playfair">{photo.alt}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-7xl mx-auto px-4 relative">
            <button
              className="absolute top-4 right-4 text-white text-4xl"
              onClick={() => setSelectedPhoto(null)}
            >
              ×
            </button>
            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.alt}
              className="max-h-[90vh] max-w-full object-contain"
            />
            <p className="text-white text-center mt-4 font-playfair text-xl">
              {selectedPhoto.alt}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default PortfolioPage;