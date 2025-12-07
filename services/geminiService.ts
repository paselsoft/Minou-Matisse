import { GoogleGenAI } from "@google/genai";
import { Cat, CareLog } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCatAdvice = async (cat: Cat, recentLogs: CareLog[], question: string): Promise<string> => {
  const logsSummary = recentLogs
    .slice(0, 10)
    .map(log => `- ${new Date(log.timestamp).toLocaleDateString()} [${log.type}]: ${log.notes} ${log.value ? `(${log.value})` : ''}`)
    .join('\n');

  const context = `
    Sei un esperto assistente veterinario e comportamentista felino.
    
    Profilo Gatto:
    - Nome: ${cat.name}
    - Razza: ${cat.breed}
    - Età: ${cat.age} anni
    - Peso: ${cat.weight} kg
    - Sesso: ${cat.gender}

    Attività Recenti:
    ${logsSummary}

    Domanda dell'utente: "${question}"

    Rispondi in italiano in modo amichevole, conciso e professionale. Se la situazione sembra grave, consiglia sempre di visitare un veterinario reale.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context,
    });
    return response.text || "Mi dispiace, non sono riuscito a generare una risposta al momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Si è verificato un errore nel contattare l'assistente AI.";
  }
};

export const identifyCatBreedOrIssue = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using flash as it supports multimodal input efficiently
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `Sei un esperto di gatti. ${prompt}. Rispondi in italiano.`
          }
        ]
      }
    });
    return response.text || "Non sono riuscito ad analizzare l'immagine.";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "Errore durante l'analisi dell'immagine.";
  }
};
