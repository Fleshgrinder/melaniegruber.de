'use strict';

var compress = require('../components/compress');
//var gulpChanged = require('gulp-changed');
var gulpPlumber = require('gulp-plumber');
var gulpUglify = require('gulp-uglify');
var plumberErrorHandler = require('../components/plumber-error-handler');

module.exports = function (done) {
    if (config.dist) {
        return gulp.src('src/scripts/**/*.js', { base: 'src/' })
            .pipe(gulpPlumber(plumberErrorHandler('Scripts')))
            //.pipe(gulpChanged(config.dest, { pattern: 'gulp/tasks/scripts.js' }))
            .pipe(gulpUglify({
                preserveComments: function () {
                    return false;
                }
            }))
            .pipe(gulp.dest(config.dest))
            .pipe(compress());
    }
    done();
};
