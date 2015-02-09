'use strict';

var concurrentTransform = require('concurrent-transform');
var gulpCached = require('gulp-cached');
var gulpChanged = require('gulp-changed');
var gulpImagemin = require('gulp-imagemin');
var gulpImageResize = require('gulp-image-resize');
var gulpPlumber = require('gulp-plumber');
var gulpUtil = require('gulp-util');
var gulpWebp = require('gulp-webp');
var imageminMozjpeg = require('imagemin-mozjpeg');
var imageminPngquant = require('imagemin-pngquant');
var through = require('through2');
var os = require('os');

var imageminOptions = {
    interlaced: true,
    optimizationLevel: 7,
    progressive: true,
    quality: '65-80',
    svgoPlugins: [{ removeViewBox: false }],
    use: [imageminMozjpeg(), imageminPngquant()]
};

/**
 * Construct new image task runner instance.
 *
 * @constructor
 * @param {string} source - The glob pattern for the source files.
 */
function ImageTaskRunner(source) {
    var comparator;
    var heightCallback;
    var renameCallback;

    Object.defineProperties(this, {
        comparator: {
            get: function () {
                return comparator;
            },
            set: function (value) {
                if (typeof value !== 'function') {
                    throw new TypeError('Comparator must be a function.');
                }
                comparator = value;
            }
        },
        heightCallback: {
            get: function () {
                return heightCallback;
            },
            set: function (value) {
                if (typeof value !== 'function') {
                    throw new TypeError('Height callback must be a function.');
                }
                heightCallback = value;
            }
        },
        renameCallback: {
            get: function () {
                return renameCallback;
            },
            set: function (value) {
                if (typeof value !== 'function') {
                    throw new TypeError('Rename callback must be a function.');
                }
                renameCallback = value;
            }
        },
        source: {
            enumerable: true,
            value: source
        }
    });
}

ImageTaskRunner.prototype = {

    /**
     * Get gulp image resize options for given width and height.
     *
     * @method
     * @param {number} width - Width to resize the image to.
     * @return {{}}
     */
    imageResizeOptions: function (width) {
        return {
            crop: true,
            filter: 'Catrom',
            height: this.heightCallback ? this.heightCallback(width) : width,
            imageMagick: config.imageMagick,
            quality: 1,
            sharpen: true,
            width: width
        };
    },

    /**
     * Rename file for changed and final destination.
     *
     * @param {File} file
     * @param {number} width
     * @return {string}
     */
    rename: function (file, width) {
        file.path = file.path.replace(/(\.[a-z]+)$/, '-' + width + '$1');

        if (this.renameCallback) {
            file.path = this.renameCallback(file.path, width);
        }

        return config.dest;
    },

    /**
     * Resize the image.
     *
     * @param {number} width - Width to resize the image to.
     * @return {stream}
     */
    resize: function (width) {
        var gulpChangedOptions = { pattern: ['gulp/components/ImageTaskRunner.js', 'gulp/tasks/images.js'] };
        var self = this;

        if (this.comparator) {
            gulpChangedOptions.hasChanged = this.comparator.bind(null, width);
        }

        return gulp.src(this.source, { base: 'src/' })
            .pipe(gulpPlumber())
            .pipe(gulpChanged(function (file) {
                return self.rename(file, width);
            }, gulpChangedOptions))
            .pipe(gulpCached('images-' + width))
            .pipe(concurrentTransform(gulpImageResize(this.imageResizeOptions(width)), os.cpus().length))
            .pipe(config.dist ? gulpImagemin(imageminOptions) : gulpUtil.noop())
            .pipe(through.obj(function (file, enc, cb) {
                self.rename(file, width);
                this.push(file);
                cb();
            }))
            .pipe(gulp.dest(config.dest));
    },

    /**
     * Resize the image and convert it to webp.
     *
     * @param {number} width - Width to resize the image to.
     * @return {stream}
     */
    resizeWebp: function (width) {
        return this.resize(width)
            .pipe(gulpWebp())
            .pipe(gulp.dest(config.dest));
    }

};

module.exports = ImageTaskRunner;
module.exports.imageminOptions = imageminOptions;
