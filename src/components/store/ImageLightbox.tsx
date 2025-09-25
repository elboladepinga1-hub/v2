import React from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  src: string | null;
  alt?: string;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ isOpen, src, alt, onClose }) => {
  if (!isOpen || !src) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 bg-white text-black rounded-full p-2">
        <X size={18} />
      </button>
      <img src={src} alt={alt || 'image'} className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl" onClick={(e)=> e.stopPropagation()} />
    </div>
  );
};

export default ImageLightbox;
