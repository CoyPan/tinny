# tinny
A tiny server framework for node.js

# install 
```
npm install tinny --save
```
# useage
```
const Tinny = require('tinny');

const server = new Tinny({
    staticPath: __dirname + '/static',
    rootPath: __dirname + '/',
    port: 8088
});

server.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('hello world');
});

server.start();
```
You will see 'hello world' in http://127.0.0.1:8088/. Also a tiny static server is running at http://127.0.0.1:8088/static/. You can put static files such as index.js in the static folder , and then you can access it at http://127.0.0.1:8088/static/index.js
