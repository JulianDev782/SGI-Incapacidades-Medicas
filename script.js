class GestionIncapacidad {
    constructor() {
        const datos = JSON.parse(localStorage.getItem('sgi_data')) || { total: 0, pendientes: 0, aprobadas: 0, historial: [] };
        Object.assign(this, datos);
        this.renderizarTodo();
    }

    limpiarTexto(t) { return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(); }

    analizar(nom, diag, dias) {
        const dL = this.limpiarTexto(diag);
        let res = { colaborador: nom, diagnostico: diag, dias: dias, fecha: new Date().toLocaleString(), esValido: false, prioridad: "Baja", mensaje: "", color: "#2e7d32" };

        if (dL.match(/paternidad|maternidad|nacimiento|luto|licencia/)) {
            res.prioridad = "Media"; res.color = "#fbc02d";
            const lim = dL.includes("maternidad") ? 126 : (dL.includes("luto") ? 5 : 14);
            if (dias <= lim) { res.esValido = true; res.mensaje = "✅ Trámite Legal Validado."; }
            else { res.mensaje = `❌ Alerta: Excede tope de ${lim} días.`; }
        } else if (dL.match(/accidente|fractura|laboral|moto|cirugia|caida|herida/)) {
            res.prioridad = "Alta"; res.color = "#d32f2f";
            res.mensaje = "🚨 ALERTA CRÍTICA: Reportar a ARL/SST.";
        } else if (dL.match(/grip|viral|resfriado|dolor/)) {
            if (dias <= 3) { res.esValido = true; res.mensaje = "✅ Aceptada."; }
            else { res.mensaje = "🔍 Revisión: Duración inusual."; }
        } else { res.color = "#546e7a"; res.mensaje = "🔍 Análisis Manual Requerido."; }
        return res;
    }

    actualizarContadores(res) {
        this.total++;
        res.esValido ? this.aprobadas++ : this.pendientes++;
        this.historial.unshift(res);
        localStorage.setItem('sgi_data', JSON.stringify(this));
        this.renderizarTodo();
        actualizarGrafica();
    }

    renderizarTodo() {
        document.getElementById('colabCount').innerText = [...new Set(this.historial.map(i => i.cedula))].length;
        document.getElementById('totalCount').innerText = this.total;
        const resumen = document.getElementById('resumenGestion');
        if(resumen) {
            resumen.innerHTML = `
                <div style="background:#e0f2f1; padding:10px; border-radius:8px; margin-bottom:5px;">Críticos: <b>${this.historial.filter(i=>i.prioridad==="Alta").length}</b></div>
                <div style="background:#e8f5e9; padding:10px; border-radius:8px; margin-bottom:5px;">Aprobadas: <b>${this.aprobadas}</b></div>
                <div style="background:#fff3e0; padding:10px; border-radius:8px;">En Revisión: <b>${this.pendientes}</b></div>
            `;
        }
        const tabla = document.getElementById('cuerpoTabla');
        tabla.innerHTML = "";
        this.historial.forEach(i => {
            const row = tabla.insertRow();
            row.innerHTML = `<td>${i.cedula}</td><td>${i.colaborador}</td><td>${i.diagnostico}</td><td>${i.fecha}</td><td>${i.dias}</td><td><span class="${i.esValido?'status-aceptada':'status-revision'}">${i.esValido?'Aceptada':'Revisión'}</span></td>`;
        });
    }

    filtrarTabla() {
        const b = this.limpiarTexto(document.getElementById('buscador').value);
        document.querySelectorAll('#cuerpoTabla tr').forEach(r => r.style.display = (r.innerText.toLowerCase().includes(b)) ? "" : "none");
    }

    exportarExcel() {
        let csv = "Cedula,Nombre,Diagnostico,Fecha,Dias,Estado\n";
        this.historial.forEach(i => csv += `${i.cedula},${i.colaborador},${i.diagnostico},${i.fecha},${i.dias},${i.esValido?'OK':'Revision'}\n`);
        const a = document.createElement('a');
        a.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        a.download = 'Reporte_SGI.csv'; a.click();
    }

    borrarDatos() { if(confirm("¿Borrar todo?")) { localStorage.clear(); location.reload(); } }
}

const sistema = new GestionIncapacidad();

// --- LOGIN ---
function validarAcceso() {
    if (document.getElementById('user').value === "admin" && document.getElementById('pass').value === "1234") {
        document.getElementById('login-screen').style.display = "none";
        sessionStorage.setItem('sesionSGI', 'activa');
        initGrafica();
    } else { alert("Error"); }
}

window.onload = () => { if (sessionStorage.getItem('sesionSGI') === 'activa') { document.getElementById('login-screen').style.display = "none"; initGrafica(); } };

// --- GRÁFICA ---
let miGrafica;
function initGrafica() {
    const ctx = document.getElementById('graficaIncapacidades').getContext('2d');
    miGrafica = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Aprobadas', 'Revisión'], datasets: [{ data: [sistema.aprobadas, sistema.pendientes], backgroundColor: ['#2e7d32', '#ef6c00'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function actualizarGrafica() { if(miGrafica) { miGrafica.data.datasets[0].data = [sistema.aprobadas, sistema.pendientes]; miGrafica.update(); } }

// --- ACCIONES ---
function analizarIA() {
    const cc = document.getElementById('cedula').value;
    const nom = document.getElementById('nombre').value;
    const diag = document.getElementById('diagnostico').value;
    const dias = parseInt(document.getElementById('dias').value);
    const resp = document.getElementById('aiResponse');

    if(!cc || !nom || !diag || !dias) return alert("Complete los campos");
    if(sistema.historial.find(i=>i.cedula===cc) && !confirm("Ya existe registro. ¿Continuar?")) return;

    const res = sistema.analizar(nom, diag, dias);
    res.cedula = cc;
    sistema.actualizarContadores(res);

    resp.innerHTML = `<strong>Resultado:</strong><br>${res.mensaje}`;
    resp.className = "response-box";
    resp.style.borderLeft = "none";
    if(res.prioridad === "Alta") resp.classList.add('alerta-critica');
    else if(res.prioridad === "Media") resp.classList.add('alerta-media');
    else resp.style.borderLeft = `10px solid ${res.color}`;
}

function nuevaIncapacidad() { 
    ['cedula','nombre','diagnostico','dias'].forEach(id => document.getElementById(id).value = "");
    document.getElementById('aiResponse').innerHTML = "Esperando datos...";
    document.getElementById('aiResponse').className = "response-box";
}

function recargarPagina() { location.reload(); }