var gulp = require('gulp');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('build', function() {
    browserify({
      entries: './lib/img.js',
      standalone: 'img',
      debug: true
    })
    .transform(babelify)
    .bundle()
    .pipe(source('img.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['build']);

gulp.task("watch", function(){
      gulp.watch('lib/*.js', ['default'])
});
