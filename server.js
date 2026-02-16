const os = require('os');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push(iface.address);
            }
        }
    }
    return ips;
}

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Dynamic config for client
    if (req.url === '/config.js') {
        const ips = getLocalIPs();
        const mainIp = ips[0] || 'localhost';
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(`window.SERVER_IP = "${mainIp}"; window.SERVER_PORT = ${PORT};`);
        return;
    }

    let url = req.url === '/' ? '/index.html' : req.url;
    let filePath = path.join(__dirname, url);

    fs.readFile(filePath, (err, content) => {
        if (err) {
            fs.readFile(path.join(__dirname, 'index.html'), (err2, fallbackContent) => {
                if (err2) {
                    res.writeHead(500);
                    res.end('Error: index.html not found');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(fallbackContent);
                }
            });
        } else {
            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    const ips = getLocalIPs();
    console.log(`\n========================================`);
    console.log(`  MIDNET PWA MIRROR ATIVO`);
    console.log(`========================================`);
    console.log(`  Local: http://localhost:${PORT}`);
    ips.forEach(ip => {
        console.log(`  Rede:  http://${ip}:${PORT}`);
    });
    console.log(`========================================\n`);
});
