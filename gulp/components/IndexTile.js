'use strict';

var ProjectPage = require('./ProjectPage');
var url = require('./url');

var sizes = '';

(function () {
    for (var i = 2; i < 13; ++i) {
        var width = 320 * i;
        sizes += '(min-width: ' + width + 'px) and (max-width: ' + width + 20 + 'px) 320px, ';
    }
})();

function IndexTile(project) {
    if (!project instanceof ProjectPage) {
        throw new TypeError('Argument must be an instance of Project.');
    }

    Object.defineProperties(this, {
        __defaultExtension: { value: 'jpg' },
        project: { value: project }
    });
}

IndexTile.prototype.__url = function indexTileURL(suffix, extension) {
    extension = extension || this.__defaultExtension;
    return url.asset(this.project.tilePrefix + suffix + '.' + extension, this.project.tilePattern);
};

IndexTile.prototype.toString = function indexTileToString() {
    return '' +
        '<picture>' +
            '<source sizes="(max-width: 339px) 320px, ' + sizes + ' 640px" srcset="' +
                this.__url(320, 'webp') + ' 320w, ' +
                this.__url(480, 'webp') + ' 480w, ' +
                this.__url(640, 'webp') + ' 640w, ' +
                this.__url(960, 'webp') + ' 960w, ' +
                this.__url(1280, 'webp') + ' 1280w, ' +
                this.__url(1920, 'webp') + ' 1920w" type="image/webp">' +
            '<img alt="' + this.project.title + '" class="img-responsive project-tile project-tile-small" height="320" src="' + this.__url(320) + '" srcset="' +
                this.__url(480) + ' 1.5x, ' +
                this.__url(640) + ' 2x, ' +
                this.__url(960) + ' 3x" width="320">' +
            '<img alt="' + this.project.title + '" class="img-responsive project-tile project-tile-big" height="640" src="' + this.__url(640) + '" srcset="' +
                this.__url(960) + ' 1.5x, ' +
                this.__url(1280) + ' 2x, ' +
                this.__url(1920) + ' 3x" width="640">' +
        '</picture>'
    ;
};

module.exports = IndexTile;
