var multimatch = require('multimatch');

/**
 * Allows files to change their path, potentially overriding other files. Adds metadata about overriden files.
 * @param {Object} files 
 * @param {Metalsmith} metalsmith 
 * @param {Function} done 
 */
module.exports = (files, metalsmith, done) => {//TODO Currently, higher bundles can override lower bundles. Not sure if this is good or not in practice... Might want to prevent it and warn.
  metalsmith.metadata().bundles.forEach(bundleID => {//Go through bundles in sequence

    Object.keys(files).forEach(path => {//Go through all the files
      var file = files[path];
      if(multimatch(path, bundleID + "/**").length && file.overrides) {//If the file is part of the bundle and overrides something
        overridenPath = file.overrides;

        delete file.overrides;//Delete the overrides key. If override sequence is out of order, don't want to override itself again.
        file.originalPath = path;//Keep track of this version's original path

        if(files[overridenPath]) {//If it is actually overriding
          if(!file.overriden) {//Create new array to keep track of overriden versions if doesn't exist
            file.overriden = [];
          }
          file.overriden.push(files[overridenPath]);//Add old version to array of overriden versions
        }else if(bundleID != 'core') {//The core is expected to set up some files that will not exist already but generally other bundles shouldn't.
          console.warn('WARNING: ' + path + ' is not overriding an existing file.');
        }

        files[overridenPath] = file;//Override with new, modified file
        delete files[path];//Remove file
      }
    });

  });
  done();
}