'use strict';

var gulpPlumber = require('gulp-plumber');
var gulpUglify = require('gulp-uglify');
var compress = require('../components/compress');

module.exports = function (done) {
    if (config.dist) {
        return gulp.src('src/scripts/**/*.js', { base: 'src/' })
            .pipe(gulpPlumber())
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
