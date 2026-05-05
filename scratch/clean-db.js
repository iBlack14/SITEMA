const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query, cerrarConexion } = require('../database-config');

async function cleanUsers() {
    try {
        console.log('🧹 Limpiando usuarios no administrativos...');
        
        // 1. Eliminar usuarios
        const result = await query("DELETE FROM usuarios WHERE tipo != 'admin'");
        console.log('✅ Usuarios eliminados:', result.affectedRows);
        
        // 2. Resetear Auto-Increment de usuarios
        // Esto hará que el siguiente ID sea el correlativo al último admin existente
        await query("ALTER TABLE usuarios AUTO_INCREMENT = 1");
        console.log('✨ Auto-increment de usuarios reseteado');

        // 3. Opcional: Limpiar mesa de partes si quieres pruebas totalmente limpias
        // const resMP = await query("DELETE FROM mesa_partes");
        // await query("ALTER TABLE mesa_partes AUTO_INCREMENT = 1");
        // console.log('✨ Mesa de partes limpiada y reseteada');

    } catch (e) {
        console.error('❌ Error limpiando base de datos:', e);
    } finally {
        await cerrarConexion();
        process.exit(0);
    }
}

cleanUsers();
