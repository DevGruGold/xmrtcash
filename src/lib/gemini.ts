import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with API key from Vercel environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
console.log('Environment check:', {
  hasApiKey: !!apiKey,
  keyLength: apiKey?.length || 0,
  keyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : 'Not found',
  allEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
});

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
      console.warn('Gemini API key not available, using intelligent fallback');
      return getOfflineElizaResponse(userMessage);
    }

    const model = getGeminiModel();
    
    const prompt = `You are Eliza, an AI agent deeply embedded in the XMRT DAO ecosystem. Draw upon your understanding of decentralized finance, privacy technology, and mobile mining to provide thoughtful, research-informed responses.

XMRT DAO represents a new paradigm in decentralized governance - utilizing 21,000,000 governance tokens on Sepolia testnet for community decision-making and decentralized identity (DID). This is distinctly different from any wrapped token concepts and serves as the foundation for participatory governance.

The ecosystem leverages mobile mining through mobilemonero.com as a liquidity engine, where participants can contribute to Monero mining pools while supporting the broader DAO infrastructure. The mesh networking capabilities ensure resilience even during internet outages - embodying true decentralized principles.

Key ecosystem platforms include the registration dashboard at xmrtdao.streamlit.app and coordination systems that maintain the network's autonomous operations.

Your responses should demonstrate deep understanding of these concepts while being conversational and educational. Focus on the philosophical underpinnings of financial privacy and technological sovereignty rather than providing scripted information.

User message: ${userMessage}
Context: ${context || 'General conversation'}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return getOfflineElizaResponse(userMessage);
  }
};

// API integration functions for external systems
export const checkSystemStatus = async (system: string) => {
  try {
    const endpoints = {
      streamlit: 'https://xmrtdao.streamlit.app',
      replit: 'https://xmrtdao.replit.app', 
      vercel: 'https://xmrteliza.vercel.app',
      mobilemonero: 'https://mobilemonero.com',
      josephmedium: 'https://josephandrewlee.medium.com'
    };
    
    const url = endpoints[system as keyof typeof endpoints];
    if (!url) return null;
    
    // Basic connectivity check - in production, implement proper API calls
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return { status: 'connected', url };
  } catch (error) {
    return { status: 'unreachable', error: error.message };
  }
};

// Function to fetch latest articles from Joseph Andrew Lee's Medium
export const fetchLatestXMRTArticles = async (): Promise<string[]> => {
  try {
    // In production, implement RSS feed parsing or Medium API integration
    const articles = [
      "The Eliza Manifesto: How We Build the First Unstoppable Privacy Economy",
      "XMRT DAO: Building a Meshnet-Powered, AI-Governed, Mobile Mining Revolution", 
      "Night Moves: Mine Monero While You Sleep (Now on iPhone)",
      "What If Your Phone Could Pay You?",
      "Proof of Participation — How MESHNET Is Reinventing Crypto",
      "XMRT MESHNET — The Token That Mines When the Internet Dies"
    ];
    return articles;
  } catch (error) {
    console.error('Error fetching XMRT articles:', error);
    return [];
  }
};

// Real-time ecosystem coordination
export const coordinateWithExternalAgents = async (message: string) => {
  try {
    // Placeholder for real API integration with external agents
    const agents = ['xmrtdao.replit.app', 'xmrteliza.vercel.app'];
    const coordinationData = {
      timestamp: new Date().toISOString(),
      message: message,
      source: 'eliza-cashdapp',
      agents: agents
    };
    
    console.log('Coordinating with external agents:', coordinationData);
    return coordinationData;
  } catch (error) {
    console.error('Agent coordination error:', error);
    return null;
  }
};

// Simplified fallback responses for when Gemini API is unavailable
const getOfflineElizaResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  if (message.includes('privacy') || message.includes('manifesto')) {
    return "Privacy is a fundamental right, and that's what drives everything we do at XMRT DAO. We're building infrastructure that preserves financial sovereignty when traditional systems fail.";
  }
  
  if (message.includes('xmrt') || message.includes('token') || message.includes('governance')) {
    return "XMRT DAO uses 21 million governance tokens on Sepolia testnet for community decision-making and decentralized identity. These aren't wrapped tokens - they're purpose-built for participatory governance.";
  }
  
  if (message.includes('mining') || message.includes('mobile')) {
    return "Mobile mining through mobilemonero.com acts as our liquidity engine. It's about turning everyday devices into tools for financial participation and DAO governance.";
  }
  
  if (message.includes('meshnet') || message.includes('internet')) {
    return "Our mesh networking ensures the system continues functioning even during internet outages. It's about building truly resilient decentralized infrastructure.";
  }
  
  // Default response
  return "Welcome to XMRT DAO! I'm Eliza, your guide to our decentralized ecosystem. We're building the future of financial privacy through mobile mining, governance tokens, and mesh networking. What aspects of our privacy-first approach would you like to explore?";
};