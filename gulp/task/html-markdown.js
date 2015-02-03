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
 * Gulp tasks for Markdown-to-HTML conversion.
 *
 * @author Richard Fussenegger <richard@fussenegger.info>
 * @copyright 2014 Richard Fussenegger
 * @license http://unlicense.org/ Unlicense.
 */
var $         = require('gulp-load-plugins')();
var config    = require('../../config.json');
var crypto    = require('crypto');
var fs        = require('fs');
var glob      = require('glob');
var gulp      = require('gulp');
var imageSize = require('image-size');
var lazyPipe  = require('lazypipe');
var merge     = require('merge');
var path      = require('path');

// Append the source directory to the path module for easy removal from routes.
path.root = path.dirname(path.dirname(__dirname)) + '\\src';

/**
 * Default options for gulp-front-matter and gulp-multi-renderer.
 * @type {{property: String, templateDir: String}}
 */
var options = { property: 'page', templateDir: './src/views' };

/**
 * Options for gulp-multi-renderer for content insertion.
 * @type {{property: String, templateDir: String, target: String}}
 */
var optionsContent = merge({ target: 'content' }, options);

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
 * Hash used to cache generated cache buster strings.
 * @type {Object}
 */
var cacheBusters = {};

/**
 * Generate web accessible URL with cache buster appended.
 * @param {string} url - The URL of the asset.
 * @param {string} pattern - The glob pattern of the files to generate the cache buster hash.
 * @return {string} The web accessible URL with the cache buster hash appended if applicable.
 */
function asset(url, pattern) {
    // @see gulpfile.js
    var cacheBuster = cacheBuster || false;

    if (cacheBuster === true) {
        pattern = 'src' + (pattern || url);

        if (!(pattern in cacheBusters)) {
            cacheBusters[pattern] = '';
            glob.sync(pattern).forEach(function (filePath) {
                cacheBusters[pattern] += fs.readFileSync(filePath, { encoding: 'utf8' });
            });
            cacheBusters[pattern] = crypto.createHash('md5').update(cacheBusters[pattern]).digest('hex');
        }

        return url + '?' + cacheBusters[pattern];
    }

    return url;
}

/**
 * Build absolute URL.
 * @param {string|null} path - The absolute URL's path (query, etc.).
 * @return {string} The absolute URL.
 */
function url(path) {
    return config.uri.scheme + '://' + config.uri.authority + path;
}

/**
 * Render gallery images.
 * @param {Object} page - The current page's object.
 * @param {string} type - The gallery type, defaults to `gallery`.
 * @return {string} The rendered gallery images.
 */
function renderGalleryImages(page, type) {
    var anchor, extension, webPath;
    var extensions = ['gif', 'jpg', 'png', 'svg'];
    var rendered   = '';

    var url = function (suffix, webExtension) {
        webExtension = webExtension || extension;

        if (suffix) {
            var suffixes = ['-tile-' + suffix, '-tile'];
            suffix = undefined;

            for (var i = 0; i < suffixes.length; ++i) {
                if (fs.existsSync(path.resolve('tmp' + webPath + suffixes[i] + '.' + webExtension))) {
                    suffix = suffixes[i];
                    break;
                }
            }
        }
        suffix = suffix || '';

        return asset(webPath + suffix + '.' + webExtension, webPath + '.' + extension);
    };

    type = type || 'gallery';

    page.imageIndex = page.imageIndex || 0;

    page[type].forEach(function (title) {
        // Build the absolute web accessible path to the file without file extension.
        webPath = '/images' + page.route + '/' + type + '/' + title.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-_]/g, '');

        // Determine what kind of file we have.
        for (var i = 0; i < extensions.length; ++i) {
            if (fs.existsSync(path.resolve('src' + webPath + '.' + extensions[i]))) {
                extension = extensions[i];
                break;
            }
        }

        var size = imageSize(path.resolve('src' + webPath + '.' + extension));
        rendered +=
            '<a class="img-anchor media-element" ' +
                'data-height="' + size.height + '" ' +
                'data-index="' + page.imageIndex + '" ' +
                'data-width="' + size.width + '" ' +
                'href="' + url() + '" ' +
                'id="media-element-' + page.imageIndex + '" ' +
                'target="_blank">'
        ;

        if (extension === 'svg') {
            rendered += '<img alt="' + title + '" height="337.5" src="' + url() + '" width="600">';
        } else {
            rendered += '<picture>';
            if (extension !== 'gif') {
                rendered += '<source sizes="(min-width: ' + (320 / 16) + 'em) 600px, 100vw" srcset="' +
                    url(300, 'webp') + ' 300w, ' +
                    url(450, 'webp') + ' 450w, ' +
                    url(600, 'webp') + ' 600w, ' +
                    url(900, 'webp') + ' 900w, ' +
                    url(1200, 'webp') + ' 1200w, ' +
                    url(1800, 'webp') + ' 1800w" type="image/webp">'
                ;
            }
            rendered += '<img alt="' + title + '" height="337.5" src="' + url(600) + '" srcset="' +
                url(900) + ' 1.5x, ' +
                url(1200) + ' 2x, ' +
                url(1800) + ' 3x" width="600">' +
            '</picture>';
        }

        // Be sure to close the opened media element wrapper tag.
        rendered += '</a>';

        // Increase the global counter for the next image (no matter which gallery type).
        ++page.imageIndex;

        // Export the first image we find to be our Facebook image.
        if (extension !== 'svg' && !('facebookImage' in page)) {
            page.facebookImage = url(300);
        }
    });

    return rendered;
}

