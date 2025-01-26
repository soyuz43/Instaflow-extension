import * as vscode from 'vscode';
import { APIClient } from '../util/apiClient';
import * as crypto from 'crypto';

export class ChatProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private _disposables: vscode.Disposable[] = [];
    public isViewVisible: boolean = false; // Initialize the property

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly apiClient: APIClient
    ) { }

    resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        // Configure webview options
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        // Generate security nonce
        const nonce = crypto.randomBytes(16).toString('hex');

        // Set HTML content with proper CSP
        webviewView.webview.html = this.getHtml(webviewView.webview, nonce);

        // Handle view visibility changes
        webviewView.onDidChangeVisibility(() => {
            this.isViewVisible = webviewView.visible; // Update the property
            if (this.isViewVisible) {
                this.refreshWebview(nonce);
            }
        });

        // Setup message handling
        this.setupMessageHandlers(webviewView.webview);

        // Cleanup on dispose
        webviewView.onDidDispose(() => this.dispose());
    }

    private setupMessageHandlers(webview: vscode.Webview) {
        this._disposables.push(
            webview.onDidReceiveMessage(async (message) => {
                switch (message.type) {
                    case 'quickAssist':
                        try {
                            const response = await this.apiClient.quickAssist(message.text);
                            this.postMessage({
                                type: 'response',
                                text: response
                            });
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to get response: ${error}`);
                        }
                        break;

                    case 'clearHistory':
                        this.clearChatHistory();
                        break;

                    case 'openSettings':
                        vscode.commands.executeCommand('instaflow.selectModel');
                        break;

                    case 'openDrafts':
                        vscode.window.showInformationMessage('Drafts feature coming soon!');
                        break;
                }
            })
        );
    }

    private getHtml(webview: vscode.Webview, nonce: string): string {
        // SVG Icons
        const settingsIcon = `
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.5 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z"/>
            </svg>
        `;

        const draftsIcon = `
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
        `;

        const clearIcon = `
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
        `;

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" 
                      content="default-src 'none; 
                              script-src 'nonce-${nonce}';
                              img-src ${webview.cspSource} 'self' data:;
                              style-src 'unsafe-inline'">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
                <div id="toolbar">
                    <button id="settings-btn" title="Model Settings">
                        ${settingsIcon}
                        <span>Settings</span>
                    </button>
                    <button id="drafts-btn" title="Saved Conversations">
                        ${draftsIcon}
                        <span>Drafts</span>
                    </button>
                    <button id="clear-btn" title="Clear History">
                        ${clearIcon}
                        <span>Clear</span>
                    </button>
                </div>
                <div id="history"></div>
                <div id="input-container">
                    <input id="input" type="text" placeholder="Ask for quick assistance..." />
                </div>
                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();
                    let historyElement = document.getElementById('history');

                    function initializeHandlers() {
                        document.getElementById('settings-btn').addEventListener('click', () => {
                            vscode.postMessage({ type: 'openSettings' });
                        });

                        document.getElementById('drafts-btn').addEventListener('click', () => {
                            vscode.postMessage({ type: 'openDrafts' });
                        });

                        document.getElementById('clear-btn').addEventListener('click', () => {
                            vscode.postMessage({ type: 'clearHistory' });
                        });

                        document.getElementById('input').addEventListener('keypress', (e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                                const text = e.target.value;
                                appendMessage(text, true);
                                vscode.postMessage({ type: 'quickAssist', text });
                                e.target.value = '';
                            }
                        });
                    }

                    function appendMessage(text, isUser) {
                        const message = document.createElement('div');
                        message.className = \`message \${isUser ? 'user-message' : 'assistant-message'}\`;
                        message.textContent = text;
                        historyElement.appendChild(message);
                        historyElement.scrollTop = historyElement.scrollHeight;
                    }

                    window.addEventListener('message', (event) => {
                        const message = event.data;
                        if (message.type === 'response') {
                            appendMessage(message.text, false);
                        }
                        if (message.type === 'clearHistory') {
                            historyElement.innerHTML = '';
                        }
                    });

                    // Initial setup
                    initializeHandlers();
                </script>
            </body>
            </html>
        `;
    }

    private refreshWebview(nonce: string) {
        if (this._view) {
            this._view.webview.html = this.getHtml(this._view.webview, nonce);
        }
    }

    private postMessage(message: any) {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
    }

    private clearChatHistory() {
        this.postMessage({ type: 'clearHistory' });
    }

    public updateActiveModel(model: string) {
        this.postMessage({ type: 'modelUpdate', model });
    }

    private dispose() {
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}