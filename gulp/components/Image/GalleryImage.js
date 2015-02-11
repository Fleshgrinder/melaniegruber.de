'use strict';

var fs = require('fs');
var Image = require('./Image');
var path = require('path');
var util = require('util');
var url = require('./../url');

/**
 * Construct new gallery image.
 *
 * @constructor
 * @param {string} title
 * @param {Page} page
 */
function GalleryImage(title, page) {
    this.__page = page;
    GalleryImage.super_.call(this, title, page.route + '/' + this.getType());
}

util.inherits(GalleryImage, Image);

/**
 * @inheritDoc
 */
GalleryImage.prototype.__sourcePath = function (filename, extension, directory) {
    if (!this.__sourcePath.path) {
        if (this.__page instanceof require('../Page/ProjectPage')) {
            this.__sourcePath.path = path.normalize(util.format('%s/%s/%s.%s', path.dirname(this.__page.sourcePath), this.getType(), filename, extension));
        } else {
            this.__sourcePath.path = GalleryImage.super_.prototype.__sourcePath.call(this, filename, extension, directory);
        }
    }

    return this.__sourcePath.path;
};

/**
 * Get the gallery image's type.
 *
 * @method
 * @return {string}
 */
GalleryImage.prototype.getType = function () {
    return 'gallery';
};

/**
 * @inheritDoc
 */
GalleryImage.prototype.src = function (width, type) {
    if (this.isVector) {
        return url.asset(this.path + '.' + this.extension, this.sourcePath);
    }

    type = type || this.extension;

    if (width) {
        var widths = ['-tile-' + width, '-tile', '-' + width];
        width = '';

        for (var i = 0, l = widths.length; i < l; ++i) {
            try {
                if (fs.statSync(path.resolve(config.dest + this.path + widths[i] + '.' + type))) {
                    width = widths[i];
                    break;
                }
            } catch (error) {
                // Intentionally left blank, fs.exists will be deprecated!
            }
        }
    }

    width = width || '';

    return url.asset(this.path + width + '.' + type, this.sourcePath);
};

/**
 * @inheritDoc
 */
GalleryImage.prototype.srcSet = function (type) {
    var self = this;
    var srcSet;

    if (this.isVector) {
        throw new Error('This is a vector image and therefore has no source set.');
    }

    if (this.extension === 'gif' && type === 'webp') {
        throw new Error('GIFs are only used for animated images and have no alternative formats like WEBP.');
    }

    type = type || this.extension;

    if (type === 'webp') {
        srcSet = [];
        [300, 450, 600, 900, 1200, 1800].forEach(function (size) {
            srcSet.push(self.src(size, type) + ' ' + size + 'w');
        });

        return srcSet.join(', ');
    }

    srcSet = [[], []];
    [[450, 600, 900], [900, 1200, 1800]].forEach(function (sizes, i) {
        var base = sizes[0] / 1.5;
        sizes.forEach(function (size) {
            srcSet[i].push(self.src(size, type) + ' ' + size / base + 'x');
        });
        srcSet[i] = srcSet[i].join(', ');
    });

    return srcSet;
};

module.exports = GalleryImage;
