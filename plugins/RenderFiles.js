var debug = require('debug')('ofr:render_files');
var multimatch = require('multimatch');
var nunjucks = require('nunjucks');
var marked = require('marked');
var highlight = require('highlight.js').highlight;

//Currently, marked only get's configured once: here at the beginning.
configureMarked();

function renderFiles(files, metalsmith, done) {
  var metadata = metalsmith.metadata();
  var njkEnv = createNunjucksEnvironment(files, metadata);
  var renderedFiles = {};
  var pathsToRender = Object.keys(files);
  renderFile(pathsToRender, files, renderedFiles, njkEnv, done);
}

function renderFile(pathsToRender, files, renderedFiles, njkEnv, done) {
  if(pathsToRender.length) {//More files to render
    var path = pathsToRender.pop();
    var file = files[path];
    debug('rendering', path);
    
    if(file.type == 'undefined') {//Undefined type
      debug('type is undefined');
      if(!file.noOutput) {
        warnIfOverriding(path, file.contentOutputPath, renderedFiles);
        renderedFiles[file.contentOutputPath] = file;
      }else {
        debug('noOutput evaluated to true, not rendering')
      }
      renderFile(pathsToRender, files, renderedFiles, njkEnv, done);
    }else {//Non undefined type
      if(file.type == 'image' || file.type == 'video') {//Render content if image or video
        warnIfOverriding(path, file.contentOutputPath, renderedFiles);
        renderedFiles[file.contentOutputPath] = file;
      }
      
      //Render page for all types
      warnIfOverriding(path, file.pageOutputPath, renderedFiles);
      var template = getPageTemplateToRender(path, file)
      njkEnv.render(template, Object.assign(file, {contentPath: path}), (errors, rendered) => {
        if(errors) {
          console.log(`[WARNING] Nunjucks errored while rendering the page for ${path}`, errors);
        }

        debug('rendered template', template, rendered ? JSON.stringify(rendered.substring(0, 100) + '...') : rendered);
        renderedFiles[file.pageOutputPath] = {contents: rendered ? rendered : ''};

        renderFile(pathsToRender, files, renderedFiles, njkEnv, done);
      });
    }
    
  }else {//No more files to render
    renderingComplete(files, renderedFiles, done);
  }
}

function renderingComplete(files, renderedFiles, done) {
  debug('rendering complete, replacing build files with rendered files');
  Object.keys(files).forEach(key => delete files[key]);
  Object.assign(files, renderedFiles);

  done();
}

function warnIfOverriding(srcPath, outPath, renderedFiles) {
  if(renderedFiles[outPath]) {
    console.log(`[WARNING] ${srcPath} will write to ${outPath}, but there is already content there. Generally, overriding source files is prefferable.`);
  }
}

function getPageTemplateToRender(path, file) {
  if(file.noExternalTemplate) {
    return path;
  }else if(file.template) {
    return template;
  }else {
    debug('returning default template based on file\'s type', file.type);
    switch(file.type) {
      case 'page':
        return 'core/templates/page.njk';
      case 'index':
        return 'core/templates/index.njk';
      case 'document':
        return 'core/templates/document.njk';
      case 'term':
        return 'core/templates/term.njk';
      case 'image':
        return 'core/templates/image.njk';
      case 'video':
        return 'core/templates/video.njk';
    }
  }
}

function createNunjucksEnvironment(files, metadata) {
  //Create, configure, and return nunjucks environment
  return new nunjucks.Environment({
    getSource: path => {
      if(files[path]) {
        var template = files[path].contents.toString();
        debug('retrieved template', path, JSON.stringify(template.substring(0, 100) + ((template.length>10) ? '...' : '')));
        return {path: path, src: template};
      }else {
        console.log(`[WARNING] Nunjucks tried to load a template at ${path} but there isn't one there. Nunjucks may not error itself but this could result in blank output files.`);
        throw `fail to load template, ${path} is not a file`;
      }
    }
  }, {
    autoescape: false
  })
  .addGlobal('site', {files: files, metadata: metadata})
  .addFilter('markdown', marked);
}

function configureMarked() {
  //Set up markdown w/ highlight.js
  marked.setOptions({
    gfm: true,
    tables: true,
    highlight: markdownCodeHighlighter
  });
}

function markdownCodeHighlighter(code, lang) {
  debug('highlighting...', JSON.stringify(code.substring(0, 50) + '...'), lang);

  var showNotes = false;
  var notes = [];
  if(lang != undefined && lang.indexOf('@') != -1) {
    debug('@ found in lang, adding notes');
    showNotes = true;
    var splitLang = lang.split('@');
    lang = splitLang[0];

    var lastNote = 0;
    for(var i = 1; i < splitLang.length; i++) {
      var langNote = splitLang[i];
      debug('iterating through notes', i, langNote);

      if(langNote.indexOf(',') != -1) {
        noteParts = langNote.split(',');
        var line = Number(noteParts[0]);
        if(!isNaN(line)) {
          if(noteParts[1]) {
            notes[line - 1] = noteParts[1];
          }else {
            console.log(`[WARNING] No text for line note @${line}, ignoring.`);
          }
        }else {
          console.log(`[WARNING] Unable to parse number for line note @${langNote}, ignoring.`);
        }
      }else {
        var line = Number(langNote);
        if(!isNaN(line)) {
          notes[line - 1] = ++lastNote;
        }else {
          console.log(`[WARNING] Unable to parse number for line note @${langNote}, skipping.`);
          ++lastNote;
        }
      }
    }

    debug('notes configured', lang, showNotes, notes);
  }

  var showLineNumbers = false;
  var lineNumbersStart = 1;
  if(lang != undefined && lang.indexOf('#') != -1) {
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

  var numLines = highlighted.split(/\r\n|\r|\n/).length;

  if(showLineNumbers) {
    var lineNumbers = String(lineNumbersStart);
    for(var i = lineNumbersStart + 1; i < numLines + lineNumbersStart; i++) {
      lineNumbers += "\n" + i;
    }
    highlighted = `<div class='code-sidebar code-line_numbers'>${lineNumbers}</div>${highlighted}`;
  }

  if(showNotes) {
    var lineNotes='';
    for(var i = 0; i < numLines + 1; i++) { //The +1 shouldn't really be there but it makes sure that the border goes all the way down.
      lineNotes += (i != 0 ? "\n" : '') + (notes[i] ? `<span class='code-note'>${notes[i]}</span>` : '');
    }
    highlighted = `<div class='code-sidebar code-notes'>${lineNotes}</div>${highlighted}`;
  }

  return `<div class='hljs'>${highlighted}</div>`;
}

module.exports = () => {return renderFiles}