import React, { useState } from 'react';

// Definir tipos para la estructura de las preguntas para mayor claridad
type Question = {
  id: string;
  text: string;
};

type QuestionCategory = {
  title: string;
  questions: Question[];
};

interface ProjectFormProps {
  onSubmitAnswers: (answers: Record<string, string>) => void;
  questions: QuestionCategory[];
  isLoading: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  onSubmitAnswers,
  questions,
  isLoading,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !allQuestionsAnswered) return;
    onSubmitAnswers(answers);
  };

  const totalQuestions = questions.reduce((acc, category) => acc + category.questions.length, 0);
  // FIX: Add a type guard to ensure `a` is a string before calling `.trim()`.
  // This resolves the TypeScript error "Property 'trim' does not exist on type 'unknown'".
  const answeredQuestions = Object.values(answers).filter(a => typeof a === 'string' && a.trim() !== '').length;
  const allQuestionsAnswered = totalQuestions === answeredQuestions;

  const isButtonDisabled = isLoading || !allQuestionsAnswered;
  
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Analizando...
        </>
      );
    }
    return 'Enviar Respuestas';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in mt-6">
       {questions.map((category) => (
        <div key={category.title} className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800 mb-5 pb-3 border-b border-slate-200">{category.title}</h3>
          <div className="space-y-6">
            {category.questions.map((q) => (
              <div key={q.id}>
                <label htmlFor={q.id} className="block text-base font-medium text-slate-700 mb-2">
                  {q.text}
                </label>
                <textarea
                  id={q.id}
                  name={q.id}
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 transition"
                  placeholder="Escribe la respuesta de tu equipo aquí..."
                  required
                  disabled={isLoading}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-4">
        <button
            type="submit"
            disabled={isButtonDisabled}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-sky-600 text-white font-semibold rounded-md shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
            {getButtonContent()}
        </button>
        {!allQuestionsAnswered && <p className="text-center text-sm text-slate-500 mt-3">Por favor, responde todas las preguntas para continuar.</p>}
      </div>
    </form>
  );
};