import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { buffer } from 'stream/consumers';
import { Move, ParseServerMove } from './protocolTypes';

type Predicate<T> = ((data: T) => boolean)

class AsyncProcessCommunicator {
    private process: ChildProcessWithoutNullStreams;
    private queue: {
        command: string;
        resolve: (output: string) => void;
        reject: (error: Error) => void;
        handle: Predicate<string>
        buffer: string,
        id : string
    }[] = [];

    private onQueueEmpty: (() => void)[] = [];

    constructor(command: string, args: string[], onClose:(code:number|null)=>void) {
        this.process = spawn(command, args);
        this.process.stdout.on('data', (data) => this.handleOutput(data));
        this.process.stderr.on('data', (data) => console.error(`Error: ${data}`));
        this.process.on('close', (code) => {console.log(`Process exited with code ${code}`); onClose(code)});
    }

    private handleOutput(data: Buffer) {
        if (this.queue.length > 0) {
            let { resolve, handle, id } = this.queue[0];
            console.log("("+id+")> "+data.toString());
            this.queue[0].buffer += data.toString();
            if (handle(this.queue[0].buffer)) {
                resolve(this.queue[0].buffer);
                this.queue.shift();
                this.onQueueEmpty.forEach(e => e());
                this.onQueueEmpty = [];
            }

        }
    }

    sendCommand(command: string, handle?: Predicate<string>): Promise<string> {
        if (process.stdin.readableEnded || process.stdin.destroyed) {
            return Promise.reject(new Error("Process stdin is closed"));
        }
        return new Promise(async (resolve, reject) => {
            //wait for empty queue
            if (this.queue.length != 0)
                await new Promise<void>((resolve) => {
                    this.onQueueEmpty.push(resolve);
                });
            if (handle)
                this.queue.push({ command, resolve, reject, handle: handle, buffer: "" , id: Math.round(Math.random()*100).toString()});
            try{
                this.process.stdin.write(command + '\n');
            }
            catch{
                console.log("Writing to stdin after closure!");
            }
            if (!handle)
                resolve("");
        });
    }

    close() {
        this.process.stdin.end();
    }
}

class StockfishInterface {
    private communicator: AsyncProcessCommunicator;

    constructor(stockfishPath: string,onClose:(code:number|null)=>void) {
        this.communicator = new AsyncProcessCommunicator(stockfishPath, [], onClose);
    }

    async Init() {
        let data = await this.communicator.sendCommand("uci", (s) => s.includes("uciok"));
    }

    async setPosition(pos: string, moves: string[] = []) {
        let moves_ = moves.join(' ');
        const positionCommand = "position fen " + pos + (moves.length > 0 ? (" moves " + moves_) : "");
        await this.communicator.sendCommand(positionCommand);
    }
    async setDifficulty(diff: string) {
        this.communicator.sendCommand("setoption name Skill Level value " + diff);
    }

    async getAllLegalMoves(): Promise<string[]> {
        let out = await this.communicator.sendCommand("go perft 1", (s) => s.includes("Nodes searched"));
        return out.split(/\r?\n/).map((v) => {
            if (v.endsWith(": 1"))
                return v.split(":")[0];
        }).filter(f => f != undefined);
    }

    async getFen(): Promise<string> {
        const output = await this.communicator.sendCommand('d', (s) => s.includes('Checkers:'));
        const fenLine = output.split(/\r?\n/).find(line => line.trim().startsWith('Fen:'));
        if (fenLine) {
            return fenLine.replace('Fen:', '').trim();
        }
        throw new Error('FEN not found in output');
    }

    async isInCheck(): Promise<boolean> {
        const output = await this.communicator.sendCommand('d', (s) => s.includes('Checkers:'));
        const checkLine = output.split(/\r?\n/).find(line => line.trim().startsWith('Checkers:'));
        if (checkLine) {
            return checkLine.replace('Checkers:', '').trim().length > 0;
        }
        throw new Error('Check status not found in output');
    }
    
    async getBestMove(wTime : number, bTime : number): Promise<string> {
        wTime = Math.min(1000*60*5,wTime);
        bTime = Math.min(1000*60*5,bTime);
        const output = await this.communicator.sendCommand('go wtime '+wTime+' btime '+bTime,  (buffer) => {
            const bestMoveLine = buffer.split(/\r?\n/).find((line) => line.startsWith('bestmove'));
            if (bestMoveLine) {
                return true;
            }
            return false;
        });
        const bestMoveLine = output.split(/\r?\n/).find((line) => line.startsWith('bestmove'));
        if (bestMoveLine) {
            return bestMoveLine.split(' ')[1];
        }
        throw new Error('Best move not found');
    }

    /*async printBoard(): Promise<string> {
        const output = await this.communicator.sendCommand('d', (buffer) => {
            return { isComplete: true, output: buffer };
        });
        console.log(output);
        return output;
    }

    

    async doMove(move: string) {
        this.moves.push(move);
        await this.setPosition(this.moves);
    }*/

    close() {
        this.communicator.close();
    }
}

export { AsyncProcessCommunicator, StockfishInterface };