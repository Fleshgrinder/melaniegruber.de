'use strict';

var Image = require('./Image');
var url = require('./url');
var util = require('util');

/**
 * Construct new program icon instance.
 *
 * @constructor
 * @param {string} title
 * @param {boolean} index
 */
function ProgramIcon(title, index) {
    ProgramIcon.super_.call(this, title, title.split(' ')[0] === 'Autodesk' ? 'png' : 'svg', 24);

    Object.defineProperties(this, {
        index: {
            value: index || false
        },
        path: {
            value: '/images/icons/' + this.basename
        }
    });
}

util.inherits(ProgramIcon, Image);

/**
 * @inheritDoc
 */
ProgramIcon.prototype.src = function (width, type) {
    if (this.isVector) {
        if (this.index && this.path.match(/unity$/)) {
            return url.asset(this.path + '-white.' + this.extension);
        }

        return url.asset(this.path + '.' + this.extension);
    }

    width = width || this.width;
    type = type || this.extension;

    return url.asset(
        this.path + '-' + width + '.' + type,
        this.path + '.' + this.extension
    );
};

/**
 * @inheritDoc
 */
ProgramIcon.prototype.srcSet = function (type) {
    var factors = [1.5, 2, 3];
    var self = this;

    if (this.isVector) {
        throw new Error('This is a vector image and therefore has no source set.');
    }

    type = type || this.extension;

    if (type === 'webp') {
        factors.unshift(1);
    }

    factors.forEach(function (factor, i) {
        var width = self.width * factor;

        factors[i] = self.src(width, type) + ' ';

        if (type === 'webp') {
            factors[i] += width + 'w';
        } else {
            factors[i] += factor + 'x';
        }
    });

    return factors.join(', ');
};

module.exports = ProgramIcon;
