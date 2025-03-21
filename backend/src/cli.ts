import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

class AsyncCommandHandler {
    private executablePath: string;
    private process: ChildProcessWithoutNullStreams | null = null;
    private queue: Array<{ input: string, resolve: (value: string) => void, reject: (reason?: any) => void }> = [];
    private isProcessing: boolean = false;

    constructor(executablePath: string) {
        this.executablePath = executablePath;
    }

    private ensureProcess(): void {
        if (!this.process) {
            this.process = spawn(this.executablePath, [], { stdio: ['pipe', 'pipe', 'pipe'] });

            this.process.stdout.on('data', (data: Buffer) => {
                const output = data.toString();
                if (this.queue.length > 0) {
                    const { resolve } = this.queue.shift()!;
                    resolve(output);
                    this.isProcessing = false;
                    this.processQueue();
                }
            });

            this.process.stderr.on('data', (data: Buffer) => {
                const error = data.toString();
                if (this.queue.length > 0) {
                    const { reject } = this.queue.shift()!;
                    reject(new Error(error));
                    this.isProcessing = false;
                    this.processQueue();
                }
            });

            this.process.on('close', () => {
                this.process = null;
            });
        }
    }

    private processQueue(): void {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const { input } = this.queue[0];
        this.process!.stdin.write(input + '\n');
    }

    async command(input: string): Promise<string> {
        this.ensureProcess();

        return new Promise((resolve, reject) => {
            this.queue.push({ input, resolve, reject });
            this.processQueue();
        });
    }

    dispose(): void {
        if (this.process) {
            this.process.kill();
            this.process = null;
        }
    }
}

export default AsyncCommandHandler;