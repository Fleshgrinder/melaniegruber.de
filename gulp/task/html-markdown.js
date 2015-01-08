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
 * Gulp tasks for Markdown-to-HTML conversion.
 *
 * @author Richard Fussenegger <richard@fussenegger.info>
 * @copyright 2014 Richard Fussenegger
 * @license http://unlicense.org/ Unlicense.
 */

var $        = require("gulp-load-plugins")();
var config   = require("../../config.json").page;
var gulp     = require("gulp");
var lazyPipe = require("lazypipe");
var merge    = require("merge");
var path     = require("path");

/**
 * Default options for gulp-front-matter and gulp-multi-renderer.
 * @type {{property: String, templateDir: String}}
 */
var options = { property: "page", templateDir: "./src/views" };

/**
 * Options for gulp-multi-renderer for content insertion.
 * @type {{property: String, templateDir: String, target: String}}
 */
var optionsContent = merge({ target: "content" }, options);

/**
 * Options for gulp-front-matter for meta information extraction.
 * @type {{property: String, templateDir: String, remove: Boolean}}
 */
var optionsFrontMatter = merge({ remove: true }, options);

/**
 * Array used to collect project meta information.
 * @type {Array}
 */
var projects = [];

/**
 * Prepare meta information for all documents.
 * @param {Object} vinyl - Virtual file of the currently processed Markdown document.
 * @return {undefined}
 */
function prepareMetaInfo(vinyl) {
    var meta = vinyl[options.property];

    meta.description    = meta.description    || null;
    meta.route          = meta.route          || path.basename(vinyl.path, ".md");
    meta.subtitle       = meta.subtitle       || config.title;
    meta.title          = meta.title          || config.title;
    meta.titleSeparator = meta.titleSeparator || config.titleSeparator;
}

/**
 * Prepare meta information for index document.
 * @param {Object} vinyl - Virtual file of the currently processed Markdown document.
 * @return {undefined}
 */
function prepareIndexMetaInfo(vinyl) {
    var meta = vinyl[options.property];

    meta.route = "/";
    meta.projects = projects.sort(function (a, b) {
        a = a.date + a.title;
        b = b.date + b.title;
        return b.localeCompare(a);
    });
}

/**
 * Prepare meta information for project documents.
 * @param {Object} vinyl - Virtual file of the currently processed Markdown document.
 * @return {undefined}
 */
function prepareProjectMetaInfo(vinyl) {
    var meta = vinyl[options.property];

    meta.programs       = meta.programs || [];
    meta.date           = meta.date     || "";
    meta.vimeo          = meta.vimeo    || [];
    meta.work           = meta.work     || [];
    meta.year           = meta.date.substring(0, 4);

    projects.push(vinyl[options.property]);
}

/**
 * Lazy pipe factory for meta information extraction.
 * @type {Function}
 */
var extractMetaInfo = lazyPipe()
    .pipe($.frontMatter, optionsFrontMatter)
    .pipe($.tap, prepareMetaInfo);

/**
 * Lazy pipe factory for HTML rendering.
 * @type {Function}
 */
var renderHTML = lazyPipe()
    .pipe($.multiRenderer, optionsContent)
    .pipe($.markdown)
    .pipe($.multiRenderer, options);

// Optimize HTML, CSS, and JS and move to deployment directory.
gulp.task("html", ["html:markdown", "html:markdown:index"], function () {
    var assets = $.useref.assets({ searchPath: "{.tmp,src}" });

    return gulp.src([".tmp/**/*.html", "src/**/*.html"])
        .pipe(assets)
        .pipe($.if("*.js", $.uglify({
            preserveComments: function () {
                return false;
            }
        })))
        .pipe($.if("*.css", $.uncss({ html: require("glob").sync(".tmp/**/*.html") })))
        .pipe($.if("*.css", $.csso()))
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.if("*.html", $.minifyHtml()))
        .pipe(gulp.dest("dep"))
        .pipe($.size({ title: "html" }));
});

// Process all non-special Markdown documents in the source directory.
gulp.task("html:markdown", function () {
    return gulp.src(["src/*.md", "!src/index.md"])
        .pipe($.cached("html:markdown"))
        .pipe(extractMetaInfo())
        .pipe(renderHTML())
        .pipe(gulp.dest(".tmp"));
});

// Process the special index Markdown document.
gulp.task("html:markdown:index", ["html:markdown:projects"], function () {
    return gulp.src("src/index.md")
        .pipe(extractMetaInfo())
        .pipe($.tap(prepareIndexMetaInfo))
        .pipe(renderHTML())
        .pipe(gulp.dest(".tmp"));
});

// Process all project Markdown documents.
gulp.task("html:markdown:projects", function () {
    return gulp.src("src/projects/*.md")
        .pipe($.cached("html:markdown:projects"))
        .pipe(extractMetaInfo())
        .pipe($.tap(prepareProjectMetaInfo))
        .pipe(renderHTML())
        .pipe($.rename(function (filePath) {
            filePath.dirname = "";
        }))
        .pipe(gulp.dest(".tmp"));
});
