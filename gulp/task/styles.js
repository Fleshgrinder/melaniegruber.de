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
 * Gulp style tasks.
 *
 * @author Richard Fussenegger <richard@fussenegger.info>
 * @copyright 2014 Richard Fussenegger
 * @license http://unlicense.org/ Unlicense.
 */

var $ = require('gulp-load-plugins')();
var gulp = require('gulp');

gulp.task('styles', ['styles:scss'], function () {
    return gulp.src('tmp/styles/**/*.css')
        .pipe($.csso())
        .pipe(gulp.dest('dist/styles'));
});

gulp.task('styles:scss', function () {
    var src = function (name) {
        return 'src/styles/' + name + '.scss';
    };

    return gulp.src('src/styles/**/*.scss')
        .pipe($.sass({ precision: 10 }))
        .on('error', console.error.bind(console))
        .pipe($.autoprefixer({
            // We only require flexbox support, which is actually pretty decent:
            // - http://caniuse.com/#feat=flexbox
            // - http://html5please.com/#flexbox
            browsers: [
                'ie >= 10',
                'ie_mob >= 10',
                'ff >= 22',
                'chrome >= 21',
                'safari >= 6.1',
                'opera >= 12.1',
                'ios >= 7',
                'android >= 3',
                'bb >= 10'
            ]
        }))
        .pipe(gulp.dest('tmp/styles'));
});
