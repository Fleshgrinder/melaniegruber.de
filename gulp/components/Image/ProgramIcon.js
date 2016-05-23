'use strict';

var Image = require('./Image');
var url = require('./../url');
var util = require('util');

/**
 * Construct new program icon instance.
 *
 * @constructor
 * @param {string} title
 * @param {boolean} index
 */
function ProgramIcon(title) {
    var format = 'svg';
    if (title.match(/(?:autodesk|nuke)/i) !== null) {
        format = 'png';
    }

    ProgramIcon.super_.call(this, title, '/icons', format, 24);
}

util.inherits(ProgramIcon, Image);

/**
 * Get the program icon's source URL.
 *
 * @method
 * @param {boolean} index
 * @param {number} [width]
 * @param {string} [type]
 * @return {string}
 */
ProgramIcon.prototype.src = function (index, width, type) {
    if (this.isVector) {
        if (index && this.path.match(/unity$/)) {
            return url.asset(this.path + '-white.' + this.extension);
        }

        return url.asset(this.path + '.' + this.extension, this.sourcePath);
    }

    width = width || this.width;
    type = type || this.extension;

    return url.asset(this.path + '-' + width + '.' + type, this.sourcePath);
};

/**
 * Get the image's source set URLs.
 *
 * @method
 * @param {boolean} index
 * @param {string} [type]
 * @return {string}
 */
ProgramIcon.prototype.srcSet = function (index, type) {
    var self = this;
    var srcSet = [];

    index = index || false;

    if (this.isVector) {
        throw new Error('This is a vector image and therefore has no source set.');
    }

    type = type || this.extension;

    this.highDpiFactors.forEach(function (factor) {
        srcSet.push(self.src(index, self.width * factor, type) + ' ' + factor + 'x');
    });

    if (type === 'webp') {
        srcSet.unshift(self.src(index, self.width, type));
    }

    return srcSet.join(', ');
};

module.exports = ProgramIcon;
