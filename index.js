import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

//======= questions.ts =======//
const DISCIPLINE_QUESTIONS = {
    technology: [
        {
            title: '1. Conceptualización (El "Qué" y el "Por qué")',
            questions: [
                { id: 'idea', text: '¿Cuál es la idea principal de nuestro proyecto? ¿Qué queremos construir?' },
                { id: 'feature', text: '¿Qué función especial o divertida debería tener?' },
                { id: 'name', text: '¿Qué nombre le pondremos a nuestro proyecto?' },
            ],
        },
        {
            title: '2. Funcionalidad y Mecánica (El "Cómo funcionará")',
            questions: [
                { id: 'movement', text: '¿Cómo se moverá o realizará su acción principal?' },
                { id: 'electronics', text: '¿Qué componentes electrónicos creemos que serán el "cerebro" y los "músculos"?' },
                { id: 'challenge', text: '¿Cuál será el mayor desafío técnico que tendremos que resolver?' },
            ],
        },
        {
            title: '3. Materiales, Estética y Dimensiones (El "Cómo se verá y de qué tamaño será")',
            questions: [
                { id: 'materials', text: '¿Qué materiales principales usaremos para construir la estructura?' },
                { id: 'style', text: '¿Cómo queremos que se vea? ¿Tendrá un estilo futurista, rústico, inspirado en un animal, etc.?' },
                { id: 'size', text: '¿Qué tamaño aproximado tendrá nuestro proyecto? ¿Será algo pequeño que quepa en la mano, del tamaño de una caja de zapatos, o más grande?' },
            ],
        },
        {
            title: '4. Interacción y Control (El "Cómo lo manejaremos")',
            questions: [
                { id: 'control', text: '¿Cómo le daremos órdenes a nuestro proyecto?' },
                { id: 'response', text: '¿Cómo nos responderá el proyecto?' },
            ],
        },
    ],
    carpentry: [
        {
            title: '1. Conceptualización (El "Qué" y el "Por qué")',
            questions: [
                { id: 'idea', text: '¿Cuál es la idea principal de nuestro proyecto? ¿Qué mueble u objeto de madera vamos a construir?' },
                { id: 'purpose', text: '¿Cuál será la función principal de este objeto? ¿Para qué servirá?' },
                { id: 'name', text: '¿Qué nombre le pondremos a nuestro proyecto?' },
            ],
        },
        {
            title: '2. Diseño y Estética (El "Cómo se verá")',
            questions: [
                { id: 'style', text: '¿Qué estilo visual tendrá? (ej. rústico, moderno, minimalista, clásico)' },
                { id: 'wood_type', text: '¿Qué tipo de madera principal planean usar y por qué?' },
                { id: 'finish', text: '¿Qué tipo de acabado le daremos? (ej. barniz, aceite, pintura, natural)' },
            ],
        },
        {
            title: '3. Construcción y Ensamblaje (El "Cómo lo uniremos")',
            questions: [
                { id: 'joinery', text: '¿Qué tipo de uniones o ensambles son los más importantes en su diseño? (ej. cola de milano, caja y espiga, tornillos)' },
                { id: 'challenge', text: '¿Cuál creen que será la parte más difícil o desafiante de cortar o ensamblar?' },
                { id: 'size', text: '¿Cuáles serán las dimensiones aproximadas del proyecto finalizado?' },
            ],
        },
        {
            title: '4. Herramientas y Seguridad',
            questions: [
                { id: 'tools', text: '¿Qué herramientas manuales o eléctricas son esenciales para su proyecto?' },
                { id: 'safety', text: '¿Cuál es la medida de seguridad más importante que deben recordar al trabajar en este proyecto?' },
            ],
        },
    ],
    mechanics: [
        {
            title: '1. Conceptualización (El "Qué" y el "Por qué")',
            questions: [
                { id: 'idea', text: '¿Cuál es la idea principal de nuestro proyecto? ¿Qué máquina o sistema mecánico vamos a construir?' },
                { id: 'principle', text: '¿Qué principio mecánico fundamental demostrará o utilizará? (ej. palanca, engranajes, poleas)' },
                { id: 'name', text: '¿Qué nombre le pondremos a nuestro proyecto?' },
            ],
        },
        {
            title: '2. Funcionalidad y Movimiento (El "Cómo funcionará")',
            questions: [
                { id: 'input_motion', text: '¿Cómo se iniciará el movimiento o se aplicará la fuerza de entrada?' },
                { id: 'output_motion', text: '¿Cuál es el movimiento o la acción de salida que se espera del sistema?' },
                { id: 'transmission', text: '¿Cómo se transmitirá la fuerza o el movimiento desde la entrada hasta la salida?' },
            ],
        },
        {
            title: '3. Diseño y Materiales (La "Estructura")',
            questions: [
                { id: 'materials', text: '¿Qué materiales principales usarán para los componentes clave (ejes, engranajes, estructura)?' },
                { id: 'components', text: '¿Cuáles son los componentes mecánicos más importantes que necesitarán fabricar o conseguir?' },
                { id: 'size', text: '¿Qué tamaño aproximado tendrá el mecanismo o máquina final?' },
            ],
        },
        {
            title: '4. Desafíos y Optimización',
            questions: [
                { id: 'challenge', text: '¿Cuál es el mayor desafío técnico que anticipan? (ej. fricción, alineación, resistencia)' },
                { id: 'optimization', text: '¿Cómo podrían medir si su máquina es "eficiente" o funciona bien?' },
            ],
        },
    ],
};
const DISCIPLINE_DETAILS = {
    technology: {
        title: 'Tecnología',
        description: 'Proyectos con electrónica, programación y robótica.',
        icon: 'BookOpenIcon',
    },
    carpentry: {
        title: 'Carpintería',
        description: 'Proyectos de construcción y diseño en madera.',
        icon: 'SawIcon',
    },
    mechanics: {
        title: 'Mecánica',
        description: 'Proyectos con engranajes, palancas y sistemas de movimiento.',
        icon: 'GearsIcon',
    },
};

