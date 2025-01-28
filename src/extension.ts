import * as vscode from 'vscode';
import { ChatWebviewProvider } from './providers/ChatWebViewProvider';

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel('InstaFlow Debug');
    context.subscriptions.push(outputChannel);
    outputChannel.appendLine('=== InstaFlow Activation Started ===');

    try {
        outputChannel.appendLine('Registering ChatWebviewProvider...');
        const chatWebviewProvider = new ChatWebviewProvider(context.extensionUri);
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                ChatWebviewProvider.viewType,
                chatWebviewProvider
            )
        );
        outputChannel.appendLine('✅ ChatWebviewProvider registered successfully.');
    } catch (error) {
        if (error instanceof Error) {
            outputChannel.appendLine(`❌ Error registering ChatWebviewProvider: ${error.message}`);
        } else {
            outputChannel.appendLine(`❌ Unknown error: ${JSON.stringify(error)}`);
        }
    }

    // Register command to manually show the InstaFlow Chat Webview
    context.subscriptions.push(
        vscode.commands.registerCommand('instaflow.showChat', async () => {
            outputChannel.appendLine('🟢 Executing command: instaflow.showChat');
            await vscode.commands.executeCommand('workbench.view.extension.instaflowPanel');
        })
    );

    
}

export function deactivate() {}
