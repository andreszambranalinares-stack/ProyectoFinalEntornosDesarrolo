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

/**
 * Función separada para validar el formato de un correo electrónico.
 * @param {string} email - Correo a validar.
 * @returns {boolean} - true si es válido, false si no lo es.
 */
function esEmailValido(email) {
    return regexEmail.test(email);
}

/**
 * Procesa el archivo CSV de socios para validar sus correos.
 * @param {string} ruta - La ruta al archivo CSV a procesar.
 */
function procesarCSV(ruta) {
    try {
        console.log('Iniciando el proceso de validación de correos...\n');

        // 1. Verificamos si el archivo de entrada existe (Manejo de errores explícito)
        if (!fs.existsSync(ruta)) {
            throw new Error(`El archivo de entrada no se encontró en la ruta: ${ruta}`);
        }

        // 2. Leemos el archivo CSV de forma síncrona
        const contenidoCSV = fs.readFileSync(ruta, 'utf-8');
        
        // Comprobamos que el archivo no esté vacío
        if (!contenidoCSV.trim()) {
             throw new Error('El archivo CSV está completamente vacío.');
        }

        // 3. Separamos el contenido por líneas de forma más eficiente (sin filter previo)
        const lineas = contenidoCSV.split(/\r?\n/);

        // Arrays renombrados a validEmails e invalidEmails
        const validEmails = [];
        const invalidEmails = [];
        
        let totalProcesados = 0;
        let primerEmailValido = null;
        let ultimoEmailValido = null;

        // 5. Procesamos cada registro saltando el header con slice(1)
        const registros = lineas.slice(1);
        for (let i = 0; i < registros.length; i++) {
            const linea = registros[i];
            
            // Si la línea está vacía, la ignoramos sin crear arrays intermedios
            if (!linea.trim()) continue;

            // Destructuring asumiendo que el email está en la primera columna
            const [email] = linea.split(',');
            totalProcesados++; // Solo contamos las líneas con contenido real
            
            // Aseguramos que tenemos email definido
            if (email !== undefined) {
                // Extraemos, limpiamos y normalizamos a minúsculas
                const emailNormalizado = email.trim().toLowerCase(); 

                // 6. Validamos el correo usando la función extraída
                if (esEmailValido(emailNormalizado)) {
                    validEmails.push(linea);
                    
                    // Guardamos el primer y último email válido
                    if (!primerEmailValido) {
                        primerEmailValido = emailNormalizado;
                    }
                    ultimoEmailValido = emailNormalizado;
                } else {
                    invalidEmails.push(linea);
                }
            } else {
                // Fila mal formateada o incompleta se cuenta como inválida
                invalidEmails.push(linea);
            }
        }

        // 7. Construimos el string completo y escribimos usando un solo fs.writeFileSync
        const contenidoValidos = validEmails.join('\n');
        const contenidoInvalidos = invalidEmails.join('\n');
        
        fs.writeFileSync(archivoValidos, contenidoValidos, 'utf-8');
        fs.writeFileSync(archivoInvalidos, contenidoInvalidos, 'utf-8');

        // 8. Calculamos y mostramos el resumen por consola (sin restarle 1 porque ya no metemos header manual)
        const totalValidos = validEmails.length;
        const totalInvalidos = invalidEmails.length;
        
        // Calculamos el porcentaje sobre el total procesado
        const porcentajeValidos = totalProcesados > 0 
            ? ((totalValidos / totalProcesados) * 100).toFixed(2) 
            : 0;

        console.log('--- Resumen de Validación de Correos ---');
        console.log(`📑 Total de registros leídos: ${totalProcesados}`);
        console.log(`✅ Correos Válidos:    ${totalValidos} (${porcentajeValidos}%) (Exportados a emails_validos.csv)`);
        
        // Mostrar también el primer y último email válido si se encontraron
        if (primerEmailValido) {
            console.log(`   - Primer válido: ${primerEmailValido}`);
            console.log(`   - Último válido: ${ultimoEmailValido}`);
        }
        
        console.log(`❌ Correos Inválidos:  ${totalInvalidos} (Exportados a emails_invalidos.csv)`);
        console.log('----------------------------------------');

    } catch (error) {
        // Manejo de errores: Capturamos la excepción y mostramos un mensaje amigable
        console.error('⚠️ [ERROR] Ha ocurrido un problema durante la ejecución:');
        console.error(`=> ${error.message}`);
    }
}

// Invocamos la función principal
procesarCSV(archivoEntrada);
