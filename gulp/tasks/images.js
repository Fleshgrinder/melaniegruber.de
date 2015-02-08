'use strict';

gulp.task('images', function gulpTaskImages() {
    var ProjectPage = require('../components/ProjectPage');
    var gallery = new ImagesTaskRunner('src/{images,projects}/**/{gallery,screenshots}/*.{jpg,png}');
    var icons = new ImagesTaskRunner('src/images/icons/*.png');
    var logo = new ImagesTaskRunner('src/images/logo/icon.png');
    var indexTiles = new ImagesTaskRunner('src/projects/*/tile.jpg');

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
        .setRenameCallback(function (width, path) {
            if (path.dirname.match('projects')) {
                path.dirname = ProjectPage.normalizeImagePath(path.dirname);
            }

            if (!path.basename.match(/-tile$/)) {
                path.basename += '-tile';
            }

            path.basename += '-' + width;
        })
    ;

    indexTiles.setRenameCallback(function (width, path) {
        path.dirname = ProjectPage.normalizeImagePath(path.dirname);
        path.basename += '-' + width;
    });

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
        indexTiles.resizeWebp(1920),
        indexTiles.resizeWebp(1280),
        indexTiles.resizeWebp(960),
        indexTiles.resizeWebp(640),
        indexTiles.resizeWebp(480),
        indexTiles.resizeWebp(320)
    );

    if (config.dist) {
        streams.add(new ImagesTaskRunner('src/{images,projects}/**/{gallery,screenshots}/*.{gif,jpg,png,svg}')
            .setRenameCallback(function (path) {
                path.dirname = ProjectPage.normalizeImagePath(path.dirname);
            })
            .copyOptimized()
        );
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
    Object.defineProperties(this, {
        destination: {
            value: config.dest + '/images'
        },
        imageminOptions: {
            value: {
                interlaced: true,
                optimizationLevel: 7,
                progressive: true,
                quality: '65-80',
                svgoPlugins: [{ removeViewBox: false }],
                use: [$.imageminMozjpeg(), $.imageminPngquant()]
            }
        },
        source: {
            value: source
        }
    });
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
            .pipe(this.renameCallback ? $.rename(this.renameCallback) : $.util.noop())
            .pipe($.changed(this.destination))
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
        if (typeof comparator !== 'function') {
            throw new InvalidArgumentError('Comparator must be a function.');
        }
        Object.defineProperty(this, 'comparator', {
            value: comparator
        });
        return this;
    },

    setHeightCallback: function (callback) {
        if (typeof callback !== 'function') {
            throw new InvalidArgumentError('Height callback must be a function.');
        }
        Object.defineProperty(this, 'heightCallback', {
            value: callback
        });
        return this;
    },

    /**
     * Set a callback for gulp rename.
     *
     * @param {Function} callback - Callback to set.
     * @return {ImagesTaskRunner}
     */
    setRenameCallback: function (callback) {
        if (typeof callback !== 'function') {
            throw new InvalidArgumentError('Rename callback must be a function.');
        }
        Object.defineProperty(this, 'renameCallback', {
            value: callback
        });
        return this;
    }

};
