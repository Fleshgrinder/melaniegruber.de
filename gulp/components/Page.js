'use strict';

var GalleryImage = require('./GalleryImage');
var path = require('path');
var text = require('./text');
var url = require('./url');
var util = require('util');

/**
 * Construct new page instance.
 *
 * @constructor
 * @param {File} file
 * @param {{}} data
 */
function Page(file, data) {
    var gallery;
    var self = this;

    if (!data.title || data.title.length === 0) {
        throw new TypeError(util.format('Title is mandatory: %s', file.relative));
    }
    if (text.containsHTML(data.title)) {
        throw new TypeError(util.format('Title cannot contain HTML: %s', file.relative));
    }

    if (!data.description || data.description.length === 0) {
        throw new TypeError(util.format('Description is mandatory: %s', file.relative));
    }
    if (data.description.length > 155) {
        throw new TypeError(util.format('Description cannot be longer than 155 characters: %s', file.relative));
    }
    if (text.containsHTML(data.description)) {
        throw new TypeError(util.format('Description cannot contain HTML: %s', file.relative));
    }

    Object.defineProperties(this, {
        description: {
            enumerable: true,
            value: data.description
        },
        fontSize: {
            enumerable: true,
            value: 18
        },
        gallery: {
            enumerable: true,
            value: !!data.gallery
        },
        image: {
            enumerable: true,
            get: this.__getImage
        },
        index: {
            enumerable: true,
            value: data.index || false
        },
        layout: {
            enumerable: true,
            value: data.layout || 'default'
        },
        route: {
            enumerable: true,
            value: data.route || '/' + path.basename(file.path, '.md')
        },
        subtitle: {
            enumerable: true,
            value: data.subtitle || config.siteName
        },
        title: {
            enumerable: true,
            value: data.title
        },
        titleSeparator: {
            enumerable: true,
            value: data.titleSeparator || config.titleSeparator
        }
    });

    // Export URL to file for direct access in EJS.
    file.url = url;

    /**
     * Get the page's gallery images.
     *
     * @method
     * @return {GalleryImage[]}
     */
    this.getGalleryImages = function () {
        if (!gallery && self.gallery) {
            gallery = [];
            for (var i = 0, l = data.gallery.length; i < l; ++i) {
                gallery.push(new GalleryImage(data.gallery[i], self.route));
            }
        }

        return gallery || [];
    };
}

/**
 * Get the page's representative image (e.g. for Facebook).
 *
 * @private
 * @return {string}
 */
Page.prototype.__getImage = function () {
    if (this.gallery) {
        var gallery = this.getGalleryImages();
        for (var i = 0, l = gallery.length; i < l; ++i) {
            if (!gallery[i].isVector) {
                return gallery[i].src(320);
            }
        }
    }

    return url.asset('/images/logo/icon-270.png');
};

module.exports = Page;