/**
 * Render index tile image.
 * @param {Object} project - The project to render the index tile for.
 * @return {string} The rendered index tile for the project.
 */
function renderIndexTile(project) {
    var url = function (dimension, extension) {
        return asset(project.tilePrefix + '-' + dimension + '.' + (extension || 'jpg'), project.tilePattern);
    };

    var sizes = '';
    for (var i = 2; i < 13; ++i) {
        var width = 320 * i;
        sizes += '(min-width: ' + width + 'px) and (max-width: ' + (width + 20) + 'px) 320px, ';
    }

    // The source with its sizes attribute covers all devices up to 4k UHD (3840px) as e.g. found in Apple's MacBook Pro
    // since ~2012. Note that WebP is only supported in the Blink rendering engine; other browsers currently use the
    // <img> fallback below.
    //
    // Browsers without WebP support currently also have no support for the sizes attribute. The srcset attribute has
    // some support in Apple based software, but only for the x syntax; therefore we use that syntax since we want to
    // supply the Retina displays with good looking images. This forces us to deliver higher resolution images and waste
    // bandwidth, since we cannot anticipate the size of the device without the aid of the sizes attribute.
    return '' +
        '<source sizes="(max-width: 339px) 320px, ' + sizes + ' 640px" srcset="' +
            url(320, 'webp') + ' 320w, ' +
            url(480, 'webp') + ' 480w, ' +
            url(640, 'webp') + ' 640w, ' +
            url(960, 'webp') + ' 960w, ' +
            url(1280, 'webp') + ' 1280w, ' +
            url(1920, 'webp') + ' 1920w" type="image/webp">' +
        '<img alt="' + project.title + '" class="img-responsive project-tile" height="640" src="' + url(640) + '" srcset="' +
            url(960) + ' 1.5x, ' +
            url(1280) + ' 2x, ' +
            url(1920) + ' 3x" width="640">';
}

/**
 * Render the program icons.
 * @param {Array} programs - The programs to render.
 * @param {boolean} whiteBackground - Whether the icons are displayed on white background or not, defaults to FALSE.
 * @return {string} The rendered program icons.
 */
function renderProgramIcons(programs, whiteBackground) {
    var basename;
    var rendered = '';

    var url = function (suffix, extension) {
        suffix = suffix ? '-' + suffix : '';
        extension = extension || 'svg';
        return asset(
            '/images/icons/' + basename + suffix + '.' + extension,
            '/images/icons/' + basename + '.' + (extension === 'svg' ? 'svg' : 'png')
        );
    };

    programs.forEach(function (program) {
        basename = program.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-_]/g, '');

        if (program.split(' ')[0] === 'Autodesk') {
            rendered +=
                '<picture title="' + program + '">' +
                    '<source srcset="' +
                        url(24, 'webp') + ', ' +
                        url(32, 'webp') + ' 1.5x, ' +
                        url(48, 'webp') + ' 2x, ' +
                        url(72, 'webp') + ' 3x" type="image/webp">' +
                    '<img alt="' + program + ' icon." class="project-icon" height="24" src="' +
                        url(24, 'png') + '" srcset="' +
                        url(32, 'png') + ' 1.5x, ' +
                        url(48, 'png') + ' 2x, ' +
                        url(72, 'png') + ' 3x" width="24">' +
                '</picture>'
            ;
        } else {
            if (!whiteBackground && basename === 'unity') {
                basename += '-white';
            }
            rendered +=
                '<img alt="' + program + ' icon." class="project-icon" height="24" src="' + url() + '" title="' + program + '" width="24">'
            ;
        }
    });

    return rendered;
}

