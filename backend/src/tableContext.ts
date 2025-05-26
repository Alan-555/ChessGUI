import { WebSocket } from "ws";
import Config from "./app";
import { MessageStateSync, PieceColor } from "./protocolTypes";
import { Player } from "./server";
import { StockfishInterface } from "./sf";

export class TableSession{
    public sfInterface : StockfishInterface;
    public state : MessageStateSync;
    public moves : string[];

    public tableHost: Player;
    public tableClient : Player;

    public gameID? : string;

    constructor(state : MessageStateSync, player : Player,gameID : string | undefined, onClose:(code:number|null)=>void,opponent? : Player){
        this.sfInterface = new StockfishInterface(Config.stockfishPath,onClose);
        this.state = state;
        this.moves = [];

        this.gameID = gameID;

        this.tableHost = player;
        this.tableClient = opponent ? opponent : {color:player.color=='white' ? 'black' : 'white', socket : 'NOT_PRESENT'};

        if(this.state.whiteTime!=0){
            this.state.gameStartTimestamp = Date.now();
            this.state.maxTime = this.state.whiteTime;
            this.state.whiteTime = 0;
            this.state.blackTime = 0;
        }
    }

    dispose(){
        this.sfInterface.close();
    }

    getSocketByColor(color: PieceColor): WebSocket | undefined {
        if (typeof this.tableHost.socket == "object" && this.tableHost.color === color) {
            return this.tableHost.socket;
        }
        if (typeof this.tableClient.socket == "object" && this.tableClient.color === color) {
            return this.tableClient.socket;
        }
        return undefined;
    }


}
