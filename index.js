import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFileName(url, ext) {
    if (url === '/') {
        return 'index.html';
    } else {
        return !ext ? `${url}.html` : url;
    }
}

async function getFile(url, ext) {
    const fileName = getFileName(url, ext)
    return [await fs.readFile(path.join(__dirname, 'public', fileName)), 200];
}

async function handleError(err) {
    if (err.code === 'ENOENT') {
        return [await fs.readFile(path.join(__dirname, 'public', '404.html')), 404];
    } else {
        return [`<h1>Server Error: ${err.code}</h1>`, 500];
    }
}

function getContentType(ext) {
    switch (ext) {
        case '.html':
            return 'text/html';
        case '.css':
            return 'text/css';
        case '.ico':
            return 'image/x-icon';
    }
}

async function serve(req, res) {
    const ext = path.extname(path.join(__dirname, 'public', req.url));
    const type = getContentType(ext || '.html');
    const [ content, status ] = await getFile(req.url, ext).catch(err => handleError(err));

    res.writeHead(status, { 'Content-Type': type });
    res.end(content);
}

const server = http.createServer(serve).listen(8080);