import { useState } from 'react';
import Button from '../components/ui/Button';
import { Instagram, Mail, Phone, MessageCircle, MapPin, Clock } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format the WhatsApp message
    const message = `*Nova mensagem de contato*\n\nNome: ${formData.name}\nTelefone: ${formData.phone}\nAssunto: ${formData.subject}\n\nMensagem:\n${formData.message}`;
    
    // Create WhatsApp URL with formatted message
    const whatsappUrl = `https://wa.me/5541984875565?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
    
    // Reset form
    setFormData({
      name: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <section className="pt-32 pb-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h1 className="section-title mb-8">Entre em Contato</h1>
            <p className="text-gray-700 mb-10">
              Estamos ansiosos para falar com você! Preencha o formulário 
              abaixo para enviar uma mensagem direta para nosso WhatsApp.
            </p>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-start">
                <MapPin size={24} className="text-secondary mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-lg mb-1">Estúdio</h3>
                  <p className="text-gray-600">
                    Curitiba, Paraná - Brasil <br />
                    (Atendemos em todo o Brasil)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock size={24} className="text-secondary mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-lg mb-1">Horário de Atendimento</h3>
                  <p className="text-gray-600">
                    Segunda a Sexta: 9h às 18h <br />
                    Sábado: 9h às 13h
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone size={24} className="text-secondary mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-lg mb-1">Telefone</h3>
                  <p className="text-gray-600">
                    <a href="tel:+5541984875565" className="link-luxe">
                      +55 41 98487-5565
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MessageCircle size={24} className="text-secondary mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-lg mb-1">WhatsApp</h3>
                  <p className="text-gray-600">
                    <a 
                      href="https://wa.me/5541984875565" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="link-luxe"
                    >
                      Enviar mensagem direta
                    </a>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Redes Sociais</h3>
              <div className="flex space-x-4">
                <a 
                  href="https://www.instagram.com/wild_pictures_studio/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-primary text-white p-3 rounded-full hover:bg-secondary transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href="https://wa.me/5541984875565" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-primary text-white p-3 rounded-full hover:bg-secondary transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={20} />
                </a>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-2xl font-playfair mb-6">Enviar Mensagem via WhatsApp</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-base"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="input-base"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Assunto
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="input-base"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                  className="input-base"
                />
              </div>
              
              <div>
                <Button type="submit" variant="primary" className="w-full">
                  Enviar via WhatsApp
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
