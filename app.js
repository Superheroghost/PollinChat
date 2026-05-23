const hljs = { highlightElement() {} };

const STORAGE_KEY_CHATS = 'pollinations_chats';
const STORAGE_KEY_SETTINGS = 'pollinations_settings';
const STORAGE_KEY_UI = 'pollinations_ui';
const STORAGE_KEY_OUTPUTS = 'pollinations_outputs';
const STORAGE_KEY_FORMS = 'pollinations_forms';

const TAB_ORDER = ['chat', 'image', 'audio', 'video', 'embeddings'];

const TAB_META = {
    chat: { label: 'Chat/Text', icon: 'fa-comments', description: 'Conversation, reasoning, tools, and vision.' },
    image: { label: 'Image', icon: 'fa-image', description: 'Prompt-based image generation.' },
    audio: { label: 'Audio', icon: 'fa-waveform', description: 'Speech and music from CreateSpeechRequest.' },
    video: { label: 'Video', icon: 'fa-film', description: 'Prompt-based MP4 generation.' },
    embeddings: { label: 'Embeddings', icon: 'fa-vector-square', description: 'Vector generation and inspection.' }
};

const GENERATION_TABS = ['image', 'audio', 'video', 'embeddings'];
const CHAT_TOOL_SEARCH_FALLBACK = ['gemini', 'gemini-fast', 'gemini-large', 'gemini-search', 'perplexity-fast', 'perplexity-reasoning'];
const CHAT_TOOL_CODE_FALLBACK = ['gemini', 'gemini-fast', 'gemini-search'];
const REASONING_EFFORT_MODELS = ['openai-large', 'gemini-large'];

const PRESETS = {
    image: [
        { name: 'Editorial portrait', values: { prompt: 'A cinematic editorial portrait lit by neon reflections, shallow depth of field.', width: 1024, height: 1280, enhance: true, quality: 'high' } },
        { name: 'Product mockup', values: { prompt: 'A premium product hero shot on a soft gradient backdrop, studio lighting, realistic shadows.', width: 1408, height: 1024, quality: 'hd', transparent: false } },
        { name: 'Transparent logo concept', values: { prompt: 'A clean monochrome mascot logo with vector-friendly contours.', width: 1024, height: 1024, transparent: true } }
    ],
    audio: [
        { name: 'Narration', values: { input: 'Welcome to PollinChat. This audio preview was generated from the OpenAPI-driven request builder.', voice: 'nova', response_format: 'mp3', speed: 1 } },
        { name: 'Warm voicemail', values: { input: 'Hi there, just checking in. I wanted to let you know the release is on track and I will send the summary shortly.', voice: 'rachel', speed: 0.95 } },
        { name: 'Instrumental music', values: { model: 'elevenmusic', input: 'uplifting electronic soundtrack with airy synths and crisp percussion', duration: 30, instrumental: true, style: 'electronic cinematic uplifting' } }
    ],
    video: [
        { name: 'Product teaser', values: { prompt: 'A premium smartwatch rotates slowly over a dark reflective surface with drifting volumetric light.', duration: 6, aspectRatio: '16:9', audio: false } },
        { name: 'Vertical social clip', values: { prompt: 'A cozy cafe exterior in the rain, cinematic rack focus, social-first motion.', duration: 6, aspectRatio: '9:16', audio: false } },
        { name: 'Landscape nature loop', values: { prompt: 'A waterfall in slow motion with drifting mist and sun rays breaking through trees.', duration: 8, aspectRatio: '16:9', audio: true } }
    ],
    embeddings: [
        { name: 'Semantic similarity', values: { input: 'Find semantically related startup ideas for AI meeting assistants.', task_type: 'SEMANTIC_SIMILARITY', dimensions: 768, encoding_format: 'float' } },
        { name: 'Retrieval document', values: { input: 'PollinChat is a browser-first interface for Pollinations text, image, audio, video, and embeddings.', task_type: 'RETRIEVAL_DOCUMENT', dimensions: 768 } },
        { name: 'Classification', values: { input: 'Urgent billing issue from a premium customer', task_type: 'CLASSIFICATION', dimensions: 512 } }
    ]
};

const DEFAULT_SETTINGS = {
    apiKey: '',
    theme: 'light',
    defaultModel: 'openai',
    apiBaseUrl: '',
    byopClientId: '',
    byopRedirectUri: '',
    byopScope: 'usage',
    byopModels: '',
    byopBudget: '',
    byopExpiry: '7',
    favorites: {
        chat: [], image: [], audio: [], video: [], embeddings: []
    },
    tabDefaults: {}
};

const FALLBACK_MODELS = {
    chat: [
        { name: 'openai', description: 'OpenAI GPT-5 Mini · balanced default', input_modalities: ['text', 'image'], output_modalities: ['text'] },
        { name: 'openai-fast', description: 'OpenAI GPT-5 Nano · low-latency chat', input_modalities: ['text', 'image'], output_modalities: ['text'] },
        { name: 'openai-large', description: 'OpenAI GPT-5.2 · high reasoning', input_modalities: ['text', 'image'], output_modalities: ['text'], reasoning: true },
        { name: 'claude', description: 'Claude Sonnet 4.5 · strong writing and analysis', input_modalities: ['text', 'image'], output_modalities: ['text'] },
        { name: 'gemini-large', description: 'Gemini 3 Pro · multimodal reasoning', input_modalities: ['text', 'image', 'audio', 'video'], output_modalities: ['text'], reasoning: true, tools: ['search', 'code_execution'] },
        { name: 'perplexity-fast', description: 'Perplexity Sonar · web grounded', input_modalities: ['text'], output_modalities: ['text'], tools: ['search'] }
    ],
    image: [
        { name: 'zimage', description: 'Default Pollinations image model', output_modalities: ['image'] },
        { name: 'flux', description: 'Flux image generation', output_modalities: ['image'] },
        { name: 'gptimage', description: 'GPT Image generation', output_modalities: ['image'] }
    ],
    video: [
        { name: 'veo', description: 'Google Veo video generation', output_modalities: ['video'] },
        { name: 'wan', description: 'Wan video generation', output_modalities: ['video'] },
        { name: 'nova-reel', description: 'Nova Reel longform generation', output_modalities: ['video'] }
    ],
    audio: [
        { name: 'openai-audio', description: 'OpenAI speech model', voices: ['alloy', 'nova'], output_modalities: ['audio'] },
        { name: 'elevenmusic', description: 'Music generation', voices: ['alloy'], output_modalities: ['audio'] }
    ],
    embeddings: [
        { name: 'gemini-2', description: 'Gemini multimodal embeddings', input_modalities: ['text', 'image', 'audio', 'video'] },
        { name: 'openai-3-small', description: 'OpenAI smaller embeddings', input_modalities: ['text'] },
        { name: 'openai-3-large', description: 'OpenAI larger embeddings', input_modalities: ['text'] }
    ]
};

const uiState = readStorage(STORAGE_KEY_UI, {
    activeTab: 'chat',
    modelSearch: { chat: '', image: '', audio: '', video: '', embeddings: '' },
    favoritesOnly: { chat: false, image: false, audio: false, video: false, embeddings: false }
});

const state = {
    spec: null,
    activeTab: TAB_ORDER.includes(uiState.activeTab) ? uiState.activeTab : 'chat',
    chats: readStorage(STORAGE_KEY_CHATS, []),
    activeChatId: null,
    selectedImage: null,
    toolsEnabled: { search: false, code: false },
    settings: mergeSettings(readStorage(STORAGE_KEY_SETTINGS, {})),
    ui: uiState,
    outputs: readStorage(STORAGE_KEY_OUTPUTS, { image: [], audio: [], video: [], embeddings: [] }),
    tabForms: readStorage(STORAGE_KEY_FORMS, {}),
    fieldDefs: { image: [], audio: [], video: [], embeddings: [] },
    models: { chat: [], image: [], audio: [], video: [], embeddings: [] },
    runtimeOutputs: { image: null, audio: null, video: null, embeddings: null },
    lastRequests: { image: null, audio: null, video: null, embeddings: null },
    byop: { message: '', type: 'info' }
};

const elements = {
    mainContent: document.getElementById('mainContent'),
    sidebar: document.getElementById('sidebar'),
    chatHistory: document.getElementById('chatHistory'),
    messagesList: document.getElementById('messagesList'),
    chatInput: document.getElementById('chatInput'),
    sendBtn: document.getElementById('sendBtn'),
    chatModelSelector: document.getElementById('chatModelSelector'),
    chatModelSearch: document.getElementById('chatModelSearch'),
    chatFavoritesOnly: document.getElementById('chatFavoritesOnly'),
    toggleChatFavorite: document.getElementById('toggleChatFavorite'),
    chatModelMeta: document.getElementById('chatModelMeta'),
    reasoningEffort: document.getElementById('reasoningEffort'),
    thinkingToggle: document.getElementById('thinkingToggle'),
    thinkingToggleContainer: document.getElementById('thinkingToggleContainer'),
    searchToggle: document.getElementById('searchToggle'),
    codeToggle: document.getElementById('codeToggle'),
    welcomeScreen: document.getElementById('welcomeScreen'),
    imageInput: document.getElementById('imageInput'),
    attachBtn: document.getElementById('attachBtn'),
    imagePreviewContainer: document.getElementById('imagePreviewContainer'),
    newChatBtn: document.getElementById('newChatBtn'),
    settingsModal: document.getElementById('settingsModal'),
    byopModal: document.getElementById('byopModal'),
    commandPaletteModal: document.getElementById('commandPaletteModal'),
    apiKeyInput: document.getElementById('apiKey'),
    apiBaseUrlInput: document.getElementById('apiBaseUrl'),
    themeSelect: document.getElementById('themeSelect'),
    defaultModelSelect: document.getElementById('defaultModelSelect'),
    byopClientIdInput: document.getElementById('byopClientId'),
    byopRedirectUriInput: document.getElementById('byopRedirectUri'),
    byopScopeInput: document.getElementById('byopScope'),
    byopModelsInput: document.getElementById('byopModels'),
    byopBudgetInput: document.getElementById('byopBudget'),
    byopExpiryInput: document.getElementById('byopExpiry'),
    specBaseUrlLabel: document.getElementById('specBaseUrlLabel'),
    byopPreviewLink: document.getElementById('byopPreviewLink'),
    byopBanner: document.getElementById('byopBanner'),
    byopBannerCopy: document.getElementById('byopBannerCopy'),
    liveRegion: document.getElementById('liveRegion'),
    modalityTabs: document.getElementById('modalityTabs'),
    globalStatusPills: document.getElementById('globalStatusPills'),
    activeChatSummary: document.getElementById('activeChatSummary'),
    chatInputMeta: document.getElementById('chatInputMeta'),
    chatComposer: document.getElementById('chatComposer'),
    commandPaletteInput: document.getElementById('commandPaletteInput'),
    commandPaletteList: document.getElementById('commandPaletteList')
};

