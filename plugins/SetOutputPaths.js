var debug = require('debug')('ofr-set_output_paths');

function setOutputPaths(files, metalsmith, done) {
  Object.keys(files).forEach(path => {
    debug('iterating through files', path);

    var file = files[path];
    switch(file.type) {
      case 'page':
        debug('type: page');
        setStandard(path, file);
        break;
      case 'index':
        debug('type: index');
        setStandard(path, file);
        break;
      case 'document':
        debug('type: document');
        setStandard(path, file);
        break;
      case 'term':
        debug('type: term');
        setStandard(path, file);
        break;
      case 'image':
        debug('type: image');
        setMedia(path, file);
        break;
      case 'video':
        debug('type: video');
        setMedia(path, file);
        break;
      default:
        debug('type: undefined');
        if(!file.contentOutputPath) {
          file.contentOutputPath = path;
        }
        delete file.pageURLPath;
        delete file.pageOutputPath;
    }
    debug('output paths set', file.contentOutputPath, file.pageURLPath, file.pageOutputPath);
  });

  done();
}

function setStandard(path, file) {
  delete file.contentOutputPath;
  if(!file.pageOutputPath) {
    file.pageOutputPath = removeLastExtension(path) + '.html';
  }
  if(!file.pageURLPath) {
    file.pageURLPath = removeLastExtension(file.pageOutputPath);
  }
}

function setMedia(path, file) {
  if(!file.contentOutputPath) {
    file.contentOutputPath = path;
  }
  if(!file.pageOutputPath) {
    file.pageOutputPath = removeLastExtension(path) + '.html';
  }
  if(!file.pageURLPath) {
    file.pageURLPath = removeLastExtension(file.pageOutputPath);
  }
}

function removeLastExtension(path) {
  var lastDot = path.lastIndexOf('.');
  var lastSlash = path.lastIndexOf('/');
  if(lastDot > lastSlash) {
    return path.substring(0, lastDot);
  }else {
    return path;
  }
}

module.exports = () => {return setOutputPaths}