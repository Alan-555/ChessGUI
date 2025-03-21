import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

class AsyncProcessCommunicator {
    private process: ChildProcessWithoutNullStreams;
    private queue: { 
        command: string; 
        resolve: (output: string) => void; 
        reject: (error: Error) => void; 
        handler: (buffer: string) => { isComplete: boolean; output: string } 
    }[] = [];
    private buffer: string = '';

    constructor(command: string, args: string[]) {
        this.process = spawn(command, args);
        this.process.stdout.on('data', (data) => this.handleOutput(data));
        this.process.stderr.on('data', (data) => console.error(`Error: ${data}`));
        this.process.on('close', (code) => console.log(`Process exited with code ${code}`));
    }

    private handleOutput(data: Buffer) {
        this.buffer += data.toString();
        if (this.queue.length > 0) {
            const { resolve, handler } = this.queue[0];
            const result = handler(this.buffer);
            if (result.isComplete) {
                resolve(result.output);
                this.queue.shift();
                this.buffer = ''; // Clear the buffer for the next command
            }
        }
    }

    sendCommand(command: string, handler: null | ((buffer: string) => { isComplete: boolean; output: string })): Promise<string> {
        return new Promise((resolve, reject) => {
            if(handler){
                this.queue.push({ command, resolve, reject, handler });
            }
            this.process.stdin.write(command + '\n');
        });
    }

    close() {
        this.process.stdin.end();
    }
}

class StockfishInterface {
    private communicator: AsyncProcessCommunicator;
    private moves: string[] = [];

    constructor(stockfishPath: string) {
        this.communicator = new AsyncProcessCommunicator(stockfishPath, []);
    }

    async setPosition(moves: string[]) {
        this.moves = moves;
        const positionCommand = `position startpos moves ${moves.join(' ')}`;
        this.communicator.sendCommand(positionCommand, null);
    }

    async getAllLegalMoves(): Promise<string[]> {
        const output = await this.communicator.sendCommand('go perft 1', (buffer) => {
            if (buffer.includes('Nodes searched')) {
                return { isComplete: true, output: buffer };
            }
            return { isComplete: false, output: '' };
        });
        const moves = output
            .split('\n')
            .filter((line) => /^[a-h][1-8][a-h][1-8]/.test(line)) // Match chess move format
            .map((line) => line.split(':')[0].trim());
        return moves;
    }

    async printBoard(): Promise<string> {
        const output = await this.communicator.sendCommand('d', (buffer) => {
            return { isComplete: true, output: buffer };
        });
        console.log(output);
        return output;
    }

    async getBestMove(): Promise<string> {
        const output = await this.communicator.sendCommand('go movetime 1000', (buffer) => {
            const bestMoveLine = buffer.split('\n').find((line) => line.startsWith('bestmove'));
            if (bestMoveLine) {
                return { isComplete: true, output: bestMoveLine };
            }
            return { isComplete: false, output: '' };
        });
        const bestMoveLine = output.split('\n').find((line) => line.startsWith('bestmove'));
        if (bestMoveLine) {
            return bestMoveLine.split(' ')[1];
        }
        throw new Error('Best move not found');
    }

    async doMove(move: string) {
        this.moves.push(move);
        await this.setPosition(this.moves);
    }

    close() {
        this.communicator.close();
    }
}

export { AsyncProcessCommunicator, StockfishInterface };