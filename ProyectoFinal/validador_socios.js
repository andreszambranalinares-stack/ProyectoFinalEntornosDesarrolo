// Importamos los módulos nativos de Node.js necesarios
const fs = require('fs');
const path = require('path');

// Definimos las rutas de los archivos (relativas a la ubicación del script)
const archivoEntrada = path.join(__dirname, 'socios.csv');
const archivoValidos = path.join(__dirname, 'emails_validos.csv');
const archivoInvalidos = path.join(__dirname, 'emails_invalidos.csv');

/**
 * Expresión regular robusta para validar correos
 * - ^[^\s@]+ : Usuario (al menos un carácter, sin espacios ni @)
 * - @ : Símbolo arroba obligatorio
 * - [a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)* : Dominio (puede contener letras, números, guiones y puntos intermedios para subdominios. Debe tener caracteres válidos antes del punto de la extensión).
 * - \. : Al menos un punto separando el dominio y la extensión
 * - [a-zA-Z]{2,6}$ : Extensión de 2 a 6 letras (sin espacios) al final de la cadena
 */
const regexEmail = /^[^\s@]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,6}$/;

function procesarCorreos() {
    try {
        console.log('Iniciando el proceso de validación de correos...\n');

        // 1. Verificamos si el archivo de entrada existe (Manejo de errores explícito)
        if (!fs.existsSync(archivoEntrada)) {
            throw new Error(`El archivo de entrada no se encontró en la ruta: ${archivoEntrada}`);
        }

        // 2. Leemos el archivo CSV de forma síncrona
        const contenidoCSV = fs.readFileSync(archivoEntrada, 'utf-8');
        
        // Comprobamos que el archivo no esté vacío
        if (!contenidoCSV.trim()) {
             throw new Error('El archivo CSV está completamente vacío.');
        }

        // 3. Separamos el contenido por líneas y eliminamos líneas vacías
        const lineas = contenidoCSV.split(/\r?\n/).filter(linea => linea.trim() !== '');

        // 4. Procesamos las cabeceras para encontrar dinámicamente la columna 'email'
        const cabeceras = lineas[0].split(',').map(h => h.trim().toLowerCase());
        const indiceEmail = cabeceras.indexOf('email');

        // Validamos que exista la columna de correos electrónicos
        if (indiceEmail === -1) {
            throw new Error('Formato incorrecto: El archivo CSV debe contener una columna llamada "email".');
        }

        // Arrays para separar los resultados
        const validos = [];
        const invalidos = [];

        // Agregamos las cabeceras a los archivos de salida
        validos.push(lineas[0]);
        invalidos.push(lineas[0]);

        // 5. Procesamos cada registro iterando desde la línea 1 (saltando cabeceras)
        for (let i = 1; i < lineas.length; i++) {
            const columnas = lineas[i].split(',');
            
            // Aseguramos que la fila tenga suficientes columnas para leer el email
            if (columnas.length > indiceEmail) {
                const email = columnas[indiceEmail].trim(); // Extraemos y limpiamos

                // 6. Validamos el correo contra nuestra expresión regular
                if (regexEmail.test(email)) {
                    validos.push(lineas[i]);
                } else {
                    invalidos.push(lineas[i]);
                }
            } else {
                // Fila mal formateada o incompleta se cuenta como inválida
                invalidos.push(lineas[i]);
            }
        }

        // 7. Escribimos los resultados en sus respectivos archivos usando fs
        fs.writeFileSync(archivoValidos, validos.join('\n'), 'utf-8');
        fs.writeFileSync(archivoInvalidos, invalidos.join('\n'), 'utf-8');

        // 8. Calculamos y mostramos el resumen por consola
        const totalProcesados = lineas.length - 1; // Restamos la cabecera
        const totalValidos = validos.length - 1;
        const totalInvalidos = invalidos.length - 1;

        console.log('--- Resumen de Validación de Correos ---');
        console.log(`📑 Total de registros leídos: ${totalProcesados}`);
        console.log(`✅ Correos Válidos:    ${totalValidos} (Exportados a emails_validos.csv)`);
        console.log(`❌ Correos Inválidos:  ${totalInvalidos} (Exportados a emails_invalidos.csv)`);
        console.log('----------------------------------------');

    } catch (error) {
        // Manejo de errores: Capturamos la excepción y mostramos un mensaje amigable
        console.error('⚠️ [ERROR] Ha ocurrido un problema durante la ejecución:');
        console.error(`=> ${error.message}`);
    }
}

// Invocamos la función principal
procesarCorreos();
