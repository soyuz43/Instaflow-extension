import * as vscode from 'vscode';
import { ChatProvider } from './providers/ChatProvider';
import { APIClient } from './util/apiClient';

export function activate(context: vscode.ExtensionContext) {
    // Create an output channel for debug logs
    const outputChannel = vscode.window.createOutputChannel('InstaFlow Debug');
    context.subscriptions.push(outputChannel);
    outputChannel.show(true);
    outputChannel.appendLine('=== InstaFlow Activation Started ===');

    try {
        // Step 1: Initialize APIClient
        outputChannel.appendLine('[1/5] Initializing APIClient...');
        const apiClient = new APIClient();
        outputChannel.appendLine('✓ APIClient initialized');

        // Step 2: Create ChatProvider
        outputChannel.appendLine('[2/5] Creating ChatProvider...');
        const provider = new ChatProvider(context.extensionUri, apiClient);
        outputChannel.appendLine('✓ ChatProvider created');

        // Step 3: Register Webview Provider
        outputChannel.appendLine('[3/5] Registering webview provider...');
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider('instaflowChat', provider)
        );
        outputChannel.appendLine('✓ Webview provider registered');

        // Step 4: Register Debug Commands
        outputChannel.appendLine('[4/5] Registering debug commands...');
        context.subscriptions.push(
            vscode.commands.registerCommand('instaflow.debugViews', () => {
                outputChannel.appendLine('\n=== VIEW DEBUG INFORMATION ===');
                const isChatVisible = provider.isViewVisible; // Ensure this property exists in ChatProvider
                outputChannel.appendLine(
                    isChatVisible
                        ? '✓ instaflowChat view is visible'
                        : '× instaflowChat view is NOT visible'
                );
            })
        );

        // Step 5: Finalize Activation
        outputChannel.appendLine('[5/5] Finalizing activation...');
        setTimeout(() => {
            vscode.commands.executeCommand('workbench.view.extension.instaflowPanel');
        }, 1000);
        outputChannel.appendLine('=== Activation Completed Successfully ===\n');
    } catch (error) {
        // Handle critical errors during activation
        const errorMessage =
            error instanceof Error
                ? `${error.message}\n${error.stack}`
                : String(error);
        outputChannel.appendLine(`××× CRITICAL ERROR ×××\n${errorMessage}`);
        vscode.window.showErrorMessage(`InstaFlow failed to activate: ${errorMessage}`);
    }
}

export function deactivate() {
    // Add cleanup logic if needed
}
