const http = require('http');

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Hello World');
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});

