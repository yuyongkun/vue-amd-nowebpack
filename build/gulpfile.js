const gulp = require('gulp');
const bom = require('gulp-bom');
const jshint = require('gulp-jshint'); //js规范验证
const sequence = require('gulp-sequence');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const rjs = require('requirejs');
const sass = require('gulp-sass');
const webp = require('gulp-webp');
const webpCss = require('gulp-webp-css');
const base64Css = require('gulp-base64');
const minifyCshtml = require('gulp-cshtml-minify')
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const rename = require("gulp-rename");
const babel = require('gulp-babel');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

/*-------------------------------------->版本发布<-----------------------------------------*/


gulp.task('build', sequence('clean:release', 'clean:tmp', 'rjs'));

//删除目录
gulp.task('clean:release', () => {
    return gulp.src(['./release'], {
        read: false
    })
        .pipe(clean());
});
gulp.task('clean:tmp', () => {
    return gulp.src(['./tmp'], {
        read: false
    })
        .pipe(clean());
});

// js合并
gulp.task('rjs', () => {
    const exclude = ['jquery', 'underscore', 'common', 'bootstrap', 'cropper', 'resize_extend',
          'ueditor.all.min', 'ZeroClipboard.min', 'shCore', 'shBrushJScript', 'zh-cn',  
         'jquery.lazyload', 'text', 'jqPaginator'
    ];
    rjs.optimize({
        appDir: '../assets',
        baseUrl: 'js',
        dir: './tmp/assets',
        findNestedDependencies: false, //代码内部写的require也计算在打包内
        preserveLicenseComments: false, //去掉头部版权声明
        removeCombined: false, //自动删除被合并过的文件
        optimize: 'none',//uglify2,none
        optimizeCss: 'standard',
        mainConfigFile: '../assets/js/config.js',
        modules: [
            // index--index.js
            {
                name: "./Index/index",
                exclude: exclude
            },

        ]
    }, () => {
        gulp.start('release');
    });
});

gulp.task('release', sequence('js:hanlder', 'img:hanlder', 'css:hanlder', 'html:hanlder', 'clean:tmp'));

gulp.task('js:hanlder', sequence('copy:js', 'md5:js', 'uglify'));
gulp.task('img:hanlder', sequence(
    'copy:img',
    // 'webp:img',
    'md5:img',
    'imagemin'
));
gulp.task('css:hanlder', sequence('md5:css',
    'autoprefixer',
    'webp:css',
    'revreplace_css_img',
    // 'base64:css'
));

gulp.task('html:hanlder', sequence('revreplace_html_js', 'revreplace_html_css', 'revreplace_html_img'));

/*---------处理js--------*/

// 将js文件拷贝到release目录
gulp.task('copy:js', () => {
    return gulp.src([
        './tmp/assets/js/**',
    ], {
        base: "./tmp"
    })
        .pipe(gulp.dest('./release'));
});

