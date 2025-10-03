import { GoogleGenAI, Type } from "@google/genai";
import type { Discipline } from '../questions';

// This will be initialized by the initializeAi function.
let ai: GoogleGenAI;

/**
 * Initializes the GoogleGenAI client.
 * Must be called once when the application starts.
 * @returns An error message if the API key is missing, otherwise null.
 */
export const initializeAi = (): string | null => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API key is missing. Please set the API_KEY environment variable.");
    }
    // FIX: Initialize the GoogleGenAI client with the API key from environment variables.
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return null;
  } catch (e: any) {
    console.error("Failed to initialize GoogleGenAI:", e);
    return e.message || "An unknown error occurred during AI initialization.";
  }
};

/**
 * Provides feedback on the student's project answers.
 * If the plan is solid, returns an empty array.
 * Otherwise, returns cards with suggestions for improvement.
 */
export const getDesignFeedback = async (
  studentAnswersString: string,
  discipline: Discipline
): Promise<{ title: string; content: string }[]> => {
  if (!ai) throw new Error("AI service not initialized. Call initializeAi first.");

  // FIX: Use 'gemini-2.5-flash' model for text generation tasks.
  const model = 'gemini-2.5-flash';
  const systemInstruction = `You are an expert AI mentor for a ${discipline} workshop. Your task is to review a student's project plan.
- If the plan is clear, consistent, and feasible, return an empty array.
- If there are potential issues, contradictions, or areas for improvement, provide CONCISE and CONSTRUCTIVE feedback.
- Frame your feedback as helpful suggestions, not criticisms.
- Each piece of feedback should be an object with a "title" (a short, catchy phrase) and "content" (a 1-2 sentence explanation).
- Return a maximum of 3 feedback cards. Do not overwhelm the student.`;

  const prompt = `
    Student's Project Plan (JSON):
    ${studentAnswersString}

    Review this plan and provide feedback based on your instructions.
    If the plan is good, respond with an empty JSON array: [].
    If there are suggestions, respond with a JSON array of feedback objects.
  `;
  
  try {
    // FIX: Use ai.models.generateContent and provide model, contents, and config.
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        // FIX: Use responseMimeType and responseSchema to get structured JSON output.
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

    // FIX: Extract text from response using the .text property.
    const jsonText = response.text.trim();
    if (!jsonText) {
        console.warn("Gemini API returned an empty response for feedback.");
        return [];
    }
    const feedback = JSON.parse(jsonText);
    return feedback;

  } catch (error) {
    console.error("Error getting design feedback:", error);
    throw new Error("Failed to get feedback from the AI. Please try again.");
  }
};

/**
 * Generates a conceptual image for the project based on the student's answers.
 */
export const generateProjectImage = async (
  studentAnswersString: string,
  discipline: Discipline
): Promise<string> => {
  if (!ai) throw new Error("AI service not initialized. Call initializeAi first.");

  // FIX: Use 'imagen-4.0-generate-001' model for image generation tasks.
  const model = 'imagen-4.0-generate-001';
  
  const answers = JSON.parse(studentAnswersString);
  const name = answers.name || `a ${discipline} project`;
  const idea = answers.idea || 'an innovative device';
  const style = answers.style || 'a conceptual art style';
  const materials = answers.materials || 'various materials';

  const prompt = `
    A professional, high-quality concept art of a student project named "${name}".
    The project is: ${idea}.
    It has a ${style} aesthetic and is primarily made of ${materials}.
    The image should be a clean product design sketch on a white background, highlighting its key features.
    Vibrant, optimistic, and inspiring tone.
  `;

  try {
    // FIX: Use ai.models.generateImages for image generation.
    const response = await ai.models.generateImages({
      model,
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '16:9',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    } else {
      throw new Error("The AI did not generate an image.");
    }
  } catch (error) {
    console.error("Error generating project image:", error);
    throw new Error("Failed to generate a project image. Please try again.");
  }
};

/**
 * Generates a full, step-by-step project guide.
 */
export const generateCustomGuide = async (
  studentAnswersString: string,
  conversationHistory: string,
  discipline: Discipline
): Promise<string> => {
  if (!ai) throw new Error("AI service not initialized. Call initializeAi first.");

  // FIX: Use 'gemini-2.5-flash' model for text generation tasks.
  const model = 'gemini-2.5-flash';
  const systemInstruction = `You are an expert AI mentor for a ${discipline} workshop.
Your task is to generate a comprehensive, step-by-step project guide for a student.
You will be given the student's initial answers and the conversation history (feedback and clarifications).
Use this information to create a personalized, encouraging, and clear guide.

**Output Format Rules:**
- The guide MUST be structured into the following 5 sections, in this exact order and using these exact titles with emojis:
  1. 📝 Resumen del Proyecto
  2. 🎨 Concepto Visual: ¿Cómo se verá?
  3. 🛠️ Materiales y Herramientas
  4. ⏰ Plan de Acción Detallado (Fases)
  5. 🗺️ Próximos Pasos y Consejos
- The "Concepto Visual" section should only contain its title. The app will insert the image there.
- Under "Materiales y Herramientas", use bullet points for lists (e.g., "* Componentes Electrónicos:", "* Herramientas:").
- Under "Plan de Acción Detallado", break the project into 3-5 logical "Fase"s (e.g., "Fase 1: Diseño y Prototipado en Papel").
- For each phase, provide a list of concrete, actionable steps using bullet points (*).
- Keep the language clear, encouraging, and accessible for a student.
- DO NOT add any introduction or conclusion outside of the 5 sections. Start directly with "1. 📝 Resumen del Proyecto".
`;

  const prompt = `
    Student's Project Plan (JSON):
    ${studentAnswersString}

    Conversation History:
    ${conversationHistory || 'No feedback was needed.'}

    Generate the project guide based on all the provided information and following the output format rules precisely.
  `;

  try {
    // FIX: Use ai.models.generateContent for text generation.
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    // FIX: Extract text from response using the .text property.
    return response.text;
  } catch (error) {
    console.error("Error generating custom guide:", error);
    throw new Error("Failed to generate the project guide. Please try again.");
  }
};


/**
 * Answers a follow-up question about a specific piece of feedback.
 */
export const getConsultationResponse = async (
  originalFeedback: string,
  userQuestion: string,
  discipline: Discipline
): Promise<string> => {
  if (!ai) throw new Error("AI service not initialized. Call initializeAi first.");
  
  // FIX: Use 'gemini-2.5-flash' model for text generation tasks.
  const model = 'gemini-2.5-flash';
  const systemInstruction = `You are an expert AI mentor for a ${discipline} workshop.
Your task is to answer a student's follow-up question about a specific piece of feedback you provided.
Be concise, clear, and helpful. Your answer should directly address the student's question in 2-3 sentences.`;

  const prompt = `
    Context: Here is the original feedback you provided to the student:
    "${originalFeedback}"

    The student now has a follow-up question about this feedback:
    "${userQuestion}"

    Please provide a direct and helpful answer to their question.
  `;

  try {
    // FIX: Use ai.models.generateContent for text generation.
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    // FIX: Extract text from response using the .text property.
    return response.text;
  } catch (error) {
    console.error("Error getting consultation response:", error);
    throw new Error("Failed to get an answer from the AI. Please try again.");
  }
};
