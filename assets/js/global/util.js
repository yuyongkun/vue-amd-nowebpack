/*
 * 常用工具类
 * */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        window.Util = factory;
    }
})(function () {
    var util = {
        /*常用正则表达式*/
        regMap: {
            //制表符
            table: /\t/g,
            //换行符
            line: /\n/g,
            //正负整数或浮点数
            intOrFloat: /^(-)?\d+(\.\d+)?$/,
            // 手机号码
            MobileNo: /^1[34587]\d{9}$/,
            // 银行卡号（大于或等于16位的数字）
            CardNo: /^\d{16,}$/,
            // 短验证码（6位数字以上）
            MobileCode: /^\d{6,}$/,
            // 交易密码(6-16位数字或字母)
            OrderPassword: /^\S{6,16}$/,
            //千分位正则
            parseThousands: /(\d{1,3})(?=(\d{3})+(?:$|\.))/g,
            //每4位字符用空格隔开
            bankCardNo: /(\d{4})(?=\d)/g,
            //金额检测
            moneyTest: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
            //卡号屏蔽
            parseToStarNumber: /^(\d{4})(\d+)(\d{4})$/,
            // 后四位屏蔽
            parseRightFourStar: /^(\w+)(\w{4})$/,
            //日期格式检测
            parseDateFormat: /\b(\d{4})\b[^\d]+(\d{1,2})\b[^\d]+(\d{1,2})\b(\s(\d{1,2})\:(\d{1,2})\:(\d{1,2}))?[^\d]?/,
            // 出生日期掩码，显示格式（"19**年**月*2日")
            userBirthdayStarRegex: /(\d{2})\d{2}([^\d]+)\d+([^\d]+)\d?(\d)([^\d]+)?/,
            //金额转换
            moneyReplace: /[^0-9\.]/g,
            //验证邮箱
            verifyEmail: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
            // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
            sfzNumber: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
            hasCh: /[\u4E00-\u9FA5]/g
        },

        /**
         * 将指定时间戳转为： yyyy-mm-dd HH:MM
         * @param timestamp
         * @return {String}
         */
        dateFormat: function (timestamp, symbol) {
            function dateFm(n) {
                return (n < 10) ? '0' + n : n;
            }

            var date = new Date(parseInt(timestamp));
            if (symbol) {
                return date.getFullYear() + symbol + dateFm(date.getMonth() + 1) + symbol + dateFm(date.getDate()) + ' ' + dateFm(date.getHours()) + ':' + dateFm(date.getMinutes());
            } else {
                return date.getFullYear() + '年' + dateFm(date.getMonth() + 1) + '月' + dateFm(date.getDate()) + '日';
            }
        },

        /*
         * 获取字符串中"?"后面的值
         * */
        getParameter: function (param) {
            var reg = new RegExp('[&,?]' + param + '=([^\\&]*)', 'i');
            var value = reg.exec(location.search);
            return value ? value[1] : '';
        },

        /*
         * 获取字符串中"#"后面的值
         * */
        getHashParameter: function (param) {
            var reg = new RegExp('[&,#]' + param + '=([^\\&]*)', 'i');
            var value = reg.exec(location.hash);
            return value ? value[1] : '';
        },
        changeURLPar: function (destiny, par, par_value) {
            var pattern = par + '=([^&]*)';
            var replaceText = par + '=' + par_value;
            if (destiny.match(pattern)) {
                var tmp = '/\\' + par + '=[^&]*/';
                tmp = destiny.replace(eval(tmp), replaceText);
                return (tmp);
            } else {
                if (destiny.match('[\?]')) {
                    return destiny + '&' + replaceText;
                } else {
                    return destiny + '?' + replaceText;
                }
            }
            return destiny + '\n' + par + '\n' + par_value;
            //changeURLPar(url, 'id', 99); // http://www.huistd.com/?id=99&ttt=3 
        },
        /*
         * 数字转千分位10,000,000
         * */
        parseThousands: function (param) {
            return param ? ((param || "0") + "").replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,") : "";
        },
        /*判断是否是数字*/
        isNumber: function (ary) {
            return Object.prototype.toString.call(ary) === '[object Number]' ? true : false;
        },
        /*判断是否是布尔值*/
        isBoolean: function (ary) {
            return Object.prototype.toString.call(ary) === '[object Boolean]' ? true : false;
        },
        /*判断是否是字符串*/
        isString: function (ary) {
            return Object.prototype.toString.call(ary) === '[object String]' ? true : false;
        },
        /*判断是否是数组*/
        isArray: function (ary) {
            return Object.prototype.toString.call(ary) === '[object Array]' ? true : false;
        },
        /*取数组中最小值*/
        minArr: function (arr) {
            return Math.min.apply(null, arr)
        },
        /*取数组中最大值*/
        maxArr: function (arr) {
            return Math.max.apply(null, arr)
        },
        /*删除组中元素*/
        removeAry: function (ary, ele) {
            return ary.splice(ary.indexOf(ele), 1);
        },
        /*将数组中元素随机打乱*/
        randomArr: function (arr) {
            return arr.sort(function () {
                return 0.5 - Math.ranodm();
            });
        },
        /*将伪数组转换成普通数组*/
        formArray: function (ary) {
            return Array.prototype.splice.call(ary)
        },
        /*判断数组中是否有重复项*/
        isRepeatArry: function (arr) {
            var hash = {};
            for (var i in arr) {
                if (hash[arr[i]]) return true;
                hash[arr[i]] = true;
            }
            return false;
        },
    };
    return util;
});