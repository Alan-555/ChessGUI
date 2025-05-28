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

    public timeOutInterval : NodeJS.Timeout | undefined;

    public drawOffered?: PieceColor;

    constructor(state : MessageStateSync, player : Player,gameID : string | undefined, onClose:(code:number|null)=>void,opponent? : Player){
        this.sfInterface = new StockfishInterface(Config.stockfishPath,onClose);
        this.state = state;
        this.moves = [];

        this.gameID = gameID;

        this.tableHost = player;
        this.tableClient = opponent ? opponent : {color:player.color=='white' ? 'black' : 'white', socket : 'NOT_PRESENT'};

        if(this.state.whiteTime!=0){
            this.state.useTime = true;
            this.state.blackStartTimestamp = Date.now();
            this.state.whiteStartTimestamp = Date.now();
            const maxTime = this.state.whiteTime;
            this.state.whiteTime = maxTime;
            this.state.blackTime = maxTime;
        }
    }

    dispose(){
        this.sfInterface.close();
        if(this.timeOutInterval) clearTimeout(this.timeOutInterval);
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
