const http = require('http');
const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
const body = Buffer.concat([
  Buffer.from('--' + boundary + '\r\n'),
  Buffer.from('Content-Disposition: form-data; name="file"; filename="test.jpg"\r\n'),
  Buffer.from('Content-Type: image/jpeg\r\n\r\n'),
  Buffer.alloc(100, 128),
  Buffer.from('\r\n--' + boundary + '--\r\n'),
]);

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': body.length,
  },
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
});
req.on('error', e => console.log('Error:', e.message));
req.write(body);
req.end();
