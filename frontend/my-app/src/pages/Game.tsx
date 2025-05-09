import ChessBoardComponent from "../components/ChessBoard";

export default function Game() {
  return (
    <div style={{ userSelect:"none", WebkitUserSelect:"none", msUserSelect:"none", display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <ChessBoardComponent/>
    </div >
  );
}