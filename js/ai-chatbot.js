/**
 * SHAIVIKA IT TECHNOLOGIES - AI CHATBOT CONTROLLER
 * High-performance, secure, responsive floating animated robot assistant
 * 
 * Features:
 * - Direct integration with n8n AI webhook + Netlify Serverless API Gateway
 * - Premium animated 3D robot assistant launcher with idle float and pulse
 * - Multi-turn conversation management in session
 * - Instant interactive quick action chips
 * - Formatted Markdown rendering with safe XSS escaping
 * - Dynamic thinking indicator during AI generation
 * - Resilient error handling with retry capability
 * - Full keyboard and mobile accessibility
 */

(function() {
  'use strict';

  // Configuration (Centralized Robot Image & Branding URLs)
  const CONFIG = {
    GATEWAY_ENDPOINT: '/.netlify/functions/api',
    DIRECT_N8N_WEBHOOK: 'https://n8n.shaivikamanojkumarcloud.me/webhook/shaivika-ai-chat',
    ROBOT_IMAGE_URL: 'https://res.cloudinary.com/dwv8kc9vb/image/upload/v1792840309/img2_ai_chat_bot_oimisa.jpg',
    LOGO_URL: 'https://res.cloudinary.com/dwv8kc9vb/image/upload/f_auto,q_auto,w_80/v1782199061/ChatGPT_Image_Jun_23_2026_12_47_21_PM_upsrdk.png',
    MAX_CHARS: 1000,
    WELCOME_MESSAGE: "Hi! 👋 Welcome to Shaivika IT Technologies. I'm your AI assistant, here to help you explore our AI automation, websites, applications, and business growth solutions. How can I help you today?",
    QUICK_ACTIONS: [
      { label: 'Explore Our Services', icon: '🚀', query: 'Explore Our Services' },
      { label: 'Pricing Plans', icon: '💰', query: 'What are your pricing plans?' },
      { label: 'AI Chatbots', icon: '🤖', query: 'Tell me about your AI Chatbots' },
      { label: 'Website Development', icon: '🌐', query: 'Tell me about Website and App Development' },
      { label: 'Business Automation', icon: '⚡', query: 'How does business automation work?' },
      { label: 'Contact Our Team', icon: '📞', query: 'How can I contact your team?' }
    ]
  };

  // State
  const state = {
    isOpen: false,
    isLoading: false,
    messages: [],
    sessionId: 'sit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
    lastFailedQuery: null
  };

  // Safe HTML Escaping
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Markdown Formatter (Bold, bullet lists, linebreaks, links)
  function formatMarkdown(text) {
    if (!text) return '';
    let escaped = escapeHTML(text);

    // Bold **text**
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Bullet points (lines starting with •, -, or *)
    const lines = escaped.split('\n');
    let inList = false;
    let formattedLines = [];

    for (let line of lines) {
      const trimmed = line.trim();
      if (/^[•\-\*]\s+(.*)/.test(trimmed)) {
        const itemContent = trimmed.replace(/^[•\-\*]\s+/, '');
        if (!inList) {
          formattedLines.push('<ul>');
          inList = true;
        }
        formattedLines.push(`<li>${itemContent}</li>`);
      } else {
        if (inList) {
          formattedLines.push('</ul>');
          inList = false;
        }
        formattedLines.push(line);
      }
    }
    if (inList) formattedLines.push('</ul>');

    let html = formattedLines.join('<br>');
    html = html.replace(/(<\/ul>)<br>/g, '$1');
    html = html.replace(/<br>(<ul>)/g, '$1');

    // Phone numbers auto-link (+91 7981431094)
    html = html.replace(/(\+91[\s-]?\d{10})/g, '<a href="tel:$1" style="color:#38bdf8;font-weight:600;">$1</a>');

    // Email auto-link
    html = html.replace(/([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g, '<a href="mailto:$1" style="color:#38bdf8;font-weight:600;">$1</a>');

    // WhatsApp keyword START
    html = html.replace(/\b(START)\b/g, '<span style="background:rgba(37,211,102,0.2);color:#25d366;font-weight:700;padding:1px 6px;border-radius:4px;">$1</span>');

    return html;
  }

  // Format timestamp (e.g. 10:45 AM)
  function formatTime(date) {
    try {
      return new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date || new Date());
    } catch (e) {
      return '';
    }
  }

  // Build DOM Structure
  function initDOM() {
    // Check if already injected to avoid duplicates
    if (document.getElementById('shaivika-chatbot-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'shaivika-chatbot-wrapper';

    wrapper.innerHTML = `
      <!-- Animated Robot Launcher Button -->
      <button class="shaivika-chat-launcher has-notification" id="shaivikaChatLauncher" aria-label="Open Shaivika AI Chatbot" title="Chat with Shaivika AI">
        <!-- Tasteful Glow / Notification Ring -->
        <span class="shaivika-launcher-glow-ring" aria-hidden="true"></span>
        
        <!-- Robot Image Wrap -->
        <div class="shaivika-launcher-avatar-wrap">
          <img
            src="${CONFIG.ROBOT_IMAGE_URL}"
            alt="Shaivika AI Assistant Robot"
            class="shaivika-robot-img"
            loading="eager"
            onerror="this.style.display='none'; document.getElementById('shaivikaLauncherFallback').style.display='block';"
          />
          <!-- Fallback icon if image fails to load -->
          <svg id="shaivikaLauncherFallback" class="launcher-fallback-icon" viewBox="0 0 24 24" style="display:none;" aria-hidden="true">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            <path d="M7 9h10v2H7zm0-3h10v2H7z"/>
          </svg>
        </div>

        <!-- Close Cross Icon for Active State -->
        <div class="shaivika-launcher-close-wrap" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </div>

        <!-- Notification Sparkle Badge -->
        <span class="shaivika-launcher-badge">AI ✨</span>

        <!-- Tooltip -->
        <span class="shaivika-chat-tooltip">Chat with Shaivika AI</span>
      </button>

      <!-- Chat Window -->
      <div class="shaivika-chat-window" id="shaivikaChatWindow" role="region" aria-label="Shaivika AI Chat Window">
        <!-- Header -->
        <div class="shaivika-chat-header">
          <div class="shaivika-chat-header-info">
            <div class="shaivika-chat-avatar-robot" id="shaivikaHeaderAvatar">
              <img src="${CONFIG.ROBOT_IMAGE_URL}" alt="Shaivika AI Robot" width="44" height="44" loading="lazy">
              <span class="shaivika-status-dot-robot" id="shaivikaHeaderStatusDot"></span>
            </div>
            <div class="shaivika-chat-titles">
              <div class="shaivika-header-title-row">
                <h3>Shaivika AI Assistant</h3>
                <span class="shaivika-sparkle-pill">AI 2.0</span>
              </div>
              <div class="shaivika-chat-status" id="shaivikaChatStatusText">
                <span>Your business growth partner</span>
              </div>
            </div>
          </div>
          <div class="shaivika-chat-actions">
            <button class="shaivika-header-btn" id="shaivikaResetChatBtn" title="Reset conversation" aria-label="Reset conversation">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
            </button>
            <button class="shaivika-header-btn" id="shaivikaCloseChatBtn" title="Close chat" aria-label="Close chat">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="shaivika-chat-messages" id="shaivikaChatMessages" aria-live="polite">
          <!-- Welcome and dynamic messages render here -->
        </div>

        <!-- Input Area -->
        <div class="shaivika-chat-input-area">
          <div class="shaivika-input-row">
            <textarea
              class="shaivika-chat-textarea"
              id="shaivikaChatInput"
              rows="1"
              maxlength="${CONFIG.MAX_CHARS}"
              placeholder="Ask about AI, websites, pricing..."
              aria-label="Message input"></textarea>
            <button class="shaivika-send-btn" id="shaivikaSendBtn" disabled aria-label="Send message">
              <svg viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
          <div class="shaivika-chat-footer-meta">
            <span>Automate. Scale. Grow. • Shaivika Groups</span>
            <span class="shaivika-char-counter" id="shaivikaCharCounter">0/${CONFIG.MAX_CHARS}</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);

    // Initial render of welcome message
    resetConversation();

    // Attach Event Listeners
    setupEvents();
  }

  // Reset Conversation
  function resetConversation() {
    state.messages = [
      {
        id: 'msg_welcome',
        sender: 'ai',
        text: CONFIG.WELCOME_MESSAGE,
        timestamp: new Date(),
        showChips: true
      }
    ];
    state.lastFailedQuery = null;
    renderMessages();
  }

  // Render Messages into DOM
  function renderMessages() {
    const container = document.getElementById('shaivikaChatMessages');
    if (!container) return;

    let html = '';

    state.messages.forEach(msg => {
      const isUser = msg.sender === 'user';
      const timeStr = formatTime(msg.timestamp);

      if (isUser) {
        html += `
          <div class="shaivika-message shaivika-message-user">
            <div class="shaivika-msg-body">
              <div class="shaivika-msg-content">${escapeHTML(msg.text)}</div>
              <span class="shaivika-msg-time">${timeStr}</span>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="shaivika-message shaivika-message-ai">
            <div class="shaivika-msg-avatar">
              <img src="${CONFIG.ROBOT_IMAGE_URL}" alt="Shaivika AI" width="28" height="28">
            </div>
            <div class="shaivika-msg-body">
              <div class="shaivika-msg-content">${formatMarkdown(msg.text)}</div>
              <span class="shaivika-msg-time">${timeStr}</span>
            </div>
          </div>
        `;

        // Render Quick Action Chips if welcome message
        if (msg.showChips && CONFIG.QUICK_ACTIONS && CONFIG.QUICK_ACTIONS.length) {
          html += `
            <div class="shaivika-quick-actions" id="shaivikaQuickActions">
              ${CONFIG.QUICK_ACTIONS.map(action => `
                <button type="button" class="shaivika-chip-btn" data-query="${escapeHTML(action.query)}">
                  <span>${action.icon}</span> ${escapeHTML(action.label)}
                </button>
              `).join('')}
            </div>
          `;
        }
      }
    });

    // Loading typing indicator
    if (state.isLoading) {
      html += `
        <div class="shaivika-message shaivika-message-ai" id="shaivikaTypingWrapper">
          <div class="shaivika-msg-avatar">
            <img src="${CONFIG.ROBOT_IMAGE_URL}" alt="Shaivika AI" width="28" height="28">
          </div>
          <div class="shaivika-typing-bubble" id="shaivikaTypingIndicator" aria-label="Shaivika AI is typing">
            <span class="shaivika-typing-dot"></span>
            <span class="shaivika-typing-dot"></span>
            <span class="shaivika-typing-dot"></span>
          </div>
        </div>
      `;
    }

    // Error retry banner if last query failed
    if (state.lastFailedQuery) {
      html += `
        <div class="shaivika-error-card" id="shaivikaErrorNotice">
          <span>Unable to reach AI assistant right now.</span>
          <button type="button" class="shaivika-retry-btn" id="shaivikaRetryBtn">Retry</button>
        </div>
      `;
    }

    container.innerHTML = html;

    // Scroll to bottom smoothly
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 20);

    // Attach click events on chips
    const chips = container.querySelectorAll('.shaivika-chip-btn');
    chips.forEach(chip => {
      chip.addEventListener('click', function(e) {
        e.preventDefault();
        const query = this.getAttribute('data-query');
        if (query) sendMessage(query);
      });
    });

    // Attach click event on retry button
    const retryBtn = document.getElementById('shaivikaRetryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (state.lastFailedQuery) {
          const query = state.lastFailedQuery;
          state.lastFailedQuery = null;
          sendMessage(query);
        }
      });
    }
  }

  // Update Thinking State in Header
  function setThinkingState(isThinking) {
    const avatar = document.getElementById('shaivikaHeaderAvatar');
    const statusText = document.getElementById('shaivikaChatStatusText');
    if (avatar) {
      if (isThinking) {
        avatar.classList.add('is-thinking');
      } else {
        avatar.classList.remove('is-thinking');
      }
    }
    if (statusText) {
      if (isThinking) {
        statusText.innerHTML = `
          <span class="shaivika-thinking-spinner"></span>
          <span class="shaivika-thinking-text">Shaivika AI is thinking...</span>
        `;
      } else {
        statusText.innerHTML = `<span>Your business growth partner</span>`;
      }
    }
  }

  // Send message to Backend
  async function sendMessage(text) {
    const trimmed = String(text || '').trim();
    if (!trimmed || state.isLoading) return;

    if (trimmed.length > CONFIG.MAX_CHARS) {
      alert(`Message cannot exceed ${CONFIG.MAX_CHARS} characters.`);
      return;
    }

    // Append User Message
    state.messages.push({
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date()
    });

    // Hide chips after first user query
    state.messages.forEach(m => { m.showChips = false; });

    state.isLoading = true;
    state.lastFailedQuery = null;
    setThinkingState(true);
    renderMessages();

    // Clear input
    const input = document.getElementById('shaivikaChatInput');
    if (input) {
      input.value = '';
      input.style.height = 'auto';
      updateCharCounter(0);
      updateSendButtonState();
    }

    try {
      let replyText = '';

      // 1. Primary: Netlify API Gateway Proxy (Handles Rate Limiting, Input Validation & Secret Protection)
      try {
        const response = await fetch(CONFIG.GATEWAY_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            action: 'chatMessage',
            message: trimmed,
            chatInput: trimmed,
            sessionId: state.sessionId
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.reply) {
            replyText = data.reply;
          }
        }
      } catch (gatewayErr) {
        console.warn('Chat Gateway fetch notice:', gatewayErr.message);
      }

      // 2. Direct Fallback: Connect directly to configured n8n webhook if gateway is offline/bypassed
      if (!replyText) {
        try {
          const n8nRes = await fetch(CONFIG.DIRECT_N8N_WEBHOOK, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/plain, */*'
            },
            body: JSON.stringify({
              message: trimmed,
              chatInput: trimmed,
              sessionId: state.sessionId,
              timestamp: new Date().toISOString()
            })
          });

          if (n8nRes.ok) {
            const contentType = n8nRes.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              const n8nData = await n8nRes.json();
              replyText = n8nData.reply || n8nData.output || n8nData.response || n8nData.text || n8nData.message || (typeof n8nData === 'string' ? n8nData : '');
            } else {
              replyText = await n8nRes.text();
            }
          }
        } catch (directErr) {
          console.warn('Direct n8n webhook notice:', directErr.message);
        }
      }

      // If reply received
      if (replyText && replyText.trim() && replyText.trim() !== 'Workflow was started') {
        state.messages.push({
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: replyText.trim(),
          timestamp: new Date()
        });
      } else {
        // Fallback with verified company response
        const fallback = generateClientFallback(trimmed);
        state.messages.push({
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: fallback,
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Chatbot error:', error);
      state.lastFailedQuery = trimmed;
    } finally {
      state.isLoading = false;
      setThinkingState(false);
      renderMessages();
      if (input && state.isOpen) input.focus();
    }
  }

  // Client-Side Fallback based strictly on Verified Company Knowledge
  function generateClientFallback(query) {
    const q = String(query || '').toLowerCase().trim();

    if (q.includes('pric') || q.includes('cost') || q.includes('plan') || q.includes('package') || q.includes('rate') || q.includes('fee')) {
      return "Here are our advertised growth plans at **Shaivika IT Technologies**:\n\n" +
        "• **Starter Plan — ₹5,000**: Essential digital presence, responsive web setup, and basic integrations.\n" +
        "• **Growth Plan — ₹15,000**: Advanced business automation, dynamic web applications, lead capture, and CRM syncing.\n" +
        "• **Business Plan — ₹25,000**: Comprehensive enterprise automation, custom AI chatbots, custom workflows, and API integrations.\n" +
        "• **Custom Enterprise Plan**: Tailored scope for complex SaaS platforms and enterprise architectures.\n\n" +
        "*Note: These are advertised package prices. Exact deliverables, timeline, and final quotation are confirmed by our team based on your specific requirements.*\n\n" +
        "Would you like to discuss a customized plan for your project? Reach our team at **+91 7981431094** or send WhatsApp keyword **START**!";
    }

    if (q.includes('chatbot') || q.includes('bot') || q.includes('ai chat') || q.includes('conversational')) {
      return "At **Shaivika IT Technologies**, we build intelligent, custom **AI Chatbots** for websites, WhatsApp, and Telegram! 🤖✨\n\n" +
        "Our AI chatbots help businesses:\n" +
        "• Automate 24/7 customer support with human-like responses\n" +
        "• Qualify leads and capture contact details automatically\n" +
        "• Sync inquiries directly into your CRM or Google Sheets\n" +
        "• Reduce repetitive manual support workload by up to 80%\n\n" +
        "Would you like an AI Chatbot tailored for your website or WhatsApp? Reply with your business type or message us on WhatsApp with keyword **START** to get a free live demonstration!";
    }

    if (q.includes('website') || q.includes('web') || q.includes('app') || q.includes('application') || q.includes('software') || q.includes('saas') || q.includes('ui') || q.includes('ux') || q.includes('development') || q.includes('design')) {
      return "**Shaivika IT Technologies** builds high-performance, modern websites and applications engineered for digital growth:\n\n" +
        "• **Modern Web Applications**: Lightning-fast, mobile-first, and SEO-optimized business websites.\n" +
        "• **SaaS & Cloud Platforms**: Scalable architectures with secure user authentication and database management.\n" +
        "• **E-Commerce & Portals**: Custom online stores, client billing dashboards, and payment gateways.\n" +
        "• **UI/UX Design**: Premium interactive interfaces crafted to wow visitors and maximize conversions.\n\n" +
        "Tell us what you're planning to build, or reach us directly at **shaivikagroups@gmail.com** or **+91 7981431094**!";
    }

    if (q.includes('automation') || q.includes('automate') || q.includes('workflow') || q.includes('crm') || q.includes('erp') || q.includes('lead') || q.includes('integration') || q.includes('api')) {
      return "Our core mission under **Shaivika Groups** is: **'Automate. Scale. Grow.'** 🚀\n\n" +
        "We build end-to-end business automation systems including:\n" +
        "• **CRM & ERP Automation**: Eliminate manual data entry and track customer pipelines effortlessly.\n" +
        "• **Lead Generation Systems**: Automated capture, qualification, and instant notification alerts.\n" +
        "• **Workflow Automation (n8n/Make)**: Connecting your forms, spreadsheets, databases, and communication channels.\n" +
        "• **WhatsApp Business Automation**: Automated customer onboarding, status updates, and interactive notifications.\n\n" +
        "We don't just build solutions; we build your success story. Which business process would you like to automate first?";
    }

    if (q.includes('contact') || q.includes('call') || q.includes('phone') || q.includes('email') || q.includes('reach') || q.includes('address') || q.includes('location') || q.includes('whatsapp') || q.includes('touch')) {
      return "We'd love to connect with you! Here is how you can reach **Shaivika IT Technologies**:\n\n" +
        "• 📱 **Phone / WhatsApp**: [+91 7981431094](tel:+917981431094)\n" +
        "• 💬 **WhatsApp Quick Chat**: Send keyword **START** to [+91 7981431094](https://wa.me/917981431094?text=START)\n" +
        "• ✉️ **Email**: [shaivikagroups@gmail.com](mailto:shaivikagroups@gmail.com)\n" +
        "• 📍 **Headquarters**: Kadapa, Andhra Pradesh, India\n" +
        "• 🌐 **Website**: [shaivikaittechnologies.in](https://shaivikaittechnologies.in/)\n\n" +
        "Our team is available to assist you with free consultations and project estimates!";
    }

    if (q.includes('service') || q.includes('offer') || q.includes('do') || q.includes('work') || q.includes('solution') || q.includes('help')) {
      return "At **Shaivika IT Technologies**, we deliver comprehensive digital solutions to help your business automate and scale:\n\n" +
        "1. **AI Chatbots & Virtual Assistants** (Website & WhatsApp automation)\n" +
        "2. **Custom Website & Full-Stack Web App Development**\n" +
        "3. **CRM, ERP & Business Process Automation**\n" +
        "4. **AI Video Advertisements & Digital Content Creation**\n" +
        "5. **SaaS Platforms & Custom Cloud Portals**\n" +
        "6. **API Integrations & Custom Webhooks**\n" +
        "7. **UI/UX Design & Conversion Optimization**\n\n" +
        "Which of these solutions are you most interested in exploring?";
    }

    return "Thank you for reaching out to **Shaivika IT Technologies**! 🌟\n\n" +
      "Brand Tagline: *'Automate. Scale. Grow.'*\n\n" +
      "We specialize in **AI Chatbots**, **Full-Stack Web Development**, **CRM/ERP Automations**, and **Business Growth Systems**.\n\n" +
      "You can ask me about:\n" +
      "• Our services & capabilities\n" +
      "• Pricing plans (starting from ₹5,000)\n" +
      "• How AI automation can save your team hours every day\n" +
      "• Direct contact with our technical team\n\n" +
      "How can I assist your business growth today?";
  }

  // Update Character Counter
  function updateCharCounter(len) {
    const counter = document.getElementById('shaivikaCharCounter');
    if (counter) counter.textContent = `${len}/${CONFIG.MAX_CHARS}`;
  }

  // Update Send Button disabled state
  function updateSendButtonState() {
    const input = document.getElementById('shaivikaChatInput');
    const btn = document.getElementById('shaivikaSendBtn');
    if (!input || !btn) return;
    const hasText = Boolean(input.value && input.value.trim().length > 0);
    btn.disabled = !hasText || state.isLoading;
  }

  // Setup Event Handlers
  function setupEvents() {
    const launcher = document.getElementById('shaivikaChatLauncher');
    const chatWindow = document.getElementById('shaivikaChatWindow');
    const closeBtn = document.getElementById('shaivikaCloseChatBtn');
    const resetBtn = document.getElementById('shaivikaResetChatBtn');
    const input = document.getElementById('shaivikaChatInput');
    const sendBtn = document.getElementById('shaivikaSendBtn');

    // Toggle Chat Window
    function toggleChat(forceOpen) {
      const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !state.isOpen;
      state.isOpen = shouldOpen;

      if (shouldOpen) {
        chatWindow.classList.add('is-open');
        launcher.classList.add('is-active');
        launcher.classList.remove('has-notification'); // Stop notification animation on first open
        launcher.setAttribute('aria-expanded', 'true');
        setTimeout(() => {
          if (input) input.focus();
        }, 150);
      } else {
        chatWindow.classList.remove('is-open');
        launcher.classList.remove('is-active');
        launcher.setAttribute('aria-expanded', 'false');
      }
    }

    if (launcher) launcher.addEventListener('click', () => toggleChat());
    if (closeBtn) closeBtn.addEventListener('click', () => toggleChat(false));

    // Reset Chat
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Start a new conversation with Shaivika AI?')) {
          resetConversation();
        }
      });
    }

    // Input handlers
    if (input) {
      input.addEventListener('input', function() {
        // Auto-expand textarea
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 90) + 'px';
        updateCharCounter(this.value.length);
        updateSendButtonState();
      });

      // Enter to send, Shift+Enter for new line
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (this.value.trim() && !state.isLoading) {
            sendMessage(this.value);
          }
        }
      });
    }

    // Send button click
    if (sendBtn) {
      sendBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (input && input.value.trim() && !state.isLoading) {
          sendMessage(input.value);
        }
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && state.isOpen) {
        toggleChat(false);
      }
    });
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDOM);
  } else {
    initDOM();
  }

  // Expose global controller for optional programmatic interaction
  window.ShaivikaAIChatbot = {
    open: function() {
      const launcher = document.getElementById('shaivikaChatLauncher');
      if (launcher && !state.isOpen) launcher.click();
    },
    close: function() {
      const closeBtn = document.getElementById('shaivikaCloseChatBtn');
      if (closeBtn && state.isOpen) closeBtn.click();
    },
    send: function(msg) {
      sendMessage(msg);
    }
  };

})();
