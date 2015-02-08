'use strict';

if (config.dist) {
    module.exports = require('lazypipe')().pipe(require('gulp-zopfli')).pipe(gulp.dest, config.dest);
} else {
    module.exports = require('gulp-util').noop;
}
