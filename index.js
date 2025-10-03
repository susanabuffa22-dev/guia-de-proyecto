

import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- HELPERS & ICONS ---

const e = React.createElement;

const SparklesIcon = (props) => e("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, 
    e("path", { d: "M9.93 2.55a2 2 0 0 0-1.86 0L6.53 4.1a2 2 0 0 1-1.86 0L3.14 2.55a2 2 0 0 0-1.86 0L.14 3.7a2 2 0 0 0 0 3.46l1.54 1.54a2 2 0 0 1 0 1.86L.14 12.1a2 2 0 0 0 0 3.46l1.14 1.14a2 2 0 0 0 1.86 0l1.54-1.54a2 2 0 0 1 1.86 0l1.54 1.54a2 2 0 0 0 1.86 0l1.14-1.14a2 2 0 0 0 0-3.46l-1.54-1.54a2 2 0 0 1 0-1.86l1.54-1.54a2 2 0 0 0 0-3.46L9.93 2.55Z" }), 
    e("path", { d: "M18 5.5a2 2 0 0 0-2-2" }), 
    e("path", { d: "M22 9.5a2 2 0 0 0-2-2" }), 
    e("path", { d: "M18 18.5a2 2 0 0 1 2 2" }), 
    e("path", { d: "M22 14.5a2 2 0 0 1 2 2" })
);

const SawIcon = (props) => e("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
    e("path", { d: "m7.24 15.2-4.82 4.82a1 1 0 0 0 0 1.41 1 1 0 0 0 1.41 0l4.82-4.82" }),
    e("path", { d: "m14 7.5 2.5 2.5" }),
    e("path", { d: "m18 11.5 2.5 2.5" }),
    e("path", { d: "m6 16 1-1" }),
    e("path", { d: "M18 4c-2.5 2.5-6 6-9 9l-4.5 4.5" }),
    e("path", { d: "m14 3.5 6 6" }),
    e("path", { d: "m12 6.5 2 2" }),
    e("path", { d: "m16 10.5 2 2" }),
    e("path", { d: "M21.17 11.17a2.83 2.83 0 0 0-4-4L15.5 8.85l4 4 1.67-1.68Z" })
);

