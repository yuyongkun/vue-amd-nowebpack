var Mock = require("mockjs");
exports.data = function () {
    return [
        {
            route: '/latestnews',
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
                    "hasMsg":"@boolean"
                });

                res.write(JSON.stringify(data));
                res.end();
            }
        },
        {
            route: '/upload',
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
                    "datalist": [
                        "http://lib.v5cg.com:8083/florilegium/88aa9488-e580-47b0-a86a-1c7827cf7eca/3892b32a-cf7a-48a3-a3c6-b701a6f1f9f1/d09624c5-b651-44c2-a3ff-db222797c91f_origin.jpg",
                        "http://lib.v5cg.com:8083/florilegium/88aa9488-e580-47b0-a86a-1c7827cf7eca/3892b32a-cf7a-48a3-a3c6-b701a6f1f9f1/344448f6-7074-40ed-902d-c163fb48eb95_origin.jpg",
                        "http://lib.v5cg.com:8083/florilegium/88aa9488-e580-47b0-a86a-1c7827cf7eca/3892b32a-cf7a-48a3-a3c6-b701a6f1f9f1/fbdae430-462a-4c54-8bfd-be4bc4a5db01_origin.jpg"
                    ]
                });

                res.write(JSON.stringify(data));
                res.end();
            }
        },
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
                    "datalist|2": [{
                        "topic_id|+1": 1,
                        "userportrait": "https://images.skycreative.cn/avatar/trykle.png",
                        "username": "@string('lower',4)",
                        "useroccupation": "@string()",
                        "comment_content": "@paragraph(1,2)",
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