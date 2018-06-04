var debug = require('debug')('ofr-clean_types');
var multimatch = require('multimatch');

const validTypes = ['undefined', 'page', 'index', 'document', 'term', 'image', 'video'];

function cleanTypes(files, metalsmith, done) {
  Object.keys(files).forEach(path => {
    debug('iterating through files', path);

    var file = files[path];
    debug('initial type', typeof file.type, file.type);
    if(file.type) {
      file.type = file.type.toLowerCase();
    }
    if(!multimatch(file.type, validTypes).length) {
      if(!file.type) {
        file.type = 'undefined';
      }else {
        throw `${path} specifies the invalid type ${file.type}`;
      }
    }
    debug('cleaned type', typeof file.type, file.type);
  });

  done();
}

module.exports = () => {return cleanTypes}