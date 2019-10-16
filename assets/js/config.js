requirejs.config({
    baseUrl: '/assets/js',
    waitSeconds: 0,
    urlArgs: 'v=0.1.2',//改动不合并到入口文件的js文件时才需要修改
    enforceDefine: false,//如果设置为true，当一个脚本不是通过define()定义且不具备可供检查的shim导出字串值时，就会抛出错误.
    paths: {
        //基础组件部分
        'jquery': './libs/jquery-1.10.2.min',
        'underscore': './libs/underscore-1.7.0.min',
        'class': './libs/class.min',
        'common': './global/common',
        'util': './global/util',
        
        'vue': './vendor/vue',

        //require相关插件
        'text': './libs/require/require-text.min',
        'css': './libs/require/require-css.min',
        'css-builder': './libs/require/css-builder',
        'normalize': './libs/require/normalize',

        //上传图片
        'uploader': './plugs/upload/app',
        'webuploader': './plugs/upload/webuploader',

        //福文本编辑框
        'ueditor.all.min': './plugs/ueditor/ueditor.all.min',
        'ZeroClipboard.min': './plugs/ueditor/third-party/zeroclipboard/ZeroClipboard.min',
        'shCore': './plugs/ueditor/third-party/SyntaxHighlighter/shCore',
        'shBrushJScript': './plugs/ueditor/third-party/SyntaxHighlighter/shBrushJScript',
        'zh-cn': './plugs/ueditor/lang/zh-cn/zh-cn',

        //数据校验
        'validate': './libs/jquery.validate',

        //分页插件
        'jqPaginator': './plugs/jqPaginator',

        //新日期插件
        'calender': './plugs/calender/js/calender',

        //js滑动插件
        'swiper': './plugs/swiper/idangerous.swiper2.7.6',

        //图片延迟加载
        'jquery.lazyload': './plugs/jquery.lazyload',

        //特效背景
        'jquery.particleground': './libs/jquery.particleground.min',
        //瀑布流插件
        'flow.img': './plugs/flow.img',
        //看图插件viewer
        'viewer': './plugs/viewer/viewer-custom',
        //弹框插件
        'dialog': './plugs/dialog/dialog',

        /*bootstrap*/
        'bootstrap': './plugs/bootstrap/bootstrap.min',
        //裁剪插件
        'cropper': './plugs/cropper/cropper',
        /*改变元素大小触发resize事件*/
        'resize_extend': './plugs/resize_extend',
        //插图插件
        "lightgallery": "./plugs/lightgallery/lightgallery",
        "lg-thumbnail": "./plugs/lightgallery/lg-thumbnail",
        "lg-fullscreen": "./plugs/lightgallery/lg-fullscreen",
    },
    shim: {
        'lightgallery': {
            deps: ['css!./plugs/lightgallery/css/lightgallery.css']
        },
        'lg-thumbnail': {
            deps: ['lightgallery']
        },
        'lg-fullscreen': {
            deps: ['lightgallery']
        },
        'jquery': { exports: '$' },
        'viewer': {
            deps: ['jquery', 'css!./plugs/viewer/viewer-custom.css']
        },
        'upload': {
            deps: ['jquery', 'webuploader']
        },
        'webuploader': {
            deps: ['jquery', 'css!./plugs/upload/webuploader.css', 'css!./plugs/upload/app.css']
        },

        'ueditor.all.min': {
            deps: ['./plugs/ueditor/ueditor.config']
        },
        'zh-cn': {
            deps: ['ueditor.all.min']
        },

        'validate': {
            deps: ['jquery']
        },

        'jqPaginator': {
            deps: ['jquery']
        },

        'calender': {
            deps: ['css!./plugs/calender/css/calender.css']
        },

        'swiper': {
            deps: ['jquery', 'css!./plugs/swiper/swiper.min.css']
        },

        'dialog': {
            deps: ['css!./plugs/dialog/dialog.css']
        },

        'jquery.lazyload': {
            deps: ['jquery']
        },

        'jquery.particleground': {
            deps: ['jquery']
        },

        'cropper': {
            deps: ['jquery', 'css!./plugs/cropper/cropper.css']
        },

    }
});