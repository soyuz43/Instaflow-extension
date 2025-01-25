const input = document.getElementById("user-input") as HTMLInputElement;
const sendButton = document.getElementById("send-button") as HTMLButtonElement;
const chatContainer = document.getElementById("chat-container") as HTMLDivElement;

// Event listener for the "Send" button
sendButton.addEventListener("click", () => {
  const message = input.value.trim();
  if (message) {
    // Create a new chat message element for the user
    const userMessage = document.createElement("div");
    userMessage.className = "chat-message user";
    userMessage.textContent = message;
    chatContainer.appendChild(userMessage);

    // Clear the input field
    input.value = "";

    // Scroll to the bottom of the chat container
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Example: Add a simulated system response
    setTimeout(() => {
      const systemMessage = document.createElement("div");
      systemMessage.className = "chat-message";
      systemMessage.textContent = `System: You said "${message}"`;
      chatContainer.appendChild(systemMessage);

      // Scroll to the bottom again after adding the system response
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 500);
  }
});
