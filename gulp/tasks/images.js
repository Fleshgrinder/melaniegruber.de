'use strict';

var fs = require('fs');
var gulpChanged = require('gulp-changed');
var imageSize = require('image-size');
var ImageTaskRunner = require('../components/ImageTaskRunner');
var mergeStream = require('merge-stream');
var path = require('path');
var ProjectPage = require('../components/ProjectPage');

var imageTaskCopy = new ImageTaskRunner('src/{images,projects}/**/{gallery,screenshots}/*.{gif,jpg,png,svg}');
var imageTaskGallery = new ImageTaskRunner('src/{images,projects}/**/{gallery,screenshots}/*.{jpg,png}');
var imageTaskIcons = new ImageTaskRunner('src/images/icons/*.png');
var imageTaskIndexTiles = new ImageTaskRunner('src/projects/*/tile.jpg');
var imageTaskLogos = new ImageTaskRunner('src/images/logo/icon.png');

imageTaskCopy.renameCallback = function (path) {
    path.dirname = ProjectPage.normalizeImagePath(path.dirname);
};

imageTaskGallery.comparator = function (width, stream, callback, source, destination) {
    var extension = path.extname(source.path);

    fs.exists(source.path.replace(extension, '-tile' + extension), function (exists) {
        if (exists || imageSize(source.path).width > width) {
            stream.push(source);
            callback();
        } else {
            gulpChanged.compareLastModifiedTime(stream, callback, source, destination);
        }
    });
};

imageTaskGallery.heightCallback = function (width) {
    return width / 16 * 9;
};

imageTaskGallery.renameCallback = function (width, path) {
    if (path.dirname.match('projects')) {
        path.dirname = ProjectPage.normalizeImagePath(path.dirname);
    }

    if (!path.basename.match(/-tile$/)) {
        path.basename += '-tile';
    }

    path.basename += '-' + width;
};

imageTaskIndexTiles.renameCallback = function (width, path) {
    path.dirname = ProjectPage.normalizeImagePath(path.dirname);
    path.basename += '-' + width;
};

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
        imageTaskIndexTiles.resizeWebp(320)
    );

    if (config.dist) {
        streams.add(imageTaskCopy.copyOptimized());
    }

    return streams;
};
