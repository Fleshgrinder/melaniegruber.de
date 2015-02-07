'use strict';

gulp.task('styles', function gulpTaskStyles() {
    return gulp.src('src/styles/*.scss', { base: 'src/' })
        .pipe($.plumber())
        .pipe($.changed(config.dest, {
            extension: '.css',
            pattern: 'src/styles/**/*.scss'
        }))
        .pipe(config.dist ? $.util.noop() : $.sourcemaps.init())
        .pipe($.sass({
            imagePath: '/images/',
            precision: 3
        }))
        .pipe($.changed(config.dest))
        .pipe($.autoprefixer({
            browsers: [
                '> 5%',
                'last 2 version',
                'Firefox ESR',
                'Opera 12.1'
            ],
            cascade: false
        }))
        .pipe(config.dist ? $.csso() : $.util.noop())
        .pipe($.replace('@charset "UTF-8";', ''))
        .pipe(config.dist ? $.util.noop() : $.sourcemaps.write('.'))
        .pipe(gulp.dest(config.dest))
        .pipe($.compress())
        .pipe(config.dist ? gulp.dest(config.dest) : $.util.noop());
});
