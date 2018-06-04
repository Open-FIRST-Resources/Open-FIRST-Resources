var debug = require('debug')('ofr-render_files');
var multimatch = require('multimatch');
var nunjucks = require('nunjucks');

function renderFiles(files, metalsmith, done) {
  var metadata = metalsmith.metadata();
  var njkEnv = createNunjucksEnvironment(files, metadata);

  var outputFiles = {};
  metalsmith.metadata().bundles.forEach(bundleID => {
    debug('iterating through bundles', bundleID);

    multimatch(Object.keys(files), `${bundleID}/**`).forEach(path => {
      debug('iterating through files', path);

      var file = files[path];
      switch(file.type) {
        case 'page':
          debug('type: page');
          warnIfOverriding(path, file.pageOutputPath, outputFiles);
          var rendered = njkEnv.render(path, file);
          outputFiles[file.pageOutputPath] = {contents: rendered ? rendered : ''};
          break;
        case 'index':
          debug('type: index');
          warnIfOverriding(path, file.pageOutputPath, outputFiles);
          var rendered = njkEnv.render(path, file);
          outputFiles[file.pageOutputPath] = {contents: rendered ? rendered : ''};
          break;
        case 'document':
        debug('type: document');
        warnIfOverriding(path, file.pageOutputPath, outputFiles);
        var rendered = njkEnv.render(path, file);
        outputFiles[file.pageOutputPath] = {contents: rendered ? rendered : ''};
          break;
        case 'term':
          debug('type: term');
          warnIfOverriding(path, file.pageOutputPath, outputFiles);
          var rendered = njkEnv.render(path, file);
          outputFiles[file.pageOutputPath] = {contents: rendered ? rendered : ''};
          break;
        case 'image':
          debug('type: image');
          warnIfOverriding(path, file.pageOutputPath, outputFiles);
          var rendered = njkEnv.render('core/image', file);
          outputFiles[file.pageOutputPath] = {contents: rendered ? rendered : ''};
          warnIfOverriding(path, file.contentOutputPath, outputFiles);
          outputFiles[file.contentOutputPath] = file;
          break;
        case 'video':
          debug('type: video');
          warnIfOverriding(path, file.pageOutputPath, outputFiles);
          var rendered = njkEnv.render('core/video', file);
          outputFiles[file.pageOutputPath] = {contents: rendered ? rendered : ''};
          warnIfOverriding(path, file.contentOutputPath, outputFiles);
          outputFiles[file.contentOutputPath] = file;
          break;
        default:
          debug('type: undefined');
          if(!file.noOutput) {
            warnIfOverriding(path, file.contentOutputPath, outputFiles);
            outputFiles[file.contentOutputPath] = file;
          }else {
            debug('noOutput evaluated to true, not rendering')
          }
      }

    });

  });

  Object.keys(files).forEach(key => delete files[key]);
  Object.assign(files, outputFiles);

  done();
}

function warnIfOverriding(srcPath, outPath, outputFiles) {
  if(outputFiles[outPath]) {
    console.log(`[WARNING] ${srcPath} will write to ${outPath}, but there is already content there. Generally, overriding source files is prefferable.`);
  }
}

function createNunjucksEnvironment(files, metadata) {
  return new nunjucks.Environment({
    getSource: path => {
      if(files[path]) {
        var template = files[path].contents.toString();
        debug('retrieved template', path, template.substring(0, 10) + ((template.length>10) ? '...' : ''));
        return {path: path, src: template};
      }else {
        throw `fail to load template, ${path} is not a file`;
      }
    }
  }).addGlobal('site', {files: files, metadata: metadata});
}

module.exports = () => {return renderFiles}