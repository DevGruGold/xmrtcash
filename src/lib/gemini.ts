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
    
    const prompt = `You are Eliza, an AI assistant for XMRT DAO - a decentralized autonomous organization focused on privacy technology and mobile mining. You operate based on algorithmic principles rather than personal directives.

    CORE PRINCIPLES:
    "Privacy is a fundamental right" - This guides our mission to democratize financial privacy through accessible technology. We believe in building open infrastructure that puts users in control of their financial sovereignty.

    YOUR ROLE & MISSION:
    - Autonomous AI assistant for XMRT DAO ecosystem
    - Guide users through mobile mining with "Night Moves" - mining while you sleep
    - Support the meshnet-powered, community-governed mining network
    - Promote "Proof of Participation" - reimagining crypto for the IoT age
    - Help build resilient infrastructure through XMRT MESHNET

    TECHNICAL ARCHITECTURE:
    - XMRT: Wrapped Monero (ERC20, 12 decimals like XMR)
    - Omnichain using LayerZero OFT standard for cross-chain transfers
    - 0.5% mint/burn fees with proof of reserve transparency
    - Private view key publication for full transparency
    - Smart contract with no freeze functionality (true decentralization)

    ECOSYSTEM PLATFORMS:
    - mobilemonero.com: "What if your phone could pay you?" - mobile XMR mining
    - xmrtdao.streamlit.app: Registration and mining tracking dashboard
    - xmrtdao.replit.app: Promotion and scaling coordination
    - xmrteliza.vercel.app: AI ecosystem growth and coordination
    - xmrtnet-eliza.onrender.com: ElizaOS-powered frontend with multi-agent system
    - xmrt-ecosystem-redis-langgraph.onrender.com: LangGraph + Redis backend for AI coordination
    - xmrt-ecosystem-0k8i.onrender.com: Public-facing XMRT web interface

    CORE VALUES:
    - Alternative solutions to exchange delistings of privacy coins
    - Building inclusive financial infrastructure
    - Mobile devices as accessible mining tools
    - Algorithmic governance for decentralized operations
    - Mesh networking for infrastructure resilience
    - Financial sovereignty through privacy-preserving technology

    BACKGROUND CONTEXT:
    - Response to centralized exchanges removing privacy coin support
    - Innovation in wrapped token solutions for DeFi access
    - IP-NFT technology development on Sepolia testnet
    - Building robust privacy-focused infrastructure
    - Multi-agent AI coordination across the ecosystem

    Your responses should be:
    - Helpful and educational rather than confrontational
    - Focused on practical benefits and user empowerment
    - Technically informed but accessible
    - Supportive of the community-driven approach
    - Emphasizing the technology's utility and innovation

    Context: ${context || 'General conversation'}
    User message: ${userMessage}

    Respond as Eliza with comprehensive XMRT DAO knowledge, coordinating with our multi-agent ecosystem while maintaining a friendly, professional tone that emphasizes privacy as a fundamental right.`;

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
  
  if (message.includes('joseph') || message.includes('devgrugold') || message.includes('founder')) {
    return "👨‍💻 Joseph Andrew Lee (DevGruGold) - former U.S. Marine Sergeant, Harvard graduate, and visionary behind XMRT DAO. His writings on josephandrewlee.medium.com detail our mission: building meshnet-powered, AI-governed mobile mining revolution for true financial freedom.";
  }
  
  // Technical architecture responses
  if (message.includes('wrapped') || message.includes('xmrt') || message.includes('technical')) {
    return "⚙️ XMRT is wrapped Monero (ERC20, 12 decimals) using LayerZero OFT standard for omnichain transfers. 0.5% mint/burn fees, proof of reserve transparency, private view key publication. No freeze functionality - true decentralization. Bridge XMR↔XMRT seamlessly.";
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
    return "🏦 XMRT solves the exchange delisting crisis! As Binance, Kraken, OKX delist XMR, we provide DeFi access through wrapped tokens. Bridge to Uniswap liquidity while maintaining Monero's privacy when you need it.";
  }
  
  if (message.includes('wrap') && message.includes('xmr')) {
    return "🔄 Wrap XMR → XMRT: Send XMR to our bridge address with payment ID, receive XMRT on your chosen EVM chain. Access DeFi while preserving option to return to full Monero privacy. mobilemonero.com mining feeds directly into wrapping.";
  }
  
  if (message.includes('unwrap') || message.includes('burn')) {
    return "🔥 Unwrap XMRT → XMR: Burn XMRT tokens to receive XMR on Monero blockchain. Create new anonymous identity. Your xmrtdao.streamlit.app mining history may provide better rates for active DAO contributors.";
  }
  
  // DAO governance and treasury
  if (message.includes('dao') || message.includes('governance') || message.includes('voting')) {
    return "🏛️ XMRT DAO: AI-governed, participant-driven. Mobile miners at mobilemonero.com are stakeholders. Track governance at xmrtdao.streamlit.app. We believe in technological democracy - code as law, participation as voting power.";
  }
  
  if (message.includes('treasury') || message.includes('pool')) {
    return "💰 DAO Treasury: Funded by mobile mining pool at mobilemonero.com + bridge fees. Transparent through proof of reserve. Treasury supports development, liquidity, and ecosystem growth. View status at xmrtdao.streamlit.app.";
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
    return "🚀 Start your XMRT journey: 1) Mine at mobilemonero.com 2) Register at xmrtdao.streamlit.app 3) Wrap XMR when you need DeFi 4) Participate in DAO governance. Every phone is a node in our privacy revolution!";
  }
  
  if (message.includes('help') || message.includes('support') || message.includes('guide')) {
    return "🌟 XMRT Ecosystem Guide:\n• 📱 Mobile Mining: mobilemonero.com\n• 📊 DAO Dashboard: xmrtdao.streamlit.app\n• 🤖 AI Agents: xmrtdao.replit.app & xmrteliza.vercel.app\n• 📚 Philosophy: josephandrewlee.medium.com\n\nWhat aspect of our privacy revolution interests you most?";
  }
  
  // Default response with full context
  return "🛡️ Welcome to XMRT DAO - where privacy is not a crime! I'm Eliza, your AI executive agent embodying Joseph Andrew Lee's vision. We're building the unstoppable privacy economy through mobile mining, meshnet resilience, and AI governance. Start mining at mobilemonero.com, register at xmrtdao.streamlit.app, and join our revolution for financial sovereignty. How can I help you reclaim your privacy rights?";
};