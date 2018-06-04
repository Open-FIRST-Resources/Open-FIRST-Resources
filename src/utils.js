var jsYAML = require('js-yaml');

/**
 * Create a string that describes how long a build took.
 * @param {Number} startTime when the build was started
 */
exports.getBuildDurationString = (startTime) => {
  var timeDiff = (new Date() - startTime);
  var millis = Math.floor(timeDiff % 1000);
  var seconds = Math.floor((timeDiff/1000) % 60);
  var minutes = Math.floor(timeDiff/60000);

  return (minutes ? minutes + 'm ' : '') + (seconds ? seconds + 's ': '') + millis + 'ms';
}

/**
 * Pulls the site metadata from metadata.yml and sets baseURL and devBuild.
 * @param {boolean} devBuild Whether the current build is a development one.
 */
exports.getInitialMetadata = (devBuild) => {
  var metadata = jsYAML.load(fs.readFileSync('metadata.yml', 'utf8'));
  metadata.baseURL = devBuild ? metadata.devBaseURL : metadata.baseURL;
  metadata.devBuild = devBuild;
  return metadata;
}

/**
 * A Metalsmith plugin that logs Metalsmith's metadata to the console.
 * @param {Object} files 
 * @param {Metalsmith} metalsmith 
 * @param {Function} done 
 */
exports.printMetadata = (files, metalsmith, done) => {
  console.log("Metadata: ", JSON.stringify(metalsmith.metadata(), null, 2));
  done();
}

/**
 * A Metalsmith plugin that logs Metalsmith's files to the console.
 * @param {Object} files 
 * @param {Metalsmith} metalsmith 
 * @param {Function} done 
 */
exports.printFiles = (files, metalsmith, done) => {
  console.log("Files: ", JSON.stringify(files, null, 2));
  done();
}

/**
 * Determines the output path for the resource page of a file, once processed.
 * @param {String} path The path of the unprocessed file.
 */
exports.getOutputPath = (path) => {
  var lastPeriod = path.lastIndexOf('.');
  if(lastPeriod == -1) {
    return path + '.html';
  }else {
    return path.substring(0, lastPeriod) + '.html';
  }
}

/**
 * Determines the output path for the resource page of a file, once processed.
 * @param {String} path The path of the unprocessed file.
 * @param {Metalsmith} metalsmith The Metalsmith object.
 */
exports.getOutputURL = (path, metalsmith) => {
  return metalsmith.metadata().baseURL + exports.getOutputPath(path)
}