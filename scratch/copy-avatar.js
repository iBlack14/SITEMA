const fs = require('fs');
const path = require('path');

const source = 'C:\\Users\\via\\.gemini\\antigravity\\brain\\384427a0-4f6c-40c4-bc56-d4fe825e90b2\\default_avatar_institutional_1777937679027.png';
const target = 'c:\\Users\\via\\Downloads\\tmarcsistema\\assets\\img\\default-avatar.png';

try {
    fs.copyFileSync(source, target);
    console.log('✅ File copied successfully');
} catch (err) {
    console.error('❌ Error copying file:', err);
}