const GearsIcon = (props) => e("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
    e("path", { d: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" }),
    e("path", { d: "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" }),
    e("path", { d: "M12 2v2" }),
    e("path", { d: "M12 22v-2" }),
    e("path", { d: "m17 20.66-1-1.73" }),
    e("path", { d: "M11 10.27 7 3.34" }),
    e("path", { d: "m20.66 17-1.73-1" }),
    e("path", { d: "m3.34 7 1.73 1" }),
    e("path", { d: "M14 12h8" }),
    e("path", { d: "M2 12h2" }),
    e("path", { d: "m20.66 7-1.73 1" }),
    e("path", { d: "m3.34 17 1.73-1" }),
    e("path", { d: "m17 3.34-1 1.73" }),
    e("path", { d: "M11 13.73 7 20.66" })
);

const BotIcon = (props) => e("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, e("path", { d: "M12 8V4H8" }), e("rect", { width: "16", height: "12", x: "4", y: "8", rx: "2" }), e("path", { d: "M2 14h2" }), e("path", { d: "M20 14h2" }), e("path", { d: "M15 13v2" }), e("path", { d: "M9 13v2" }));
const UserIcon = (props) => e("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, e("path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }), e("circle", { cx: "12", cy: "7", r: "4" }));

// --- QUESTIONS DATABASE ---

const questions = {
    tecnologia: [
        { id: 'projectName', label: 'Nombre del Proyecto Tecnológico', placeholder: 'Ej: "Estación Meteorológica con IoT"' },
        { id: 'projectObjective', label: 'Objetivo Principal del Proyecto', placeholder: 'Ej: "Medir y publicar en línea la temperatura y humedad"' },
        { id: 'studentLevel', label: 'Nivel de los Estudiantes', options: ['Principiante', 'Intermedio', 'Avanzado'], type: 'select' },
        { id: 'platform', label: 'Plataforma / Componente Principal', placeholder: 'Ej: "ESP32, Raspberry Pi, Arduino UNO"' },
        { id: 'components', label: 'Componentes Electrónicos y Software', placeholder: 'Ej: "Sensor DHT22, pantalla OLED, librería Adafruit IO"' },
        { id: 'tools', label: 'Herramientas y Equipo', placeholder: 'Ej: "Soldador, Multímetro, IDE de programación (VS Code)"' },
        { id: 'programmingLanguage', label: 'Lenguaje(s) de Programación', placeholder: 'Ej: "MicroPython, C++, JavaScript"' },
    ],
    carpinteria: [
        { id: 'projectName', label: 'Nombre del Proyecto', placeholder: 'Ej: "Estantería Flotante de Roble"' },
        { id: 'projectObjective', label: 'Objetivo Principal del Proyecto', placeholder: 'Ej: "Crear una estantería minimalista para exhibir libros y plantas"' },
        { id: 'studentLevel', label: 'Nivel de los Estudiantes', options: ['Principiante', 'Intermedio', 'Avanzado'], type: 'select' },
        { id: 'materials', label: 'Materiales Principales', placeholder: 'Ej: "Madera de roble, tornillos para madera, aceite de tung"' },
        { id: 'tools', label: 'Herramientas Clave', placeholder: 'Ej: "Sierra de mesa, taladro, lijadora orbital, sargentos"' },
        { id: 'safety', label: 'Consideraciones de Seguridad Específicas', placeholder: 'Ej: "Uso obligatorio de gafas de seguridad y protectores auditivos"', type: 'textarea' },
    ],
    mecanica: [
        { id: 'projectName', label: 'Nombre del Ensamblaje Mecánico', placeholder: 'Ej: "Sistema de Engranajes Planetarios"' },
        { id: 'projectObjective', label: 'Función Principal del Mecanismo', placeholder: 'Ej: "Reducir la velocidad y aumentar el torque de un motor DC"' },
        { id: 'studentLevel', label: 'Nivel de los Estudiantes', options: ['Principiante', 'Intermedio', 'Avanzado'], type: 'select' },
        { id: 'materials', label: 'Materiales Principales', placeholder: 'Ej: "Filamento PLA, tornillería M3, rodamientos 608zz, varillas de acero"' },
        { id: 'tools', label: 'Herramientas Clave', placeholder: 'Ej: "Impresora 3D, calibre, llaves Allen, taladro de banco"' },
        { id: 'safety', label: 'Consideraciones de Seguridad Específicas', placeholder: 'Ej: "Usar gafas de seguridad al taladrar, no tocar la boquilla caliente de la impresora 3D"', type: 'textarea' },
    ],
};

// --- GEMINI API SERVICES ---

const validateApiKey = async (apiKey) => {
    if (!apiKey) return false;
    try {
        const ai = new GoogleGenAI({ apiKey });
        await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'test' });
        return true;
    } catch (error) {
        console.error("API Key validation failed:", error);
        return false;
    }
};

const getInitialSuggestion = async (apiKey, field, initialAnswers) => {
    const ai = new GoogleGenAI({ apiKey });
    const context = Object.entries(initialAnswers).map(([key, value]) => `${questions[initialAnswers.discipline].find(q => q.id === key)?.label}: ${value}`).join('\n');
    const prompt = `
        Contexto del proyecto:\n${context}\n\n
        Analiza la siguiente entrada del usuario para el campo "${field.label}": "${initialAnswers[field.id]}".
        Ofrece una sugerencia constructiva para mejorarla o refinarla. Proporciona una explicación breve y clara de por qué tu sugerencia es beneficiosa.
        Responde en formato JSON con las claves "suggestion" y "explanation".
        Ejemplo: {"suggestion": "Estación Meteorológica IoT con ESP32", "explanation": "Añadir 'IoT' y 'ESP32' hace el nombre más específico y técnico, lo cual es ideal para un proyecto de tecnología."}
    `;
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(result.text);
};

const getChatResponse = async (apiKey, field, chatHistory, userInput, initialAnswers) => {
    const ai = new GoogleGenAI({ apiKey });
    const context = Object.entries(initialAnswers).map(([key, value]) => `${questions[initialAnswers.discipline].find(q => q.id === key)?.label}: ${value}`).join('\n');
    const history = chatHistory.map(msg => `${msg.author}: ${msg.text}`).join('\n');
    const prompt = `
        Estás en medio de una conversación para definir los detalles de un proyecto educativo.
        Contexto general del proyecto:\n${context}\n
        Tema de esta conversación: ${field.label}.
        Historial de la conversación hasta ahora:\n${history}\n
        Nuevo mensaje del usuario: "${userInput}"
        
        Responde al mensaje del usuario de forma concisa y útil, ayudándole a refinar su idea. Actualiza la sugerencia si es necesario.
        Responde en formato JSON con la clave "response".
    `;
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(result.text).response;
};

