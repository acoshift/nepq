var gulp = require('gulp'),
    jison = require('gulp-jison'),
    typescript = require('gulp-tsc'),
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
  return gulp.src(paths.src + 'lib/*.jison')
    .pipe(jison({ moduleType: 'commonjs' }))
    .pipe(gulp.dest(paths.build + 'lib/'));
});

gulp.task('js', function() {
  return gulp.src(paths.src + '**/*.js')
    .pipe(gulp.dest(paths.build));
});

gulp.task('ts', function() {
  return gulp.src([paths.src + '**/*.ts', '!**/*.d.ts'])
    .pipe(typescript({ module: 'commonjs', target: 'ES5', removeComments: false, sourceMap: false, declaration: false }))
    .pipe(gulp.dest(paths.build));
});

gulp.task('.d.ts', function() {
  return gulp.src(paths.src + '**/*.d.ts')
    .pipe(gulp.dest(paths.build));
});

gulp.task('dist', ['build'], function() {
  return gulp.src([paths.build + '**/*', 'package.json', 'README.md'])
    .pipe(gulp.dest(paths.dist));
});

gulp.task('test-parser', ['build'], function() {
  return gulp.src('test_parser.js', { cwd: paths.test, read: false })
    .pipe(mocha());
});

gulp.task('test-response', ['build'], function() {
  return gulp.src('test_response.js', { cwd: paths.test, read: false })
    .pipe(mocha());
});

gulp.task('clean', ['clean-dist', 'clean-build']);

gulp.task('test', ['build', 'test-parser', 'test-response']);

gulp.task('build', ['jison', 'js', '.d.ts', 'ts']);

gulp.task('default', ['build']);
