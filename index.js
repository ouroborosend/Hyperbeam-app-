const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.get('/', async (req, res) => {
    console.log("¡Alguien visitó la página principal!");
    try {
        const response = await fetch('https://engine.hyperbeam.com/v0/vm', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HYPERBEAM_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        const data = await response.json();
        console.log("Respuesta de Hyperbeam:", JSON.stringify(data));

        if (!data.embed_url) {
            return res.status(500).send("Error de Hyperbeam API: " + JSON.stringify(data));
        }

        const embedUrl = data.embed_url;

        res.send(`<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HyperDemi</title>
    <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
        #hb-container { width: 100%; height: 100%; }
    </style>
</head>
<body>
    <div id="hb-container"></div>
    <script type="module">
        import Hyperbeam from "https://embed.hyperbeam.com/v0/sdk.js";
        async function start() {
            let container = document.getElementById("hb-container");
            let hb = await Hyperbeam(container, "${embedUrl}");
        }
        start();
    </script>
</body>
</html>`);

    } catch (error) {
        console.log("Error interno:", error.message);
        res.status(500).send("Error interno del servidor: " + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

