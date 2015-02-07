'use strict';

gulp.task('images', function gulpTaskImages() {
    var gallery = new ImagesTaskRunner('src/images/**/{gallery,screenshots}/*.{jpg,png}');
    var icons = new ImagesTaskRunner('src/images/icons/*.png');
    var logo = new ImagesTaskRunner('src/images/logo/icon.png');
    var tiles = new ImagesTaskRunner('src/images/**/tiles.jpg');

    gallery
        .setComparator(function (width, stream, callback, source, destination) {
            var extension = $.path.extname(source.path);

            $.fs.exists(source.path.replace(extension, '-tile' + extension), function (exists) {
                if (exists || $.imageSize(source.path).width > width) {
                    stream.push(source);
                    callback();
                } else {
                    $.changed.compareLastModifiedTime(stream, callback, source, destination);
                }
            });
        })
        .setHeightCallback(function (width) {
            return width / 16 * 9;
        })
        .setRenameCallback(function (width, filePath) {
            if (!filePath.basename.match(/-tile$/)) {
                filePath.basename += '-tile';
            }

            filePath.basename += '-' + width;
        })
    ;

    var streams = $.mergeStream(
        gallery.resizeWebp(1800),
        gallery.resizeWebp(1200),
        gallery.resizeWebp(900),
        gallery.resizeWebp(600),
        gallery.resizeWebp(450),
        gallery.resizeWebp(300),
        icons.resizeWebp(72),
        icons.resizeWebp(48),
        icons.resizeWebp(36),
        icons.resizeWebp(24),
        logo.resize(558),
        logo.resize(270),
        logo.resize(196),
        logo.resize(128),
        logo.resize(32),
        tiles.resizeWebp(1920),
        tiles.resizeWebp(1280),
        tiles.resizeWebp(960),
        tiles.resizeWebp(640),
        tiles.resizeWebp(480),
        tiles.resizeWebp(320)
    );

    if (config.dist) {
        streams.add(new ImagesTaskRunner('src/images/**/{gallery,screenshots}/*.{gif,jpg,png,svg}').copyOptimized());
    }

    return streams;
});

/**
 * Construct new image task runner instance.
 *
 * @constructor
 * @param {string} source - The image(s) source pattern which will be passed to gulp's src method.
 */
function ImagesTaskRunner(source) {
    this.destination = config.dest + '/images';
    this.imageminOptions = {
        interlaced: true,
        optimizationLevel: 7,
        progressive: true,
        quality: '65-80',
        svgoPlugins: [{ removeViewBox: false }],
        use: [$.imageminMozjpeg(), $.imageminPngquant()]
    };
    this.source = source;
}

ImagesTaskRunner.prototype = {

    /**
     * Copy source images to destination while optimizing without any further action.
     *
     * @return {stream}
     */
    copyOptimized: function () {
        return gulp.src(this.source, { base: 'src/images/' })
            .pipe($.plumber())
            .pipe($.imagemin(this.imageminOptions))
            .pipe(gulp.dest(this.destination))
            .pipe($.ignore.include(function (vinyl) {
                return $.path.extname(vinyl.path) === 'svg';
            }))
            .pipe($.compress())
            .pipe(gulp.dest(this.destination));
    },

    /**
     * Get gulp image resize options for given width and height.
     *
     * @method
     * @param {number} width - Width to resize the image to.
     * @return {{}}
     */
    getImageResizeOptions: function (width) {
        var height = this.heightCallback ? this.heightCallback(width) : width;
        return {
            crop: true,
            filter: 'Catrom',
            height: height,
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
            .pipe($.plumber())
            .pipe($.rename(this.renameCallback ? this.renameCallback.bind(null, width) : { suffix: '-' + width }))
            .pipe($.changed(this.destination), this.comparator ? { hasChanged: this.comparator.bind(null, width) } : {})
            .pipe($.concurrentTransform($.imageResize(this.getImageResizeOptions(width)), $.os.cpus().length))
            .pipe(config.dist ? $.imagemin(this.imageminOptions) : $.util.noop())
            .pipe(gulp.dest(this.destination));
    },

    /**
     * Resize the image and convert it to webp.
     *
     * @param {number} width - Width to resize the image to.
     * @return {stream}
     */
    resizeWebp: function (width) {
        return this.resize(width)
            .pipe($.webp())
            .pipe(gulp.dest(this.destination));
    },

    /**
     * Set a comparator for gulp changed.
     *
     * @param {Function} comparator - Comparator to set.
     * @return {ImagesTaskRunner}
     */
    setComparator: function (comparator) {
        this.comparator = comparator;
        return this;
    },

    setHeightCallback: function (callback) {
        this.heightCallback = callback;
        return this;
    },

    /**
     * Set a callback for gulp rename.
     *
     * @param {Function} callback - Callback to set.
     * @return {ImagesTaskRunner}
     */
    setRenameCallback: function (callback) {
        this.renameCallback = callback;
        return this;
    }

};
