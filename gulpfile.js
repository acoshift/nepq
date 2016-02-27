'use strict'
const gulp = require('gulp')
const jison = require('gulp-jison')
const mocha = require('gulp-mocha')
const ts = require('gulp-typescript')
const del = require('del')
const babel = require('gulp-babel')

const paths = {
  src: './src/',
  build: './build/',
  test: './test/',
  dist: './dist/'
}

const tsProject = ts.createProject({
  target: 'es5',
  module: 'commonjs',
  removeComments: true,
  moduleResolution: 'node',
  noImplicitAny: false,
  noResolve: true,
  isolatedModules: true
})

gulp.task('clean-build', function () {
  return del([paths.build])
})

gulp.task('clean-dist', function () {
  return del([paths.dist])
})

gulp.task('jison', function () {
  return gulp.src(paths.src + '**/*.jison')
    .pipe(jison({ moduleType: 'commonjs' }))
    .pipe(gulp.dest(paths.build))
})

gulp.task('js', function () {
  return gulp.src(paths.src + '**/*.js')
    .pipe(babel({ presets: ['es2015'], comments: false }))
    .pipe(gulp.dest(paths.build))
})

gulp.task('ts', function () {
  return gulp.src(paths.src + '**/*.ts')
    .pipe(ts(tsProject))
    .pipe(gulp.dest(paths.build))
})

gulp.task('d.ts', function () {
  return gulp.src(paths.src + '**/*.d.ts')
    .pipe(gulp.dest(paths.build))
})

gulp.task('dist', ['build'], function () {
  return gulp.src([paths.build + '**/*', 'package.json', 'README.md'])
    .pipe(gulp.dest(paths.dist))
})

gulp.task('test', ['build'], function () {
  return gulp.src('test.js', { read: false })
    .pipe(mocha())
})

gulp.task('echo', ['build'], function () {
  return gulp.src('echo.js', { read: false })
    .pipe(mocha())
})

gulp.task('clean', ['clean-dist', 'clean-build'])

gulp.task('build', ['jison', 'js', 'ts', 'd.ts'])

gulp.task('default', ['build'])
