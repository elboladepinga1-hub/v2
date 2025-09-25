import { Camera } from 'lucide-react';
import Button from '../ui/Button';

interface ContractDisplayProps {
  onAccept: () => void;
  onReject: () => void;
}

const ContractDisplay = ({ onAccept, onReject }: ContractDisplayProps) => {
  const handleAccept = () => {
    // Scroll to top before moving to next step
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setTimeout(() => onAccept(), 100); // Small delay to ensure scroll completes
  };

  const handleReject = () => {
    // Scroll to top before going back
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setTimeout(() => onReject(), 100); // Small delay to ensure scroll completes
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="bg-white text-primary border-b-2 border-primary p-8 text-center relative rounded-t-lg">
          <div className="absolute top-4 left-4">
            <Camera size={32} />
          </div>
          <h1 className="text-3xl font-playfair mb-2 text-primary">CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS</h1>
          <p className="text-lg text-primary">Wild Pictures Studio</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-b-lg p-8 space-y-8">
          {/* Important Notice */}
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
            <p className="text-red-700 font-bold mb-2 text-lg">IMPORTANTE:</p>
            <p className="text-red-600 leading-relaxed">
              Qualquer dado incorreto ou campo vazio no preenchimento deste contrato resultará no imediato CANCELAMENTO DO CONTRATO. 
              Além disso, a DIREÇÃO DO EVENTO DEVE SER INFORMADA DE FORMA CORRETA, incluindo rua, número e bairro, para evitar quaisquer problemas logísticos e operacionais.
            </p>
          </div>

          {/* Contract Clauses */}
          <div className="space-y-8">
            <section className="contract-section">
              <h2 className="section-title">CLÁUSULA 1ª – DAS OBRIGAÇÕES DO(A) CONTRATADO(A)</h2>
              <div className="space-y-4 text-gray-700">
                <p>Comparecer ao evento com antecedência suficiente, de modo a garantir o fiel cumprimento do tempo de cobertura contratado, conforme especificado no formulário de contratação.</p>
                <p>Entregar todas as fotografias editadas, com a devida correção de cores, no prazo máximo de 15 (quinze) dias úteis após a realização do evento.</p>
                <p>Entregar, no caso de sessões fotográficas, as imagens em baixa resolução para seleção pelo(a) CONTRATANTE, no prazo de até 3 (três) dias úteis após a realização da sessão.</p>
                <p>Disponibilizar todos os arquivos digitais em alta resolução, devidamente editados e sem marca d'água, para download ou por outro meio previamente acordado entre as partes.</p>
              </div>
            </section>

            <section className="contract-section">
              <h2 className="section-title">CLÁUSULA 2ª – DAS OBRIGAÇÕES DO(A) CONTRATANTE</h2>
              <div className="space-y-4 text-gray-700">
                <p>Para serviços com duração superior a 6 (seis) horas, fornecer alimentação à equipe (refeição e bebidas não alcoólicas) e disponibilizar um espaço seguro para armazenamento dos equipamentos da CONTRATADA, com acesso exclusivo à equipe.</p>
                <p>Caso não seja possível fornecer alimentação, o(a) CONTRATANTE deverá negociar previamente o valor correspondente ao custo da refeição.</p>
                <p>No caso de sessões fotográficas, selecionar as fotos a serem editadas em até 3 (três) dias úteis após o envio das fotos em baixa resolução, ciente de que o não cumprimento desse prazo poderá atrasar a entrega final.</p>
                <p>Realizar o pagamento conforme estipulado neste contrato:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>20% (vinte por cento) do valor total a título de reserva da data;</li>
                  <li>O restante do valor no dia do evento, antes do início dos serviços.</li>
                </ul>
                <p>Cumprir rigorosamente os horários contratados, definidos exclusivamente pelo(a) CONTRATANTE. A CONTRATADA não se responsabiliza por atrasos de serviços terceiros que resultem na necessidade de contratação de horas extras.</p>
                <p>Caso o(a) CONTRATANTE deseje contratar horas extras no dia do evento, isso estará sujeito à disponibilidade do calendário da CONTRATADA, que poderá aceitar ou recusar a solicitação.</p>
                <p>Conferir o material entregue e, caso encontre inconsistências, informar à CONTRATADA em até 5 (cinco) dias úteis após o recebimento. Findo esse prazo, não serão aceitas reclamações ou solicitações de modificações.</p>
              </div>
            </section>

            <section className="contract-section">
              <h2 className="section-title">CLÁUSULA 3ª – DO ENSAIO PRÉ-WEDDING OU ENSAIO FOTOGRÁFICO</h2>
              <div className="space-y-4 text-gray-700">
                <p>No caso de contratação de ensaio pré-wedding ou ensaio fotográfico, o(a) CONTRATANTE deverá informar à CONTRATADA a data escolhida com, no mínimo, 15 (quinze) dias de antecedência, para que a equipe possa se organizar e enviar o formulário de agendamento.</p>
                <p>Quando se tratar de casamento, o ensaio pré-wedding deverá ser realizado até 15 (quinze) dias antes da data do evento.</p>
              </div>
            </section>

            <section className="contract-section">
              <h2 className="section-title">CLÁUSULA 4ª – DAS HORAS EXTRAS E ATRASOS</h2>
              <div className="space-y-4 text-gray-700">
                <p>O(a) CONTRATANTE reconhece que os horários contratados são previamente definidos por ele(a) e que devem ser rigorosamente cumpridos.</p>
                <p>A CONTRATADA não se responsabiliza por atrasos de terceiros (como cerimônias religiosas, buffets, maquiadores, etc.) que impactem na realização do evento e demandem horas extras.</p>
                <p>A contratação de horas extras no dia do evento estará sujeita à disponibilidade da agenda da CONTRATADA, que se reserva o direito de aceitar ou recusar tal solicitação.</p>
              </div>
            </section>

            <section className="contract-section">
              <h2 className="section-title">CLÁUSULA 5ª – DA RESCISÃO E MUDANÇA DE DATA</h2>
              <div className="space-y-4 text-gray-700">
                <p>O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio por escrito de, no mínimo, 30 (trinta) dias.</p>
                <p>Em caso de desistência injustificada pelo(a) CONTRATANTE, o valor pago a título de reserva de data (20%) não será devolvido.</p>
                <p>Se a rescisão ocorrer por parte da CONTRATADA sem justa causa, esta deverá restituir integralmente os valores pagos, acrescidos de multa de 1/3 (um terço) sobre o valor já pago.</p>
                <p>Em caso de mudança de data do evento, o(a) CONTRATANTE deverá informar à CONTRATADA com antecedência mínima de 30 (trinta) dias, ficando a alteração condicionada à disponibilidade da agenda.</p>
                <p>Caso a nova data não esteja disponível, aplicam-se as disposições de rescisão previstas nos itens anteriores.</p>
              </div>
            </section>

            <section className="contract-section">
              <h2 className="section-title">CLÁUSULA 6ª – DA CLÁUSULA PENAL</h2>
              <div className="space-y-4 text-gray-700">
                <p>O descumprimento, por qualquer das partes, das obrigações assumidas neste contrato, sujeitará a parte infratora ao pagamento de multa equivalente a 1/3 (um terço) do valor total do contrato, sem prejuízo de eventuais perdas e danos.</p>
                <p>A cláusula penal não afasta a possibilidade de cobrança judicial ou extrajudicial de danos adicionais comprovadamente sofridos pela parte prejudicada.</p>
                <p>No caso de a CONTRATADA não comparecer no dia do evento ou não entregar o material contratado nos prazos estabelecidos, a multa será aplicada de forma imediata, facultando ao(à) CONTRATANTE a execução do contrato e o ajuizamento de ação para reparação integral dos prejuízos, incluindo eventual indenização por danos morais.</p>
                <p>Em caso fortuito ou força maior, devidamente comprovados, não se aplicam as penalidades acima descritas, sendo o contrato desfeito sem prejuízo a ambas as partes.</p>
              </div>
            </section>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-12 pt-8 border-t">
            <Button variant="secondary" onClick={onReject}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleAccept}>
              Li e Aceito os Termos - Continuar
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .contract-section {
          @apply border-b border-gray-200 pb-8;
        }
        .section-title {
          @apply text-xl font-bold mb-6 text-primary relative pb-2;
        }
        .section-title::after {
          content: '';
          @apply absolute bottom-0 left-0 w-16 h-0.5 bg-secondary;
        }
      `}</style>
    </div>
  );
};

export default ContractDisplay;
