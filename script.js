// 1. Definición de la Clase (POO)
class AnalizadorIncapacidad {
    constructor(nombre, diagnostico, dias) {
        this.nombre = nombre;
        this.diagnostico = diagnostico.toLowerCase(); // Convertimos a minúscula para que no falle por mayúsculas
        this.dias = parseInt(dias);
    }

    // El método que contiene la lógica de la "IA"
    obtenerRecomendacion() {
        // Validación de seguridad para números negativos o letras en vez de números
        if (this.dias <= 0 || isNaN(this.dias)) {
            return "❌ <strong>Error:</strong> La cantidad de días debe ser un número positivo.";
        }

        // Base de conocimientos de nuestra IA
        const baseConocimiento = {
            "gripe": 3,
            "gripa": 3,
            "influenza": 5,
            "fractura": 30,
            "accidente laboral": 15,
            "cirugia": 20,
            "estres": 7,
            "migraña": 2
        };

        let sugerencia = 0;
        let encontrado = false;

        // Buscamos la palabra clave en el diagnóstico
        for (let enfermedad in baseConocimiento) {
            if (this.diagnostico.includes(enfermedad)) {
                sugerencia = baseConocimiento[enfermedad];
                encontrado = true;
                break;
            }
        }

        // Si no encontramos la enfermedad
        if (!encontrado) {
            return `🤖 <strong>Análisis IA:</strong> No reconozco el término "${this.diagnostico}". Por seguridad, requiere revisión de un médico auditor.`;
        }

        // Si los días solicitados son mayores a lo que sugiere la IA
        if (this.dias > sugerencia) {
            return `⚠️ <strong>Alerta IA:</strong> Los ${this.dias} días solicitados exceden el estándar para "${this.diagnostico}" (${sugerencia} días sugeridos).`;
        } else {
            return `✅ <strong>Validación IA:</strong> Los ${this.dias} días solicitados para "${this.diagnostico}" son coherentes y están aprobados.`;
        }
    }
}

// 2. Función que conecta el botón del HTML con la Clase
function analizarIA() {
    const nombre = document.getElementById('nombre').value;
    const diag = document.getElementById('diagnostico').value;
    const dias = document.getElementById('dias').value;
    const respuestaDiv = document.getElementById('aiResponse');

    // Validación de campos vacíos
    if (!nombre || !diag || !dias) {
        respuestaDiv.innerHTML = "❌ Por favor, llena todos los campos.";
        return;
    }

    // INSTANCIAMOS la clase (Aquí es donde aplicas POO)
    const miRegistro = new AnalizadorIncapacidad(nombre, diag, dias);

    // Mostramos el resultado llamando al método de la clase
    respuestaDiv.innerHTML = `<p>Analizando para: <strong>${miRegistro.nombre}</strong>...</p>
                              <p>${miRegistro.obtenerRecomendacion()}</p>`;
}