//======= geminiService.ts =======//
let ai;
const initializeAi = (apiKey) => {
  try {
    if (!apiKey) {
      throw new Error("La API Key no puede estar vacía.");
    }
    ai = new GoogleGenAI({ apiKey: apiKey });
    return null;
  } catch (e) {
    console.error("Failed to initialize GoogleGenAI:", e);
    return `Error al inicializar la IA. Asegúrate de que tu API Key sea correcta. Detalle: ${e.message}`;
  }
};
const getDesignFeedback = async (studentAnswersString, discipline) => {
  if (!ai) throw new Error("Servicio de IA no inicializado. Llama a initializeAi primero.");
  const model = 'gemini-2.5-flash';
  const systemInstruction = `Eres un mentor experto de IA para un taller de ${discipline}. Tu tarea es revisar el plan de proyecto de un estudiante. Todas tus respuestas DEBEN estar en español.
- Si el plan es claro, consistente y factible, devuelve un array vacío.
- Si hay posibles problemas, contradicciones o áreas de mejora, proporciona comentarios CONCISOS y CONSTRUCTIVOS.
- Formula tus comentarios como sugerencias útiles, no como críticas.
- Cada comentario debe ser un objeto con un "title" (una frase corta y llamativa) y "content" (una explicación de 1 a 2 frases).
- Devuelve un máximo de 3 tarjetas de comentarios. No abrumes al estudiante.`;
  const prompt = `
    Plan de Proyecto del Estudiante (JSON):
    ${studentAnswersString}

    Revisa este plan y proporciona comentarios basados en tus instrucciones.
    Si el plan es bueno, responde con un array JSON vacío: [].
    Si hay sugerencias, responde con un array JSON de objetos de comentarios.
  `;
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
            },
            required: ["title", "content"],
          },
        },
      },
    });
    const jsonText = response.text.trim();
    if (!jsonText) {
      console.warn("Gemini API returned an empty response for feedback, which is expected for good plans.");
      return [];
    }
    try {
      const feedback = JSON.parse(jsonText);
      return feedback;
    } catch (parseError) {
      console.error("Failed to parse JSON response from AI:", jsonText);
      throw new Error(`La IA devolvió una respuesta inesperada. Respuesta recibida: "${jsonText}"`);
    }
  } catch (apiError) {
    console.error("Error getting design feedback from Gemini API:", apiError);
    if (apiError.message && apiError.message.startsWith("La IA devolvió una respuesta inesperada")) {
        throw apiError;
    }
    let userMessage = `Hubo un error al comunicarse con el servicio de IA. Detalle técnico: ${apiError.message}`;
    if (apiError.message && (apiError.message.toLowerCase().includes('api key not valid') || apiError.message.includes('403') || apiError.message.toLowerCase().includes('permission denied'))) {
      userMessage = "La clave de API parece ser inválida. Por favor, verifica que sea correcta y que esté habilitada.";
    }
    throw new Error(userMessage);
  }
};
const generateProjectImage = async (studentAnswersString, discipline) => {
  if (!ai) throw new Error("Servicio de IA no inicializado. Llama a initializeAi primero.");

  const model = 'gemini-2.5-flash-image';
  
  const answers = JSON.parse(studentAnswersString);
  const name = answers.name || `un proyecto de ${discipline}`;
  const idea = answers.idea || 'un dispositivo innovador';
  const style = answers.style || 'un estilo de arte conceptual';
  const materials = answers.materials || 'varios materiales';

  const prompt = `
    Genera un arte conceptual profesional y de alta calidad de un proyecto estudiantil llamado "${name}".
    El proyecto es: ${idea}.
    Tiene una estética de "${style}" y está hecho principalmente de ${materials}.
    La imagen debe ser un boceto de diseño de producto limpio sobre un fondo blanco, destacando sus características clave.
    Tono vibrante, optimista e inspirador.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    });

    if (response.candidates && response.candidates.length > 0 && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64ImageBytes = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${base64ImageBytes}`;
        }
      }
    }
    
    throw new Error("La IA no generó una imagen. La respuesta no contenía datos de imagen.");

  } catch (apiError) {
    console.error("Error generating project image with gemini-2.5-flash-image:", apiError);
    
    if (apiError.message && apiError.message.toLowerCase().includes('billed users')) {
        console.warn('Image generation skipped: API key is not for a billed account.');
        return null;
    }

    let userMessage = `Hubo un error al generar la imagen del proyecto. Detalle técnico: ${apiError.message}`;
    if (apiError.message && (apiError.message.toLowerCase().includes('api key not valid') || apiError.message.includes('403') || apiError.message.toLowerCase().includes('permission denied'))) {
      userMessage = "La clave de API parece ser inválida o no tiene permisos para generar imágenes. Por favor, verifica tu clave en Google AI Studio.";
    } else if (apiError.message && apiError.message.toLowerCase().includes('safety')) {
      userMessage = "La solicitud para generar la imagen fue bloqueada por filtros de seguridad. Intenta reformular la idea o el nombre del proyecto.";
    }
    throw new Error(userMessage);
  }
};
const generateCustomGuide = async (studentAnswersString, conversationHistory, discipline) => {
  if (!ai) throw new Error("Servicio de IA no inicializado. Llama a initializeAi primero.");
  const model = 'gemini-2.5-flash';
  const systemInstruction = `Eres un mentor experto de IA para un taller de ${discipline}.
Tu tarea es generar una guía de proyecto completa y paso a paso para un estudiante.
Se te proporcionarán las respuestas iniciales del estudiante y el historial de la conversación (comentarios y aclaraciones).
Usa esta información para crear una guía personalizada, alentadora y clara.
Toda la guía DEBE estar en español.

**Reglas de Formato de Salida:**
- La guía DEBE estructurarse en las siguientes 5 secciones, en este orden exacto y usando estos títulos exactos con emojis:
  1. 📝 Resumen del Proyecto
  2. 🎨 Concepto Visual: ¿Cómo se verá?
  3. 🛠️ Materiales y Herramientas
  4. ⏰ Plan de Acción Detallado (Fases)
  5. 🗺️ Próximos Pasos y Consejos
- La sección "Concepto Visual" solo debe contener su título. La aplicación insertará la imagen allí.
- En "Materiales y Herramientas", usa viñetas para las listas (ej., "* Componentes Electrónicos:", "* Herramientas:").
- En "Plan de Acción Detallado", divide el proyecto en 3-5 "Fase"s lógicas (ej., "Fase 1: Diseño y Prototipado en Papel").
- Para cada fase, proporciona una lista de pasos concretos y accionables usando viñetas (*).
- Mantén el lenguaje claro, alentador y accesible para un estudiante.
- NO agregues ninguna introducción o conclusión fuera de las 5 secciones. Comienza directamente con "1. 📝 Resumen del Proyecto".`;
  const prompt = `
    Plan de Proyecto del Estudiante (JSON):
    ${studentAnswersString}

    Historial de Conversación:
    ${conversationHistory || 'No se necesitaron comentarios.'}

    Genera la guía del proyecto basada en toda la información proporcionada y siguiendo las reglas de formato de salida con precisión.
  `;
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });
    return response.text;
  } catch (apiError) {
    console.error("Error generating custom guide:", apiError);
    let userMessage = `Hubo un error al generar la guía del proyecto. Detalle técnico: ${apiError.message}`;
    if (apiError.message && (apiError.message.toLowerCase().includes('api key not valid') || apiError.message.includes('403') || apiError.message.toLowerCase().includes('permission denied'))) {
      userMessage = "La clave de API parece ser inválida o no tiene permisos para este modelo. Por favor, verifica tu clave en Google AI Studio.";
    } else if (apiError.message && apiError.message.toLowerCase().includes('safety')) {
      userMessage = "La solicitud para generar la guía fue bloqueada por filtros de seguridad. Intenta reformular tus respuestas.";
    }
    throw new Error(userMessage);
  }
};
const getConsultationResponse = async (originalFeedback, userQuestion, discipline) => {
  if (!ai) throw new Error("Servicio de IA no inicializado. Llama a initializeAi primero.");
  const model = 'gemini-2.5-flash';
  const systemInstruction = `Eres un mentor experto de IA para un taller de ${discipline}.
Tu tarea es responder la pregunta de seguimiento de un estudiante sobre un comentario específico que proporcionaste.
Sé conciso, claro y útil. Tu respuesta debe abordar directamente la pregunta del estudiante en 2-3 frases y DEBE estar en español.`;
  const prompt = `
    Contexto: Este es el comentario original que le diste al estudiante:
    "${originalFeedback}"

    Ahora el estudiante tiene una pregunta de seguimiento sobre este comentario:
    "${userQuestion}"

    Por favor, proporciona una respuesta directa y útil a su pregunta.
  `;
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });
    return response.text;
  } catch (apiError) {
    console.error("Error getting consultation response:", apiError);
    let userMessage = `Hubo un error al obtener una respuesta de la IA. Detalle técnico: ${apiError.message}`;
    if (apiError.message && (apiError.message.toLowerCase().includes('api key not valid') || apiError.message.includes('403') || apiError.message.toLowerCase().includes('permission denied'))) {
      userMessage = "La clave de API parece ser inválida, por lo que no se pudo obtener una respuesta.";
    }
    throw new Error(userMessage);
  }
};

