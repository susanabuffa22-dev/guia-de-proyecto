
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const handleError = (error: unknown): never => {
  console.error("Error calling Gemini API:", error);
  if (error instanceof Error) {
      if(error.message.includes('API key not valid')) {
          throw new Error('La clave API no es válida. Por favor, verifica la configuración.');
      }
      if (error instanceof SyntaxError) {
        throw new Error("La IA devolvió una respuesta con formato incorrecto. Por favor, inténtalo de nuevo.");
      }
  }
  throw new Error("No se pudo comunicar con el servicio de IA. Inténtalo de nuevo más tarde.");
}

type FeedbackCard = {
  title: string;
  content: string;
};

const getMentorContext = (discipline: string): { persona: string; context: string } => {
  switch (discipline) {
    case 'carpentry':
      return {
        persona: 'Actúa como un maestro carpintero y mentor experto para un grupo de estudiantes de carpintería.',
        context: 'El proyecto es de carpintería, enfocado en el trabajo con madera, uniones y acabados.'
      };
    case 'mechanics':
      return {
        persona: 'Actúa como un mentor experto en ingeniería mecánica para un grupo de estudiantes.',
        context: 'El proyecto es de mecánica, enfocado en sistemas de movimiento, engranajes, palancas y fuerzas.'
      };
    default: // technology
      return {
        persona: 'Actúa como un mentor de ingeniería experto para un grupo de estudiantes de tecnología.',
        context: 'El proyecto es de tecnología, probablemente involucrando electrónica, programación y robótica.'
      };
  }
}

