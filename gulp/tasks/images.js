'use strict';

var compress = require('../components/compress');
var gulpChanged = require('gulp-changed');
var gulpImagemin = require('gulp-imagemin');
var gulpPlumber = require('gulp-plumber');
var gulpUtil = require('gulp-util');
var imageSize = require('image-size');
var ImageTaskRunner = require('../components/ImageTaskRunner');
var mergeStream = require('merge-stream');
var plumberErrorHandler = require('../components/plumber-error-handler');
var ProjectPage = require('../components/Page/ProjectPage');
var through = require('through2');

var imageTaskGallery = new ImageTaskRunner('src/{images,projects}/**/{gallery,screenshots}/*.{jpg,png}');
var imageTaskIcons = new ImageTaskRunner('src/images/icons/*.png');
var imageTaskIndexTiles = new ImageTaskRunner('src/projects/*/tile.jpg');
var imageTaskLogos = new ImageTaskRunner('src/images/logo/icon.png');

/**
 * Gulp changed comparator for gallery images.
 *
 * Source rejected if:
 * - Source width is smaller than requested width.
 * - Destination exists and is up to date (mtime).
 *
 * @param {number} width
 * @param {Stream} stream
 * @param {Function} callback
 * @param {File} source
 * @param {string} destination
 * @param {Array|string} pattern
 * @param {boolean|undefined} noTileSourceExists
 * @return {undefined}
 */
imageTaskGallery.comparator = function imageTaskGalleryComparator(width, stream, callback, source, destination, pattern) {
    imageSize(source.path, function (error, dimensions) {
        if (error) {
            throw new gulpUtil.PluginError(__filename, error, { file: source.path });
        }

        if (dimensions.width > width) {
            gulpChanged.compareLastModifiedTime(stream, callback, source, destination, pattern);
        } else {
            callback();
        }
    });
};

imageTaskGallery.heightCallback = function (width) {
    return width / 16 * 9;
};

imageTaskGallery.renameCallback = function (path, width) {
    path = ProjectPage.normalizeImagePath(path);
    if (!path.match('-tile')) {
        path.replace(new RegExp('(-' + width + '.[a-z]+)$'), '-tile$1');
    }

    return path;
};

imageTaskIndexTiles.renameCallback = ProjectPage.normalizeImagePath;

module.exports = function () {
    var streams = mergeStream(
        imageTaskGallery.resizeWebp(1800),
        imageTaskGallery.resizeWebp(1200),
        imageTaskGallery.resizeWebp(900),
        imageTaskGallery.resizeWebp(600),
        imageTaskGallery.resizeWebp(450),
        imageTaskGallery.resizeWebp(300),
        imageTaskIcons.resizeWebp(72),
        imageTaskIcons.resizeWebp(48),
        imageTaskIcons.resizeWebp(36),
        imageTaskIcons.resizeWebp(24),
        imageTaskLogos.resize(558),
        imageTaskLogos.resize(270),
        imageTaskLogos.resize(196),
        imageTaskLogos.resize(128),
        imageTaskLogos.resize(32),
        imageTaskIndexTiles.resizeWebp(1920),
        imageTaskIndexTiles.resizeWebp(1280),
        imageTaskIndexTiles.resizeWebp(960),
        imageTaskIndexTiles.resizeWebp(640),
        imageTaskIndexTiles.resizeWebp(480),
        imageTaskIndexTiles.resizeWebp(320),
        gulp.src('src/{images,projects}/**/{gallery,screenshots}/*.{gif,jpg,png}')
            .pipe(gulpPlumber(plumberErrorHandler('Images Copy Gallery')))
            .pipe(gulpChanged(config.dest))
            .pipe(through.obj(function (file, enc, cb) {
                file.path = ProjectPage.normalizeImagePath(file.path);
                this.push(file);
                cb();
            }))
            .pipe(config.dist ? gulpImagemin(ImageTaskRunner.imageminOptions) : gulpUtil.noop())
            .pipe(gulp.dest(config.dest))
    );

    if (config.dist) {
        streams.add(
            gulp.src('src/**/*.svg')
                .pipe(gulpPlumber(plumberErrorHandler('Images Copy SVG')))
                .pipe(gulpChanged(config.dest))
                .pipe(gulpImagemin(ImageTaskRunner.imageminOptions))
                .pipe(gulp.dest(config.dest))
                .pipe(compress())
        );
    }

    return streams;
};
