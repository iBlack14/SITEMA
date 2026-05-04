const express = require('express');
const router = express.Router();
const { query } = require('../database-config');

/**
 * GET /api/configuracion
 * Obtener toda la configuración del sistema
 */
router.get('/', async (req, res) => {
    try {
        const { categoria } = req.query;
        
        let sql = 'SELECT * FROM configuracion_sistema';
        let params = [];
        
        if (categoria) {
            sql += ' WHERE categoria = ?';
            params.push(categoria);
        }
        
        sql += ' ORDER BY categoria, clave';
        
        const configuraciones = await query(sql, params);
        
        // Convertir array a objeto para facilitar el uso
        const config = {};
        configuraciones.forEach(item => {
            let valor = item.valor;
            
            // Convertir según el tipo
            if (item.tipo === 'numero') {
                valor = parseFloat(valor);
            } else if (item.tipo === 'boolean') {
                valor = valor === 'true' || valor === '1';
            } else if (item.tipo === 'json') {
                try {
                    valor = JSON.parse(valor);
                } catch (e) {
                    valor = null;
                }
            }
            
            config[item.clave] = {
                valor: valor,
                tipo: item.tipo,
                descripcion: item.descripcion,
                categoria: item.categoria
            };
        });
        
        res.json({
            success: true,
            data: config
        });
        
    } catch (error) {
        console.error('Error obteniendo configuración:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            details: error.message
        });
    }
});

/**
 * PUT /api/configuracion/:clave
 * Actualizar una configuración específica
 */
router.put('/:clave', async (req, res) => {
    try {
        const { clave } = req.params;
        const { valor } = req.body;
        
        if (valor === undefined) {
            return res.status(400).json({
                success: false,
                error: 'El campo valor es requerido'
            });
        }
        
        // Verificar si la configuración existe
        const existing = await query(
            'SELECT * FROM configuracion_sistema WHERE clave = ?',
            [clave]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Configuración no encontrada'
            });
        }
        
        // Convertir el valor según el tipo
        let valorFinal = valor;
        if (existing[0].tipo === 'boolean') {
            valorFinal = valor ? 'true' : 'false';
        } else if (existing[0].tipo === 'json') {
            valorFinal = JSON.stringify(valor);
        } else {
            valorFinal = String(valor);
        }
        
        // Actualizar
        await query(
            'UPDATE configuracion_sistema SET valor = ? WHERE clave = ?',
            [valorFinal, clave]
        );
        
        res.json({
            success: true,
            message: 'Configuración actualizada correctamente'
        });
        
    } catch (error) {
        console.error('Error actualizando configuración:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            details: error.message
        });
    }
});

/**
 * POST /api/configuracion/batch
 * Actualizar múltiples configuraciones a la vez
 */
router.post('/batch', async (req, res) => {
    try {
        const { configuraciones } = req.body;
        
        if (!configuraciones || typeof configuraciones !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'El campo configuraciones es requerido y debe ser un objeto'
            });
        }
        
        // Actualizar cada configuración
        const updates = [];
        for (const [clave, valor] of Object.entries(configuraciones)) {
            // Verificar si existe
            const existing = await query(
                'SELECT tipo FROM configuracion_sistema WHERE clave = ?',
                [clave]
            );
            
            if (existing.length > 0) {
                let valorFinal = valor;
                if (existing[0].tipo === 'boolean') {
                    valorFinal = valor ? 'true' : 'false';
                } else if (existing[0].tipo === 'json') {
                    valorFinal = JSON.stringify(valor);
                } else {
                    valorFinal = String(valor);
                }
                
                updates.push(
                    query(
                        'UPDATE configuracion_sistema SET valor = ? WHERE clave = ?',
                        [valorFinal, clave]
                    )
                );
            }
        }
        
        await Promise.all(updates);
        
        res.json({
            success: true,
            message: `${updates.length} configuraciones actualizadas correctamente`
        });
        
    } catch (error) {
        console.error('Error actualizando configuraciones:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            details: error.message
        });
    }
});

module.exports = router;
