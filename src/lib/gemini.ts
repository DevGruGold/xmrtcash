import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with API key from environment
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const getGeminiModel = () => {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }
  return genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash', // Updated to more efficient model
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
    },
  });
};

export const generateElizaResponse = async (userMessage: string, context?: string) => {
  try {
    // Check if API key is configured
    if (!apiKey) {
      return getOfflineElizaResponse(userMessage);
    }

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
    // Fallback to offline responses
    return getOfflineElizaResponse(userMessage);
  }
};

// Offline fallback responses when API key is not available
const getOfflineElizaResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  if (message.includes('wrap') && message.includes('xmr')) {
    return "To wrap XMR, you'll need to deposit your Monero tokens into our smart contract. The wrapped XMRT tokens can then be used across various DeFi protocols. Would you like me to guide you through the wrapping process?";
  }
  
  if (message.includes('unwrap') && message.includes('xmr')) {
    return "Unwrapping XMRT back to XMR involves burning your wrapped tokens and releasing the original Monero. This process typically takes a few minutes to complete. Do you need help with unwrapping?";
  }
  
  if (message.includes('onramp') || message.includes('buy')) {
    return "Our fiat on-ramp service allows you to purchase XMR or XMRT directly with your bank card or wire transfer. We support multiple currencies and payment methods for your convenience.";
  }
  
  if (message.includes('offramp') || message.includes('sell')) {
    return "The off-ramp service lets you convert your XMR or XMRT back to fiat currency. You can receive funds via bank transfer or other supported withdrawal methods.";
  }
  
  if (message.includes('fee') || message.includes('cost')) {
    return "Our platform maintains competitive fees: wrapping/unwrapping fees are typically 0.1-0.3%, while fiat conversion fees vary by payment method and amount. All fees are transparently displayed before confirmation.";
  }
  
  if (message.includes('security') || message.includes('safe')) {
    return "Security is our top priority. We use multi-signature contracts, regular audits, and implement best practices for fund protection. Your assets are secured through battle-tested smart contracts.";
  }
  
  if (message.includes('help') || message.includes('support')) {
    return "I'm here to help with all your XMRT ecosystem needs! You can ask me about wrapping/unwrapping XMR, fiat services, fees, security, or any other questions about our platform.";
  }
  
  return "Welcome to the XMRT ecosystem! I can help you with XMR wrapping, fiat conversion, and general platform questions. What would you like to know about today?";
};