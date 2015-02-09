'use strict';

var compress = require('../components/compress');
var gulpChanged = require('gulp-changed');
var gulpFrontMatter = require('gulp-front-matter');
var gulpHtmlMinifier = require('gulp-html-minifier');
var gulpMarkdown = require('gulp-markdown');
var gulpMultiRenderer = require('gulp-multi-renderer');
var gulpPlumber = require('gulp-plumber');
var gulpUtil = require('gulp-util');
var IndexPage = require('../components/IndexPage');
var lazypipe = require('lazypipe');
var merge = require('merge');
var Page = require('../components/Page');
var path = require('path');
var ProjectPage = require('../components/ProjectPage');
var through = require('through2');

var pageOptions = {
    property: 'page',
    templateDir: './src/views'
};

var frontMatter = lazypipe()
    .pipe(gulpFrontMatter, merge({ remove: true }, pageOptions))
;

var htmlMin = lazypipe()
    .pipe(gulpHtmlMinifier, {
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
    })
;

var projects = [];

var render = lazypipe()
    .pipe(gulpMultiRenderer, merge({ target: 'content' }, pageOptions))
    .pipe(gulpMarkdown)
    .pipe(gulpMultiRenderer, pageOptions)
    .pipe(config.dist ? htmlMin : gulpUtil.noop)
    .pipe(gulp.dest, config.dest)
;

module.exports = function (allDone) {
    /**
     * Call the gulp provided allDone callback after both source streams called this function once. Note that the
     * streams cannot be simply merged, because the second stream has a sub-stream.
     *
     * @return {undefined}
     */
    function done() {
        done.allDone = done.allDone ? allDone() : true;
    }

    /**
     * Normalize project destination from source filename to target filename for gulp-changed.
     *
     * @param {File} file - The vinyl file object representing the project.
     * @return {string} The normalized project path.
     */
    function projectDestination(file) {
        file.path = ProjectPage.normalizePagePath(file.path);
        return config.dest;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // This stream will build all markdown files without any special dependencies.
    gulp.src(['src/**/*.md', '!src/index.md', '!src/projects/**', '!src/fonts/**'], { base: 'src/' })
        .on('end', done)
        .pipe(gulpPlumber())
        .pipe(gulpChanged(config.dest, {
            extension: '.html',
            pattern: ['src/views/**/*.ejs', '!src/views/index.ejs', 'gulp/components/*.js', 'gulp/tasks/pages.js']
        }))
        .pipe(frontMatter())
        .pipe(through.obj(function (file, enc, cb) {
            file[pageOptions.property] = new Page(file, file[pageOptions.property]);
            this.push(file);
            cb();
        }))
        .pipe(render())
        .pipe(compress());

    // -----------------------------------------------------------------------------------------------------------------
    // This stream will collect the projects for the index page and next/previous linking.
    gulp.src('src/projects/**/*.md', { base: 'src/' })
        .on('end', function () {
            if (projects.length === 0) {
                done();
                return;
            }

            projects.sort(function (a, b) {
                a = a[pageOptions.property];
                b = b[pageOptions.property];
                return (b.date + b.route).localeCompare(a.date + a.route);
            });

            for (var i = 0, n = 1, p = -1, l = projects.length; i < l; ++i) {
                if (n in projects) {
                    projects[i][pageOptions.property].next = projects[n][pageOptions.property];
                }
                if (p in projects) {
                    projects[i][pageOptions.property].previous = projects[i][pageOptions.property];
                }
            }

            // This stream finally builds the index and the previously collected projects.
            gulp.src('src/index.md', { base: 'src/' })
                .on('end', done)
                .pipe(gulpPlumber())
                .pipe(frontMatter())
                .pipe(through.obj(function (file, enc, cb) {
                    var indexProjects = [];

                    // Push the previously collected projects back into this stream.
                    for (var i = 0, l = projects.length; i < l; ++i) {
                        indexProjects[i] = projects[i][pageOptions.property];
                        this.push(projects[i]);
                    }

                    file[pageOptions.property] = new IndexPage(file, file[pageOptions.property], indexProjects);
                    this.push(file);
                    cb();
                }))
                .pipe(render())
                .pipe(compress());
        })
        .pipe(gulpPlumber())
        .pipe(gulpChanged(projectDestination, {
            extension: '.html',
            pattern: ['src/index.md', 'src/projects/**/*.md', 'src/views/**/*.ejs', 'gulp/**/*.js']
        }))
        .pipe(frontMatter())
        .pipe(through.obj(function (file, enc, cb) {
            file[pageOptions.property] = new ProjectPage(file, file[pageOptions.property]);

            // Project might already be part of the projects array if executing during serve task execution.
            var found = projects.some(function (project, index) {
                if (project.filePath === file.path) {
                    projects[index] = file;
                    return true;
                }
            });

            if (found === false) {
                projects.push(file);
            }

            this.push(file);
            cb();
        }));
};
