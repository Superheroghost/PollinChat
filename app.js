import { marked } from 'marked';
import hljs from 'highlight.js';

// Configuration
const API_ENDPOINT = 'https://gen.pollinations.ai/v1/chat/completions';
const STORAGE_KEY_CHATS = 'pollinations_chats';
const STORAGE_KEY_SETTINGS = 'pollinations_settings';

// State management
let state = {
    chats: JSON.parse(localStorage.getItem(STORAGE_KEY_CHATS)) || [],
    activeChatId: null,
    selectedImage: null, // Stores base64 of the image
    settings: JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS)) || {
        apiKey: '',
        theme: 'light'
    }
};

// Vision-capable models as per user request
const VISION_MODELS = [
    'openai-fast', 'grok', 'openai', 'claude-fast', 'midjourney', 
    'claude', 'claude-large', 'gemini-large', 'openai-large', 
    'gemini', 'gemini-search'
];

const REASONING_MODELS = [
    'deepseek', 'kimi-k2-thinking', 'perplexity-reasoning', 'gemini-large', 'openai-large'
];

// UI Elements
const sidebar = document.getElementById('sidebar');
const chatHistory = document.getElementById('chatHistory');
const messagesList = document.getElementById('messagesList');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const modelSelector = document.getElementById('modelSelector');
const reasoningControls = document.getElementById('reasoningControls');
const thinkingToggle = document.getElementById('thinkingToggle');
const reasoningEffort = document.getElementById('reasoningEffort');
const thinkingToggleContainer = document.getElementById('thinkingToggleContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const settingsModal = document.getElementById('settingsModal');
const apiKeyInput = document.getElementById('apiKey');
const themeSelect = document.getElementById('themeSelect');
const newChatBtn = document.getElementById('newChatBtn');
const imageInput = document.getElementById('imageInput');
const attachBtn = document.getElementById('attachBtn');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');

// Initialize Markdown
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true
});

// App Initialization
function init() {
    applyTheme(state.settings.theme);
    renderChatHistory();
    setupEventListeners();
    
    // Auto-focus input
    chatInput.focus();
}

function setupEventListeners() {
    // Input handling
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';
        sendBtn.disabled = !chatInput.value.trim();
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);

    // Vision Support
    attachBtn.addEventListener('click', () => {
        if (VISION_MODELS.includes(modelSelector.value)) {
            imageInput.click();
        } else {
            alert(`The selected model (${modelSelector.value}) does not support vision. Please switch to a vision-capable model.`);
        }
    });

    imageInput.addEventListener('change', handleImageSelect);

    modelSelector.addEventListener('change', () => {
        const model = modelSelector.value;
        const isVision = VISION_MODELS.includes(model);
        attachBtn.style.opacity = isVision ? '1' : '0.3';
        attachBtn.title = isVision ? 'Attach image' : 'Selected model does not support images';
        
        // Update reasoning UI
        const isReasoning = REASONING_MODELS.includes(model);
        reasoningControls.style.display = isReasoning ? 'flex' : 'none';
        
        if (isReasoning) {
            const isOpenAILarge = model === 'openai-large';
            reasoningEffort.style.display = isOpenAILarge ? 'block' : 'none';
            // Show toggle for others, though openai-large can also use it if desired, 
            // but prompt specifies reasoning_effort for openai-large
            thinkingToggleContainer.style.display = 'flex';
        }
    });

    // Sidebar & Navigation
    newChatBtn.addEventListener('click', createNewChat);

    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
        sidebar.classList.add('open');
    });

    document.getElementById('mobileCloseBtn').addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    // Settings
    document.getElementById('settingsBtn').addEventListener('click', () => {
        apiKeyInput.value = state.settings.apiKey;
        themeSelect.value = state.settings.theme;
        settingsModal.style.display = 'flex';
    });

    document.getElementById('closeSettings').addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    document.getElementById('saveSettings').addEventListener('click', () => {
        state.settings.apiKey = apiKeyInput.value.trim();
        state.settings.theme = themeSelect.value;
        saveSettings();
        applyTheme(state.settings.theme);
        settingsModal.style.display = 'none';
    });

    document.getElementById('deleteAllChats').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete ALL chats? This action cannot be undone.')) {
            state.chats = [];
            state.activeChatId = null;
            saveChats();
            renderChatHistory();
            clearMessages();
            welcomeScreen.style.display = 'flex';
            settingsModal.style.display = 'none';
        }
    });

    window.onclick = (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    };
}

// Vision Logic
function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        state.selectedImage = event.target.result;
        renderImagePreview();
        sendBtn.disabled = false;
    };
    reader.readAsDataURL(file);
    // Clear input so same file can be selected again
    e.target.value = '';
}

function renderImagePreview() {
    imagePreviewContainer.innerHTML = '';
    if (state.selectedImage) {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerHTML = `
            <img src="${state.selectedImage}" alt="Preview">
            <button class="remove-preview" onclick="clearImagePreview()"><i class="fas fa-times"></i></button>
        `;
        imagePreviewContainer.appendChild(div);
    }
}

