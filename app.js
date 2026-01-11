import { marked } from 'marked';
import hljs from 'highlight.js';

// Configuration
const API_ENDPOINT = 'https://gen.pollinations.ai/v1/chat/completions';
const MODELS_API_ENDPOINT = 'https://gen.pollinations.ai/text/models';
const STORAGE_KEY_CHATS = 'pollinations_chats';
const STORAGE_KEY_SETTINGS = 'pollinations_settings';

// State management
let state = {
    chats: JSON.parse(localStorage.getItem(STORAGE_KEY_CHATS)) || [],
    activeChatId: null,
    selectedImage: null, // Stores base64 of the image
    toolsEnabled: {
        search: false,
        code: false
    },
    settings: JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS)) || {
        apiKey: '',
        theme: 'light',
        defaultModel: 'openai'
    },
    models: [] // Will be populated from API
};

// Dynamic Model Capabilities - populated from API
let VISION_MODELS = [];
let REASONING_MODELS = [];

// Models that support reasoning_effort parameter (only these two)
const REASONING_EFFORT_MODELS = ['openai-large', 'gemini-large'];

// Hardcoded tool support - ignore API tools field
const GOOGLE_SEARCH_MODELS = [
    'gemini', 'gemini-fast', 'gemini-large', 'gemini-search', 'perplexity-fast', 'perplexity-reasoning'
];

const CODE_EXECUTION_MODELS = [
    'gemini', 'gemini-fast', 'gemini-search'
];

// Fetch models from API
async function fetchModels() {
    try {
        const response = await fetch(MODELS_API_ENDPOINT);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const models = await response.json();
        return processModels(models);
    } catch (error) {
        console.error('Failed to fetch models:', error);
        // Use fallback models if API fails
        return processModels(FALLBACK_MODELS);
    }
}

// Process models data and update UI
function processModels(models) {
    // Filter out models with audio output
    const filteredModels = models.filter(m => 
        !m.output_modalities || !m.output_modalities.includes('audio')
    );
    
    state.models = filteredModels;
    
    // Update dynamic model capability arrays
    VISION_MODELS = filteredModels
        .filter(m => m.input_modalities && m.input_modalities.includes('image'))
        .map(m => m.name);
    
    REASONING_MODELS = filteredModels
        .filter(m => m.reasoning === true)
        .map(m => m.name);
    
    // Populate model selectors
    populateModelSelectors(filteredModels);
    
    return filteredModels;
}

// Fallback models in case API is unavailable
const FALLBACK_MODELS = [
    { name: "openai", description: "OpenAI GPT-5 Mini - Fast & Balanced", input_modalities: ["text", "image"] },
    { name: "openai-fast", description: "OpenAI GPT-5 Nano - Ultra Fast & Affordable", input_modalities: ["text", "image"] },
    { name: "openai-large", description: "OpenAI GPT-5.2 - Most Powerful & Intelligent", input_modalities: ["text", "image"], reasoning: true },
    { name: "qwen-coder", description: "Qwen3 Coder 30B - Specialized for Code Generation", input_modalities: ["text"] },
    { name: "mistral", description: "Mistral Small 3.2 24B - Efficient & Cost-Effective", input_modalities: ["text"] },
    { name: "gemini", description: "Google Gemini 3 Flash - Pro-Grade Reasoning at Flash Speed", input_modalities: ["text", "image", "audio", "video"] },
    { name: "gemini-fast", description: "Google Gemini 2.5 Flash Lite - Ultra Fast & Cost-Effective", input_modalities: ["text", "image"] },
    { name: "deepseek", description: "DeepSeek V3.2 - Efficient Reasoning & Agentic AI", input_modalities: ["text"], reasoning: true },
    { name: "grok", description: "xAI Grok 4 Fast - High Speed & Real-Time", input_modalities: ["text"] },
    { name: "gemini-search", description: "Google Gemini 3 Flash - With Google Search", input_modalities: ["text", "image"] },
    { name: "chickytutor", description: "ChickyTutor AI Language Tutor - (chickytutor.com)", input_modalities: ["text"] },
    { name: "midijourney", description: "MIDIjourney - AI Music Composition Assistant", input_modalities: ["text"] },
    { name: "claude-fast", description: "Anthropic Claude Haiku 4.5 - Fast & Intelligent", input_modalities: ["text", "image"] },
    { name: "claude", description: "Anthropic Claude Sonnet 4.5 - Most Capable & Balanced", input_modalities: ["text", "image"] },
    { name: "claude-large", description: "Anthropic Claude Opus 4.5 - Most Intelligent Model", input_modalities: ["text", "image"] },
    { name: "perplexity-fast", description: "Perplexity Sonar - Fast & Affordable with Web Search", input_modalities: ["text"] },
    { name: "perplexity-reasoning", description: "Perplexity Sonar Reasoning - Advanced Reasoning with Web Search", input_modalities: ["text"], reasoning: true },
    { name: "kimi-k2-thinking", description: "Moonshot Kimi K2 Thinking - Deep Reasoning & Tool Orchestration", input_modalities: ["text"], reasoning: true },
    { name: "gemini-large", description: "Google Gemini 3 Pro - Most Intelligent Model with 1M Context (Preview)", input_modalities: ["text", "image", "audio", "video"], reasoning: true },
    { name: "nova-micro", description: "Amazon Nova Micro - Ultra Fast & Ultra Cheap", input_modalities: ["text"] },
    { name: "glm", description: "Z.ai GLM-4.7 - Coding, Reasoning & Agentic Workflows", input_modalities: ["text"], reasoning: true },
    { name: "minimax", description: "MiniMax M2.1 - Multi-Language & Agent Workflows", input_modalities: ["text"], reasoning: true }
];

