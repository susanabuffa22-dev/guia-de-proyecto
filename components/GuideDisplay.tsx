
import React, { useRef, useEffect } from 'react';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';

// Icono de Print definido localmente
const PrintIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

// Icono de Check definido localmente para evitar crear un nuevo archivo
const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);


export type ConsultationMessage = {
  sender: 'ai' | 'user';
  text: string;
};

export type Message = {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  type: 'question' | 'feedback' | 'guide' | 'answer';
  imageUrl?: string;
  consultations?: ConsultationMessage[];
  isAgreed?: boolean;
  title?: string;
};

interface GuideDisplayProps {
  messages: Message[];
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  onPrint: () => void;
  onToggleAgreement: (messageId: string) => void;
  onSendConsultation: (messageId: string, question: string) => void;
  consultationInputs: Record<string, string>;
  onConsultationInputChange: (messageId: string, value: string) => void;
  isConsulting: string | null; // ID of the message being consulted
}


const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    let isList = false;
  
    const content = lines.map((line, index) => {
      // Main headers like "1. 📝 Resumen..."
      if (line.match(/^\s*\d\.\s*📝/)) {
        return <h2 key={index} className="text-2xl font-bold text-slate-800 mt-6 mb-4 pb-2 border-b-2 border-sky-200">{line}</h2>;
      }
      if (line.match(/^\s*\d\.\s*🎨/)) {
        return null;
      }
      if (line.match(/^\s*\d\.\s*🛠️/)) {
        return <h2 key={index} className="text-2xl font-bold text-slate-800 mt-6 mb-4 pb-2 border-b-2 border-teal-200">{line}</h2>;
      }
      if (line.match(/^\s*\d\.\s*⏰/)) {
        return <h2 key={index} className="text-2xl font-bold text-slate-800 mt-6 mb-4 pb-2 border-b-2 border-amber-200">{line}</h2>;
      }
      if (line.match(/^\s*\d\.\s*🗺️/)) {
        return <h2 key={index} className="text-2xl font-bold text-slate-800 mt-6 mb-4 pb-2 border-b-2 border-indigo-200">{line}</h2>;
      }
  
      // Phase headers like "Fase 1: ..."
      if (line.match(/^\s*Fase \d:/)) {
        return <h3 key={index} className="text-xl font-semibold text-sky-700 mt-6 mb-3">{line}</h3>;
      }
  
      // List items with bolded keys like "* **¿Qué vamos a construir?**"
      if (line.match(/^\s*\*\s*\*\*(.*?)\*\*/)) {
        const parts = line.replace(/^\s*\*/, '').trim().split('**');
        return (
          <li key={index} className="ml-5 list-disc list-outside mb-2 text-slate-700">
            <span className="font-semibold text-slate-800">{parts[1]}</span>
            {parts.slice(2).join('')}
          </li>
        );
      }
  
       // Sub-list headers like "* **Componentes Electrónicos:**"
      if (line.trim().endsWith(':')) {
          isList = true;
          return <h4 key={index} className="font-semibold text-slate-700 mt-4 mb-2">{line.replace('*','').trim()}</h4>
      }
  
      // Regular list items "* Item..."
      if (line.match(/^\s*\* /) || (isList && line.trim() !== '')) {
          if (line.trim() === '') {
              isList = false;
              return null;
          }
        return <li key={index} className="ml-8 list-disc text-slate-600">{line.replace(/^\s*\*/, '').trim()}</li>;
      }
  
      if (line.trim() === '') {
        isList = false;
        return <div key={index} className="h-4"></div>;
      }
  
      return <p key={index} className="text-slate-700 mb-2 leading-relaxed">{line}</p>;
    });

    return content;
};

