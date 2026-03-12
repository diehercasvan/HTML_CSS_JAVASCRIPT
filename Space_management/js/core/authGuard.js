// js/core/authGuard.js
// Versión 1.0 - Protector de módulos

console.log('🔄 Iniciando carga de authGuard.js...');

const AuthGuard = (function () {

    /**
     * Verifica si el usuario está autenticado
     */
    function checkAuth() {
        if (!Auth.isAuthenticated()) {
            showAuthRequired();
            return false;
        }
        return true;
    }

    /**
     * Muestra mensaje de autenticación requerida
     */
    function showAuthRequired() {
        Swal.fire({
            title: '🔐 Acceso Restringido',
            html: `
                <div class="text-center">
                    <i class="fas fa-lock fa-3x text-danger mb-3"></i>
                    <p>Debe iniciar sesión para acceder a esta funcionalidad.</p>
                    <p class="text-muted small">Use sus credenciales institucionales (documento y email).</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Iniciar Sesión',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#003366'
        }).then((result) => {
            if (result.isConfirmed) {
                LoginModal.show();
            }
        });
    }

    /**
     * Envuelve una función para requerir autenticación
     */
    function requireAuth(fn, context = null) {
        return function (...args) {
            if (!Auth.isAuthenticated()) {
                showAuthRequired();
                return null;
            }

            // Refrescar token si es necesario
            Auth.refreshTokenIfNeeded();

            // Ejecutar la función original
            if (context) {
                return fn.apply(context, args);
            } else {
                return fn(...args);
            }
        };
    }

    /**
     * Verifica autenticación para eventos de UI
     */
    function setupUIGuard() {
        // Interceptar todos los clics en elementos con data-auth="required"
        document.addEventListener('click', function (e) {
            const target = e.target.closest('[data-auth="required"]');
            if (target) {
                if (!Auth.isAuthenticated()) {
                    e.preventDefault();
                    e.stopPropagation();
                    showAuthRequired();
                    return false;
                }

                // Refrescar token
                Auth.refreshTokenIfNeeded();
            }
        }, true); // Usar captura para interceptar antes
    }

    /**
     * Protege un módulo completo
     */
    function protectModule(moduleName, moduleObj, excludeMethods = []) {
        if (!moduleObj) return moduleObj;

        const protectedModule = {};

        Object.keys(moduleObj).forEach(key => {
            if (typeof moduleObj[key] === 'function' && !excludeMethods.includes(key)) {
                // Envolver funciones con requireAuth
                protectedModule[key] = requireAuth(moduleObj[key], moduleObj);
            } else {
                // Pasar propiedades y métodos excluidos sin cambios
                protectedModule[key] = moduleObj[key];
            }
        });

        return protectedModule;
    }

    // API pública
    return {
        checkAuth,
        showAuthRequired,
        requireAuth,
        setupUIGuard,
        protectModule
    };

})();

window.AuthGuard = AuthGuard;
console.log('✅ AuthGuard v1.0 cargado');