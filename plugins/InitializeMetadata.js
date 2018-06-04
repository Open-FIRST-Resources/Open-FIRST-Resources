var debug = require('debug')('ofr-initialize_metadata');
var jsYAML = require('js-yaml');

function initializeMetadata(devBuild) {
  debug('initialized with', devBuild)

  return (files, metalsmith, done) => {
    var metadata = jsYAML.load(fs.readFileSync('config.yml', 'utf8'));
    debug('read and parsed', metadata);
    metadata.baseURL = devBuild ? metadata.developmentBaseURL : metadata.productionBaseURL;
    metadata.devBuild = devBuild;
    debug('set baseURL and devBuild', metadata);
    metalsmith.metadata(metadata);

    done();
  }

}

module.exports = initializeMetadata;