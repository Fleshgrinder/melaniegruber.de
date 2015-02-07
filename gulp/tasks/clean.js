'use strict';

gulp.task('clean-dist', function gulpTaskCleanDist(done) {
    $.del('dist', done);
});

gulp.task('clean-dev', function gulpTaskCleanDev(done) {
    $.del('dev', done);
});
