define(['jquery', 'common'], function ($, Common) {
    function UploadForm(target, success) {
        this.target = target;
        this.success = success;
        this.initPage();
    }

    UploadForm.prototype.initEvent = function () {
        var self = this;
        $('.pic-upload-select .icon-plus').bind('click', function (e) {
            Common.formupload({
                target: e.target,
                uploadurl: '/upload',
                uploadenable: function (file) {
                    var _len = file.files.length;
                    var items = '';
                    for (var i = 0; i < _len; i++) {
                        items += '<div class="pic-upload-item pic-upload-imgwrap">\
                                    <div class="pic-upload-img">\
                                        <img src="/assets/images/loading/ie-loading.gif" />\
                                    </div>\
                                    <div class="pic-upload-remove">×</div>\
                                </div>';
                    }
                    $(items).insertBefore('.pic-upload-select')

                },
                success: function (result) {
                    var datalist=result.datalist;
                    var items = '';
                    for (var i = 0; i < datalist.length; i++) {
                        var data=datalist[i];
                        items += '<div class="pic-upload-item pic-upload-imgwrap">\
                                    <div class="pic-upload-img">\
                                        <img src="'+data+'" />\
                                    </div>\
                                    <div class="pic-upload-remove">×</div>\
                                </div>';
                    }
                    $('#pic-upload-dialog .pic-upload-imgwrap').remove();
                    $(items).insertBefore('.pic-upload-select')
                    self.success(result)
                }
            })
        })
        $('.pic-upload-close').bind('click', function () {
            $('#pic-upload-dialog').remove();
        })

    }

    UploadForm.prototype.initPage = function () {
        var htm = `
    <div class="pic-upload-dialog" id="pic-upload-dialog">
    <div class="pic-upload-operate">
        <div class="pic-upload-title">本地上传图片</div>
        <div class="pic-upload-txt">共3张，还能上传<span class="pic-upload-num">5</span>张</div>
        <div class="btn-yellow pic-upload-submit">确认上传</div>
        <div class="icon-close pic-upload-close"></div>
    </div>
   
    <div class="pic-upload-btm">
        <div class="pic-upload-preview">
            <div class="pic-upload-item pic-upload-select">
                <div class="icon-plus"></div>
            </div>
        </div>
    </div>
</div>
    `;
        var picUploadDialog = document.getElementById('pic-upload-dialog');
        if (picUploadDialog) {
            document.body.removeChild(picUploadDialog);
        }
        $('body').append(htm);
        picUploadDialog = document.getElementById('pic-upload-dialog');
        var _offset = this.target.offset()
        picUploadDialog.style.left = _offset.left + 'px';
        picUploadDialog.style.top = _offset.top + 30 + 'px';
        this.initEvent();

    }
    return UploadForm;
});