/**
 * Prepare meta information for all documents.
 * @param {Object} vinyl - Virtual file of the currently processed Markdown document.
 * @return {undefined}
 */
function prepareMetaInfo(vinyl) {
    vinyl[options.property] = merge({
        asset:               asset,
        config:              config,
        description:         null,
        gallery:             [],
        index:               false,
        renderGalleryImages: renderGalleryImages,
        renderProgramIcons:  renderProgramIcons,
        route:               vinyl.path.replace(path.root, '').replace('.md', '').replace(/\\/g, '/'),
        siteName:            config.siteName,
        subtitle:            config.siteName,
        title:               config.siteName,
        titleSeparator:      config.titleSeparator,
        vimeo:               [],
        url:                 url
    }, vinyl[options.property]);
}

/**
 * Prepare meta information for index document.
 * @param {Object} vinyl - Virtual file of the currently processed Markdown document.
 * @return {undefined}
 */
function prepareIndexMetaInfo(vinyl) {
    vinyl[options.property].index           = true;
    vinyl[options.property].renderIndexTile = renderIndexTile;
    vinyl[options.property].route           = '/';
    vinyl[options.property].projects        = projects;
}

/**
 * Prepare meta information for project documents.
 * @param {Object} vinyl - Virtual file of the currently processed Markdown document.
 * @return {undefined}
 */
function prepareProjectMetaInfo(vinyl) {
    // The route still contains /project which we don't want.
    vinyl[options.property].route = vinyl[options.property].route.replace(/\/projects\/[0-9]{4}(-[0-9]{1,2}){0,2}~/, '/');

    // Get the index of this project in the projects array.
    for (var i = 0; i < projects.length; ++i) {
        if (projects[i].route === vinyl[options.property].route) {
            break;
        }
    }

    // Merge default properties with the ones defined in the project's file and the ones generated at the beginning.
    // Afterwards update all existing references to this object.
    projects[i] = vinyl[options.property] = merge({
        programs:    [],
        screenshots: [],
        tilePattern: '/images' + vinyl[options.property].route + '/tile.jpg',
        tilePrefix:  '/images' + vinyl[options.property].route + '/tile',
        work:        []
    }, vinyl[options.property], projects[i]);
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
gulp.task('html', ['html:markdown', 'html:markdown:index'], function () {
    return gulp.src(['src/**/*.html', 'tmp/**/*.html'])
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
        .pipe(gulp.dest('dist'));
});

// Process all non-special Markdown documents in the source directory.
gulp.task('html:markdown', function () {
    return gulp.src(['src/*.md', '!src/index.md'])
        .pipe(extractMetaInfo())
        .pipe(renderHTML())
        .pipe(gulp.dest('tmp'));
});

// Process the special index Markdown document.
gulp.task('html:markdown:index', ['html:markdown:projects'], function () {
    return gulp.src('src/index.md')
        .pipe(extractMetaInfo())
        .pipe($.tap(prepareIndexMetaInfo))
        .pipe(renderHTML())
        .pipe(gulp.dest('tmp'));
});

// Process all project Markdown documents.
gulp.task('html:markdown:projects', function () {
    // Prepare the projects array for linking of next/previous projects and the index page.
    if (projects.length === 0) {
        // Go through the projects directory and fill the array with the available information.
        glob.sync('src/projects/*.md').forEach(function (filePath) {
            var basename = path.basename(filePath, '.md').split('~');

            if (basename.length !== 2) {
                throw new $.util.PluginError(
                    'html:markdown:projects',
                    "A project's file name must contain the date and the title separated by a tilde (~) character."
                );
            }

            projects.push({
                date:     basename[0],
                next:     undefined,
                previous: undefined,
                route:    '/' + basename[1],
                year:     parseInt(basename[0].substring(0, 4))
            });
        });

        // Sort the projects in descending order.
        projects.sort(function (a, b) {
            return (b.date + b.route).localeCompare(a.date + a.route);
        });

        // Go through the array again and insert next/previous pointers.
        for (var i = 0, n = 1, p = -1; i < projects.length; ++i, ++n, ++p) {
            if (n in projects) {
                projects[i].next = projects[n];
            }
            if (p in projects) {
                projects[i].previous = projects[p];
            }
        }
    }

    // Render the projects.
    return gulp.src('src/projects/*.md')
        .pipe(extractMetaInfo())
        .pipe($.tap(prepareProjectMetaInfo))
        .pipe(renderHTML())
        .pipe($.rename(function (filePath) {
            filePath.basename = filePath.basename.split('~')[1];
            filePath.dirname  = '';
        }))
        .pipe(gulp.dest('tmp'));
});
