const fs = require('fs');
const https = require('https');

const configPath = require('os').homedir() + '/.fly/config.yml';
if (!fs.existsSync(configPath)) {
    console.error('No se encontró el archivo de configuración de Fly.');
    process.exit(1);
}

const configContent = fs.readFileSync(configPath, 'utf8');
const tokenMatch = configContent.match(/access_token:\s*["']?([^"'\s]+)/);

if (!tokenMatch) {
    console.error('No se pudo extraer el token de acceso.');
    process.exit(1);
}

const token = tokenMatch[1];
const appName = 'hyperbeam-app-' + Math.floor(Math.random() * 100000);

console.log('Creando la app "' + appName + '" en Fly.io...');

const data = JSON.stringify({ query: `mutation { createApp(input: { name: "${appName}", orgSlug: "personal" }) { app { name } } }` });

const req = https.request({
    hostname: 'api.fly.io',
    path: '/graphql',
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Respuesta:', body);
        console.log('¡Aplicación registrada con éxito! Ya puedes configurar tu secreto con tu API Key.');
    });
});

req.on('error', (e) => {
    console.error('Error de red:', e.message);
});

req.write(data);
req.end();
