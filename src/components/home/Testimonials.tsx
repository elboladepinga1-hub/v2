import { useRef, useEffect, useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchReviews, updateReview, Review } from '../../utils/reviewsService';

const defaultTestimonials = [
  {
    id: 1,
    name: 'Ana & Pedro',
    event: 'Casamento',
    text: 'Não conseguimos expressar o quanto estamos satisfeitos com as fotos do nosso casamento! Cada momento foi capturado com um olhar único, sensível e artístico. As emoções ficaram registradas de forma natural e autêntica.',
    rating: 5,
    image: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=1600'
  },
  {
    id: 2,
    name: 'Carolina',
    event: 'Ensaio Gestante',
    text: 'Meu ensaio de gestante foi uma experiência incrível! As fotos capturaram exatamente o que eu queria: a beleza, a expectativa e o amor desse momento tão especial da minha vida. Cada foto é uma obra de arte!',
    rating: 5,
    image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1600'
  },
  {
    id: 3,
    name: 'Família Santos',
    event: 'Ensaio Família',
    text: 'Nossa sessão familiar foi perfeita! As crianças se sentiram à vontade e isso se refletiu nas fotos. O resultado final superou nossas expectativas - fotos autênticas e cheias de vida.',
    rating: 5,
    image: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1600'
  }
];


const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);
  const autoplayRef = useRef<number | null>(null);
  const { t } = useTranslation();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(Boolean(typeof window !== 'undefined' && localStorage.getItem('site_admin_mode')));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          entry.target.classList.add('appear');
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

  useEffect(() => {
    // listen for admin mode changes
    const handler = (e: any) => setIsAdminMode(Boolean(e?.detail ?? (localStorage.getItem('site_admin_mode') ? true : false)));
    window.addEventListener('siteAdminModeChanged', handler as EventListener);
    window.addEventListener('storage', handler as EventListener);
    return () => { window.removeEventListener('siteAdminModeChanged', handler as EventListener); window.removeEventListener('storage', handler as EventListener); };
  }, []);

  useEffect(() => {
    // load reviews from firestore, fallback to defaults
    let mounted = true;
    (async () => {
      setLoadingReviews(true);
      try {
        const remote = await fetchReviews();
        if (mounted && remote && remote.length) setReviews(remote as Review[]);
        else if (mounted) setReviews(defaultTestimonials as any as Review[]);
      } catch (e) {
        if (mounted) setReviews(defaultTestimonials as any as Review[]);
      } finally {
        if (mounted) setLoadingReviews(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // autoplay
    stopAutoplay();
    autoplayRef.current = window.setInterval(() => {
      setActiveIndex(prev => (prev + 1) % (reviews.length || 1));
    }, 4000);
    return () => stopAutoplay();
  }, [reviews.length]);

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % (reviews.length || 1));
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + (reviews.length || 1)) % (reviews.length || 1));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX + 16, y: e.clientY + 16 });
  };

  const openReviewsLink = () => {
    window.open('https://share.google/x6WaKMeOHWQ18kr75', '_blank');
  };

  return (
    <section ref={sectionRef} className="py-20 bg-primary text-white fade-in">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="section-title mx-auto after:left-1/2 after:-translate-x-1/2 text-white">
            {t('home.testimonials.title')}
          </h2>
        </div>

        <div className="relative max-w-4xl mx-auto px-4">
          <div className="overflow-hidden" onMouseEnter={() => { setIsHovering(true); stopAutoplay(); }} onMouseLeave={() => { setIsHovering(false); autoplayRef.current = window.setInterval(() => setActiveIndex(prev => (prev + 1) % (reviews.length || 1)), 4000); }} onMouseMove={handleMouseMove}>
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {reviews.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-white/10 p-8 rounded-lg text-center relative">
                    {isAdminMode && (
                      <button onClick={() => setEditingReview(testimonial)} className="absolute top-3 right-3 p-2 bg-white/10 rounded text-white hover:bg-white/20">
                        <Edit size={16} />
                      </button>
                    )}
                    <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
                      <img loading="lazy"
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-playfair mb-1">{testimonial.name}</h3>
                    <p className="text-secondary text-sm mb-4">{testimonial.event}</p>

                    <div className="flex justify-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < (testimonial.rating || 0) ? "text-secondary fill-secondary" : "text-gray-400"}
                        />
                      ))}
                    </div>

                    <blockquote className="text-white/80 italic">
                      "{testimonial.text}"
                    </blockquote>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white"
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white"
            onClick={nextTestimonial}
            aria-label="Next testimonial"
          >
            <ChevronRight size={24} />
          </button>

          {/* removed pagination indicators as requested */}

          {/* tooltip that follows mouse on hover */}
          {isHovering && (
            <div onClick={openReviewsLink} role="link" tabIndex={0} style={{ position: 'fixed', left: tooltipPos.x, top: tooltipPos.y, zIndex: 60 }} className="bg-white text-primary px-3 py-1 rounded shadow cursor-pointer text-sm">
              Ver nossos reviews
            </div>
          )}
        </div>
      </div>

      {/* Edit modal for admin */}
      {editingReview && (
        <div className="fixed inset-0 z-70 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-4 text-primary">
            <h3 className="text-lg font-semibold mb-2 text-primary">Editar Review</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-primary">Nome</label>
                <input value={editingReview.name} onChange={e => setEditingReview(prev => prev ? { ...prev, name: e.target.value } : prev)} className="w-full px-3 py-2 border rounded text-primary" />
              </div>
              <div>
                <label className="text-sm text-primary">Evento</label>
                <input value={editingReview.event || ''} onChange={e => setEditingReview(prev => prev ? { ...prev, event: e.target.value } : prev)} className="w-full px-3 py-2 border rounded text-primary" />
              </div>
              <div>
                <label className="text-sm text-primary">Texto</label>
                <textarea value={editingReview.text} onChange={e => setEditingReview(prev => prev ? { ...prev, text: e.target.value } : prev)} className="w-full px-3 py-2 border rounded text-primary" rows={4} />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditingReview(null)} className="px-4 py-2 border rounded">Cancelar</button>
                <button onClick={async () => {
                  if (!editingReview?.id) return;
                  try {
                    await updateReview(editingReview.id, editingReview as any);
                    setReviews(prev => prev.map(r => r.id === editingReview.id ? editingReview : r));
                    setEditingReview(null);
                    alert('Review actualizada');
                  } catch (e) {
                    alert('Error al actualizar');
                  }
                }} className="px-4 py-2 bg-primary text-white rounded">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default Testimonials;
