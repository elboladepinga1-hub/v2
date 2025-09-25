import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Button from '../ui/Button';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  label?: string;
}

const SignaturePad = ({ onSave, label = 'Assinatura' }: SignaturePadProps) => {
  const signatureRef = useRef<SignatureCanvas>(null);

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleSave = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const signatureData = signatureRef.current.toDataURL();
      onSave(signatureData);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className="border border-gray-300 rounded-lg">
        <SignatureCanvas
          ref={signatureRef}
          canvasProps={{
            className: 'signature-canvas w-full h-40 rounded-lg',
            style: { background: 'white' }
          }}
          backgroundColor="white"
        />
      </div>
      <div className="flex space-x-4">
        <Button variant="secondary" onClick={handleClear} type="button">
          Limpar
        </Button>
        <Button variant="primary" onClick={handleSave} type="button">
          Salvar Assinatura
        </Button>
      </div>
    </div>
  );
};

export default SignaturePad;