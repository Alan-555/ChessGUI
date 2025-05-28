import React from 'react';
import { Turn } from '../pages/Game';

interface MoveHistoryProps {
    moves: Turn[];
    showNavigationButtons?: boolean;
    onPrevious?: () => void;
    onNext?: () => void;
}

const MoveHistory: React.FC<MoveHistoryProps> = ({
    moves,
    showNavigationButtons = false,
    onPrevious,
    onNext,
}) => {
    return (
        <div
            style={{
                height: '100%',
                overflowY: 'scroll',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '8px',
            }}
        >
            {moves.map((move, index) => (
                <div
                    key={index}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                    }}
                >
                    {index + 1}.
                    <div
                        style={{
                            padding: '8px 12px',
                            borderRadius: '12px',
                            backgroundColor: '#f0f0f0',
                            marginRight: '8px',
                            flex: 1,
                            textAlign: 'center',
                        }}
                    >
                        {move.whiteMove}
                    </div>
                    <div
                        style={{
                            padding: '8px 12px',
                            borderRadius: '12px',
                            backgroundColor: '#f0f0f0',
                            flex: 1,
                            textAlign: 'center',
                        }}
                    >
                        {move.blackMove || ''}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MoveHistory;