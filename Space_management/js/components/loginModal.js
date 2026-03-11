// js/components/loginModal.js
// Versión 1.0 - Modal de inicio de sesión

const LoginModal = (function() {
    
    let modalInstance = null;
    let onSuccessCallback = null;
    
    /**
     * Muestra el modal de login
     */
    function show(onSuccess = null) {
        onSuccessCallback = onSuccess;
        
        // Si ya está autenticado, no mostrar
        if (Auth.isAuthenticated()) {
            if (onSuccessCallback) onSuccessCallback(Auth.getCurrentUser());
            return;
        }
        
        Swal.fire({
            title: '🔐 Iniciar Sesión',
            html: `
                <form id="loginForm" class="text-start" onsubmit="return false;">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Documento de Identidad</label>
                        <input type="text" class="form-control" id="loginDocumento" 
                               placeholder="Ej: 12345678" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Correo Electrónico</label>
                        <input type="email" class="form-control" id="loginEmail" 
                               placeholder="ejemplo@institucion.edu" required>
                    </div>
                    <div class="mb-3 text-muted small">
                        <i class="fas fa-info-circle"></i> Use sus credenciales institucionales
                    </div>
                </form>
            `,
            showCancelButton: true,
            confirmButtonText: 'Ingresar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#003366',
            width: '500px',
            didOpen: () => {
                // Enfocar el primer campo
                document.getElementById('loginDocumento').focus();
                
                // Permitir submit con Enter
                document.getElementById('loginForm').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        Swal.clickConfirm();
                    }
                });
            },
            preConfirm: async () => {
                const documento = document.getElementById('loginDocumento').value;
                const email = document.getElementById('loginEmail').value;
                
                if (!documento || !email) {
                    Swal.showValidationMessage('Todos los campos son obligatorios');
                    return false;
                }
                
                // Mostrar carga
                Swal.showLoading();
                
                const result = await Auth.login(documento, email);
                
                if (!result.success) {
                    Swal.showValidationMessage(result.error);
                    return false;
                }
                
                return result.user;
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido!',
                    text: `Hola ${result.value.nombre}`,
                    timer: 2000,
                    showConfirmButton: false
                });
                
                if (onSuccessCallback) {
                    onSuccessCallback(result.value);
                }
            }
        });
    }
    
    /**
     * Muestra información de la sesión actual
     */
    function showSessionInfo() {
        if (!Auth.isAuthenticated()) {
            show();
            return;
        }
        
        const user = Auth.getCurrentUser();
        const minutesLeft = Auth.getSessionTimeRemaining();
        
        Swal.fire({
            title: '👤 Sesión Activa',
            html: `
                <div class="text-start">
                    <p><strong>Nombre:</strong> ${user.nombre}</p>
                    <p><strong>Documento:</strong> ${user.documento}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Curso:</strong> ${user.curso}</p>
                    <p><strong>Materia:</strong> ${user.materia || 'N/A'}</p>
                    <hr>
                    <p><strong>Tiempo restante:</strong> ${minutesLeft} minutos</p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Cerrar Sesión',
            cancelButtonText: 'Continuar',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#003366'
        }).then((result) => {
            if (result.isConfirmed) {
                Auth.logout();
                Swal.fire({
                    icon: 'success',
                    title: 'Sesión cerrada',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    }
    
    /**
     * Verifica autenticación antes de una acción
     */
    async function requireAuth(action) {
        if (Auth.isAuthenticated()) {
            // Verificar si necesita renovar token
            Auth.refreshTokenIfNeeded();
            return true;
        }
        
        const result = await Swal.fire({
            title: '🔐 Acceso Restringido',
            text: 'Debe iniciar sesión para continuar',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Iniciar Sesión',
            cancelButtonText: 'Cancelar'
        });
        
        if (result.isConfirmed) {
            return new Promise((resolve) => {
                show(() => {
                    resolve(true);
                });
            });
        }
        
        return false;
    }
    
    // API pública
    return {
        show,
        showSessionInfo,
        requireAuth
    };
    
})();

// Exponer globalmente
window.LoginModal = LoginModal;

console.log('✅ LoginModal v1.0 cargado');