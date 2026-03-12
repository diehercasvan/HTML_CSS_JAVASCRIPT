// js/core/logger.js
// Versión 1.0 - Sistema de logging seguro por entorno

const Logger = (function () {

    // Detectar entorno
    const isDevelopment = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('192.168.');

    // Almacenar logs en memoria (solo para el panel)
    let logHistory = [];
    const MAX_LOGS = 100;

    // Campos sensibles a ocultar
    const SENSITIVE_FIELDS = [
        'documento', 'doc', 'id', 'identificacion',
        'email', 'correo', 'mail',
        'telefono', 'celular', 'phone', 'tel',
        'password', 'pass', 'contraseña',
        'token', 'jwt', 'session',
        'direccion', 'address'
    ];

    /**
     * Sanitiza datos para remover información sensible
     */
    function sanitizeData(data) {
        if (!data) return data;

        try {
            // Crear copia profunda
            const sanitized = JSON.parse(JSON.stringify(data));

            const cleanObject = (obj) => {
                if (!obj || typeof obj !== 'object') return;

                if (Array.isArray(obj)) {
                    obj.forEach(item => cleanObject(item));
                } else {
                    Object.keys(obj).forEach(key => {
                        // Verificar si es campo sensible
                        if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f))) {
                            obj[key] = '***';
                        } else if (typeof obj[key] === 'object') {
                            cleanObject(obj[key]);
                        }
                    });
                }
            };

            cleanObject(sanitized);
            return sanitized;

        } catch (e) {
            return '[Error sanitizando datos]';
        }
    }

    /**
     * Formatea el mensaje de log
     */
    function formatMessage(level, message, data) {
        const timestamp = new Date().toISOString();
        const sanitizedData = data ? sanitizeData(data) : null;

        return {
            timestamp,
            level,
            message,
            data: sanitizedData,
            stack: level === 'error' ? new Error().stack : null
        };
    }

    /**
     * Guarda log en memoria
     */
    function storeLog(logEntry) {
        logHistory.push(logEntry);
        if (logHistory.length > MAX_LOGS) {
            logHistory.shift();
        }
    }

    /**
     * Log de información (solo desarrollo)
     */
    function info(message, data = null) {
        if (!isDevelopment) return;

        const logEntry = formatMessage('info', message, data);
        console.log(`ℹ️ [${logEntry.timestamp}] ${message}`, data || '');
        storeLog(logEntry);
    }

    /**
     * Log de éxito (solo desarrollo)
     */
    function success(message, data = null) {
        if (!isDevelopment) return;

        const logEntry = formatMessage('success', message, data);
        console.log(`✅ [${logEntry.timestamp}] ${message}`, data || '');
        storeLog(logEntry);
    }

    /**
     * Log de advertencia (siempre visible)
     */
    function warn(message, data = null) {
        const logEntry = formatMessage('warning', message, data);
        console.warn(`⚠️ [${logEntry.timestamp}] ${message}`, data || '');
        storeLog(logEntry);
    }

    /**
     * Log de error (siempre visible)
     */
    function error(message, error = null) {
        const logEntry = formatMessage('error', message, error);
        console.error(`❌ [${logEntry.timestamp}] ${message}`, error || '');
        storeLog(logEntry);

        // Opcional: Enviar error a servidor en producción
        if (!isDevelopment) {
            // reportErrorToServer(logEntry);
        }
    }

    /**
     * Obtener historial de logs
     */
    function getLogs() {
        return logHistory;
    }

    /**
     * Limpiar historial
     */
    function clearLogs() {
        logHistory = [];
        info('Logs limpiados');
    }

    /**
     * Verificar si es entorno de desarrollo
     */
    function isDev() {
        return isDevelopment;
    }

    // API pública
    return {
        info,
        success,
        warn,
        error,
        getLogs,
        clearLogs,
        isDev
    };

})();

// Exponer globalmente
window.Logger = Logger;

console.log('✅ Logger v1.0 cargado');