/* jshint node:true */
"use strict";

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

var $                   = require("gulp-load-plugins")();
var concurrentTransform = require("concurrent-transform");
var gulp                = require("gulp");
var mergeStreams        = require("merge-stream");
var os                  = require("os");
var resizeTasks         = ["image:resize:tile"];
var runSequence         = require("run-sequence");

gulp.task("image", function (done) {
    runSequence(resizeTasks, ["image:optimize", "image:webp"], "image:dep", done);
});

gulp.task("image:dep", function () {
    return gulp.src(".tmp/images/**/*")
        .pipe(gulp.dest("dep/images"));
});

gulp.task("image:dev", function (done) {
    runSequence(resizeTasks, ["image:webp"], done);
});

gulp.task("image:optimize", function () {
    return gulp.src("src/images/**/*.{gif,jpg,png,svg}")
        .pipe($.imagemin({
            interlaced: true,
            optimizationLevel: 7,
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [require("imagemin-mozjpeg")(), require('imagemin-pngquant')()]
        }))
        .pipe(gulp.dest(".tmp/images"))
        .pipe($.size({ title: this.name }));
});

gulp.task("image:resize:tile", function () {
    var resize = function (name, dimension, suffix) {
        suffix = suffix || "";
        return gulp.src("src/images/**/tile.jpg")
            .pipe($.cached(name, { optimizeMemory: true }))
            .pipe(concurrentTransform($.imageResize({
                crop: true,
                filter: "Catrom",
                height: dimension,
                imageMagick: true,
                sharpen: true,
                width: dimension,
                upscale: true
            }), os.cpus().length))
            .pipe($.remember(name))
            .pipe($.rename({ suffix: suffix }))
            .pipe(gulp.dest(".tmp/images"));
    };

    return mergeStreams(
        resize("tile@3x", 1920, "@3x"),
        resize("tile@2x", 1280, "@2x"),
        resize("tile@1.5x", 960, "@1.5x"),
        resize("tile", 640)
    ).pipe($.size({ title: "image:resize:tile" }));
});

gulp.task("image:webp", function () {
    return gulp.src("src/images/**/*.{gif,jpg,png}")
        .pipe($.cached("images:webp", { optimizeMemory: true }))
        .pipe($.webp())
        .pipe($.remember("images:webp"))
        .pipe(gulp.dest(".tmp/images"))
        .pipe($.size({ title: "image:webp" }));
});
