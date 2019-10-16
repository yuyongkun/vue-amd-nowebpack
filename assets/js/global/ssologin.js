(function () {
    var c = {
        hasClass: function (obj, cls) {
            return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
        },
        removeClass: function (obj, cls) {
            if (this.hasClass(obj, cls)) {
                var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
                obj.className = obj.className.replace(reg, ' ');
            }
        },
        addClass: function (obj, cls) {
            if (!this.hasClass(obj, cls)) {
                obj.className += " " + cls;
            }
        },
        toggleClass: function (obj, cls) {
            if (this.hasClass(obj, cls)) {
                this.removeClass(obj, cls);
            } else {
                this.addClass(obj, cls);
            }
        },

        remove: function (_id) {
            var dom = document.getElementById(_id);
            if (dom) {
                dom.parentNode.removeChild(dom);
            }
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
        getByClass: function (className) {
            var arr = [];
            if (document.getElementsByClassName) {
                arr = document.getElementsByClassName(className);
            } else {
                var aEle = document.getElementsByTagName('*');
                for (var i = 0; i < aEle.length; i++) {
                    if (aEle[i].className == className) {
                        arr.push(aEle[i]);
                    }
                }
            }
            return arr;
        },
        showTip: function (param) {
            var that = this;
            param = param || {};
            var container = param.container,
                text = param.text,
                status = param.status,
                time = param.time;
            if (!container) return;
            var tip = {};
            time = time || 2500;
            //清除所有提示
            var dyNamicTextTip = this.getByClass('dynamic-text-tip');
            for (var i = 0; i < dyNamicTextTip.length; i++) {
                if (dyNamicTextTip[i].className == 'dynamic-text-tip') {
                    dyNamicTextTip[i].innerText = '';
                }
            }

            clearTimeout(tip.timmer);
            //设置不同提示的字体颜色
            if (status == 'success') {
                container.style.color = '#0165b5';
            } else if (status == 'error') {
                container.style.color = 'red';
            }
            //为提示添加动画效果
            c.addClass(container, 'dynamic-text-tip-animation');
            container.innerText = text;
            //2秒之后隐藏提示并清除提示的css动画
            tip.timmer = setTimeout(function () {
                c.removeClass(container, 'dynamic-text-tip-animation');
            }, time);
        },

        //去除前后空格
        trim: function (str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
        },

        /*
         * 获取字符串中"?"后面的值
         * */
        getParameter: function (param) {
            var reg = new RegExp('[&,?]' + param + '=([^\\&]*)', 'i');
            var value = reg.exec(location.search);
            return value ? value[1] : '';
        },
        hideDoms: function (doms) {
            for (var i = 0, len = doms.length; i < len; i++) {
                doms[i].style.display = 'none';
            }
        },
        //生成默认loading
        createloading: function (container) {
            if (container) {
                container = container;
                var loadHtm = '<div id="default-loading"><div class="mask3"></div>' +
                    '<div class="new-loading">' +
                    '<div class="loading-icon">' +
                    '<div class="loading-circle"></div>' +
                    '<div class="loading-font">TK</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                c.appendHTML(container, loadHtm);
                container.innerHTML = loadHtm;
            }
        },
        getName: function () {
            return 'dagd';
        },
        //删除默认loading
        removeloading: function () {
            this.remove('default-loading');
        },


        /*
         * 原生ajax
         * */
        ajax: function (param) {
            param = param || {};
            var _url = param.url,
                type = param.type && param.type.toLowerCase() || 'post',
                data = param.data || null,
                jsonp = param.jsonp && param.jsonp.toLowerCase(), //函数名称
                dataType = param.dataType,
                success = param.success,
                error = param.error,
                timeout = param.timeout || 20000,
                ohead = document.getElementsByTagName('head')[0];
            var idx = 0,
                str = '',
                postStr = '';

            if (data !== null) {
                for (var par in data) {
                    if (par) {
                        postStr += par + '=' + data[par] + '&';
                        idx++;
                        if (idx == 1) {
                            str += '?' + par + '=' + data[par];
                        } else {
                            str += '&' + par + '=' + data[par];
                        }
                    } else {
                        idx = 0;
                    }

                }
            }

            if (dataType === 'jsonp') {
                var script = document.createElement('script');
                var callbackname = 'jsonp_' + new Date().getTime();
                _url += str + (idx >= 1 ? '&' + jsonp + '=' + callbackname : '?' + jsonp + '=' + callbackname);
                script.setAttribute('src', _url);
                ohead.appendChild(script);
                this.success = success;
                //超时处理
                if (timeout) {
                    script.sto = setTimeout(function () {
                        ohead.removeChild(script);
                        clearTimeout(script.sto);
                        window[callbackname] = null;
                        if (typeof error === "function") error('timeout');
                    }, timeout);
                }
                window[callbackname] = function (result) {
                    ohead.removeChild(script);
                    clearTimeout(script.sto);
                    window[callbackname] = null;
                    if (typeof success === "function") success(result);
                };

            } else {
                var xhr;
                if (typeof XMLHttpRequest !== undefined) {
                    xhr = new XMLHttpRequest();
                } else if (typeof ActiveXObject !== undefined) {
                    xhr = new ActiveXObject();
                }

                if (type == 'get') {
                    _url += str;
                    postStr = null;
                } else {
                    postStr = postStr.substring(0, postStr.lastIndexOf('&'));
                }
                xhr.open(type, _url, true);
                if (type == 'post') {
                    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); // 发送信息至服务器时内容编码类型
                }
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                            var responseText = xhr.responseText;
                            if (dataType == 'json') {
                                responseText = JSON.parse(responseText);
                                if (typeof success === "function") {
                                    if (responseText.status == '499') {
                                        window.signin.login();
                                    } else {
                                        success && success(responseText);
                                    }
                                }
                            }

                        }
                    }
                };
                //超时处理
                xhr.ontimeout = function () {
                    if (typeof error === "function") error('timeout');
                };
                xhr.send(postStr);
            }
        },
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
            sfzNumber: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
        },
        msg: {
            info: function (message, timeout) {
                c.tip(message, timeout, 'info');
            },
            error: function (message, timeout) {
                c.tip(message, timeout, 'error');
            },
            warning: function (message, timeout) {
                c.tip(message, timeout, 'warning');
            },
            success: function (message, timeout) {
                c.tip(message, timeout, 'success');
            }
        },
        tip: function (message, timeout, type) {
            var _tip = {};
            type = type || 'info';
            timeout = timeout || 1200;
            var div = document.getElementById("_tips");
            if (!div) {
                var htm = '<div id="_tips" style="z-index:9999;font-size:12px;position: fixed;left: 50%;top: 0px;border-radius: 5px;box-sizing: content-box;padding: 15px;background: transparent;color: #f2f2f2;box-shadow: 0 0 3px 1px rgba(0,0,0,0.2);-webkit-transition:all 0.3s;-webkit-transform: translate3d(0,-100%,0);"><p id="tip_text" style="font-size: 14px;color:#fff"></p></div>';
                c.appendHTML(document.body, htm);
            }
            div = document.getElementById("_tips");
            if (type == 'info') {
                div.style.backgroundColor = '#0078D7';
            } else if (type == 'error') {
                div.style.backgroundColor = '#d70018';
            } else if (type == 'warning') {
                div.style.backgroundColor = '#ECB100';
            }
            document.getElementById("tip_text").innerHTML = message;
            if (_tip.timmer) {
                clearTimeout(_tip.timmer);
                _tip.timmer = null;
            }
            div.style.webkitTransition = "none";
            div.style.webkitTransform = "translate3d(0px, 90%, 0px)";
            _tip.timmer = setTimeout(function () {
                div.style.webkitTransition = "all 0.3s";
                div.style.webkitTransform = "translate3d(0px, -100%, 0px)";
            }, timeout);
        },
    };
    var ulogin = document.getElementById('loginStatus').getAttribute('data-login')
    var redirect = decodeURIComponent(c.getParameter('redirect'));
    //自动登陆
    if (ulogin == 0) {
        c.ajax({
            url: location.protocol + '//passport.skycreative.cn/account/Checkstate',
            dataType: 'jsonp',
            jsonp: 'callback',
            success: function (result) {
                if (result.Status) {
                    c.ajax({
                        url: '/Account/Login',
                        type: 'post',
                        data: {
                            Token: result.Token
                        },
                        dataType: 'json',
                        success: function (result) {
                            if (result.Success) {
                                if (redirect) {
                                    location.href = redirect;
                                } else {
                                    location.reload();
                                }
                            } else {
                                c.msg.warning(result.Message);
                            }
                        },
                        error: function () {
                            c.msg.error('网络异常，请稍候重试');
                        }
                    });
                }
            }
        });
    }

})();
