'use strict';

var fs = require('fs');
var Image = require('./Image');
var imageSize = require('image-size');
var path = require('path');
var util = require('util');
var url = require('./url');

/**
 * Construct new gallery image.
 *
 * @constructor
 * @param {string} title
 * @param {Page} page
 */
function GalleryImage(title, page) {
    var dimensions;
    var extension;
    var imagePath;
    var self = this;

    this.__image = new Image(title);
    this.__type = this.__type || 'gallery';

    ['gif', 'jpg', 'png', 'svg'].some(function (ext) {
        try {
            imagePath = page.imagePath + self.__type + '/' + self.__image.basename;
            dimensions = imageSize(path.resolve('src' + imagePath + '.' + ext));
            extension = ext;
            return true;
        } catch (error) {
            return false;
        }
    });

    if (!dimensions) {
        throw new Error(util.format('Could not determine dimensions for "%s".', imagePath));
    }
    delete this.__image;

    GalleryImage.super_.call(this, title, extension, dimensions.width, dimensions.height);
    Object.defineProperty(this, 'path', {
        enumerable: true,
        value: imagePath
    });
}

util.inherits(GalleryImage, Image);

/**
 * @inheritDoc
 */
GalleryImage.prototype.src = function (width, type) {
    if (this.isVector) {
        return url.asset(this.path + '.' + this.extension);
    }

    type = type || this.extension;

    if (width) {
        var widths = ['-tile-' + width, '-tile'];
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

    return url.asset(
        this.path + width + '.' + type,
        this.path + '.' + this.extension
    );
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
        srcSet[i].join(', ');
    });

    return srcSet;
};

module.exports = GalleryImage;
