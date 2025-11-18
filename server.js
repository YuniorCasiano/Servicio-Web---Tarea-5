// ============================================
// SERVICIO WEB - AGENDA DE CONTACTOS
// Tarea 5: Servicio Web con Express + Node.js
// ============================================

// Importar módulos necesarios
const express = require('express');
const fetch = require('node-fetch');

// Crear aplicación Express
const app = express();
const PORT = 3000;

// URL de la API original de Raydelto
const API_URL = 'http://www.raydelto.org/agenda.php';

// ============================================
// MIDDLEWARES
// ============================================

// Middleware para parsear JSON en el body de las peticiones
app.use(express.json());

// Middleware para habilitar CORS (permitir peticiones desde cualquier origen)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// Middleware para logging de peticiones
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// ============================================
// RUTAS DEL API
// ============================================

// Ruta raíz - Información del servicio
app.get('/', (req, res) => {
    res.json({
        servicio: 'Agenda de Contactos API',
        version: '1.0.0',
        autor: 'Tarea 5 - Servicio Web',
        descripcion: 'Servicio web que lista y almacena contactos',
        endpoints: {
            info: {
                metodo: 'GET',
                ruta: '/',
                descripcion: 'Información del servicio'
            },
            listar: {
                metodo: 'GET',
                ruta: '/contactos',
                descripcion: 'Obtener todos los contactos'
            },
            agregar: {
                metodo: 'POST',
                ruta: '/contactos',
                descripcion: 'Agregar un nuevo contacto',
                body_ejemplo: {
                    nombre: 'Juan',
                    apellido: 'Pérez',
                    telefono: '809-555-1234'
                }
            }
        }
    });
});

// ============================================
// RUTA GET - LISTAR CONTACTOS
// ============================================
app.get('/contactos', async (req, res) => {
    try {
        console.log('📋 Solicitando lista de contactos desde la API...');
        
        // Hacer petición GET a la API original
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Verificar si la respuesta fue exitosa
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        // Obtener los datos en formato JSON
        const contactos = await response.json();
        
        console.log(`✅ Se obtuvieron ${contactos.length} contactos exitosamente`);
        
        // Enviar respuesta estructurada al cliente
        res.status(200).json({
            success: true,
            mensaje: 'Contactos obtenidos exitosamente',
            cantidad: contactos.length,
            contactos: contactos
        });

    } catch (error) {
        console.error('❌ Error al obtener contactos:', error.message);
        
        res.status(500).json({
            success: false,
            error: 'Error al obtener los contactos',
            mensaje: error.message
        });
    }
});

// ============================================
// RUTA POST - AGREGAR CONTACTO
// ============================================
app.post('/contactos', async (req, res) => {
    try {
        // Obtener datos del cuerpo de la petición
        const { nombre, apellido, telefono } = req.body;

        // Validar que se enviaron todos los campos requeridos
        if (!nombre || !apellido || !telefono) {
            console.log('⚠️  Petición incompleta - Faltan campos');
            return res.status(400).json({
                success: false,
                error: 'Datos incompletos',
                mensaje: 'Se requieren los campos: nombre, apellido y telefono',
                recibido: { nombre, apellido, telefono }
            });
        }

        // Validar que los campos no estén vacíos
        if (nombre.trim() === '' || apellido.trim() === '' || telefono.trim() === '') {
            console.log('⚠️  Campos vacíos detectados');
            return res.status(400).json({
                success: false,
                error: 'Campos vacíos',
                mensaje: 'Los campos no pueden estar vacíos'
            });
        }

        console.log('📝 Intentando agregar contacto:', { 
            nombre: nombre.trim(), 
            apellido: apellido.trim(), 
            telefono: telefono.trim() 
        });

        // Hacer petición POST a la API original
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                telefono: telefono.trim()
            })
        });

        // Verificar si la respuesta fue exitosa
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        console.log('✅ Contacto agregado exitosamente');

        // Enviar respuesta exitosa al cliente
        res.status(201).json({
            success: true,
            mensaje: 'Contacto agregado exitosamente',
            contacto: {
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                telefono: telefono.trim()
            }
        });

    } catch (error) {
        console.error('❌ Error al agregar contacto:', error.message);
        
        res.status(500).json({
            success: false,
            error: 'Error al agregar el contacto',
            mensaje: error.message
        });
    }
});

// ============================================
// MANEJO DE RUTAS NO ENCONTRADAS
// ============================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        mensaje: `La ruta ${req.method} ${req.url} no existe`,
        rutas_disponibles: [
            'GET /',
            'GET /contactos',
            'POST /contactos'
        ]
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
    console.clear();
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   🚀 SERVIDOR EXPRESS INICIADO            ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║   📡 URL: http://localhost:${PORT}           ║`);
    console.log('║   📅 Fecha: ' + new Date().toLocaleString().padEnd(26) + '║');
    console.log('╠════════════════════════════════════════════╣');
    console.log('║   📋 ENDPOINTS DISPONIBLES:               ║');
    console.log('║                                            ║');
    console.log('║   GET  / ......................... Info    ║');
    console.log('║   GET  /contactos ........... Listar      ║');
    console.log('║   POST /contactos ........... Agregar     ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log('║   💡 Presiona Ctrl+C para detener         ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('');
});