const ConsultationChat: React.FC<{
  message: Message;
  onSendConsultation: (messageId: string, question: string) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  isConsulting: boolean;
}> = ({ message, onSendConsultation, inputValue, onInputChange, isConsulting }) => {
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [message.consultations]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendConsultation(message.id, inputValue);
  };
  return (
    <div className="mt-6 border-t border-slate-200 pt-4">
      <h4 className="text-sm font-semibold text-slate-600 mb-3">¿Tienes alguna pregunta sobre esta respuesta?</h4>
      {message.consultations && message.consultations.length > 0 && (
        <div ref={chatHistoryRef} className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
          {message.consultations.map((c, i) => (
            <div key={i} className={`text-sm ${c.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded-lg ${c.sender === 'user' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'}`}>
                {c.text}
              </div>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Haz una pregunta de seguimiento..."
          className="flex-grow px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm"
          disabled={isConsulting}
        />
        <button type="submit" disabled={isConsulting || !inputValue.trim()} className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-md shadow-sm hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-sm">
          {isConsulting ? '...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
};


// FIX: Omit 'error' from props, as it's not used in ChatMessage and was causing a type error.
const ChatMessage: React.FC<{ message: Message } & Omit<GuideDisplayProps, 'messages' | 'isLoading' | 'loadingMessage' | 'error'>> = ({ 
  message, 
  onPrint,
  onToggleAgreement,
  onSendConsultation,
  consultationInputs,
  onConsultationInputChange,
  isConsulting
}) => {
  const isAi = message.sender === 'ai';

  const bubbleClasses = isAi
    ? 'bg-white border border-slate-200'
    : 'bg-sky-100/80 text-sky-900';
  
  const icon = isAi ? <BotIcon className="h-8 w-8 text-slate-400 shrink-0" /> : <UserIcon className="h-8 w-8 text-sky-600 shrink-0" />;

  const renderMessageContent = (msg: Message) => {
    if (msg.type === 'guide') {
      const title = msg.title || "Tu Guía de Proyecto Personalizada";
      return (
        <div className="prose prose-slate max-w-none">
            <h1 className="text-3xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-slate-300">{title}</h1>
            
            {msg.imageUrl && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mt-6 mb-4 pb-2 border-b-2 border-purple-200">🎨 Concepto Visual: ¿Cómo se verá?</h2>
                <img src={msg.imageUrl} alt="Concepto visual del proyecto" className="rounded-lg shadow-lg border border-slate-200 w-full" />
              </div>
            )}
            
            {renderFormattedText(msg.text)}

            <div className="mt-8 pt-4 border-t border-slate-200">
                <button 
                  onClick={onPrint}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                >
                  <PrintIcon className="h-5 w-5" />
                  Imprimir / Guardar como PDF
                </button>
            </div>
        </div>
      )
    }

    const textLines = msg.text.split('\n').map((line, index) => {
      if (line.trim() === '') return <div key={index} className="h-3" />;
      
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          return part;
      });

      if (line.trim().startsWith('* ')) {
        return <li key={index} className="ml-5 list-disc">{parts.map(p => typeof p === 'string' ? p.replace(/^\s*\*/, '').trim() : p)}</li>;
      }
      
      return <p key={index}>{parts}</p>;
    });

    if (msg.type === 'feedback') {
        return (
            <>
                {textLines}
                <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-end">
                    <button
                        onClick={() => onToggleAgreement(msg.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105
                          ${msg.isAgreed 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                    >
                        {msg.isAgreed ? (
                            <>
                                <CheckIcon className="h-4 w-4" /> Acordado
                            </>
                        ) : (
                            'Estoy de acuerdo'
                        )}
                    </button>
                </div>
            </>
        )
    }
    return textLines;
  };

  return (
    <div className={`flex items-start gap-4 animate-fade-in`}>
      {icon}
      <div className={`w-full p-5 rounded-xl shadow-md ${bubbleClasses}`}>
        <div className="text-slate-800 leading-relaxed">
            {renderMessageContent(message)}
        </div>
        {isAi && (message.type === 'feedback' || message.type === 'guide') && (
            <ConsultationChat 
                message={message}
                onSendConsultation={onSendConsultation}
                inputValue={consultationInputs[message.id] || ''}
                onInputChange={(value) => onConsultationInputChange(message.id, value)}
                isConsulting={isConsulting === message.id}
            />
        )}
      </div>
    </div>
  );
};


export const GuideDisplay: React.FC<GuideDisplayProps> = ({ messages, isLoading, loadingMessage, error, ...props }) => {
  return (
    <div className="space-y-6">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} {...props} />
      ))}
      {isLoading && (
        <div className="flex items-start gap-4 animate-fade-in">
          <BotIcon className="h-8 w-8 text-slate-400 shrink-0" />
          <div className="w-full p-4 rounded-xl shadow-sm bg-white border border-slate-200">
            <div className="flex items-center gap-3 text-slate-500">
               <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{loadingMessage}</span>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">¡Oh no! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
    </div>
  );
};
