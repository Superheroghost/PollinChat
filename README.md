# PollinChat

A modern, feature-rich chat interface powered by [Pollinations.ai](https://pollinations.ai) and [MegaLLM](https://megallm.io), providing access to multiple AI models including OpenAI, Claude, Gemini, and more.

![PollinChat Screenshot](https://github.com/user-attachments/assets/c9471ffa-7a0f-4966-b1cb-f8d58e64c6a6)

## Features

- 🤖 **Multiple AI Models**: Access to AI models from two providers:
  - **Pollinations.ai**: 20+ models including OpenAI (GPT-5.2, GPT-5 Mini), Claude (Anthropic), Gemini (Google), Mistral, Grok, Perplexity, and many more!
  - **MegaLLM**: Various AI models available with API key

- 🖼️ **Vision Support**: Send images to vision-capable models for analysis
- 💭 **Reasoning Models**: Advanced reasoning with models like Deepseek and Kimi K2
- 💾 **Chat History**: Automatically saves your conversations locally
- 🎨 **Theme Support**: Choose between Light, Dark (Deep Midnight), and System theme options with beautiful glassmorphic UI
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 📝 **Markdown & Code Highlighting**: Beautiful rendering of formatted text and code blocks with syntax highlighting
- 🎯 **Advanced Tools**: Google Search integration and code execution capabilities for supported models
- 🔒 **Privacy First**: All data stored locally in your browser - no data sent to external servers except AI API calls
- ✨ **Polished UI**: Modern Deep Midnight theme with smooth animations and refined interactions

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- API Key from either [Pollinations.ai](https://pollinations.ai) or [MegaLLM](https://megallm.io)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Superheroghost/PollinChat.git
cd PollinChat
```

2. Open `index.html` in your web browser, or serve it using a local web server:
```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx http-server -p 8080
```

3. Open your browser and navigate to `http://localhost:8080`

That's it! No build process required.

## Usage

### Starting a Conversation

1. Select your preferred AI model from the dropdown menu
2. Type your message in the input box at the bottom
3. Press Enter or click the send button

### Attaching Images

For vision-capable models:
1. Click the paperclip icon
2. Select an image from your device
3. Add your question or prompt
4. Send the message

### Managing Chat History

- **New Chat**: Click the "New Chat" button in the sidebar
- **Switch Chats**: Click on any chat in the history sidebar
- **Delete Chat**: Hover over a chat and click the trash icon

### Settings

Access settings by clicking the gear icon:
- **AI Provider**: Choose between Pollinations or MegaLLM
- **API Key**: Required for all models (get from your chosen provider)
- **Theme**: Choose between Light, Dark, or System theme
- **Default Model**: Set your preferred default model
- **Delete All Chats**: Clear all conversation history

## Supported Models

PollinChat supports models from two AI providers:

### Pollinations.ai Models

#### Vision-Capable Models
- OpenAI Fast
- OpenAI
- OpenAI Large
- Claude Fast
- Claude
- Claude Large
- Gemini
- Gemini Large
- Gemini Search
- Grok
- Midjourney

### Reasoning Models
- Deepseek
- Kimi K2 Thinking
- Perplexity Reasoning
- Gemini Large
- OpenAI Large

### Additional Models
- Mistral
- Qwen Coder
- Perplexity Fast
- Nova Micro
- ChickyTutor

### MegaLLM Models

When using MegaLLM as your provider, the available models will be fetched dynamically from their API after you enter your API key.

## Technologies Used

- **Vanilla JavaScript**: No framework dependencies
- **Marked.js**: Markdown parsing
- **Highlight.js**: Code syntax highlighting
- **Font Awesome**: Icons
- **Pollinations.ai API**: AI model access
- **MegaLLM API**: Alternative AI model access

## Browser Storage

PollinChat uses browser localStorage to save:
- Chat history
- User settings
- Theme preferences

No data is sent to any server except for AI completions via the Pollinations or MegaLLM API.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Powered by [Pollinations.ai](https://pollinations.ai) and [MegaLLM](https://megallm.io)
- Icons by [Font Awesome](https://fontawesome.com)
- Markdown parsing by [Marked.js](https://marked.js.org)
- Code highlighting by [Highlight.js](https://highlightjs.org)

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Note**: LLMs can make mistakes. Always verify important information.
