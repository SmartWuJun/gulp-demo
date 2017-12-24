// import { log } from 'util';

var gulp = require('gulp');
let plugin = require('gulp-load-plugins')();
var changed = require('gulp-changed');
// var connect = require('gulp-connect');
var gulpsync = require('gulp-sync')(gulp);
var browserSync = require('browser-sync').create();



gulp.task('copy-img', function() {
    gulp.src(['client/images/*.{png,jpg}', 'client/css/imgs/*.{png,jpg}'], { base: 'client' })
        // .pipe(plugin.imagemin())
        .pipe(plugin.rev())
        .pipe(gulp.dest('dist'))
        .pipe(plugin.rev.manifest())
        .pipe(gulp.dest('dist/rev/image'))
})


gulp.task('zip-img', function() {
    gulp.src(['dist/images/*.{png,jpg}', 'dist/css/imgs/*.{png,jpg}'], { base: 'dist' })
        .pipe(plugin.imagemin())
        .pipe(gulp.dest('dist'))
})

gulp.task('clean', () => {
    return gulp.src('dist', { read: false })
        .pipe(plugin.clean());
})

//css文件压缩，更改版本号，并通过rev.manifest将对应的版本号用json表示出来
gulp.task('css', function() {
    return gulp.src('client/css/*.less')
        //.pipe( concat('wap.min.css') )
        .pipe(changed('dist'))
        .pipe(plugin.less())
        .pipe(plugin.minifyCss())
        .pipe(plugin.rev())
        .pipe(gulp.dest('dist/css/'))
        .pipe(plugin.rev.manifest())
        .pipe(gulp.dest('dist/rev/css'))
})

//将css中引用的图片路径 进行hash版本号
gulp.task('hash-css-img', ['css'], function() {
    return gulp.src(['dist/rev/**/*.json', 'dist/css/*.css'])
        .pipe(plugin.revCollector())
        .pipe(gulp.dest('dist/css/'));
})

//js文件压缩，更改版本号，并通过rev.manifest将对应的版本号用json表示出
gulp.task('js', function() {
    return gulp.src('client/js/*.js')
        //.pipe( concat('wap.min.js') )
        .pipe(plugin.babel({
            presets: ['env']
        }))
        .pipe(plugin.uglify())
        .pipe(plugin.rev())
        .pipe(gulp.dest('dist/js/'))
        .pipe(plugin.rev.manifest())
        .pipe(gulp.dest('dist/rev/js'))
});

//通过hash来精确定位到html模板中需要更改的部分,然后将修改成功的文件生成到指定目录
gulp.task('rev', function() {
    console.log('run rev');
    return gulp.src(['dist/rev/**/*.json', 'client/page/**/*.html'])
        .pipe(plugin.revCollector())
        .pipe(gulp.dest('dist/page/'));
});

//合并html页面内引用的静态资源文件
// gulp.task('html', function() {
//     return gulp.src('dist/pages/*.html')
//         .pipe(plugin.useref())
//         .pipe(plugin.rev())
//         .pipe(plugin.revReplace())
//         .pipe(gulp.dest('dist/html/'));
// })

// gulp.task('server', function() {
//     connect.server({
//         root: 'dist',
//         port: 8080
//     });
// })

gulp.task('server', () => {

    browserSync.init({
        server: {
            baseDir: './dist',
            index: 'page/index/index.html'
        },
        port: 8080
    });




})

gulp.task('watch', function() {
    console.log('start watch');

    gulp.watch("./client/page/**/*.html").on('change', browserSync.reload);
    gulp.watch('./client/css/*.{css,less}', gulpsync.sync(['hash-css-img', 'rev', 'reload']))
})
gulp.task('reload', function() {
    browserSync.reload();
})


gulp.task('default', gulpsync.sync(['clean', 'copy-img', 'js', 'hash-css-img', 'zip-img', 'rev', 'server', 'watch']));