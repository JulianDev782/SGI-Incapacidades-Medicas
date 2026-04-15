// Clase principal basada en las pautas del manual de Gestión Humana
class AnalizadorIncapacidad {
    constructor(nombre, diagnostico, dias) {
        this.nombre = nombre;
        this.diagnostico = diagnostico.toLowerCase();
        this.dias = parseInt(dias);
    }

    obtenerRecomendacion() {
        // Base de conocimiento extraída del PDF (Actividades 1 y 3)
        const baseConocimiento = {
            "gripe": { maxDias: 3, mensaje: "Tratamiento de origen común." },
            "fractura": { maxDias: 30, mensaje: "Requiere seguimiento detallado." },
            "accidente laboral": { maxDias: 15, mensaje: "Reportar a la ARL (Sucesos repentinos)." },
            "accidente de transito": { maxDias: 10, mensaje: "Obligatorio Furips y Epicrisis." },
            "estres": { maxDias: 5, mensaje: "Remitir a salud ocupacional." }
        };

        // Regla del manual: Epicrisis obligatoria si es > 2 días o casos de accidentes
        let necesitaEpicrisis = this.dias > 2 || 
                                this.diagnostico.includes("transito") || 
                                this.diagnostico.includes("laboral");

        let recomendacion = "";

        if (baseConocimiento[this.diagnostico]) {
            const info = baseConocimiento[this.diagnostico];
            if (this.dias > info.maxDias) {
                recomendacion = `⚠️ **Alerta:** Los días exceden el estándar (${info.maxDias}). ${info.mensaje}`;
            } else {
                recomendacion = `✅ **Validado:** Datos coherentes con el manual. ${info.mensaje}`;
            }
        } else {
            recomendacion = "🔍 **Análisis Manual:** Diagnóstico no frecuente. Verifique soportes médicos.";
        }

        if (necesitaEpicrisis) {
            recomendacion += " **Nota:** Adjuntar Epicrisis obligatoria.";
        }

        return recomendacion;
    }
}

// FUNCIÓN PARA ANALIZAR E INSERTAR
function analizarIA() {
    const nombre = document.getElementById('nombre').value;
    const diag = document.getElementById('diagnostico').value;
    const dias = document.getElementById('dias').value;
    const respuestaDiv = document.getElementById('aiResponse');
    const tabla = document.getElementById('cuerpoTabla');

    if (!nombre || !diag || !dias) {
        respuestaDiv.innerHTML = "<span style='color: red;'>❌ Complete todos los campos antes de analizar.</span>";
        return;
    }

    // Instancia de POO
    const miRegistro = new AnalizadorIncapacidad(nombre, diag, dias);
    const recomendacion = miRegistro.obtenerRecomendacion();

    // Mostrar resultado visual
    respuestaDiv.innerHTML = `<strong>Análisis para ${miRegistro.nombre}:</strong><br>${recomendacion}`;

    // AGREGAR AL HISTORIAL AUTOMÁTICAMENTE
    const nuevaFila = tabla.insertRow();
    let esAprobado = recomendacion.includes('✅');
    let colorEstado = esAprobado ? '#27ae60' : '#e67e22';
    let textoEstado = esAprobado ? 'Aceptada' : 'En Revisión';

    nuevaFila.innerHTML = `
        <td>${miRegistro.nombre}</td>
        <td>${miRegistro.diagnostico}</td>
        <td>${miRegistro.dias}</td>
        <td style="color: ${colorEstado}; font-weight: bold;">${textoEstado}</td>
    `;
}

// FUNCIÓN PARA EL BOTÓN "NUEVA INCAPACIDAD" (LIMPIAR)
function nuevaIncapacidad() {
    // 1. Limpiar los inputs
    document.getElementById('nombre').value = "";
    document.getElementById('diagnostico').value = "";
    document.getElementById('dias').value = "";
    
    // 2. Reiniciar el mensaje de la IA
    document.getElementById('aiResponse').innerHTML = "Esperando datos para análisis...";
    
    // 3. Poner el foco en el primer campo para rapidez
    document.getElementById('nombre').focus();
    
    console.log("Formulario reiniciado para nuevo registro.");
}