// 将每个页面的入口js文件转成md5
gulp.task('md5:js', () => {
    return gulp.src([
        './tmp/assets/js/**/*.js',
        '!./tmp/assets/js/**/*.es6.js',
        '!./tmp/assets/js/{libs,plugs,global}/**/*.js',
        '!./tmp/**/config.js',
    ], {
        base: "./tmp"
    })
        .pipe(rev())
        .pipe(gulp.dest('./release'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./release/assets/js'));
});


//压缩js
gulp.task('uglify', () => {
    return gulp.src(['./release/assets/js/**/*.js','!./release/**/*.es6.js', '!./release/assets/js/{libs,plugs,global/vendor}/**/*.js', '!./release/**/config.js'])
        .pipe(uglify())
        .on('error', function (err) {
            console.log('压缩失败', err);
        })
        .pipe(gulp.dest('./release/assets/js'));
});

/*---------处理img--------*/

gulp.task('copy:img', () => {
    return gulp.src('./tmp/assets/images/**')
        .pipe(gulp.dest('./release/assets/images'))
});

// 将图片转成webp
gulp.task('webp:img', () => {
    return gulp.src('./release/assets/images/**')
        .pipe(webp())
        .pipe(gulp.dest('./release/assets/images'))
});

// 将img文件生成md5
gulp.task('md5:img', () => {
    return gulp.src('./release/assets/images/**', { base: './tmp' })
        .pipe(rev())
        .pipe(gulp.dest('./release'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./release/assets/images'));
});

//压缩图片
gulp.task('imagemin', () => {
    return gulp.src(['./release/assets/images/**'])
        .pipe(imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
        }))
        .pipe(gulp.dest('./release/assets/images'));
});

/*---------处理css--------*/
gulp.task('md5:css', () => {
    return gulp.src(`./tmp/assets/css/**/*.css`, { base: './tmp' })// 将css文件转成md5，并生成对应的json文件
        .pipe(rev())
        .pipe(gulp.dest('./release'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./release/assets/css'));
});

gulp.task('autoprefixer', () => {
    return gulp.src(`./release/assets/css/**/*.css`)
        // 为css文件添加浏览器前缀
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 5 versions', 'Android >= 4.0', "> 10%", "ie 9"],
            cascade: false,
            remove: true //是否去掉不必要的前缀 默认：true 
        }))
        // 将css文件里面图片转成webp路径
        .pipe(gulp.dest('./release/assets/css'))
});

// 将css中的img路径转成webp格式路径
gulp.task('webp:css', () => {
    return gulp.src(`./release/assets/css/**/*.css`, { base: './release' })// 将css文件转成md5，并生成对应的json文件
        .pipe(webpCss()) // or .pipe(webpCss(['.jpg','.jpeg']))
        .pipe(gulp.dest('./release'))
});

// 将css中的图片路径转成对应的hash路径
gulp.task('revreplace_css_img', () => {
    const manifest = gulp.src('./release/assets/images/rev-manifest.json');
    return gulp.src('./release/assets/css/**')
        .pipe(revReplace({
            manifest: manifest,
            replaceInExtensions: '.css'//Default: ['.js', '.css', '.html', '.hbs']
        }))
        .pipe(gulp.dest('./release/assets/css'));
});

//将css中小图转成base64字符串
gulp.task('base64:css', () => {
    return gulp.src(['./release/assets/css/**/*.css'])
        .pipe(base64Css({
            baseDir: './release',
            maxImageSize: 10 * 1024, // bytes
        }))
        .pipe(gulp.dest('./release/assets/css'));
});



/*---------处理html--------*/

//替换页面中的js为对应的hash路径
gulp.task('revreplace_html_js', () => {
    const manifest = gulp.src('./release/assets/js/rev-manifest.json');
    return gulp.src('../Views/**')
        .pipe(revReplace({
            manifest: manifest,
            replaceInExtensions: '.cshtml'
        }))
        .pipe(gulp.dest('./release/Views'));
});
//替换页面中的css为对应的hash路径
gulp.task('revreplace_html_css', () => {
    const manifest = gulp.src('./release/assets/css/rev-manifest.json');
    return gulp.src('./release/Views/**')
        .pipe(revReplace({
            manifest: manifest,
            replaceInExtensions: '.cshtml'
        }))
        .pipe(gulp.dest('./release/Views'));
});
//替换页面中的img为对应的hash路径
gulp.task('revreplace_html_img', () => {
    const manifest = gulp.src('./release/assets/images/rev-manifest.json');
    return gulp.src('./release/Views/**')
        .pipe(bom())
        .pipe(revReplace({
            manifest: manifest,
            replaceInExtensions: '.cshtml'
        }))
        .pipe(gulp.dest('./release/Views'));
});

/*-------------------------------------->开发时执行<-----------------------------------------*/
gulp.task('default', ['server']);

// 启动代理服务
gulp.task('server', ['sass', 'lint'], () => {
    browserSync.init({
        port: 3010,
        // 1，作为静态资源服务器使用
        watch: true,
        server: ["../Views", "../"],
        //2，作为代理服务器使用
        // proxy: 'http://localhost:8888'
    });
    gulp.watch('../assets/sass/**/*.scss', ['sass']);
    gulp.watch(['../assets/js/**/*.js', '!../assets/js/{libs,plugs,vendor}/**/*.js'], ['lint']);
    gulp.watch('../Views/**/*.[cshtml,html]').on('change', reload);
});

//scss文件转成css文件
gulp.task('sass', () => {
    return gulp.src('../assets/sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded' //nested、compact、compressed、expanded
        }).on('error', function (err) {
            //prevent gulp process exit
            console.log('gulp-sass任务失败：', err);
            this.emit('end');
            setTimeout(() => {
                console.log('重新启动gulp-sass');
                gulp.start('sass');
            }, 500);
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(`../assets/css`))
        .pipe(reload({
            stream: true
        }));

});

//js校验
gulp.task('lint', ['es6ToAmd'], () => {
    return gulp.src(['../assets/js/**/*.js', '!../assets/js/{libs,plugs,vendor}/**/*.js'])
        .pipe(reload({
            stream: true
        }))
        .pipe(jshint({
            expr: true
        }))
        .pipe(jshint.reporter('default'));
});

//es6转amd
gulp.task('es6ToAmd', () => {
    return gulp.src(['../assets/js/**/*.es6.js', '!../assets/js/{libs,plugs,global,vendor}/**/*.js', '!../assets/js/config.js'])
        .pipe(babel({
            presets: [
                [
                    '@babel/env', {
                        "targets": {
                            "browsers": ["ie >= 8", "chrome >= 62"],
                        },
                        "modules": 'amd'//将当前模块转换成其它模块类型,非模块文件默认转换成commonjs模块类型
                    }
                ]
            ],
            // plugins: ["@babel/plugin-transform-strict-mode"],
        }).on('error', err => {
            console.log(err);
        }))
        .pipe(rename((path) => {
            path.basename = path.basename.replace(/.es6/, '');
        }))
        .pipe(gulp.dest('../assets/js/'))
});