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
var package_json = require('./../package.json');

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

if (process.argv.pop().match('--dev')) {
    console.log('Installing development dependencies as well ...');
    for (var dependency in package_json.devDependencies) {
        package_json.dependencies[dependency] = package_json.devDependencies[dependency];
    }
}

// Install all non-gulp modules first.
for (dependency in package_json.dependencies) {
    if (!dependency.match(/^gulp/)) {
        dependencies.push(dependency);
        delete package_json.dependencies[dependency];
    }
}

// Install the util module and gulp itself next.
['gulp-util', 'gulp'].forEach(function (dependency) {
    if (package_json.dependencies.hasOwnProperty(dependency)) {
        dependencies.push(dependency);
        delete package_json.dependencies[dependency];
    }
});

// Install all *normal* gulp modules next.
for (dependency in package_json.dependencies) {
    if (!dependency.match(/image(?:min|-resize)$/)) {
        dependencies.push(dependency);
        delete package_json.dependencies[dependency];
    }
}

// Install all *problematic* gulp modules last.
for (dependency in package_json.dependencies) {
      dependencies.push(dependency);
      delete package_json.dependencies[dependency];
}

// Now install all dependencies in their correct order for maximum success rate.
(function npmUpdate(i) {
    console.log('Installing ' + dependencies[i] + ' ...');
    childProcess.exec('npm update ' + dependencies[i], function (error, std_out, std_err) {
        if (error) {
            console.error(error);
            process.exit(64);
        }
        else if (std_out) {
            console.log(std_out);
        }
        else if (std_err) {
            console.error(std_err);
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
