var gulp = require('gulp'),
    jison = require('gulp-jison'),
    mocha = require('gulp-mocha'),
    del = require('del');

var paths = {
  src: './src/',
  build: './build/',
  test: './test/'
};

gulp.task('clean', function() {
  return del.sync([paths.build]);
});

gulp.task('jison', function() {
  return gulp.src(paths.src + 'lib/*.jison')
    .pipe(jison({ moduleType: 'commonjs' }))
    .pipe(gulp.dest(paths.build + 'lib/'));
});

gulp.task('js', function() {
  return gulp.src(paths.src + '*.js')
    .pipe(gulp.dest(paths.build));
});

gulp.task('test', ['build'], function() {
  return gulp.src('test.js', { cwd: paths.test, read: false })
    .pipe(mocha());
});

gulp.task('build', ['clean', 'jison', 'js']);

gulp.task('default', ['build']);
