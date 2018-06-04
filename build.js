//Package imports
var metalsmith = require('metalsmith');
var metafiles = require('metalsmith-metafiles');
var livereload = require('metalsmith-livereload');
var watch = require('metalsmith-watch');
// var serve = require('metalsmith-serve');
var debug = require('metalsmith-debug');

//Local imports
var initializeMetadata = require('./plugins/InitializeMetadata');
var validateBundles = require('./plugins/ValidateBundles');
var overrideFiles = require('./plugins/OverrideFiles');
var cleanTypes = require('./plugins/CleanTypes');
var setOutputPaths = require('./plugins/SetOutputPaths');
var indexTerms = require('./plugins/IndexTerms');
var renderFiles = require('./plugins/RenderFiles');
var serve = require('./plugins/Serve');

/**
 * Start a build.
 * @param {Boolean} devBuild Whether to run a continuous, local, development build.
 */
function build(devBuild) {
  console.log('Building...');
  var startTime = new Date();
  
  //Initial metalsmith setup
  var ms = metalsmith(__dirname)
  .source('bundles')
  .destination('build')
  .clean(true)

  //Build
  .use(initializeMetadata(devBuild))
  .use(validateBundles())
  .use(metafiles({parsers: {".yml": true}}))
  .use(overrideFiles())
  .use(cleanTypes())
  .use(setOutputPaths())
  .use(indexTerms())
  .use(renderFiles())
  .use(debug())
  
  //Apply plugins for automated, live-reloading development builds
  if(devBuild) {
    console.log('Starting dev environment...');

    ms
    .use(livereload())
    .use(watch({paths: {"${source}/**": "**"}}))
    .use(serve());
  }

  //Start build
  ms.build(function(err) {
    if(err) throw err;
    else console.log('Done! Took ' + getBuildDurationString(startTime) + '.\n');
  });
}

/**
 * Create a string that describes how long a build took.
 * @param {Date} startTime when the build was started
 */
function getBuildDurationString(startTime) {
  var timeDiff = (new Date() - startTime);
  var millis = Math.floor(timeDiff % 1000);
  var seconds = Math.floor((timeDiff/1000) % 60);
  var minutes = Math.floor(timeDiff/60000);

  return (minutes ? minutes + 'm ' : '') + (seconds ? seconds + 's ': '') + millis + 'ms';
}

module.exports.build = build;