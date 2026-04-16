/**
 * PROYECTO: SGI - Sistema de Gestión de Incapacidades
 * LÓGICA: Mejorada para detectar palabras clave
 */

class AnalizadorIncapacidad {
    constructor(nombre, diagnostico, dias) {
        this.nombre = nombre;
        this.diagnostico = diagnostico.toLowerCase().trim();
        this.dias = parseInt(dias);
    }

    obtenerRecomendacion() {
        // Reglas del Manual
        const reglas = {
            gripe: { max: 3, msg: "Tratamiento de origen común." },
            paternidad: { max: 14, msg: "Cargar Registro Civil. Plazo: 30 días para trámite." },
            laboral: { max: 15, msg: "Reportar a la ARL (Sucesos repentinos)." },
            transito: { max: 10, msg: "Obligatorio presentar FURIPS y Epicrisis." },
            fractura: { max: 30, msg: "Requiere seguimiento y rehabilitación." }
        };

        let recomendacion = "";
        let encontrado = false;

        // BUSCADOR INTELIGENTE: Busca si el texto contiene palabras clave
        for (let clave in reglas) {
            if (this.diagnostico.includes(clave)) {
                encontrado = true;
                const info = reglas[clave];
                if (this.dias > info.max) {
                    recomendacion = `⚠️ **Alerta:** Los días exceden el estándar (${info.max}). ${info.msg}`;
                } else {
                    recomendacion = `✅ **Validado:** Coincide con los lineamientos. ${info.msg}`;
                }
                break; 
            }
        }

        if (!encontrado) {
            recomendacion = "🔍 **Análisis Manual:** Diagnóstico no frecuente. Verifique soportes según Actividad 3.";
        }

        // Regla de Epicrisis
        if (this.dias > 2 || this.diagnostico.includes("transito") || 
            this.diagnostico.includes("laboral") || this.diagnostico.includes("paternidad")) {
            recomendacion += " **Nota:** Adjuntar Epicrisis obligatoria.";
        }

        return recomendacion;
    }
}

function analizarIA() {
    const nombre = document.getElementById('nombre').value;
    const diag = document.getElementById('diagnostico').value;
    const dias = document.getElementById('dias').value;
    const respuestaDiv = document.getElementById('aiResponse');
    const tabla = document.getElementById('cuerpoTabla');

    if (!nombre || !diag || !dias) {
        respuestaDiv.innerHTML = "<span style='color: #e74c3c;'>❌ Complete todos los campos.</span>";
        return;
    }

    const miRegistro = new AnalizadorIncapacidad(nombre, diag, dias);
    const recomendacion = miRegistro.obtenerRecomendacion();

    respuestaDiv.innerHTML = `<strong>Resultado para ${miRegistro.nombre}:</strong><br>${recomendacion}`;

    const nuevaFila = tabla.insertRow(0);
    let esAprobado = recomendacion.includes('✅');
    let claseEstado = esAprobado ? 'status-acepta' : 'status-revisa';
    let textoEstado = esAprobado ? 'Aceptada' : 'En Revisión';

    nuevaFila.innerHTML = `
        <td style="font-weight: 500;">${miRegistro.nombre}</td>
        <td style="text-transform: capitalize;">${miRegistro.diagnostico}</td>
        <td>${miRegistro.dias}</td>
        <td><span class="status ${claseEstado}">${textoEstado}</span></td>
    `;
}

function nuevaIncapacidad() {
    document.getElementById('formIncapacidad').reset();
    document.getElementById('aiResponse').innerHTML = "Esperando datos...";
    document.getElementById('nombre').focus();
}