//======= components/icons =======//
const BookOpenIcon = (props) => React.createElement("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("path", { d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" }), React.createElement("path", { d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" }));
const BotIcon = (props) => React.createElement("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("path", { d: "M12 8V4H8" }), React.createElement("rect", { width: "16", height: "12", x: "4", y: "8", rx: "2" }), React.createElement("path", { d: "M2 14h2" }), React.createElement("path", { d: "M20 14h2" }), React.createElement("path", { d: "M15 13v2" }), React.createElement("path", { d: "M9 13v2" }));
const UserIcon = (props) => React.createElement("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }), React.createElement("circle", { cx: "12", cy: "7", r: "4" }));
const SawIcon = (props) => React.createElement("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("path", { d: "m22 8-2.296 2.296-1.091-1.091-2.015 2.015-1.091-1.091-2.015 2.015-1.091-1.091-2.015 2.015-1.091-1.091-2.015 2.015-1.121-1.121L2 16" }), React.createElement("path", { d: "M9 12a3 3 0 1 1-3-3 3 3 0 0 1 3 3Z" }), React.createElement("path", { d: "M11 11 3 21" }), React.createElement("path", { d: "m15.5 6.5 5.5-5.5" }), React.createElement("path", { d: "M22 13a8.84 8.84 0 0 0-3-5.18" }));
const GearsIcon = (props) => React.createElement("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("circle", { cx: "12", cy: "12", r: "3" }), React.createElement("path", { d: "M12 3v3m0 12v3m9-9h-3M6 12H3m7.05-7.05-2.12 2.12M19.07 19.07l-2.12-2.12M7.05 16.95l2.12-2.12M16.95 7.05l-2.12 2.12" }), React.createElement("circle", { cx: "6", cy: "6", r: "3" }), React.createElement("path", { d: "M6 3v3m0 6V9m4.95-4.95-2.12 2.12M11.07 11.07l-2.12-2.12" }), React.createElement("circle", { cx: "18", cy: "18", r: "3" }), React.createElement("path", { d: "M18 15v3m0 6v-3m4.95-4.95-2.12 2.12M23.07 23.07l-2.12-2.12" }));
const KeyIcon = (props) => React.createElement("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("path", { d: "m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" }));

//======= components/ApiKeySetup.tsx =======//
const ApiKeySetup = ({ onSave, error, isLoading }) => {
  const [apiKey, setApiKey] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading || !apiKey.trim()) return;
    onSave(apiKey);
  };
  return React.createElement("div", { className: "min-h-screen bg-slate-100/50 flex flex-col items-center justify-center p-4 animate-fade-in" },
    React.createElement("div", { className: "w-full max-w-lg" },
      React.createElement("div", { className: "bg-white p-8 rounded-2xl shadow-lg border border-slate-200" },
        React.createElement("div", { className: "text-center mb-6" },
          React.createElement("div", { className: "inline-block p-4 bg-sky-100 rounded-full mb-4" },
            React.createElement(KeyIcon, { className: "h-10 w-10 text-sky-600" })
          ),
          React.createElement("h1", { className: "text-3xl font-bold text-slate-900" }, "Configuración Requerida"),
          React.createElement("p", { className: "text-slate-600 mt-2" }, "Para comenzar, por favor introduce tu clave de API de Gemini.")
        ),
        React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" },
          React.createElement("div", null,
            React.createElement("label", { htmlFor: "apiKey", className: "block text-sm font-medium text-slate-700 mb-1" }, "Tu API Key"),
            React.createElement("input", {
              id: "apiKey",
              type: "password",
              value: apiKey,
              onChange: (e) => setApiKey(e.target.value),
              className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 transition",
              placeholder: "Pega tu clave aquí...",
              required: true,
              disabled: isLoading
            })
          ),
          error && React.createElement("div", { className: "bg-red-100 border border-red-300 text-red-800 text-sm p-3 rounded-md" }, error),
          React.createElement("div", { className: "pt-2" },
            React.createElement("button", {
              type: "submit",
              disabled: isLoading || !apiKey.trim(),
              className: "w-full flex justify-center items-center gap-2 px-4 py-3 bg-sky-600 text-white font-semibold rounded-md shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
            },
            isLoading ?
              React.createElement(React.Fragment, null,
                React.createElement("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
                  React.createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                  React.createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                ), "Verificando..."
              ) : 'Guardar y Continuar'
            )
          )
        ),
        React.createElement("div", { className: "mt-6 text-center text-xs text-slate-500" },
          React.createElement("p", null, "Tu clave se guardará en el almacenamiento de tu navegador."),
          React.createElement("a", {
            href: "https://aistudio.google.com/app/apikey",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-sky-600 hover:underline mt-1 inline-block"
          }, "¿No tienes una clave? Consíguela en Google AI Studio \u2192")
        )
      )
    )
  );
};

//======= components/DisciplineSelector.tsx =======//
const ICONS = { BookOpenIcon, SawIcon, GearsIcon };
const DisciplineSelector = ({ onSelectDiscipline }) => {
  return React.createElement("div", { className: "min-h-screen bg-slate-100/50 flex flex-col items-center justify-center p-4 animate-fade-in" },
    React.createElement("header", { className: "text-center mb-10" },
      React.createElement("h1", { className: "text-4xl md:text-5xl font-bold text-slate-900 mb-3" }, "Mentor de Proyectos IA"),
      React.createElement("p", { className: "text-lg text-slate-600 max-w-2xl" }, "Elige una disciplina para comenzar a planificar tu próximo gran proyecto con la ayuda de la IA.")
    ),
    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl" },
      (Object.keys(DISCIPLINE_DETAILS)).map((key) => {
        const details = DISCIPLINE_DETAILS[key];
        const IconComponent = ICONS[details.icon];
        return React.createElement("button", {
            key: key,
            onClick: () => onSelectDiscipline(key),
            className: "group flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg border border-slate-200 hover:border-sky-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-300"
          },
          React.createElement("div", { className: "mb-6 p-5 bg-sky-100 rounded-full group-hover:bg-sky-500 transition-colors duration-300" },
            IconComponent && React.createElement(IconComponent, { className: "h-12 w-12 text-sky-500 group-hover:text-white transition-colors duration-300" })
          ),
          React.createElement("h2", { className: "text-2xl font-bold text-slate-800 mb-2" }, details.title),
          React.createElement("p", { className: "text-slate-500 text-center" }, details.description)
        );
      })
    ),
    React.createElement("footer", { className: "mt-12 text-center text-sm text-slate-500" },
      React.createElement("p", null, "Selecciona una categoría para recibir preguntas guiadas y generar un plan de proyecto completo.")
    )
  );
};

//======= components/ProjectForm.tsx =======//
const ProjectForm = ({ onSubmitAnswers, questions, isLoading }) => {
  const [answers, setAnswers] = useState({});
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading || !allQuestionsAnswered) return;
    onSubmitAnswers(answers);
  };
  const totalQuestions = questions.reduce((acc, category) => acc + category.questions.length, 0);
  const answeredQuestions = Object.values(answers).filter(a => typeof a === 'string' && a.trim() !== '').length;
  const allQuestionsAnswered = totalQuestions === answeredQuestions;
  const isButtonDisabled = isLoading || !allQuestionsAnswered;
  const getButtonContent = () => {
    if (isLoading) {
      return React.createElement(React.Fragment, null,
        React.createElement("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
          React.createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
          React.createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
        ), "Analizando...");
    }
    return 'Enviar Respuestas';
  };
  return React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6 animate-fade-in mt-6" },
    questions.map((category) => React.createElement("div", { key: category.title, className: "p-6 bg-white rounded-lg shadow-sm border border-slate-200" },
      React.createElement("h3", { className: "text-xl font-semibold text-slate-800 mb-5 pb-3 border-b border-slate-200" }, category.title),
      React.createElement("div", { className: "space-y-6" },
        category.questions.map((q) => React.createElement("div", { key: q.id },
          React.createElement("label", { htmlFor: q.id, className: "block text-base font-medium text-slate-700 mb-2" }, q.text),
          React.createElement("textarea", {
            id: q.id,
            name: q.id,
            value: answers[q.id] || '',
            onChange: (e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value })),
            rows: 3,
            className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 transition",
            placeholder: "Escribe la respuesta de tu equipo aquí...",
            required: true,
            disabled: isLoading
          })
        ))
      )
    )),
    React.createElement("div", { className: "pt-4" },
      React.createElement("button", {
        type: "submit",
        disabled: isButtonDisabled,
        className: "w-full flex justify-center items-center gap-2 px-4 py-3 bg-sky-600 text-white font-semibold rounded-md shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
      }, getButtonContent()),
      !allQuestionsAnswered && React.createElement("p", { className: "text-center text-sm text-slate-500 mt-3" }, "Por favor, responde todas las preguntas para continuar.")
    )
  );
};

