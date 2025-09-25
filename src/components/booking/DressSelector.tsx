import { useState } from 'react';
import { DressOption } from '../../types/booking';

interface DressSelectorProps {
  dresses: DressOption[];
  maxSelections: number;
  selectedDresses: string[];
  onChange: (selected: string[]) => void;
}

const DressSelector = ({ dresses, maxSelections, selectedDresses, onChange }: DressSelectorProps) => {
  const handleDressSelection = (dressId: string) => {
    if (selectedDresses.includes(dressId)) {
      onChange(selectedDresses.filter(id => id !== dressId));
    } else if (selectedDresses.length < maxSelections) {
      // If we're at the limit, remove the first selected dress and add the new one
      if (selectedDresses.length === maxSelections) {
        const newSelection = [...selectedDresses.slice(1), dressId];
        onChange(newSelection);
      } else {
        onChange([...selectedDresses, dressId]);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Seleção de Vestidos</h3>
        <span className="text-sm text-gray-600">
          {selectedDresses.length} de {maxSelections} selecionados
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dresses.map((dress) => (
          <div 
            key={dress.id}
            className={`relative cursor-pointer ${
              selectedDresses.length >= maxSelections && !selectedDresses.includes(dress.id)
                ? 'opacity-50'
                : ''
            }`}
            onClick={() => handleDressSelection(dress.id)}
          >
            <div className="aspect-square overflow-hidden rounded-lg">
              <img loading="lazy"
                src={dress.image}
                alt={dress.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className={`absolute inset-0 rounded-lg border-2 ${
              selectedDresses.includes(dress.id)
                ? 'border-secondary bg-black/20'
                : 'border-transparent'
            }`}>
              {selectedDresses.includes(dress.id) && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-white">
                  ✓
                </div>
              )}
            </div>
            <p className="mt-2 text-sm font-medium">{dress.name}</p>
            <p className="text-sm text-gray-600">{dress.color}</p>
          </div>
        ))}
      </div>
      
      <p className="text-sm text-gray-600 mt-2">
        {maxSelections === 1 
          ? 'Selecione 1 vestido para esta sessão'
          : `Selecione até ${maxSelections} vestidos para esta sessão`}
      </p>
    </div>
  );
};

export default DressSelector;
