# 🤖 JARVIS - AI Chatbot Assistant

<div align="center">

```
     ██╗ █████╗ ██████╗ ██╗   ██╗██╗███████╗
     ██║██╔══██╗██╔══██╗██║   ██║██║██╔════╝
     ██║███████║██████╔╝██║   ██║██║███████╗
██   ██║██╔══██║██╔══██╗╚██╗ ██╔╝██║╚════██║
╚█████╔╝██║  ██║██║  ██║ ╚████╔╝ ██║███████║
 ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝╚══════╝
```

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.1-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/Gemini_AI-2.0-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

**A production-ready AI chatbot interface built with clean architecture principles**

[Live Demo](#) • [Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

JARVIS is a modern, scalable AI chatbot application powered by Google's Gemini 2.0 Flash model. Built with React 19 and designed with clean architecture principles, this project demonstrates production-grade patterns for building AI-powered applications.

**This project showcases:**
- Clean code architecture and separation of concerns
- Modern React patterns (hooks, memo, lazy loading ready)
- Scalable state management
- Accessible and responsive UI design
- Extensible service layer for AI providers

---

## ✨ Features

### Core Functionality
- 🧠 **AI-Powered Conversations** - Leverages Google Gemini 2.0 for intelligent responses
- 💬 **Real-time Chat** - Smooth, responsive chat interface
- ⌨️ **Keyboard Shortcuts** - Enter to send, Shift+Enter for new lines
- 📋 **Copy Messages** - One-click message copying

### User Experience
- 🎨 **Modern UI** - Clean, ChatGPT-inspired interface
- 📱 **Fully Responsive** - Optimized for all screen sizes
- ⏳ **Loading States** - Elegant typing indicators
- 🔔 **Error Handling** - User-friendly error messages with retry options

### Accessibility
- ♿ **ARIA Labels** - Full screen reader support
- ⌨️ **Keyboard Navigation** - Complete keyboard accessibility
- 🎯 **Focus Management** - Proper focus handling
- 🔍 **Semantic HTML** - Meaningful document structure

### Technical Excellence
- 🏗️ **Clean Architecture** - Services, hooks, and components separation
- 🔌 **Pluggable AI Providers** - Easy to swap AI backends
- 📦 **Modular Components** - Reusable, self-contained components
- ⚡ **Performance Optimized** - Memoization and efficient re-renders

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** or **yarn**
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/IronwallxR5/JARVIS--ChatBot.git
   cd JARVIS--ChatBot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Create .env.local file
   echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview  # Preview production build locally
```

---

## 🏗️ Architecture

### Project Structure

```
src/
├── components/           # React UI components
│   ├── Chatbot/         # Main chat container
│   ├── ChatMessage/     # Individual message component
│   ├── ChatInput/       # Input field with send button
│   ├── TypingIndicator/ # Loading animation
│   ├── EmptyState/      # Welcome/error states
│   └── ErrorBanner/     # Error notification
│
├── hooks/               # Custom React hooks
│   ├── useChat.js       # Chat state management
│   ├── useLocalStorage.js # Persistent storage
│   └── useAutoResize.js # Textarea auto-resize
│
├── services/            # Business logic layer
│   ├── aiService.js     # AI provider interface
│   ├── geminiService.js # Gemini implementation
│   └── chatService.js   # Chat operations
│
├── constants/           # App configuration
│   ├── index.js         # App constants
│   └── prompts.js       # AI system prompts
│
├── utils/              # Utility functions
│   └── helpers.js      # Pure helper functions
│
├── styles/             # Global styles
│   ├── variables.css   # CSS custom properties
│   └── App.css         # App layout styles
│
├── App.jsx             # Root component
└── main.jsx            # Entry point
```

### Design Principles

#### 1. Separation of Concerns
- **Components** handle UI rendering only
- **Hooks** manage state and side effects
- **Services** contain business logic
- **Utils** provide pure helper functions

#### 2. Provider Pattern for AI
```javascript
// Easy to swap AI providers
import { GeminiProvider } from './services/geminiService';
// Future: import { OpenAIProvider } from './services/openaiService';

const provider = new GeminiProvider();
const response = await provider.generateResponse(prompt);
```

#### 3. Component Composition
```jsx
<Chatbot>
  <ChatHeader />
  <ErrorBanner />
  <MessageList>
    <ChatMessage />
  </MessageList>
  <TypingIndicator />
  <ChatInput />
</Chatbot>
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key | Yes |

### Customization

#### Modify AI Behavior
Edit `src/constants/prompts.js` to customize the AI personality:

```javascript
export const SYSTEM_PROMPT = `Your custom instructions here...`;
```

#### Add Quick Actions
Edit `src/constants/index.js`:

```javascript
export const QUICK_ACTIONS = [
  { label: '💡 Your Action', prompt: 'Your prompt' },
  // Add more actions...
];
```

---

## 🔌 Extending the Application

### Adding a New AI Provider

1. Create a new service file:
   ```javascript
   // src/services/openaiService.js
   import { AIProvider } from './aiService';
   
   export class OpenAIProvider extends AIProvider {
     async generateResponse(prompt) {
       // Your implementation
     }
     
     isConfigured() {
       return Boolean(this.apiKey);
     }
     
     getName() {
       return 'OpenAI';
     }
   }
   ```

2. Register in the factory:
   ```javascript
   // src/services/aiService.js
   case 'openai':
     const { OpenAIProvider } = await import('./openaiService');
     return new OpenAIProvider(config);
   ```

### Adding New Features

The modular architecture makes it easy to add:
- **New commands** - Extend the constants and handle in services
- **Message reactions** - Add to ChatMessage component
- **Chat history** - Enable in useChat hook options
- **Themes** - Modify CSS variables in `variables.css`

---

## 📊 Performance

### Optimizations Implemented
- **React.memo** on all components to prevent unnecessary re-renders
- **useCallback** for event handlers
- **Efficient state updates** avoiding spreading large arrays
- **CSS animations** using `transform` and `opacity` for GPU acceleration

### Lighthouse Scores (Target)
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

---

## 🧪 Testing (Roadmap)

```bash
# Coming soon
npm run test        # Run unit tests
npm run test:e2e    # Run E2E tests
npm run test:coverage
```

---

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |

---

## 🛣️ Roadmap

### v1.1 (Planned)
- [ ] Dark mode support
- [ ] Chat history persistence
- [ ] Export conversations
- [ ] Voice input support

### v1.2 (Planned)
- [ ] Multi-conversation support
- [ ] Custom AI model selection
- [ ] Plugin system
- [ ] Internationalization (i18n)

### v2.0 (Future)
- [ ] Local LLM support
- [ ] RAG (Retrieval-Augmented Generation)
- [ ] Multi-modal (images, files)
- [ ] Real-time collaboration

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for the AI API
- [React](https://reactjs.org/) for the UI framework
- [Vite](https://vitejs.dev/) for the build tool
- OpenAI's ChatGPT for UI inspiration

---

<div align="center">

**Built with ❤️ by [Padam](https://github.com/IronwallxR5/)**

*If you find this project useful, please consider giving it a ⭐*

</div>