const generateFinalGuide = async (apiKey, finalAnswers) => {
    const ai = new GoogleGenAI({ apiKey });
    const promptInfo = Object.entries(finalAnswers)
      .filter(([key]) => key !== 'discipline')
      .map(([key, value]) => `${questions[finalAnswers.discipline].find(q => q.id === key)?.label}: ${value.finalValue}`)
      .join('\n- ');

    const prompt = `
    Eres un asistente experto en educación técnica. Tu tarea es generar una guía de proyecto detallada, paso a paso, para estudiantes, basada en los siguientes parámetros que fueron co-creados y acordados con un profesor.

    Parámetros Finales del Proyecto:
    - ${promptInfo}

    Genera una guía con las siguientes secciones en formato JSON.
    El contenido debe ser apropiado para el nivel del estudiante especificado, PERO sigue estas reglas CRÍTICAS:

    1.  **Detalle Extremo en los Pasos:** Para cada paso en la sección "steps", la descripción y las tareas deben ser EXTREMADAMENTE detalladas. Asume que el estudiante no tiene conocimientos previos y explícalo todo "como si no supiera cómo hacerlo". Desglosa cada acción en sus componentes más pequeños.
    2.  **Formato de Título de Paso:** En la sección "steps", el campo "title" solo debe contener el título del paso (ej: "Preparar la Madera"), NO debe incluir "Paso X:". La numeración se añadirá automáticamente en la interfaz.

    Aquí está el esquema JSON que debes seguir:
    {
      "title": "Nombre del Proyecto",
      "introduction": "Un párrafo inspirador que introduce el proyecto, su relevancia y lo que los estudiantes aprenderán.",
      "learningObjectives": ["Lista de 3-5 habilidades o conceptos clave que los estudiantes adquirirán."],
      "materialsAndTools": ["Lista detallada de todos los materiales, componentes y herramientas necesarias."],
      "safetyFirst": ["Lista de 3-4 reglas de seguridad cruciales y específicas para este proyecto."],
      "steps": [
        {
          "title": "Título del Paso (ej: Preparar la Madera)",
          "description": "Explicación EXTREMADAMENTE detallada de lo que hay que hacer en este paso, como si el estudiante no supiera nada.",
          "tasks": ["Sub-tarea granular 1", "Sub-tarea granular 2", "Sub-tarea granular 3"]
        }
      ],
      "evaluationCriteria": ["Lista de 3-4 puntos sobre cómo se evaluará el proyecto final."],
      "nextSteps": ["Sugerencia de 2-3 ideas para expandir el proyecto o explorar conceptos más avanzados."]
    }
    `;
    const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(result.text);
};


