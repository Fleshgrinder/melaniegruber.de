'use strict';

var text = require('./text');

/**
 * Construct new image instance.
 *
 * @constructor
 * @param {string} title
 * @param {string} extension
 * @param {number} [width]
 * @param {number} [height]
 * @throws {TypeError} if title is empty or contains HTML.
 */
function Image(title, extension, width, height) {
    if (!title || title === '') {
        throw new TypeError('Program icon title cannot be empty.');
    }
    if (text.containsHTML(title)) {
        throw new TypeError('Program icon title cannot contain HTML.');
    }

    Object.defineProperties(this, {
        basename: {
            enumerable: true,
            value: text.toFilename(title)
        },
        extension: {
            enumerable: true,
            value: extension
        },
        height: {
            enumerable: true,
            value: parseInt(height || width, 10)
        },
        isVector: {
            enumerable: true,
            value: extension === 'svg'
        },
        title: {
            enumerable: true,
            value: title
        },
        width: {
            enumerable: true,
            value: parseInt(width, 10)
        }
    });
}

Image.prototype = {

    /**
     * Get the image's source URL.
     *
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
     * @param {string} [type]
     * @return {string}
     */
    srcSet: function (type) {
        throw new Error('Must be implemented by child object.');
    }

};

module.exports = Image;
