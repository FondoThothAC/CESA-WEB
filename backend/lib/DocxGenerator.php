<?php
/**
 * DocxGenerator - CESA WEB v7.6
 * Genera documentos .docx a partir de templates con tokens {{campo}}.
 * Método: ZipArchive + sustitución de tokens en word/document.xml.
 * Soporta tokens multilínea (divide en párrafos, opcionalmente con viñeta).
 * Archivo: /backend/lib/DocxGenerator.php
 */

class DocxGenerator {

    /** Escapa valores para XML del docx */
    public static function xmlv($v): string {
        return htmlspecialchars((string)$v, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }

    /**
     * Reemplaza un token. Si el valor es multilínea, cierra el párrafo actual y abre
     * uno nuevo por cada línea (con prefijo de viñeta si $bullets), inyectando XML válido.
     */
    public static function replaceToken(string $xml, string $token, string $value, bool $bullets = false): string {
        if ($value === '') return str_replace('{{' . $token . '}}', '', $xml);
        if (strpos($value, "\n") !== false) {
            $lines = array_values(array_filter(array_map('trim', explode("\n", $value)), fn($l) => $l !== ''));
            if (count($lines) > 1) {
                $parts = [];
                foreach ($lines as $i => $line) {
                    $prefix = $bullets ? "\u{2022} " : '';
                    if ($i === 0) {
                        $parts[] = self::xmlv($prefix . $line);
                    } else {
                        $parts[] = '</w:t></w:r></w:p><w:p><w:r><w:t xml:space="preserve">' . self::xmlv($prefix . $line);
                    }
                }
                return str_replace('{{' . $token . '}}', implode('', $parts), $xml);
            }
            $value = $lines[0];
        }
        return str_replace('{{' . $token . '}}', self::xmlv($value), $xml);
    }

    /** Reemplaza un lote de tokens en el XML */
    public static function applyTokens(string $xml, array $data, array $bulletsTokens = []): string {
        foreach ($data as $token => $value) {
            $xml = self::replaceToken($xml, $token, (string)$value, in_array($token, $bulletsTokens, true));
        }
        // Limpieza de tokens sin datos
        return preg_replace('/\{\{\w+\}\}/', '', $xml);
    }

    /** Genera el .docx final a partir del template y los datos; devuelve el binario */
    public static function build(string $template, array $data, array $bulletsTokens = []): string {
        $templatePath = __DIR__ . '/../templates/' . $template;
        if (!file_exists($templatePath)) {
            throw new Exception("Template {$template} no encontrado.");
        }

        $src = new ZipArchive();
        if ($src->open($templatePath) !== true) {
            throw new Exception('No se pudo abrir el template ' . $template);
        }
        $xml = $src->getFromName('word/document.xml');
        if ($xml === false) {
            $src->close();
            throw new Exception('word/document.xml no encontrado en el template.');
        }
        $xml = self::applyTokens($xml, $data, $bulletsTokens);

        $tmp = tempnam(sys_get_temp_dir(), 'docx_');
        $out = new ZipArchive();
        if ($out->open($tmp, ZipArchive::OVERWRITE) !== true) {
            $src->close();
            throw new Exception('No se pudo crear el documento temporal.');
        }
        for ($i = 0; $i < $src->numFiles; $i++) {
            $name = $src->getNameIndex($i);
            if ($name === 'word/document.xml') {
                $out->addFromString($name, $xml);
            } else {
                $content = $src->getFromIndex($i);
                if ($content !== false) $out->addFromString($name, $content);
            }
        }
        $out->close();
        $src->close();

        $bin = file_get_contents($tmp);
        unlink($tmp);
        return $bin;
    }
}
