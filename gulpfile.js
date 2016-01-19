var gulp = require('gulp'),
    jison = require('gulp-jison'),
    mocha = require('gulp-mocha'),
    del = require('del');

var paths = {
  src: './src/',
  build: './build/',
  test: './test/',
  dist: './dist/'
};

gulp.task('clean-build', function() {
  return del([paths.build]);
});

gulp.task('clean-dist', function() {
  return del([paths.dist]);
});

gulp.task('jison', function() {
  return gulp.src(paths.src + '*.jison')
    .pipe(jison({ moduleType: 'commonjs' }))
    .pipe(gulp.dest(paths.build));
});

gulp.task('dist', ['build'], function() {
  return gulp.src([paths.build + '**/*', 'package.json', 'README.md'])
    .pipe(gulp.dest(paths.dist));
});

gulp.task('test', ['build'], function() {
  return gulp.src('test.js', { read: false })
    .pipe(mocha());
});

gulp.task('clean', ['clean-dist', 'clean-build']);

gulp.task('build', ['jison']);

gulp.task('default', ['build']);
