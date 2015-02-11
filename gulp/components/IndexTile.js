'use strict';

var Image = require('./Image');
var path = require('path');
var url = require('./url');
var util = require('util');

/**
 * Construct new index tile instance.
 *
 * @constructor
 * @param {Page} page
 */
function IndexTile(page) {
    this.__page = page;
    IndexTile.super_.call(this, 'tile', page.route, 'jpg', 640);
}

util.inherits(IndexTile, Image);

/**
 * @inheritDoc
 */
IndexTile.prototype.__sourcePath = function () {
    return path.normalize(util.format('%s/tile.jpg', path.dirname(this.__page.sourcePath)));
};

/**
 * @inheritDoc
 */
IndexTile.prototype.src = function (width, type) {
    return url.asset(this.path + '-' + (width || this.width) + '.' + (type || this.extension), this.sourcePath);
};

/**
 * @inheritDoc
 */
IndexTile.prototype.srcSet = function (type) {
    var self = this;
    var srcSet;

    if (type === 'webp') {
        srcSet = [];
        [this.width / 2, this.width].forEach(function (width) {
            srcSet.push(self.src(width, type) + ' ' + width + 'w');
            self.highDpiFactors.forEach(function (factor) {
                var factoredWidth = width * factor;
                srcSet.push(self.src(factoredWidth, type) + ' ' + factoredWidth + 'w');
            });
        });

        return srcSet.join(', ');
    }

    srcSet = [[], []];
    [this.width / 2, this.width].forEach(function (width, i) {
        self.highDpiFactors.forEach(function (factor) {
            srcSet[i].push(self.src(width * factor) + ' ' + factor + 'x');
        });
        srcSet[i] = srcSet[i].join(', ');
    });

    return srcSet;
};

module.exports = IndexTile;
