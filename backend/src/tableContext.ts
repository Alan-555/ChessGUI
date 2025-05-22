import Config from "./app";
import { MessageStateSync } from "./protocolTypes";
import { Player } from "./server";
import { StockfishInterface } from "./sf";

export class TableSession{
    public sfInterface : StockfishInterface;
    public state : MessageStateSync;
    public moves : string[];

    public tableHost: Player;
    public tableClient : Player;

    public gameID : string;

    constructor(state : MessageStateSync, player : Player,gameID : string, opponent? : Player){
        this.sfInterface = new StockfishInterface(Config.stockfishPath);
        this.state = state;
        this.moves = [];

        this.gameID = gameID;

        this.tableHost = player;
        this.tableClient = opponent ? opponent : {color:player.color=='white' ? 'black' : 'white', socket : 'NOT_PRESENT'};
    }

    dispose(){
        this.sfInterface.close();
    }
}