const builderRefs = {
    image: { builder: document.getElementById('imageBuilder'), output: document.getElementById('imageOutput'), history: document.getElementById('imageHistory'), status: document.getElementById('imageStatus') },
    audio: { builder: document.getElementById('audioBuilder'), output: document.getElementById('audioOutput'), history: document.getElementById('audioHistory'), status: document.getElementById('audioStatus') },
    video: { builder: document.getElementById('videoBuilder'), output: document.getElementById('videoOutput'), history: document.getElementById('videoHistory'), status: document.getElementById('videoStatus') },
    embeddings: { builder: document.getElementById('embeddingsBuilder'), output: document.getElementById('embeddingsOutput'), history: document.getElementById('embeddingsHistory'), status: document.getElementById('embeddingsStatus') }
};

function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
}

function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function mergeSettings(input) {
    const merged = { ...DEFAULT_SETTINGS, ...input };
    merged.favorites = {
        chat: [], image: [], audio: [], video: [], embeddings: [],
        ...(input?.favorites || {})
    };
    merged.tabDefaults = input?.tabDefaults || {};
    return merged;
}

function saveChats() {
    writeStorage(STORAGE_KEY_CHATS, state.chats);
}

function saveSettings() {
    writeStorage(STORAGE_KEY_SETTINGS, state.settings);
}

function saveUiState() {
    writeStorage(STORAGE_KEY_UI, state.ui);
}

function saveOutputs() {
    writeStorage(STORAGE_KEY_OUTPUTS, state.outputs);
}

function saveForms() {
    writeStorage(STORAGE_KEY_FORMS, state.tabForms);
}

function applyTheme(theme) {
    if (theme === 'system') {
        document.documentElement.className = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-theme' : 'light-theme';
    } else {
        document.documentElement.className = `${theme}-theme`;
    }
}

function announce(message) {
    elements.liveRegion.textContent = message;
}

function safeMarkdownParse(text) {
    if (!text) return '';
    try {
        return simpleMarkdown(text);
    } catch {
        return escapeHtml(text).replace(/\n/g, '<br>');
    }
}

function simpleMarkdown(source) {
    const escaped = escapeHtml(source);
    const codeBlocks = [];
    const withCodePlaceholders = escaped.replace(/```([\w-]+)?\n([\s\S]*?)```/g, (_, language = 'text', code) => {
        const token = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push(`<pre><code class="language-${language}">${code}</code></pre>`);
        return token;
    });

    const paragraphs = withCodePlaceholders
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block) => {
            if (/^[-*]\s/m.test(block)) {
                const items = block.split('\n').map((line) => line.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
                return `<ul>${items.map((item) => `<li>${formatInlineMarkdown(item)}</li>`).join('')}</ul>`;
            }
            if (/^\d+\.\s/m.test(block)) {
                const items = block.split('\n').map((line) => line.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
                return `<ol>${items.map((item) => `<li>${formatInlineMarkdown(item)}</li>`).join('')}</ol>`;
            }
            if (block.startsWith('&gt;')) {
                return `<blockquote>${formatInlineMarkdown(block.replace(/^&gt;\s?/gm, '').replace(/\n/g, '<br>'))}</blockquote>`;
            }
            return `<p>${formatInlineMarkdown(block.replace(/\n/g, '<br>'))}</p>`;
        })
        .join('');

    return codeBlocks.reduce((html, block, index) => html.replace(`__CODE_BLOCK_${index}__`, block), paragraphs);
}

function formatInlineMarkdown(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>');
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function titleCase(value) {
    return value
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, (match) => match.toUpperCase());
}

function truncate(text, length = 140) {
    if (!text) return '';
    return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function formatRelativeTime(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.round(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
}

function resolveRef(ref) {
    if (!ref || !state.spec) return null;
    return ref.replace('#/', '').split('/').reduce((acc, part) => acc?.[part], state.spec);
}

function getEndpoint(path, method) {
    return state.spec?.paths?.[path]?.[method];
}

function getSchemaProperties(schemaOrRef) {
    const schema = schemaOrRef?.$ref ? resolveRef(schemaOrRef.$ref) : schemaOrRef;
    return schema?.properties || {};
}

function inferFieldType(name, schema) {
    if (name === 'prompt' || name === 'input' || name === 'image') return 'textarea';
    if (schema.enum) return 'select';
    if (schema.type === 'boolean') return 'checkbox';
    if (schema.type === 'integer' || schema.type === 'number') return 'number';
    return 'text';
}

function createFieldDef(name, schema = {}, required = false, source = 'schema') {
    return {
        name,
        label: titleCase(name),
        required,
        description: schema.description || '',
        defaultValue: schema.default ?? '',
        type: inferFieldType(name, schema),
        enum: schema.enum || [],
        minimum: schema.minimum,
        maximum: schema.maximum,
        example: schema.example,
        source,
        fullSpan: ['prompt', 'input', 'image'].includes(name)
    };
}

function hydrateFieldDefs() {
    const imageEndpoint = getEndpoint('/image/{prompt}', 'get');
    const videoEndpoint = getEndpoint('/video/{prompt}', 'get');
    const audioEndpoint = getEndpoint('/v1/audio/speech', 'post');
    const embeddingsEndpoint = getEndpoint('/v1/embeddings', 'post');

    const buildFromParameters = (endpoint, names) => {
        const parameters = endpoint?.parameters || [];
        return names.map((name) => {
            const parameter = parameters.find((item) => item.name === name);
            return createFieldDef(name, parameter?.schema || {}, !!parameter?.required, 'parameter');
        });
    };

    const buildFromSchema = (endpoint, names) => {
        const schema = resolveRef(endpoint?.requestBody?.content?.['application/json']?.schema?.$ref);
        const properties = schema?.properties || {};
        const required = new Set(schema?.required || []);
        return names.map((name) => createFieldDef(name, properties[name] || {}, required.has(name), 'schema'));
    };

    state.fieldDefs.image = buildFromParameters(imageEndpoint, ['prompt', 'model', 'width', 'height', 'seed', 'enhance', 'negative_prompt', 'safe', 'quality', 'transparent']);
    state.fieldDefs.video = buildFromParameters(videoEndpoint, ['prompt', 'model', 'width', 'height', 'duration', 'aspectRatio', 'seed', 'enhance', 'safe', 'audio', 'image']);
    state.fieldDefs.audio = buildFromSchema(audioEndpoint, ['model', 'input', 'voice', 'response_format', 'speed', 'safe', 'duration', 'instrumental', 'style', 'instruct', 'seed']);
    state.fieldDefs.embeddings = buildFromSchema(embeddingsEndpoint, ['model', 'input', 'dimensions', 'task_type', 'encoding_format']);
}

function getSpecBaseUrl() {
    return state.settings.apiBaseUrl || state.spec?.servers?.[0]?.url || 'https://gen.pollinations.ai';
}

function getByopDocsText() {
    return JSON.stringify(state.spec || {}).match(/Bring Your Own Pollen[\s\S]*?Legacy names app_key, redirect_url, and permissions are still accepted for backwards compatibility\./)?.[0] || '';
}

function getGetKeyUrl() {
    const infoDescription = state.spec?.info?.description || '';
    const match = infoDescription.match(/https:\/\/enter\.pollinations\.ai/);
    return match?.[0] || 'https://enter.pollinations.ai';
}

function buildAuthorizeUrl() {
    const params = new URLSearchParams();
    const redirectUri = state.settings.byopRedirectUri || `${window.location.origin}${window.location.pathname}`;
    params.set('redirect_uri', redirectUri);

    if (state.settings.byopClientId.trim()) params.set('client_id', state.settings.byopClientId.trim());
    if (state.settings.byopScope.trim()) params.set('scope', state.settings.byopScope.trim());
    if (state.settings.byopModels.trim()) params.set('models', state.settings.byopModels.trim());
    if (state.settings.byopBudget.trim()) params.set('budget', state.settings.byopBudget.trim());
    if (state.settings.byopExpiry.trim()) params.set('expiry', state.settings.byopExpiry.trim());

    const stateToken = `pollinchat-${Math.random().toString(36).slice(2, 10)}`;
    params.set('state', stateToken);
    return `${getGetKeyUrl()}/authorize?${params.toString()}`;
}

function normalizeModel(model = {}, fallbackType = 'chat') {
    const inputModalities = model.input_modalities || model.inputModalities || [];
    const outputModalities = model.output_modalities || model.outputModalities || [];
    const tools = model.tools || model.tool_support || [];
    return {
        ...model,
        name: model.name,
        description: model.description || model.display_name || model.name,
        provider: model.provider || model.vendor || '',
        input_modalities: inputModalities,
        output_modalities: outputModalities.length ? outputModalities : [fallbackType === 'video' ? 'video' : fallbackType === 'audio' ? 'audio' : fallbackType === 'image' ? 'image' : 'text'],
        reasoning: Boolean(model.reasoning),
        tools,
        voices: model.voices || []
    };
}

async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

async function apiRequest(path, { method = 'GET', query = {}, body, responseType = 'json', requiresAuth = true } = {}) {
    const url = new URL(path, `${getSpecBaseUrl()}/`);
    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        url.searchParams.set(key, String(value));
    });

    const headers = {};
    if (body) headers['Content-Type'] = 'application/json';
    if (state.settings.apiKey) headers['Authorization'] = `Bearer ${state.settings.apiKey}`;
    if (requiresAuth && !state.settings.apiKey) {
        throw new Error('A Pollinations API key is required. Open BYOP to authorize or paste your key in Settings.');
    }

    const response = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
            const error = await response.json();
            message = error?.error?.message || error?.message || message;
        } catch {
            message = await response.text() || message;
        }
        throw new Error(message);
    }

    if (responseType === 'blob') return response.blob();
    if (responseType === 'text') return response.text();
    return response.json();
}

