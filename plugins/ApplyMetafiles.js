var debug = require('debug')('ofr-apply_metafiles');
var multimatch = require('multimatch');
var jsYAML = require('js-yaml');

function applyMetafiles(files, metalsmith, done) {
  var metafilePaths = multimatch(Object.keys(files), '**/*.meta.yml');
  debug('found metafiles', metafilePaths);
  metafilePaths.forEach(metaPath => {
    var filePath = metaPath.split('.meta.yml')[0]
    debug('applying metafile', metaPath, filePath);
    if(!files[filePath]) {
      throw `No corresponding file for the metafile ${metaPath}`
    }
    files[filePath] = Object.assign(files[filePath], jsYAML.load(files[metaPath].contents.toString()));
    delete files[metaPath];
  });
  done();
}

module.exports = () => {return applyMetafiles};