//======= components/GuideDisplay.tsx =======//
const PrintIcon = (props) => React.createElement("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("polyline", { points: "6 9 6 2 18 2 18 9" }), React.createElement("path", { d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" }), React.createElement("rect", { x: "6", y: "14", width: "12", height: "8" }));
const CheckIcon = (props) => React.createElement("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("path", { d: "M20 6 9 17l-5-5" }));
const renderFormattedText = (text) => {
    const lines = text.split('\n');
    let isList = false;
    const content = lines.map((line, index) => {
      if (line.match(/^\s*\d\.\s*📝/)) return React.createElement("h2", { key: index, className: "text-2xl font-bold text-slate-800 mt-6 mb-4 pb-2 border-b-2 border-sky-200" }, line);
      if (line.match(/^\s*\d\.\s*🎨/)) return null;
      if (line.match(/^\s*\d\.\s*🛠️/)) return React.createElement("h2", { key: index, className: "text-2xl font-bold text-slate-800 mt-6 mb-4 pb-2 border-b-2 border-teal-200" }, line);
      if (line.match(/^\s*\d\.\s*⏰/)) return React.createElement("h2", { key: index, className: "text-2xl font-bold text-slate-800 mt-6 mb-4 pb-2 border-b-2 border-amber-200" }, line);
      if (line.match(/^\s*\d\.\s*🗺️/)) return React.createElement("h2", { key: index, className: "text-2xl font-bold text-slate-800 mt-6 mb-4 pb-2 border-b-2 border-indigo-200" }, line);
      if (line.match(/^\s*Fase \d:/)) return React.createElement("h3", { key: index, className: "text-xl font-semibold text-sky-700 mt-6 mb-3" }, line);
      if (line.match(/^\s*\*\s*\*\*(.*?)\*\*/)) {
        const parts = line.replace(/^\s*\*/, '').trim().split('**');
        return React.createElement("li", { key: index, className: "ml-5 list-disc list-outside mb-2 text-slate-700" }, React.createElement("span", { className: "font-semibold text-slate-800" }, parts[1]), parts.slice(2).join(''));
      }
      if (line.trim().endsWith(':')) {
          isList = true;
          return React.createElement("h4", { key: index, className: "font-semibold text-slate-700 mt-4 mb-2" }, line.replace('*','').trim());
      }
      if (line.match(/^\s*\* /) || (isList && line.trim() !== '')) {
          if (line.trim() === '') {
              isList = false;
              return null;
          }
        return React.createElement("li", { key: index, className: "ml-8 list-disc text-slate-600" }, line.replace(/^\s*\*/, '').trim());
      }
      if (line.trim() === '') {
        isList = false;
        return React.createElement("div", { key: index, className: "h-4" });
      }
      return React.createElement("p", { key: index, className: "text-slate-700 mb-2 leading-relaxed" }, line);
    });
    return content;
};
const ConsultationChat = ({ message, onSendConsultation, inputValue, onInputChange, isConsulting }) => {
  const chatHistoryRef = useRef(null);
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [message.consultations]);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSendConsultation(message.id, inputValue);
  };
  return React.createElement("div", { className: "mt-6 border-t border-slate-200 pt-4" },
    React.createElement("h4", { className: "text-sm font-semibold text-slate-600 mb-3" }, "¿Tienes alguna pregunta sobre esta respuesta?"),
    message.consultations && message.consultations.length > 0 && React.createElement("div", { ref: chatHistoryRef, className: "space-y-3 mb-4 max-h-48 overflow-y-auto pr-2" },
      message.consultations.map((c, i) => React.createElement("div", { key: i, className: `text-sm ${c.sender === 'user' ? 'text-right' : 'text-left'}` },
        React.createElement("div", { className: `inline-block p-2 rounded-lg ${c.sender === 'user' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'}` }, c.text)
      ))
    ),
    React.createElement("form", { onSubmit: handleSubmit, className: "flex items-center gap-2" },
      React.createElement("input", {
        type: "text",
        value: inputValue,
        onChange: (e) => onInputChange(e.target.value),
        placeholder: "Haz una pregunta de seguimiento...",
        className: "flex-grow px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm",
        disabled: isConsulting
      }),
      React.createElement("button", { type: "submit", disabled: isConsulting || !inputValue.trim(), className: "px-4 py-2 bg-sky-600 text-white font-semibold rounded-md shadow-sm hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-sm" }, isConsulting ? '...' : 'Enviar')
    )
  );
};
const ChatMessage = ({ message, onPrint, onToggleAgreement, onSendConsultation, consultationInputs, onConsultationInputChange, isConsulting }) => {
  const isAi = message.sender === 'ai';
  const bubbleClasses = isAi ? 'bg-white border border-slate-200' : 'bg-sky-100/80 text-sky-900';
  const icon = isAi ? React.createElement(BotIcon, { className: "h-8 w-8 text-slate-400 shrink-0" }) : React.createElement(UserIcon, { className: "h-8 w-8 text-sky-600 shrink-0" });
  const renderMessageContent = (msg) => {
    if (msg.type === 'guide') {
      const title = msg.title || "Tu Guía de Proyecto Personalizada";
      return React.createElement("div", { className: "prose prose-slate max-w-none" },
        React.createElement("h1", { className: "text-3xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-slate-300" }, title),
        msg.imageUrl && React.createElement("div", { className: "mb-6" },
          React.createElement("h2", { className: "text-2xl font-bold text-slate-800 mt-6 mb-4 pb-2 border-b-2 border-purple-200" }, "🎨 Concepto Visual: ¿Cómo se verá?"),
          React.createElement("img", { src: msg.imageUrl, alt: "Concepto visual del proyecto", className: "rounded-lg shadow-lg border border-slate-200 w-full" })
        ),
        renderFormattedText(msg.text),
        React.createElement("div", { className: "mt-8 pt-4 border-t border-slate-200" },
          React.createElement("button", { onClick: onPrint, className: "inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors" },
            React.createElement(PrintIcon, { className: "h-5 w-5" }), "Imprimir / Guardar como PDF")
        )
      );
    }
    const textLines = msg.text.split('\n').map((line, index) => {
      if (line.trim() === '') return React.createElement("div", { key: index, className: "h-3" });
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return React.createElement("strong", { key: i }, part.slice(2, -2));
        }
        return part;
      });
      if (line.trim().startsWith('* ')) {
        return React.createElement("li", { key: index, className: "ml-5 list-disc" }, parts.map(p => typeof p === 'string' ? p.replace(/^\s*\*/, '').trim() : p));
      }
      return React.createElement("p", { key: index }, parts);
    });
    if (msg.type === 'feedback') {
      return React.createElement(React.Fragment, null,
        textLines,
        React.createElement("div", { className: "mt-6 pt-4 border-t border-slate-200 flex items-center justify-end" },
          React.createElement("button", {
            onClick: () => onToggleAgreement(msg.id),
            className: `flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105 ${msg.isAgreed ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`
          },
            msg.isAgreed ? React.createElement(React.Fragment, null, React.createElement(CheckIcon, { className: "h-4 w-4" }), " Acordado") : 'Estoy de acuerdo'
          )
        )
      );
    }
    return textLines;
  };
  return React.createElement("div", { className: `flex items-start gap-4 animate-fade-in` },
    icon,
    React.createElement("div", { className: `w-full p-5 rounded-xl shadow-md ${bubbleClasses}` },
      React.createElement("div", { className: "text-slate-800 leading-relaxed" }, renderMessageContent(message)),
      isAi && (message.type === 'feedback' || message.type === 'guide') && React.createElement(ConsultationChat, {
        message: message,
        onSendConsultation: onSendConsultation,
        inputValue: consultationInputs[message.id] || '',
        onInputChange: (value) => onConsultationInputChange(message.id, value),
        isConsulting: isConsulting === message.id
      })
    )
  );
};
const GuideDisplay = ({ messages, isLoading, loadingMessage, error, imageGenerationWarning, ...props }) => {
  return React.createElement("div", { className: "space-y-6" },
    imageGenerationWarning && React.createElement("div", { className: "bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 rounded-md shadow-sm animate-fade-in", role: "alert" },
        React.createElement("p", { className: "font-bold" }, "Nota sobre la imagen"),
        React.createElement("p", null, imageGenerationWarning)
    ),
    messages.map((msg) => React.createElement(ChatMessage, { key: msg.id, message: msg, ...props })),
    isLoading && React.createElement("div", { className: "flex items-start gap-4 animate-fade-in" },
      React.createElement(BotIcon, { className: "h-8 w-8 text-slate-400 shrink-0" }),
      React.createElement("div", { className: "w-full p-4 rounded-xl shadow-sm bg-white border border-slate-200" },
        React.createElement("div", { className: "flex items-center gap-3 text-slate-500" },
          React.createElement("svg", { className: "animate-spin h-5 w-5", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
            React.createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
            React.createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
          ),
          React.createElement("span", null, loadingMessage)
        )
      )
    ),
    error && React.createElement("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg", role: "alert" },
      React.createElement("strong", { className: "font-bold" }, "¡Oh no! "),
      React.createElement("span", { className: "block sm:inline" }, error)
    )
  );
};

