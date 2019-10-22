/*
 * author:yu
 * date:2016.3.1
 * 此工具类common.js为常用工具类
 * 依赖jquery-1.8.0、underscore-1.8.2
 * */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'underscore', 'util'], factory);
    } else {
        window.Common = factory($, _, util);
    }
})(function ($, _, Util) {
    var common = {
        cookie: {
            GetCookieValue: function (name) {
                var cookieValue = null;
                if (document.cookie && document.cookie != '') {
                    var cookies = document.cookie.split(';');
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = jQuery.trim(cookies[i]);
                        //PYYH=USERNAME=steven&PASSWORD=111111&UserID=1&UserType=1
                        if (cookie.substring(0, name.length + 1) == (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            //USERNAME=steven&PASSWORD=111111&UserID=1&UserType=1
                            break;
                        }
                    }
                }
                return cookieValue;
            },
            DelCookie: function (name) {
                var exp = new Date();
                exp.setTime(exp.getTime() + (-1 * 24 * 60 * 60 * 1000));
                var cval = this.GetCookieValue(name);
                document.cookie = name + "=" + cval + "; expires=" + exp.toGMTString();
            },
            exit: function () {
                this.DelCookie("login");
                window.location.replace("https://tk.v5cg.com/");
            }
        },

        islogin: $('.site-header').data('login'),

        login: function () {
            window.signin.login();
        },

        $body: $('body'),

     
        showProcessbox: function (process) {
            var htm = '<div id="single-loading">' +
                '<div style="position: fixed; left: 0;right:0;top:0;bottom:0;background: #000;opacity: 0.1;filter: alpha(opacity=10);z-index: 9999998;"></div><span class="process-text" id="process-text" style=" width: 100px;height: 100px;line-height: 100px;position: absolute;right: 0;left: 0;top: 0;bottom: 0;border-radius: 50%;margin: auto;font-weight: bold;color: #fff;background-color: rgba(0,0,0,0.7);text-align: center;">0.0%</span></div>';
            $('body').append(htm);
            common.$processText = $('#process-text');
        },
        removeProcessbox: function () {
            $('#single-loading').remove();
        },
        uploadProcess: function (file, cb) {
            if (!window.FormData) {
                common.msg.error('当前浏览器版本过低请升级您的浏览器');
                return;
            }
            common.showProcessbox();
            /**
             * 侦查附件上传情况,这个方法大概0.05-0.1秒执行一次
             */
            var hasloaded = 0;
            var beforePer;

            function onprogress(evt) {
                //已经上传大小情况
                var loaded = evt.loaded;
                console.log('loaded--->' + loaded);
                //附件总大小 
                var tot = evt.total;

                loaded += hasloaded;
                if (loaded >= size) {
                    loaded = size;
                }
                var num = 100 * loaded / (shardSize * shardCount);
                //var per = Math.floor(100 * loaded / size);     //已经上传的百分比  
                var per = num.toFixed(3); //已经上传的百分比 

                if (Number(beforePer) > Number(per)) {
                    per = beforePer;
                }
                common.$processText.text(per + '%');
                beforePer = per;
            }
            var file = file.files[0], //文件对象
                name = file.name, //文件名
                size = file.size, //总大小
                succeed = 0;
            console.log('size-->' + size);
            var shardSize = 10 * 1024 * 1024, //以20MB为一个分片
                shardCount = Math.ceil(size / shardSize); //总片数
            for (var i = 0; i < shardCount; ++i) {
                //计算每一片的起始与结束位置
                var start = i * shardSize,
                    end = Math.min(size, start + shardSize);
                //构造一个表单，FormData是HTML5新增的
                var form = new FormData();
                form.append("data", file.slice(start, end)); //slice方法用于切出文件的一部分
                form.append("name", name);
                form.append("filetype", 4);
                form.append("ProductId", $('#ProductId').val());
                form.append("total", shardCount); //总片数
                form.append("index", i + 1); //当前是第几片

                //Ajax提交
                $.ajax({
                    url: "/usercenter/upload/UploadBlockFile",
                    type: "POST",
                    data: form,
                    async: true, //异步
                    processData: false, //很重要，告诉jquery不要对form进行处理
                    contentType: false, //很重要，指定为false才能形成正确的Content-Type
                    //这里我们先拿到jQuery产生的 XMLHttpRequest对象，为其增加 progress 事件绑定，然后再返回交给ajax使用
                    xhr: function () {
                        var xhr = $.ajaxSettings.xhr();
                        if (onprogress && xhr.upload) {
                            xhr.upload.addEventListener("progress", onprogress, false);
                            return xhr;
                        }
                    },
                    success: function (result) {
                        ++succeed;
                        hasloaded += shardSize;
                        if (succeed >= shardCount) {
                            common.removeProcessbox();
                            common.msg.success('上传成功');
                            result.name = name;
                            cb && cb(result);

                        }

                    }
                });
            }
        },
        /*通过表单上传图片*/
        formupload: function (obj) {
            obj = obj || {};
            var domTarget = obj.target,
                success = obj.success,
                uploadenable=obj.uploadenable,
                acceptType = obj.acceptType || 'image/jpg,image/jpeg,image/png,image/gif',
                uploadurl = obj.uploadurl,
                uploadparam = obj.uploadparam,
                err = obj.err;
            //动态创建form表单
            $('form#form').remove();
            var formHtm = '<form id="form" enctype="multipart/form-data" encoding="multipart/form-data" target="uploadiframe" action="' + uploadurl + '" method="post">' +
                '<input style="display:none;" type="file" id="file" name="file[]" accept="' + acceptType + '" multiple="">' +
                (uploadparam ? uploadparam : '') +
                '<iframe id="uploadiframe" name="uploadiframe" style="display:none"></iframe></form>';
            $(formHtm).insertBefore(domTarget);
            var $file = $('#file');
            var self = this;
            $file.change(function () {
                //立即执行回调函数
                (function (callback) {
                    //表单提交上传
                    $('#form').submit();
                    uploadenable($file[0])
                    // common.showloading();
                    self.timeid = setInterval(callback, 200);
                })(function () {
                    var content = $('#uploadiframe')[0].contentDocument.body && $('#uploadiframe')[0].contentDocument.body.innerText;
                    if (content) {
                        var result = JSON.parse(content);
                        //关闭setInterval()循环函数
                        window.clearInterval(self.timeid);
                        // common.removeloading();
                        $('form#form').remove();
                        if (result.success) {
                            success && success(result);
                        } else {
                            err && err(result.info);
                        }
                    }
                });
            });
            if (!window.ActiveXObject) {
                $file.trigger('click');
            }
        },

        showTip: function () {
            var tip = {};
            $.fn.showTip = function (text, status, time) {
                var that = this[0];
                time = time || 2500;
                //清除所有提示
                $('.dynamic-text-tip').text('');
                clearTimeout(tip.timmer);
                //设置不同提示的字体颜色
                if (status == 'success') {
                    that.style.color = '#0165b5';
                } else if (status == 'error') {
                    that.style.color = 'red';
                }
                //为提示添加动画效果
                $(that).addClass('dynamic-text-tip-animation').text(text);
                //2秒之后隐藏提示并清除提示的css动画
                tip.timmer = setTimeout(function () {
                    $(that).removeClass('dynamic-text-tip-animation');
                }, time);
            };
        }(),

        /*
         * 分享
         * */
        share: function (obj) {
            var _obj = obj || {},
                _setShareInfo = _obj.setShareInfo;
            window._bd_share_config = {
                common: {
                    bdText: '', //自定义分享内容
                    bdDesc: '', //自定义分享摘要
                    bdUrl: '', //自定义分享url地址
                    bdPic: '', //自定义分享图片
                    bdCustomStyle: "",
                    onBeforeClick: _setShareInfo,
                    onAfterClick: function () {
                        //                        common.msg.info('分享成功');
                    }
                },
                //分享按钮设置
                share: [{
                    tag: "share_1"
                }, {
                    tag: "share_2"
                }]
            };
            //插件的JS加载部分
            document.getElementsByTagName('head')[0].appendChild(document.createElement('script')).src = location.protocol + '/static/api/js/share.js?v=89860593.js?cdnversion=' + ~(-new Date() / 36e5);
        },

        appendHTML: function (container, htm) {
            var pnode = document.createElement('div'),
                nodes = null,
                fragment = document.createDocumentFragment();
            pnode.innerHTML = htm;
            cnodes = pnode.childNodes;
            for (var i = 0, len = cnodes.length; i < len; i++) {
                fragment.appendChild(cnodes[i].cloneNode(true));
            }
            container.appendChild(fragment);
            nodes = null;
            fragment = null;
        },

        /*
         * 加载js库
         * */
        loadScript: function (arrs, callBack) {
            //兼容ie8
            if (!Array.prototype.indexOf) {
                Array.prototype.indexOf = function (elt /*, from*/ ) {
                    var len = this.length >>> 0;
                    var from = Number(arguments[1]) || 0;
                    from = (from < 0) ? Math.ceil(from) : Math.floor(from);
                    if (from < 0)
                        from += len;
                    for (; from < len; from++) {
                        if (from in this &&
                            this[from] === elt)
                            return from;
                    }
                    return -1;
                };
            }
            //判断js是否已存在，存在则不用再添加
            var origin = location.origin;
            var allArr = [];
            $('head').find('script').each(function (idx, objDom) {
                allArr.push((objDom.src.split('.js')[0] + '.js').replace(origin, ''));
            });
            var arrsCopy = [];
            $.each(arrs, function (idx, objArr) {
                if (allArr.indexOf(objArr) != -1) {
                    arrsCopy.push(objArr);
                }
            });
            arrs = _.difference(arrs, arrsCopy);
            if (arrs.length <= 0) {
                callBack && callBack();
                return;
            }
            var len = arrs.length;
            for (var idx in arrs) {
                var url = arrs[idx];
                (function (url) {
                    var _script = document.createElement('script');
                    _script.setAttribute('type', 'text/javascript');
                    _script.setAttribute('src', url);
                    document.getElementsByTagName('head')[0].appendChild(_script);
                    // IE和opera支持onreadystatechange
                    // safari、chrome、opera支持onload
                    if (/msie/.test(window.navigator.userAgent.toLowerCase())) {
                        _script.onreadystatechange = function () {
                            if (this.readyState == 'loaded' || this.readyState == 'complete') {
                                len--;
                                if (len === 0) {
                                    callBack && callBack();
                                }
                            }
                        };
                    } else if (/gecko/.test(window.navigator.userAgent.toLowerCase()) || /opera/.test(window.navigator.userAgent.toLowerCase())) {
                        _script.onload = function () {
                            len--;
                            if (len === 0) {
                                callBack && callBack();
                            }
                        };
                    } else {
                        len--;
                        if (len === 0) {
                            callBack && callBack();
                        }
                    }
                })(url);
            }
        },
        /*网站头部动画*/
        contrlScrollHead: function () {
            var self = this;
            var $headerBar = $('.nav-wrap'),
                headHeight = $headerBar.height(),
                scrollToBottom = function () {
                    var startScrollTop = common.getScrollTop();
                    if (startScrollTop > headHeight) {
                        $headerBar.addClass('nav-moveup');
                    }
                },
                scrollToTop = function () {
                    $headerBar.removeClass('nav-moveup');
                };

            function scroll(fn) {
                var beforeScrollTop = common.getScrollTop(),
                    beforeTime = new Date().getTime(),
                    fn = fn || function () {};
                $(window).scroll(function () {
                    self.throttle(function () {
                        var afterScrollTop = common.getScrollTop(),
                            afterTime = new Date().getTime(),
                            delta = afterScrollTop - beforeScrollTop;
                        if (delta === 0 || afterTime - beforeTime < 100) return false;
                        fn(delta > 0 ? "down" : "up");
                        beforeScrollTop = afterScrollTop;
                        beforeTime = afterTime;
                    });

                });
            }
            scroll(function (direction) {
                if (direction === 'down') {
                    scrollToBottom();
                } else if (direction === 'up') {
                    scrollToTop();
                }
            });

        },
        /*
         * 节流函数
         * 原理：利用定时器，让函数延迟执行，如果在延迟时间之内throttle函数被调用，则删除上一次调用，这次调用达到延迟时间之后被再次执行，如此往复。
         * method:回调函数
         * content:上下文对象
         * delay:延迟执行时间
         * */
        throttle: function (method, time) {
            var self = this;
            clearTimeout(self.timer);
            self.timer = setTimeout(function () {
                method();
            }, time || 50);
        },
     
        /*
         * 全局事件
         * */
        globalEvent: function () {
            
            //检测头部消息
            // this.checkhasnewmessage();
           
            //百度统计
            common.bdHM();
           
            // 侧边栏
            return false;
            (function () {
                $.get('/assets/js/template/sliderBar.htm', function (htm) {
                    $('body').append(htm);
                    // 初始化top事件
                    var $goTop = $('#go-top');
                    var timer;
                    $goTop.bind('click', function () {
                        var scrollHeight = common.getScrollHeight();
                        new function () {
                            if (scrollHeight <= 0) {
                                clearTimeout(timer);
                                return;
                            } else {
                                scrollHeight -= 50;
                            }
                            window.scrollTo(0, scrollHeight);
                            timer = setTimeout(arguments.callee, 10);
                        };
                    });
                    $(window).scroll(function () {
                        fixedPos();
                    });
                    fixedPos();

                    function fixedPos() {
                        var scrollHeight = common.getScrollHeight();
                        if (scrollHeight > 200) {
                            $goTop.show();
                        } else {
                            $goTop.hide();
                        }
                    }
                });
            })();
        },
        //获取滚动距离
        getScrollHeight: function () {
            return document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
        },
        /*
         * 检测头部消息
         * */
        checkhasnewmessage: function () {
            common.ajax({
                url: '/home/checkhasnewmessage',
                notshowloadbox: true,
                success: function (result) {
                    if (result.MessageNum > 0) {
                        $('.message-notification-active').show().text(result.MessageNum);
                    } else {
                        $('.message-notification-active').hide();
                    }
                }
            });
        },


        /*百度统计*/
        bdHM: function () {
            //百度统计
            (function () {
                var hm = document.createElement("script");
                hm.src = "https://hm.baidu.com/hm.js?564ffd607890702e4f927f4f6276294a";
                document.body.appendChild(hm);
            })();
        },

        /*
         * 图片延迟加载
         * */
        lazyImg: function (param) {
            param = param || {};
            var $lazyImg = param.$lazyImg || $('img.lazy-img'),
                load = param.load,
                limit = param.limit || 30;
            common.loadScript(['/assets/js/plugs/jquery.lazyload.js'], function () {
                if ($lazyImg.length > 0) {
                    $lazyImg.lazyload({
                        effect: "fadeIn", // 载入使用何种效果
                        failurelimit: limit,
                        skip_invisible: true,
                        load: load
                    });
                }

            });
        },

        /*普通弹框*/
        baseDialog: function (obj) {
            obj = obj || {};
            var callbackOk = obj.callbackOk;
            var callbackCancle = obj.callbackCancle;
            var htm = '<div id="base-dialog">' +
                '<div class="mask"></div>' +
                '<div class="dialog">' +
                '<div class="dialog-head"><span class="dialog-title">' + obj.title + '</span></div>' +
                '<div class="dialog-close">×</div>' +
                '<div class="dialog-wrap">' +
                '<div class="dialog-content">' +
                '<p>' + obj.content + '</p>' +
                '</div>' +
                '<div class="dialog-btn-wrap">' +
                '<button class="btn btn-blue" id="dialog-ok" style="display: inline-block">确定</button>' +
                '<button class="btn btn-grey" id="dialog-cancel" style="display: inline-block">取消</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            common.appendHTML(document.body, htm);
            var $baseDialog = $('#base-dialog');
            $('#dialog-ok').unbind('click').bind('click', function () {
                callbackOk && callbackOk();
                $baseDialog.remove();
            });
            $('.dialog-close').unbind('click').bind('click', function () {
                callbackCancle && callbackCancle();
                $baseDialog.remove();
            });
            $('#dialog-cancel').unbind('click').bind('click', function () {
                callbackCancle && callbackCancle();
                $baseDialog.remove();
            });
        },

        /*
         * 常用提示框
         * CFB.msg.info("你好");      蓝色    普通提示信息
         * CFB.msg.warning("你好");   红色    错误提示信息
         * CFB.msg.error("你好");     警示色  警告提示信息
         * CFB.msg.success("你好");   绿色    成功提示信息
         * CFB.msg.info("你好",5000); 停留5秒
         * */
        msg: function () {
            //信息提示
            function tip(message, type, timeout, refresh) {
                var _tip = {};
                type = type || 'info';
                timeout = timeout || 2500;
                var div = document.getElementById("_tips");
                if (!div) {
                    var htmTip = '<div id="_tips" class="_tips"><span id="tip_icon" class="tip_icon"></span><span id="tip_text" class="tip_text"></span></div>';
                    common.appendHTML(document.body, htmTip);
                }

                div = document.getElementById("_tips");
                div.style.position = 'fixed';
                div.style.left = '50%';
                div.style.top = '0px';

                div.style.padding = '12px 14px';
                div.style.borderRadius = '3px';
                div.style.fontSize = '14px';
                div.style.fontWeight = 'bold';
                div.style.fontFamily = 'serif';
                div.style.color = '#fff';
                div.style.boxShadow = 'rgba(0, 0, 0, 0.2) 0 0 3px 1px';
                div.style.opacity = '1';
                div.style.filter = 'alpha(opacity=100)';
                div.style.zIndex = '99999999';
                div.style.transition = 'transform .3s';
                div.style.transform = 'translateY(100%)';
                div.style.webkitTransform = 'translateY(100%)';
                div.style.oTransform = 'translateY(100%)';
                div.style.mozTransform = 'translateY(100%)';
                div.style.msTransform = 'translate(0,100%)';


                var text = document.getElementById("tip_text");
                text.style.verticalAlign = 'middle';
                text.innerHTML = message;



                var tip = document.getElementById("tip_icon");
                tip.style.display = 'inline-block';
                tip.style.width = '27px';
                tip.style.height = '27px';
                tip.style.verticalAlign = 'middle';
                tip.style.marginRight = '10px';
                tip.style.background = 'url(data:image/png;base64,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0p8zAABBJWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS41LWMwMTQgNzkuMTUxNDgxLCAyMDEzLzAzLzEzLTEyOjA5OjE1ICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICAgICAgICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICAgICAgICAgIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIgogICAgICAgICAgICB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+QWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKTwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8eG1wOkNyZWF0ZURhdGU+MjAxNi0wNC0wNlQxNzoxNDo1NyswODowMDwveG1wOkNyZWF0ZURhdGU+CiAgICAgICAgIDx4bXA6TWV0YWRhdGFEYXRlPjIwMTYtMDQtMDZUMTc6Mjg6MTUrMDg6MDA8L3htcDpNZXRhZGF0YURhdGU+CiAgICAgICAgIDx4bXA6TW9kaWZ5RGF0ZT4yMDE2LTA0LTA2VDE3OjI4OjE1KzA4OjAwPC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9wbmc8L2RjOmZvcm1hdD4KICAgICAgICAgPHhtcE1NOkluc3RhbmNlSUQ+eG1wLmlpZDo1YmVjYjM3YS0zZmU1LTUyNDktYWEwNC03YThhZjk1OGNjODg8L3htcE1NOkluc3RhbmNlSUQ+CiAgICAgICAgIDx4bXBNTTpEb2N1bWVudElEPnhtcC5kaWQ6M2Y0OTVjM2ItNjhjNi03YjRmLWEyMGUtYzE3ZGI3OGZiNTE5PC94bXBNTTpEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06T3JpZ2luYWxEb2N1bWVudElEPnhtcC5kaWQ6M2Y0OTVjM2ItNjhjNi03YjRmLWEyMGUtYzE3ZGI3OGZiNTE5PC94bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpIaXN0b3J5PgogICAgICAgICAgICA8cmRmOlNlcT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+Y3JlYXRlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjNmNDk1YzNiLTY4YzYtN2I0Zi1hMjBlLWMxN2RiNzhmYjUxOTwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxNi0wNC0wNlQxNzoxNDo1NyswODowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPnNhdmVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6OThkMTQ3OTYtYmE2Ny01NTQ4LWFjNTMtZGRkOTc3NzEzNWNiPC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6d2hlbj4yMDE2LTA0LTA2VDE3OjIxOjEzKzA4OjAwPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpPC9zdEV2dDpzb2Z0d2FyZUFnZW50PgogICAgICAgICAgICAgICAgICA8c3RFdnQ6Y2hhbmdlZD4vPC9zdEV2dDpjaGFuZ2VkPgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+c2F2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDpiMjUyYjc2NS0wOWNhLWUyNDQtYWU5ZS0yOTc4ODQ5OTY4ZDM8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMTYtMDQtMDZUMTc6Mjg6MTUrMDg6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cyk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5jb252ZXJ0ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnBhcmFtZXRlcnM+ZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZzwvc3RFdnQ6cGFyYW1ldGVycz4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPmRlcml2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnBhcmFtZXRlcnM+Y29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmc8L3N0RXZ0OnBhcmFtZXRlcnM+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5zYXZlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjViZWNiMzdhLTNmZTUtNTI0OS1hYTA0LTdhOGFmOTU4Y2M4ODwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxNi0wNC0wNlQxNzoyODoxNSswODowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmNoYW5nZWQ+Lzwvc3RFdnQ6Y2hhbmdlZD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOlNlcT4KICAgICAgICAgPC94bXBNTTpIaXN0b3J5PgogICAgICAgICA8eG1wTU06RGVyaXZlZEZyb20gcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICA8c3RSZWY6aW5zdGFuY2VJRD54bXAuaWlkOmIyNTJiNzY1LTA5Y2EtZTI0NC1hZTllLTI5Nzg4NDk5NjhkMzwvc3RSZWY6aW5zdGFuY2VJRD4KICAgICAgICAgICAgPHN0UmVmOmRvY3VtZW50SUQ+eG1wLmRpZDozZjQ5NWMzYi02OGM2LTdiNGYtYTIwZS1jMTdkYjc4ZmI1MTk8L3N0UmVmOmRvY3VtZW50SUQ+CiAgICAgICAgICAgIDxzdFJlZjpvcmlnaW5hbERvY3VtZW50SUQ+eG1wLmRpZDozZjQ5NWMzYi02OGM2LTdiNGYtYTIwZS1jMTdkYjc4ZmI1MTk8L3N0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD4KICAgICAgICAgPC94bXBNTTpEZXJpdmVkRnJvbT4KICAgICAgICAgPHBob3Rvc2hvcDpDb2xvck1vZGU+MzwvcGhvdG9zaG9wOkNvbG9yTW9kZT4KICAgICAgICAgPHBob3Rvc2hvcDpJQ0NQcm9maWxlPnNSR0IgSUVDNjE5NjYtMi4xPC9waG90b3Nob3A6SUNDUHJvZmlsZT4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzIwMDAwLzEwMDAwPC90aWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WVJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+MTwvZXhpZjpDb2xvclNwYWNlPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+MTA1PC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjI3PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz697JnPAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAOySURBVHjazJrLaxRBEIe/DRpQJNkgmwg+QEEvIgoinn38BR7EJCeTk4gnwbj5A4yPi2hy8CIIUU8qevaB5BBEFi/JOQcVJSq+QCFofh6sDZt1Zme6e2acgoZlurr6m6md6erqqkgiQarAMeAIsB/YBPQC34B3QAN4AtwDvlKMlJEpN8ZKBydVgTpwBugGXgAvgQXgJ7AO2A4cAA4CS8A14CLwJccbLxtT/oySotqwpI+SPkgalzQQo9dsA6b3wcYNJ+j7tDIyFcLYfqEi6bL+yi1JfY6QfTZOki6ZvdAbLyNToYztyhOSfks6Ewh92uxMZPAAyshUKGOrwpB58nxG4GNmbyjARhmZfBlbxYmx2dEv6bOkuxn/w+6Y3QGPsWVkCmFM66R/GJsXJ23x6sv4gfSZ3UmPsWVkCmF0cdIqRiRVJf2QVM8p4hk3+1WHMWmYTkiqdeivSRrMkMmH0ddJqxiRNCJpWdK2AOBu83qUjW0GNuJgL4nphPXPxTiqZn3LppsFkytjqJNWGJvfv0Zg+DltBl/FhLgNm8dl3WgkrAVzNme7o2ptff0xNlyZXBlDnbTC2AXsBWYCdtgXgGHbOZ8FolIYMzZPWkliWgQOA/PAbuAZULP2zK7Nm85ijA1XJlfGLGQG2LsG2GIpCx85BZwHfgPHgacxegs2T1pJw9R01NMWR5HSQT5MPoyhsgBs6QJ67C2Ikq3ATdNpl2Fgyt6c08DDDpMtxdiIk05Mnd6opoMOJTjIh8mXMUSWgJ4uy8qujUq+Ag+Ak8Bzy+I25bA5rwKMAzcSJusGvjvAxTFFph89H4ArUwgjIYxdwBtgR8zNjwLvgX3ALLAL2APcNwNXLXubJNuB1w5wcUzt0r4Gta9RWTL5MobIX8YUUcpOSQsWlSxKemu/px2SlVlHd1FRXC3mGiWJ7nxaQ9IdJI2miPc3S5pvCSEf2d4obby/bPOkhUtiqjmE4LWMmFwZQ9sKo8vOeaOkF5JmJa13mKyeQ8Zh0GEzO5gRU9EZh3prxgFJU/YpS8pBbZDU63gji2bf9SEkMfmmhUKYXBl9nbSKsfWE8HPgNzqq3Ta7mzzGlpEphNHFSasYo85FxjJ6GOfMXsixdRmZCmeMO2Ecy2CiX3aknNWpZ5mYCmWMSpZeMU/e9lhYqzZOZierGoeyMRXK2Knq5VNL1Ut/ihPKuul/yrFaqGxMhTBmXXd3HZgoWd1d3ky5M1YcKliPtlRi9lju6r1VYj7+TxWsZWLKjfHPAFkewCuqdKnIAAAAAElFTkSuQmCC)';
                if (type == 'success') {
                    tip.style.backgroundPosition = '0 0';
                    div.style.backgroundImage = '#419641';
                    div.style.backgroundImage = '-webkit-linear-gradient(#5cb85c,#419641)';
                    div.style.backgroundImage = '-o-linear-gradient(#5cb85c,#419641)';
                    div.style.backgroundImage = '-webkit-gradient(#5cb85c,#419641)';
                    div.style.backgroundImage = 'linear-gradient(#5cb85c,#419641)';
                } else if (type == 'error') {
                    tip.style.backgroundPosition = '-37px 0';
                    div.style.backgroundImage = '#c12e2a';
                    div.style.backgroundImage = '-webkit-linear-gradient(#d9534f,#c12e2a)';
                    div.style.backgroundImage = '-o-linear-gradient(#d9534f,#c12e2a)';
                    div.style.backgroundImage = '-webkit-gradient(#d9534f,#c12e2a)';
                    div.style.backgroundImage = 'linear-gradient(#d9534f,#c12e2a)';
                } else if (type == 'warning') {
                    tip.style.backgroundPosition = '-78px 0';
                    div.style.backgroundImage = '#eb9316';
                    div.style.backgroundImage = '-webkit-linear-gradient(#f0ad4e,#eb9316)';
                    div.style.backgroundImage = '-o-linear-gradient(#f0ad4e,#eb9316)';
                    div.style.backgroundImage = '-webkit-gradient(#f0ad4e,#eb9316)';
                    div.style.backgroundImage = 'linear-gradient(#f0ad4e,#eb9316)';
                } else if (type == 'info') {
                    tip.style.backgroundPosition = '-78px 0';
                    div.style.backgroundImage = '#2aabd2';
                    div.style.backgroundImage = '-webkit-linear-gradient(#5bc0de,#2aabd2)';
                    div.style.backgroundImage = '-o-linear-gradient(#5bc0de,#2aabd2)';
                    div.style.backgroundImage = '-webkit-gradient(#5bc0de,#2aabd2)';
                    div.style.backgroundImage = 'linear-gradient(#5bc0de,#2aabd2)';
                }

                div.style.marginLeft = -(div.clientWidth / 2) + 'px';

                var self = this;
                clearTimeout(this.timmer);
                clearTimeout(this.timmerRefresh);
                this.timmer = setTimeout(function () {
                    div.style.opacity = '0';
                    div.style.transform = 'translateY(-100%)';
                    var browserName = navigator.appName,
                        versionArr = navigator.appVersion.split(";"),
                        version = versionArr.length >= 2 && versionArr[1].replace(/[ ]/g, "");
                    if (browserName === 'Microsoft Internet Explorer' && (version === "MSIE8.0" || version === "MSIE9.0")) { //小于ie9
                        div.style.filter = 'alpha(opacity=0)';
                    } else {
                        div.style.transition = 'all 1s';
                    }
                    if (refresh === 'refresh') {
                        self.timmerRefresh = setTimeout(function () {
                            location.reload();
                        }, 1000);
                    }
                }, timeout);
            }

            var m = {};
            var method = ["info", "error", "warning", "success"];
            for (var i = 0; i < method.length; i++) {
                m[method[i]] = (function () {
                    var type = method[i];
                    return function (message, timeout, refresh) {
                        tip(message, type, timeout, refresh);
                    };
                })();
            }
            return m;
        }(),



        /*
         * 添加loading
         * */
        showloadbox: function () {
            var IMG = '<img style="position: fixed; width: 50px; height: 50px; left: 50%; top:50%;margin-left: -25px;margin-top:-25px;z-index: 9999999;" src="/assets/images/loading/circles.svg" alt="loading">';
            if (navigator.userAgent.indexOf('MSIE') >= 0) { //ie
                IMG = '<img style="position: fixed; width: 37px; height: 37px; left: 50%; top:50%;padding:5px;margin-left: -18px;margin-top:-18px;background:#fff;border-radius:5px;z-index: 9999999;" src="/assets/images/loading/ie-loading.gif" alt="loading">';
            }
            var loading = '<div id="single-loading"><div style="position: fixed; left: 0;right:0;top:0;bottom:0;background: #000;opacity: 0.1;filter: alpha(opacity=10);z-index: 9999998;"></div>' + IMG + '</div>';
            common.appendHTML(document.body, loading);
        },

        /*
         * 移除loading
         * */
        removeloadbox: function () {
            $('#single-loading').remove();
        },

        /*公共ajax方法*/
        ajax: function (options) {
            if (typeof options.data === 'string') {
                throw new Error('data参数必须为JSON对象');
                return;
            };
            options = options || {};
            var opt = {};
            opt.success = options.success,
                opt.notshowloadbox = options.notshowloadbox,
                opt.error = options.error;
            opt.beforeSend = options.beforeSend;
            var globalParam = {
                type: 'post',
                dataType: 'json',
                cache: false,
                timeout: 20000
            };
            for (var param in globalParam) {
                if (!options[param]) {
                    options[param] = globalParam[param];
                }
            }
            options.beforeSend = function () {
                if (!opt.notshowloadbox) {
                    common.showloadbox();
                }
                opt.beforeSend && opt.beforeSend();
            };
            options.success = function (result) {
                opt.success && opt.success(result);
            };
            options.complete = function () {
                if (!opt.notshowloadbox) {
                    common.removeloadbox();
                }
            };
            options.error = function (xhr) {
                if (xhr.status == 499) {
                    location.href = "/account/login";
                    return;
                }
                opt.error && opt.error();
            };
            $.ajax(options);
        },

        /**
         * 事件绑定函数
         */
        bindEvent: function (obj, contain) {
            var $contain = $('body') || $(contain);
            for (var ev in obj) {
                (function (ev) {
                    for (var wrap in obj[ev]) {
                        if (wrap === 'body' || wrap === 'window') {
                            $contain.on(ev, obj[ev][wrap]);
                        } else {
                            $contain.on(ev, wrap, obj[ev][wrap]);
                        }

                    }
                })(ev);
            }
        },

        /*判断属性是否存在于原型中*/
        hasPrototypeProperty: function (obj, name) {
            return !obj.hasOwnProperty && (name in obj);
        },

        /*浏览器滚动高度*/
        getScrollTop: function () {
            return document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
        },
        /*获取滚动条与页面底部的距离*/
        getScrollBot: function () {
            var marginBot = 0;
            if (document.compatMode === "CSS1Compat") {
                marginBot = document.documentElement.scrollHeight - (document.documentElement.scrollTop + document.body.scrollTop) - document.documentElement.clientHeight;
            } else {
                marginBot = document.body.scrollHeight - document.body.scrollTop - document.body.clientHeight;
            }

            return marginBot;
        },

    };
    
    return common;
});