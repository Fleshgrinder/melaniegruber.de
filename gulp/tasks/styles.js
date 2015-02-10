'use strict';

var compress = require('../components/compress');
var gulpAutoprefixer = require('gulp-autoprefixer');
//var gulpChanged = require('gulp-changed');
var gulpCsso = require('gulp-csso');
var gulpPlumber = require('gulp-plumber');
var gulpReplace = require('gulp-replace');
var gulpSass = require('gulp-sass');
var gulpSourcemaps = require('gulp-sourcemaps');
var gulpUtil = require('gulp-util');
var plumberErrorHandler = require('../components/plumber-error-handler');

module.exports = function () {
    return gulp.src('src/styles/*.scss', { base: 'src/' })
        .pipe(gulpPlumber(plumberErrorHandler('Styles')))
        //.pipe(gulpChanged(config.dest, {
        //    extension: '.css',
        //    pattern: ['src/styles/**/*.scss', 'gulp/tasks/styles.js']
        //}))
        .pipe(config.dist ? gulpUtil.noop() : gulpSourcemaps.init())
        .pipe(gulpSass({
            imagePath: '/images/',
            precision: 10
        }))
        .pipe(gulpAutoprefixer({
            browsers: [
                '> 1%',
                'last 2 version',
                'Firefox ESR',
                'Opera 12.1'
            ],
            cascade: false
        }))
        .pipe(config.dist ? gulpCsso() : gulpUtil.noop())
        .pipe(gulpReplace('@charset "UTF-8";', ''))
        .pipe(config.dist ? gulpUtil.noop() : gulpSourcemaps.write('.'))
        .pipe(gulp.dest(config.dest))
        .pipe(compress());
};