async function loadSpec() {
    state.spec = await fetchJson('./api.json');
    elements.specBaseUrlLabel.textContent = state.spec.servers?.[0]?.url || 'https://gen.pollinations.ai';
    hydrateFieldDefs();
}

async function loadModels() {
    const requests = {
        chat: apiRequest('/text/models', { requiresAuth: false }),
        image: apiRequest('/image/models', { requiresAuth: false }),
        audio: apiRequest('/audio/models', { requiresAuth: false }),
        embeddings: apiRequest('/embeddings/models', { requiresAuth: false })
    };

    const results = await Promise.allSettled(Object.values(requests));
    const keys = Object.keys(requests);

    keys.forEach((key, index) => {
        const result = results[index];
        const fallback = FALLBACK_MODELS[key];
        if (result.status === 'fulfilled' && Array.isArray(result.value) && result.value.length) {
            state.models[key] = result.value.map((model) => normalizeModel(model, key));
        } else {
            state.models[key] = fallback.map((model) => normalizeModel(model, key));
        }
    });

    const videoNamesFromSpec = new Set((getEndpoint('/video/{prompt}', 'get')?.parameters || [])
        .find((parameter) => parameter.name === 'model')?.schema?.enum || []);

    state.models.video = (state.models.image.length ? state.models.image : FALLBACK_MODELS.video)
        .filter((model) => model.output_modalities.includes('video') || videoNamesFromSpec.has(model.name) || /video|veo|wan|reel|seedance|ltx/i.test(model.name))
        .map((model) => normalizeModel(model, 'video'));

    if (!state.models.video.length) {
        state.models.video = FALLBACK_MODELS.video.map((model) => normalizeModel(model, 'video'));
    }

    if (!state.models.chat.length) {
        state.models.chat = FALLBACK_MODELS.chat.map((model) => normalizeModel(model, 'chat'));
    }
}

function currentChatModel() {
    return state.models.chat.find((model) => model.name === elements.chatModelSelector.value) || state.models.chat[0];
}

function renderTabs() {
    elements.modalityTabs.innerHTML = TAB_ORDER.map((tab, index) => {
        const meta = TAB_META[tab];
        const isActive = state.activeTab === tab ? 'active' : '';
        return `
            <button class="tab-btn ${isActive}" type="button" data-tab="${tab}" aria-pressed="${state.activeTab === tab}">
                <div class="tab-copy">
                    <strong><i class="fas ${meta.icon}"></i> ${meta.label}</strong>
                    <small>${meta.description}</small>
                </div>
                <kbd>Alt+${index + 1}</kbd>
            </button>
        `;
    }).join('');
}

function setActiveTab(tab) {
    if (!TAB_ORDER.includes(tab)) return;
    state.activeTab = tab;
    state.ui.activeTab = tab;
    saveUiState();
    document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.dataset.tab === tab));
    document.querySelectorAll('.tab-btn').forEach((button) => button.classList.toggle('active', button.dataset.tab === tab));
    elements.chatComposer.classList.toggle('hidden', tab !== 'chat');
    renderStatusPills();
    if (tab === 'chat') {
        requestAnimationFrame(() => scrollToBottom(false));
        elements.chatInput.focus();
    }
}

function renderStatusPills() {
    const totalModels = Object.values(state.models).reduce((sum, models) => sum + models.length, 0);
    elements.globalStatusPills.innerHTML = [
        `<span class="status-pill"><i class="fas fa-circle${state.settings.apiKey ? '-check' : '-xmark'}"></i>${state.settings.apiKey ? 'API key ready' : 'No key set'}</span>`,
        `<span class="status-pill"><i class="fas ${TAB_META[state.activeTab].icon}"></i>${TAB_META[state.activeTab].label}</span>`,
        `<span class="status-pill"><i class="fas fa-server"></i>${new URL(getSpecBaseUrl()).hostname}</span>`,
        `<span class="status-pill"><i class="fas fa-cubes"></i>${totalModels} models</span>`
    ].join('');
}

function populateChatModelSelectors() {
    const models = getFilteredModels('chat');
    const currentValue = elements.chatModelSelector.value || state.settings.defaultModel;
    elements.chatModelSelector.innerHTML = models.map((model) => `<option value="${model.name}">${truncate(model.description, 70)}</option>`).join('');
    elements.defaultModelSelect.innerHTML = state.models.chat.map((model) => `<option value="${model.name}">${truncate(model.description, 70)}</option>`).join('');

    if (models.find((model) => model.name === currentValue)) {
        elements.chatModelSelector.value = currentValue;
    } else if (models[0]) {
        elements.chatModelSelector.value = models[0].name;
    }

    if (state.models.chat.find((model) => model.name === state.settings.defaultModel)) {
        elements.defaultModelSelect.value = state.settings.defaultModel;
    } else if (state.models.chat[0]) {
        state.settings.defaultModel = state.models.chat[0].name;
        elements.defaultModelSelect.value = state.settings.defaultModel;
    }

    renderChatModelMeta();
    updateChatModelControls();
}

function renderChatModelMeta() {
    const model = currentChatModel();
    if (!model) {
        elements.chatModelMeta.innerHTML = '<span class="muted-copy">No chat models available.</span>';
        return;
    }

    const favorite = state.settings.favorites.chat.includes(model.name);
    elements.toggleChatFavorite.classList.toggle('active', favorite);
    elements.chatModelMeta.innerHTML = renderModelBadges(model, 'chat');
}

function renderModelBadges(model, tab) {
    const chips = [
        `<span class="model-chip"><strong>${escapeHtml(model.name)}</strong></span>`,
        model.provider ? `<span class="model-chip">${escapeHtml(model.provider)}</span>` : '',
        model.reasoning ? '<span class="model-chip">Reasoning</span>' : '',
        model.input_modalities?.length ? `<span class="model-chip">Input: ${model.input_modalities.join(', ')}</span>` : '',
        model.output_modalities?.length ? `<span class="model-chip">Output: ${model.output_modalities.join(', ')}</span>` : '',
        model.tools?.length ? `<span class="model-chip">Tools: ${model.tools.join(', ')}</span>` : '',
        model.voices?.length && tab === 'audio' ? `<span class="model-chip">${model.voices.length} voices</span>` : '',
        `<span class="muted-copy">${escapeHtml(truncate(model.description, 200))}</span>`
    ].filter(Boolean);
    return chips.join('');
}

function getFilteredModels(tab) {
    const models = state.models[tab] || [];
    const term = state.ui.modelSearch[tab]?.trim().toLowerCase() || '';
    const favoritesOnly = Boolean(state.ui.favoritesOnly[tab]);
    const favorites = new Set(state.settings.favorites[tab] || []);
    return models.filter((model) => {
        const matchesSearch = !term || `${model.name} ${model.description} ${model.provider}`.toLowerCase().includes(term);
        const matchesFavorite = !favoritesOnly || favorites.has(model.name);
        return matchesSearch && matchesFavorite;
    });
}

function toggleFavorite(tab, modelName) {
    if (!modelName) return;
    const favorites = new Set(state.settings.favorites[tab] || []);
    if (favorites.has(modelName)) {
        favorites.delete(modelName);
    } else {
        favorites.add(modelName);
    }
    state.settings.favorites[tab] = Array.from(favorites);
    saveSettings();
}

function updateChatModelControls() {
    const model = currentChatModel();
    if (!model) return;

    const supportsVision = model.input_modalities?.includes('image');
    const hasSearch = model.tools?.includes('search') || CHAT_TOOL_SEARCH_FALLBACK.includes(model.name);
    const hasCode = model.tools?.includes('code_execution') || CHAT_TOOL_CODE_FALLBACK.includes(model.name);
    const isReasoning = model.reasoning;

    elements.attachBtn.disabled = !supportsVision;
    elements.attachBtn.title = supportsVision ? 'Attach an image for the selected vision model' : 'Selected model does not support images';

    elements.searchToggle.style.display = hasSearch ? 'inline-flex' : 'none';
    elements.codeToggle.style.display = hasCode ? 'inline-flex' : 'none';
    elements.searchToggle.classList.toggle('active', hasSearch && state.toolsEnabled.search);
    elements.codeToggle.classList.toggle('active', hasCode && state.toolsEnabled.code);
    elements.thinkingToggleContainer.style.display = isReasoning ? 'inline-flex' : 'none';
    elements.reasoningEffort.style.display = isReasoning ? 'inline-flex' : 'none';

    if (model.name === 'gemini-large') {
        elements.reasoningEffort.innerHTML = '<option value="low">Low</option><option value="high">High</option>';
        elements.reasoningEffort.value = 'low';
    } else {
        elements.reasoningEffort.innerHTML = '<option value="none">None</option><option value="minimal">Minimal</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="xhigh">X-High</option>';
        if (!REASONING_EFFORT_MODELS.includes(model.name)) {
            elements.reasoningEffort.value = 'none';
        }
    }
}

