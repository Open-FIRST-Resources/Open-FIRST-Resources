var debug = require('debug')('ofr-index_terms');
var multimatch = require('multimatch');

function indexTerms(files, metalsmith, done) {
  var metadata = metalsmith.metadata();
  metadata.terms = {};

  metalsmith.metadata().bundles.forEach(bundleID => {
    debug('iterating through bundles', bundleID);

    multimatch(Object.keys(files), `${bundleID}/**`).forEach(path => {
      debug('iterating through files', path);

      var file = files[path];
      if(file.type == 'term') {

        if(file.termName) {
          var name = file.termName.toLowerCase();
          debug('Found name, adding', name);
          if(metadata.terms[name]) {
            console.log(`[WARNING] ${path} is overriding the term ${name}, which has already been set. Generally, overriding the file that already set that term is preferable.`);
          }
          metadata.terms[name] = path;
         }
        
         if(file.termAliases) {
          debug('found aliases', file.termAliases);

          file.termAliases.forEach(alias => {
            
            alias = alias.toLowerCase();
            debug('adding', alias);
            if(metadata.terms[alias]) {
              console.log(`[WARNING] ${path} is overriding the term ${alias}, which has already been set. Generally, overriding the file that already set that term is preferable.`);
            }
            metadata.terms[alias] = path;

          });

        }
        
        if(!(file.termName || file.termAliases)) {
          console.log(`[WARNING] ${path} is a term but does not set termName or termAliases.`);
        }

      }
    });

  });

  done();
}

module.exports = () => {return indexTerms}