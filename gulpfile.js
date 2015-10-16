"use strict";

var gulp = require('gulp')
    , gutil = require('gulp-util')
    , nunjucks = require('gulp-nunjucks-html')
    , path = require('path')
    , wrap = require('gulp-wrap')
    , data = require('gulp-data')
    , print = require('gulp-print')
    , concat = require('gulp-concat')
    , prettify = require('gulp-prettify')
    , projectConfig = require(path.resolve(__dirname, 'styleguide.json')).project
    , components = require('./lib/components');

var config = Object.assign({}, projectConfig);
// make pathes absolute
config.pathes = config.pathes.map(function(p) { return path.resolve(__dirname, p) });

gulp.task('build-styleguide-macros', function() {
  return gulp.src('vendor/styleguide/components/**/*.nj.html')
  .pipe(concat('styleguide.nj.html'))
  .pipe(gulp.dest('dist'));
});

gulp.task('build-app-macros', function() {
  return gulp.src('components/**/*_macro.nj.html')
  .pipe(print())
  .pipe(concat('app.nj.html'))
  .pipe(gulp.dest('dist'));
});

gulp.task('build-component-examples', [], function() {
  return gulp.src('components/**/*_example.nj.html')
  .pipe(concat('app.components.nj.html'))
  .pipe(gulp.dest('dist'));
});

// gulp.task('default', ['build-component-examples', 'build-app-macros'], function() {
//   // .pipe(wrap('{% import "./app.nj" as app %} \n\n<%= contents %>'))
//   // .pipe(nunjucks({
//   //   searchPaths: ['dist']
//   // }))
// });


gulp.task('build-component-list', ['build-styleguide-macros', 'build-app-macros'], function() {
  return gulp.src(config.pathes.map(function(p) { return path.resolve(p, '**/*_example.nj.html')}))


  // ***********************************************************
  // BUILD COMPONENT DATA
  // ***********************************************************
  // add project config to file data
  .pipe(data(function(file) {
    return config;
  }))
  .pipe(wrap('\
    {% import "./app.nj.html" as app %} \n\n\
    {% import "./styleguide.nj.html" as sg %} \n\n\
    <%= contents %>\
  '))
  // build example file
  .pipe(nunjucks({
    searchPaths: ['dist', 'vendor/styleguide']
  }))
  // copy content to data obejc
  .pipe(components.load().on('error', gutil.log))


  // ***********************************************************
  // JOIN FILES TO COMPONENT LIST
  // ***********************************************************
  .pipe(concat('app.components.nj.html'))
  // Content is not added via <%= contents %>, it is injected as context
  // from the pre-compiled example files, that are loaded to the file.data
  .pipe(wrap('\
    {% import "./app.nj.html" as app %} \n\n\
    {% import "./styleguide.nj.html" as sg %} \n\n\
    {% extends "./views/component_list.nj.html" %}\
  '))
  // build component_list view
  .pipe(nunjucks({
    searchPaths: ['dist', 'vendor/styleguide']
  }))

  .pipe(prettify({indent_size: 2}))
  .pipe(gulp.dest('dist'));
});

gulp.task('default', ['build-component-list'], function() {
  return gulp.src('dist/app.components.nj.html')
  .pipe(data(function(file) {
    console.log(file.contents.toString());
    return file;
  }))
});