function renderChatHistory() {
    elements.chatHistory.innerHTML = '';
    if (!state.chats.length) {
        elements.chatHistory.innerHTML = '<div class="muted-copy">No chats yet. Start a conversation or use <kbd>N</kbd>.</div>';
        return;
    }

    state.chats.forEach((chat) => {
        const item = document.createElement('div');
        item.className = `chat-history-item ${chat.id === state.activeChatId ? 'active' : ''}`;
        item.dataset.chatId = chat.id;
        item.innerHTML = `
            <i class="far fa-comment"></i>
            <span>${escapeHtml(chat.title)}</span>
            <button class="icon-btn tiny danger-icon" type="button" data-delete-chat="${chat.id}" aria-label="Delete chat"><i class="fas fa-trash"></i></button>
        `;
        elements.chatHistory.appendChild(item);
    });
}

function createNewChat() {
    const id = Date.now().toString();
    const chat = { id, title: 'New Chat', messages: [], timestamp: Date.now() };
    state.chats.unshift(chat);
    state.activeChatId = id;
    saveChats();
    renderChatHistory();
    clearMessages();
    updateActiveChatSummary();
    elements.welcomeScreen.classList.remove('hidden');
    if (window.innerWidth <= 768) elements.sidebar.classList.add('closed');
}

function loadChat(id) {
    const chat = state.chats.find((item) => item.id === id);
    if (!chat) return;
    state.activeChatId = id;
    clearMessages();
    renderChatHistory();

    if (!chat.messages.length) {
        elements.welcomeScreen.classList.remove('hidden');
    } else {
        elements.welcomeScreen.classList.add('hidden');
        chat.messages.forEach((message) => renderMessage(message));
    }

    updateActiveChatSummary();
    if (window.innerWidth <= 768) elements.sidebar.classList.add('closed');
    requestAnimationFrame(() => scrollToBottom(false));
}

function deleteChat(chatId) {
    if (!confirm('Delete this chat?')) return;
    state.chats = state.chats.filter((chat) => chat.id !== chatId);
    if (state.activeChatId === chatId) {
        state.activeChatId = null;
        clearMessages();
        elements.welcomeScreen.classList.remove('hidden');
    }
    saveChats();
    renderChatHistory();
    updateActiveChatSummary();
}

function clearMessages() {
    elements.messagesList.innerHTML = '';
}

function updateActiveChatSummary() {
    const chat = state.chats.find((item) => item.id === state.activeChatId);
    if (!chat) {
        elements.activeChatSummary.textContent = 'Start a conversation to see message counts, images, and timestamps here.';
        return;
    }
    const imageMessages = chat.messages.filter((message) => Array.isArray(message.content)).length;
    elements.activeChatSummary.innerHTML = `
        <div class="metric-grid">
            <div class="metric-card"><strong>${chat.messages.length}</strong><div class="muted-copy">Messages</div></div>
            <div class="metric-card"><strong>${imageMessages}</strong><div class="muted-copy">Vision turns</div></div>
            <div class="metric-card"><strong>${formatRelativeTime(chat.timestamp)}</strong><div class="muted-copy">Last updated</div></div>
            <div class="metric-card"><strong>${escapeHtml(chat.title)}</strong><div class="muted-copy">Title</div></div>
        </div>
    `;
}

function renderMessage(message, isPlaceholder = false) {
    const wrapper = document.createElement('div');
    wrapper.className = `message ${message.role}`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = message.role === 'user' ? '<i class="fas fa-user"></i>' : '<img src="logo.png" alt="Pollinations" width="22" height="22">';

    const content = document.createElement('div');
    content.className = `message-content${isPlaceholder ? ' placeholder' : ''}`;

    if (isPlaceholder) {
        content.innerHTML = `
            <div class="ai-thinking-status">Thinking…</div>
            <div class="typing-indicator"><span></span><span></span><span></span></div>
        `;
    } else {
        let html = '';
        const reasoning = message.reasoning || message.thinking;
        if (reasoning) {
            html += `
                <details class="thinking-dropdown">
                    <summary><i class="fas fa-brain"></i> Reasoning</summary>
                    <div class="thinking-content">${safeMarkdownParse(reasoning)}</div>
                </details>
            `;
        }

        if (Array.isArray(message.content)) {
            const textParts = [];
            message.content.forEach((part) => {
                if (part.type === 'text') textParts.push(part.text);
                if (part.type === 'image_url') {
                    html += `<p><img src="${escapeHtml(part.image_url.url)}" alt="Uploaded prompt reference" class="user-uploaded-image"></p>`;
                }
            });
            html += safeMarkdownParse(textParts.join('\n'));
        } else {
            html += safeMarkdownParse(message.content || '');
        }

        content.innerHTML = html;
        processCodeBlocks(content);
    }

    wrapper.appendChild(avatar);
    wrapper.appendChild(content);
    elements.messagesList.appendChild(wrapper);
    scrollToBottom();
    return wrapper;
}

function processCodeBlocks(container) {
    container.querySelectorAll('pre').forEach((pre) => {
        if (pre.querySelector('.code-header')) return;
        const code = pre.querySelector('code');
        if (!code) return;
        const language = Array.from(code.classList).find((className) => className.startsWith('language-'))?.replace('language-', '') || 'text';

        const header = document.createElement('div');
        header.className = 'code-header';
        header.innerHTML = `<span>${language}</span>`;

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-code-btn';
        copyBtn.type = 'button';
        copyBtn.innerHTML = '<i class="far fa-copy"></i> Copy';
        copyBtn.addEventListener('click', async () => {
            await navigator.clipboard.writeText(code.innerText);
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied';
            setTimeout(() => { copyBtn.innerHTML = '<i class="far fa-copy"></i> Copy'; }, 1800);
        });
        header.appendChild(copyBtn);
        pre.insertBefore(header, code);
        hljs.highlightElement(code);
    });
}

function scrollToBottom(smooth = true) {
    if (state.activeTab !== 'chat') return;
    elements.mainContent.scrollTo({ top: elements.mainContent.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
}

function updateChatComposerMeta() {
    const length = elements.chatInput.value.length;
    elements.chatInputMeta.textContent = `${length} characters · Enter to send · Shift+Enter for a new line`;
    elements.sendBtn.disabled = !elements.chatInput.value.trim() && !state.selectedImage;
}

function handleImageSelect(event) {
    const [file] = event.target.files || [];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
        state.selectedImage = loadEvent.target.result;
        renderImagePreview();
        updateChatComposerMeta();
    };
    reader.readAsDataURL(file);
    event.target.value = '';
}

function renderImagePreview() {
    elements.imagePreviewContainer.innerHTML = '';
    if (!state.selectedImage) return;
    const item = document.createElement('div');
    item.className = 'preview-item';
    item.innerHTML = `
        <img src="${state.selectedImage}" alt="Selected prompt image">
        <button type="button" aria-label="Remove image"><i class="fas fa-times"></i></button>
    `;
    item.querySelector('button').addEventListener('click', clearImagePreview);
    elements.imagePreviewContainer.appendChild(item);
}

function clearImagePreview() {
    state.selectedImage = null;
    elements.imagePreviewContainer.innerHTML = '';
    updateChatComposerMeta();
}

async function executeTool(name, args) {
    if (!window.websim?.chat?.completions?.create) {
        return { error: `${name} is unavailable in this runtime.` };
    }

    try {
        if (name === 'google_search') {
            const completion = await window.websim.chat.completions.create({
                messages: [
                    { role: 'system', content: 'Provide a concise factual search summary with notable sources and caveats.' },
                    { role: 'user', content: args.query }
                ]
            });
            return { query: args.query, results: completion.content, provider: 'Google' };
        }
        if (name === 'code_execution') {
            const completion = await window.websim.chat.completions.create({
                messages: [
                    { role: 'system', content: 'Act like a Python sandbox. Return stdout and the final result as JSON.' },
                    { role: 'user', content: args.code }
                ],
                json: true
            });
            return JSON.parse(completion.content);
        }
    } catch (error) {
        return { error: error.message };
    }
    return { error: 'Unsupported tool.' };
}

async function fetchAIResponse(messages) {
    const model = currentChatModel();
    const tools = [];
    const supportsSearch = model.tools?.includes('search') || CHAT_TOOL_SEARCH_FALLBACK.includes(model.name);
    const supportsCode = model.tools?.includes('code_execution') || CHAT_TOOL_CODE_FALLBACK.includes(model.name);
    if (supportsSearch && state.toolsEnabled.search) {
        tools.push({
            type: 'function',
            function: {
                name: 'google_search',
                description: 'Performs a Google search to retrieve fresh information.',
                parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] }
            }
        });
    }
    if (supportsCode && state.toolsEnabled.code) {
        tools.push({
            type: 'function',
            function: {
                name: 'code_execution',
                description: 'Executes Python code in a sandbox.',
                parameters: { type: 'object', properties: { code: { type: 'string' } }, required: ['code'] }
            }
        });
    }

    const payload = {
        model: model.name,
        messages,
        stream: false,
        tools: tools.length ? tools : undefined,
        tool_choice: tools.length ? 'auto' : undefined
    };

    if (model.reasoning) {
        payload.thinking = { type: elements.thinkingToggle.checked ? 'enabled' : 'disabled' };
        if (REASONING_EFFORT_MODELS.includes(model.name)) {
            payload.reasoning_effort = elements.reasoningEffort.value;
        }
    }

    while (true) {
        const response = await apiRequest('/v1/chat/completions', { method: 'POST', body: payload, responseType: 'json' });
        return response;
    }
}

