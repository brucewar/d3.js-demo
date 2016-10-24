var gulp = require('gulp');
var gulpUtil = require('gulp-util');
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var srcDir = path.join(__dirname, 'src');
var distDir = path.join(__dirname, 'dist');

function getWebpackConfig(){
  var entry = {};

  // 递归遍历src目录下的js
  function ls(dir){
    var fileName = '',
    fileStat = '';
    var files = fs.readdirSync(dir);
    files.forEach(function(file){
      fileName = path.join(dir, file);
      var fileStat = fs.lstatSync(fileName);
      if(fileStat.isDirectory()){
        ls(fileName);
      }else{
        if(/\.js$/.test(fileName)){
          entry[fileName.replace(dir, '').replace('.js', '')] = fileName;
        }
      }
    });
  }
  ls(srcDir);

  return [
    {
      entry: entry,
      output: {
        path: distDir,
        filename: '[name].bundle.js'
      }
    }
  ];
}
var compiler = webpack(getWebpackConfig());

gulp.task('webpack:build', function(){
  compiler = webpack(getWebpackConfig());
  compiler.run(function(err, stats){
    if(err) throw new gutil.PluginError('webpack', err);
    gulpUtil.log('[webpack]', stats.toString({

    }));
  });
});

gulp.task('webpack:watch', function () {
  compiler.watch(200, function (err, stats) {
    if(err) throw new gutil.PluginError("webpack", err);
  });
});

gulp.task('default', ['webpack:build'], function(){});

gulp.task('watch', function () {
  gulp.watch('./src/**/*.js', ['webpack:build']);
});
