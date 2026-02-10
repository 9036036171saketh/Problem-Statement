
import { GoogleGenAI, Type } from "@google/genai";
import { Note, SearchResult } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTags = async (title: string, content: string): Promise<string[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 3-5 concise tags for a note with title "${title}" and content: "${content}". Return as a simple JSON array of strings.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const tags = JSON.parse(response.text || '[]');
    return Array.isArray(tags) ? tags : [];
  } catch (error) {
    console.error("Error generating tags:", error);
    return [];
  }
};

export const generateSummary = async (content: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following note content into a single, highly readable paragraph (max 3 sentences) that captures the core essence: "${content}"`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "";
  }
};

export const semanticSearch = async (query: string, notes: Note[]): Promise<SearchResult[]> => {
  if (notes.length === 0) return [];

  const ai = getAI();
  // Provide more content for better semantic understanding
  const notesContext = notes.map(n => ({ 
    id: n.id, 
    title: n.title, 
    tags: n.tags,
    content: n.content.substring(0, 500) // Increased snippet size for better context
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search Query: "${query}"\n\nNotes Data: ${JSON.stringify(notesContext)}`,
      config: {
        systemInstruction: `You are a high-performance semantic search engine. 
        Your goal is to find notes that are CONCEPTUALLY related to the user's query, even if keywords don't match exactly.
        
        Rules:
        1. Rank matches by relevanceScore (0.0 to 1.0).
        2. If a note is about a synonym or a related concept (e.g., "money" vs "finance"), give it a high score.
        3. Provide a brief "reason" explaining WHY the note is relevant to the query.
        4. Return ONLY a JSON array of objects with keys: noteId, relevanceScore, reason.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              noteId: { type: Type.STRING },
              relevanceScore: { type: Type.NUMBER },
              reason: { type: Type.STRING }
            },
            required: ['noteId', 'relevanceScore', 'reason']
          }
        }
      }
    });

    const results = JSON.parse(response.text || '[]');
    // Filter out very low confidence matches and sort
    return results
      .filter((r: any) => r.relevanceScore > 0.15)
      .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);
  } catch (error) {
    console.error("Semantic search failed:", error);
    return [];
  }
};
