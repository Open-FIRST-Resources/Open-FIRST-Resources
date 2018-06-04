var debug = require('debug')('ofr-override_files');
var multimatch = require('multimatch');

function overrideFiles(files, metalsmith, done) {
  var overridePatterns = [];
  metalsmith.metadata().bundles.forEach(bundleID => {
    debug('iterating through bundles', bundleID);

    overridePatterns.push(`${bundleID}/**`);
    debug('using override patterns', overridePatterns);

    multimatch(Object.keys(files), `${bundleID}/**`).forEach(path => {
      debug('iterating through files', path);

      var file = files[path];
      debug("file's override", file.override);
      if(file.override) {
        debug('override detected');

        if(multimatch(file.override, overridePatterns).length) {
          debug("valid override, overriding");

          file.overrideOriginalPath = path;
          file.overriden = files[file.override] ? (files[file.override].overriden ? files[file.override].overriden : []) : [];
          file.overriden.push(files[file.override]);

          files[file.override] = file;
          delete files[path];

        }else {
          throw `${path} specifies an override that is not in a overridable bundle. Check your config.yml.`;
        }

      }

    });
    
  });

  done();
}

module.exports = () => {return overrideFiles}