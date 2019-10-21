define([
    'jquery',
    'class',
    'common',
    'util',
    'emoji',
    'text!../view/topic.htm',
    'text!../view/comment.htm'
], function ($, Class, Common, Util, qqFace, topicHtm, commentHtm) {
    var Index = Class.create({
        initialize: function () {
            this.initPage();
            this.bindEvent();
        },

        initPage: function () {
            var $topicListWrap = $('#topic-list-wrap');
            Common.ajax({
                url: '/topiclist',
                success(result) {
                    console.log(result)
                    $topicListWrap.html(_.template(topicHtm)({
                        list: result.datalist
                    }));
                }
            })
            this.initEmotion();
        },

        bindEvent: function () {
            Common.bindEvent({
                'click': {
                    '.msg-comment': $.proxy(this.commentShow, this), //显示评论内容
                    '.comment-opt-reply': $.proxy(this.replyComment, this), //回复
                },

            });

        },
        initEmotion: function () {
            $('.emoji_container').remove();
            // 主输入框表情包
            $("#publish_txt").emoji({
                button: ".publish-icon-emotion",
                showTab: false,
                animation: 'fade',
                icons: [{
                    path: "/assets/js/plugs/emoji/dist/img/qq/",
                    maxNum: 91,
                    excludeNums: [41, 45, 54],
                    file: ".gif",
                    placeholder: "#qq_{alias}#"
                }]
            });

            // 评论输入框表情包
            $("#comment-opreate .comment-ipt").emoji({
                button: "#comment-opreate .icon-comment-expression",
                showTab: false,
                animation: 'fade',
                icons: [{
                    path: "/assets/js/plugs/emoji/dist/img/qq/",
                    maxNum: 91,
                    excludeNums: [41, 45, 54],
                    file: ".gif",
                    placeholder: "#qq_{alias}#"
                }]
            });
            $("#reply-opreate .comment-ipt").emoji({
                button: "#reply-opreate .icon-comment-expression",
                showTab: false,
                animation: 'fade',
                icons: [{
                    path: "/assets/js/plugs/emoji/dist/img/qq/",
                    maxNum: 91,
                    excludeNums: [41, 45, 54],
                    file: ".gif",
                    placeholder: "#qq_{alias}#"
                }]
            });

        },
        replyComment: function (e) {
            const replyHtm = `<div class="reply-opreate" id="reply-opreate">
            <div class="comment-ipt-area">
                <input class="comment-ipt" type="text">
            </div>
            <div class="comment-btm">
                <div class="comment-options">
                    <span class="comment-ico icon-comment-expression"></span>
                    <span class="comment-ico icon-comment-file"></span>
                </div>
                <div class="btn-yellow comment-send">评论</div>
            </div>
        </div>`;
            const $currentTarget = $(e.currentTarget);
            const $replyItem = $currentTarget.closest('.reply-item');
            const $commentSelf = $currentTarget.closest('.comment-self');
            const $replyOpreate = $('#reply-opreate');
            if ($replyItem.find('#reply-opreate').length > 0 || $commentSelf.siblings('#reply-opreate').length > 0) {
                $replyOpreate.remove();
                this.initEmotion();
                return;
            } else {
                $replyOpreate.remove();
            }
            if ($replyItem.length > 0) {
                $replyItem.append(replyHtm);
            } else if ($commentSelf.length > 0) {
                $commentSelf.after(replyHtm);
            }
            this.initEmotion();
        },
        commentShow: function (e) {
            const self = this;
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
                        commentlist: result.commentlist
                    }));
                    self.initEmotion();
                }
            })
        },

    });
    return Index;
});