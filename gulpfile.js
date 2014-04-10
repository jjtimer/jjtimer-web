var gulp = require('gulp');
var browserify = require('gulp-browserify');

gulp.task('bundle', function() {
  gulp.src('src/js/app.js').pipe(browserify()).pipe(gulp.dest('./build'));
});

gulp.task('dev', function() {
  gulp.watch('src/js/app.js', ['bundle']);
});
