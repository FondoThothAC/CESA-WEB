-- Migración v4.1: Sistema de Inbox y Chat P2P
CREATE TABLE IF NOT EXISTS mensajes_privados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emisor_id INT NOT NULL,
    receptor_id INT NOT NULL, -- Si es 0, es un mensaje para el Asistente IA
    contenido TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (emisor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índice para rapidez en la carga de chats
CREATE INDEX idx_chat_p2p ON mensajes_privados(emisor_id, receptor_id);
