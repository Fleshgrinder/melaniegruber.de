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
var concurrentTransform = require("concurrent-transform");
var config = require("./config.json");
var del = require("del");
var glob = require("glob");
var gulp = require("gulp");
var merge = require("merge");
var mergeStreams = require("merge-stream");
var os = require("os");
var path = require("path");
var runSequence = require("run-sequence");

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

gulp.task("clean:all", ["clean:tmp"], del.bind(null, ["dep/*", "!dep/.gitignore"], { dot: true }));

gulp.task("clean:dep", del.bind(null, ["dep/projects", "dep/views"], { dot: true }));

gulp.task("clean:tmp", del.bind(null, ".tmp", { dot: true }));

gulp.task("compress", function () {
    return gulp.src(["dep/**/*", "!dep/**/*.{gif,gz,jpg,png,webp}"])
        .pipe($.cached(this.name))
        .pipe($.gzip({ gzipOptions: { level: 9 } }))
        .pipe($.remember(this.name))
        .pipe(gulp.dest("dep"))
        .pipe($.size({ title: this.name }));
});

gulp.task("copy", function () {
    return gulp.src(["src/*", "!src/*.md"], { dot: true })
        .pipe(gulp.dest("dep"));
});

gulp.task("default", function (done) {
    runSequence(
        ["copy", "fonts", "scripts", "styles"],
        ["html", "images"],
        "clean:dep",
        //"compress", TODO: Activate as soon as we have the nginx server ready.
        done
    );
});

gulp.task("fonts", function () {
    return gulp.src("src/fonts/**/*.{eot,svg,ttf,woff,woff2}")
        .pipe(gulp.dest("dep/fonts"));
});

gulp.task("html", ["html:markdown"], function () {
    var assets = $.useref.assets({ searchPath: "{.tmp,src}" });

    return gulp.src([".tmp/**/*.html", "src/**/*.html"])
        .pipe(assets)
        .pipe($.if("*.js", $.uglify({
            preserveComments: function () {
                return false;
            }
        })))
        .pipe($.if("*.css", $.uncss({ html: glob.sync(".tmp/**/*.html") })))
        .pipe($.if("*.css", $.csso()))
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.if("*.html", $.minifyHtml()))
        .pipe(gulp.dest("dep"))
        .pipe($.size({ title: this.name }));
});

// TODO: Find a better way to create the projects on the index page.
gulp.task("html:markdown", function () {
    var fm = require("gulp-front-matter/node_modules/front-matter");
    var fs = require("fs");
    var options = { property: "page", templateDir: "./src/views" };

    var prepare = function (vinyl, page) {
        page.date = page.date || "";
        page.description = page.description || "";
        page.programs = page.programs || [];
        page.route = page.route || path.basename(vinyl.path, ".md");
        page.subtitle = page.subtitle || config.page.title;
        page.title = page.title || config.page.title;
        page.titleSeparator = page.titleSeparator || config.page.titleSeparator;
        page.vimeo = page.vimeo || [];
        page.work = page.work || [];
        // TODO: Remove workSeparator, we want the program icons.
        page.workSeparator = page.workSeparator || config.page.workSeparator;
        return page;
    };

    return gulp.src("src/**/*.md")
        .pipe($.cached(this.name))
        .pipe($.frontMatter(merge({ remove: true }, options)))
        .pipe($.tap(function (vinyl) {
            prepare(vinyl, vinyl[options.property]);
        }))
        .pipe($.if("**/src/index.md", $.tap(function (vinyl) {
            var page = prepare(vinyl, vinyl[options.property]);
            page.projects = [];
            page.route = "/";

            // TODO: We need the ability to control the order of the projects on the index page.
            glob.sync("src/projects/*.md").forEach(function (filePath) {
                page.projects.push(prepare({ path: filePath }, fm(fs.readFileSync(filePath, "utf-8")).attributes));
            });
        })))
        .pipe($.multiRenderer(merge({ target: "content" }, options)))
        .pipe($.markdown())
        .pipe($.multiRenderer(options))
        .pipe($.rename(function (filePath) {
            if (filePath.dirname === "projects") {
                filePath.dirname = "";
            }
        }))
        .pipe(gulp.dest(".tmp"))
        .pipe($.size({ title: this.name }));
});

