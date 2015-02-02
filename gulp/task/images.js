/* jshint node:true */
'use strict';

/*!
 * This is free and unencumbered software released into the public domain.
 *
 * Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form
 * or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
 *
 * In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright
 * interest in the software to the public domain. We make this dedication for the benefit of the public at large and to
 * the detriment of our heirs and successors. We intend this dedication to be an overt act of relinquishment in
 * perpetuity of all present and future rights to this software under copyright law.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * For more information, please refer to <http://unlicense.org/>
 */

/**
 * Gulp image tasks.
 *
 * @author Richard Fussenegger <richard@fussenegger.info>
 * @copyright 2014 Richard Fussenegger
 * @license http://unlicense.org/ Unlicense.
 */

var $                   = require('gulp-load-plugins')();
var concurrentTransform = require('concurrent-transform');
var fs                  = require('fs');
var gulp                = require('gulp');
var imageSize           = require('image-size');
var lazyPipe            = require('lazypipe');
var mergeStreams        = require('merge-stream');
var os                  = require('os');
var path                = require('path');
var resizeTasks         = ['images:resize:gallery', 'images:resize:gallery:tiles', 'images:resize:icons', 'images:resize:logo', 'images:resize:tiles'];
var runSequence         = require('run-sequence');

/**
 * Get the gulp-image-resize options for the given dimension.
 * @param {number} width - The desired width of the re-sized image.
 * @param {number} [height] - The desired height of the re-sized image, defaults to width.
 * @return {Object}
 */
function resizeOptions(width, height) {
    height = height || width;
    return {
        crop: true,
        filter: 'Catrom',
        height: height,
        imageMagick: true,
        quality: 0.7,
        sharpen: true,
        width: width
    };
}

gulp.task('images', function (done) {
    runSequence(resizeTasks, 'images:webp', 'images:optimize', 'images:dist', done);
});

gulp.task('images:dist', function () {
    return gulp.src('tmp/images/**/*')
        .pipe(gulp.dest('dist/images'));
});

gulp.task('images:dev', function (done) {
    runSequence(resizeTasks, 'images:webp', done);
});

gulp.task('images:optimize', function () {
    return gulp.src(['src/images/**/*.svg', 'tmp/images/**/*.{gif,jpg,png}'])
        .pipe($.cache($.imagemin({
            interlaced: true,
            optimizationLevel: 7,
            progressive: true,
            quality: '65-80',
            svgoPlugins: [{ removeViewBox: false }],
            use: [require('imagemin-mozjpeg')(), require('imagemin-pngquant')()]
        })))
        .pipe(gulp.dest('tmp/images'));
});

gulp.task('images:resize:gallery', function () {
    // We keep the originals (for now).
    return gulp.src('src/images/**/{gallery,screenshots}/*.{gif,jpg,png,svg}')
        .pipe(gulp.dest('tmp/images'));
});

gulp.task('images:resize:gallery:tiles', function () {
    var resize = function (dimension) {
        return gulp.src('src/images/**/{gallery,screenshots}/*.{jpg,png}')
            .pipe($.ignore.exclude(function (vinyl) {
                var extension = path.extname(vinyl.path);
                return fs.existsSync(vinyl.path.replace(extension, '-tile' + extension));
            }))
            .pipe($.ignore.exclude(function (vinyl) {
                return imageSize(vinyl.path).width < dimension;
            }))
            .pipe($.rename(function (filePath) {
                if (!filePath.basename.match(/-tile$/)) {
                    filePath.basename += '-tile';
                }
                filePath.basename += '-' + dimension;
            }))
            //.pipe($.cache(concurrentTransform($.imageResize(resizeOptions(dimension)), os.cpus().length)))
            .pipe(concurrentTransform($.imageResize(resizeOptions(dimension, ((dimension / 16) * 9))), os.cpus().length))
            .pipe(gulp.dest('tmp/images'));
    };

    return mergeStreams(
        resize(1800),
        resize(1200),
        resize(900),
        resize(600),
        resize(450),
        resize(300)
    );
});

gulp.task('images:resize:icons', function () {
    var resize = function (dimension) {
        return gulp.src('src/images/icons/*.png')
            .pipe($.rename({ suffix: '-' + dimension }))
            //.pipe($.cache(concurrentTransform($.imageResize(resizeOptions(dimension)), os.cpus().length)))
            .pipe(concurrentTransform($.imageResize(resizeOptions(dimension)), os.cpus().length))
            .pipe(gulp.dest('tmp/images/icons'));
    };

    return mergeStreams(
        resize(72),
        resize(48),
        resize(36),
        resize(24)
    );
});

gulp.task('images:resize:logo', function () {
    var resize = function (dimension) {
        return gulp.src('src/images/logo/icon.png')
            .pipe($.rename({ suffix: '-' + dimension }))
            //.pipe($.cache(concurrentTransform($.imageResize(resizeOptions(dimension)), os.cpus().length)))
            .pipe(concurrentTransform($.imageResize(resizeOptions(dimension)), os.cpus().length))
            .pipe(gulp.dest('tmp/images/logo'));
    };

    return mergeStreams(
        resize(558),
        resize(270),
        resize(196),
        resize(128),
        resize(32)
    );
});

gulp.task('images:resize:tiles', function () {
    var resize = function (dimension) {
        return gulp.src('src/images/**/tile.jpg')
            .pipe($.rename({ suffix: '-' + dimension }))
            //.pipe($.cache(concurrentTransform($.imageResize(resizeOptions(dimension)), os.cpus().length)))
            .pipe(concurrentTransform($.imageResize(resizeOptions(dimension)), os.cpus().length))
            .pipe(gulp.dest('tmp/images'));
    };

    return mergeStreams(
        resize(1920),
        resize(1280),
        resize(960),
        resize(640),
        resize(480),
        resize(320)
    );
});

gulp.task('images:webp', function () {
    return gulp.src(['tmp/images/**/*.{jpg,png}', '!tmp/images/logo/*'])
        .pipe($.cache($.webp()))
        .pipe(gulp.dest('tmp/images'));
});
