// app.js - Adaptación para el Frontend

// Misma expresión regular robusta para validar correos
const regexEmail = /^[^\s@]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,6}$/;

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const results = document.getElementById('results');
    
    // Elementos UI de estadísticas y botones
    const totalCount = document.getElementById('total-count');
    const validCount = document.getElementById('valid-count');
    const invalidCount = document.getElementById('invalid-count');
    const btnDownloadValid = document.getElementById('download-valid');
    const btnDownloadInvalid = document.getElementById('download-invalid');
    const resetBtn = document.getElementById('reset-btn');

    // === Eventos de Drag & Drop (Arrastrar y soltar archivo) ===
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        // Extraemos y usamos el primer archivo arrastrado
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Evento del botón de explorar archivos estándar
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    // Restablecer panel
    resetBtn.addEventListener('click', () => {
        results.classList.add('hidden');
        dropZone.classList.remove('hidden');
        fileInput.value = '';
    });

    // Lectura del archivo usando el API nativa del navegador FileReader
    function handleFile(file) {
        if (!file.name.toLowerCase().endsWith('.csv')) {
            alert('❌ Por favor, selecciona un documento con formato CSV válido.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            procesarCSV(content);
        };
        reader.onerror = () => alert('Error al intentar leer el archivo.');
        // Leemos el archivo localmente! (Sin necesidad de servidor/Node)
        reader.readAsText(file);
    }

    // Adaptación de la lógica nativa para procesar los textos
    function procesarCSV(contenidoCSV) {
        if (!contenidoCSV.trim()) {
            alert('El archivo CSV suministrado está vacío.');
            return;
        }

        // 1. Separar lineas
        const lineas = contenidoCSV.split(/\r?\n/).filter(linea => linea.trim() !== '');
        if (lineas.length === 0) return;

        // 2. Localizar índice basado en cabeceras
        const cabeceras = lineas[0].split(',').map(h => h.trim().toLowerCase());
        const indiceEmail = cabeceras.indexOf('email');

        if (indiceEmail === -1) {
            alert('⚠️ Formato incorrecto: El archivo CSV debe contar con una columna llamada "email".');
            return;
        }

        const validos = [lineas[0]];
        const invalidos = [lineas[0]];

        // 3. Evaluar e iterar
        for (let i = 1; i < lineas.length; i++) {
            const columnas = lineas[i].split(',');
            
            if (columnas.length > indiceEmail) {
                const email = columnas[indiceEmail].trim();

                // Test de nuestra RegEx
                if (regexEmail.test(email)) {
                    validos.push(lineas[i]);
                } else {
                    invalidos.push(lineas[i]);
                }
            } else {
                invalidos.push(lineas[i]); // Fila corrupta = Invalida
            }
        }

        mostrarResultados(validos, invalidos, lineas.length - 1);
    }

    // Funciones visuales finales (Actualización de Interfaz y Blobs de Descargas)
    function mostrarResultados(validos, invalidos, total) {
        const countValidos = validos.length - 1;
        const countInvalidos = invalidos.length - 1;

        // Animamos los contadores numéricos
        animarNumeros(totalCount, total);
        animarNumeros(validCount, countValidos);
        animarNumeros(invalidCount, countInvalidos);

        // Ocultar drop zone y mostrar los resultados finalizados
        dropZone.classList.add('hidden');
        results.classList.remove('hidden');

        // Configuración de creación nativa de los CSV en el navegador (Manejo de Blob + URL)
        if (countValidos > 0) {
            configurarDescarga(btnDownloadValid, validos, 'emails_validos.csv');
            btnDownloadValid.classList.remove('disabled');
        } else {
            btnDownloadValid.classList.add('disabled');
        }

        if (countInvalidos > 0) {
            configurarDescarga(btnDownloadInvalid, invalidos, 'emails_invalidos.csv');
            btnDownloadInvalid.classList.remove('disabled');
        } else {
            btnDownloadInvalid.classList.add('disabled');
        }
    }

    // === Sistema para generar el archivo mediante BLOB API para el navegador (Remplaza a "fs" de Node.js) ===
    function configurarDescarga(botonElemento, arrayDatos, nombreDescarga) {
        const contenidoPlano = arrayDatos.join('\n');
        // El Blob virtualiza nuestro sistema de archivos en memoria con tipo MIME CSV
        const blob = new Blob([contenidoPlano], { type: 'text/csv;charset=utf-8;' }); 
        const urlObjetoHaciaMemoriaLocal = URL.createObjectURL(blob);
        
        botonElemento.href = urlObjetoHaciaMemoriaLocal;
        botonElemento.download = nombreDescarga;
    }
    
    // Micro-animación visual para contabilizar en la UI
    function animarNumeros(elementoDelDOM, valorFinalEsperado) {
        elementoDelDOM.textContent = '0';
        let conteo = 0;
        const duracionFrames = 60; // aprox 1 segundo visual final
        const incrementoPorFrame = valorFinalEsperado / duracionFrames;
        
        function actualizar() {
            conteo += incrementoPorFrame;
            if (conteo < valorFinalEsperado) {
                elementoDelDOM.textContent = Math.ceil(conteo);
                requestAnimationFrame(actualizar);
            } else {
                // Al finalizar asegura la precisión exacta
                elementoDelDOM.textContent = valorFinalEsperado;
            }
        }
        
        if (valorFinalEsperado > 0) {
            requestAnimationFrame(actualizar);
        }
    }
});
