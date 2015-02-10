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
module.exports = function (name, error) {
    gulpUtil.log(util.format(
        '%s: %s\n %s',
        gulpUtil.colors.cyan(name),
        gulpUtil.colors.red('found unhandled error:'),
        error.toString()
    ));
};
