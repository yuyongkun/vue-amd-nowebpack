define([
    'jquery',
    'class',
    'common',
    'util',
    'text!../view/topic.htm',
    'text!../view/comment.htm'
], function ($, Class, Common, Util, topicHtm,commentHtm) {
    var Index = Class.create({
        initialize: function () {
            this.initPage();
            this.bindEvent();
        },

        initPage: function () {
            var $topicListWrap=$('#topic-list-wrap');
            Common.ajax({
                url: '/topiclist',
                success(result) {
                    console.log(result)
                    $topicListWrap.html(_.template(topicHtm)({
                        list:result.datalist
                    }));
                }
            })
        },

        bindEvent: function () {
            Common.bindEvent({
                'click': {
                    '.msg-comment': $.proxy(this.commentShow, this), //显示评论内容
                },

            });
        },
        commentShow: function (e) {
            $('#comment-wrap').remove();
            const loadingHtm =
                `
            <div class="comment-loading" id="comment-loading">
                <i class="comment-loading-icon"></i>正在加载，请稍后...
            </div>
            `;
            const $commentList = $(e.currentTarget).closest('.topic-list');
            $commentList.after(loadingHtm);
            Common.ajax({
                url: '/commentlist',
                success(result) {
                    console.log(result)
                    $('#comment-loading').remove();
                    $commentList.after(_.template(commentHtm)({
                        commentlist:result.commentlist
                    }));
                }
            })
            // setTimeout(() => {
            //     $('#comment-loading').remove();
            //     $commentList.after(commentHtm);
            // }, 1000);
        },

    });
    return Index;
});