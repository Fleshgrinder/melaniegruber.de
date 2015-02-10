'use strict';

var compress = require('../components/compress');
var fs = require('fs');
var gulpChanged = require('gulp-changed');
var gulpImagemin = require('gulp-imagemin');
var gulpPlumber = require('gulp-plumber');
var gulpUtil = require('gulp-util');
var imageSize = require('image-size');
var ImageTaskRunner = require('../components/ImageTaskRunner');
var mergeStream = require('merge-stream');
var ProjectPage = require('../components/ProjectPage');
var through = require('through2');

var cache = {};
var imageTaskGalleryGlobPattern = 'src/{images,projects}/**/{gallery,screenshots}/*.{jpg,png}';

var imageTaskGallery = new ImageTaskRunner(imageTaskGalleryGlobPattern);
var imageTaskIcons = new ImageTaskRunner('src/images/icons/*.png');
var imageTaskIndexTiles = new ImageTaskRunner('src/projects/*/tile.jpg');
var imageTaskLogos = new ImageTaskRunner('src/images/logo/icon.png');

imageTaskGallery.comparator = function imageTaskGalleryComparator(width, stream, callback, source, destination, pattern, noTile) {
    function push(really) {
        cache[source.path] = really;
        if (really) {
            stream.push(source);
        }
        callback();
    }

    if (source.path in cache) {
        return push(cache[source.path]);
    }

    if (noTile || source.path.match('-tile')) {
        imageSize(source.path, function (error, dimensions) {
            if (error) {
                throw error;
            }

            if (dimensions.width > width) {
                destination = ProjectPage.normalizeImagePath(destination);
                fs.stat(destination, function (error, stat) {
                    push(!!error || source.stat.mtime > stat.mtime);
                });
            } else {
                push(false);
            }
        });
    } else {
        // Only consider using this non-tile suffixed file if no file with the suffix exists. Note that fs.exists will
        // be deprecated in the future!
        fs.stat(source.path.replace(/(\.[a-z]+)$/, '-tile$1'), function (error) {
            if (error) {
                push(false);
            } else {
                imageTaskGalleryComparator(width, stream, callback, source, destination, pattern, true);
            }
        });
    }
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
    cache = {};

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
        gulp.src(imageTaskGalleryGlobPattern)
            .pipe(gulpPlumber())
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
                .pipe(gulpPlumber())
                .pipe(gulpChanged(config.dest))
                .pipe(gulpImagemin(ImageTaskRunner.imageminOptions))
                .pipe(gulp.dest(config.dest))
                .pipe(compress())
        );
    }

    return streams;
};
