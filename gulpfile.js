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

// Create copy of the original _runTask method.
gulp.Gulp.prototype.__runTask = gulp.Gulp.prototype._runTask;

// Overwrite existing _runTask method and store the name.
gulp.Gulp.prototype._runTask = function (task) {
    this.name = task.name;
    return this.__runTask(task);
};

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

gulp.task("clean", del.bind(null, ["dep/*", "!dep/.gitignore", ".tmp"], {dot: true}));

gulp.task("clean:bower", del.bind(null, ["bower_components"], {dot: true}));

gulp.task("clean:cache", function (done) {
    return $.cache.clearAll(done);
});

gulp.task("clean:dep", del.bind(null, ["dep/projects", "dep/views"], {dot: true}));

gulp.task("clean:npm", del.bind(null, ["node_modules"], {dot: true}));

gulp.task("compress", function () {
    return gulp.src(["dep/**/*", "!dep/**/*.{gif,jpg,png,webp}"])
        .pipe($.changed(this.name))
        .pipe($.gzip({gzipOptions: {level: 9}}))
        .pipe(gulp.dest("dep"))
        .pipe($.size({title: this.name}));
});

gulp.task("copy", function () {
    return gulp.src(["src/*", "!src/*.md"], {dot: true}).pipe(gulp.dest("dep"));
});

gulp.task("default", ["clean", "clean:cache"], function (callback) {
    require("run-sequence")(
        ["copy", "fonts", "scripts", "styles"],
        ["html", "images"],
        "clean:dep",
        "compress",
        callback
    );
});

gulp.task("fonts", ["fonts:copy"], function () {
    return gulp.src(".tmp/fonts/**/*.{eot,svg,ttf,woff}")
        .pipe($.changed(this.name))
        // https://github.com/svg/svgo/issues/277
        .pipe($.if("*.svg", $.replace(/<metadata>[^]*<\/metadata>/, "")))
        .pipe($.if("*.svg", $.replace(/id="[\w-]+"/, 'id="clear-sans"')))
        .pipe($.if("*.svg", $.imagemin({"svgoPlugins": [{"cleanupIDs": false}]})))
        .pipe(gulp.dest("dep/fonts"))
        .pipe($.size({title: this.name}));
});

gulp.task("fonts:copy", function () {
    return gulp.src("bower_components/clear-sans//**/*.{eot,svg,ttf,woff}")
        .pipe($.changed(this.name))
        .pipe($.rename(function (filePath) {
            filePath.dirname = "clear-sans";
            filePath.basename = filePath.basename.substring(filePath.basename.lastIndexOf("-") + 1).toLowerCase();
        }))
        .pipe(gulp.dest(".tmp/fonts"))
        .pipe($.size({title: this.name}));
});

gulp.task("html", ["markdown"], function () {
    var assets = $.useref.assets({searchPath: "{.tmp,src}"});

    return gulp.src([".tmp/**/*.html", "src/**/*.html"])
        .pipe($.changed(this.name))
        .pipe(assets)
        .pipe($.if("*.js", $.uglify({
            preserveComments: function () {
                return false;
            }
        })))
        .pipe($.if("*.css", $.uncss({html: glob.sync(".tmp/**/*.html")})))
        .pipe($.if("*.css", $.csso()))
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.if("*.html", $.minifyHtml()))
        .pipe(gulp.dest("dep"))
        .pipe($.size({title: this.name}));
});

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

// TODO: We could collect the project information during a first gulp run that excludes the index.
gulp.task("markdown", function () {
    var fm = require("gulp-front-matter/node_modules/front-matter");
    var fs = require("fs");
    var options = {property: "page", templateDir: "./src/views"};

    return gulp.src("src/**/*.md")
        .pipe($.changed(this.name))
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
            if (filePath.dirname === "projects") {
                filePath.dirname = "";
            }
        }))
        .pipe(gulp.dest(".tmp"))
        .pipe($.size({title: this.name}));
});

gulp.task("scripts", ["scripts:copy"], function () {
    return gulp.src([".tmp/**/*.js", "src/**/*.js"])
        .pipe($.changed(this.name))
        .pipe($.uglify({preserveComments: function () {
            return false;
        }}))
        .pipe(gulp.dest("dep"))
        .pipe($.size({title: this.name}));
});

gulp.task("scripts:copy", function () {
    return gulp.src("bower_components/picturefill/dist/picturefill.js")
        .pipe($.changed("scripts"))
        .pipe(gulp.dest(".tmp/scripts"))
        .pipe($.size({title: this.name}));
});

gulp.task("scripts:lint", function () {
    return gulp.src("src/scripts/**/*.js")
        .pipe($.changed("scripts"))
        .pipe(browserSync.reload({stream: true, once: true}))
        .pipe($.jshint())
        .pipe($.jshint.reporter("jshint-stylish"))
        .pipe($.if(!browserSync.active, $.jshint.reporter("fail")));
});

gulp.task("serve", ["markdown", "styles", "scripts:copy"], function () {
    var watchlog = function (event) {
        $.util.log("File " + $.util.colors.cyan(event.path) + " was " + $.util.colors.green(event.type) + ", running tasks ...");
    };

    browserSync(server([".tmp", "src"]));

    gulp.watch(["src/views/**/*.ejs", "src/**/*.md"], ["html", browserSync.reload]).on("change", watchlog);
    gulp.watch("src/styles/**/*.scss", ["styles", browserSync.reload]).on("change", watchlog);
    gulp.watch("src/scripts/**/*.js", ["scripts:lint"]).on("change", watchlog);
    gulp.watch("src/images/**/*", browserSync.reload).on("change", watchlog);
});

gulp.task("serve:deployment", ["default"], function () {
    browserSync(server("dep"));
});

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
        .pipe($.size({title: this.name}));
});

gulp.task("styles:lint", function () {
    return gulp.src("src/styles/**/*.scss")
        .pipe($.changed("styles"))
        .pipe($.scssLint({config: ".scss-lint.yml"}));
});

gulp.task("upload", ["default"], function () {
    var config = require("./config.json");
    var modes = ["sftp", "ftp"];

    for (var i = 0; i < 2; ++i) {
        if (config[modes[i]]) {
            return gulp.src("dep/**/*", {dot: true})
                .pipe($.changed(this.name))
                .pipe($[modes[i]](config[modes[i]]));
        }
    }

    throw new $.util.PluginError("upload", "No FTP nor SFTP configuration found.");
});
