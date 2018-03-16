const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('./mime');
const utils = require('./utils');
const url = require('url');

class Tiny {
    constructor(opts) {
        this.rootPath = path.resolve(process.cwd() + (opts.rootPath || '/'));
        this.staticPath = path.resolve(process.cwd() + (opts.staticPath || '/static'));
        this.port = opts.port || '8088';

        this.eventMap = {};
    }
    start() {
        this.createServer();
    }
    get(path, cb) {
        this.eventMap[path] = cb;
    }
    middleWare(req, res) {
        return this.routerHandler(req, res);
    }
    fetchFile(req, res, pathName) {
        fs.stat(pathName, (err, stats) => {
            if (err) {
                return this.respond404(req, res, pathName);
            };
            this.respondFile(req, res, pathName);
        });
    }
    respondFile(req, res, pathName) {
        const readStream = fs.createReadStream(pathName);
        res.setHeader('Content-Type', mime[utils.getFileType(pathName)]);
        readStream.pipe(res);
    }
    startStaticServer(req, res) {
        const url = req.url;
        const resUrl = path.join(this.rootPath, path.resolve(path.normalize(url)));
        if (resUrl.indexOf(this.staticPath) !== 0) {
            return this.respond404(req, res, resUrl);
        }
        this.fetchFile(req, res, resUrl);
    }
    startCoreServer(req, res) {
        const pathname = url.parse(req.url).pathname;
        if (Object.keys(this.eventMap).length === 0) {
            return this.sendErrPage(req, res, { code: 500, content: `You have not a handler for path: ${pathname}` });
        }
        Object.keys(this.eventMap).map(path => {
            if ((path === '/' & pathname !== '/')
                || !new RegExp(path).test(pathname)) {
                return this.respond404(req, res, pathname);
            }
            this.eventMap[path] && this.eventMap[path].call(null, req, res);
        });
    }
    routerHandler(req, res) {
        path.basename(req.url).indexOf('.') > -1
            ? this.startStaticServer(req, res)
            : this.startCoreServer(req, res);
    }
    createServer() {
        http.createServer((req, res) => {
            this.middleWare(req, res);
        }).listen(this.port, e => {
            const info = e ? 'Fail to start the server' : `The server is running at ${this.port}`;
            console.info(info);
        });
    }
    respond404(req, res, path) {
        this.sendErrPage(req, res, { code: 404, content: `<h1>Not Found</h1><p>The requested URL ${path} was not found on this server.</p>` });
    }
    sendErrPage(req, res, { code, content }) {
        res.writeHead(code, { 'Content-Type': 'text/html' });
        res.end(content);
    }
}

module.exports = Tiny;