//======= App.tsx =======//
const convertGuideToHtml = (message) => {
    if (!message) return '';
    const title = message.title || 'Guía de Proyecto Personalizada';
    const lines = message.text.split('\n');
    let textHtml = '';
    const formatLine = (line) => {
        if (line.match(/^\s*\d\.\s*📝/)) return `<h2>${line}</h2>`;
        if (line.match(/^\s*\d\.\s*🎨/)) return '';
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
const App = () => {
  const [isApiKeyNeeded, setIsApiKeyNeeded] = useState(false);
  const [discipline, setDiscipline] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);
  const [consultationInputs, setConsultationInputs] = useState({});
  const [isConsulting, setIsConsulting] = useState(null);
  const [imageGenerationWarning, setImageGenerationWarning] = useState(null);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    const storedKey = localStorage.getItem('GEMINI_API_KEY');
    if (storedKey) {
      const initError = initializeAi(storedKey);
      if (initError) {
        setError(initError + " Por favor, introduce una clave válida.");
        localStorage.removeItem('GEMINI_API_KEY');
        setIsApiKeyNeeded(true);
      } else {
        setIsApiKeyNeeded(false);
      }
    } else {
      setIsApiKeyNeeded(true);
    }
    setIsLoading(false);
  }, []);
  const handleSaveApiKey = (key) => {
    setIsLoading(true);
    setError(null);
    const initError = initializeAi(key);
    if (initError) {
      setError(initError);
      setIsLoading(false);
    } else {
      localStorage.setItem('GEMINI_API_KEY', key);
      setIsApiKeyNeeded(false);
      setIsLoading(false);
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.type !== 'answer' && !lastMessage.isAgreed) {
            scrollToBottom();
        }
    }
  }, [messages.length]);
  const handleSelectDiscipline = (selectedDiscipline) => {
    setDiscipline(selectedDiscipline);
  };
  const handleSubmitAnswers = useCallback(async (submittedAnswers) => {
    setIsLoading(true);
    setError(null);
    setImageGenerationWarning(null);
    setAnswers(submittedAnswers);
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: "Estas son mis respuestas. ¡Espero tus comentarios!",
      type: 'answer',
    };
    setMessages([userMessage]);
    try {
      setLoadingMessage('Analizando las respuestas...');
      const studentAnswersString = JSON.stringify(submittedAnswers, null, 2);
      const feedbackCards = await getDesignFeedback(studentAnswersString, discipline);
      if (feedbackCards.length === 0) {
        setLoadingMessage('¡Excelente plan! Generando la guía del proyecto...');
        await generateGuide(studentAnswersString);
      } else {
        const feedbackMessages = feedbackCards.map((card, index) => ({
          id: `feedback-${Date.now()}-${index}`,
          sender: 'ai',
          text: `**${card.title}**\n${card.content}`,
          type: 'feedback',
          isAgreed: false,
        }));
        setMessages(prev => [...prev, ...feedbackMessages]);
      }
    } catch (e) {
      setError(e.message || 'Ocurrió un error desconocido.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [discipline]);
  const generateGuide = async (studentAnswersString) => {
      setIsLoading(true);
      setError(null);
      setImageGenerationWarning(null);
      setLoadingMessage('Generando una imagen conceptual del proyecto...');
      try {
        const imageUrl = await generateProjectImage(studentAnswersString, discipline);
        if (imageUrl === null) {
            setImageGenerationWarning("No se pudo generar la imagen porque la API de Imagen requiere una cuenta con facturación habilitada. ¡Pero no te preocupes, aquí está tu guía de texto!");
        }
        
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
        const guideText = await generateCustomGuide(studentAnswersString, conversationHistory, discipline);
        const guideMessage = {
          id: `guide-${Date.now()}`,
          sender: 'ai',
          text: guideText,
          type: 'guide',
          imageUrl: imageUrl, // Will be null if generation was skipped
          title: answers?.name || "Guía de Proyecto Personalizada",
        };
        setMessages(prev => [...prev, guideMessage]);
      } catch (e) {
        setError(e.message || 'Ocurrió un error desconocido.');
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
  };
  const handleToggleAgreement = useCallback((messageId) => {
    setMessages(prevMessages => {
      const updatedMessages = prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, isAgreed: true } : msg
      );
      const feedbackMessages = updatedMessages.filter(msg => msg.type === 'feedback');
      const allAgreed = feedbackMessages.length > 0 && feedbackMessages.every(msg => msg.isAgreed);
      if (allAgreed && answers) {
        const studentAnswersString = JSON.stringify(answers, null, 2);
        setTimeout(() => generateGuide(studentAnswersString), 0);
      }
      return updatedMessages;
    });
  }, [answers, discipline]);
  const handleSendConsultation = async (messageId, question) => {
    if (!question.trim()) return;
    setIsConsulting(messageId);
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const newConsultation = { sender: 'user', text: question };
        return { ...msg, consultations: [...(msg.consultations || []), newConsultation] };
      }
      return msg;
    }));
    setConsultationInputs(prev => ({...prev, [messageId]: ''}));
    try {
      const originalMessage = messages.find(m => m.id === messageId);
      if (originalMessage) {
        const responseText = await getConsultationResponse(originalMessage.text, question, discipline);
        setMessages(prev => prev.map(msg => {
          if (msg.id === messageId) {
            const newConsultation = { sender: 'ai', text: responseText };
            return { ...msg, consultations: [...(msg.consultations || []), newConsultation] };
          }
          return msg;
        }));
      }
    } catch (e) {
      console.error("Consultation error:", e);
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const newConsultation = { sender: 'ai', text: `Lo siento, tuve un error: ${e.message}` };
          return { ...msg, consultations: [...(msg.consultations || []), newConsultation] };
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
  const renderContent = () => {
    if (isLoading && !loadingMessage) {
      return React.createElement("div", { className: "flex justify-center items-center h-screen" },
        React.createElement("svg", { className: "animate-spin h-8 w-8 text-sky-600", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
          React.createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
          React.createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
        )
      );
    }
    if (isApiKeyNeeded) {
        return React.createElement(ApiKeySetup, { onSave: handleSaveApiKey, error: error, isLoading: isLoading });
    }
    if (!discipline) {
      return React.createElement(DisciplineSelector, { onSelectDiscipline: handleSelectDiscipline });
    }
    if (!answers) {
      return React.createElement(ProjectForm, {
        onSubmitAnswers: handleSubmitAnswers,
        questions: DISCIPLINE_QUESTIONS[discipline],
        isLoading: isLoading
      });
    }
    return React.createElement(React.Fragment, null,
      React.createElement(GuideDisplay, {
        messages: messages,
        isLoading: isLoading,
        loadingMessage: loadingMessage,
        error: error,
        imageGenerationWarning: imageGenerationWarning,
        onPrint: handlePrintGuide,
        onToggleAgreement: handleToggleAgreement,
        onSendConsultation: handleSendConsultation,
        consultationInputs: consultationInputs,
        onConsultationInputChange: (id, val) => setConsultationInputs(prev => ({...prev, [id]: val})),
        isConsulting: isConsulting
      }),
      React.createElement("div", { ref: messagesEndRef })
    );
  };
  const MainWrapper = ({ children }) => {
    if (isApiKeyNeeded || !discipline) {
      return React.createElement(React.Fragment, null, children);
    }
    return React.createElement("div", { className: "max-w-4xl mx-auto px-4 py-8 md:py-12" },
      React.createElement("header", { className: "text-center mb-8" },
        React.createElement("div", { className: "flex justify-center items-center gap-4 mb-4" },
          React.createElement(BookOpenIcon, { className: "h-10 w-10 text-sky-600" }),
          React.createElement("h1", { className: "text-4xl font-bold text-slate-900" }, DISCIPLINE_DETAILS[discipline].title)
        ),
        React.createElement("p", { className: "text-lg text-slate-600" }, "Responde a las siguientes preguntas para que el mentor de IA pueda ayudarte a crear una guía de proyecto.")
      ),
      React.createElement("main", null, children)
    );
  };
  return React.createElement(MainWrapper, null, renderContent());
};

//======= index.tsx =======//
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("No se pudo encontrar el elemento 'root' para montar la aplicación.");
  }
  const root = ReactDOM.createRoot(rootElement);
  root.render(React.createElement(React.StrictMode, null, React.createElement(App, null)));
} catch (error) {
  console.error("Error crítico al cargar la aplicación:", error);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 2rem; font-family: sans-serif; background-color: #fee2e2; border-left: 5px solid #ef4444; color: #b91c1c; margin: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Error Crítico al Cargar la Aplicación</h2>
        <p style="margin-bottom: 1rem;">Hubo un problema grave que impidió que la aplicación se iniciara. Esto suele deberse a un error de configuración o a un problema al cargar los módulos de la aplicación.</p>
        <p style="margin-bottom: 0.5rem;"><strong>Mensaje de Error:</strong></p>
        <pre style="white-space: pre-wrap; word-wrap: break-word; background: #fff; padding: 1rem; border-radius: 4px; border: 1px solid #fca5a5; font-family: monospace;">${error.stack || error.message}</pre>
        <p style="margin-top: 1.5rem;">Por favor, revisa la configuración mencionada en el error o abre la consola del desarrollador (presiona F12) para más detalles técnicos.</p>
      </div>
    `;
  }
}