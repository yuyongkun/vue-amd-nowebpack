define(['jquery', 'webuploader', 'common', 'dialog', 'cropper'], function ($, WebUploader, Common, Dialog) {
    //选择相片集
    var sampleReelsCount = 0;
    var uploadSpan = $('#upload-folder span')[0];
    //var firstUpload = true;
    var uploadsuccessdata = [];//存放上传成功数据
    var $wrap = $('#uploader'),

        // 图片容器
        $queue = $('<ul class="filelist"></ul>')
        .appendTo($wrap.find('.queueList')),

        // 状态栏，包括进度和控制按钮
        $statusBar = $wrap.find('.statusBar'),

        // 文件总体选择信息。
        $info = $statusBar.find('.info'),

        // 上传按钮
        $upload = $wrap.find('.uploadBtn'),

        // 没选择文件之前的内容。
        $placeHolder = $wrap.find('.placeholder'),

        $progress = $statusBar.find('.progress').hide(),

        // 添加的文件数量
        fileCount = 0,

        // 添加的文件总大小
        fileSize = 0,

        // 优化retina, 在retina下这个值是2
        ratio = window.devicePixelRatio || 1,

        // 缩略图大小
        thumbnailWidth = 264 * ratio,
        thumbnailHeight = 160 * ratio,

        // 可能有pedding, ready, uploading, confirm, done.
        state = 'pedding',

        // 所有文件的进度信息，key为file id
        percentages = {},

        supportTransition = (function () {
            var s = document.createElement('p').style,
                r = 'transition' in s ||
                'WebkitTransition' in s ||
                'MozTransition' in s ||
                'msTransition' in s ||
                'OTransition' in s;
            s = null;
            return r;
        })(),

        // WebUploader实例
        uploader;

    // 实例化
    uploader = WebUploader.create({
        pick: {
            id: '#filePicker',
            label: '点击选择图片'
        },
        dnd: '#dndArea',
        paste: '#uploader',
        swf: '/assets/js/plugs/upload/Uploader.swf',
        chunked: false,//是否要分片处理大文件上传
        chunkSize: 512 * 1024,//如果要分片，分多大一片？ 默认大小为5M.
        //runtimeOrder: 'flash',
        sendAsBinary: false,
        server: uploadHost + 'api/file/upload',
        disableGlobalDnd: true, // 禁掉全局的拖拽功能。这样不会出现图片拖进页面的时候，把图片打开。
        fileNumLimit: 50,
        fileSizeLimit: 200 * 1024 * 1024, // 200 M
        fileSingleSizeLimit: 20 * 1024 * 1024, // 20 M
        duplicate: true,
        accept: {
            title: 'Images',
            extensions: 'gif,jpg,jpeg,bmp,png',
            //mimeTypes: 'image/*'
        },
        
    });
    $('#wrapper').css('visibility', 'visible');
    // 添加“添加文件”的按钮，
    uploader.addButton({
        id: '#filePicker2',
        label: '继续添加'
    });


    // 当有文件添加进来时执行，负责view的创建
    function addFile(file) {
        var $li = $('<li id="' + file.id + '">' +
                '<p class="title">' + file.name + '</p>' +
                '<p class="imgWrap"></p>' +
                '<p class="progress"><span></span></p>' +
                '</li>'),

            $btns = $('<div class="file-panel"><div class="file-panel-top">' +
                '<span class="cancel icon-bin2"></span>' +
                '<span class="setting-cover">设置封面</span></div>' +
                //'<span class="rotateRight">向右旋转</span>' +
                //'<span class="rotateLeft">向左旋转</span>'+
                '<div class="upload-addnotes">添加注释<div>'
+                '</div>').appendTo($li),
            $prgress = $li.find('p.progress span'),
            $wrap = $li.find('p.imgWrap'),
            $info = $('<p class="error"></p>'),

            showError = function (code) {
                switch (code) {
                    case 'exceed_size':
                        text = '文件大小超出';
                        break;

                    case 'interrupt':
                        text = '上传暂停';
                        break;

                    default:
                        text = '上传失败';
                        break;
                }

                $info.text(text).appendTo($li);
            };

        if (file.getStatus() === 'invalid') {
            showError(file.statusText);
        } else {
            // @todo lazyload
            $wrap.text('预览中');
            window.URL = window.URL || window.webkitURL;
            var imgsrc = window.URL.createObjectURL(file.source.source);
            //var oReader = new FileReader();
            //oReader.onload = function (e) {
            //    debugger;
            //}
            //oReader.readAsDataURL(file.source.source);
            uploader.makeThumb(file, function (error, src) {
                
                if (error) {
                    $wrap.text('不能预览');
                    return;
                }

                var img = $('<img data-imgsrc="' + imgsrc + '" src="' + src + '">');
                $wrap.empty().append(img);
            }, thumbnailWidth, thumbnailHeight);

            percentages[file.id] = [file.size, 0];
            file.rotation = 0;
        }
        //cur有三个过程,queued:加入到队列里面,progress:开始上传,complete:上传完成后更新状态
        file.on('statuschange', function (cur, prev) {
            if (prev === 'progress') {
                $prgress.hide().width(0);
            } else if (prev === 'queued') {
                $li.off('mouseenter mouseleave');
                //$btns.remove();
            }

            // 成功
            if (cur === 'error' || cur === 'invalid') {
                console.log(file.statusText);
                showError(file.statusText);
                percentages[file.id][1] = 1;
            } else if (cur === 'interrupt') {
                showError('interrupt');
            } else if (cur === 'queued') {
                percentages[file.id][1] = 0;
            } else if (cur === 'progress') {
                $info.remove();
                $prgress.css('display', 'block');
            } else if (cur === 'complete') {
                $li.append('<span class="success icon-correct"></span>');
            }

            $li.removeClass('state-' + prev).addClass('state-' + cur);
        });
        //$li.on('mouseenter', function () {
        //    $btns.stop().animate({ height: 30 });
        //});

        //$li.on('mouseleave', function () {
        //    $btns.stop().animate({ height: 0 });
        //});
        $btns.on('click', 'span', function () {
            if (this.className.indexOf('setting-cover') != -1) {
                var imgurl = $(this).closest('.file-panel').siblings('.imgWrap').find('img').data('imgsrc');
                var idx=$(this).closest('li.state-complete').index();
                var files = uploader.uploadData.files;
                window.initCropper({
                    imgurl: imgurl,
                    callback: function (base64) {
                        for (var i = 0, len = files.length; i < len; i++) {
                            files[i].IsCover = false;
                        }
                        files[idx].IsCover = true;
                        uploader.CoverBase64Data = base64;
                    }
                });
                return;
            }
            var index = $(this).index(),
                deg;

            switch (index) {
                case 0:
                    uploader.removeFile(file);
                    return;

                case 1:
                    file.rotation += 90;
                    break;

                case 2:
                    file.rotation -= 90;
                    break;
            }

            if (supportTransition) {
                deg = 'rotate(' + file.rotation + 'deg)';
                $wrap.css({
                    '-webkit-transform': deg,
                    '-mos-transform': deg,
                    '-o-transform': deg,
                    'transform': deg
                });
            } else {
                $wrap.css('filter', 'progid:DXImageTransform.Microsoft.BasicImage(rotation=' + (~~((file.rotation / 90) % 4 + 4) % 4) + ')');
                // use jquery animate to rotation
                // $({
                //     rotation: rotation
                // }).animate({
                //     rotation: file.rotation
                // }, {
                //     easing: 'linear',
                //     step: function( now ) {
                //         now = now * Math.PI / 180;

                //         var cos = Math.cos( now ),
                //             sin = Math.sin( now );

                //         $wrap.css( 'filter', "progid:DXImageTransform.Microsoft.Matrix(M11=" + cos + ",M12=" + (-sin) + ",M21=" + sin + ",M22=" + cos + ",SizingMethod='auto expand')");
                //     }
                // });
            }


        });

       


        $li.appendTo($queue);

        //添加注释
        var htm = '<div class="upload-addnotes-dialog">\
                      <div class="upload-addnotes-content">\
                          <div class="arrow-up"></div>\
                          <textarea class="upload-addnotes-area" placeholder="请输入注释"></textarea>\
                          <div class="btn-blue upload-addnotes-submit">提交</div>\
                      </div>\
                     <div class="upload-dialog-mask">×</div>\
                   </div>';
        $('body').off('click', '.upload-addnotes').on('click', '.upload-addnotes', function () {
            var that = this;
            if ($('.upload-addnotes-dialog').length <= 0) {
                $('body').append(htm);
            } else {
                $('.upload-addnotes-dialog').show();
            }
            $('.upload-addnotes-area').val($.trim(this.innerText).replace(/添加注释/,''));
            var _top = $(this).offset().top;
            var _left = $(this).offset().left;
            $('.upload-addnotes-dialog').css({
                'left': _left,
                'top': _top + 40,
            });
            var idx = $(this).closest('li.state-complete').index();
            //提交注释
            $('.upload-addnotes-submit').off('click').on('click', function () {
                var _val = $.trim($('.upload-addnotes-area').val());
                if (_val === '') {
                    Common.msg.error('注释内容不能为空');
                    return;
                }
                uploader.uploadData.files[idx].Description = _val;
                $(that).text(_val);
                $('.upload-addnotes-dialog').hide();
            });
            $('.upload-dialog-mask').off('click').on('click', function () {
                $('.upload-addnotes-dialog').hide();
            });
        });
        
       
    }

    // 负责view的销毁
    function removeFile(file) {
        var $li = $('#' + file.id);

        delete percentages[file.id];
        updateTotalProgress();
        $li.off().find('.file-panel').off().end().remove();
        for (var i in uploadsuccessdata) {
            if (uploadsuccessdata[i].uploadTime == file.uploadTime) {
                uploadsuccessdata.splice(i,1);
                break;
            }
        }
    }

    function updateTotalProgress() {
        var loaded = 0,
            total = 0,
            spans = $progress.children(),
            percent;

        $.each(percentages, function (k, v) {
            total += v[0];
            loaded += v[0] * v[1];
        });

        percent = total ? loaded / total : 0;

        spans.eq(0).text(Math.round(percent * 100) + '%');
        spans.eq(1).css('width', Math.round(percent * 100) + '%');
        updateStatus();
    }

    function updateStatus() {
        var text = '',
            stats;

        if (state === 'ready') {
            text = '选中' + fileCount + '张图片，共' +
                WebUploader.formatSize(fileSize) + '。';
        } else if (state === 'confirm') {
            stats = uploader.getStats();
            if (stats.uploadFailNum) {
                text = '已成功上传' + stats.successNum + '张照片至XX相册，' +
                    stats.uploadFailNum + '张照片上传失败，<a class="retry" href="#">重新上传</a>失败图片或<a class="ignore" href="#">忽略</a>'
            }

        } else {
            stats = uploader.getStats();
            text = '共' + fileCount + '张（' +
                WebUploader.formatSize(fileSize) +
                '），已上传' + stats.successNum + '张';

            if (stats.uploadFailNum) {
                text += '，失败' + stats.uploadFailNum + '张';
            }
        }

        $info.html(text);
    }

    function setState(val) {
        var file, stats;

        if (val === state) {
            return;
        }

        $upload.removeClass('state-' + state);
        $upload.addClass('state-' + val);
        state = val;

        switch (state) {
            case 'pedding':
                $placeHolder.removeClass('element-invisible');
                $queue.hide();
                $statusBar.addClass('element-invisible');
                uploader.refresh();
                break;

            case 'ready':
                $placeHolder.addClass('element-invisible');
                //$('#filePicker2').removeClass('element-invisible');
                $queue.show();
                $statusBar.removeClass('element-invisible');
                uploader.refresh();
                break;

            case 'uploading':
                //$('#filePicker2').addClass('element-invisible');
                $progress.show();
                $upload.text('暂停上传');
                break;

            case 'paused':
                $progress.show();
                $upload.text('继续上传');
                break;

            case 'confirm':
                $progress.hide();
                $upload.text('开始上传').addClass('disabled');

                stats = uploader.getStats();
                if (stats.successNum && !stats.uploadFailNum) {
                    setState('finish');
                    return;
                }
                break;
            case 'finish':
                stats = uploader.getStats();
                if (stats.successNum) {
                    // Common.msg.success('上传成功');
                } else {
                    // 没有成功的图片，重设
                    state = 'done';
                    location.reload();
                }
                break;
        }

        updateStatus();
    }


    //当文件被加入队列之前触发
    uploader.onBeforeFileQueued = function (file) {
        //if (file.size >= 5 * 1024 * 1024) {
        //    Common.msg.warning('已经过滤掉大于5M的图片');
        //    return false;
        //}
    };
    //当文件被加入队列以后触发
    uploader.onFileQueued = function (file) {
        fileCount++;
        fileSize += file.size;

        if (fileCount === 1) {
            $placeHolder.addClass('element-invisible');
            $statusBar.show();
        }

        addFile(file);
        setState('ready');
        updateTotalProgress();
    };
    uploader.onFilesQueued = function () {
        $upload.trigger('click');
    }
    //当文件被移除队列后触发
    uploader.onFileDequeued = function (file) {
        fileCount--;
        fileSize -= file.size;

        if (!fileCount) {
            setState('pedding');
        }

        removeFile(file);
        updateTotalProgress();

    };

    uploader.on('all', function (type) {
        var stats;
        switch (type) {
            case 'uploadFinished':
                setState('confirm');
                break;

            case 'startUpload':
                setState('uploading');
                break;

            case 'stopUpload':
                setState('paused');
                break;

        }
    });

    uploader.onError = function (code) {
        if (code === "F_DUPLICATE") {
            Common.msg.warning('含有重复的图片');
        } else if (code === "Q_TYPE_DENIED") {
            Common.msg.warning('不支持非图片格式上传');
        } else if (code === "F_EXCEED_SIZE") {
            Common.msg.warning('不支持大于10M的图片');
        } else {
            Common.msg.warning('Eroor' + code);
        }

    };
   
    //发送前触发，主要用来询问是否要添加附带参数
    uploader.on('uploadBeforeSend', function (obj, data, headers) {
        obj.file.uploadTime = new Date().getTime();
        delete data.id;
        delete data.name;
        delete data.type;
        delete data.size;
        delete data.lastModifiedDate;
    });
    //上传过程中触发，携带上传进度
    uploader.onUploadProgress = function (file, percentage) {
        var $li = $('#' + file.id),
            $percent = $li.find('.progress span');

        $percent.css('width', percentage * 100 + '%');
        percentages[file.id][1] = percentage;
        updateTotalProgress();
    };
    //当文件上传成功时触发
    uploader.onUploadSuccess = function (file, response) {
        if (response.success) {
            response.data[0].IsCover = file.IsCover;
            response.data[0].Description = file.Description;
            response.data[0].uploadTime = file.uploadTime;
            uploadsuccessdata = uploadsuccessdata.concat(response.data);
        }

    };

    //当所有文件上传结束时触发
    uploader.onUploadFinished = function () {
        uploader.uploadData = {
            files: uploadsuccessdata,
        }
        $upload.removeClass('disabled');
        setState('ready');
    };
    //点击开始上传按钮
    $upload.on('click', function () {
        if ($(this).hasClass('disabled')) {
            return false;
        }
        var param = $('#param')[0];
        uploader.options.formData.FilePath = param.getAttribute('data-dir');
        uploader.options.formData.FlorilegiumId = param.getAttribute('data-florilegiumid');
        uploader.options.formData.FlorilegiumMemberId = param.getAttribute('data-florilegiummemberid');
        uploader.options.formData.MemberName = param.getAttribute('data-membername');
        uploader.options.formData.WaterFlag = $('.works-moresetting-watermark .icon-correct').length > 0 ? true : false;
        if (state === 'ready') {
            uploader.upload();
        } else if (state === 'paused') {
            uploader.upload();
        } else if (state === 'uploading') {
            uploader.stop(true);
        }
    });
    $info.on('click', '.retry', function () {
        uploader.retry();
    });

    $info.on('click', '.ignore', function () {
        Common.msg.info(todo);
    });

    $upload.addClass('state-' + state);
    updateTotalProgress();
    return uploader;

});
