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
 * Build absolute URL.
 * @param {string|null} path - The absolute URL's path (query, etc.).
 * @return {string} The absolute URL.
 */
function url(path) {
    return config.uri.scheme + "://" + config.uri.authority + path;
}

/**
 * Evaluate condition and wrap if true.
 * @param {String} prefix - The prefix to put in front of the content if condition is true.
 * @param {String} content - The content to wrap if condition is true.
 * @param {String} suffix - The suffix to put behind of the content if condition is true.
 * @param {Boolean} condition - The condition which decides if the content should be wrapped.
 * @return {String} The content wrapped if condition is true or simply the content.
 */
function wrapIf(prefix, content, suffix, condition) {
    if (condition) {
        return prefix + content + suffix;
    } else {
        return content;
    }
}

/**
 * Prepare meta information for all documents.
 * @param {Object} vinyl - Virtual file of the currently processed Markdown document.
 * @return {undefined}
 */
function prepareMetaInfo(vinyl) {
    vinyl[options.property] = merge({
        description:    null,
        route:          path.basename(vinyl.path, ".md"),
        subtitle:       config.title,
        title:          config.title,
        titleSeparator: config.titleSeparator,
        uri:            config.uri,
        url:            url,
        wrapIf:         wrapIf
    }, vinyl[options.property]);
}

/**
 * Sort function for projects on index page.
 * @param (Object} a - Project "a".
 * @param {Object} b - Project "b".
 * @return {boolean}
 */
function sortProjects(a, b) {
    return (b.date + b.title).localeCompare(a.date + a.title);
}

/**
 * Prepare meta information for index document.
 * @param {Object} vinyl - Virtual file of the currently processed Markdown document.
 * @return {undefined}
 */
function prepareIndexMetaInfo(vinyl) {
    vinyl[options.property].route    = "/";
    vinyl[options.property].projects = projects.sort(sortProjects);
}

/**
 * Prepare meta information for project documents.
 * @param {Object} vinyl - Virtual file of the currently processed Markdown document.
 * @return {undefined}
 */
function prepareProjectMetaInfo(vinyl) {
    var date = vinyl[options.property].date || "";
    vinyl[options.property] = merge({
        program: [],
        date: date,
        vimeo: [],
        work: [],
        year: date.substring(0, 4)
    }, vinyl[options.property]);
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

// Optimize HTML for distribution.
gulp.task("html", ["html:markdown", "html:markdown:index"], function () {
    return gulp.src(["src/**/*.html", "tmp/**/*.html"])
        .pipe($.htmlMinifier({
            removeComments: true,
            removeCommentsFromCDATA: true,
            removeCDATASectionsFromCDATA: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeRedundantAttributes: true,
            preventAttributeEscaping: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeOptionalTags: true,
            removeIgnored: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: {
                schemeRelative: true
            }
        }))
        .pipe(gulp.dest("dist"))
        .pipe($.size({ title: "html" }));
});

// Process all non-special Markdown documents in the source directory.
gulp.task("html:markdown", function () {
    return gulp.src(["src/*.md", "!src/index.md"])
        .pipe($.cached("html:markdown"))
        .pipe(extractMetaInfo())
        .pipe(renderHTML())
        .pipe(gulp.dest("tmp"));
});

// Process the special index Markdown document.
gulp.task("html:markdown:index", ["html:markdown:projects"], function () {
    return gulp.src("src/index.md")
        .pipe(extractMetaInfo())
        .pipe($.tap(prepareIndexMetaInfo))
        .pipe(renderHTML())
        .pipe(gulp.dest("tmp"));
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
        .pipe(gulp.dest("tmp"));
});
