// js/components/authOverlay.js
// Versión 1.0 - Overlay para contenido no autenticado

const AuthOverlay = (function() {
    
    let overlay = null;
    
    /**
     * Crea el overlay de bloqueo
     */
    function createOverlay() {
        if (overlay) return overlay;
        
        overlay = document.createElement('div');
        overlay.id = 'authOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.95);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            backdrop-filter: blur(5px);
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center; max-width: 400px; padding: 30px;">
                <i class="fas fa-lock fa-4x text-primary mb-4"></i>
                <h3 class="mb-3">Acceso Restringido</h3>
                <p class="text-muted mb-4">Debe iniciar sesión para acceder al sistema de gestión.</p>
                <button class="btn btn-primary btn-lg" onclick="LoginModal.show()">
                    <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        return overlay;
    }
    
    /**
     * Muestra el overlay
     */
    function show() {
        const overlay = createOverlay();
        overlay.style.display = 'flex';
    }
    
    /**
     * Oculta el overlay
     */
    function hide() {
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    /**
     * Actualiza según estado de autenticación
     */
    function update() {
        if (Auth.isAuthenticated()) {
            hide();
        } else {
            show();
        }
    }
    
    // Escuchar cambios en autenticación
    Auth.addListener(() => {
        update();
    });
    
    // API pública
    return {
        show,
        hide,
        update
    };
    
})();

window.AuthOverlay = AuthOverlay;
console.log('✅ AuthOverlay v1.0 cargado');