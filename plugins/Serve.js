var debug = require('debug')('ofr-serve');
var static = require('node-static');

var server;
function serve(files, metalsmith, done) {//TODO implement things found in metalsmith-serve (e.g. 404)
  if(!server) {
    debug('no server found, starting');
    
    var fileServer = new static.Server(metalsmith.destination());
    server = require('http').createServer(function (request, response) {

      if(request.url.lastIndexOf('/') == request.url.length-1) {
        debug('Request ends in /, adding index.html', request.url);
        request.url += 'index.html';
      }

      if(!(request.url.lastIndexOf('.') > request.url.lastIndexOf('/'))) {
        debug('Request has no extension, adding .html', request.url);
        request.url += '.html';
      }

      request.addListener('end', function () {
        fileServer.serve(request, response, (err, res) => {
          if (err) {
            debug('error serving request', err);
            if (err.status == '404') {
              console.log(`[404] ${request.url}`);
              fileServer.serveFile('404.html', err.status, {}, request, response);
            }
            else {
              console.log(`[${err.status}] ${request.url}`);

              response.writeHead(err.status, err.headers);
              response.end(HTTPStatus[err.status]);
            }
          }
        });
      }).resume();

    })

    server.listen(metalsmith.metadata().developmentPort);
    console.log(`[INFO] Development server started: ${metalsmith.metadata().baseURL}`);

  }else {
    debug('existing server found, not starting a new one');
  }

  done();
}

module.exports = () => {return serve}