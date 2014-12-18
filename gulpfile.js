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
 * Gulp task runner configuration file.
 *
 * @author Richard Fussenegger <richard@fussenegger.info>
 * @copyright 2014 Richard Fussenegger
 * @license http://unlicense.org/ Unlicense.
 */
var $ = require("gulp-load-plugins")();
var browserSync = require("browser-sync");
var del = require("del");
var glob = require("glob");
var gulp = require("gulp");
var merge = require("merge");
var mergeStreams = require("merge-stream");

/**
 * Get browserSync server configuration.
 *
 * @param {Array|String} baseDirectory
 *   The base directory to serve the application from.
 * @returns {Object}
 *   The server configuration to use with browserSync.
 */
var server = function (baseDirectory) {
    return {
        notify: false,
        server: {
            baseDir: baseDirectory,
            middleware: require("connect-modrewrite")(["^/([^\\.]+)$ /$1.html [NC,L]"])
        }
    };
};

// Delete generated deployment and temporary files.
gulp.task("clean", del.bind(null, ["dep/*", "!dep/.gitignore", ".tmp"], {dot: true}));

// Delete all bower files.
gulp.task("clean:bower", del.bind(null, ["bower_components"], {dot: true}));

// Clear the cache for temporary files.
gulp.task("clean:cache", function (done) {
    return $.cache.clearAll(done);
});

// Delete all npm files.
gulp.task("clean:npm", del.bind(null, ["node_modules"], {dot: true}));

// Pre-compress all static files (which are not already compressed) for nginx static module.
gulp.task("compress", function () {
    return gulp.src(["dep/**/*", "!dep/**/*.{gif,jpg,png,webp}"])
        .pipe($.gzip({"gzipOptions": {"level": 9}}))
        .pipe(gulp.dest("dep"));
});

// Copy all static files from the source root directory to the deployment directory.
gulp.task("copy", function () {
    return mergeStreams(
        gulp.src(["src/*", "!src/*.md"], {dot: true})
            .pipe(gulp.dest("dep"))
            .pipe($.size({title: "root-files"})),
        gulp.src("bower_components/picturefill/dist/picturefill.min.js")
            .pipe(gulp.dest(".tmp/scripts"))
            .pipe($.size({title: "picturefill"})),
        gulp.src("bower_components/clear-sans//**/*.{eot,svg,ttf,woff}")
            .pipe($.rename(function (filePath) {
                filePath.dirname = "clear-sans";
                filePath.basename = filePath.basename.substring(filePath.basename.lastIndexOf("-") + 1).toLowerCase();
            }))
            .pipe(gulp.dest(".tmp/fonts"))
            .pipe($.size({title: "clear-sans"}))
    );
});

// Deploy the website; note that we clear the cache to ensure that we have the latest versions of everything.
gulp.task("default", ["clean", "clean:cache"], function (callback) {
    // Note that fonts will execute the copy task!
    require("run-sequence")(["fonts", "styles"], ["html", "images", "jshint"], "compress", callback);
});

// Copy the fonts from the source directory to the deployment directory.
gulp.task("fonts", ["copy"], function () {
    return gulp.src(".tmp/fonts/**/*.{eot,svg,ttf,woff}")
        // https://github.com/svg/svgo/issues/277
        .pipe($.if("*.svg", $.replace(/<metadata>[^]*<\/metadata>/, "")))
        .pipe($.if("*.svg", $.replace(/id="[\w-]+"/, 'id="clear-sans"')))
        .pipe($.if("*.svg", $.imagemin({"svgoPlugins": [{"cleanupIDs": false}]})))
        .pipe(gulp.dest("dep/fonts"))
        .pipe($.size({title: "fonts"}));
});

// Generate static HTML files from the temporary HTML files.
gulp.task("html", ["markdown"], function () {
    var assets = $.useref.assets({searchPath: "{.tmp,src}"});

    return gulp.src([".tmp/**/*.html", "src/**/*.html"])
        .pipe(assets)
        .pipe($.if("*.js", $.uglify()))
        .pipe($.if("*.css", $.uncss({html: glob.sync(".tmp/**/*.html")})))
        .pipe($.if("*.css", $.csso()))
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.if("*.html", $.minifyHtml()))
        .pipe(gulp.dest("dep"))
        .pipe($.size({title: "html"}));
});