export const getDesignFeedback = async (studentAnswers: string, discipline: string): Promise<FeedbackCard[]> => {
  const { persona, context } = getMentorContext(discipline);
  const prompt = `
    ${persona} Tu misión es analizar su plan de proyecto y dar retroalimentación constructiva. ${context} Divide tu retroalimentación en tarjetas de sugerencia separadas y concisas.

    Estas son las respuestas de los estudiantes a tus preguntas de diseño:
    ---
    ${studentAnswers}
    ---

    Analiza sus respuestas. Si identificas puntos problemáticos o mejorables, presenta cada uno como un objeto JSON separado dentro de un array. Si el plan es sólido, devuelve un array vacío.

    Cada objeto debe tener:
    - "title": Un título corto para la sugerencia, como 'Punto a Revisar: Complejidad del Movimiento'.
    - "content": La sugerencia detallada y la explicación, usando el formato: "**Sugerencia:** [Tu sugerencia]. **Explicación:** [El porqué de tu sugerencia]."

    Si el plan es excelente y no tienes sugerencias, devuelve un array JSON vacío: [].
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "Un título corto para la sugerencia."
              },
              content: {
                type: Type.STRING,
                description: "La sugerencia y explicación detallada."
              },
            },
            required: ['title', 'content']
          }
        }
      }
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);
    
    if (Array.isArray(parsedResponse)) {
      return parsedResponse;
    }
    
    throw new Error("La respuesta de la IA no tenía el formato de array esperado.");

  } catch (error) {
    handleError(error);
  }
};

export const generateCustomGuide = async (studentAnswers: string, conversationHistory: string, discipline: string): Promise<string> => {
    const { persona } = getMentorContext(discipline);
    const prompt = `
      ${persona} Tu misión es crear una guía de proyecto detallada y personalizada basada en el plan de un grupo de estudiantes.
  
      Usa la siguiente información, que son las respuestas de los estudiantes, para generar la guía:
      ---
      PLAN INICIAL DEL ESTUDIANTE:
      ${studentAnswers}
      ---

      Además de las respuestas iniciales, el equipo ha tenido la siguiente conversación de seguimiento contigo. DEBES tener en cuenta esta conversación para refinar y ajustar la guía final para que refleje los puntos discutidos.
  
      CONVERSACIÓN DE RETROALIMENTACIÓN Y ACLARACIONES:
      ---
      ${conversationHistory}
      ---
  
      La guía DEBE seguir este formato EXACTAMENTE, usando los mismos emojis, títulos y estructura. No añadas ninguna introducción o conclusión fuera de este formato. Rellena cada sección basándote en la información proporcionada por los estudiantes Y la conversación. OMITE la sección "2. 🎨 Concepto Visual" por completo, ya que se manejará por separado.
  
      1. 📝 Resumen del Proyecto y Objetivos de Aprendizaje
      * **¿Qué vamos a construir?** (Descripción basada en sus respuestas y aclaraciones).
      * **¿Qué aprenderemos?** (Infiere 3-4 puntos clave de su plan, relevantes para la disciplina de ${discipline}).
      
      3. 🛠️ Materiales y Herramientas
      * **Materiales Principales:** (Infiere una lista detallada basada en el tipo de proyecto: madera para carpintería, metales/plásticos para mecánica, componentes electrónicos para tecnología).
      * **Consumibles y Piezas Pequeñas:** (Infiere una lista de tornillos, pegamento, cables, etc.).
      * **Herramientas:** (Infiere una lista de herramientas necesarias para la disciplina).
  
      4. ⏰ Tiempo Estimado del Proyecto
      * **Diseño y Planificación:** (Estima un tiempo).
      * **Construcción y Ensamblaje:** (Estima un tiempo).
      * **Programación y Pruebas:** (Si aplica, estima un tiempo. Si no, omite esta línea).
      * **TOTAL:** (Calcula el total).
  
      5. 🗺️ Mapa de Ruta: Construcción Paso a Paso
      (Genera una guía detallada con Fases y Pasos para construir SU diseño específico, refinado por la conversación. Sé creativo y práctico).
      `;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      handleError(error);
    }
  };


  export const generateProjectImage = async (studentAnswers: string, discipline: string): Promise<string> => {
    const { context } = getMentorContext(discipline);
    try {
      const imagePromptGeneratorResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Basado en estas respuestas de estudiantes sobre su proyecto de ${discipline}, crea un prompt conciso y descriptivo en español para un modelo de generación de imágenes. ${context}. El prompt debe sintetizar la idea principal, los materiales y el estilo visual en una sola frase descriptiva.
          
          Respuestas de los estudiantes:
          ---
          ${studentAnswers}
          ---
          
          REQUISITOS DEL PROMPT:
          1.  **Idioma y Ortografía:** El prompt DEBE estar en español perfecto, sin errores gramaticales ni de ortografía.
          2.  **Estilo de Imagen:** El estilo DEBE ser un 'bosquejo de diseño de producto' o 'dibujo técnico conceptual'. La imagen debe ser clara, detallada, sobre un fondo blanco, mostrando el proyecto como un diagrama de producto.
          3.  **Imagen Limpia:** Es CRÍTICO que el prompt instruya al modelo de imagen para que genere una imagen completamente limpia, SIN texto, SIN números, SIN medidas y SIN líneas de acotación. Solo el concepto visual del proyecto.
          
          Ejemplo de prompt de salida: "Un boceto técnico de un robot rústico, hecho de cartón y madera, con ojos LED brillantes y un brazo de pinza, estilo dibujo de concepto sobre fondo blanco."
          
          Genera solo el texto del prompt, sin comillas ni texto introductorio.`,
      });
      const imagePrompt = imagePromptGeneratorResponse.text.trim();
  
      const imageResponse = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: imagePrompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '16:9',
          },
      });
  
      if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
        const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
      } else {
        throw new Error('No se pudo generar la imagen del proyecto.');
      }
    } catch (error) {
      handleError(error);
    }
  };

  export const getConsultationResponse = async (originalMessageText: string, userQuestion: string, discipline: string): Promise<string> => {
    const { persona } = getMentorContext(discipline);
    const prompt = `
      ${persona} A continuación se muestra una respuesta que diste previamente y una pregunta de seguimiento de un estudiante.
  
      Respuesta Anterior:
      ---
      ${originalMessageText}
      ---
  
      Pregunta del Estudiante:
      ---
      ${userQuestion}
      ---
  
      Responde la pregunta del estudiante de manera clara y concisa, ayudándole a entender mejor o a resolver su duda. Sé directo y ve al grano.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      handleError(error);
    }
  };