// Populate model selector dropdowns
function populateModelSelectors(models) {
    const modelSelector = document.getElementById('modelSelector');
    const defaultModelSelect = document.getElementById('defaultModelSelect');
    
    if (!models || models.length === 0) return;
    
    // Save current selections
    const currentModel = modelSelector.value;
    const currentDefaultModel = defaultModelSelect.value;
    
    // Clear existing options
    modelSelector.innerHTML = '';
    defaultModelSelect.innerHTML = '';
    
    // Add options from API
    models.forEach(model => {
        // Use description as display text, name as value
        const option1 = document.createElement('option');
        option1.value = model.name;
        option1.textContent = model.description;
        option1.title = model.description; // Tooltip for long descriptions
        modelSelector.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = model.name;
        option2.textContent = model.description;
        option2.title = model.description;
        defaultModelSelect.appendChild(option2);
    });
    
    // Restore selections if they still exist
    if (models.find(m => m.name === currentModel)) {
        modelSelector.value = currentModel;
    } else if (models.length > 0) {
        modelSelector.value = state.settings.defaultModel || models[0].name;
    }
    
    if (models.find(m => m.name === currentDefaultModel)) {
        defaultModelSelect.value = currentDefaultModel;
    } else if (models.length > 0) {
        defaultModelSelect.value = state.settings.defaultModel || models[0].name;
    }
    
    // Update controls after populating
    updateModelControls();
}

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
const searchToggle = document.getElementById('searchToggle');
const codeToggle = document.getElementById('codeToggle');
const thinkingToggleContainer = document.getElementById('thinkingToggleContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const settingsModal = document.getElementById('settingsModal');
const apiKeyInput = document.getElementById('apiKey');
const themeSelect = document.getElementById('themeSelect');
const defaultModelSelect = document.getElementById('defaultModelSelect');
const newChatBtn = document.getElementById('newChatBtn');
const imageInput = document.getElementById('imageInput');
const attachBtn = document.getElementById('attachBtn');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');

// Initialize Markdown
marked.setOptions({
    breaks: true,
    gfm: true
});

// Helper function to escape HTML and format text as fallback
function escapeHtmlAndFormatText(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\n/g, '<br>');
}

// Helper function to safely parse markdown with fallback
function safeMarkdownParse(text) {
    // Check if marked is available before attempting to parse
    if (typeof marked !== 'undefined' && marked.parse) {
        try {
            return marked.parse(text);
        } catch (error) {
            // If marked.parse fails for any reason, fall back to plain text
            console.warn('Marked.js parsing failed, using plain text:', error);
            return escapeHtmlAndFormatText(text);
        }
    } else {
        // marked is not available, use plain text fallback
        console.warn('Marked.js not available, using plain text');
        return escapeHtmlAndFormatText(text);
    }
}

// App Initialization
async function init() {
    applyTheme(state.settings.theme);
    
    // Fetch models from API
    await fetchModels();
    
    // Apply saved default model
    if (state.settings.defaultModel) {
        modelSelector.value = state.settings.defaultModel;
    }
    
    // Initialize tool controls based on current model
    updateModelControls();
    
    renderChatHistory();
    setupEventListeners();
    
    // Auto-focus input
    chatInput.focus();
}

