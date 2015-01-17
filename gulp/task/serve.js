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
 * Gulp serve tasks.
 *
 * @author Richard Fussenegger <richard@fussenegger.info>
 * @copyright 2014 Richard Fussenegger
 * @license http://unlicense.org/ Unlicense.
 */

var $           = require("gulp-load-plugins")();
var browserSync = require("browser-sync");
var gulp        = require("gulp");

/**
 * Get browserSync server configuration.
 *
 * @param {Array|String} baseDirectory - The base directory to serve the application from.
 * @return {Object} The server configuration to use with browserSync.
 */
function server(baseDirectory) {
    return {
        notify: false,
        server: {
            baseDir: baseDirectory,
            middleware: require("connect-modrewrite")(["^/([^\\.]+)$ /$1.html [NC,L]"])
        }
    };
}

/**
 * Log message for change events.
 * @param {Object} event - The change event.
 * @return {undefined}
 */
function watchlog(event) {
    $.util.log("File " + $.util.colors.cyan(event.path) + " was " + $.util.colors.green(event.type) + ", running tasks ...");
}

/**
 * Helper function that binds the watchlog function to a gulp watch task.
 * @param {String|Array} watch - The minimatch glob of the files to watch.
 * @param {Function|Array} tasks - The tasks or functions to execute on change.
 * @return {undefined}
 */
function watch(watch, tasks) {
    gulp.watch(watch, tasks).on("change", watchlog);
}

gulp.task("serve", ["html:markdown", "html:markdown:index", "image:dev", "style:scss", "script:flatten"], function () {
    browserSync(server(["src", "tmp"]));
    watch(["src/views/*.ejs", "src/*.md", "!src/index.md"], ["html:markdown", browserSync.reload]);
    watch(["src/views/*.ejs", "src/projects/*.md", "src/index.md"], ["html:markdown:index", browserSync.reload]);
    watch(["src/styles/**/*.scss", "!src/styles/**/*_*.scss"], ["style:scss", browserSync.reload]);
    watch("src/scripts/**/*.js", browserSync.reload);
    watch("src/images/**/*.{gif,jpg,png,svg}", ["image:dev", browserSync.reload]);
});

gulp.task("serve:dist", ["default"], function () {
    browserSync(server("dist"));
});
