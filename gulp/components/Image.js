'use strict';

var fs = require('fs');
var imageSize = require('image-size');
var path = require('path');
var text = require('./text');

/**
 * Construct new image instance.
 *
 * @constructor
 * @param {string} title
 * @param {string} imagePath
 * @param {string} [extension]
 * @param {number} [width]
 * @param {number} [height]
 * @throws {TypeError} if title is empty or contains HTML.
 */
function Image(title, imagePath, extension, width, height) {
    if (!title || title === '') {
        throw new TypeError('Program icon title cannot be empty.');
    }
    if (text.containsHTML(title)) {
        throw new TypeError('Program icon title cannot contain HTML.');
    }
    imagePath += text.toFilename(title);

    if (!extension) {
        ['gif', 'jpg', 'png', 'svg'].some(function (ext) {
            var fsPath = path.resolve(config.dest + imagePath + '.' + ext);
            try {
                if (!width) {
                    var dimensions = imageSize(fsPath);
                    width = dimensions.width;
                    height = dimensions.height;
                } else {
                    fs.statSync(fsPath);
                }
                extension = ext;
                return true;
            } catch (error) {
                return false;
            }
        });

        if (!extension) {
            throw new Error('Could not determine extension for: ' + imagePath);
        }
    }

    Object.defineProperties(this, {
        extension: {
            enumerable: true,
            value: extension
        },
        height: {
            enumerable: true,
            // jshint bitwise:false
            value: (height || width) >>> 0
            // jshint bitwise:true
        },
        isVector: {
            enumerable: true,
            value: extension === 'svg'
        },
        path: {
            enumerable: true,
            value: imagePath
        },
        title: {
            enumerable: true,
            value: title
        },
        width: {
            enumerable: true,
            // jshint bitwise:false
            value: width >>> 0
            // jshint bitwise:true
        }
    });
}

Image.prototype = {

    /**
     * Get the image's source URL.
     *
     * @method
     * @param {number} [width]
     * @param {string} [type]
     * @return {string}
     */
    src: function (width, type) {
        throw new Error('Must be implemented by child object.');
    },

    /**
     * Get the image's source set URLs.
     *
     * @method
     * @param {string} [type]
     * @return {string}
     */
    srcSet: function (type) {
        throw new Error('Must be implemented by child object.');
    }

};

module.exports = Image;
