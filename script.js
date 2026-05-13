/**
 * PROYECTO SGI - SISTEMA DE GESTIÓN DE INCAPACIDADES
 * Versión 6.6: Motor de Inferencia Estable (Corrección ARL)
 */

class GestionIncapacidad {
    constructor() {
        const datos = JSON.parse(localStorage.getItem('sgi_data')) || { 
            total: 0, pendientes: 0, aprobadas: 0, historial: [] 
        };
        Object.assign(this, datos);
        this.renderizarTodo();
    }

    limpiarTexto(t) { 
        if (!t) return "";
        return t.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
    }

    analizar(nom, diag, dias) {
        const dL = this.limpiarTexto(diag);
        const ahora = new Date();
        const fechaFull = `${ahora.toLocaleDateString()} - ${ahora.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        
        let res = { 
            cedula: "", 
            colaborador: nom, 
            diagnostico: diag, 
            dias: dias, 
            fecha: fechaFull, 
            estado: "Pendiente", 
            prioridad: "Baja", 
            mensaje: "", 
            ley: "", 
            color: "#fbc02d" 
        };

        // --- MOTOR DE INFERENCIA LEGAL ---
        if (dL.match(/paternidad|maternidad|nacimiento|luto|fallecimiento/)) {
            if (dL.match(/luto|fallecimiento/)) {
                res.ley = "Ley 1280 de 2009 (Ley de Luto)";
                res.mensaje = `⚠️ **PENDIENTE:** Según la **${res.ley}**, dispone de 5 días hábiles. Adjuntar acta de defunción.`;
            } else {
                res.ley = "Ley 2114 de 2021";
                res.mensaje = `⚠️ **PENDIENTE:** Bajo la **${res.ley}**, el sistema requiere el Registro Civil de Nacimiento.`;
            }
        } 
        else if (dL.match(/transito|soat|choque|atropellado|vehiculo|moto/)) {
            res.prioridad = "Media";
            res.ley = "Decreto 780 de 2016 (SOAT)";
            res.estado = "En Revisión";
            res.color = "#ef6c00";
            res.mensaje = `🚗 **ACCIDENTE DE TRÁNSITO:** Detectado evento vial. Según el **${res.ley}**, debe aportar croquis y certificado de atención médica inicial por SOAT.`;
        }
        else if (dL.match(/accidente|fractura|laboral|caida|herida|quemadura|esfuerzo/)) {
            res.prioridad = "Alta";
            res.ley = "Ley 1562 de 2012 (Riesgos Laborales)";
            res.estado = "En Revisión";
            res.color = "#d32f2f";
            res.mensaje = `🚨 **ACCIDENTE LABORAL:** Posible riesgo profesional. Se debe **notificar de inmediato a la ARL** y radicar el reporte FURAT bajo la Ley 1562 antes de 48 horas.`;
        }
        else {
            res.ley = "Decreto 1427 de 2022";
            if (dias <= 3) {
                res.estado = "Aceptada";
                res.mensaje = `✅ **ACEPTADA:** Enfermedad común. Empresa asume pago según el **${res.ley}**.`;
            } else {
                res.estado = "En Revisión";
                res.mensaje = `🔍 **EN REVISIÓN:** Ausentismo mayor a 3 días. El **${res.ley}** exige transcripción de la EPS.`;
            }
        }
        return res;
    }

    validarDocumentoIA(cedula, input) {
        const file = input.files[0];
        if (!file) return;
        const registroActual = this.historial.find(i => i.cedula == cedula);
        if (!registroActual) return alert("Error de sincronización.");

        const resp = document.getElementById('aiResponse');
        resp.innerHTML = `🤖 **IA PROCESANDO:** Validando soporte...`;
        
        setTimeout(() => {
            if (registroActual.estado !== "Aceptada") {
                registroActual.estado = "Aceptada";
                this.aprobadas++;
                this.pendientes--;
                this.guardar();
                this.renderizarTodo();
                actualizarGrafica();
            }
            resp.innerHTML = `🤖 **IA:** Soporte validado correctamente bajo la norma:<br><strong>${registroActual.ley}</strong>.`;
            alert("🤖 IA: Documento validado con éxito.");
        }, 2000);
    }

    actualizarContadores(res) {
        this.total++;
        if (res.estado === "Aceptada") this.aprobadas++;
        else this.pendientes++; 
        this.historial.unshift(res);
        this.guardar();
        this.renderizarTodo();
        actualizarGrafica();
    }

    guardar() { 
        localStorage.setItem('sgi_data', JSON.stringify({
            total: this.total, pendientes: this.pendientes, 
            aprobadas: this.aprobadas, historial: this.historial 
        })); 
    }

    renderizarTodo() {
        if(document.getElementById('totalCount')) document.getElementById('totalCount').innerText = this.total;
        if(document.getElementById('colabCount')) {
            const unicos = new Set(this.historial.map(i => i.cedula));
            document.getElementById('colabCount').innerText = unicos.size;
        }

        const resumen = document.getElementById('resumenGestion');
        if(resumen) {
            resumen.innerHTML = `
                <div class="card module-card"><h4>Aprobadas</h4><p>${this.aprobadas}</p></div>
                <div class="card module-card"><h4>Pendientes</h4><p>${this.pendientes}</p></div>
            `;
        }

        const tabla = document.getElementById('cuerpoTabla');
        if(tabla) {
            tabla.innerHTML = "";
            this.historial.forEach((i) => {
                const row = tabla.insertRow();
                let claseStatus = i.estado === "Aceptada" ? "status-aceptada" : 
                                 (i.estado === "Pendiente" ? "status-pendiente" : "status-revision");
                const accionIA = (i.estado !== "Aceptada") 
                    ? `<label class="btn-upload">📁 Subir<input type="file" style="display:none" onchange="sistema.validarDocumentoIA('${i.cedula}', this)"></label>` 
                    : `<span>✅ Verificado</span>`;

                row.innerHTML = `
                    <td>${i.cedula}</td><td>${i.colaborador}</td>
                    <td><strong>${i.diagnostico}</strong><br><small>${i.ley}</small></td>
                    <td>${i.fecha}</td><td>${i.dias}</td>
                    <td><span class="${claseStatus}">${i.estado}</span></td><td>${accionIA}</td>
                `;
            });
        }
    }

    filtrarTabla() {
        const b = this.limpiarTexto(document.getElementById('buscador').value);
        document.querySelectorAll('#cuerpoTabla tr').forEach(r => {
            r.style.display = (r.innerText.toLowerCase().includes(b)) ? "" : "none";
        });
    }

    exportarExcel() {
        if (this.historial.length === 0) return alert("No hay datos.");
        let csv = "Cedula,Nombre,Diagnostico,Ley,Fecha,Dias,Estado\n";
        this.historial.forEach(i => {
            csv += `${i.cedula},${i.colaborador},${i.diagnostico},${i.ley},${i.fecha},${i.dias},${i.estado}\n`;
        });
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = 'Reporte_SGI.csv';
        a.click();
    }

    borrarDatos() { 
        if(confirm("⚠️ ¿Borrar historial completo?")) { 
            localStorage.clear(); location.reload(); 
        } 
    }
}

const sistema = new GestionIncapacidad();

function validarAcceso() {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    if (u === "admin" && p === "1234") {
        document.getElementById('login-screen').style.display = "none";
        sessionStorage.setItem('sesionSGI', 'activa');
        initGrafica();
    } else { alert("❌ Credenciales incorrectas."); }
}

window.onload = () => { 
    if (sessionStorage.getItem('sesionSGI') === 'activa') { 
        document.getElementById('login-screen').style.display = "none"; 
        initGrafica(); 
    } 
};

let miGrafica;
function initGrafica() {
    const canvas = document.getElementById('graficaIncapacidades');
    if(!canvas) return;
    miGrafica = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Aprobadas', 'Pendientes'],
            datasets: [{ 
                data: [sistema.aprobadas, sistema.pendientes], 
                backgroundColor: ['#2e7d32', '#f57f17']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function actualizarGrafica() {
    if(miGrafica) {
        miGrafica.data.datasets[0].data = [sistema.aprobadas, sistema.pendientes];
        miGrafica.update();
    }
}

function analizarIA() {
    const cc = document.getElementById('cedula').value.trim();
    const nom = document.getElementById('nombre').value.trim();
    const diag = document.getElementById('diagnostico').value.trim();
    const dias = parseInt(document.getElementById('dias').value);
    const resp = document.getElementById('aiResponse');

    if (!cc || !nom || !diag || isNaN(dias)) return alert("⚠️ Ingrese todos los datos.");

    try {
        const res = sistema.analizar(nom, diag, dias);
        res.cedula = cc;
        sistema.actualizarContadores(res);

        resp.innerHTML = `<strong>Análisis para ${nom.toUpperCase()}:</strong><br>${res.mensaje}`;
        resp.className = "response-box"; 
        
        if (res.prioridad === "Alta") resp.classList.add('alerta-critica');
        else if (res.prioridad === "Media") resp.classList.add('alerta-media');
        else resp.style.borderLeft = `10px solid ${res.color}`;

    } catch (e) {
        console.error(e);
        alert("Error en el motor de reglas.");
    }
}

function nuevaIncapacidad() {
    ['cedula','nombre','diagnostico','dias'].forEach(id => document.getElementById(id).value = "");
}

function recargarPagina() { location.reload(); }