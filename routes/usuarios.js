const express = require('express');
const router = express.Router();
const UsuarioModel = require('../models/usuario-model');

// ========== ENDPOINTS DE USUARIOS ==========

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const filtros = {
            tipo: req.query.tipo,
            activo: req.query.activo !== undefined ? req.query.activo === 'true' : undefined,
            busqueda: req.query.busqueda,
            limite: req.query.limite ? parseInt(req.query.limite) : null
        };

        const usuarios = await UsuarioModel.obtenerTodos(filtros);
        res.json({ success: true, data: usuarios });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener usuario por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await UsuarioModel.obtenerPorId(parseInt(id));

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ success: true, data: usuario });
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Verificar si usuario existe por email
router.get('/existe/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Buscar en MySQL
        const usuarios = await UsuarioModel.obtenerTodos({ busqueda: email });
        const existeEnMySQL = usuarios.some(u => u.email === email);

        res.json({
            success: true,
            data: {
                existe: existeEnMySQL,
                enMySQL: existeEnMySQL,
                enLocalStorage: false,
                detalles: {
                    mysql: existeEnMySQL ? usuarios.find(u => u.email === email) : null,
                    localStorage: null
                }
            }
        });
    } catch (error) {
        console.error('Error verificando existencia de usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Crear nuevo usuario
router.post('/', async (req, res) => {
    try {
        const datosUsuario = req.body;

        console.log('📥 Recibiendo solicitud de creación de usuario:', {
            username: datosUsuario.username,
            email: datosUsuario.email,
            nombre: datosUsuario.nombre
        });

        // Validación básica
        if (!datosUsuario.username || !datosUsuario.email || !datosUsuario.password || !datosUsuario.nombre) {
            return res.status(400).json({
                error: 'Los campos username, email, password y nombre son requeridos'
            });
        }

        // Verificar si username ya existe
        const usernameExiste = await UsuarioModel.usernameExiste(datosUsuario.username);
        if (usernameExiste) {
            console.warn('⚠️ Username ya existe:', datosUsuario.username);
            return res.status(409).json({
                error: 'El nombre de usuario ya existe'
            });
        }

        // Verificar si email ya existe
        const emailExiste = await UsuarioModel.emailExiste(datosUsuario.email);
        if (emailExiste) {
            console.warn('⚠️ Email ya existe:', datosUsuario.email);
            return res.status(409).json({
                error: 'El email ya está registrado'
            });
        }

        // Crear usuario
        const resultado = await UsuarioModel.crearUsuario(datosUsuario);

        console.log('✅ Usuario creado con ID:', resultado.insertId);

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: { id: resultado.insertId }
        });
    } catch (error) {
        console.error('❌ Error creando usuario:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const datosUsuario = req.body;

        // Verificar que el usuario existe
        const usuarioActual = await UsuarioModel.obtenerPorId(id);
        if (!usuarioActual) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Actualizar usuario
        const resultado = await UsuarioModel.actualizarUsuario(id, datosUsuario);

        // Obtener usuario actualizado
        const usuarioActualizado = await UsuarioModel.obtenerPorId(id);

        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: usuarioActualizado
        });
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Verificar contraseña actual
router.post('/:id/verify-password', async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        // Validación básica
        if (!password) {
            return res.status(400).json({
                error: 'La contraseña es requerida'
            });
        }

        // Verificar que el usuario existe (con contraseña para verificación)
        const usuarioActual = await UsuarioModel.obtenerPorIdConPassword(id);
        if (!usuarioActual) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar contraseña
        const passwordValida = await UsuarioModel.verificarPassword(usuarioActual, password);

        res.json({
            success: true,
            data: {
                valida: passwordValida
            }
        });
    } catch (error) {
        console.error('Error verificando contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Cambiar contraseña de usuario
router.put('/:id/password', async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        // Validación básica
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'La contraseña actual y la nueva contraseña son requeridas'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        // Verificar que el usuario existe (con contraseña para verificación)
        const usuarioActual = await UsuarioModel.obtenerPorIdConPassword(id);
        if (!usuarioActual) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar contraseña actual
        const passwordValida = await UsuarioModel.verificarPassword(usuarioActual, currentPassword);
        if (!passwordValida) {
            return res.status(401).json({
                error: 'La contraseña actual es incorrecta'
            });
        }

        // Cambiar contraseña
        await UsuarioModel.cambiarPassword(id, newPassword);

        console.log('✅ Contraseña cambiada para usuario ID:', id);

        res.json({
            success: true,
            message: 'Contraseña cambiada exitosamente'
        });
    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Eliminar cuenta de usuario (requiere contraseña)
router.delete('/:id/delete', async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        // Validación básica
        if (!password) {
            return res.status(400).json({
                error: 'La contraseña es requerida para eliminar la cuenta'
            });
        }

        // Verificar que el usuario existe (con contraseña para verificación)
        const usuarioActual = await UsuarioModel.obtenerPorIdConPassword(id);
        if (!usuarioActual) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar contraseña
        const passwordValida = await UsuarioModel.verificarPassword(usuarioActual, password);
        if (!passwordValida) {
            return res.status(401).json({
                error: 'La contraseña es incorrecta'
            });
        }

        // Eliminar usuario (desactivar)
        await UsuarioModel.eliminarUsuario(id);

        console.log('✅ Cuenta de usuario eliminada:', id);

        res.json({
            success: true,
            message: 'Cuenta eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando cuenta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Eliminar usuario (desactivar) - admin
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el usuario existe
        const usuarioActual = await UsuarioModel.obtenerPorId(id);
        if (!usuarioActual) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await UsuarioModel.eliminarUsuario(id);
        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;