async function generateChatTitle(chat) {
    const firstUser = chat.messages.find((message) => message.role === 'user');
    if (!firstUser) return;
    const sourceText = Array.isArray(firstUser.content)
        ? firstUser.content.find((part) => part.type === 'text')?.text
        : firstUser.content;
    if (!sourceText?.trim()) return;

    try {
        const result = await apiRequest('/v1/chat/completions', {
            method: 'POST',
            body: {
                model: 'openai',
                messages: [
                    { role: 'system', content: 'Return a concise title under five words for this chat. Title only.' },
                    { role: 'user', content: sourceText.slice(0, 200) }
                ],
                stream: false
            },
            responseType: 'json'
        });
        const title = result?.choices?.[0]?.message?.content?.trim();
        if (title) {
            chat.title = title.slice(0, 60);
            saveChats();
            renderChatHistory();
            updateActiveChatSummary();
        }
    } catch (error) {
        console.warn('Title generation failed:', error);
    }
}

async function sendMessage() {
    const text = elements.chatInput.value.trim();
    const image = state.selectedImage;
    if (!text && !image) return;

    if (!state.settings.apiKey) {
        openByopModal();
        throw new Error('A Pollinations API key is required.');
    }

    if (!state.activeChatId) createNewChat();
    const chat = state.chats.find((item) => item.id === state.activeChatId);
    if (!chat) return;

    elements.welcomeScreen.classList.add('hidden');
    elements.chatInput.value = '';
    elements.chatInput.style.height = 'auto';
    clearImagePreview();
    updateChatComposerMeta();

    let content = text;
    if (image && currentChatModel()?.input_modalities?.includes('image')) {
        content = [
            { type: 'text', text: text || 'Describe this image.' },
            { type: 'image_url', image_url: { url: image } }
        ];
    }

    const userMessage = { role: 'user', content };
    chat.messages.push(userMessage);
    renderMessage(userMessage);
    saveChats();
    updateActiveChatSummary();

    const placeholder = renderMessage({ role: 'assistant', content: '' }, true);
    const placeholderContent = placeholder.querySelector('.message-content');

    try {
        let toolLoop = true;
        while (toolLoop) {
            const response = await fetchAIResponse(chat.messages);
            const aiMessage = response?.choices?.[0]?.message || {};
            const reasoning = aiMessage.reasoning || aiMessage.thinking || null;
            if (aiMessage.tool_calls?.length) {
                chat.messages.push(aiMessage);
                placeholderContent.querySelector('.ai-thinking-status').textContent = `Using ${aiMessage.tool_calls.map((call) => call.function.name).join(', ')}…`;
                for (const call of aiMessage.tool_calls) {
                    const args = JSON.parse(call.function.arguments || '{}');
                    const result = await executeTool(call.function.name, args);
                    chat.messages.push({ role: 'tool', tool_call_id: call.id, name: call.function.name, content: JSON.stringify(result) });
                }
            } else {
                toolLoop = false;
                placeholderContent.classList.remove('placeholder');
                const finalMessage = { role: 'assistant', content: aiMessage.content || '', reasoning };
                chat.messages.push(finalMessage);
                placeholder.replaceWith(renderMessage(finalMessage));
            }
        }

        saveChats();
        updateActiveChatSummary();
        if (chat.messages.length === 2 && chat.title === 'New Chat') {
            generateChatTitle(chat);
        }
    } catch (error) {
        placeholderContent.classList.remove('placeholder');
        placeholderContent.innerHTML = `<div class="error-card"><strong>Request failed.</strong><div>${escapeHtml(error.message)}</div><div class="history-item-actions"><button class="ghost-btn tiny" data-retry-chat="1">Retry last turn</button></div></div>`;
    }
}

function exportJsonFile(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, filename);
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function copyText(value, label = 'Copied to clipboard') {
    navigator.clipboard.writeText(value);
    announce(label);
}

function collectTranscript() {
    const chat = state.chats.find((item) => item.id === state.activeChatId);
    if (!chat) return '';
    return chat.messages.map((message) => {
        const content = Array.isArray(message.content)
            ? message.content.map((part) => part.type === 'text' ? part.text : '[image]').join(' ')
            : message.content;
        return `${message.role.toUpperCase()}: ${content || ''}`;
    }).join('\n\n');
}

function defaultFormValues(tab) {
    return {
        image: { prompt: '', model: state.models.image[0]?.name || 'zimage', width: 1024, height: 1024, seed: 0, enhance: false, negative_prompt: 'worst quality, blurry', safe: '', quality: 'medium', transparent: false },
        audio: { model: state.models.audio[0]?.name || 'openai-audio', input: '', voice: 'alloy', response_format: 'mp3', speed: 1, safe: '', duration: '', instrumental: false, style: '', instruct: '', seed: '' },
        video: { prompt: '', model: state.models.video[0]?.name || 'veo', width: 1024, height: 1024, duration: 6, aspectRatio: '16:9', seed: 0, enhance: false, safe: '', audio: false, image: '' },
        embeddings: { model: state.models.embeddings[0]?.name || 'gemini-2', input: '', dimensions: 768, task_type: 'SEMANTIC_SIMILARITY', encoding_format: 'float' }
    }[tab];
}

function getFormState(tab) {
    const saved = state.tabForms[tab] || {};
    const defaults = state.settings.tabDefaults[tab] || {};
    return { ...defaultFormValues(tab), ...defaults, ...saved };
}

function setFormState(tab, updates) {
    state.tabForms[tab] = { ...getFormState(tab), ...updates };
    saveForms();
}

function setTabStatus(tab, message, kind = 'info') {
    const ref = builderRefs[tab];
    ref.status.className = `status-box${kind === 'error' ? ' error' : kind === 'success' ? ' success' : ''}`;
    ref.status.textContent = message;
}

function renderBuilder(tab) {
    const ref = builderRefs[tab];
    const values = getFormState(tab);
    const definitions = state.fieldDefs[tab];
    const models = getFilteredModels(tab);
    const selectedModel = values.model && models.find((model) => model.name === values.model) ? values.model : models[0]?.name || values.model;
    values.model = selectedModel;
    setFormState(tab, { model: selectedModel });

    ref.builder.innerHTML = `
        <div class="builder-form">
            <div class="field-group full-span">
                <div class="field-header">
                    <span class="field-label">Preset</span>
                    <span class="muted-copy">Spec-driven defaults + one-click prompt starters.</span>
                </div>
                <div class="model-picker-row">
                    <select class="select-input" id="${tab}PresetSelect">
                        <option value="">Choose a preset…</option>
                        ${PRESETS[tab].map((preset) => `<option value="${escapeHtml(preset.name)}">${escapeHtml(preset.name)}</option>`).join('')}
                    </select>
                    <button class="ghost-btn" type="button" id="${tab}ApplyPresetBtn"><i class="fas fa-wand-magic-sparkles"></i><span>Apply preset</span></button>
                </div>
            </div>
            <div class="field-group full-span">
                <div class="field-header">
                    <span class="field-label">Model</span>
                    <span class="muted-copy">Live models fetched from Pollinations model endpoints.</span>
                </div>
                <div class="model-picker-row">
                    <input class="text-input compact" type="search" id="${tab}ModelSearch" placeholder="Search ${tab} models" value="${escapeHtml(state.ui.modelSearch[tab] || '')}">
                    <label class="check-chip"><input type="checkbox" id="${tab}FavoritesOnly" ${state.ui.favoritesOnly[tab] ? 'checked' : ''}><span>Favorites</span></label>
                    <button class="icon-btn ${state.settings.favorites[tab].includes(selectedModel) ? 'active' : ''}" type="button" id="${tab}FavoriteBtn"><i class="fas fa-star"></i></button>
                </div>
                <select class="select-input" id="${tab}ModelSelect">
                    ${models.map((model) => `<option value="${model.name}" ${model.name === selectedModel ? 'selected' : ''}>${escapeHtml(truncate(model.description, 90))}</option>`).join('')}
                </select>
                <div class="model-meta" id="${tab}ModelMeta">${renderModelBadges((state.models[tab].find((model) => model.name === selectedModel) || models[0] || {}), tab)}</div>
            </div>
            <div class="form-grid">
                ${definitions.filter((field) => field.name !== 'model').map((field) => renderField(tab, field, values[field.name])).join('')}
            </div>
            <div class="form-actions">
                <div class="history-actions">
                    <button class="ghost-btn" type="button" id="${tab}CopyRequestBtn"><i class="fas fa-copy"></i><span>Copy request</span></button>
                    <button class="ghost-btn" type="button" id="${tab}ResetFormBtn"><i class="fas fa-rotate-left"></i><span>Reset form</span></button>
                    <button class="ghost-btn" type="button" id="${tab}SaveDefaultsBtn"><i class="fas fa-thumbtack"></i><span>Save defaults</span></button>
                </div>
                <button class="primary-btn" type="button" id="${tab}RunBuilderBtn"><i class="fas fa-play"></i><span>${tab === 'embeddings' ? 'Generate vector' : 'Run request'}</span></button>
            </div>
        </div>
    `;

    attachBuilderListeners(tab);
}

