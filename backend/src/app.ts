import Config from '../config.json';
import WebSocketSingleton from './server';
import { StockfishInterface } from './sf';
export default Config;


const server = WebSocketSingleton.GetInstance();


