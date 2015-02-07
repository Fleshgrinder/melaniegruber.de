// jshint forin:false
'use strict';

/**
 * Because `npm update` almost always fails. This script only uses built-in node modules for its task of installing all
 * dependencies in the correct order for maximum success rate during installation.
 */

console.log('Installing node modules, this may take several minutes ...');

/**
 * Node child process core module.
 *
 * @type {exports}
 */
var childProcess = require('child_process');

/**
 * Package JSON file.
 *
 * @type {{dependencies:{}}}
 */
var packageJSON = require('./package.json');

/**
 * Array used to collect node module names.
 *
 * @type {Array}
 */
var dependencies = [];

/**
 * Current node module.
 *
 * @type {string}
 */
var dependency;

// Install all non-gulp modules first.
for (dependency in packageJSON.dependencies) {
    if (!dependency.match(/^gulp/)) {
        dependencies.push(dependency);
        delete packageJSON.dependencies[dependency];
    }
}

// Install the util module and gulp itself next.
['gulp-util', 'gulp'].forEach(function (dependency) {
    if (packageJSON.dependencies.hasOwnProperty(dependency)) {
        dependencies.push(dependency);
        delete packageJSON.dependencies[dependency];
    }
});

// Install all *normal* gulp modules next.
for (dependency in packageJSON.dependencies) {
    if (!dependency.match(/image(?:min|-resize)$/)) {
        dependencies.push(dependency);
        delete packageJSON.dependencies[dependency];
    }
}

// Install all *problematic* gulp modules last.
for (dependency in packageJSON.dependencies) {
      dependencies.push(dependency);
      delete packageJSON.dependencies[dependency];
}

// Now install all dependencies in their correct order for maximum success rate.
(function npmUpdate(i) {
    console.log('Installing ' + dependencies[i] + ' ...');
    childProcess.exec('npm update ' + dependencies[i], function (error, stdOut, stdError) {
        if (error) {
            console.error(error);
            process.exit(64);
        } else if (stdOut) {
            console.log(stdOut);
        } else if (stdError) {
            console.error(stdError);
        }

        ++i;

        if (dependencies[i]) {
            npmUpdate(i);
        } else {
            console.log('Successfully installed all node modules.');
            process.exit(0);
        }
    });
})(0);
