import * as vscode from 'vscode';
import { ChatProvider } from './providers/ChatProvider';
import { APIClient } from './util/apiClient';

export function activate(context: vscode.ExtensionContext) {
    console.log('InstaFlow extension activated');
    
    try {
        const apiClient = new APIClient();
        console.log('APIClient initialized successfully');
        
        const provider = new ChatProvider(context.extensionUri, apiClient);
        console.log('ChatProvider initialized successfully');
        
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider('instaflowChat', provider)
        );
        console.log('ChatProvider registered successfully');
        
        // Register commands with updated IDs
        context.subscriptions.push(
            vscode.commands.registerCommand('instaflow.selectModel', async () => {
                try {
                    const models = await apiClient.listModels();
                    const selected = await vscode.window.showQuickPick(models);
                    if (selected) {
                        await apiClient.setActiveModel(selected);
                        provider.updateActiveModel(selected);
                        vscode.window.showInformationMessage(`Active model set to: ${selected}`);
                    }
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to load models: ${error instanceof Error ? error.message : error}`);
                    console.error('Error in selectModel command:', error);
                }
            })
        );
        
        context.subscriptions.push(
            vscode.commands.registerCommand('instaflow.quickAssist', async () => {
                // Implement the quickAssist command functionality
                // Add logging as needed
            })
        );
        
    } catch (error) {
        console.error('Error during activation:', error);
        vscode.window.showErrorMessage('Failed to activate InstaFlow extension.');
    }
}

export function deactivate() {}
