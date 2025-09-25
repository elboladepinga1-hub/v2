import { Camera } from 'lucide-react';

interface LogoProps {
  dark?: boolean;
}

const Logo = ({ dark = false }: LogoProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Camera className={`${dark ? 'text-primary' : 'text-white'}`} size={28} />
      <div className="flex flex-col">
        <span className={`font-playfair font-medium text-xl ${dark ? 'text-primary' : 'text-white'}`}>
          Wild Pictures
        </span>
        <span className={`text-xs uppercase tracking-widest ${dark ? 'text-primary' : 'text-white'} opacity-80`}>
          Studio
        </span>
      </div>
    </div>
  );
};

export default Logo;