function renderField(tab, field, value) {
    const current = value ?? field.defaultValue ?? '';
    const counter = typeof current === 'string' ? `${current.length} chars` : field.example ? `e.g. ${field.example}` : '';
    const help = escapeHtml(field.description || '');
    const id = `${tab}Field${field.name}`;
    const className = `field-group${field.fullSpan ? ' full-span' : ''}`;

    let control = '';
    if (field.type === 'select') {
        control = `
            <select class="select-input" id="${id}" data-tab="${tab}" data-field="${field.name}">
                ${field.enum.map((option) => `<option value="${escapeHtml(String(option))}" ${String(option) === String(current) ? 'selected' : ''}>${escapeHtml(String(option))}</option>`).join('')}
            </select>
        `;
    } else if (field.type === 'checkbox') {
        control = `<label class="check-chip"><input type="checkbox" id="${id}" data-tab="${tab}" data-field="${field.name}" ${current ? 'checked' : ''}><span>${field.label}</span></label>`;
    } else if (field.type === 'textarea') {
        control = `<textarea class="text-input textarea-large" id="${id}" data-tab="${tab}" data-field="${field.name}" placeholder="${escapeHtml(field.example || field.description || field.label)}">${escapeHtml(String(current || ''))}</textarea>`;
    } else {
        const min = field.minimum !== undefined ? `min="${field.minimum}"` : '';
        const max = field.maximum !== undefined ? `max="${field.maximum}"` : '';
        control = `<input class="text-input" type="${field.type === 'number' ? 'number' : 'text'}" id="${id}" data-tab="${tab}" data-field="${field.name}" value="${escapeHtml(String(current || ''))}" placeholder="${escapeHtml(field.example || field.label)}" ${min} ${max}>`;
    }

    return `
        <div class="${className}">
            <div class="field-header">
                <label class="field-label" for="${id}">${field.label}${field.required ? ' *' : ''}</label>
                <span class="muted-copy">${escapeHtml(counter)}</span>
            </div>
            ${control}
            ${help ? `<div class="field-help">${help}</div>` : ''}
        </div>
    `;
}

function attachBuilderListeners(tab) {
    const ref = builderRefs[tab].builder;
    ref.querySelectorAll('[data-field]').forEach((input) => {
        input.addEventListener('input', (event) => {
            const { field } = event.target.dataset;
            const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
            setFormState(tab, { [field]: value });
        });
        input.addEventListener('change', (event) => {
            const { field } = event.target.dataset;
            const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
            setFormState(tab, { [field]: value });
        });
    });

    ref.querySelector(`#${tab}ModelSearch`).addEventListener('input', (event) => {
        state.ui.modelSearch[tab] = event.target.value;
        saveUiState();
        renderBuilder(tab);
    });

    ref.querySelector(`#${tab}FavoritesOnly`).addEventListener('change', (event) => {
        state.ui.favoritesOnly[tab] = event.target.checked;
        saveUiState();
        renderBuilder(tab);
    });

    ref.querySelector(`#${tab}ModelSelect`).addEventListener('change', (event) => {
        setFormState(tab, { model: event.target.value });
        renderBuilder(tab);
    });

    ref.querySelector(`#${tab}FavoriteBtn`).addEventListener('click', () => {
        toggleFavorite(tab, getFormState(tab).model);
        renderBuilder(tab);
    });

    ref.querySelector(`#${tab}ApplyPresetBtn`).addEventListener('click', () => {
        const presetName = ref.querySelector(`#${tab}PresetSelect`).value;
        const preset = PRESETS[tab].find((item) => item.name === presetName);
        if (!preset) return;
        setFormState(tab, preset.values);
        renderBuilder(tab);
        setTabStatus(tab, `${preset.name} preset applied.`, 'success');
    });

    ref.querySelector(`#${tab}CopyRequestBtn`).addEventListener('click', () => {
        copyText(JSON.stringify(buildRequestPreview(tab), null, 2), `${TAB_META[tab].label} request copied.`);
    });

    ref.querySelector(`#${tab}ResetFormBtn`).addEventListener('click', () => {
        state.tabForms[tab] = defaultFormValues(tab);
        saveForms();
        renderBuilder(tab);
        setTabStatus(tab, 'Form reset to defaults.', 'success');
    });

    ref.querySelector(`#${tab}SaveDefaultsBtn`).addEventListener('click', () => {
        state.settings.tabDefaults[tab] = { ...getFormState(tab) };
        saveSettings();
        setTabStatus(tab, 'Saved current values as this tab’s defaults.', 'success');
    });

    ref.querySelector(`#${tab}RunBuilderBtn`).addEventListener('click', () => runBuilder(tab));
}

function buildRequestPreview(tab) {
    const values = getFormState(tab);
    if (tab === 'image') {
        const { prompt, ...query } = values;
        return { method: 'GET', url: `${getSpecBaseUrl()}/image/${encodeURIComponent(prompt || '')}`, query };
    }
    if (tab === 'video') {
        const { prompt, ...query } = values;
        return { method: 'GET', url: `${getSpecBaseUrl()}/video/${encodeURIComponent(prompt || '')}`, query };
    }
    if (tab === 'audio') {
        return { method: 'POST', url: `${getSpecBaseUrl()}/v1/audio/speech`, body: serializeBuilderValues(tab, values) };
    }
    return { method: 'POST', url: `${getSpecBaseUrl()}/v1/embeddings`, body: serializeBuilderValues(tab, values) };
}

function serializeBuilderValues(tab, values) {
    const output = { ...values };
    Object.keys(output).forEach((key) => {
        if (output[key] === '' || output[key] === undefined || output[key] === null) delete output[key];
    });

    if (tab === 'audio' || tab === 'video' || tab === 'image') {
        ['width', 'height', 'duration', 'seed'].forEach((key) => {
            if (output[key] !== undefined && output[key] !== '') output[key] = Number(output[key]);
        });
        if (output.speed !== undefined) output.speed = Number(output.speed);
    }

    if (tab === 'embeddings') {
        if (output.dimensions !== undefined) output.dimensions = Number(output.dimensions);
        if (typeof output.input === 'string' && output.input.includes('\n')) {
            const rows = output.input.split('\n').map((line) => line.trim()).filter(Boolean);
            if (rows.length > 1) output.input = rows;
        }
    }

    return output;
}

function pushHistoryEntry(tab, entry) {
    state.outputs[tab].unshift(entry);
    state.outputs[tab] = state.outputs[tab].slice(0, 12);
    saveOutputs();
    renderHistory(tab);
}

function renderHistory(tab) {
    const container = builderRefs[tab].history;
    const entries = state.outputs[tab] || [];
    if (!entries.length) {
        container.innerHTML = `<div class="muted-copy">No ${tab} history yet.</div>`;
        return;
    }

    container.innerHTML = entries.map((entry, index) => `
        <div class="history-item-card">
            <div><strong>${escapeHtml(entry.title)}</strong></div>
            <div class="muted-copy">${escapeHtml(entry.subtitle)}</div>
            <div class="muted-copy">${formatRelativeTime(entry.timestamp)}</div>
            <div class="history-item-actions">
                <button class="ghost-btn tiny" type="button" data-restore="${tab}:${index}"><i class="fas fa-rotate-left"></i><span>Restore</span></button>
                <button class="ghost-btn tiny" type="button" data-copy-history="${tab}:${index}"><i class="fas fa-copy"></i><span>Copy JSON</span></button>
            </div>
        </div>
    `).join('');
}

function renderOutput(tab) {
    const ref = builderRefs[tab].output;
    const output = state.runtimeOutputs[tab];
    if (!output) {
        ref.classList.add('empty-state');
        ref.textContent = tab === 'embeddings' ? 'No embedding yet.' : `No ${tab} yet.`;
        return;
    }

    ref.classList.remove('empty-state');

    if (tab === 'image') {
        ref.innerHTML = `
            <div class="output-card">
                <img src="${output.url}" alt="Generated image" class="generated-media">
                <div class="output-actions">
                    <button class="ghost-btn" type="button" data-download-runtime="image"><i class="fas fa-download"></i><span>Download</span></button>
                    <button class="ghost-btn" type="button" data-open-runtime="image"><i class="fas fa-arrow-up-right-from-square"></i><span>Open</span></button>
                    <button class="ghost-btn" type="button" data-copy-runtime="image"><i class="fas fa-copy"></i><span>Copy prompt</span></button>
                </div>
            </div>
        `;
    } else if (tab === 'audio') {
        ref.innerHTML = `
            <div class="output-card">
                <audio controls src="${output.url}"></audio>
                <div class="output-actions">
                    <button class="ghost-btn" type="button" data-download-runtime="audio"><i class="fas fa-download"></i><span>Download</span></button>
                    <button class="ghost-btn" type="button" data-open-runtime="audio"><i class="fas fa-arrow-up-right-from-square"></i><span>Open</span></button>
                    <button class="ghost-btn" type="button" data-copy-runtime="audio"><i class="fas fa-copy"></i><span>Copy prompt</span></button>
                </div>
            </div>
        `;
    } else if (tab === 'video') {
        ref.innerHTML = `
            <div class="output-card">
                <video controls src="${output.url}" class="generated-media"></video>
                <div class="output-actions">
                    <button class="ghost-btn" type="button" data-download-runtime="video"><i class="fas fa-download"></i><span>Download</span></button>
                    <button class="ghost-btn" type="button" data-open-runtime="video"><i class="fas fa-arrow-up-right-from-square"></i><span>Open</span></button>
                    <button class="ghost-btn" type="button" data-copy-runtime="video"><i class="fas fa-copy"></i><span>Copy prompt</span></button>
                </div>
            </div>
        `;
    } else {
        ref.innerHTML = `
            <div class="output-card">
                <div class="metric-grid">
                    <div class="metric-card"><strong>${output.count}</strong><div class="muted-copy">Vectors</div></div>
                    <div class="metric-card"><strong>${output.dimensions}</strong><div class="muted-copy">Dimensions</div></div>
                    <div class="metric-card"><strong>${escapeHtml(output.model)}</strong><div class="muted-copy">Model</div></div>
                    <div class="metric-card"><strong>${escapeHtml(output.encoding)}</strong><div class="muted-copy">Encoding</div></div>
                </div>
                <textarea class="text-input textarea-large" readonly>${escapeHtml(JSON.stringify(output.preview, null, 2))}</textarea>
                <div class="output-actions">
                    <button class="ghost-btn" type="button" data-copy-runtime="embeddings"><i class="fas fa-copy"></i><span>Copy vector JSON</span></button>
                    <button class="ghost-btn" type="button" data-download-runtime="embeddings"><i class="fas fa-download"></i><span>Download JSON</span></button>
                </div>
            </div>
        `;
    }
}

