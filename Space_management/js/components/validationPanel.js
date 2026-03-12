// js/components/validationPanel.js
// Versión 1.0 - Panel de validación con toggle y logs sanitizados

const ValidationPanel = (function () {

    let panel = null;
    let updateInterval = null;
    let isVisible = false;

    /**
     * Inicializa el panel
     */
    function init() {
        // Solo en desarrollo
        if (!Logger.isDev()) return;

        createPanel();
        setupHotkey();
        startAutoUpdate();

        Logger.info('Panel de validación inicializado');
    }

    /**
     * Crea el panel en el DOM
     */
    function createPanel() {
        panel = document.createElement('div');
        panel.id = 'validationPanel';
        panel.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            width: 400px;
            max-height: 80vh;
            background: white;
            border: 2px solid #003366;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            display: none;
            overflow: hidden;
            font-family: 'Segoe UI', sans-serif;
            font-size: 12px;
        `;

        panel.innerHTML = getPanelHTML();
        document.body.appendChild(panel);

        setupEventListeners();
    }

    /**
     * HTML del panel
     */
    function getPanelHTML() {
        return `
            <div style="background: #003366; color: white; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
                <h6 style="margin: 0; font-size: 14px;">
                    <i class="fas fa-check-circle"></i> Panel de Validación
                </h6>
                <div>
                    <button id="togglePanelMinimize" style="background: none; border: none; color: white; cursor: pointer; margin-right: 5px;">
                        <i class="fas fa-window-minimize"></i>
                    </button>
                    <button id="togglePanelClose" style="background: none; border: none; color: white; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div id="panelContent" style="padding: 10px; max-height: calc(80vh - 50px); overflow-y: auto;">
                Cargando...
            </div>
        `;
    }

    /**
     * Configura event listeners
     */
    function setupEventListeners() {
        document.getElementById('togglePanelMinimize').addEventListener('click', () => {
            const content = document.getElementById('panelContent');
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });

        document.getElementById('togglePanelClose').addEventListener('click', () => {
            hide();
        });
    }

    /**
     * Configura tecla de acceso rápido (Ctrl+Shift+V)
     */
    function setupHotkey() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                toggle();
            }
        });
    }

    /**
     * Muestra el panel
     */
    function show() {
        if (panel) {
            panel.style.display = 'block';
            isVisible = true;
            updateContent();
        }
    }

    /**
     * Oculta el panel
     */
    function hide() {
        if (panel) {
            panel.style.display = 'none';
            isVisible = false;
        }
    }

    /**
     * Alterna visibilidad del panel
     */
    function toggle() {
        if (isVisible) {
            hide();
        } else {
            show();
        }
    }

    /**
     * Inicia actualización automática
     */
    function startAutoUpdate() {
        if (updateInterval) clearInterval(updateInterval);
        updateInterval = setInterval(() => {
            if (isVisible) {
                updateContent();
            }
        }, 3000);
    }

    /**
     * Actualiza el contenido del panel
     */
    function updateContent() {
        const content = document.getElementById('panelContent');
        if (!content) return;

        const estado = getValidationState();
        const logs = Logger.getLogs();
        const auth = Auth.getCurrentUser();

        content.innerHTML = `
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <h6 style="color: #003366; margin: 0;">📊 Estado</h6>
                    <span class="badge ${Logger.isDev() ? 'bg-success' : 'bg-secondary'}">
                        ${Logger.isDev() ? 'Dev' : 'Prod'}
                    </span>
                </div>
                ${renderAuthStatus(auth)}
                ${renderEstado(estado)}
            </div>
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h6 style="color: #003366; margin: 0;">📋 Logs (${logs.length})</h6>
                    <div>
                        <button onclick="Logger.clearLogs(); ValidationPanel.updateContent();" 
                                class="btn btn-sm btn-danger" style="padding: 2px 8px; font-size: 10px;">
                            Limpiar
                        </button>
                    </div>
                </div>
                <div style="max-height: 300px; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 4px;">
                    ${renderLogs(logs)}
                </div>
            </div>
            <div style="margin-top: 10px; text-align: right;">
                <small class="text-muted">
                    <i class="fas fa-keyboard"></i> Ctrl+Shift+V
                </small>
            </div>
        `;
    }

    /**
     * Renderiza estado de autenticación
     */
    function renderAuthStatus(auth) {
        if (!auth) {
            return `
                <div class="alert alert-warning" style="padding: 5px; margin-bottom: 10px; font-size: 11px;">
                    <i class="fas fa-exclamation-triangle"></i> No autenticado
                </div>
            `;
        }

        return `
            <div class="alert alert-success" style="padding: 5px; margin-bottom: 10px; font-size: 11px;">
                <div><strong>👤 ${auth.nombre}</strong></div>
                <div><small>${auth.email} | ${auth.documento}</small></div>
                <div><small>⏱️ ${Auth.getSessionTimeRemaining()} min restantes</small></div>
            </div>
        `;
    }

    /**
     * Obtiene estado de validación del sistema
     */
    function getValidationState() {
        return {
            core: typeof DataManager !== 'undefined' && typeof Auth !== 'undefined',
            funcionales: typeof UIManager !== 'undefined',
            responsables: DataManager?.getResponsables?.().length || 0,
            estudiantes: 0, // Se puede calcular si es necesario
            llamados: window.LlamadosData?.cargarLlamados?.().length || 0,
            planes: window.PlanesData?.cargarPlanes?.().length || 0
        };
    }

    /**
     * Renderiza estado en tabla
     */
    function renderEstado(estado) {
        return `
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                <tr>
                    <td style="padding: 3px;">Módulos Core:</td>
                    <td style="text-align: right;">${estado.core ? '✅' : '❌'}</td>
                </tr>
                <tr>
                    <td style="padding: 3px;">Módulos Funcionales:</td>
                    <td style="text-align: right;">${estado.funcionales ? '✅' : '❌'}</td>
                </tr>
                <tr>
                    <td style="padding: 3px;">Responsables:</td>
                    <td style="text-align: right;">${estado.responsables}</td>
                </tr>
                <tr>
                    <td style="padding: 3px;">Llamados:</td>
                    <td style="text-align: right;">${estado.llamados}</td>
                </tr>
                <tr>
                    <td style="padding: 3px;">Planes:</td>
                    <td style="text-align: right;">${estado.planes}</td>
                </tr>
            </table>
        `;
    }

    /**
     * Renderiza logs con colores
     */
    function renderLogs(logs) {
        if (logs.length === 0) {
            return '<div style="padding: 10px; text-align: center; color: #999;">No hay logs</div>';
        }

        return logs.map(log => {
            const color = getLogColor(log.level);
            return `
                <div style="margin: 2px 0; padding: 5px; border-left: 3px solid ${color}; background: #f8f9fa; font-size: 10px;">
                    <small>
                        <span style="color: ${color};">●</span>
                        <strong>${log.timestamp.split('T')[1].split('.')[0]}</strong>
                        ${log.message}
                    </small>
                    ${log.data ? `<pre style="margin: 2px 0; font-size: 9px; white-space: pre-wrap;">${JSON.stringify(log.data, null, 2)}</pre>` : ''}
                </div>
            `;
        }).join('');
    }

    /**
     * Obtiene color según nivel de log
     */
    function getLogColor(level) {
        switch (level) {
            case 'error': return '#dc3545';
            case 'warning': return '#ffc107';
            case 'success': return '#28a745';
            case 'info': return '#0d6efd';
            default: return '#6c757d';
        }
    }

    // API pública
    return {
        init,
        show,
        hide,
        toggle,
        updateContent
    };

})();

// Exponer globalmente
window.ValidationPanel = ValidationPanel;

console.log('✅ ValidationPanel v1.0 cargado');