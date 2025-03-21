import Config from '../config.json';
import { StockfishInterface } from './sf';
export default Config;



let sf = new StockfishInterface(Config.stockfishPath);


(async () =>{
    while(true){
        let moves = await sf.getAllLegalMoves();
        for(let legealMove of moves){
            //console.log(legealMove);
        }
        let move = await sf.getBestMove();
        await sf.doMove(move);
        await sf.printBoard();
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
})();