async function runBuilder(tab) {
    try {
        if (!state.settings.apiKey) {
            openByopModal();
            throw new Error('Bring Your Own Pollen is required before generating content.');
        }

        const values = serializeBuilderValues(tab, getFormState(tab));
        state.lastRequests[tab] = JSON.parse(JSON.stringify(values));
        setTabStatus(tab, `Running ${TAB_META[tab].label.toLowerCase()} request…`);

        if (tab === 'image') {
            if (!values.prompt?.trim()) throw new Error('Prompt is required.');
            const { prompt, ...query } = values;
            const blob = await apiRequest(`/image/${encodeURIComponent(prompt)}`, { query, responseType: 'blob' });
            const url = URL.createObjectURL(blob);
            state.runtimeOutputs.image = { url, prompt, blob };
            renderOutput('image');
            setTabStatus('image', 'Image generated successfully.', 'success');
            pushHistoryEntry('image', { timestamp: Date.now(), title: prompt, subtitle: values.model, values });
        }

        if (tab === 'audio') {
            if (!values.input?.trim()) throw new Error('Input text is required.');
            const blob = await apiRequest('/v1/audio/speech', { method: 'POST', body: values, responseType: 'blob' });
            const url = URL.createObjectURL(blob);
            state.runtimeOutputs.audio = { url, prompt: values.input, blob };
            renderOutput('audio');
            setTabStatus('audio', 'Audio generated successfully.', 'success');
            pushHistoryEntry('audio', { timestamp: Date.now(), title: truncate(values.input, 60), subtitle: `${values.model || 'default'} · ${values.voice || 'alloy'}`, values });
        }

        if (tab === 'video') {
            if (!values.prompt?.trim()) throw new Error('Prompt is required.');
            const { prompt, ...query } = values;
            const blob = await apiRequest(`/video/${encodeURIComponent(prompt)}`, { query, responseType: 'blob' });
            const url = URL.createObjectURL(blob);
            state.runtimeOutputs.video = { url, prompt, blob };
            renderOutput('video');
            setTabStatus('video', 'Video generated successfully.', 'success');
            pushHistoryEntry('video', { timestamp: Date.now(), title: prompt, subtitle: `${values.model} · ${values.duration || 'auto'}s`, values });
        }

        if (tab === 'embeddings') {
            if (!values.input) throw new Error('Input is required.');
            const json = await apiRequest('/v1/embeddings', { method: 'POST', body: values, responseType: 'json' });
            const vectors = json.data || [];
            const firstEmbedding = vectors[0]?.embedding;
            state.runtimeOutputs.embeddings = {
                preview: json,
                count: vectors.length,
                dimensions: Array.isArray(firstEmbedding) ? firstEmbedding.length : typeof firstEmbedding === 'string' ? 'base64' : 0,
                model: json.model || values.model,
                encoding: values.encoding_format || 'float'
            };
            renderOutput('embeddings');
            setTabStatus('embeddings', 'Embeddings generated successfully.', 'success');
            pushHistoryEntry('embeddings', { timestamp: Date.now(), title: truncate(Array.isArray(values.input) ? values.input.join(' | ') : values.input, 70), subtitle: `${values.model} · ${state.runtimeOutputs.embeddings.dimensions} dims`, values, preview: json });
        }
    } catch (error) {
        setTabStatus(tab, error.message, 'error');
    }
}

function restoreHistory(tab, index) {
    const entry = state.outputs[tab][index];
    if (!entry) return;
    state.tabForms[tab] = { ...defaultFormValues(tab), ...entry.values };
    saveForms();
    renderBuilder(tab);
    setTabStatus(tab, 'Restored values from history.', 'success');
}

function renderAllBuilders() {
    GENERATION_TABS.forEach((tab) => {
        renderBuilder(tab);
        renderHistory(tab);
        renderOutput(tab);
    });
}

function renderByopState() {
    const hasKey = Boolean(state.settings.apiKey);
    elements.byopBanner.classList.toggle('hidden', hasKey);
    elements.byopBannerCopy.textContent = hasKey
        ? 'API key stored locally in this browser.'
        : state.byop.message || 'Authorize with Pollinations or paste your own API key. Keys are stored only in this browser.';
    elements.byopPreviewLink.value = buildAuthorizeUrl();
}

function openModal(modal) {
    modal.classList.add('open');
}

function closeModal(modal) {
    modal.classList.remove('open');
}

function openSettings() {
    elements.apiKeyInput.value = state.settings.apiKey;
    elements.apiBaseUrlInput.value = state.settings.apiBaseUrl;
    elements.themeSelect.value = state.settings.theme;
    elements.defaultModelSelect.value = state.settings.defaultModel;
    elements.byopClientIdInput.value = state.settings.byopClientId;
    elements.byopRedirectUriInput.value = state.settings.byopRedirectUri;
    elements.byopScopeInput.value = state.settings.byopScope;
    elements.byopModelsInput.value = state.settings.byopModels;
    elements.byopBudgetInput.value = state.settings.byopBudget;
    elements.byopExpiryInput.value = state.settings.byopExpiry;
    openModal(elements.settingsModal);
}

function openByopModal() {
    renderByopState();
    openModal(elements.byopModal);
}

function renderCommandPalette(filter = '') {
    const commands = [
        ...TAB_ORDER.map((tab) => ({ label: `Switch to ${TAB_META[tab].label}`, hotkey: `Alt+${TAB_ORDER.indexOf(tab) + 1}`, action: () => setActiveTab(tab) })),
        { label: 'New chat', hotkey: 'N', action: createNewChat },
        { label: 'Open settings', hotkey: '', action: openSettings },
        { label: 'Open BYOP modal', hotkey: '', action: openByopModal },
        { label: 'Focus chat composer', hotkey: '/', action: () => { setActiveTab('chat'); elements.chatInput.focus(); } },
        { label: 'Copy transcript', hotkey: '', action: () => copyText(collectTranscript(), 'Transcript copied.') }
    ];

    const filtered = commands.filter((command) => command.label.toLowerCase().includes(filter.toLowerCase()));
    elements.commandPaletteList.innerHTML = filtered.map((command, index) => `
        <button class="command-item ${index === 0 ? 'active' : ''}" type="button" data-command-index="${index}">
            <span>${escapeHtml(command.label)}</span>
            <kbd>${escapeHtml(command.hotkey || 'Enter')}</kbd>
        </button>
    `).join('');

    elements.commandPaletteList.querySelectorAll('[data-command-index]').forEach((button) => {
        button.addEventListener('click', () => {
            filtered[Number(button.dataset.commandIndex)].action();
            closeModal(elements.commandPaletteModal);
        });
    });
}

function handleByopRedirect() {
    if (!window.location.hash.startsWith('#')) return;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const apiKey = params.get('api_key');
    const error = params.get('error');

    if (apiKey) {
        state.settings.apiKey = apiKey;
        saveSettings();
        state.byop.message = 'Authorization complete. Your scoped key was saved from the redirect fragment.';
        announce(state.byop.message);
        history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
    } else if (error) {
        state.byop.message = `Authorization returned: ${error}.`;
        announce(state.byop.message);
        history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
    }
}

