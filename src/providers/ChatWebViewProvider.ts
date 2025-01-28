import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class ChatWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'instaflow.chat';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, 'src', 'views')
            ],
        };

        webviewView.webview.html = this.getHtmlContent(webviewView.webview);
    }

    private getHtmlContent(webview: vscode.Webview): string {
        const nonce = this.getNonce();
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'src', 'views', 'chat.css')
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'src', 'views', 'chat.js')
        );
        const cspSource = webview.cspSource;  // ✅ This must be properly injected
    
        console.log("✅ CSP Source:", cspSource);  // 🔍 Debugging step
        console.log("✅ Style URI:", styleUri.toString());  // 🔍 Debugging step
    
        const htmlPath = vscode.Uri.file(
            path.join(this._extensionUri.fsPath, 'src', 'views', 'chat.html')
        ).fsPath;
    
        try {
            let html = fs.readFileSync(htmlPath, 'utf-8');
    
            // ✅ Ensure all placeholders are replaced
            html = html.replace(/\{\{nonce\}\}/g, nonce)
                       .replace(/\{\{styleUri\}\}/g, styleUri.toString())
                       .replace(/\{\{scriptUri\}\}/g, scriptUri.toString())
                       .replace(/\{\{cspSource\}\}/g, cspSource);  // 🔥 Force correct CSP injection
    
            console.log("✅ Final HTML (sanitized):", html);  // 🔍 Debugging step
    
            return html;
        } catch (error) {
            console.error("❌ Error loading HTML file:", error);
            return `<html><body><h1>Error Loading Webview</h1><p>${error}</p></body></html>`;
        }
    }
    

    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
