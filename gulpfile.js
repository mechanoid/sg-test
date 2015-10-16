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
    , rename = require('gulp-rename')
    , projectConfig = require(path.resolve(__dirname, 'styleguide.json')).project
    , components = require('./lib/components');

var config = Object.assign({components: {}}, projectConfig);
// make pathes absolute
config.pathes = config.pathes.map(function(p) { return path.resolve(__dirname, p) });

gulp.task('build-styleguide-macros', function() {
  return gulp.src('vendor/styleguide/components/**/*.nj.html')
  .pipe(concat('styleguide_macros.nj.html'))
  .pipe(gulp.dest('dist/tmp'));
});

gulp.task('build-app-macros', function() {
  return gulp.src('components/**/*_macro.nj.html')
  .pipe(print())
  .pipe(concat('app_macros.nj.html'))
  .pipe(gulp.dest('dist/tmp'));
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
  // .pipe(data(function(file) {
  //   return config;
  // }))
  .pipe(wrap('\
    {% import "./tmp/app_macros.nj.html" as app %} \n\n\
    {% import "./tmp/styleguide_macros.nj.html" as sg %} \n\n\
    <%= contents %>\
  '))
  // build example file
  .pipe(nunjucks({
    searchPaths: ['dist', 'vendor/styleguide']
  }))
  // copy content to data obejc
  .pipe(components.applyTo(config).on('error', gutil.log))

  // ***********************************************************
  // JOIN FILES TO COMPONENT LIST
  // ***********************************************************
  .pipe(concat('component_list.nj.html'))

  // Content is not added via <%= contents %>, it is injected as context
  // from the pre-compiled example files, that are loaded to the file.data
  .pipe(wrap('\
    {% import "./tmp/app_macros.nj.html" as app %} \n\n\
    {% import "./tmp/styleguide_macros.nj.html" as sg %} \n\n\
    {% extends "./views/component_list.nj.html" %}\
  '))
  // build component_list view
  .pipe(nunjucks({
    searchPaths: ['dist', 'vendor/styleguide']
    , locals: {
      "components": config.components
    }
  }))

  .pipe(prettify({indent_size: 2}))
  .pipe(rename('component_list.html'))
  .pipe(gulp.dest('dist'));
});

gulp.task('default', ['build-component-list'], function() {
  return gulp.src('dist/component_list.html')
  .pipe(data(function(file) {
    console.log(file.contents.toString());
    return file;
  }))
  .pipe(gulp.dest('dist'));
});
