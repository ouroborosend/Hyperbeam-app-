const fs = require('fs');
const https = require('https');

const token = fs.readFileSync('token.txt', 'utf8').trim();

// 1. Obtener la organización del usuario primero
const orgData = JSON.stringify({
    query: `{ organizations { nodes { id slug } } }`
});

const orgReq = https.request({
    hostname: 'api.fly.io',
    path: '/graphql',
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(orgData)
    }
}, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(body);
            if (json.errors) {
                console.error('Error de autenticación:', JSON.stringify(json.errors, null, 2));
                return;
            }
            const orgs = json.data.organizations.nodes;
            const orgId = orgs[0].id;
            console.log('Organización detectada, ID:', orgId);

            // 2. Crear la App HyperDemi
            const appName = 'HyperDemi';
            const appData = JSON.stringify({
                query: `mutation { createApp(input: { name: "${appName}", organizationId: "${orgId}" }) { app { name } } }`
            });

            const appReq = https.request({
                hostname: 'api.fly.io',
                path: '/graphql',
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(appData)
                }
            }, (appRes) => {
                let appBody = '';
                appRes.on('data', chunk => appBody += chunk);
                appRes.on('end', () => {
                    console.log('Creación de App:', appBody);

                    // 3. Guardar el secreto de Hyperbeam
                    const apiKey = 'sk_test_xRnbKrm04ZprxbK0yHfLQYIgSC7VIoeo0JhKPu0TXLs';
                    const secretData = JSON.stringify({
                        query: `mutation($input: SetSecretsInput!) { setSecrets(input: $input) { release { id } } }`,
                        variables: {
                            input: {
                                appId: appName,
                                secrets: [{ key: 'HYPERBEAM_API_KEY', value: apiKey }]
                            }
                        }
                    });

                    const secretReq = https.request({
                        hostname: 'api.fly.io',
                        path: '/graphql',
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(secretData)
                        }
                    }, (sRes) => {
                        let sBody = '';
                        sRes.on('data', chunk => sBody += chunk);
                        sRes.on('end', () => console.log('Configuración de Secreto:', sBody));
                    });
                    secretReq.write(secretData);
                    secretReq.end();
                });
            });
            appReq.write(appData);
            appReq.end();

        } catch (e) {
            console.error('Error procesando respuesta:', body);
        }
    });
});

orgReq.write(orgData);
orgReq.end();
