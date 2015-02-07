'use strict';

gulp.task('scripts', function gulpTaskScripts() {
    if (config.dist) {
        return gulp.src('src/scripts/**/*.js', { base: 'src/' })
            .pipe($.plumber())
            .pipe($.uglify({
                preserveComments: function () {
                    return false;
                }
            }))
            .pipe(gulp.dest(config.dest))
            .pipe($.compress())
            .pipe(gulp.dest(config.dest));
    }
});
