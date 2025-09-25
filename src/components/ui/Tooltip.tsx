import { useState, useRef, ReactNode, useEffect } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  show?: boolean;
}

const Tooltip = ({ children, content, position = 'right', show = false }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(show);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-0 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2'
  };

  return (
    <div 
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`fixed z-50 ${positionClasses[position]}`}
          style={{
            top: containerRef.current?.getBoundingClientRect().top,
            left: containerRef.current?.getBoundingClientRect().right
          }}
        >
          <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[300px] max-w-[400px]">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;