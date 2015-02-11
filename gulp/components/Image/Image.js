'use strict';

var fs = require('fs');
var imageSize = require('image-size');
var path = require('path');
var text = require('./../text');
var util = require('util');

/**
 * Construct new image instance.
 *
 * @constructor
 * @param {string} title
 * @param {string} directory
 * @param {string} [extension]
 * @param {number} [width]
 * @param {number} [height]
 * @throws {TypeError} if title is empty or contains HTML.
 */
function Image(title, directory, extension, width, height) {
    var filename;

    if (!text.validNonEmptyString(title)) {
        throw new TypeError('Image title cannot be empty and must be of type string.');
    }
    if (text.containsHTML(title)) {
        throw new TypeError(util.format('Image title cannot contain HTML: "%s"', title));
    }
    filename = text.toFilename(title);

    if (!text.validNonEmptyString(directory)) {
        throw new TypeError('Image directory cannot be empty and must be of type string.');
    }
    if (directory.match(/\.[a-z]+$/)) {
        throw new TypeError(util.format('Image directory ends with a file extension: "%s"', directory));
    }
    directory = '/images' + directory;

    if (!extension) {
        ['gif', 'jpg', 'png', 'svg'].some(function (ext) {
            var fsPath = path.resolve(util.format('%s/%s.%s', config.dest + directory, filename, ext));
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
            throw new Error(util.format('Could not determine extension for: "%s/%s.?"', config.dest + directory, filename));
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
        highDpiFactors: {
            enumerable: true,
            value: Object.freeze([1.5, 2, 3])
        },
        isVector: {
            enumerable: true,
            value: extension === 'svg'
        },
        path: {
            enumerable: true,
            value: util.format('%s/%s', directory, filename)
        },
        sourcePath: {
            enumerable: true,
            get: this.__sourcePath.bind(this, filename, extension, directory)
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
     * Get the absolute path to the image's source file.
     *
     * @private
     * @method
     * @param {string} filename
     * @param {string} extension
     * @param {string} directory
     * @return {string}
     */
    __sourcePath: function (filename, extension, directory) {
        if (!this.__sourcePath.path) {
            this.__sourcePath.path = path.resolve(util.format('src%s/%s.%s', directory, filename, extension));
        }

        return this.__sourcePath.path;
    },

    /**
     * Get the image's source URL.
     *
     * @method
     * @param {number} [width]
     * @param {string} [type]
     * @return {string}
     */
    src: function (width, type) { // jshint ignore:line
        throw new Error('Must be implemented by child object.');
    },

    /**
     * Get the image's source set URLs.
     *
     * @method
     * @param {string} [type]
     * @return {string}
     */
    srcSet: function (type) { // jshint ignore:line
        throw new Error('Must be implemented by child object.');
    }

};

module.exports = Image;
