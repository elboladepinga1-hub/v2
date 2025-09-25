import { useTranslation } from 'react-i18next';
import { Instagram, Mail, Phone, MessageCircle } from 'lucide-react';

interface ContactBlockProps {
  iconOnly?: boolean;
  dark?: boolean;
}

const ContactBlock = ({ iconOnly = false, dark = false }: ContactBlockProps) => {
  const { t } = useTranslation();
  const textColor = dark ? 'text-primary' : 'text-white';
  const hoverColor = 'hover:text-secondary';
  
  const contactInfo = [
    {
      icon: <Instagram size={iconOnly ? 20 : 24} />,
      text: '@wild_pictures_studio',
      href: 'https://www.instagram.com/wild_pictures_studio/',
      label: 'Instagram'
    },
    {
      icon: <MessageCircle size={iconOnly ? 20 : 24} />,
      text: t('contact.info.whatsapp.title'),
      href: 'https://wa.me/5541984875565',
      label: 'WhatsApp'
    },
    {
      icon: <Mail size={iconOnly ? 20 : 24} />,
      text: 'wildpicturesstudio@gmail.com',
      href: 'mailto:wildpicturesstudio@gmail.com',
      label: 'Email'
    },
    {
      icon: <Phone size={iconOnly ? 20 : 24} />,
      text: '+55 41 98487-5565',
      href: 'tel:+5541984875565',
      label: t('contact.info.phone.title')
    }
  ];

  return (
    <div className={`flex ${iconOnly ? 'space-x-4' : 'flex-col space-y-4'}`}>
      {contactInfo.map((item, index) => (
        <a 
          key={index}
          href={item.href}
          target={item.href.startsWith('http') ? '_blank' : undefined}
          rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className={`${textColor} ${hoverColor} transition-colors flex ${iconOnly ? '' : 'items-center space-x-3'}`}
          aria-label={item.label}
        >
          <span className="inline-block">{item.icon}</span>
          {!iconOnly && <span className="text-sm">{item.text}</span>}
        </a>
      ))}
    </div>
  );
};

export default ContactBlock;