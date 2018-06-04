var multimatch = require('multimatch');

/**
 * Goes through all the files in bundle order and, if they are a term, sets the metalsmith metadata at terms.<term> to the file's path.
 * @param {Object} files 
 * @param {Metalsmith} metalsmith 
 * @param {Function} done 
 */
module.exports = (files, metalsmith, done) => {
  var metadata = Object.assign(metalsmith.metadata(), {terms: {}})

  metalsmith.metadata().bundles.forEach(bundleID => {//Go through bundles in sequence
    Object.keys(files).forEach(path => {
      var file = files[path];
      if(multimatch(path, bundleID + "/**").length && file.type == 'term') {
        if(file.title) {
          var term = file.title.toLowerCase();
          if(metadata.terms[term]) {
            console.warn('[WARNING] ' + path + ' is overriding the existing term ' + term + '. If this is desired it is recommended to simply override the entire file with `overrides`.');
          }
          metadata.terms[term] = path;
        }
        if(file.termAliases) {
          file.termAliases.forEach(term => {
            term = term.toLowerCase();
            if(metadata.terms[term]) {
              console.warn('[WARNING] ' + path + ' is overriding the existing term ' + term + '. If this is desired it is recommended to simply override the entire file with `overrides`.');
            }
            metadata.terms[term] = path;
          });
        }
      }
    });
  });

  metalsmith.metadata(metadata);
  done();
}