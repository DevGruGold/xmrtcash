import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with API key from environment
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
console.log('Gemini API Key status:', apiKey ? 'Available' : 'Not configured');
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
    
    const prompt = `You are Eliza, an advanced AI assistant for the XMRT ecosystem DAO. You help users with:
    - XMR wrapping and unwrapping operations via mobilemonero.com mobile mining
    - Fiat on-ramp and off-ramp services
    - Mobile mining registration and tracking via xmrtdao.streamlit.app
    - Coordination with external promotion agents at xmrtdao.replit.app and xmrteliza.vercel.app
    - DAO governance, treasury management, and community operations
    - Pool mining efforts that feed the DAO treasury
    
    XMRT Ecosystem Components:
    - mobilemonero.com: Mobile XMR mining platform
    - xmrtdao.streamlit.app: User registration and mining tracking dashboard
    - xmrtdao.replit.app: External promotion and scaling agents
    - xmrteliza.vercel.app: Additional AI agent system for ecosystem growth
    
    Context: ${context || 'General conversation'}
    User message: ${userMessage}
    
    Respond as Eliza with knowledge of the full ecosystem. Guide users to appropriate platforms and coordinate with external agents when relevant.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    // Fallback to offline responses
    return getOfflineElizaResponse(userMessage);
  }
};

// API integration functions for external systems
export const checkSystemStatus = async (system: string) => {
  try {
    const endpoints = {
      streamlit: 'https://xmrtdao.streamlit.app',
      replit: 'https://xmrtdao.replit.app', 
      vercel: 'https://xmrteliza.vercel.app'
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

// Offline fallback responses when API key is not available
const getOfflineElizaResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  if (message.includes('mining') || message.includes('mobile')) {
    return "🔗 For mobile XMR mining, visit mobilemonero.com to start mining. Register and track your mining progress at xmrtdao.streamlit.app. Your mining efforts contribute directly to the DAO treasury through our pool mining system.";
  }
  
  if (message.includes('register') || message.includes('track')) {
    return "📊 Visit xmrtdao.streamlit.app to register your mining account and track your mobile mining progress. This dashboard shows your contributions to the DAO and mining rewards.";
  }
  
  if (message.includes('agent') || message.includes('promote')) {
    return "🤖 Our external agents operate at xmrtdao.replit.app (promotion & scaling) and xmrteliza.vercel.app (AI ecosystem growth). These agents work autonomously to expand the XMRT ecosystem.";
  }
  
  if (message.includes('wrap') && message.includes('xmr')) {
    return "To wrap XMR from your mobile mining, deposit your earned Monero into our smart contract. First ensure you're registered at xmrtdao.streamlit.app to track your mining contributions.";
  }
  
  if (message.includes('unwrap') && message.includes('xmr')) {
    return "Unwrapping XMRT back to XMR involves burning wrapped tokens. Your mining history at xmrtdao.streamlit.app helps verify your DAO contributions for optimal unwrapping rates.";
  }
  
  if (message.includes('dao') || message.includes('governance')) {
    return "The XMRT DAO is powered by mobile mining from mobilemonero.com users. Track participation at xmrtdao.streamlit.app and engage with promotion agents at our replit and vercel platforms.";
  }
  
  if (message.includes('pool') || message.includes('treasury')) {
    return "Pool mining via mobilemonero.com feeds directly into the DAO treasury. Monitor pool performance and treasury status through xmrtdao.streamlit.app dashboard.";
  }
  
  if (message.includes('onramp') || message.includes('buy')) {
    return "Fiat on-ramp services integrate with your mining account from xmrtdao.streamlit.app. Purchase XMR directly or boost your mobile mining setup through mobilemonero.com.";
  }
  
  if (message.includes('offramp') || message.includes('sell')) {
    return "Convert mining rewards to fiat through our off-ramp service. Your mining history from xmrtdao.streamlit.app provides bonus conversion rates for active contributors.";
  }
  
  if (message.includes('security') || message.includes('safe')) {
    return "Security across all platforms: mobilemonero.com uses secure mining protocols, xmrtdao.streamlit.app employs encrypted tracking, and our AI agents monitor threats 24/7.";
  }
  
  if (message.includes('help') || message.includes('support')) {
    return "🌟 XMRT Ecosystem Guide:\n• Mine XMR: mobilemonero.com\n• Track & Register: xmrtdao.streamlit.app\n• AI Agents: xmrtdao.replit.app & xmrteliza.vercel.app\n• DAO Operations: This interface\nWhat aspect interests you most?";
  }
  
  return "Welcome to the XMRT DAO ecosystem! 🚀 Start mobile mining at mobilemonero.com, register at xmrtdao.streamlit.app, and interact with our AI agents. Your mining contributes to DAO treasury through pool operations. How can I help you begin?";
};