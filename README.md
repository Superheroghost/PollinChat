# PollinChat

A modern, tabbed AI workspace powered by [Pollinations.ai](https://pollinations.ai), providing chat, image, audio, video, and embeddings builders from the checked-in OpenAPI spec.

![PollinChat Screenshot](https://github.com/user-attachments/assets/c9471ffa-7a0f-4966-b1cb-f8d58e64c6a6)

## Features

- 🧭 **Spec-driven workspace**: Top-level tabs for Chat/Text, Image, Audio, Video, and Embeddings, all derived from `api.json`
- 🖱️ **Scrollbar fix**: The app scrolls on the full-width main content area so the browser scrollbar stays on the far-right edge
- 💬 **Preserved chat experience**: Existing history, model selection, reasoning controls, search/code toggles, and vision upload remain available
- 🧪 **Request builders**: Each non-chat modality exposes a focused request builder with live model lists, presets, defaults, history, export, retry, and copy-request actions
- 🔑 **BYOP onboarding**: Pollinations keys are stored in `localStorage` only, with both manual paste and redirect-based Bring Your Own Pollen support
- 📦 **Shared API client**: Reads the base URL from `api.json` and allows an optional override in Settings
- ⌨️ **Productivity UX**: Command palette, keyboard shortcuts, per-tab favorites/search, transcript export, and responsive polish

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

### Entering your API key

Use either of these flows:

1. **Settings → Pollinations API key**: paste your key and save it
2. **BYOP → Authorize with Pollinations**: complete the redirect flow and let PollinChat capture `#api_key=...` automatically

Keys are stored in `localStorage` only.

### Starting a Conversation

1. Stay on the **Chat/Text** tab
2. Select your preferred AI model from the chat model picker
3. Type your message in the composer at the bottom
4. Press Enter or click the send button

### Generating Other Modalities

- **Image**: open the Image tab, set prompt/model/size options, then click **Run request**
- **Audio**: open the Audio tab, fill the CreateSpeechRequest builder, then generate and play/download the result
- **Video**: open the Video tab, set prompt/model/duration/aspect ratio, then preview or download the MP4
- **Embeddings**: open the Embeddings tab, submit text or batch input, then inspect/copy/export the vector response

### Managing Chat History

- **New Chat**: Click the "New Chat" button in the sidebar
- **Switch Chats**: Click on any chat in the history sidebar
- **Delete Chat**: Hover over a chat and click the trash icon

### Settings

Access settings from the gear button in the sidebar or top bar:
- **Pollinations API key**: required for generation requests
- **Base URL override**: optional override for the spec-provided server URL
- **Theme**: choose Light, Dark, or System
- **Default chat model**: set the default chat/text model
- **BYOP client_id / redirect URI / scope / models / budget / expiry**: configure the redirect-based Bring Your Own Pollen authorization flow

## Model Discovery

PollinChat fetches model lists from the Pollinations endpoints described in `api.json`:

- `/text/models`
- `/image/models`
- `/audio/models`
- `/embeddings/models`

If those endpoints are unavailable, the app falls back to a curated local list so the UI still works offline or in restricted environments.

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
