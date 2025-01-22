// src/commands/quickAssist.ts
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

export function registerQuickAssistCommand(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('instaflow.quickAssist', async () => {
    try {
      // Prompt user for a question
      const question = await vscode.window.showInputBox({
        prompt: 'Enter your question for Quick Assist'
      });
      if (!question) { return; }

      // Find .prbuddy_port
      const repoPath = await findGitRepo();
      if (!repoPath) {
        vscode.window.showErrorMessage('Could not find Git repository root');
        return;
      }
      const portFile = path.join(repoPath, '.git', '.prbuddy_port');

      // Read port
      if (!fs.existsSync(portFile)) {
        vscode.window.showErrorMessage('.prbuddy_port not found. Is the PRBuddy-Go server running?');
        return;
      }
      const port = fs.readFileSync(portFile, 'utf8').trim();

      // Fire ephemeral quick assist
      const url = `http://localhost:${port}/extension/quick-assist`;
      const resp = await axios.post(url, {
        message: question,
        ephemeral: true
      });
      const data = resp.data;

      vscode.window.showInformationMessage(`AI response: ${data.response}`);
    } catch (err) {
      vscode.window.showErrorMessage(`Quick Assist failed: ${(err as Error).message}`);
    }
  });

  context.subscriptions.push(disposable);
}

// Utility: find the top-level .git folder
async function findGitRepo(): Promise<string | null> {
  // You can do a better search if needed
  // For example, start from workspace root or active file.
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    return null;
  }
  return folders[0].uri.fsPath;
}
