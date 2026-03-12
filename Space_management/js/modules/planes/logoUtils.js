// js/modules/planes/logoUtils.js
// Utilidades para manejar logos e imágenes

console.log('🔄 Cargando logoUtils.js...');

const LogoUtils = (function () {

    // Logo del SENA en base64 (placeholder - reemplazar con el oficial después)
    const LOGO_SENA_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'; // Aquí irá el logo real

    /**
     * Obtiene el logo del SENA
     */
    function getLogoSena() {
        return LOGO_SENA_BASE64;
    }

    /**
     * Intenta cargar el logo desde diferentes rutas
     */
    async function cargarLogoDesdeArchivo() {
        const rutas = [
            'img/logo-sena.png',
            'img/logo.png',
            'img/sena-logo.png',
            '../img/logo-sena.png'
        ];

        for (const ruta of rutas) {
            try {
                const response = await fetch(ruta);
                if (response.ok) {
                    const blob = await response.blob();
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                }
            } catch (e) {
                console.log(`Logo no encontrado en: ${ruta}`);
            }
        }
        return null;
    }

    /**
     * Genera HTML para el logo en los reportes
     */
    function generarHTMLogo(logoBase64 = null) {
        if (logoBase64) {
            return `<img src="${logoBase64}" style="max-width: 100px; max-height: 100px;">`;
        }

        // Versión de respaldo con texto
        return `
            <div style="width: 80px; height: 80px; background: #003366; color: white; 
                        display: flex; align-items: center; justify-content: center; 
                        border-radius: 10px; font-weight: bold; font-size: 24px;">
                SENA
            </div>
        `;
    }

    return {
        getLogoSena,
        cargarLogoDesdeArchivo,
        generarHTMLogo
    };
})();

console.log('✅ LogoUtils cargado');
window.LogoUtils = LogoUtils;