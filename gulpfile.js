'use strict';


// --------------------------------------------------------------------------------------------------------------------- Globals


/**
 * Gulp plugin loader.
 *
 * The type definition is a mirror of all available `gulp-*` modules from the `package.json` file and the ones I add
 * manually below. The type definition can be generated via the `bin/load-plugins-type.js` file.
 *
 * @type {{
 *   concurrentTransform: Function
 *   del: Function
 *   glob: Function
 *   addSrc: Function
 *   autoprefixer: Function
 *   browserSync: {
 *     reload: Function
 *   }
 *   cached: Function
 *   changed: Function
 *   compress: Function
 *   connectModrewrite: Function
 *   crypto: {
 *     createHash: Function
 *   }
 *   csso: Function
 *   frontMatter: Function
 *   gzip: Function
 *   htmlMinifier: Function
 *   ignore: {
 *     exclude: Function
 *     include: Function
 *   }
 *   imageResize: Function
 *   imageSize: Function
 *   imagemin: Function
 *   imageminMozjpeg: Function
 *   imageminPngquant: Function
 *   lazypipe: Function
 *   markdown: Function
 *   merge: Function
 *   mergeStream: Function
 *   multiRenderer: Function
 *   os: {
 *     tmpdir: Function
 *     endianness: Function
 *     hostname: Function
 *     type: Function
 *     platform: Function
 *     arch: Function
 *     release: Function
 *     uptime: Function
 *     loadavg: Function
 *     totalmem: Function
 *     freemem: Function
 *     cpus: Function
 *     networkInterfaces: Function
 *     EOL: string
 *   }
 *   plumber: Function
 *   remember: Function
 *   rename: Function
 *   replace: Function
 *   requireDir: Function
 *   runSequence: Function
 *   sass: Function
 *   sourcemaps: {
 *     init: Function
 *     write: Function
 *   }
 *   tap: Function
 *   through2: {
 *     obj: Function
 *   }
 *   uglify: Function
 *   util: {
 *     log: Function
 *     colors: {
 *       reset
 *       bold
 *       dim
 *       italic
 *       underline
 *       inverse
 *       hidden
 *       strikethrough
 *       black
 *       red
 *       green
 *       yellow
 *       blue
 *       magenta
 *       cyan
 *       white
 *       gray
 *       bgBlack
 *       bgRed
 *       bgGreen
 *       bgYellow
 *       bgBlue
 *       bgMagenta
 *       bgCyan
 *       bgWhite
 *     }
 *     replaceExtension: Function
 *     isStream: Function
 *     isBuffer: Function
 *     template: Function
 *     File: File
 *     noop: Function
 *     buffer: Function
 *     PluginError: Error
 *   }
 *   webp: Function
 *   zopfli: Function
 * }}
 */
global.$ = require('gulp-load-plugins')();

/**
 * Global configuration.
 *
 * @type {{}}
 */
global.config = require('./config.json');

/**
 * Node gulp module.
 *
 * @see http://gulpjs.com/
 * @type {gulp.Gulp}
 */
global.gulp = require('gulp');

/**
 * Node util core module.
 *
 * @see http://nodejs.org/api/util.html
 */
global.util = require('util');


// --------------------------------------------------------------------------------------------------------------------- Config


/**
 * Flag indicating if this is a distribution or development (default) build.
 *
 * `--dist` needs to be passed to gulp in order to create a distribution (production) build.
 *
 * @type {boolean}
 */
config.dist = $.util.env.dist || false;

/**
 * Default destination directory.
 *
 * @type {string}
 */
config.dest = config.dist ? 'dist' : 'dev';


// --------------------------------------------------------------------------------------------------------------------- Plugins


// Add more node modules to the plugin loader; I do not like calling require() all over the place.
(function () {
    [
        'browser-sync', // dev!
        'concurrent-transform',
        'connect-modrewrite', // dev!
        'crypto',
        'del',
        'fs',
        'glob',
        'image-size',
        'imagemin-mozjpeg',
        'imagemin-pngquant',
        'lazypipe',
        'merge',
        'merge-stream',
        'os',
        'path',
        'require-dir',
        'run-sequence',
        'through2'
    ].forEach(function (module) {
            var property = module.replace(/-(\w)/g, function (match, $1) {
                return $1.toUpperCase();
            });

            Object.defineProperty($, property, {
                get: function plugin() {
                    return plugin.__cache || (plugin.__cache = require(module));
                }
            });
        });
})();

/**
 * Lazy pipe for compressing the stream.
 *
 * @type {Function}
 */
if (config.dist) {
    $.compress = $.lazyPipe().pipe($.zopfli);
    //($.gzip, { gzipOptions: { level: 9 } })
} else {
    $.compress = $.util.noop;
}


// --------------------------------------------------------------------------------------------------------------------- Console


/**
 * Log complete object with color output to console.
 *
 * @param {Object} obj - Any kind of object, and remember, everything is an object.
 * @return {console}
 */
console.obj = function consoleObj(obj) {
    console.log(obj.constructor.name, util.inspect(obj, { colors: true, showHidden: true }));
    return console;
};


// --------------------------------------------------------------------------------------------------------------------- Tasks


/**
 * Default gulp task.
 *
 * @param {Function} done - Gulp provided done callback.
 * @return {undefined}
 */
gulp.task('default', function gulpTaskDefault(done) {
    $.runSequence(
        ['copy', 'images', 'scripts', 'styles'],
        'pages',
        done
    );
});

// Include all other tasks (including this after the default task ensures that the default task has highest priority).
$.requireDir('gulp', { recurse: true });
