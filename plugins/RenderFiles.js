var debug = require('debug')('ofr-render_files');
var multimatch = require('multimatch');
var nunjucks = require('nunjucks');
var marked = require('marked');
var highlight = require('highlight.js').highlight;

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
          var rendered = njkEnv.render(getTemplateToRender(path, file, 'core/page'), Object.assign(file, {contentPath: path}));
          outputFiles[file.pageOutputPath] = {contents: rendered ? rendered : ''};
          break;
        case 'index':
          debug('type: index');
          warnIfOverriding(path, file.pageOutputPath, outputFiles);
          var rendered = njkEnv.render(getTemplateToRender(path, file, 'core/index'), Object.assign(file, {contentPath: path}));
          outputFiles[file.pageOutputPath] = {contents: rendered ? rendered : ''};
          break;
        case 'document':
          debug('type: document');
          warnIfOverriding(path, file.pageOutputPath, outputFiles);
          var rendered = njkEnv.render(getTemplateToRender(path, file, 'core/document'), Object.assign(file, {contentPath: path}));
          outputFiles[file.pageOutputPath] = {contents: rendered ? rendered : ''};
          break;
        case 'term':
          debug('type: term');
          warnIfOverriding(path, file.pageOutputPath, outputFiles);
          var rendered = njkEnv.render(getTemplateToRender(path, file, 'core/term'), Object.assign(file, {contentPath: path}));
          outputFiles[file.pageOutputPath] = {contents: rendered ? rendered : ''};
          break;
        case 'image':
          debug('type: image');
          warnIfOverriding(path, file.pageOutputPath, outputFiles);
          var rendered = njkEnv.render(getTemplateToRender(path, file, 'core/image'), Object.assign(file, {contentPath: path}));
          outputFiles[file.pageOutputPath] = {contents: rendered ? rendered : ''};
          warnIfOverriding(path, file.contentOutputPath, outputFiles);
          outputFiles[file.contentOutputPath] = file;
          break;
        case 'video':
          debug('type: video');
          warnIfOverriding(path, file.pageOutputPath, outputFiles);
          var rendered = njkEnv.render(getTemplateToRender(path, file, 'core/video'), Object.assign(file, {contentPath: path}));
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

function getTemplateToRender(path, file, defaultTemplate) {
  if(file.noExternalTemplate) {
    return path;
  }else if(file.template) {
    return template;
  }else {
    return defaultTemplate;
  }
}

function createNunjucksEnvironment(files, metadata) {
  //Set up markdown w/ highlight.js
  marked.setOptions({
    baseURL: metadata.baseURL,
    gfm: true,
    tables: true,
    highlight: (code, lang) => {
      debug('highlighting...', JSON.stringify(code.substring(0, 50) + '...'), lang);

      var showLineNumbers = false;
      var lineNumbersStart = 1;
      if(lang.indexOf('#') != -1) {
        debug('# found in lang, adding line numbers');
        showLineNumbers = true;
        var splitLang = lang.split('#');
        lang = splitLang[0];
        if (splitLang[1]) {
          lineNumbersStart = Number(splitLang[1]);
        }
        if(isNaN(lineNumbersStart)) {
          console.log(`[WARNING] Unable to parse line number, using 1: ${splitLang[1]}`);
        }
        debug('line numbers configured', lang, showLineNumbers, lineNumbersStart);
      }

      var highlighted = code;
      if(lang) {
        try {
          highlighted = highlight(lang, code, true).value;
          debug('highlighted', JSON.stringify(highlighted.substring(0, 50) + '...'));
        }catch(e) {
          debug('highlighting errored', e);
          console.log(`[WARNING] Failed to properly highlight code: ${JSON.stringify(code.substring(0, 50) + '...')}`, e.message);
        }
      }else {
        debug('unset code language, not highlighting');
      }

      if(showLineNumbers) {

        var numLines = highlighted.split(/\r\n|\r|\n/).length;
        var lineNumbers = String(lineNumbersStart);
        for(var i = lineNumbersStart + 1; i < numLines + lineNumbersStart; i++) {
          lineNumbers += "\n" + i;
        }
        return `<div class='hljs'><div class='line_numbers'>${lineNumbers}</div>${highlighted}<div>`;

      }else {
        return `<div class='hljs'>${highlighted}<div>`;
      }
    }
  });

  //Create, configure, and return nunjucks environment
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
  }, {
    autoescape: false
  })
  .addGlobal('site', {files: files, metadata: metadata})
  .addFilter('markdown', marked);
}

module.exports = () => {return renderFiles}