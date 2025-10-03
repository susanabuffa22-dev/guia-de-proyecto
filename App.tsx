import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ProjectForm } from './components/ProjectForm';
import { GuideDisplay, Message, ConsultationMessage } from './components/GuideDisplay';
import { getDesignFeedback, generateCustomGuide, generateProjectImage, getConsultationResponse } from './services/geminiService';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { Discipline, DISCIPLINE_QUESTIONS, DISCIPLINE_DETAILS } from './questions';
import { DisciplineSelector } from './components/DisciplineSelector';

// Helper to convert the guide text to a full HTML document for printing
const convertGuideToHtml = (message: Message): string => {
    if (!message) return '';

    const title = message.title || 'Guía de Proyecto Personalizada';

    // Re-using the formatting logic from GuideDisplay's renderFormattedText for consistency
    const lines = message.text.split('\n');
    let textHtml = '';

    const formatLine = (line: string): string => {
        if (line.match(/^\s*\d\.\s*📝/)) return `<h2>${line}</h2>`;
        if (line.match(/^\s*\d\.\s*🎨/)) return ''; // Skip this, handled separately
        if (line.match(/^\s*\d\.\s*🛠️/)) return `<h2>${line}</h2>`;
        if (line.match(/^\s*\d\.\s*⏰/)) return `<h2>${line}</h2>`;
        if (line.match(/^\s*\d\.\s*🗺️/)) return `<h2>${line}</h2>`;
        if (line.match(/^\s*Fase \d:/)) return `<h3>${line}</h3>`;
        if (line.match(/^\s*\*\s*\*\*(.*?)\*\*/)) {
            const parts = line.replace(/^\s*\*/, '').trim().split('**');
            return `<li><strong>${parts[1]}</strong>${parts.slice(2).join('')}</li>`;
        }
        if (line.trim().endsWith(':')) return `<h4>${line.replace('*','').trim()}</h4>`;
        if (line.match(/^\s*\* /)) return `<li>${line.replace(/^\s*\*/, '').trim()}</li>`;
        if (line.trim() === '') return '<br>';
        return `<p>${line}</p>`;
    };

    let isList = false;
    for (const line of lines) {
        const trimmedLine = line.trim();
        const isListItem = trimmedLine.startsWith('*');

        if (isList && !isListItem && trimmedLine !== '') {
            textHtml += '</ul>';
            isList = false;
        }
        if (!isList && isListItem) {
            textHtml += '<ul>';
            isList = true;
        }
        textHtml += formatLine(line);
    }
    if (isList) textHtml += '</ul>';

    let html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 20px auto; padding: 0 20px; }
                h1 { font-size: 28px; color: #1e293b; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; margin-bottom: 20px; }
                h2 { font-size: 22px; color: #0c4a6e; margin-top: 30px; border-bottom: 1px solid #bae6fd; padding-bottom: 8px;}
                h3 { font-size: 18px; color: #0369a1; margin-top: 25px; }
                h4 { font-size: 16px; font-weight: bold; color: #1e293b; margin-top: 20px; margin-bottom: 5px; }
                img { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0; box-shadow: 0 4px 8px rgba(0,0,0,0.1); page-break-inside: avoid; }
                ul { padding-left: 20px; list-style-type: disc; margin-bottom: 15px; }
                li { margin-bottom: 8px; }
                p { margin-bottom: 12px; }
                strong { color: #1e293b; }
                @media print {
                  body { margin: 0; box-shadow: none; border: none; }
                  h1, h2, h3 { page-break-after: avoid; }
                }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
    `;

    if (message.imageUrl) {
        html += `
            <h2>🎨 Concepto Visual: ¿Cómo se verá?</h2>
            <img src="${message.imageUrl}" alt="Concepto visual del proyecto" />
        `;
    }

    html += textHtml;

    html += `
        </body>
        </html>
    `;
    return html;
};


const App: React.FC = () => {
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [answers, setAnswers] = useState<Record<string, string> | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [consultationInputs, setConsultationInputs] = useState<Record<string, string>>({});
  const [isConsulting, setIsConsulting] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
        // Scroll only when a new message is added, not on updates like 'isAgreed'
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.type !== 'answer' && !lastMessage.isAgreed) {
            scrollToBottom();
        }
    }
  }, [messages.length]);

  const handleSelectDiscipline = (selectedDiscipline: Discipline) => {
    setDiscipline(selectedDiscipline);
  };
  
  const handleSubmitAnswers = useCallback(async (submittedAnswers: Record<string, string>) => {
    setIsLoading(true);
    setError(null);
    setAnswers(submittedAnswers);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: "Estas son mis respuestas. ¡Espero tus comentarios!",
      type: 'answer',
    };
    setMessages([userMessage]);
    
    try {
      setLoadingMessage('Analizando las respuestas...');
      const studentAnswersString = JSON.stringify(submittedAnswers, null, 2);
      const feedbackCards = await getDesignFeedback(studentAnswersString, discipline!);

      if (feedbackCards.length === 0) {
        setLoadingMessage('¡Excelente plan! Generando la guía del proyecto...');
        await generateGuide(studentAnswersString);
      } else {
        const feedbackMessages: Message[] = feedbackCards.map((card, index) => ({
          id: `feedback-${Date.now()}-${index}`,
          sender: 'ai',
          text: `**${card.title}**\n${card.content}`,
          type: 'feedback',
          isAgreed: false,
        }));
        setMessages(prev => [...prev, ...feedbackMessages]);
      }

    } catch (e: any) {
      setError(e.message || 'Ocurrió un error desconocido.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [discipline]);
  
  const generateGuide = async (studentAnswersString: string) => {
      setIsLoading(true);
      setError(null);
      setLoadingMessage('Generando una imagen conceptual del proyecto...');

      try {
        const imageUrl = await generateProjectImage(studentAnswersString, discipline!);
        
        setLoadingMessage('Creando la guía paso a paso...');

        const conversationHistory = messages
          .filter(m => m.type === 'feedback' || m.type === 'answer' || m.consultations)
          .map(m => {
            let turn = `${m.sender === 'user' ? 'Estudiante' : 'Mentor'}: ${m.text}\n`;
            if (m.consultations) {
              turn += m.consultations.map(c => `  ${c.sender === 'user' ? 'Estudiante (pregunta)' : 'Mentor (respuesta)'}: ${c.text}`).join('\n');
            }
            return turn;
          })
          .join('\n');

        const guideText = await generateCustomGuide(studentAnswersString, conversationHistory, discipline!);
        
        const guideMessage: Message = {
          id: `guide-${Date.now()}`,
          sender: 'ai',
          text: guideText,
          type: 'guide',
          imageUrl: imageUrl,
          title: answers?.name || "Guía de Proyecto Personalizada",
        };
        setMessages(prev => [...prev, guideMessage]);

      } catch (e: any) {
        setError(e.message || 'Ocurrió un error desconocido.');
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
  };

  const handleToggleAgreement = useCallback((messageId: string) => {
    setMessages(prevMessages => {
      const updatedMessages = prevMessages.map(msg => 
        msg.id === messageId ? { ...msg, isAgreed: true } : msg
      );
      
      const feedbackMessages = updatedMessages.filter(msg => msg.type === 'feedback');
      const allAgreed = feedbackMessages.length > 0 && feedbackMessages.every(msg => msg.isAgreed);

      if (allAgreed && answers) {
        const studentAnswersString = JSON.stringify(answers, null, 2);
        // Using a timeout to let the state update before generating the guide
        setTimeout(() => generateGuide(studentAnswersString), 0);
      }
      
      return updatedMessages;
    });
  }, [answers, discipline]);

  const handleSendConsultation = async (messageId: string, question: string) => {
    if (!question.trim()) return;
    
    setIsConsulting(messageId);

    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const newConsultation: ConsultationMessage = { sender: 'user', text: question };
        return {
          ...msg,
          consultations: [...(msg.consultations || []), newConsultation]
        };
      }
      return msg;
    }));
    
    setConsultationInputs(prev => ({...prev, [messageId]: ''}));

    try {
      const originalMessage = messages.find(m => m.id === messageId);
      if (originalMessage) {
        const responseText = await getConsultationResponse(originalMessage.text, question, discipline!);
        
        setMessages(prev => prev.map(msg => {
          if (msg.id === messageId) {
            const newConsultation: ConsultationMessage = { sender: 'ai', text: responseText };
            return {
              ...msg,
              consultations: [...(msg.consultations || []), newConsultation]
            };
          }
          return msg;
        }));
      }
    } catch (e: any) {
      console.error("Consultation error:", e);
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const newConsultation: ConsultationMessage = { sender: 'ai', text: `Lo siento, tuve un error: ${e.message}` };
          return {
            ...msg,
            consultations: [...(msg.consultations || []), newConsultation]
          };
        }
        return msg;
      }));
    } finally {
      setIsConsulting(null);
    }
  };
  
  const handlePrintGuide = () => {
    const guideMessage = messages.find(m => m.type === 'guide');
    if (guideMessage) {
        const htmlContent = convertGuideToHtml(guideMessage);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
        } else {
            setError("No se pudo abrir la ventana de impresión. Revisa si tu navegador bloquea las ventanas emergentes.");
        }
    }
  };

  if (!discipline) {
    return <DisciplineSelector onSelectDiscipline={handleSelectDiscipline} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-4">
          <BookOpenIcon className="h-10 w-10 text-sky-600" />
          <h1 className="text-4xl font-bold text-slate-900">
            {DISCIPLINE_DETAILS[discipline].title}
          </h1>
        </div>
        <p className="text-lg text-slate-600">
          Responde a las siguientes preguntas para que el mentor de IA pueda ayudarte a crear una guía de proyecto.
        </p>
      </header>

      <main>
        {!answers ? (
          <ProjectForm
            onSubmitAnswers={handleSubmitAnswers}
            questions={DISCIPLINE_QUESTIONS[discipline]}
            isLoading={isLoading}
          />
        ) : (
          <>
            <GuideDisplay
              messages={messages}
              isLoading={isLoading}
              loadingMessage={loadingMessage}
              error={error}
              onPrint={handlePrintGuide}
              onToggleAgreement={handleToggleAgreement}
              onSendConsultation={handleSendConsultation}
              consultationInputs={consultationInputs}
              onConsultationInputChange={(id, val) => setConsultationInputs(prev => ({...prev, [id]: val}))}
              isConsulting={isConsulting}
            />
            <div ref={messagesEndRef} />
          </>
        )}
      </main>
    </div>
  );
};

export default App;