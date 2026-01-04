# PollinChat

A modern, feature-rich chat interface powered by [Pollinations.ai](https://pollinations.ai), providing access to multiple AI models including OpenAI, Claude, Gemini, and more.

![PollinChat Screenshot](https://github.com/user-attachments/assets/c9471ffa-7a0f-4966-b1cb-f8d58e64c6a6)

## Features

- 🤖 **Multiple AI Models**: Access to 20+ AI models including:
  - OpenAI (GPT-5.2, GPT-5 Mini)
  - Claude (Anthropic)
  - Gemini (Google)
  - Mistral
  - Grok
  - Perplexity
  - And many more!

- 🖼️ **Vision Support**: Send images to vision-capable models for analysis
- 💭 **Reasoning Models**: Advanced reasoning with models like Deepseek and Kimi K2
- 💾 **Chat History**: Automatically saves your conversations locally
- 🎨 **Theme Support**: Light, Dark, and System theme options
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 📝 **Markdown & Code Highlighting**: Beautiful rendering of formatted text and code blocks
- 🔒 **Privacy First**: All data stored locally in your browser

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Pollinations API Key (available at [pollinations.ai](https://pollinations.ai))

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
- **API Key**: Required for all models
- **Theme**: Choose between Light, Dark, or System theme
- **Delete All Chats**: Clear all conversation history

## Supported Models

### Vision-Capable Models
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

## Technologies Used

- **Vanilla JavaScript**: No framework dependencies
- **Marked.js**: Markdown parsing
- **Highlight.js**: Code syntax highlighting
- **Font Awesome**: Icons
- **Pollinations.ai API**: AI model access

## Browser Storage

PollinChat uses browser localStorage to save:
- Chat history
- User settings
- Theme preferences

No data is sent to any server except for AI completions via the Pollinations API.

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

- Powered by [Pollinations.ai](https://pollinations.ai)
- Icons by [Font Awesome](https://fontawesome.com)
- Markdown parsing by [Marked.js](https://marked.js.org)
- Code highlighting by [Highlight.js](https://highlightjs.org)

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Note**: LLMs can make mistakes. Always verify important information.
