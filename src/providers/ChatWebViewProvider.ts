import * as vscode from 'vscode';
import * as path from 'path';

export class ChatWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'instaflow.chat'; // Unique ID for the view
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    // Called when the webview is displayed
    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        console.log("🚀 resolveWebviewView was called!");  // Debug message
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'media')],
        };
        webviewView.webview.html = this.getHtmlContent(webviewView.webview);
    }

    // Generate the HTML for the webview
    private getHtmlContent(webview: vscode.Webview): string {
        const nonce = this.getNonce();

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta
                    http-equiv="Content-Security-Policy"
                    content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src ${webview.cspSource};"
                >
                <title>InstaFlow Chat</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        flex-direction: column;
                        height: 100vh;
                        background-color: #1e1e1e;
                        color: white;
                    }
                    #chat-container {
                        flex-grow: 1;
                        overflow-y: auto;
                        padding: 10px;
                    }
                    #input-container {
                        display: flex;
                        padding: 10px;
                        border-top: 1px solid #333;
                    }
                    #input-container input {
                        flex-grow: 1;
                        padding: 8px;
                        font-size: 14px;
                        border: 1px solid #555;
                        background-color: #2d2d2d;
                        color: white;
                        border-radius: 4px;
                        margin-right: 10px;
                    }
                    #input-container button {
                        padding: 8px 16px;
                        font-size: 14px;
                        color: white;
                        background-color: #007acc;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    #input-container button:hover {
                        background-color: #005f99;
                    }
                </style>
            </head>
            <body>
                <div id="chat-container"></div>
                <div id="input-container">
                    <input id="user-input" type="text" placeholder="Type a message..." />
                    <button id="send-btn">Send</button>
                </div>
                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();

                    // Send message to VSCode when the send button is clicked
                    document.getElementById('send-btn').addEventListener('click', () => {
                        const input = document.getElementById('user-input');
                        if (input.value.trim()) {
                            vscode.postMessage({ type: 'sendMessage', text: input.value });
                            input.value = '';
                        }
                    });

                    // Display incoming messages in the chat container
                    window.addEventListener('message', (event) => {
                        const message = event.data;
                        const container = document.getElementById('chat-container');
                        const messageDiv = document.createElement('div');
                        messageDiv.textContent = message.text;
                        container.appendChild(messageDiv);
                        container.scrollTop = container.scrollHeight;
                    });
                </script>
            </body>
            </html>
        `;
    }

    // Generate a nonce for Content Security Policy
    private getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    // Send a message to the webview
    public postMessage(message: { type: string; text: string }) {
        this._view?.webview.postMessage(message);
    }
}
