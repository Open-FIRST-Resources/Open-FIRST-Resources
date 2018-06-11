var debug = require('debug')('ofr-normalize_paths');

function normalizePaths(files, metalsmith, done) {
  var paths = Object.keys(files);
  paths.forEach(path => {
    var normalizedPath = path.replace('\\', '/');
    debug('normalizing path', path, normalizedPath);
    var file = files[path];
    delete files[path];
    files[normalizedPath] = file;
  });
  done();
}

module.exports = () => {return normalizePaths};