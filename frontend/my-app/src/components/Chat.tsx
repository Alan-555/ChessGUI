import React, { useEffect, useRef, useState } from 'react';

interface ChatMessage {
    name: string;
    message: string;
}

interface ChatProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage }) => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #ccc' }}>
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '10px',
                    backgroundColor: '#f9f9f9',
                }}
            >
                {messages.map((msg, index) => (
                    <div key={index} style={{ marginBottom: '10px' }}>
                        <strong>{msg.name}:</strong> {msg.message}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid #ccc', backgroundColor: '#fff' }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <button
                    onClick={handleSendMessage}
                    style={{
                        marginLeft: '10px',
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;