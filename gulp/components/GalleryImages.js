'use strict';

var url = require('./url');
var fs = require('fs');
var path = require('path');
var imageSize = require('image-size');

/**
 * Construct new gallery images instance.
 *
 * @constructor
 * @param {string} [type] - The gallery's type, defaults to `gallery`.
 */
function GalleryImages(type) {
    this.type = type || 'gallery';
}

/**
 * Get gallery image URL.
 *
 * @private
 * @method
 * @param {number|string} [suffix] - Suffix to append, usually the width.
 * @param {string} [extension] - Extension for the web, only if it differs from the gallery image's extension.
 * @return {string} The gallery image's URL.
 */
GalleryImages.prototype.__url = function galleryImagesURL(suffix, extension) {
    extension = extension || this.__extension;

    if (suffix) {
        var suffixes = ['-tile-' + suffix, '-tile'];
        suffix = '';

        for (var i = 0, l = suffixes.length; i < l; ++i) {
            if (fs.existsSync(path.resolve('dist' + this.__path + suffixes[i] + '.' + extension))) {
                suffix = suffixes[i];
                break;
            }
        }
    }

    suffix = suffix || '';

    return url.asset(this.__path + suffix + '.' + extension, this.__path + '.' + this.__extension);
};

/**
 * Get the string representation of the gallery.
 *
 * @method
 * @return {string} The string representation of the gallery.
 */
GalleryImages.prototype.toString = function galleryImagesToString() {
    var extensions = ['gif', 'jpg', 'png', 'svg'];
    var rendered = '';
    var self = this;

    page.galleryIndex = page.galleryIndex || 0;

    page[this.type].forEach(function (title) {
        self.__path = '/images' + page.route + '/' + self.type + '/' + title.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-_]/g, '');

        self.__extension = '';
        for (var i = 0, l = extensions.length; i < l; ++i) {
            if (fs.existsSync(path.resolve('src' + self.__path + '.' + extensions[i]))) {
                self.__extension = extensions[i];
                break;
            }
        }

        if (self.__extension === '') {
            throw new Error('Could not find extension for ' + self.__path);
        }

        /**
         * @type {{height:number,width:number}}
         */
        var size = imageSize(path.resolve('src' + self.__path + '.' + self.__extension));


        rendered +=
            '<a class="img-anchor media-element" ' +
                'data-height="' + size.height + '" ' +
                'data-index="' + page.galleryIndex + '" ' +
                'data-width="' + size.width + '" ' +
                'href="' + self.__url() + '" ' +
                'id="media-element-' + page.galleryIndex + '" ' +
                'target="_blank">'
        ;

        if (self.__extension === 'svg') {
            rendered += '<img alt="' + title + '" height="338" src="' + self.__url() + '" width="600">';
        } else {
            rendered += '<picture>';

            if (self.__extension !== 'gif') {
                rendered +=
                    '<source sizes="(min-width: ' + 320 / 16 + 'em) 600px, 100vw" srcset="' +
                        self.__url(300, 'webp') + ' 300w, ' +
                        self.__url(450, 'webp') + ' 450w, ' +
                        self.__url(600, 'webp') + ' 600w, ' +
                        self.__url(900, 'webp') + ' 900w, ' +
                        self.__url(1200, 'webp') + ' 1200w, ' +
                        self.__url(1800, 'webp') + ' 1800w" type="image/webp">'
                ;
            }

            rendered +=
                '<img alt="' + title + '" height="338" src="' + self.__url(600) + '" srcset="' +
                    self.__url(900) + ' 1.5x, ' +
                    self.__url(1200) + ' 2x, ' +
                    self.__url(1800) + ' 3x" width="600">' +
                '</picture>'
            ;
        }

        // Be sure to close the opened media element wrapper tag.
        rendered += '</a>';

        // Increase the global counter for the next image (no matter which gallery type).
        ++page.galleryIndex;
    });

    return rendered;
};

module.exports = GalleryImages;