window.clearImagePreview = () => {
    state.selectedImage = null;
    imagePreviewContainer.innerHTML = '';
    if (!chatInput.value.trim()) sendBtn.disabled = true;
};

// Core Functions
async function sendMessage() {
    const text = chatInput.value.trim();
    const image = state.selectedImage;
    
    if (!text && !image) return;

    // Reset UI
    chatInput.value = '';
    chatInput.style.height = 'auto';
    sendBtn.disabled = true;
    welcomeScreen.style.display = 'none';
    clearImagePreview();

    // Ensure we have an active chat
    if (!state.activeChatId) {
        createNewChat(text || "Image Inquiry");
    }

    const currentChat = state.chats.find(c => c.id === state.activeChatId);
    
    // Construct Message Content (Vision Support)
    let userMsgContent;
    if (image && VISION_MODELS.includes(modelSelector.value)) {
        userMsgContent = [
            { type: 'text', text: text || "What is in this image?" },
            { type: 'image_url', image_url: { url: image } }
        ];
    } else {
        userMsgContent = text;
    }

    // Add user message to UI and State
    const userMsg = { role: 'user', content: userMsgContent };
    currentChat.messages.push(userMsg);
    renderMessage(userMsg);
    saveChats();

    // Add AI placeholder (thinking)
    const aiMsgPlaceholder = { role: 'assistant', content: '', id: Date.now() };
    const aiMsgElement = renderMessage(aiMsgPlaceholder, true);
    const contentElement = aiMsgElement.querySelector('.message-content');
    contentElement.classList.add('typing-indicator');

    try {
        const response = await fetchAIResponse(currentChat.messages);
        contentElement.classList.remove('typing-indicator');
        
        // Render final response
        const aiResponseText = response.choices[0].message.content;
        currentChat.messages.push({ role: 'assistant', content: aiResponseText });
        contentElement.innerHTML = marked.parse(aiResponseText);
        
        // Highlight code
        contentElement.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

        saveChats();
        scrollToBottom();
    } catch (error) {
        console.error('Error fetching AI response:', error);
        
        // Completely ignore timeout errors (524) - don't show anything
        if (error.message && error.message.includes('524')) {
            contentElement.classList.remove('typing-indicator');
            contentElement.innerHTML = '';
            return;
        }
        
        contentElement.classList.remove('typing-indicator');
        
        let errorMessage = error.message || "Failed to connect to Pollinations AI.";
        let helpfulTip = "";
        
        if (errorMessage.toLowerCase().includes('content policy') || errorMessage.toLowerCase().includes('blocked')) {
            errorMessage = "<strong>Content Filter Triggered:</strong> The selected model (OpenAI Large) has strict safety guidelines and has blocked this request.";
            helpfulTip = `<div class="error-tip">
                <p>Try rephrasing your prompt or switching to a less restrictive model like <strong>OpenAI Fast</strong> or <strong>Mistral</strong>.</p>
                <button class="retry-alt-btn" onclick="switchAndRetry('openai-fast')">Switch to OpenAI Fast</button>
            </div>`;
        }
        
        contentElement.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-circle"></i>
                <div class="error-text">${errorMessage}</div>
                ${helpfulTip}
            </div>
        `;
    }
}

async function fetchAIResponse(messages) {
    const model = modelSelector.value;
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (state.settings.apiKey) {
        headers['Authorization'] = `Bearer ${state.settings.apiKey}`;
    }

    const body = {
        model: model,
        messages: messages,
        stream: false
    };

    // Add reasoning parameters if applicable
    if (REASONING_MODELS.includes(model)) {
        if (model === 'openai-large') {
            body.reasoning_effort = reasoningEffort.value;
        }
        
        // Setup thinking parameter
        body.thinking = {
            type: thinkingToggle.checked ? "enabled" : "disabled"
        };
    }

    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    return await response.json();
}

function createNewChat(initialText = '') {
    const id = Date.now().toString();
    const newChat = {
        id,
        title: initialText ? (initialText.substring(0, 30) + '...') : 'New Chat',
        messages: [],
        timestamp: Date.now()
    };
    
    state.chats.unshift(newChat);
    state.activeChatId = id;
    
    saveChats();
    renderChatHistory();
    clearMessages();
    welcomeScreen.style.display = 'flex';
    
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
    }
}

function renderChatHistory() {
    chatHistory.innerHTML = '';
    state.chats.forEach(chat => {
        const item = document.createElement('div');
        item.className = `history-item ${chat.id === state.activeChatId ? 'active' : ''}`;
        
        const chatInfo = document.createElement('div');
        chatInfo.className = 'chat-info';
        chatInfo.innerHTML = `<i class="far fa-comment"></i> <span>${chat.title}</span>`;
        chatInfo.onclick = (e) => {
            e.stopPropagation();
            loadChat(chat.id);
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-chat-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteChat(chat.id);
        };
        
        item.appendChild(chatInfo);
        item.appendChild(deleteBtn);
        chatHistory.appendChild(item);
    });
}

function deleteChat(id) {
    if (!confirm('Are you sure you want to delete this chat?')) return;
    state.chats = state.chats.filter(c => c.id !== id);
    if (state.activeChatId === id) {
        state.activeChatId = null;
        clearMessages();
        welcomeScreen.style.display = 'flex';
    }
    saveChats();
    renderChatHistory();
}

function loadChat(id) {
    state.activeChatId = id;
    const chat = state.chats.find(c => c.id === id);
    
    clearMessages();
    renderChatHistory();
    
    if (chat.messages.length > 0) {
        welcomeScreen.style.display = 'none';
        chat.messages.forEach(msg => renderMessage(msg));
    } else {
        welcomeScreen.style.display = 'flex';
    }

    if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
    }
    
    scrollToBottom();
}

function renderMessage(msg, isPlaceholder = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${msg.role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    if (msg.role === 'user') {
        avatar.innerHTML = '<i class="fas fa-user"></i>';
    } else {
        avatar.innerHTML = `<img src="logo.png" style="width: 20px; height: 20px;" />`;
    }
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    if (isPlaceholder) {
        content.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    } else {
        // Handle vision content (array of objects)
        if (Array.isArray(msg.content)) {
            let textPart = "";
            let imagePart = "";
            msg.content.forEach(part => {
                if (part.type === 'text') textPart += part.text;
                if (part.type === 'image_url') imagePart += `<div class="msg-image-wrap"><img src="${part.image_url.url}" class="user-uploaded-image" /></div>`;
            });
            content.innerHTML = imagePart + marked.parse(textPart);
        } else {
            content.innerHTML = marked.parse(msg.content || "");
        }
        
        // Enhance code blocks and highlight
        processCodeBlocks(content);
    }
    
    msgDiv.appendChild(avatar);
    msgDiv.appendChild(content);
    messagesList.appendChild(msgDiv);
    
    scrollToBottom();
    return msgDiv;
}

function processCodeBlocks(container) {
    container.querySelectorAll('pre').forEach((pre) => {
        const code = pre.querySelector('code');
        if (!code) return;
        
        // Get language
        const langClass = Array.from(code.classList).find(c => c.startsWith('language-'));
        const lang = langClass ? langClass.replace('language-', '') : 'code';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'code-header';
        header.innerHTML = `
            <span>${lang}</span>
            <button class="copy-code-btn"><i class="far fa-copy"></i> Copy code</button>
        `;
        
        header.querySelector('.copy-code-btn').onclick = async function() {
            try {
                await navigator.clipboard.writeText(code.innerText);
                this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    this.innerHTML = '<i class="far fa-copy"></i> Copy code';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy!', err);
            }
        };
        
        pre.insertBefore(header, code);
        hljs.highlightElement(code);
    });
}

function clearMessages() {
    messagesList.innerHTML = '';
}

function scrollToBottom() {
    const container = document.getElementById('chatContainer');
    container.scrollTop = container.scrollHeight;
}

// State Persistence
function saveChats() {
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(state.chats));
}

function saveSettings() {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(state.settings));
}

function applyTheme(theme) {
    if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.className = isDark ? 'dark-theme' : 'light-theme';
    } else {
        document.documentElement.className = `${theme}-theme`;
    }
}

// Global Helpers
window.setInput = (text) => {
    chatInput.value = text;
    chatInput.style.height = (chatInput.scrollHeight) + 'px';
    sendBtn.disabled = false;
    chatInput.focus();
};

window.switchAndRetry = (modelValue) => {
    modelSelector.value = modelValue;
    modelSelector.dispatchEvent(new Event('change'));
    
    // Get last user message
    const currentChat = state.chats.find(c => c.id === state.activeChatId);
    if (!currentChat) return;
    
    const lastUserMsg = [...currentChat.messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
        // Remove the failed assistant message and the user message from state to re-send
        currentChat.messages.pop(); // Remove placeholder/error
        currentChat.messages.pop(); // Remove original user msg
        
        // Put text back in input
        if (typeof lastUserMsg.content === 'string') {
            chatInput.value = lastUserMsg.content;
        } else if (Array.isArray(lastUserMsg.content)) {
            const textPart = lastUserMsg.content.find(p => p.type === 'text');
            if (textPart) chatInput.value = textPart.text;
        }
        
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';
        sendBtn.disabled = false;
        
        // Remove the error message from UI
        const messages = messagesList.querySelectorAll('.message');
        if (messages.length >= 2) {
            messages[messages.length - 1].remove();
            messages[messages.length - 2].remove();
        }
        
        sendMessage();
    }
};

// Start the app
init();