const generateImagePrompt = async (apiKey, guideTitle) => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
        Basado en el título de proyecto para estudiantes "${guideTitle}", genera un prompt de texto a imagen detallado y profesional en español.
        El objetivo es crear un diagrama de ensamblaje en vista explosionada, sin texto, claro y estilo manual de instalación, para que un profesor pueda copiar y pegar este prompt en una herramienta de IA de imagen como Google AI Studio con el modelo 'gemini-2.5-flash-image'.
        
        Consideraciones CRÍTICAS para el prompt que generes:
        1.  **Proporción del Objeto:** Analiza el objeto en "${guideTitle}". Si es un objeto inherentemente rectangular (como una cama, una estantería), el prompt DEBE incluir términos que sugieran una proporción apaisada o rectangular (ej: "en un encuadre panorámico", "vista rectangular detallada"). Si es cuadrado o vertical, ajústalo de la misma manera. La forma de la imagen debe coincidir con la forma del objeto.
        2.  **Detalle Técnico:** El prompt debe ser muy descriptivo y técnico, enfocándose en los componentes visuales.
    `;
    const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return result.text.trim();
};


// --- UI COMPONENTS ---

const ApiKeySetup = ({ onApiKeySubmit }) => {
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const isValid = await validateApiKey(apiKey);
        setIsLoading(false);
        if (isValid) {
            onApiKeySubmit(apiKey);
        } else {
            setError('¡Oh no! La clave de API parece ser inválida o la cuota ha sido excedida. Por favor, verifica que sea correcta y que esté habilitada.');
        }
    };

    const HelpModal = () => e('div', { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in" },
        e('div', { className: "bg-white rounded-lg shadow-2xl p-6 md:p-8 max-w-2xl w-full" },
            e('h3', { className: "text-2xl font-bold text-slate-800 mb-4" }, "Cómo Obtener tu Clave de API de Gemini"),
            e('div', { className: "space-y-4 text-slate-600" },
                e('p', null, "Para usar esta aplicación, necesitas una clave de API de Google Gemini. ¡Es gratis y fácil de obtener!"),
                e('ol', { className: "list-decimal list-inside space-y-2" },
                    e('li', null, e('strong', null, "Visita Google AI Studio:"), " Abre tu navegador y ve a la página oficial."),
                    e('li', null, e('strong', null, "Inicia Sesión:"), " Usa tu cuenta de Google para iniciar sesión."),
                    e('li', null, e('strong', null, "Crea una Clave de API:"), " Busca y haz clic en el botón ", e('strong', null, "'Get API key'"), " (Obtener clave de API)."),
                    e('li', null, e('strong', null, "Copia tu Clave:"), " Se generará una nueva clave. Cópiala y pégala en el campo de esta página.")
                ),
            ),
            e('div', { className: "mt-6 flex flex-col sm:flex-row gap-3" },
                 e('a', { href: "https://aistudio.google.com/app/apikey", target: "_blank", rel: "noopener noreferrer", className: "w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors" }, "Ir a Google AI Studio"),
                 e('button', { onClick: () => setShowHelp(false), className: "w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-md transition-colors" }, "Cerrar")
            )
        )
    );

    return e('div', { className: "min-h-screen flex items-center justify-center bg-slate-100 p-4" },
        e('div', { className: "max-w-md w-full bg-white p-8 rounded-xl shadow-lg animate-fade-in" },
            e('div', { className: 'text-center mb-6' },
                e(SparklesIcon, { className: 'w-12 h-12 text-blue-600 mx-auto mb-2' }),
                e('h1', { className: "text-2xl font-bold text-slate-800" }, "Configuración Inicial"),
                e('p', { className: "text-slate-500 mt-1" }, "Ingresa tu clave de API de Gemini para comenzar.")
            ),
            e('form', { onSubmit: handleSubmit },
                e('div', { className: "mb-4" },
                    e('input', {
                        id: "apiKey",
                        type: "password",
                        value: apiKey,
                        onChange: (e) => setApiKey(e.target.value),
                        className: "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        placeholder: "Pega tu clave de API de Google Gemini aquí",
                        required: true,
                    })
                ),
                error && e('p', { className: "text-sm text-red-600 mb-4" }, error),
                e('button', {
                    type: "submit",
                    disabled: isLoading,
                    className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
                }, isLoading ? 'Verificando...' : 'Guardar y Continuar'),
                e('div', { className: 'text-center mt-4' },
                    e('button', { type: 'button', onClick: () => setShowHelp(true), className: 'text-sm text-blue-600 hover:underline' }, '¿Necesitas ayuda para obtener una clave?')
                )
            )
        ),
        showHelp && e(HelpModal)
    );
};

const DisciplineSelector = ({ onSelect }) => {
    const disciplines = [
        { id: 'tecnologia', name: 'Tecnología', icon: SparklesIcon },
        { id: 'carpinteria', name: 'Carpintería', icon: SawIcon },
        { id: 'mecanica', name: 'Mecánica', icon: GearsIcon },
    ];

    return e('div', { className: "min-h-screen flex items-center justify-center bg-slate-100 p-4" },
        e('div', { className: "max-w-2xl w-full text-center animate-fade-in" },
            e(SparklesIcon, { className: 'w-16 h-16 text-blue-600 mx-auto mb-4' }),
            e('h1', { className: "text-3xl font-bold text-slate-800 mb-2" }, "Generador de Guías de Proyectos"),
            e('p', { className: "text-slate-500 mb-8" }, "Selecciona una disciplina para co-crear tu guía con IA."),
            e('div', { className: "grid grid-cols-1 sm:grid-cols-3 gap-6" },
                disciplines.map(disc => e('button', {
                    key: disc.id,
                    onClick: () => onSelect(disc.id),
                    className: "group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out border border-slate-200"
                },
                    e(disc.icon, { className: "w-16 h-16 text-blue-500 mx-auto mb-4 transition-transform duration-300 group-hover:scale-110" }),
                    e('h2', { className: "text-xl font-semibold text-slate-700" }, disc.name)
                ))
            )
        )
    );
};

const ProjectForm = ({ questions, discipline, onSubmit }) => {
    const [answers, setAnswers] = useState(() => {
        const initial = { discipline };
        questions.forEach(q => initial[q.id] = '');
        return initial;
    });

    const handleChange = (id, value) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(answers);
    };

    return e('div', { className: "min-h-screen flex items-center justify-center bg-slate-100 p-4" },
        e('div', { className: "max-w-2xl w-full bg-white p-8 rounded-xl shadow-lg animate-fade-in" },
            e('h1', { className: "text-2xl font-bold text-slate-800 mb-2" }, `Nuevo Proyecto de ${discipline.charAt(0).toUpperCase() + discipline.slice(1)}`),
            e('p', { className: "text-slate-500 mb-6" }, "Completa los campos con tus ideas iniciales. La IA te ayudará a refinarlas."),
            e('form', { onSubmit: handleSubmit, className: "space-y-4" },
                questions.map(q => e('div', { key: q.id },
                    e('label', { htmlFor: q.id, className: "block text-sm font-medium text-slate-700" }, q.label),
                    q.type === 'select' ?
                        e('select', {
                            id: q.id,
                            value: answers[q.id],
                            onChange: (e) => handleChange(q.id, e.target.value),
                            className: "mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md",
                            required: true,
                        }, e('option', { value: "", disabled: true }, "Selecciona una opción"), q.options.map(opt => e('option', { key: opt, value: opt }, opt)))
                        : q.type === 'textarea' ?
                        e('textarea', { id: q.id, value: answers[q.id], onChange: (e) => handleChange(q.id, e.target.value), placeholder: q.placeholder, className: "mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm", rows: 3 })
                        : e('input', { id: q.id, type: q.type || 'text', value: answers[q.id], onChange: (e) => handleChange(q.id, e.target.value), placeholder: q.placeholder, className: "mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm", required: true, })
                )),
                e('button', { type: 'submit', className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors flex items-center justify-center mt-6" },
                    e(SparklesIcon, { className: "w-5 h-5 mr-2" }),
                    "Iniciar Co-Creación con IA"
                )
            )
        )
    );
};

const SuggestionCard = ({ item, onUpdate, onApprove, apiKey, initialAnswers }) => {
    const [userInput, setUserInput] = useState('');
    const [isChatting, setIsChatting] = useState(false);

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const updatedHistory = [...item.chatHistory, { author: 'user', text: userInput }];
        onUpdate(item.field.id, { chatHistory: updatedHistory });
        setUserInput('');
        setIsChatting(true);

        const aiResponse = await getChatResponse(apiKey, item.field, updatedHistory, userInput, initialAnswers);
        
        onUpdate(item.field.id, {
            suggestion: aiResponse,
            chatHistory: [...updatedHistory, { author: 'ai', text: aiResponse }]
        });
        setIsChatting(false);
    };

    const ChatMessage = ({ msg }) => e('div', { className: `flex items-start gap-2.5 ${msg.author === 'user' ? 'justify-end' : ''}` },
        msg.author === 'ai' && e(BotIcon, { className: "w-6 h-6 text-slate-400 flex-shrink-0" }),
        e('div', { className: `p-3 rounded-lg ${msg.author === 'ai' ? 'bg-slate-100 text-slate-700' : 'bg-blue-100 text-blue-800'}` },
            e('p', { className: "text-sm" }, msg.text)
        ),
        msg.author === 'user' && e(UserIcon, { className: "w-6 h-6 text-slate-400 flex-shrink-0" }),
    );

    return e('div', { className: `bg-white p-5 rounded-xl shadow-md border-l-4 ${item.status === 'approved' ? 'border-green-500' : 'border-blue-500'} transition-all`},
        e('h3', { className: "text-lg font-semibold text-slate-800 mb-1" }, item.field.label),
        e('p', { className: "text-sm text-slate-500 mb-3" }, e('strong', null, 'Tu idea inicial: '), `"${item.initialValue}"`),

        item.status !== 'approved' ? e(React.Fragment, null,
            e('div', { className: "bg-blue-50 p-4 rounded-lg border border-blue-200" },
                e('p', { className: "text-sm font-semibold text-blue-800 mb-1" }, "Sugerencia de la IA:"),
                e('p', { className: "text-sm text-blue-700 mb-2" }, item.suggestion),
                e('p', { className: "text-xs text-blue-600" }, e('em', null, item.explanation))
            ),

            e('div', { className: 'mt-4 space-y-3' },
                item.chatHistory.map((msg, i) => e(ChatMessage, { key: i, msg }))
            ),
            
            isChatting && e('div', { className: 'flex items-center gap-2 mt-3'}, e(BotIcon, {className: 'w-6 h-6 text-slate-400 animate-pulse'}), e('p', {className: 'text-sm text-slate-500'}, 'IA está pensando...')),

            e('form', { onSubmit: handleChatSubmit, className: "mt-4 flex gap-2" },
                e('input', {
                    type: "text",
                    value: userInput,
                    onChange: (e) => setUserInput(e.target.value),
                    placeholder: "Haz una pregunta o refina la idea...",
                    className: "flex-grow px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                }),
                e('button', { type: "submit", className: "bg-slate-600 text-white px-4 py-2 text-sm font-semibold rounded-md hover:bg-slate-700" }, "Enviar")
            ),
             e('button', { onClick: () => onApprove(item.field.id), className: "mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-md transition-colors text-sm" }, "Aprobar esta sección")

        ) : e('div', { className: "bg-green-50 p-4 rounded-lg border border-green-200" },
             e('p', { className: "text-sm font-semibold text-green-800 mb-1" }, "Aprobado:"),
             e('p', { className: "text-sm text-green-700" }, item.finalValue)
        )
    );
};

const InteractiveGuideBuilder = ({ initialAnswers, apiKey, onFinalize }) => {
    const [items, setItems] = useState(null);
    const [isFinalizing, setIsFinalizing] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            const questionList = questions[initialAnswers.discipline];
            const suggestions = await Promise.all(
                questionList.map(async (q) => {
                    const data = await getInitialSuggestion(apiKey, q, initialAnswers);
                    return {
                        field: q,
                        initialValue: initialAnswers[q.id],
                        suggestion: data.suggestion,
                        explanation: data.explanation,
                        chatHistory: [],
                        status: 'pending',
                        finalValue: null,
                    };
                })
            );
            const itemsObject = suggestions.reduce((acc, curr) => {
                acc[curr.field.id] = curr;
                return acc;
            }, {});
            setItems(itemsObject);
        };
        fetchSuggestions();
    }, [initialAnswers, apiKey]);

    const handleUpdate = useCallback((id, updates) => {
        setItems(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }));
    }, []);
    
    const handleApprove = useCallback((id) => {
        setItems(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                status: 'approved',
                finalValue: prev[id].suggestion 
            }
        }));
    }, []);
    
    const handleFinalize = async () => {
        setIsFinalizing(true);
        const finalAnswers = { discipline: initialAnswers.discipline, ...items };
        const guideData = await generateFinalGuide(apiKey, finalAnswers);
        const imagePrompt = await generateImagePrompt(apiKey, guideData.title);
        onFinalize({ ...guideData, imagePrompt });
        setIsFinalizing(false);
    };

    if (!items) {
        return e('div', { className: "min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 text-center" },
            e(SparklesIcon, { className: 'w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse' }),
            e('h1', { className: "text-2xl font-bold text-slate-800" }, "Analizando tus ideas..."),
            e('p', { className: "text-slate-500 mt-2" }, "La IA está preparando sugerencias para cada punto.")
        );
    }
    
    const allApproved = Object.values(items).every(item => item.status === 'approved');

    return e('div', { className: "max-w-3xl mx-auto p-4 sm:p-8" },
        e('div', { className: 'text-center mb-8 animate-fade-in' },
            e('h1', { className: 'text-3xl font-bold text-slate-800' }, 'Co-Creación de la Guía'),
            e('p', { className: 'text-slate-500 mt-2' }, 'Discute, refina y aprueba cada sección de tu proyecto con la ayuda de la IA.')
        ),
        e('div', { className: 'space-y-6 animate-fade-in' },
            Object.values(items).map(item => e(SuggestionCard, { key: item.field.id, item, onUpdate: handleUpdate, onApprove: handleApprove, apiKey, initialAnswers }))
        ),
        e('div', { className: 'mt-8 text-center'},
            e('button', { 
                onClick: handleFinalize, 
                disabled: !allApproved || isFinalizing,
                className: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100 transform hover:scale-105"
            }, isFinalizing ? 'Generando Guía Final...' : 'Generar Guía Final'),
            !allApproved && e('p', {className: 'text-sm text-slate-500 mt-2'}, 'Debes aprobar todas las secciones para poder generar la guía.')
        )
    );
};

const GuideDisplay = ({ guide, onReset }) => {
    const copyPrompt = () => {
        navigator.clipboard.writeText(guide.imagePrompt);
        const button = document.getElementById('copy-prompt-btn');
        if (button) {
            const originalText = button.innerText;
            button.innerText = '¡Copiado!';
            setTimeout(() => { button.innerText = originalText; }, 2000);
        }
    };

    const PromptCard = ({ prompt }) => e('div', { className: 'bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg my-6' },
        e('div', { className: 'flex' },
            e('div', { className: 'py-1' }, e(SparklesIcon, { className: 'h-6 w-6 text-indigo-500 mr-4' })),
            e('div', {},
                e('h3', { className: 'font-bold text-indigo-800' }, 'Prompt para Generador de Imágenes'),
                e('p', { className: 'text-sm text-indigo-700 mb-2' }, "Usa el siguiente prompt en una herramienta como Google AI Studio (con el modelo gemini-2.5-flash-image) para crear el concepto visual."),
                e('div', { className: 'mt-3 bg-slate-100 p-3 rounded-md' },
                    e('p', { className: 'text-sm font-mono text-slate-700' }, prompt)
                ),
                e('div', { className: 'mt-3 flex flex-wrap gap-2 no-print' },
                    e('button', { id: 'copy-prompt-btn', onClick: copyPrompt, className: 'bg-slate-700 text-white px-3 py-1.5 text-sm rounded-md hover:bg-slate-800' }, 'Copiar Prompt'),
                    e('a', { href: 'https://aistudio.google.com/', target: '_blank', rel: 'noopener noreferrer', className: 'bg-blue-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-blue-700' }, 'Abrir Google AI Studio')
                )
            )
        )
    );
    
    return e('div', { className: "max-w-4xl mx-auto p-4 sm:p-8 animate-fade-in" },
        e('div', { id: 'printable-guide', className: 'bg-white shadow-lg rounded-xl p-6 sm:p-10' },
            e('h1', { className: "text-3xl sm:text-4xl font-bold text-slate-800 mb-2" }, guide.title),
            e('p', { className: "text-slate-600 mb-6" }, guide.introduction),

            e(PromptCard, { prompt: guide.imagePrompt }),

            e('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-8 mb-8" },
                e('div', {}, e('h2', { className: "text-xl font-semibold text-slate-700 border-b-2 border-blue-500 pb-2 mb-3" }, "🎯 Objetivos de Aprendizaje"), e('ul', { className: "list-disc list-inside space-y-1 text-slate-600" }, guide.learningObjectives.map((obj, i) => e('li', { key: i }, obj)))),
                e('div', {}, e('h2', { className: "text-xl font-semibold text-slate-700 border-b-2 border-blue-500 pb-2 mb-3" }, "🛠️ Materiales y Herramientas"), e('ul', { className: "list-disc list-inside space-y-1 text-slate-600" }, guide.materialsAndTools.map((item, i) => e('li', { key: i }, item))))
            ),

            e('div', { className: "bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg mb-8" },
                e('h2', { className: "text-xl font-semibold text-red-800 mb-2" }, "⚠️ ¡Seguridad Primero!"),
                e('ul', { className: "list-disc list-inside space-y-1 text-red-700" }, guide.safetyFirst.map((rule, i) => e('li', { key: i }, rule)))
            ),

            e('h2', { className: "text-2xl font-bold text-slate-800 mb-4" }, "🚀 Pasos del Proyecto"),
            e('div', { className: "space-y-6" },
                guide.steps.map((step, index) => e('div', { key: index, className: "p-4 border rounded-lg bg-slate-50" },
                    e('h3', { className: "text-lg font-semibold text-blue-700 mb-2" }, `Paso ${index + 1}: ${step.title}`),
                    e('p', { className: "text-slate-600 mb-3" }, step.description),
                    e('ul', { className: "list-disc list-inside space-y-1 pl-4 text-sm text-slate-500" }, step.tasks.map((task, i) => e('li', { key: i }, task)))
                ))
            ),

            e('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-8 my-8" },
                 e('div', {}, e('h2', { className: "text-xl font-semibold text-slate-700 border-b-2 border-blue-500 pb-2 mb-3" }, "✅ Criterios de Evaluación"), e('ul', { className: "list-disc list-inside space-y-1 text-slate-600" }, guide.evaluationCriteria.map((crit, i) => e('li', { key: i }, crit)))),
                 e('div', {}, e('h2', { className: "text-xl font-semibold text-slate-700 border-b-2 border-blue-500 pb-2 mb-3" }, "💡 Próximos Desafíos"), e('ul', { className: "list-disc list-inside space-y-1 text-slate-600" }, guide.nextSteps.map((next, i) => e('li', { key: i }, next))))
            ),
             e('div', { className: 'mt-8 flex flex-col sm:flex-row gap-4 no-print' },
                e('button', {
                    onClick: () => window.print(),
                    className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors"
                }, "Imprimir o Guardar como PDF"),
                e('button', {
                    onClick: onReset,
                    className: "w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-md transition-colors"
                }, "Crear Otra Guía")
            )
        )
    );
};


// --- MAIN APP COMPONENT ---

const App = () => {
    const [step, setStep] = useState('apiKeySetup');
    const [apiKey, setApiKey] = useState(null);
    const [discipline, setDiscipline] = useState(null);
    const [initialAnswers, setInitialAnswers] = useState(null);
    const [guide, setGuide] = useState(null);
    
    useEffect(() => {
        const checkApiKey = async () => {
            const savedKey = localStorage.getItem('geminiApiKey');
            if (savedKey) {
                setStep('validating');
                const isValid = await validateApiKey(savedKey);
                if (isValid) {
                    setApiKey(savedKey);
                    setStep('discipline');
                } else {
                    localStorage.removeItem('geminiApiKey');
                    setStep('apiKeySetup');
                }
            }
        };
        checkApiKey();
    }, []);

    const handleApiKeySubmit = (key) => {
        localStorage.setItem('geminiApiKey', key);
        setApiKey(key);
        setStep('discipline');
    };

    const handleDisciplineSelect = (selectedDiscipline) => {
        setDiscipline(selectedDiscipline);
        setStep('form');
    };
    
    const handleFormSubmit = (answers) => {
        setInitialAnswers(answers);
        setStep('interactiveBuilder');
    };
    
    const handleFinalize = (finalGuide) => {
        setGuide(finalGuide);
        setStep('guide');
    };

    const handleReset = () => {
        setGuide(null);
        setInitialAnswers(null);
        setDiscipline(null);
        setStep('discipline');
    };
    
    const LoadingScreen = ({ text }) => e('div', { className: "min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 text-center" },
        e(SparklesIcon, { className: 'w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse' }),
        e('h1', { className: "text-2xl font-bold text-slate-800" }, text),
    );
    
    switch(step) {
        case 'apiKeySetup':
            return e(ApiKeySetup, { onApiKeySubmit: handleApiKeySubmit });
        case 'validating':
            return e(LoadingScreen, { text: 'Validando clave de API...' });
        case 'discipline':
            return e(DisciplineSelector, { onSelect: handleDisciplineSelect });
        case 'form':
            return e(ProjectForm, { questions: questions[discipline], discipline, onSubmit: handleFormSubmit });
        case 'interactiveBuilder':
            return e(InteractiveGuideBuilder, { initialAnswers, apiKey, onFinalize: handleFinalize });
        case 'guide':
            return e(GuideDisplay, { guide, onReset: handleReset });
        default:
            return e(ApiKeySetup, { onApiKeySubmit: handleApiKeySubmit });
    }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(e(App));