document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chatForm');
  const messageInput = document.getElementById('messageInput');
  const chatContainer = document.getElementById('chatContainer');
  const statusDiv = document.getElementById('status');

  // Keep track of conversation history [{role: 'user'|'assistant', content: string}]
  let conversationHistory = [];

  // Function to add message bubble to chat container
  function addMessage(role, text) {
    // Remove welcome message on first message
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
      welcomeMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role);

    const messageText = document.createElement('p');
    messageText.textContent = text;
    messageDiv.appendChild(messageText);

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll chat to bottom
  }

  // Function to set status text
  function setStatus(text) {
    statusDiv.textContent = text;
  }

  // Handle form submit
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) {
      return;
    }

    // Display user's message
    addMessage('user', message);

    // Add message to history
    conversationHistory.push({ role: 'user', content: message });
    messageInput.value = '';
    setStatus('AI is typing...');

    try {
      // Send request to server
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const aiResponse = data.response;

      // Display assistant's reply
      addMessage('assistant', aiResponse);

      // Add AI response to conversation history
      conversationHistory.push({ role: 'assistant', content: aiResponse });

      setStatus('');
    } catch (error) {
      setStatus('Error: ' + error.message);
    }
  });
});


//













