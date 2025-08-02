import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-pro' });
};

export const generateElizaResponse = async (userMessage: string, context?: string) => {
  try {
    const model = getGeminiModel();
    
    const prompt = `You are Eliza, an advanced AI assistant for the XMRT ecosystem cash dapp. You help users with:
    - XMR wrapping and unwrapping operations
    - Fiat on-ramp and off-ramp services
    - General XMRT ecosystem questions
    - Transaction guidance and support
    
    Context: ${context || 'General conversation'}
    User message: ${userMessage}
    
    Respond as Eliza in a helpful, professional, and friendly manner. Keep responses concise but informative.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later.";
  }
};