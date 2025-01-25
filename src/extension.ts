import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  console.log("InstaFlow extension is now active!");

  // Register the InstaFlow view provider
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "instaflowView", // Ensure this matches the ID in package.json
      new InstaFlowViewProvider(context)
    )
  );
}

export function deactivate() {
  console.log("InstaFlow extension is now deactivated.");
}

class InstaFlowViewProvider implements vscode.WebviewViewProvider {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
    };

    // Load the HTML content from a file
    const htmlPath = path.join(this.context.extensionPath, "src", "webview", "index.html");
    const htmlContent = fs.readFileSync(htmlPath, "utf-8");

    // Resolve CSS and JS paths
    const scriptUri = webviewView.webview.asWebviewUri(
      vscode.Uri.file(path.join(this.context.extensionPath, "src", "webview", "script.js"))
    );
    const styleUri = webviewView.webview.asWebviewUri(
      vscode.Uri.file(path.join(this.context.extensionPath, "src", "webview", "styles.css"))
    );

    // Inject URIs into the HTML
    webviewView.webview.html = htmlContent
      .replace("styles.css", styleUri.toString())
      .replace("script.js", scriptUri.toString());
  }
}
