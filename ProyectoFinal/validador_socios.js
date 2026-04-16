const fs = require('fs');
const path = require('path');

const archivoEntrada = path.join(__dirname, 'socios.csv');
const archivoValidos = path.join(__dirname, 'emails_validos.csv');
const archivoInvalidos = path.join(__dirname, 'emails_invalidos.csv');

// Expresión regular para validar emails
const regexEmail = /^[^\s@]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,6}$/;

function procesarCorreos() {
    try {
        console.log('Iniciando el proceso de validación de correos...\n');

        // Comprobar la existencia del archivo de forma explícita
        if (!fs.existsSync(archivoEntrada)) {
            throw new Error(`El archivo de entrada no se encontró: ${archivoEntrada}`);
        }

        // Leer el archivo de forma síncrona
        const contenidoCSV = fs.readFileSync(archivoEntrada, 'utf-8');

        // Separar por líneas usando una expresión regular
        const lineas = contenidoCSV.split(/\r?\n/);
        
        // Saltamos la primera línea (header)
        const registros = lineas.slice(1);

        const emailsValidos = ['email'];
        const emailsInvalidos = ['email'];
        let procesados = 0;

        for (let i = 0; i < registros.length; i++) {
            let linea = registros[i];
            
            // Ignoramos las líneas que están vacías sin crear arrays intermedios
            if (!linea.trim()) continue;
            
            procesados++;

            // El CSV cuenta con 1 única columna. Limpiamos espacios.
            const email = linea.trim();

            if (regexEmail.test(email)) {
                emailsValidos.push(email);
            } else {
                emailsInvalidos.push(email);
            }
        }

        // Escribimos usando un solo string completo por cada archivo
        fs.writeFileSync(archivoValidos, emailsValidos.join('\n'), 'utf-8');
        fs.writeFileSync(archivoInvalidos, emailsInvalidos.join('\n'), 'utf-8');

        // Restamos las cabeceras obligatorias añadidas al inicio de los arrays
        const totalValidos = emailsValidos.length - 1; 
        const totalInvalidos = emailsInvalidos.length - 1;

        console.log('--- Resumen de Validación ---');
        console.log(`Total procesados: ${procesados}`);
        console.log(`Válidos: ${totalValidos}`);
        console.log(`Inválidos: ${totalInvalidos}`);
        console.log('-----------------------------');

    } catch (error) {
        console.error('Ha ocurrido un error:', error.message);
    }
}

procesarCorreos();
