import Config from '../config.json';
import WebSocketSingleton from './server';
import { StockfishInterface } from './sf';
export default Config;


const server = WebSocketSingleton.GetInstance();


// (async ()=>{let x= new StockfishInterface(Config.stockfishPath);
//     await x.Init();
//     await x.setPosition("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
//     while(true)
//         await x.getAllLegalMoves();
// })();


