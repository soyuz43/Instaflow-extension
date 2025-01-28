console.log("✅ chat.js loaded successfully!");

const vscode = acquireVsCodeApi();

document.getElementById('send-btn').addEventListener('click', () => {
    console.log("📤 Send button clicked!");
    const input = document.getElementById('user-input');
    if (input.value.trim()) {
        vscode.postMessage({ type: 'sendMessage', text: input.value });
        input.value = '';
    }
});

window.addEventListener('message', (event) => {
    console.log("📥 Message received from extension:", event.data);
    const message = event.data;
    const container = document.getElementById('chat-container');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message.text;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
});
