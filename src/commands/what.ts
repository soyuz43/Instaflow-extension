// src/commands/what.ts
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

export function registerWhatCommand(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('instaflow.what', async () => {
    try {
      const repoPath = await findGitRepo();
      if (!repoPath) {
        vscode.window.showErrorMessage('Could not find Git repository root');
        return;
      }
      const portFile = path.join(repoPath, '.git', '.prbuddy_port');

      if (!fs.existsSync(portFile)) {
        vscode.window.showErrorMessage('.prbuddy_port not found. Is the PRBuddy-Go server running?');
        return;
      }
      const port = fs.readFileSync(portFile, 'utf8').trim();

      const url = `http://localhost:${port}/what`;
      const resp = await axios.get(url);
      const data = resp.data;

      vscode.window.showInformationMessage(`What changed: ${data.summary}`);
    } catch (err) {
      vscode.window.showErrorMessage(`'What' failed: ${(err as Error).message}`);
    }
  });

  context.subscriptions.push(disposable);
}

// Same utility function as above
async function findGitRepo(): Promise<string | null> {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    return null;
  }
  return folders[0].uri.fsPath;
}
