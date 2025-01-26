import { window } from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export class APIClient {
    private baseUrl: string | null;
    private portFile: string;

    constructor() {
        this.portFile = this.getPortFilePath();
        this.baseUrl = null; // Initialize as null
        this.initializeBaseUrl();
    }

    private getPortFilePath(): string {
        const cacheDir = os.homedir();
        return path.join(
            cacheDir,
            '.cache',
            'prbuddy-go',
            'port'
        );
    }

    private initializeBaseUrl(): void {
        try {
            const port = this.readPortFile();
            this.baseUrl = `http://localhost:${port}`;
        } catch (error) {
            const err = error as NodeJS.ErrnoException;
            this.handlePortFileError(err);
            // Do not throw the error; allow the extension to continue activating
        }
    }

    private handlePortFileError(err: NodeJS.ErrnoException): void {
        if (err.code === 'ENOENT') {
            window.showErrorMessage(
                'PR Buddy server not running. ' +
                'Start it from your terminal with: prbuddy serve'
            );
        } else if (err.message && err.message.startsWith('Invalid port')) {
            window.showErrorMessage(
                'Corrupted port file detected. ' +
                'Please restart the PR Buddy server.'
            );
        } else {
            window.showErrorMessage(
                `Failed to connect to PR Buddy: ${err.message}`
            );
        }
    }

    private readPortFile(): number {
        const portStr = fs.readFileSync(this.portFile, 'utf-8').trim();
        const port = parseInt(portStr, 10);

        if (isNaN(port) || port < 1 || port > 65535) {
            throw new Error(`Invalid port value: ${portStr}`);
        }

        return port;
    }
    
    async quickAssist(prompt: string): Promise<string> {
        if (!this.baseUrl) {
            throw new Error('PR Buddy server is not available.');
        }
        const response = await this.post('/extension/quick-assist', {
            message: prompt,
            ephemeral: true
        });
        return response.response;
    }

    async listModels(): Promise<string[]> {
        if (!this.baseUrl) {
            throw new Error('PR Buddy server is not available.');
        }
        const response = await fetch(`${this.baseUrl}/extension/models`);
        const models = await response.json();
        return models.map((m: any) => m.name);
    }

    async setActiveModel(model: string): Promise<void> {
        if (!this.baseUrl) {
            throw new Error('PR Buddy server is not available.');
        }
        await this.post('/extension/model', { model });
    }

    private async post(endpoint: string, body: any): Promise<any> {
        if (!this.baseUrl) {
            throw new Error('PR Buddy server is not available.');
        }
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API Error (${response.status}): ${error}`);
        }

        return response.json();
    }
}
