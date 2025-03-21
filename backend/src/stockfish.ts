import AsyncCommandHandler from './cli';
import Config from './app';

class Stockfish {
    private commandHandler: AsyncCommandHandler;
    private moves: string[] = [];

    move(move:string){
        this.moves.push(move);
    }

    constructor() {
        const stockfishPath = Config.stockfishPath; // Ensure `stockfishPath` is defined in your config.json
        this.commandHandler = new AsyncCommandHandler(stockfishPath);
    }

    async getBestMove(): Promise<string> {
        const movesCommand = this.moves.length > 0 ? `position startpos moves ${this.moves.join(' ')}` : 'position startpos';
        await this.commandHandler.command(movesCommand);
        const response = await this.commandHandler.command('go depth 5'); // Adjust movetime as needed
        let bestMove = response.trim();
        const bestMoveMatch = response.match(/bestmove\s+(\S+)/);
        if (bestMoveMatch) {
            bestMove = bestMoveMatch[1];
        } else {
            throw new Error('Failed to retrieve best move from Stockfish');
        }
        return bestMove;
    }

    async getCurrentFEN(): Promise<string> {
        const movesCommand = this.moves.length > 0 ? `position startpos moves ${this.moves.join(' ')}` : 'position startpos';
        await this.commandHandler.command(movesCommand);
        const response = await this.commandHandler.command('d');
        const fenMatch = response.match(/Fen: (.+)/);
        if (fenMatch) {
            return fenMatch[1].trim();
        }
        throw new Error('Failed to retrieve FEN from Stockfish');
    }

    async getLegalMoves(): Promise<string[]> {
        const movesCommand = this.moves.length > 0 ? `position startpos moves ${this.moves.join(' ')}` : 'position startpos';
        await this.commandHandler.command(movesCommand);
        const response = await this.commandHandler.command('go perft 1');
        const moves = response.split('\n').filter(line => line.includes(':')).map(line => line.split(':')[0].trim());
        moves.shift();
        moves.pop();
        return moves;
    }
    async printBoard(): Promise<void> {
        const movesCommand = this.moves.length > 0 ? `position startpos moves ${this.moves.join(' ')}` : 'position startpos';
        await this.commandHandler.command(movesCommand);
        const response = await this.commandHandler.command('d');
        console.log(response);
    }

    resetGame(): void {
        this.moves = []; // Clear the moves array to reset the game
    }

    dispose(): void {
        this.commandHandler.dispose();
    }
}

export default Stockfish;