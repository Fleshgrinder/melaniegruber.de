'use strict';

var gulpUtil = require('gulp-util');
var util = require('util');

/**
 * Error handle for plumber.
 *
 * **Usage:** `{ errorHandler: thisFunction.bind(null, 'My Name') }`
 *
 * @function
 * @param {string} name - Must be bound before passing to plumber.
 * @param {Error} error
 * @return {undefined}
 */
function errorHandler(name, error) {
    gulpUtil.log(util.format(
        '%s: %s\n %s',
        gulpUtil.colors.cyan(name),
        gulpUtil.colors.red('found unhandled error:'),
        error.toString()
    ));
}

/**
 * Get plumber error handler options hash.
 *
 * @function
 * @param {string} name
 * @return {{}}
 */
module.exports = function (name) {
    return {
        errorHandler: errorHandler.bind(null, name)
    };
};
