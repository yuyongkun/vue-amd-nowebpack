define([
    'jquery',
    'class',
    'common',
    'util',
    'vue',
    'text!../view/topic.htm',
    'text!../view/comment.htm',
    '../../../global/upload_form',
    'emoji',
], function ($, Class, Common, Util, Vue, topicHtm, commentHtm, uploadForm) {
    const Index = Class.create({
        initialize: function () {
            this.loadingHtm =
                '<div class="comment-loading" id="comment-loading">\
                <i class="comment-loading-icon"></i>正在加载，请稍后...\
            </div>';
            this.$latestNews = $('#latest-news');
            this.initPage();
            this.bindEvent();
        },
        initPage: function () {
            // 初始化数据列表
            this.initTopic();
            //初始化操作面板表情
            this.initEmotion();
            //检查最新消息
            this.latestNews();
        },
        bindEvent: function () {
            Common.bindEvent({
                'click': {
                    '.msg-comment': $.proxy(this.commentShow, this), //显示评论内容
                    '.comment-opt-reply': $.proxy(this.replyComment, this), //回复
                    '.publish-icon-pic,.icon-comment-file': $.proxy(this.selectPicOpt, this), //选择图片
                    '#latest-news': $.proxy(this.fetchLatestNews, this), //查看最新消息
                },
            });
        },

        initTopic: function () {
            const $topicListWrap = $('#topic-list-wrap');
            $topicListWrap.html(this.loadingHtm);
            Common.ajax({
                url: '/topiclist',
                notshowloadbox: true,
            }).then(result => {
                if (result.success) {
                    $topicListWrap.html(_.template(topicHtm)({
                        list: result.datalist
                    }));
                }
            });
        },
     
        selectPicOpt: function (e) {
            new uploadForm($(e.currentTarget), function (result) {
                console.log(result);
            })
        },

        initEmotion: function () {
            $('.emoji_container').remove();
            // 主输入框表情包
            let emoji = {
                showTab: false,
                animation: 'fade',
                icons: [{
                    path: "/assets/js/plugs/emoji/dist/img/qq/",
                    maxNum: 91,
                    excludeNums: [41, 45, 54],
                    file: ".gif",
                    placeholder: "#qq_{alias}#"
                }]
            };
            $("#publish_txt").emoji({
                button: ".publish-icon-emotion",
                ...emoji
            });

            // 评论输入框表情包
            $("#comment-operate .comment-ipt").emoji({
                button: "#comment-operate .icon-comment-expression",
                ...emoji
            });
            $("#reply-operate .comment-ipt").emoji({
                button: "#reply-operate .icon-comment-expression",
                ...emoji
            });

        },
        replyComment: function (e) {
            const replyHtm = `<div class="reply-operate" id="reply-operate">
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
            const $replyoperate = $('#reply-operate');
            if ($replyItem.find('#reply-operate').length > 0 || $commentSelf.siblings('#reply-operate').length > 0) {
                $replyoperate.remove();
                this.initEmotion();
                return;
            } else {
                $replyoperate.remove();
            }
            if ($replyItem.length > 0) {
                $replyItem.append(replyHtm);
            } else if ($commentSelf.length > 0) {
                $commentSelf.after(replyHtm);
            }
            this.initEmotion();
        },
        commentShow: function (e) {
            const $commentList = $(e.currentTarget).closest('.topic-list');
            const $next = $commentList.next('#comment-wrap');
            if ($next && $next.length > 0) {
                $next.remove();
                return;
            }
            $commentList.after(this.loadingHtm);
            Common.ajax({
                url: '/commentlist',
                notshowloadbox: true,
            }).then(result => {
                if (result.success) {
                    $('#comment-loading').remove();
                    $commentList.after(_.template(commentHtm)({
                        commentlist: result.commentlist
                    }));
                    this.initEmotion();
                }

            })
        },
        fetchLatestNews: function () {
            this.initTopic();
        },
        latestNews: function () {
            Common.ajax({
                url: '/latestnews',
                notshowloadbox: true,
            }).then(result => {
                if (result.success) {
                    if (result.hasMsg) {
                        this.$latestNews.show();
                    } else {
                        this.$latestNews.hide();
                    }
                }
            })
        },

    });
    return Index;
});