function updateModelControls() {
    const model = modelSelector.value;
    const isVision = VISION_MODELS.includes(model);
    attachBtn.style.opacity = isVision ? '1' : '0.3';
    attachBtn.title = isVision ? 'Attach image' : 'Selected model does not support images';
    
    // Update tools UI - use hardcoded lists, ignore API tools field
    const hasSearch = GOOGLE_SEARCH_MODELS.includes(model);
    const hasCode = CODE_EXECUTION_MODELS.includes(model);
    
    // Auto-enable search for gemini-search and perplexity models
    const shouldAutoEnableSearch = model === 'gemini-search' || model.startsWith('perplexity');
    if (shouldAutoEnableSearch && hasSearch) {
        state.toolsEnabled.search = true;
    }
    
    searchToggle.style.display = hasSearch ? 'flex' : 'none';
    codeToggle.style.display = hasCode ? 'flex' : 'none';
    
    searchToggle.classList.toggle('active', hasSearch && state.toolsEnabled.search);
    codeToggle.classList.toggle('active', hasCode && state.toolsEnabled.code);

    // Update reasoning UI - check if model supports reasoning
    const isReasoning = REASONING_MODELS.includes(model);
    reasoningControls.style.display = isReasoning ? 'flex' : 'none';
    
    if (isReasoning) {
        // Only openai-large and gemini-large get reasoning_effort dropdown
        const isEffortModel = REASONING_EFFORT_MODELS.includes(model);
        reasoningEffort.style.display = isEffortModel ? 'block' : 'none';
        
        // Rebuild reasoning effort options for specific models
        if (model === 'openai-large') {
            reasoningEffort.innerHTML = `
                <option value="none">None</option>
                <option value="minimal">Minimal</option>
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
                <option value="xhigh">X-High</option>
            `;
        } else if (model === 'gemini-large') {
            reasoningEffort.innerHTML = `
                <option value="low" selected>Low</option>
                <option value="high">High</option>
            `;
        }

        // All reasoning models get the thinking toggle
        thinkingToggleContainer.style.display = 'flex';
    }
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
        updateModelControls();
    });

    searchToggle.addEventListener('click', () => {
        state.toolsEnabled.search = !state.toolsEnabled.search;
        searchToggle.classList.toggle('active', state.toolsEnabled.search);
    });

    codeToggle.addEventListener('click', () => {
        state.toolsEnabled.code = !state.toolsEnabled.code;
        codeToggle.classList.toggle('active', state.toolsEnabled.code);
    });

    // Sidebar & Navigation
    newChatBtn.addEventListener('click', () => {
        createNewChat();
        newChatBtn.blur();
    });

    const sidebarToggle = () => {
        if (sidebar.classList.contains('closed')) {
            // Prevent auto-focus highlighting when sidebar opens
            document.activeElement?.blur();
        }
        sidebar.classList.toggle('closed');
    };

    document.getElementById('mobileMenuBtn').addEventListener('click', sidebarToggle);
    document.getElementById('closeSidebarBtn').addEventListener('click', sidebarToggle);

    // Settings
    document.getElementById('settingsBtn').addEventListener('click', () => {
        apiKeyInput.value = state.settings.apiKey;
        themeSelect.value = state.settings.theme;
        defaultModelSelect.value = state.settings.defaultModel || 'openai';
        settingsModal.style.display = 'flex';
    });

    document.getElementById('closeSettings').addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    document.getElementById('saveSettings').addEventListener('click', () => {
        state.settings.apiKey = apiKeyInput.value.trim();
        state.settings.theme = themeSelect.value;
        state.settings.defaultModel = defaultModelSelect.value;
        saveSettings();
        applyTheme(state.settings.theme);
        modelSelector.value = state.settings.defaultModel;
        updateModelControls();
        settingsModal.style.display = 'none';
    });

    const deleteAllHandler = () => {
        if (confirm('Are you sure you want to delete ALL chats? This action cannot be undone.')) {
            state.chats = [];
            state.activeChatId = null;
            saveChats();
            renderChatHistory();
            clearMessages();
            welcomeScreen.style.display = 'flex';
            settingsModal.style.display = 'none';
        }
    };

    document.getElementById('deleteAllSidebarBtn').addEventListener('click', deleteAllHandler);

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

// Tool Definitions
const TOOLS = [
    {
        type: "function",
        function: {
            name: "google_search",
            description: "Performs a Google search to retrieve real-time information from the internet.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "The search query." }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "code_execution",
            description: "Executes Python code in a secure sandboxed environment to perform calculations or data processing.",
            parameters: {
                type: "object",
                properties: {
                    code: { type: "string", description: "The Python code to execute." }
                },
                required: ["code"]
            }
        }
    }
];