// Optimize all images and copy them to the deployment directory.
// TODO: Convert to various sizes for various devices.
gulp.task("images", function () {
    var src = ["src/images/**/*.{gif,jpg,png,svg}", "!src/images/**/*.{ai,psd}"];
    var dep = "dep/images";

    return mergeStreams(
        gulp.src(src)
            .pipe($.cache($.imagemin({
                interlaced: true,
                optimizationLevel: 7,
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [require("imagemin-mozjpeg")(), require('imagemin-pngquant')()]
            })))
            .pipe(gulp.dest(dep))
            .pipe($.size({title: "imagemin"})),
        gulp.src(src)
            .pipe($.cache($.webp()))
            .pipe(gulp.dest(dep))
            .pipe($.size({title: "webp"}))
    );
});

// TODO: First we need some JS. ;-)
gulp.task("jshint", function () {
    return gulp.src("src/scripts/**/*.js")
        .pipe(browserSync.reload({stream: true, once: true}))
        .pipe($.jshint())
        .pipe($.jshint.reporter("jshint-stylish"))
        .pipe($.if(!browserSync.active, $.jshint.reporter("fail")));
});

// Generate HTML files from Markdown files.
// TODO: We could collect the project information during a first gulp run that excludes the index.
gulp.task("markdown", function () {
    var fm = require("gulp-front-matter/node_modules/front-matter");
    var fs = require("fs");
    var options = {property: "page", templateDir: "./src/views"};

    return gulp.src("src/**/*.md")
        .pipe($.frontMatter(merge({remove: true}, options)))
        .pipe($.tap(function (file) {
            file[options.property].subtitle = file[options.property].subtitle || "Melanie Gruber";
            file[options.property].title = file[options.property].title || "Melanie Gruber";
            file[options.property].titleSeparator = file[options.property].titleSeparator || " | ";
        }))
        .pipe($.if("**/src/index.md", $.tap(function (file) {
            file[options.property].projects = [];
            glob.sync("src/projects/*.md").forEach(function (filePath) {
                if (filePath !== "src/index.md") {
                    var content = fm(fs.readFileSync(filePath, "utf-8"));
                    file[options.property].projects.push({
                        route: content.attributes.route,
                        title: content.attributes.title,
                        description: content.attributes.description
                    });
                }
            });
        })))
        .pipe($.multiRenderer(merge({target: "content"}, options)))
        .pipe($.markdown())
        .pipe($.multiRenderer(options))
        .pipe($.rename(function (filePath) {
            // Move the actual projects file up into the root directory.
            if (filePath.dirname === "projects") {
                filePath.dirname = "";
            }
        }))
        .pipe(gulp.dest(".tmp"))
        .pipe($.size({title: "markdown"}));
});

gulp.task("scsslint", function () {
    return gulp.src("src/styles/**/*.scss")
        .pipe($.changed("styles"))
        .pipe($.scssLint({config: ".scss-lint.yml"}));
});

// Start the browserSync web server for local development.
gulp.task("serve", ["copy", "markdown", "styles"], function () {
    var watchlog = function (event) {
        $.util.log("File " + $.util.colors.cyan(event.path) + " was " + $.util.colors.green(event.type) + ", running tasks ...");
    };

    browserSync(server([".tmp", "src"]));

    gulp.watch(["src/views/**/*.ejs", "src/**/*.md"], ["html", browserSync.reload]).on("change", watchlog);
    gulp.watch("src/styles/**/*.scss", ["styles", browserSync.reload]).on("change", watchlog);
    gulp.watch("src/scripts/**/*.js", ["jshint"]).on("change", watchlog);
    gulp.watch("src/images/**/*", browserSync.reload).on("change", watchlog);
});

// Build and serve the output from the deployment directory.
gulp.task("serve:deployment", ["default"], function () {
    browserSync(server("dep"));
});

// Generate CSS from SCSS files.
gulp.task("styles", function () {
    return gulp.src("src/styles/main.scss")
        .pipe($.sass({precision: 10}))
        .on("error", console.error.bind(console))
        .pipe($.autoprefixer({
            browsers: [
                "ie >= 10",
                "ie_mob >= 10",
                "ff >= 30",
                "chrome >= 34",
                "safari >= 7",
                "opera >= 23",
                "ios >= 7",
                "android >= 4.4",
                "bb >= 10"
            ]
        }))
        .pipe(gulp.dest(".tmp/styles"))
        .pipe($.csso())
        .pipe(gulp.dest("dep/styles"))
        .pipe($.size({title: "styles"}));
});

// Upload everything to the configured remote (S)FTP server.
gulp.task("upload", ["default"], function () {
    var config = require("./config.json");
    var modes = ["sftp", "ftp"];

    for (var i = 0; i < 2; ++i) {
        if (config[modes[i]]) {
            return gulp.src("dep/**/*", {dot: true}).pipe($[modes[i]](config[modes[i]]));
        }
    }

    throw new $.util.PluginError("upload", "No FTP nor SFTP configuration found.");
});
