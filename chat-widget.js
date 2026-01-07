// Chat Widget - Floating bubble with modal conversation
(function() {
  // Only initialize if user is logged in (check with auth.js if available)
  if (typeof isLoggedIn === 'function' && !isLoggedIn()) return;

  // Create chat widget HTML
  const chatWidgetHTML = `
    <!-- Chat Floating Button -->
    <button id="chat-bubble" class="chat-bubble" onclick="toggleChat()">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
      </svg>
    </button>

    <!-- Chat Modal -->
    <div id="chat-modal" class="chat-modal">
      <div class="chat-modal-header">
        <h3 class="chat-modal-title">Support Chat</h3>
        <button class="icon-btn" onclick="toggleChat()">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="chat-modal-messages" id="chat-messages">
        <div class="message">
          <div class="message-avatar">AI</div>
          <div class="message-bubble">
            Hello! I'm your SupportHub AI assistant. How can I help you today?
          </div>
        </div>
      </div>
      <div class="chat-modal-input">
        <form id="chat-form" onsubmit="handleSendMessage(event)">
          <input
            type="text"
            id="chat-input"
            class="chat-input"
            placeholder="Type your message..."
            autocomplete="off"
          >
          <button type="submit" class="chat-send-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  `;

  // Inject chat widget styles
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .chat-bubble {
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
      transition: var(--transition);
    }

    .chat-bubble:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .chat-modal {
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 340px;
      max-width: calc(100vw - 40px);
      height: 500px;
      max-height: calc(100vh - 160px);
      background: var(--background);
      border-radius: var(--radius-lg);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      display: none;
      flex-direction: column;
      z-index: 1000;
      overflow: hidden;
    }

    .chat-modal.active {
      display: flex;
    }

    .chat-modal-header {
      padding: var(--space-md);
      background: var(--primary);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }

    .chat-modal-header .icon-btn {
      color: white;
    }

    .chat-modal-title {
      font-size: 1rem;
      font-weight: 700;
      margin: 0;
    }

    .chat-modal-messages {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .message {
      display: flex;
      gap: var(--space-sm);
      align-items: flex-start;
    }

    .message.user {
      flex-direction: row-reverse;
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.75rem;
      flex-shrink: 0;
    }

    .message.user .message-avatar {
      background: var(--text-secondary);
    }

    .message-bubble {
      background: var(--surface);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      max-width: 70%;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .message.user .message-bubble {
      background: var(--primary);
      color: white;
    }

    .chat-modal-input {
      padding: var(--space-md);
      border-top: 1px solid var(--border);
      flex-shrink: 0;
    }

    .chat-modal-input form {
      display: flex;
      gap: var(--space-sm);
    }

    .chat-input {
      flex: 1;
      padding: var(--space-sm) var(--space-md);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      background: var(--surface);
    }

    .chat-send-btn {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--primary);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: var(--transition);
    }

    .chat-send-btn:hover {
      opacity: 0.9;
    }
  `;
  document.head.appendChild(styleElement);

  // Inject chat widget HTML
  const widgetContainer = document.createElement('div');
  widgetContainer.innerHTML = chatWidgetHTML;
  document.body.appendChild(widgetContainer);

  // Chat functionality
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');

  function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : ''}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = isUser ? 'U' : 'AI';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  window.handleSendMessage = async function(event) {
    event.preventDefault();

    const message = chatInput.value.trim();
    if (!message) return;

    // Check if API is available
    if (typeof sendChatMessage !== 'function') {
      console.error('Chat API not available');
      alert('Chat service is not available. Please refresh the page.');
      return;
    }

    // Add user message immediately
    addMessage(message, true);

    // Clear input
    chatInput.value = '';

    // Disable input while sending
    chatInput.disabled = true;

    try {
      // Send message to API (returns both user message and bot response)
      const data = await sendChatMessage(message);

      // Add bot response
      if (data.botResponse && data.botResponse.message) {
        addMessage(data.botResponse.message, false);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message from bot
      addMessage('Sorry, I encountered an error. Please try again.', false);
    } finally {
      // Re-enable input
      chatInput.disabled = false;
      chatInput.focus();
    }
  };

  window.toggleChat = async function() {
    const chatModal = document.getElementById('chat-modal');
    const chatBubble = document.getElementById('chat-bubble');

    if (chatModal.classList.contains('active')) {
      chatModal.classList.remove('active');
      chatBubble.style.display = 'flex';
    } else {
      chatModal.classList.add('active');
      chatBubble.style.display = 'none';
      chatInput.focus();

      // Load chat history when opening (only on first open)
      if (!chatModal.dataset.loaded && typeof getChatMessages === 'function') {
        await loadChatHistory();
        chatModal.dataset.loaded = 'true';
      }
    }
  };

  // Load chat history from API
  async function loadChatHistory() {
    try {
      const data = await getChatMessages();
      const messages = data.messages || [];

      // Clear initial message if there's history
      if (messages.length > 0) {
        chatMessages.innerHTML = '';
      }

      // Display all messages
      messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.is_user_message ? 'user' : ''}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = msg.is_user_message ? 'U' : 'AI';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = msg.message;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
        chatMessages.appendChild(messageDiv);
      });

      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
      console.error('Error loading chat history:', error);
      // Keep initial welcome message if history load fails
    }
  }
})();
