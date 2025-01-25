import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export class InstaFlowViewProvider implements vscode.WebviewViewProvider {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
    };

    // Load HTML content
    const htmlPath = path.join(this.context.extensionPath, "src", "webview", "index.html");
    const htmlContent = fs.readFileSync(htmlPath, "utf-8");

    // Update script and style paths
    const scriptUri = webviewView.webview.asWebviewUri(
      vscode.Uri.file(path.join(this.context.extensionPath, "src", "webview", "script.js"))
    );

    const styleUri = webviewView.webview.asWebviewUri(
      vscode.Uri.file(path.join(this.context.extensionPath, "src", "webview", "styles.css"))
    );

    webviewView.webview.html = htmlContent
      .replace('styles.css', styleUri.toString())
      .replace('script.js', scriptUri.toString());
  }
}
