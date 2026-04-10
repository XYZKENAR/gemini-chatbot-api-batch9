// Dark mode functionality
const darkToggle = document.getElementById('dark-toggle');
const htmlElement = document.documentElement;

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
  darkToggle.textContent = '☀️';
}

// Dark mode toggle event listener
darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
    darkToggle.textContent = '☀️';
  } else {
    localStorage.setItem('darkMode', 'disabled');
    darkToggle.textContent = '🌙';
  }
});

// Initialize state
let conversation = [];

// DOM elements
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Event listener for form submission
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Get user message
  const userMessage = userInput.value.trim();

  // Validate input
  if (!userMessage) {
    return;
  }

  // Clear input field
  userInput.value = '';

  // Add user message to conversation
  addMessageToChat('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });

  // Show thinking message
  const thinkingMessageId = addMessageToChat('bot', 'Thinking...');

  // Prepare payload for backend
  const payload = {
    conversation: conversation,
  };

  try {
    // Send POST request to backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    // Parse response
    const data = await response.json();

    // Validate response contains result
    if (!data.result) {
      throw new Error('No result received from server');
    }

    // Get the bot's response
    const botMessage = data.result;

    // Add bot message to conversation
    conversation.push({ role: 'model', text: botMessage });

    // Replace thinking message with actual response
    replaceMessage(thinkingMessageId, botMessage);
  } catch (error) {
    // Handle errors
    console.error('Error:', error);

    // Determine error message
    let errorMessage = 'Failed to get response from server.';
    if (error instanceof TypeError) {
      errorMessage = 'Failed to connect to server.';
    }

    // Replace thinking message with error message
    replaceMessage(thinkingMessageId, errorMessage);
  }
});

/**
 * Add a message to the chat display
 * @param {string} role - 'user' or 'bot'
 * @param {string} text - Message text
 * @returns {string} - Message element ID
 */
function addMessageToChat(role, text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;

  // Generate unique ID for message
  const messageId = `msg-${Date.now()}-${Math.random()}`;
  messageDiv.id = messageId;

  // Render markdown for bot messages, plain text for user messages
  if (role === 'bot') {
    messageDiv.innerHTML = marked.parse(text);
  } else {
    messageDiv.textContent = text;
  }

  chatBox.appendChild(messageDiv);

  // Scroll to bottom
  chatBox.scrollTop = chatBox.scrollHeight;

  return messageId;
}

/**
 * Replace message content
 * @param {string} messageId - ID of message to replace
 * @param {string} newText - New text content
 */
function replaceMessage(messageId, newText) {
  const messageElement = document.getElementById(messageId);
  if (messageElement) {
    // Render markdown for bot messages
    if (messageElement.classList.contains('bot')) {
      messageElement.innerHTML = marked.parse(newText);
    } else {
      messageElement.textContent = newText;
    }
    // Scroll to bottom in case message is longer
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}
