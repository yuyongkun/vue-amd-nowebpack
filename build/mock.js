var Mock = require("mockjs");
exports.data = function () {
    return [
        {
            route: '/topiclist',
            handle: function (req, res, next) {
                res.writeHead(200, {
                    "Content-type": "application/json;charset=UTF-8"
                });
                var Random = Mock.Random;
                Random.integer();
                Random.string('lower', 4);
                Random.date('yyyy-MM-dd');
                var data = Mock.mock({
                    "success": true,
                    "datalist|4": [{
                        "topic_id|+1": 1,
                        "userportrait": "https://images.skycreative.cn/avatar/trykle.png",
                        "username": "@string('lower',4)",
                        "useroccupation": "@string()",
                        "comment_content": "@paragraph(2,5)",
                        "datetime": "@datetime('MM-dd HH:mm')",
                        "comment_amount": "@integer(1, 100)",
                        "thumb_amount": "@integer(1, 100)",
                    }]
                });
                res.write(JSON.stringify(data));
                res.end();
            }
        },
        {
            route: '/commentlist',
            handle: function (req, res, next) {
                res.writeHead(200, {
                    "Content-type": "application/json;charset=UTF-8"
                });
                var Random = Mock.Random;
                Random.integer();
                Random.string('lower', 4);
                Random.date('yyyy-MM-dd');
                var data = Mock.mock({
                    "success": true,
                    "commentlist|4": [{
                        "comment_id|+1": 50,
                        "userportrait": "https://images.skycreative.cn/avatar/trykle.png",
                        "username": "@string('lower',4)",
                        "comment_content": "@string('lower',50)",
                        "datetime": "@datetime('MM-dd HH:mm')",
                        "thumb_amount": "@integer(1, 100)",
                        "replylist|1-5": [
                            {
                                "reply_id|+1": 1,
                                "username_from": "@string('lower',4)",
                                "username_to": "@string('lower',4)",
                                "reply_content": "@paragraph(1,3)",
                                "datetime": "@datetime('MM-dd HH:mm')",
                                "thumb_amount": "@integer(1, 100)",
                            }
                        ]
                    }]
                });
                res.write(JSON.stringify(data));
                res.end();
            }
        }
    ]
};