gulp.task("images", function (done) {
    runSequence(["images:resize:tiles"], ["images:optimize", "images:webp"], "images:copy", done);
});

gulp.task("images:copy", function () {
    return gulp.src(".tmp/images/**/*")
        .pipe(gulp.dest("dep/images"))
        .pipe($.size({ title: this.name }));
});

gulp.task("images:optimize", function () {
    return gulp.src("src/images/**/*.{gif,jpg,png,svg}")
        .pipe($.cached(this.name, { optimizeMemory: true }))
        .pipe($.imagemin({
            interlaced: true,
            optimizationLevel: 7,
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [require("imagemin-mozjpeg")(), require('imagemin-pngquant')()]
        }))
        .pipe($.remember(this.name))
        .pipe(gulp.dest(".tmp/images"))
        .pipe($.size({ title: this.name }));
});

gulp.task("images:resize:tiles", function () {
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
        resize(this.name + "@3x", 1920, "@3x"),
        resize(this.name + "@2x", 1280, "@2x"),
        resize(this.name + "@1.5x", 960, "@1.5x"),
        resize(this.name, 640)
    ).pipe($.size({ title: this.name }));
});

gulp.task("images:webp", function () {
    return gulp.src("src/images/**/*.{gif,jpg,png}")
        .pipe($.cached(this.name, { optimizeMemory: true }))
        .pipe($.webp())
        .pipe($.remember(this.name))
        .pipe(gulp.dest(".tmp/images"))
        .pipe($.size({ title: this.name }));
});

gulp.task("scripts", ["scripts:flatten"], function () {
    return gulp.src([".tmp/**/*.js", "src/**/*.js"])
        .pipe($.if("!*.min.js", $.uglify({
            preserveComments: function () {
                return false;
            }
        })))
        .pipe(gulp.dest("dep"))
        .pipe($.size({ title: this.name }));
});

gulp.task("scripts:flatten", function () {
    return gulp.src("bower_components/**/*.min.js")
        .pipe($.flatten())
        .pipe(gulp.dest(".tmp/scripts"));
});

gulp.task("serve", ["html:markdown", "images:webp", "styles:scss", "scripts:flatten"], function () {
    var watchlog = function (event) {
        $.util.log("File " + $.util.colors.cyan(event.path) + " was " + $.util.colors.green(event.type) + ", running tasks ...");
    };

    browserSync(server(["src", ".tmp"]));

    gulp.watch(
        ["src/views/**/*.ejs", "src/**/*.md"],
        ["html:markdown", browserSync.reload]
    ).on("change", watchlog);

    gulp.watch(
        ["src/styles/**/*.scss", "!src/styles/**/*_*.scss"],
        ["styles:scss", browserSync.reload]
    ).on("change", watchlog);

    gulp.watch(
        "src/images/**/*.{gif,jpg,png}",
        ["images:webp", browserSync.reload]
    ).on("change", watchlog);
});

gulp.task("serve:deployment", ["default"], function () {
    browserSync(server("dep"));
});

gulp.task("styles", ["styles:scss"], function () {
    return gulp.src(".tmp/styles/**/*.css")
        .pipe($.csso())
        .pipe(gulp.dest("dep/styles"))
        .pipe($.size({ title: this.name }));
});

gulp.task("styles:scss", function () {
    return gulp.src("src/styles/main.scss")
        .pipe($.sass({ precision: 10 }))
        .on("error", console.error.bind(console))
        .pipe($.autoprefixer({
            browsers: [
                "ie >= 10",
                "ie_mob >= 10",
                "ff >= 30",
                "chrome >= 30",
                "safari >= 6",
                "opera >= 20",
                "ios >= 7",
                "android >= 4.1",
                "bb >= 10"
            ]
        }))
        .pipe(gulp.dest(".tmp/styles"));
});

gulp.task("upload", ["default"], function () {
    var config = require("./config.json");
    var modes = ["sftp", "ftp"];

    for (var i = 0; i < 2; ++i) {
        if (config[modes[i]]) {
            return gulp.src("dep/**/*", { dot: true })
                .pipe($.cached(this.name))
                .pipe($[modes[i]](config[modes[i]]));
        }
    }

    throw new $.util.PluginError("upload", "No FTP nor SFTP configuration found.");
});
