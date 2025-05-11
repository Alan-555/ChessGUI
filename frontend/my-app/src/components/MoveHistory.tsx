import React from 'react';

interface MoveHistoryProps {
    moves: { white: string; black?: string }[];
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
        <div style={{ padding: '16px', fontFamily: 'Arial, sans-serif' }}>
            <div
            style={{
                maxHeight: '300px',
                overflowY: 'auto',
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
                    {move.white}
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
                    {move.black || ''}
                </div>
                </div>
            ))}
            </div>
            {showNavigationButtons && (
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={onPrevious} style={{ padding: '8px 16px' }}>
                Previous
                </button>
                <button onClick={onNext} style={{ padding: '8px 16px' }}>
                Next
                </button>
            </div>
            )}
        </div>
    );
};

export default MoveHistory;