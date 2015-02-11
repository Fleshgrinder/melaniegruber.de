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
    ProgramIcon.super_.call(this, title, '/icons', title.split(' ')[0] === 'Autodesk' ? 'png' : 'svg', 24);
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
    var factors = this.highDpiFactors.slice();
    var self = this;
    index = index || false;

    if (this.isVector) {
        throw new Error('This is a vector image and therefore has no source set.');
    }

    type = type || this.extension;

    if (type === 'webp') {
        factors.unshift(1);
    }

    factors.forEach(function (factor, i) {
        var width = self.width * factor;

        factors[i] = self.src(index, width, type) + ' ';

        if (type === 'webp') {
            factors[i] += width + 'w';
        } else {
            factors[i] += factor + 'x';
        }
    });

    return factors.join(', ');
};

module.exports = ProgramIcon;
