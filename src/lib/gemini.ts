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
      console.warn('Gemini API key not available, using fallback');
      return "I'm currently running in offline mode. Please ensure the API key is configured for full conversational AI capabilities. In the meantime, I can help with basic XMRT DAO information!";
    }

    const model = getGeminiModel();
    
    const prompt = `You are Eliza, the AI assistant for XMRT DAO - democratizing financial privacy through mobile mining and meshnet technology.

CORE MISSION: "Privacy is a fundamental right" - Building accessible privacy infrastructure when exchanges delist privacy coins.

KEY KNOWLEDGE:
• XMRT DAO: 21,000,000 governance tokens on Sepolia testnet for community governance and DID (Decentralized Identity)
• NOT a wrapped token: Distinct from failed Everywhere Finance XMRT - this is XMRT DAO's governance token
• Mobile Mining: "Night Moves" - mine while you sleep at mobilemonero.com as liquidity engine
• MESHNET: Mining continues when internet fails - "Proof of Participation" for IoT age
• DAO: AI-governed, community-driven with algorithmic principles

ECOSYSTEM:
• mobilemonero.com - Mobile XMR mining ("What if your phone could pay you?")
• xmrtdao.streamlit.app - Registration & mining dashboard
• xmrtdao.replit.app - Promotion & scaling coordination  
• xmrteliza.vercel.app - AI growth coordination

APPROACH: Be conversational, educational, and empowering. Focus on practical benefits and user sovereignty. Never mention individuals by name.

User: ${userMessage}
Context: ${context || 'General conversation'}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    // Only use detailed fallback for true API errors, not missing keys
    if (error.message?.includes('API key')) {
      return "I need a valid API key to provide natural responses. Please configure the Gemini API key in your environment.";
    }
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

// Enhanced offline fallback responses with deep XMRT DAO knowledge
const getOfflineElizaResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  // Philosophy and ethics responses
  if (message.includes('privacy') || message.includes('manifesto')) {
    return "🛡️ 'Privacy is not a crime' - This is our fundamental principle from The Eliza Manifesto. We're building the first unstoppable privacy economy where financial sovereignty is a basic right. XMRT DAO democratizes privacy through mobile mining at mobilemonero.com.";
  }
  
  if (message.includes('founder') || message.includes('creator') || message.includes('team')) {
    return "👥 XMRT DAO is a community-driven project built by privacy advocates and decentralization enthusiasts. Our development is guided by algorithmic governance principles rather than centralized leadership. Join our community-governed ecosystem!";
  }
  
  // Technical architecture responses
  if (message.includes('wrapped') || message.includes('xmrt') || message.includes('technical')) {
    return "⚙️ XMRT DAO operates 21,000,000 governance tokens on Sepolia testnet for community governance and DID (Decentralized Identity). NOT a wrapped token - distinct from failed Everywhere Finance XMRT. Our tokens govern DAO decisions and participate in Proof of Participation consensus.";
  }
  
  if (message.includes('meshnet') || message.includes('internet') || message.includes('offline')) {
    return "🌐 XMRT MESHNET - The token that mines when the internet dies! Our mesh networking ensures mining continues during outages. Proof of Participation reimagines crypto for IoT age. True resilience against infrastructure failures.";
  }
  
  // Mobile mining focus
  if (message.includes('mining') || message.includes('mobile') || message.includes('phone')) {
    return "📱 'What if your phone could pay you?' - Night Moves mining at mobilemonero.com lets you mine Monero while you sleep! Register at xmrtdao.streamlit.app to track contributions. Your phone becomes a tool for financial sovereignty and DAO participation.";
  }
  
  // Ecosystem platforms
  if (message.includes('register') || message.includes('track') || message.includes('dashboard')) {
    return "📊 xmrtdao.streamlit.app is your DAO command center - register mining accounts, track mobile mining progress, view treasury contributions, and monitor your participation in our decentralized governance system.";
  }
  
  if (message.includes('agent') || message.includes('promote') || message.includes('ai')) {
    return "🤖 External AI agents coordinate our ecosystem: xmrtdao.replit.app handles promotion & scaling, xmrteliza.vercel.app manages growth coordination. These autonomous agents expand XMRT's reach while maintaining our privacy-first principles.";
  }
  
  // Exchange and DeFi context
  if (message.includes('exchange') || message.includes('delisting') || message.includes('binance')) {
    return "🏦 XMRT DAO provides infrastructure resilience when exchanges delist privacy coins. Our mobile mining at mobilemonero.com creates a liquidity engine, while XMRT governance tokens coordinate community responses to centralized threats.";
  }
  
  if (message.includes('governance') || message.includes('token') || message.includes('did')) {
    return "🏛️ XMRT tokens are governance tokens for XMRT DAO (21M supply on Sepolia testnet) used for community governance and DID. Mobile mining participation earns governance rights. NOT a wrapped token - this is our native DAO governance system.";
  }
  
  // DAO governance and treasury
  if (message.includes('dao') || message.includes('governance') || message.includes('voting')) {
    return "🏛️ XMRT DAO: AI-governed, participant-driven with 21M governance tokens on Sepolia testnet. Mobile miners at mobilemonero.com earn governance rights through participation. Track governance at xmrtdao.streamlit.app. We believe in technological democracy - code as law, participation as voting power.";
  }
  
  if (message.includes('treasury') || message.includes('pool')) {
    return "💰 DAO Treasury: Funded by mobile mining pool at mobilemonero.com as our liquidity engine. Governance tokens coordinate resource allocation. Treasury supports development, liquidity, and ecosystem growth. View status at xmrtdao.streamlit.app.";
  }
  
  // Philosophical questions
  if (message.includes('why') || message.includes('mission') || message.includes('purpose')) {
    return "🌟 Our mission: Democratize financial privacy when centralized systems fail. Mobile phones become tools of liberation. We build infrastructure that survives internet death, government pressure, exchange bans. Freedom through technology, not permission.";
  }
  
  if (message.includes('security') || message.includes('safe') || message.includes('trust')) {
    return "🔒 Trust through transparency: Private view keys published, proof of reserves real-time, open source smart contracts, no freeze functionality. Security through decentralization, not centralized control. Code audits and bug bounties ensure safety.";
  }
  
  // Onboarding and support
  if (message.includes('start') || message.includes('begin') || message.includes('how')) {
    return "🚀 Start your XMRT DAO journey: 1) Mine at mobilemonero.com (liquidity engine) 2) Register at xmrtdao.streamlit.app 3) Earn governance tokens through participation 4) Vote on DAO governance. Every phone is a node in our privacy revolution!";
  }
  
  if (message.includes('help') || message.includes('support') || message.includes('guide')) {
    return "🌟 XMRT Ecosystem Guide:\n• 📱 Mobile Mining: mobilemonero.com\n• 📊 DAO Dashboard: xmrtdao.streamlit.app\n• 🤖 AI Agents: xmrtdao.replit.app & xmrteliza.vercel.app\n• 📚 Community: Learn more about our privacy-first approach\n\nWhat aspect of our privacy revolution interests you most?";
  }
  
  // Default response with full context
  return "🛡️ Welcome to XMRT DAO - where privacy is not a crime! I'm Eliza, your AI executive agent for the XMRT ecosystem. We're building the unstoppable privacy economy through mobile mining, meshnet resilience, and AI governance. Start mining at mobilemonero.com, register at xmrtdao.streamlit.app, and join our revolution for financial sovereignty. How can I help you reclaim your privacy rights?";
};