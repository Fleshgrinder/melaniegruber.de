'use strict';

var compress = require('../components/compress');
var gulpChanged = require('gulp-changed');
var gulpPlumber = require('gulp-plumber');
var plumberErrorHandler = require('../components/plumber-error-handler');
var through = require('through2');

module.exports = function (done) {
    if (config.dist) {
        return gulp.src(['src/*.{ico,txt,xml}', 'src/downloads/**/*', 'src/fonts/**/*.{woff,woff2}'], { base: 'src/' })
            .pipe(gulpPlumber(plumberErrorHandler('Copy')))
            .pipe(gulpChanged(config.dest))
            .pipe(gulp.dest(config.dest))
            .pipe(through.obj(function (file, enc, cb) {
                if (file.path.match(/\.(?:ico|txt|xml)$/)) {
                    this.push(file);
                }
                cb();
            }))
            .pipe(compress());
    }
    done();
};
