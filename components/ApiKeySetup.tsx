import React, { useState } from 'react';

interface ApiKeySetupProps {
  onSave: (apiKey: string) => void;
  error: string | null;
  isLoading: boolean;
}

const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    </svg>
);


export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onSave, error, isLoading }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !apiKey.trim()) return;
    onSave(apiKey);
  };

  return (
    <div className="min-h-screen bg-slate-100/50 flex flex-col items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-lg">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-sky-100 rounded-full mb-4">
                        <KeyIcon className="h-10 w-10 text-sky-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Configuración Requerida</h1>
                    <p className="text-slate-600 mt-2">Para comenzar, por favor introduce tu clave de API de Gemini.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 mb-1">
                            Tu API Key
                        </label>
                        <input
                            id="apiKey"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 transition"
                            placeholder="Pega tu clave aquí..."
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-300 text-red-800 text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading || !apiKey.trim()}
                            className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-sky-600 text-white font-semibold rounded-md shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Verificando...
                            </>
                        ) : 'Guardar y Continuar'}
                        </button>
                    </div>
                </form>

                 <div className="mt-6 text-center text-xs text-slate-500">
                    <p>Tu clave se guardará en el almacenamiento de tu navegador.</p>
                    <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sky-600 hover:underline mt-1 inline-block"
                    >
                        ¿No tienes una clave? Consíguela en Google AI Studio &rarr;
                    </a>
                </div>
            </div>
        </div>
    </div>
  );
};