// Tool Execution Logic
async function executeTool(name, args) {
    console.log(`Executing tool: ${name}`, args);
    try {
        if (name === 'google_search') {
            const completion = await websim.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a Google Search simulation. Provide a factual, concise summary of top search results for the user's query, including relevant snippets." },
                    { role: "user", content: args.query }
                ]
            });
            return { query: args.query, results: completion.content, provider: "Google" };
        }
        if (name === 'code_execution') {
            // Simulate Python execution with an LLM call for logic or result generation
            const completion = await websim.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a Python code execution environment. Return the stdout or the result of the last expression of the provided code. If there are errors, return them. Format output as JSON with 'stdout' and 'result' fields." },
                    { role: "user", content: args.code }
                ],
                json: true
            });
            return JSON.parse(completion.content);
        }
    } catch (err) {
        return { error: err.message };
    }
    return { error: "Tool not implemented" };
}

// Generate chat title using AI
async function generateChatTitle(chat) {
    try {
        // Get the first user message
        const firstUserMsg = chat.messages.find(m => m.role === 'user');
        if (!firstUserMsg) return;
        
        // Extract text from message (handle vision content arrays)
        let messageText = '';
        if (typeof firstUserMsg.content === 'string') {
            messageText = firstUserMsg.content;
        } else if (Array.isArray(firstUserMsg.content)) {
            const textPart = firstUserMsg.content.find(p => p.type === 'text');
            messageText = textPart ? textPart.text : '';
        }
        
        if (!messageText || messageText.length < 3) return;
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (state.settings.apiKey) {
            headers['Authorization'] = `Bearer ${state.settings.apiKey}`;
        }
        
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                model: 'openai', // Use GPT-5 Mini for title generation
                messages: [
                    {
                        role: 'system',
                        content: 'Generate a short, concise title (max 5 words) for a chat that starts with the following message. Only respond with the title, nothing else.'
                    },
                    {
                        role: 'user',
                        content: messageText.substring(0, 200) // Limit to first 200 chars
                    }
                ],
                stream: false
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            const title = data.choices[0].message.content.trim();
            
            // Update chat title
            if (title && title.length > 0 && title.length < 50) {
                chat.title = title;
                saveChats();
                renderChatHistory();
            }
        }
    } catch (error) {
        console.error('Failed to generate chat title:', error);
        // Silently fail - not critical
    }
}

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
        createNewChat();
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

    try {
        let isProcessing = true;
        let aiResponse = null;

        while (isProcessing) {
            const response = await fetchAIResponse(currentChat.messages);
            aiResponse = response.choices[0].message;
            
            // Capture reasoning/thinking if it exists
            const reasoning = aiResponse.reasoning || aiResponse.thinking || null;

            if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
                // Handle tool calls
                currentChat.messages.push(aiResponse);
                
                // Update UI to show we're using tools
                const toolNames = aiResponse.tool_calls.map(tc => tc.function.name).join(', ');
                const statusEl = contentElement.querySelector('.ai-thinking-status');
                if (statusEl) {
                    statusEl.innerHTML = `<i class="fas fa-tools fa-spin"></i> Using tools: ${toolNames}...`;
                }

                for (const toolCall of aiResponse.tool_calls) {
                    const args = JSON.parse(toolCall.function.arguments);
                    const result = await executeTool(toolCall.function.name, args);
                    
                    currentChat.messages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        name: toolCall.function.name,
                        content: JSON.stringify(result)
                    });
                }
                // Loop continues to let the AI respond to the tool outputs
            } else {
                // Final response
                isProcessing = false;
                contentElement.classList.remove('placeholder');
                
                const aiResponseText = aiResponse.content || "";
                const msgData = { role: 'assistant', content: aiResponseText };
                if (reasoning) msgData.reasoning = reasoning;
                
                currentChat.messages.push(msgData);
                
                let html = "";
                if (reasoning) {
                    html += `
                        <details class="thinking-dropdown">
                            <summary><i class="fas fa-brain"></i> Thinking Process</summary>
                            <div class="thinking-content">${safeMarkdownParse(reasoning)}</div>
                        </details>
                    `;
                }
                html += safeMarkdownParse(aiResponseText);
                contentElement.innerHTML = html;
                
                // Process code blocks for syntax highlighting and copy buttons
                processCodeBlocks(contentElement);
            }
        }

        saveChats();
        scrollToBottom();
        
        // Generate title for new chats after first message
        if (currentChat.messages.length === 2 && currentChat.title === 'New Chat') {
            generateChatTitle(currentChat);
        }
    } catch (error) {
        console.error('Error fetching AI response:', error);
        contentElement.classList.remove('placeholder');
        
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

    // Filter tools based on model capabilities and UI toggles
    let availableTools = TOOLS.filter(tool => {
        const name = tool.function.name;
        if (name === 'google_search') {
            return GOOGLE_SEARCH_MODELS.includes(model) && state.toolsEnabled.search;
        }
        if (name === 'code_execution') {
            return CODE_EXECUTION_MODELS.includes(model) && state.toolsEnabled.code;
        }
        return false; 
    });

    // Gemini restriction: Cannot mix search tools with other function calls in a single request on Vertex AI
    if (model.toLowerCase().includes('gemini') && availableTools.length > 1) {
        // If both are toggled on, prioritize Google Search to avoid the "Multiple tools" error
        availableTools = availableTools.filter(t => t.function.name === 'google_search');
    }

    const body = {
        model: model,
        messages: messages,
        stream: false,
        tools: availableTools.length > 0 ? availableTools : undefined,
        tool_choice: availableTools.length > 0 ? "auto" : undefined
    };

    // Add reasoning parameters if applicable
    if (REASONING_MODELS.includes(model)) {
        // Only openai-large and gemini-large get reasoning_effort
        if (REASONING_EFFORT_MODELS.includes(model)) {
            body.reasoning_effort = reasoningEffort.value;
        }
        
        // Setup thinking parameter for all reasoning models
        body.thinking = {
            type: thinkingToggle.checked ? "enabled" : "disabled"
        };
    }

    // Retry indefinitely on timeout (524) errors
    while (true) {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        // If timeout error (524), wait briefly then retry automatically
        if (response.status === 524) {
            console.log('Timeout (524) - retrying in 1 second...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
        }

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${response.status}`);
        }

        return await response.json();
    }
}

function createNewChat(initialText = '') {
    const id = Date.now().toString();
    // Always start with 'New Chat', let AI generate the title after first message
    const title = 'New Chat';
        
    const newChat = {
        id,
        title: title,
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
        sidebar.classList.add('closed');
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
        sidebar.classList.add('closed');
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
    content.className = 'message-content' + (isPlaceholder ? ' placeholder' : '');
    
    if (isPlaceholder) {
        content.innerHTML = `
            <div class="ai-thinking-status"></div>
            <div class="typing-indicator"><span></span><span></span><span></span></div>
        `;
    } else {
        let html = "";
        
        // Add Reasoning/Thinking block if available
        if (msg.reasoning || msg.thinking) {
            const reasoningText = msg.reasoning || msg.thinking;
            html += `
                <details class="thinking-dropdown">
                    <summary><i class="fas fa-brain"></i> Thinking Process</summary>
                    <div class="thinking-content">${safeMarkdownParse(reasoningText)}</div>
                </details>
            `;
        }

        // Handle vision content (array of objects)
        if (Array.isArray(msg.content)) {
            let textPart = "";
            let imagePart = "";
            msg.content.forEach(part => {
                if (part.type === 'text') textPart += part.text;
                if (part.type === 'image_url') imagePart += `<div class="msg-image-wrap"><img src="${part.image_url.url}" class="user-uploaded-image" /></div>`;
            });
            html += imagePart + safeMarkdownParse(textPart);
        } else {
            html += safeMarkdownParse(msg.content || "");
        }
        
        content.innerHTML = html;
        
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
        // Prevent duplicate headers
        if (pre.querySelector('.code-header')) return;

        const code = pre.querySelector('code');
        if (!code) return;
        
        // Get language for label
        const langClass = Array.from(code.classList).find(c => c.startsWith('language-'));
        const lang = langClass ? langClass.replace('language-', '') : 'text';
        
        // Create header with Copy button
        const header = document.createElement('div');
        header.className = 'code-header';
        
        const label = document.createElement('span');
        label.textContent = lang;
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-code-btn';
        copyBtn.innerHTML = '<i class="far fa-copy"></i> Copy code';
        
        copyBtn.onclick = async (e) => {
            e.preventDefault();
            const textToCopy = code.innerText;
            try {
                await navigator.clipboard.writeText(textToCopy);
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="far fa-copy"></i> Copy code';
                    copyBtn.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Copy failed', err);
            }
        };
        
        header.appendChild(label);
        header.appendChild(copyBtn);
        
        // Insert header before the code element
        pre.insertBefore(header, code);
        
        // Apply syntax highlighting
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
