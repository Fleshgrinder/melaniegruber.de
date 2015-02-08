'use strict';

var compress = require('./compress');
var concurrentTransform = require('concurrent-transform');
var gulpChanged = require('gulp-changed');
var gulpIgnore = require('gulp-ignore');
var gulpImagemin = require('gulp-imagemin');
var gulpImageResize = require('gulp-image-resize');
var gulpPlumber = require('gulp-plumber');
var gulpRename = require('gulp-rename');
var gulpRename = require('gulp-rename');
var gulpUtil = require('gulp-util');
var gulpWebp = require('gulp-webp');
var imageminMozjpeg = require('imagemin-mozjpeg');
var imageminPngquant = require('imagemin-pngquant');
var os = require('os');
var path = require('path');

var destination = config.dest + '/images';

var imageminOptions = {
    value: {
        interlaced: true,
        optimizationLevel: 7,
        progressive: true,
        quality: '65-80',
        svgoPlugins: [{ removeViewBox: false }],
        use: [imageminMozjpeg(), imageminPngquant()]
    }
};

/**
 * Construct new image task runner instance.
 *
 * @constructor
 * @param {string} source - The glob pattern for the source files.
 */
function ImageTaskRunner(source) {
    this.comparator = null;
    this.heightCallback = null;
    this.renameCallback = null;
    this.source = source;
}

ImageTaskRunner.prototype = {

    /**
     * Copy source images to destination while optimizing without any further action.
     *
     * @return {stream}
     */
    copyOptimized: function () {
        return gulp.src(this.source, { base: 'src/images/' })
            .pipe(gulpPlumber())
            .pipe(this.renameCallback ? gulpRename(this.renameCallback) : gulpUtil.noop())
            .pipe(gulpChanged(destination))
            .pipe(gulpImagemin(imageminOptions))
            .pipe(gulp.dest(destination))
            .pipe(gulpIgnore.include(function (file) {
                return path.extname(file.path) === 'svg';
            }))
            .pipe(compress())
            .pipe(gulp.dest(destination));
    },

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
            imageMagick: true,
            quality: 1,
            sharpen: true,
            width: width
        };
    },

    /**
     * Resize the image.
     *
     * @param {number} width - Width to resize the image to.
     * @return {stream}
     */
    resize: function (width) {
        return gulp.src(this.source, { base: 'src/images/' })
            .pipe(gulpPlumber())
            .pipe(gulpRename(this.renameCallback ? this.renameCallback.bind(null, width) : { suffix: '-' + width }))
            .pipe(gulpChanged(destination), this.comparator ? { hasChanged: this.comparator.bind(null, width) } : {})
            .pipe(concurrentTransform(gulpImageResize(this.imageResizeOptions(width)), os.cpus().length))
            .pipe(config.dist ? gulpImagemin(imageminOptions) : gulpUtil.noop())
            .pipe(gulp.dest(destination));
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
            .pipe(gulp.dest(destination));
    }

};

module.exports = ImageTaskRunner;
