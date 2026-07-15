export interface GeneratedVocabularyData {
  ipa: string;
  meaning: string;
  exampleEn: string;
  exampleVi: string;
}

export const aiApi = {
  generateVocabulary: async (word: string): Promise<GeneratedVocabularyData> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API Key is missing. Please configure VITE_GEMINI_API_KEY in .env file.');
    }

    const prompt = `
      You are an English teacher helping a Vietnamese student.
      I will give you an English word. Please provide the following information in JSON format:
      - ipa: The IPA pronunciation of the word (e.g. "/ɪˈfem.ər.əl/").
      - meaning: The meaning of the word translated into Vietnamese.
      - exampleEn: A simple, natural English example sentence using the word.
      - exampleVi: The Vietnamese translation of the example sentence.

      Only return the raw JSON object, without markdown formatting or code blocks.
      Word: "${word}"
    `;

    const baseUrl = import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent';
    const url = `${baseUrl}?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Gemini API. Please check your API key.');
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response from Gemini API.');
    }

    // Attempt to clean markdown if present (e.g. ```json ... ```)
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(text) as GeneratedVocabularyData;
  },

  generateSentenceTranslation: async (text: string, targetLang: 'en' | 'vi'): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API Key is missing. Please configure VITE_GEMINI_API_KEY in .env file.');
    }

    const instruction = targetLang === 'en' 
      ? 'Translate the following Vietnamese sentence into natural, grammatically correct English.' 
      : 'Translate the following English sentence into natural, grammatically correct Vietnamese.';

    const prompt = `
      ${instruction}
      Only return the translated text without any quotes, markdown formatting, or additional explanations.
      Text to translate: "${text}"
    `;

    const baseUrl = import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent';
    const url = `${baseUrl}?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Gemini API. Please check your API key.');
    }

    const data = await response.json();
    let result = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!result) {
      throw new Error('No response from Gemini API.');
    }

    return result.trim();
  }
};
