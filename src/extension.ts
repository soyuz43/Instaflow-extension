// src/extension.ts
import * as vscode from 'vscode';
import { registerQuickAssistCommand } from './commands/quickAssist'; 
import { registerWhatCommand } from './commands/what';
export function activate(context: vscode.ExtensionContext) {
  console.log('Instaflow extension is now active!');

  // Register Commands
  registerQuickAssistCommand(context);
  registerWhatCommand(context);
}

export function deactivate() {
  console.log('Instaflow extension has been deactivated.');
}