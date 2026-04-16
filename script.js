// --- VARIABLES GLOBALES PARA EL DASHBOARD ---
let total = 0;
let pendientes = 0;
let aprobadas = 0;

function analizarIA() {
    const nom = document.getElementById('nombre').value;
    const diagInput = document.getElementById('diagnostico').value;
    const diasInput = document.getElementById('dias').value;

    if (!nom || !diagInput || !diasInput) {
        alert("⚠️ Por favor completa todos los campos.");
        return;
    }

    const dias = parseInt(diasInput);
    const diagLower = diagInput.toLowerCase().trim();
    let esValido = false;
    let mensajeIA = "";

    // --- BASE DE CONOCIMIENTOS DEL MANUAL ---

    // 1. LICENCIAS DE LEY (Paternidad / Luto)
    if (diagLower.includes("paternidad") || diagLower.includes("nacimiento")) {
        if (dias <= 14) {
            esValido = true;
            mensajeIA = "✅ **Validado:** Licencia de paternidad (Ley 2114). <br>📂 **REQUISITO:** Registro Civil de Nacimiento (Plazo 30 días).";
        } else {
            esValido = false;
            mensajeIA = "❌ **Alerta:** Los días de paternidad no pueden exceder los 14 legales.";
        }
    }
    else if (diagLower.includes("luto") || diagLower.includes("fallecimiento")) {
        if (dias <= 5) {
            esValido = true;
            mensajeIA = "✅ **Validado:** Licencia por luto (Ley 1280). <br>📂 **REQUISITO:** Acta de defunción.";
        } else {
            esValido = false;
            mensajeIA = "🔍 **Alerta:** Excede los 5 días hábiles de ley. Verifique relación de parentesco.";
        }
    }

    // 2. ENFERMEDADES COMUNES (Gripe, Migraña, Cólico)
    else if (diagLower.includes("grip") || diagLower.includes("viral") || diagLower.includes("resfriado")) {
        if (dias <= 3) {
            esValido = true;
            mensajeIA = "✅ **Validado:** Cuadro viral común acorde al estándar.";
        } else {
            esValido = false;
            mensajeIA = "🔍 **Alerta:** Días excedidos para gripe. **Requiere Epicrisis**.";
        }
    }
    else if (diagLower.includes("migraña") || diagLower.includes("cefalea") || diagLower.includes("dolor de cabeza")) {
        if (dias <= 2) {
            esValido = true;
            mensajeIA = "✅ **Validado:** Crisis migrañosa. <br>⚠️ **Nota:** Si es recurrente, remitir a Salud Ocupacional.";
        } else {
            esValido = false;
            mensajeIA = "🔍 **Alerta:** Tiempo inusual para migraña. Requiere concepto de especialista.";
        }
    }

    // 3. TRAUMAS Y CIRUGÍAS (Fracturas, Esguinces, Operaciones)
    else if (diagLower.includes("fractura") || diagLower.includes("hueso") || diagLower.includes("cirugia") || diagLower.includes("operacion")) {
        if (dias <= 30) {
            esValido = true;
            mensajeIA = "✅ **Validado:** Proceso de recuperación quirúrgico/óseo. <br>📂 **REQUISITO:** Rayos X y Resumen de cirugía.";
        } else {
            esValido = false;
            mensajeIA = "🔍 **Alerta:** Recuperación prolongada. Requiere plan de rehabilitación de la EPS.";
        }
    }

    // 4. SALUD MENTAL (Estrés, Ansiedad)
    else if (diagLower.includes("estres") || diagLower.includes("ansiedad") || diagLower.includes("quemado")) {
        esValido = false; // Siempre a revisión por protocolo de salud mental
        mensajeIA = "⚠️ **Revisión Prioritaria:** Caso de Salud Mental. Remitir inmediatamente a Psicología y Salud Ocupacional.";
    }

    // 5. ACCIDENTES (Tránsito / Laboral)
    else if (diagLower.includes("accidente") || diagLower.includes("transito") || diagLower.includes("laboral") || diagLower.includes("moto")) {
        esValido = false;
        mensajeIA = "🚨 **Crítico:** Reportar a ARL (FURAT) o SOAT (FURIPS). **Adjuntar Epicrisis de Urgencias**.";
    }

    // 6. DEFAULT (No encontrado)
    else {
        esValido = false;
        mensajeIA = "🔍 **Análisis Manual:** Diagnóstico no frecuente. Verifique soportes físicos y Epicrisis.";
    }

    // --- ACTUALIZAR CONTADORES ---
    total++;
    esValido ? aprobadas++ : pendientes++;

    document.getElementById('totalCount').innerText = total;
    document.getElementById('pendingCount').innerText = esValido ? 0 : 1; 
    document.getElementById('reviCount').innerText = pendientes;
    document.getElementById('approvedCount').innerText = aprobadas;

    // --- MOSTRAR MENSAJE ---
    const respuestaDiv = document.getElementById('aiResponse');
    respuestaDiv.innerHTML = `<strong>Análisis para ${nom}:</strong><br>${mensajeIA}`;
    respuestaDiv.style.color = esValido ? "#2e7d32" : "#d32f2f";

    // --- INSERTAR EN TABLA ---
    const tabla = document.getElementById('cuerpoTabla');
    const fila = tabla.insertRow(0);
    const claseStatus = esValido ? 'status-aceptada' : 'status-revision';
    const textoStatus = esValido ? 'Aceptada' : 'En Revisión';

    fila.innerHTML = `
        <td>${nom}</td>
        <td>${diagInput}</td>
        <td>${dias}</td>
        <td><span class="${claseStatus}">${textoStatus}</span></td>
    `;
}

function nuevaIncapacidad() {
    document.getElementById('nombre').value = "";
    document.getElementById('diagnostico').value = "";
    document.getElementById('dias').value = "";
    document.getElementById('aiResponse').innerHTML = "Esperando datos...";
    document.getElementById('aiResponse').style.color = "#666";
    document.getElementById('nombre').focus();
}