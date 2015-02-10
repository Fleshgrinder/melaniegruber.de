'use strict';

var compress = require('../components/compress');
var gulpChanged = require('gulp-changed');
var gulpIgnore = require('gulp-ignore');
var gulpPlumber = require('gulp-plumber');
var plumberErrorHandler = require('../components/plumber-error-handler');

module.exports = function (done) {
    if (config.dist) {
        return gulp.src(['src/*.{ico,txt,xml}', 'src/downloads/**/*', 'src/fonts/**/*.{woff,woff2}'], { base: 'src/' })
            .pipe(gulpPlumber(plumberErrorHandler('Copy')))
            .pipe(gulpChanged(config.dest))
            .pipe(gulp.dest(config.dest))
            .pipe(gulpIgnore.include(function (file) {
                return file.path.match(/\.(?:ico|txt|xml)$/);
            }))
            .pipe(compress());
    }
    done();
};
