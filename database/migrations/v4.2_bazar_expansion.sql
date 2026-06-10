USE cesa_web;

-- 1. Crear tabla de análisis de sentimientos persistente
CREATE TABLE IF NOT EXISTS sentimiento_analisis (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    item_type ENUM('muro', 'reporte', 'bazar', 'chatbot') NOT NULL,
    item_id BIGINT UNSIGNED NOT NULL,
    score TINYINT UNSIGNED DEFAULT 50, -- 0-100
    sentiment ENUM('positivo', 'negativo', 'neutro') DEFAULT 'neutro',
    summary TEXT,
    categoria_tematica VARCHAR(100), -- E.g. "Servicio al cliente", "Precio", "Calidad"
    provider VARCHAR(50) DEFAULT 'local',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_analysis (item_type, item_id),
    INDEX idx_item (item_type, item_id),
    INDEX idx_sentiment (sentiment)
) ENGINE=InnoDB;

-- 3. Crear tabla de logs administrativos (si no existe)
CREATE TABLE IF NOT EXISTS admin_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    accion VARCHAR(50) NOT NULL,
    descripcion TEXT,
    metadata JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;
