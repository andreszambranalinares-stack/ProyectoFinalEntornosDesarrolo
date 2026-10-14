# Validador de socios

Herramienta para revisar el formato de correos electrónicos de un archivo CSV y descargar por separado los registros válidos e inválidos. Incluye una interfaz de navegador y una versión de consola en Node.js.

## Interfaz web

1. Abre `ProyectoFinal/index.html`.
2. Arrastra un CSV o selecciónalo desde el explorador.
3. Consulta el resumen y descarga los resultados.

La primera fila debe incluir una columna `email`; el separador es la coma. El archivo se procesa en el navegador.

```csv
nombre,email
Ejemplo,persona@example.com
Otro ejemplo,correo-invalido
```

## Versión de consola

Requiere Node.js. Coloca un archivo `socios.csv` de una sola columna `email` en `ProyectoFinal/` y ejecuta:

```sh
node ProyectoFinal/validador_socios.js
```

Genera `emails_validos.csv` y `emails_invalidos.csv` en esa misma carpeta.

## Estructura

| Archivo | Función |
| --- | --- |
| `ProyectoFinal/index.html` | Interfaz de carga y resultados. |
| `ProyectoFinal/app.js` | Lectura del CSV, clasificación y descargas. |
| `ProyectoFinal/validador_socios.js` | Procesamiento por consola. |

**HTML · CSS · JavaScript · Node.js**

La validación comprueba el formato mediante una expresión regular; no verifica que el buzón exista. El lector usa separación simple por comas y no admite campos entrecomillados que contengan comas. Los dominios finales admitidos por la expresión actual tienen entre 2 y 6 letras.
