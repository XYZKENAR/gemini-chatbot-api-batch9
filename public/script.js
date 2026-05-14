// Dark mode functionality
const darkToggle = document.getElementById('dark-toggle');
const htmlElement = document.documentElement;

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
  if (darkToggle) darkToggle.textContent = '☀️';
}

// Dark mode toggle event listener
if (darkToggle) {
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
}

// Initialize state
let conversation = [];

// DOM elements
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Event listener for form submission
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Ini penting agar tidak muncul "/?" di URL

  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Clear input field
  userInput.value = '';

  // Add user message to conversation
  addMessageToChat('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });

  // Show thinking message
  const thinkingMessageId = addMessageToChat('bot', 'Thinking...');

  try {
    // TEMBAK KE BACKEND RAILWAY KAMU
    const response = await fetch('[https://xyznar-chat-bot.hf.space/api/chat', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation: conversation }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    // Ambil data dari property 'result' sesuai index.js kamu
    const botResponse = data.result || 'Maaf, tidak ada respon.';
    
    // Replace "Thinking..." dengan jawaban asli
    replaceMessage(thinkingMessageId, botResponse);
    
    // Masukkan ke riwayat percakapan
    conversation.push({ role: 'model', text: botResponse });

  } catch (error) {
    console.error('Error:', error);
    replaceMessage(thinkingMessageId, 'Gagal terhubung ke server. Pastikan backend Railway aktif.');
  }
});

/**
 * Add a message to the chat display
 */
function addMessageToChat(role, text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;
  const messageId = `msg-${Date.now()}-${Math.random()}`;
  messageDiv.id = messageId;

  if (role === 'bot' || role === 'model') {
    // Pastikan library 'marked' sudah di-load di HTML kamu
    messageDiv.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text;
  } else {
    messageDiv.textContent = text;
  }

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  return messageId;
}

/**
 * Replace message content
 */
function replaceMessage(messageId, newText) {
  const messageElement = document.getElementById(messageId);
  if (messageElement) {
    if (messageElement.classList.contains('bot')) {
      messageElement.innerHTML = typeof marked !== 'undefined' ? marked.parse(newText) : newText;
    } else {
      messageElement.textContent = newText;
    }
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}
// TARUH DI SINI (BAGIAN PALING BAWAH)
window.onload = () => {
  addMessageToChat('bot', 'Halo! Saya asisten AI Anda. Mau tanya apa soal teknologi AI hari ini?');
};
