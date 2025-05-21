import Config from "./app";
import { MessageStateSync } from "./protocolTypes";
import { StockfishInterface } from "./sf";

export class TableSession{
    public sfInterface : StockfishInterface;
    public state : MessageStateSync;
    public moves : string[]

    constructor(state : MessageStateSync){
        this.sfInterface = new StockfishInterface(Config.stockfishPath);
        this.state = state;
        this.moves = [];
    }
}