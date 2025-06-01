import React from "react";

export interface GameMessageProps {
    title: string;
    message: string;
    buttonText: string;
    onButtonClick: () => void;
    show: boolean;
}

const GameMessage: React.FC<GameMessageProps> = ({
    title,
    message,
    buttonText,
    onButtonClick,
    show,
}) => {
    if (!show) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.popup}>
                <h2 style={styles.title}>{title}</h2>
                <p style={styles.message}>{message}</p>
                <button style={styles.button} onClick={onButtonClick}>
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },
    popup: {
        background: "#222",
        color: "#fff",
        borderRadius: "16px",
        padding: "32px 40px",
        minWidth: "320px",
        minHeight: "220px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
    },
    title: {
        margin: "0 0 16px 0",
        fontSize: "2rem",
        fontWeight: 700,
        textAlign: "center",
    },
    message: {
        margin: "0 0 24px 0",
        fontSize: "1.1rem",
        textAlign: "center",
        color: "#ccc",
    },
    button: {
        padding: "10px 28px",
        fontSize: "1rem",
        borderRadius: "8px",
        border: "none",
        background: "#4caf50",
        color: "#fff",
        cursor: "pointer",
        fontWeight: 600,
        transition: "background 0.2s",
    },
};

export default GameMessage;