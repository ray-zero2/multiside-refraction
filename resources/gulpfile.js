const baseDirectory = "../";      //gulpfile.jsの位置から見たルートへの相対パスを記入
const indexHtmlPath = baseDirectory + "./public/";  //ルートからの相対パス記入
const scssPath = baseDirectory + "./resources/scss/";  //scssディレクトリのパスを記入
const outputPath = baseDirectory + "./public/css/";  //outputディレクトリのパスを記入

const {src, dest, watch, series} = require("gulp");
const {init, reload} = require("browser-sync");
const sass= require("gulp-sass");
const plumber= require("gulp-plumber");
const notify= require("gulp-notify");

function scssCompile(cb){
  src(scssPath + "**/*.scss")
    .pipe(plumber({ 
      errorHandler: notify.onError({
        title: "SASS ERROR",
        message: "<%= error.message %>"
      })
    })) 
    .pipe(sass({
      outputStyle: "expanded",
      errLogToConsole: false
    }))
    .pipe(dest(outputPath));
  cb();
}


function serverStart(cb){
  init({
    server: {
      baseDir: baseDirectory 
    },
    startPath: indexHtmlPath + "index.html",
    notify: false
  });
  cb();
}

function browserReload(cb){
  reload();
  console.log("reload\n");
  cb();
}

function watchFiles(cb){
  watch(baseDirectory + "**/*.html", browserReload);
  watch(baseDirectory + "**/*.scss", 
    series(scssCompile, browserReload)
  );
  
  cb();
}

exports.default=series(serverStart,watchFiles);
