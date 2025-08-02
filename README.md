# Eliza AI CashDapp - XMRT Ecosystem

## 🤖 About

Eliza AI CashDapp is an advanced AI-powered decentralized application for the XMRT ecosystem. It provides seamless interaction with Monero (XMR) wrapping/unwrapping, fiat on/off-ramping, and comprehensive cash dapp operations through an intelligent AI assistant.

## ✨ Features

- **🤖 Eliza AI Assistant**: Intelligent conversational AI powered by Google Gemini
- **🔄 XMR Operations**: Wrap and unwrap Monero tokens
- **💰 Fiat Integration**: On-ramp and off-ramp fiat currency operations
- **📱 Mobile Native**: Responsive design with Capacitor support for iOS/Android
- **🌙 Dark/Light Mode**: Adaptive theming with beautiful design system
- **🔒 Secure**: Built with modern security practices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- VITE_GEMINI_API_KEY environment variable for AI functionality

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd eliza-ai-cashdapp

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

For AI functionality, set your Gemini API key:

```bash
# In your deployment environment (Vercel, Netlify, etc.)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **AI**: Google Gemini API integration
- **Mobile**: Capacitor for native iOS/Android apps
- **State Management**: TanStack Query
- **Routing**: React Router v6
- **Build Tool**: Vite for fast development

## 📱 Mobile Development

Build for mobile platforms:

```bash
# Add platforms
npx cap add ios
npx cap add android

# Build and sync
npm run build
npx cap sync

# Open in IDE
npx cap open ios
npx cap open android
```

## 🔧 Key Components

- **Eliza AI Interface**: Conversational AI for user interactions
- **XMR Wrapper**: Smart contract integration for token operations
- **Fiat Gateway**: Secure fiat currency conversion
- **Mobile Optimization**: Touch-friendly responsive design

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variable: `VITE_GEMINI_API_KEY`
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the XMRT Ecosystem. All rights reserved.

## 🆘 Support

- **Documentation**: [XMRT Ecosystem Docs](https://docs.xmrt.dev)
- **Community**: [Discord Server](https://discord.gg/xmrt)
- **Issues**: [GitHub Issues](https://github.com/xmrt-ecosystem/eliza-ai-cashdapp/issues)

---

Built with ❤️ by the XMRT Ecosystem team