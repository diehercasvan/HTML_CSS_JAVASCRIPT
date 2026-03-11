// js/utils/jwt.js
// Versión 1.1 - CORREGIDA

console.log('🔄 Iniciando carga de jwt.js...');

const JWT = (function() {
    console.log('📦 Ejecutando JWT IIFE...');
    
    const SECRET = 'sena-ceet-gestion-salones-2026-secret-key';
    
    function base64UrlEncode(str) {
        try {
            const utf8Str = unescape(encodeURIComponent(str));
            return btoa(utf8Str)
                .replace(/=/g, '')
                .replace(/\+/g, '-')
                .replace(/\//g, '_');
        } catch (e) {
            if (typeof Logger !== 'undefined') Logger?.error('Error en base64UrlEncode:', e);
            return '';
        }
    }
    
    function base64UrlDecode(str) {
        try {
            str = str.replace(/-/g, '+').replace(/_/g, '/');
            while (str.length % 4) {
                str += '=';
            }
            const base64 = atob(str);
            return decodeURIComponent(escape(base64));
        } catch (e) {
            if (typeof Logger !== 'undefined') Logger?.error('Error en base64UrlDecode:', e);
            return '';
        }
    }
    
    function generateSignature(data) {
        let hash = 0;
        const str = data + SECRET;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }
    
    function sign(payload, expiresIn = 7200) {
        try {
            const header = {
                alg: 'HS256',
                typ: 'JWT'
            };
            
            const now = Math.floor(Date.now() / 1000);
            const exp = now + expiresIn;
            
            const fullPayload = {
                ...payload,
                iat: now,
                exp: exp,
                iss: 'sena-ceet',
                aud: 'gestion-salones'
            };
            
            const encodedHeader = base64UrlEncode(JSON.stringify(header));
            const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
            
            const signature = generateSignature(encodedHeader + '.' + encodedPayload);
            const encodedSignature = base64UrlEncode(signature);
            
            const token = encodedHeader + '.' + encodedPayload + '.' + encodedSignature;
            
            if (typeof Logger !== 'undefined') {
                Logger.info('JWT generado para:', payload.email);
            }
            return token;
            
        } catch (e) {
            if (typeof Logger !== 'undefined') Logger?.error('Error generando JWT:', e);
            return null;
        }
    }
    
    function verify(token) {
        try {
            if (!token || typeof token !== 'string') {
                throw new Error('Token inválido');
            }
            
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Formato de token inválido');
            }
            
            const [encodedHeader, encodedPayload, encodedSignature] = parts;
            
            const expectedSignature = generateSignature(encodedHeader + '.' + encodedPayload);
            const decodedSignature = base64UrlDecode(encodedSignature);
            
            if (decodedSignature !== expectedSignature) {
                throw new Error('Firma inválida');
            }
            
            const payloadStr = base64UrlDecode(encodedPayload);
            const payload = JSON.parse(payloadStr);
            
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                throw new Error('Token expirado');
            }
            
            return {
                valid: true,
                payload: payload,
                error: null
            };
            
        } catch (e) {
            return {
                valid: false,
                payload: null,
                error: e.message
            };
        }
    }
    
    function decode(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            
            const payloadStr = base64UrlDecode(parts[1]);
            return JSON.parse(payloadStr);
        } catch (e) {
            return null;
        }
    }
    
    function getTimeRemaining(token) {
        const payload = decode(token);
        if (!payload || !payload.exp) return 0;
        
        const now = Math.floor(Date.now() / 1000);
        return Math.max(0, payload.exp - now);
    }
    
    function refreshIfNeeded(token, threshold = 300) {
        const remaining = getTimeRemaining(token);
        if (remaining < threshold) {
            const payload = decode(token);
            if (payload) {
                delete payload.iat;
                delete payload.exp;
                return sign(payload);
            }
        }
        return token;
    }
    
    const api = {
        sign,
        verify,
        decode,
        getTimeRemaining,
        refreshIfNeeded
    };
    
    console.log('✅ JWT v1.1 cargado correctamente');
    return api;
    
})();

// Exponer globalmente
window.JWT = JWT;