function bindStaticEvents() {
    document.getElementById('mobileMenuBtn').addEventListener('click', () => elements.sidebar.classList.toggle('closed'));
    document.getElementById('closeSidebarBtn').addEventListener('click', () => elements.sidebar.classList.add('closed'));
    elements.newChatBtn.addEventListener('click', createNewChat);
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('topBarSettingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettings').addEventListener('click', () => closeModal(elements.settingsModal));
    document.getElementById('openByopModalBtn').addEventListener('click', openByopModal);
    document.getElementById('authorizeByopBtn').addEventListener('click', () => { window.location.href = buildAuthorizeUrl(); });
    document.getElementById('authorizeByopModalBtn').addEventListener('click', () => { window.location.href = buildAuthorizeUrl(); });
    document.getElementById('closeByopModal').addEventListener('click', () => closeModal(elements.byopModal));
    document.getElementById('openKeySettingsBtn').addEventListener('click', () => { closeModal(elements.byopModal); openSettings(); });
    document.getElementById('openSettingsFromByop').addEventListener('click', () => { closeModal(elements.byopModal); openSettings(); });
    document.getElementById('commandPaletteBtn').addEventListener('click', () => { renderCommandPalette(); openModal(elements.commandPaletteModal); elements.commandPaletteInput.value = ''; elements.commandPaletteInput.focus(); });
    document.getElementById('closeCommandPalette').addEventListener('click', () => closeModal(elements.commandPaletteModal));

    document.getElementById('saveSettings').addEventListener('click', () => {
        state.settings.apiKey = elements.apiKeyInput.value.trim();
        state.settings.apiBaseUrl = elements.apiBaseUrlInput.value.trim();
        state.settings.theme = elements.themeSelect.value;
        state.settings.defaultModel = elements.defaultModelSelect.value;
        state.settings.byopClientId = elements.byopClientIdInput.value.trim();
        state.settings.byopRedirectUri = elements.byopRedirectUriInput.value.trim();
        state.settings.byopScope = elements.byopScopeInput.value.trim();
        state.settings.byopModels = elements.byopModelsInput.value.trim();
        state.settings.byopBudget = elements.byopBudgetInput.value.trim();
        state.settings.byopExpiry = elements.byopExpiryInput.value.trim();
        saveSettings();
        applyTheme(state.settings.theme);
        renderByopState();
        renderStatusPills();
        closeModal(elements.settingsModal);
        announce('Settings saved.');
    });

    document.getElementById('clearStoredKeyBtn').addEventListener('click', () => {
        state.settings.apiKey = '';
        saveSettings();
        elements.apiKeyInput.value = '';
        renderByopState();
        renderStatusPills();
        announce('Stored API key cleared.');
    });

    document.getElementById('resetDefaultsBtn').addEventListener('click', () => {
        state.settings.tabDefaults = {};
        saveSettings();
        renderAllBuilders();
        announce('Saved tab defaults reset.');
    });

    document.getElementById('deleteAllSidebarBtn').addEventListener('click', () => {
        if (!confirm('Delete all chats?')) return;
        state.chats = [];
        state.activeChatId = null;
        saveChats();
        renderChatHistory();
        clearMessages();
        elements.welcomeScreen.classList.remove('hidden');
        updateActiveChatSummary();
    });

    document.getElementById('exportChatsBtn').addEventListener('click', () => exportJsonFile('pollinchat-chats.json', state.chats));
    document.getElementById('copyTranscriptBtn').addEventListener('click', () => copyText(collectTranscript(), 'Transcript copied.'));
    document.getElementById('downloadTranscriptBtn').addEventListener('click', () => {
        const blob = new Blob([collectTranscript()], { type: 'text/plain' });
        downloadBlob(blob, 'pollinchat-transcript.txt');
    });
    document.getElementById('scrollToBottomBtn').addEventListener('click', () => scrollToBottom());

    elements.chatInput.addEventListener('input', () => {
        elements.chatInput.style.height = 'auto';
        elements.chatInput.style.height = `${elements.chatInput.scrollHeight}px`;
        updateChatComposerMeta();
    });

    elements.chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    elements.sendBtn.addEventListener('click', sendMessage);
    elements.attachBtn.addEventListener('click', () => {
        if (currentChatModel()?.input_modalities?.includes('image')) {
            elements.imageInput.click();
        } else {
            alert('Select a vision-capable model before attaching an image.');
        }
    });
    elements.imageInput.addEventListener('change', handleImageSelect);

    elements.chatModelSearch.addEventListener('input', (event) => {
        state.ui.modelSearch.chat = event.target.value;
        saveUiState();
        populateChatModelSelectors();
    });
    elements.chatFavoritesOnly.addEventListener('change', (event) => {
        state.ui.favoritesOnly.chat = event.target.checked;
        saveUiState();
        populateChatModelSelectors();
    });
    elements.chatModelSelector.addEventListener('change', () => {
        renderChatModelMeta();
        updateChatModelControls();
    });
    elements.toggleChatFavorite.addEventListener('click', () => {
        toggleFavorite('chat', elements.chatModelSelector.value);
        populateChatModelSelectors();
    });

    elements.searchToggle.addEventListener('click', () => {
        state.toolsEnabled.search = !state.toolsEnabled.search;
        updateChatModelControls();
    });
    elements.codeToggle.addEventListener('click', () => {
        state.toolsEnabled.code = !state.toolsEnabled.code;
        updateChatModelControls();
    });

    elements.commandPaletteInput.addEventListener('input', (event) => renderCommandPalette(event.target.value));

    elements.modalityTabs.addEventListener('click', (event) => {
        const button = event.target.closest('[data-tab]');
        if (button) setActiveTab(button.dataset.tab);
    });

    elements.chatHistory.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('[data-delete-chat]');
        if (deleteButton) {
            event.stopPropagation();
            deleteChat(deleteButton.dataset.deleteChat);
            return;
        }
        const item = event.target.closest('[data-chat-id]');
        if (item) loadChat(item.dataset.chatId);
    });

    document.querySelectorAll('[data-run]').forEach((button) => button.addEventListener('click', () => runBuilder(button.dataset.run)));
    document.querySelectorAll('[data-retry]').forEach((button) => button.addEventListener('click', () => runBuilder(button.dataset.retry)));
    document.querySelectorAll('[data-export-history]').forEach((button) => button.addEventListener('click', () => exportJsonFile(`pollinchat-${button.dataset.exportHistory}-history.json`, state.outputs[button.dataset.exportHistory])));
    document.querySelectorAll('[data-clear-history]').forEach((button) => button.addEventListener('click', () => {
        state.outputs[button.dataset.clearHistory] = [];
        saveOutputs();
        renderHistory(button.dataset.clearHistory);
    }));

    document.body.addEventListener('click', (event) => {
        const restore = event.target.closest('[data-restore]');
        if (restore) {
            const [tab, index] = restore.dataset.restore.split(':');
            restoreHistory(tab, Number(index));
        }
        const copyHistory = event.target.closest('[data-copy-history]');
        if (copyHistory) {
            const [tab, index] = copyHistory.dataset.copyHistory.split(':');
            copyText(JSON.stringify(state.outputs[tab][Number(index)], null, 2), `${TAB_META[tab].label} history entry copied.`);
        }
        const retryChat = event.target.closest('[data-retry-chat]');
        if (retryChat) {
            const chat = state.chats.find((item) => item.id === state.activeChatId);
            const lastUser = [...(chat?.messages || [])].reverse().find((message) => message.role === 'user');
            if (lastUser) {
                elements.chatInput.value = Array.isArray(lastUser.content) ? (lastUser.content.find((part) => part.type === 'text')?.text || '') : lastUser.content;
                updateChatComposerMeta();
                sendMessage();
            }
        }
        const downloadRuntime = event.target.closest('[data-download-runtime]');
        if (downloadRuntime) {
            const tab = downloadRuntime.dataset.downloadRuntime;
            const runtime = state.runtimeOutputs[tab];
            if (!runtime) return;
            if (tab === 'embeddings') {
                exportJsonFile('pollinchat-embeddings.json', runtime.preview);
            } else {
                const extension = tab === 'image' ? 'png' : tab === 'audio' ? 'mp3' : 'mp4';
                downloadBlob(runtime.blob, `pollinchat-${tab}.${extension}`);
            }
        }
        const openRuntime = event.target.closest('[data-open-runtime]');
        if (openRuntime) {
            window.open(state.runtimeOutputs[openRuntime.dataset.openRuntime]?.url, '_blank', 'noopener');
        }
        const copyRuntime = event.target.closest('[data-copy-runtime]');
        if (copyRuntime) {
            const tab = copyRuntime.dataset.copyRuntime;
            if (tab === 'embeddings') {
                copyText(JSON.stringify(state.runtimeOutputs.embeddings?.preview || {}, null, 2), 'Embedding JSON copied.');
            } else {
                copyText(state.runtimeOutputs[tab]?.prompt || '', `${TAB_META[tab].label} prompt copied.`);
            }
        }
    });

    document.querySelectorAll('.suggestion-card').forEach((button) => {
        button.addEventListener('click', () => {
            setActiveTab('chat');
            elements.chatInput.value = button.dataset.suggestion;
            updateChatComposerMeta();
            elements.chatInput.focus();
        });
    });

    window.addEventListener('keydown', (event) => {
        const targetTag = event.target.tagName;
        const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTag);
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            renderCommandPalette();
            openModal(elements.commandPaletteModal);
            elements.commandPaletteInput.value = '';
            elements.commandPaletteInput.focus();
        }
        if (event.altKey && /^[1-5]$/.test(event.key)) {
            event.preventDefault();
            setActiveTab(TAB_ORDER[Number(event.key) - 1]);
        }
        if (!typing && event.key.toLowerCase() === 'n') {
            event.preventDefault();
            setActiveTab('chat');
            createNewChat();
        }
        if (!typing && event.key === '/') {
            event.preventDefault();
            setActiveTab('chat');
            elements.chatInput.focus();
        }
        if (event.key === 'Escape') {
            closeModal(elements.settingsModal);
            closeModal(elements.byopModal);
            closeModal(elements.commandPaletteModal);
        }
    });

    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) closeModal(overlay);
        });
    });
}

async function init() {
    applyTheme(state.settings.theme);
    handleByopRedirect();

    try {
        await loadSpec();
        await loadModels();
    } catch (error) {
        console.error('Initialization failed:', error);
        state.models.chat = FALLBACK_MODELS.chat.map((model) => normalizeModel(model, 'chat'));
        state.models.image = FALLBACK_MODELS.image.map((model) => normalizeModel(model, 'image'));
        state.models.audio = FALLBACK_MODELS.audio.map((model) => normalizeModel(model, 'audio'));
        state.models.video = FALLBACK_MODELS.video.map((model) => normalizeModel(model, 'video'));
        state.models.embeddings = FALLBACK_MODELS.embeddings.map((model) => normalizeModel(model, 'embeddings'));
        hydrateFieldDefs();
    }

    renderTabs();
    elements.chatModelSearch.value = state.ui.modelSearch.chat || '';
    elements.chatFavoritesOnly.checked = Boolean(state.ui.favoritesOnly.chat);
    populateChatModelSelectors();
    renderChatHistory();
    renderAllBuilders();
    renderStatusPills();
    renderByopState();
    bindStaticEvents();
    setActiveTab(state.activeTab);
    updateChatComposerMeta();

    if (state.chats.length) {
        state.activeChatId = state.chats[0].id;
        loadChat(state.activeChatId);
    } else {
        createNewChat();
    }

    if (getByopDocsText()) {
        state.byop.message = 'Redirect-based Bring Your Own Pollen is supported. Configure client_id and redirect URI in Settings if needed.';
    }
    renderByopState();
    announce('PollinChat workspace ready.');
}

init();
