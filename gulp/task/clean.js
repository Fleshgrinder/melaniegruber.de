/* jshint node:true */
'use strict';

/*!
 * This is free and unencumbered software released into the public domain.
 *
 * Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form
 * or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
 *
 * In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright
 * interest in the software to the public domain. We make this dedication for the benefit of the public at large and to
 * the detriment of our heirs and successors. We intend this dedication to be an overt act of relinquishment in
 * perpetuity of all present and future rights to this software under copyright law.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * For more information, please refer to <http://unlicense.org/>
 */

/**
 * Gulp cleanup tasks.
 *
 * @author Richard Fussenegger <richard@fussenegger.info>
 * @copyright 2014 Richard Fussenegger
 * @license http://unlicense.org/ Unlicense.
 */

var $ = require('gulp-load-plugins')();
var del = require('del');
var gulp = require('gulp');

gulp.task('clean', ['clean:tmp'], del.bind(null, 'dist', { dot: true }));

gulp.task('clean:cache', function (done) {
    $.cached.caches = {};
    done();
});

gulp.task('clean:dist', function (done) {
    var checksums = {};
    var checksumsPath = 'checksums.json';
    var crypto = require('crypto');
    var fs = require('fs');
    var fsOptions = { charset: 'utf8' };
    var glob = require('glob');
    var path = require('path');

    /**
     * Create MD5 hash of given content.
     * @param {string} content - The string to hash.
     * @return {string} The MD5 hash.
     */
    var md5 = function (content) {
        return crypto.createHash('md5').update(content).digest('hex');
    };

    /**
     * Short-hand method to read and export an MD5 hash of a file.
     * @type {Function}
     * @param {string} filePath - Path to the file.
     * @return {string} The calculated MD5 hash.
     */
    var md5File = function (filePath) {
        return (this[filePath] = md5(fs.readFileSync(filePath, fsOptions)));
    };

    /**
     * Hash EJS files.
     * @type {Function}
     * @param {Object} checksums - The variable used to collect the hashes.
     * @return {Object} The passed in checksums variable.
     */
    var md5EJS = function (checksums) {
        checksums.ejs = '';
        glob.sync('src/views/**/*.ejs').forEach(function (filePath) {
            checksums.ejs += fs.readFileSync(filePath, fsOptions);
        });
        checksums.ejs += fs.readFileSync('gulp/task/html-markdown.js', fsOptions);
        checksums.ejs = md5(checksums.ejs);
        return checksums;
    };

    /**
     * Hash SCSS files.
     * @type {Function}
     * @param {Object} checksums - The variable used to collect the hases.
     * @return {Object} The passed in checksums variable.
     */
    var md5SCSS = function (checksums) {
        checksums.css = '';
        glob.sync('src/styles/**/*.scss').forEach(function (filePath) {
            checksums.css += fs.readFileSync(filePath, fsOptions);
        });
        checksums.css = md5(checksums.css);
        return checksums;
    };

    /**
     * Synchronous `rmdir -p` equivalent.
     * @return {boolean} `true` if the directory was deleted, `false` otherwise.
     */
    var rmdirRecursiveSync = function (dirPath) {
        try {
            var list = fs.readdirSync(dirPath);
            var filePath;

            for (var i = 0; i < list.length; ++i) {
                filePath = path.join(dirPath, list[i]);
                if (fs.statSync(filePath).isDirectory()) {
                    rmdirRecursiveSync(filePath);
                }
            }

            fs.rmdirSync(dirPath);
        } catch (e) {
            return false;
        }

        return true;
    };

    // All of these directories are always unused and we can directly delete them.
    del.sync(['dist/tmp', 'dist/projects', 'dist/views'], { dot: true });

    if (fs.existsSync(checksumsPath)) {
        var filePath, newChecksums;

        checksums = fs.readFileSync(checksumsPath);
        newChecksums = JSON.parse(checksums);
        checksums = JSON.parse(checksums);

        md5SCSS(newChecksums);
        if (newChecksums.css === checksums.css) {
            del.sync('dist/styles');
        }

        md5EJS(newChecksums);
        if (newChecksums.ejs !== checksums.ejs) {
            for (filePath in checksums) {
                if (checksums.hasOwnProperty(filePath) && filePath.match(/\.md$/)) {
                    delete checksums[filePath];
                }
            }
        }

        for (filePath in checksums) {
            if (checksums.hasOwnProperty(filePath) && filePath !== 'css' && filePath !== 'ejs' && md5File.call(newChecksums, filePath) === checksums[filePath]) {
                var pattern = filePath
                        .replace(/^src.(projects.[\d-]*~)?/, 'dist/')
                        .replace(/\.md$/, '.html')
                        .replace(/\.(jpg|png)$/, '*')
                    ;

                glob.sync(pattern + '?(.gz)').forEach(fs.unlinkSync.bind(fs));
            }
        }

        if (newChecksums !== checksums) {
            fs.writeFileSync(checksumsPath, JSON.stringify(newChecksums));
        }

        rmdirRecursiveSync('dist');
    } else {
        md5EJS(checksums);
        md5SCSS(checksums);

        glob.sync('src/**/!(*.cfg|*.ejs|*.scss|FONTLOG.txt|OFL*.txt|README.md)', { nodir: true }).forEach(function (filePath) {
            md5File.call(checksums, filePath);
        });

        fs.writeFileSync(checksumsPath, JSON.stringify(checksums));
    }

    done();
});

gulp.task('clean:tmp', del.bind(null, 'tmp', { dot: true }));
