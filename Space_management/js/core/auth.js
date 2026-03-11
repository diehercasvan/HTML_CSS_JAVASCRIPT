// js/core/auth.js
// Versión 1.1 - CORREGIDA

console.log('🔄 Iniciando carga de auth.js...');

const Auth = (function() {
    console.log('📦 Ejecutando Auth IIFE...');
    
    const STORAGE_KEY = 'auth_token';
    const USER_KEY = 'auth_user';
    
    let currentUser = null;
    let authListeners = [];
    
    /**
     * Inicializa el módulo de autenticación
     */
    async function init() {
        // Usar Logger si está disponible, si no, console.log
        if (typeof Logger !== 'undefined') {
            Logger.info('Inicializando Auth...');
        } else {
            console.log('Inicializando Auth...');
        }
        
        try {
            // Verificar si hay sesión guardada
            const token = localStorage.getItem(STORAGE_KEY);
            const savedUser = localStorage.getItem(USER_KEY);
            
            if (token && savedUser) {
                // Verificar que JWT esté disponible
                if (typeof JWT === 'undefined') {
                    throw new Error('JWT no está disponible');
                }
                
                const verification = JWT.verify(token);
                if (verification.valid) {
                    currentUser = JSON.parse(savedUser);
                    if (typeof Logger !== 'undefined') {
                        Logger.success('Sesión restaurada para:', currentUser.nombre);
                    }
                    notifyListeners();
                    return true;
                } else {
                    // Token inválido o expirado, limpiar
                    logout();
                }
            }
        } catch (e) {
            if (typeof Logger !== 'undefined') {
                Logger.error('Error en Auth.init:', e);
            } else {
                console.error('Error en Auth.init:', e);
            }
        }
        
        return false;
    }
    
    /**
     * Intenta autenticar un usuario
     */
    async function login(documento, email) {
        if (typeof Logger !== 'undefined') {
            Logger.info('Intento de login:', { documento, email });
        }
        
        try {
            // Verificar que JWT esté disponible
            if (typeof JWT === 'undefined') {
                throw new Error('JWT no está disponible');
            }
            
            // Cargar responsables desde el JSON
            const response = await fetch('data/responsables.json');
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de responsables');
            }
            
            const data = await response.json();
            const responsables = data.responsables || [];
            
            // Buscar usuario que coincida con documento y email
            const user = responsables.find(r => 
                String(r.documento).trim() === String(documento).trim() &&
                String(r.email).toLowerCase().trim() === String(email).toLowerCase().trim()
            );
            
            if (!user) {
                if (typeof Logger !== 'undefined') {
                    Logger.warn('Login fallido: credenciales inválidas');
                }
                return {
                    success: false,
                    error: 'Documento o email incorrectos'
                };
            }
            
            // Crear payload del token
            const payload = {
                documento: user.documento,
                email: user.email,
                nombre: user.nombre,
                curso: user.numeroCurso,
                materia: user.materia,
                rol: 'responsable'
            };
            
            // Generar token (2 horas)
            const token = JWT.sign(payload, 7200);
            
            if (!token) {
                throw new Error('Error generando token');
            }
            
            // Guardar sesión
            currentUser = {
                ...payload,
                token: token
            };
            
            localStorage.setItem(STORAGE_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(payload));
            
            if (typeof Logger !== 'undefined') {
                Logger.success('Login exitoso para:', user.nombre);
            }
            notifyListeners();
            
            return {
                success: true,
                user: payload,
                token: token
            };
            
        } catch (e) {
            if (typeof Logger !== 'undefined') {
                Logger.error('Error en login:', e);
            }
            return {
                success: false,
                error: 'Error interno del servidor'
            };
        }
    }
    
    /**
     * Cierra la sesión actual
     */
    function logout() {
        if (typeof Logger !== 'undefined') {
            Logger.info('Cerrando sesión de:', currentUser?.nombre);
        }
        
        currentUser = null;
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(USER_KEY);
        
        notifyListeners();
    }
    
    /**
     * Verifica si hay un usuario autenticado
     */
    function isAuthenticated() {
        if (!currentUser) return false;
        
        // Verificar token
        const token = localStorage.getItem(STORAGE_KEY);
        if (!token) return false;
        
        try {
            if (typeof JWT === 'undefined') return false;
            const verification = JWT.verify(token);
            return verification.valid;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Obtiene el usuario actual
     */
    function getCurrentUser() {
        return currentUser;
    }
    
    /**
     * Obtiene el token actual
     */
    function getToken() {
        return currentUser?.token || localStorage.getItem(STORAGE_KEY);
    }
    
    /**
     * Verifica si el token está próximo a expirar y lo renueva
     */
    function refreshTokenIfNeeded() {
        const token = getToken();
        if (!token) return false;
        
        try {
            if (typeof JWT === 'undefined') return false;
            const newToken = JWT.refreshIfNeeded(token);
            if (newToken !== token) {
                localStorage.setItem(STORAGE_KEY, newToken);
                if (currentUser) {
                    currentUser.token = newToken;
                }
                if (typeof Logger !== 'undefined') {
                    Logger.info('Token renovado automáticamente');
                }
                return true;
            }
        } catch (e) {
            // Silenciar error
        }
        return false;
    }
    
    /**
     * Agrega un listener para cambios en autenticación
     */
    function addListener(callback) {
        if (typeof callback === 'function') {
            authListeners.push(callback);
        }
    }
    
    /**
     * Elimina un listener
     */
    function removeListener(callback) {
        authListeners = authListeners.filter(cb => cb !== callback);
    }
    
    /**
     * Notifica a todos los listeners
     */
    function notifyListeners() {
        authListeners.forEach(callback => {
            try {
                callback(currentUser);
            } catch (e) {
                if (typeof Logger !== 'undefined') {
                    Logger.error('Error en listener de auth:', e);
                }
            }
        });
    }
    
    /**
     * Verifica si el usuario tiene permiso para una acción
     */
    function can(accion, recurso) {
        if (!isAuthenticated()) return false;
        return true;
    }
    
    /**
     * Obtiene el tiempo restante de sesión (en minutos)
     */
    function getSessionTimeRemaining() {
        const token = getToken();
        if (!token) return 0;
        
        try {
            if (typeof JWT === 'undefined') return 0;
            const seconds = JWT.getTimeRemaining(token);
            return Math.floor(seconds / 60);
        } catch (e) {
            return 0;
        }
    }
    
    // Crear API
    const api = {
        init,
        login,
        logout,
        isAuthenticated,
        getCurrentUser,
        getToken,
        refreshTokenIfNeeded,
        addListener,
        removeListener,
        can,
        getSessionTimeRemaining
    };
    
    console.log('✅ Auth v1.1 cargado correctamente');
    return api;
    
})();

// Exponer globalmente (¡esto es CRÍTICO!)
window.Auth = Auth;

// Auto-inicializar después de un pequeño retraso
setTimeout(() => {
    if (typeof Auth !== 'undefined') {
        Auth.init().catch(e => console.error('Error en auto-init de Auth:', e));
    }
}, 100);