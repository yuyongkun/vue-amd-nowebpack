(function () {
    function FlowImg(obj) {
        obj = obj || {};
        this.flowContainer = obj.flowContainer;//滚动父容器
        this.flowContent = obj.flowContent;//滚动父容器
        this.mh = obj.mh;//水平距离
        this.mv = obj.mv;//垂直距离
        this.canloadmore = obj.canloadmore;//是否加载更多(false,true)
        this.scrollcomplete = obj.scrollcomplete;//加载完成回调函数
        this.initialize = obj.initialize;//插件初始化完成回调函数
        /*接口相关参数*/
        this._url = '';//默认请求接口
        this._postData = {};//默认请求接口参数
        this._currentPage = 0;//默认当前页数
        this._totalPage = 0;//默认总页数
        this._ajaxType = 'post';//默认接口请求方式
        this._data = obj.data;//模板数据
        this._appendTemplateHtml = obj.appendTemplateHtml;//加载更多数据模板
        //实例化插件
        this.initPlug();
    }
    FlowImg.prototype.initPlug = function () {
        var self = this;
        var mh = this.mh;
        var mv = this.mv;
        var w = this.flowContent.offsetWidth; //计算容器宽度
        var ul = this.flowContent;
        var li = ul.getElementsByTagName("li");
        var iw = li[0].offsetWidth + mh; //计算数据块的宽度 
        var c = Math.floor(w / iw); //计算列数 
        ul.style.width = iw * c - mh + "px"; //设置ul的宽度至适合便可以利用css定义的margin把所有内容居中 

        var liLen = li.length;
        var lenArr = [];
        for (var i = 0; i < liLen; i++) { //遍历每一个数据块将高度记入数组 
            lenArr.push(li[i].offsetHeight);
        }

        var oArr = [];
        for (var i = 0; i < c; i++) { //把第一行排放好，并将每一列的高度记入数据oArr 
            if (li[i]) {
                li[i].style.top = "0";
                li[i].style.left = iw * i + "px";
                li[i].style.opacity = "1";
                li[i].style["-moz-opacity"] = "1";
                li[i].style["filter"] = "alpha(opacity=100)";
                oArr.push(lenArr[i]);
            }
        }

        for (var i = c; i < liLen; i++) { //将其他数据块定位到最短的一列后面，然后再更新该列的高度 
            var x = _getMinKey(oArr); //获取最短的一列的索引值 
            li[i].style.top = oArr[x] + mv + "px";
            li[i].style.left = iw * x + "px";
            li[i].style.opacity = "1";
            li[i].style["-moz-opacity"] = "1";
            li[i].style["filter"] = "alpha(opacity=100)";
            oArr[x] = lenArr[i] + oArr[x] + mv; //更新该列的高度 
        }
        this.initialize && this.initialize();
        if (!!this.canloadmore) {
            function relocationloading() {
                //初始化完成重新定位页脚
                var $florilegiumSingleItem = $('.florilegium-single-item');
                var length = $florilegiumSingleItem.length;
                var maxArr = [];
                $florilegiumSingleItem.each(function (idx, objDom) {
                    maxArr.push(parseInt(objDom.style.top) + objDom.offsetHeight);
                });
                var maxval = _getMaxValue(maxArr);
                self.flowContainer=document.getElementById(self.flowContainer.id);
                $('#single-loading').css({
                    top: self.flowContainer.offsetTop + maxval + 20
                });
                
            }
            relocationloading();
            function scroll() { //滚动加载数据 
                var st = oArr[_getMinKey(oArr)];
                var scrollTop = document.documentElement.scrollTop > document.body.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
                if (scrollTop >= st - document.documentElement.clientHeight) {
                    window.onscroll = null; //为防止重复执行，先清除事件 
                    if (self._currentPage > self._totalPage) return;
                    _ajax({
                        url: self._url,
                        type: self._ajaxType,
                        dataType: "json",
                        data: self._postData,
                        beforeSend: function () {
                            var IMG= '<img src="/assets/images/loading/tail-spin.svg" width="50" alt="loading">';
                            if (navigator.userAgent.indexOf('MSIE') >= 0) {//ie
                                IMG = '<img style="display: inline-block; width: 37px; height: 37px;padding:5px;background:#fff;border-radius:5px;" src="/assets/images/loading/ie-loading.gif" alt="loading">';
                            }
                            var loadHtml = '<div id="single-loading" style="position:absolute;left:50%;margin-left:-25px;top:220px;">'+IMG+'</div>';
                            _append(document.body, loadHtml);
                            relocationloading();
                        },
                        success: function (result) {
                            if (result.Data&&result.Data.length > 0) {
                                _addItem(result.Data, function (arr) { //追加数据 
                                    var _html = "";
                                    for (var k in arr) {
                                        for (var idx in self._data) {
                                            var str = '{{' + self._data[idx] + '}}';
                                            var reg = new RegExp(str, 'gim');
                                            if (idx == 0) {
                                                _html += self._appendTemplateHtml.replace(reg, arr[k][self._data[idx]]);
                                            } else {
                                                _html = _html.replace(reg, arr[k][self._data[idx]]);
                                            }
                                        }
                                    }
                                    ul = document.getElementById(self.flowContent.id);
                                    _appendhtml(ul, _html);
                                    self._totalPage = result.TotalPage
                                    li = ul.getElementsByTagName("li");
                                    var liLenNew = li.length;
                                    for (var i = liLen; i < liLenNew; i++) {
                                        lenArr.push(li[i].offsetHeight);
                                    }
                                    for (var i = liLen; i < liLenNew; i++) {
                                        var x = _getMinKey(oArr);
                                        li[i].style.top = oArr[x] + 10 + "px";
                                        li[i].style.left = iw * x + "px";
                                        li[i].style.opacity = "1";
                                        li[i].style["-moz-opacity"] = "1";
                                        li[i].style["filter"] = "alpha(opacity=100)";
                                        oArr[x] = lenArr[i] + oArr[x] + 10;
                                    }
                                    liLen = liLenNew;

                                    relocationloading();
                                    self.scrollcomplete();
                                    self._currentPage++;
                                    _remove('single-loading');
                                    window.onscroll = scroll; //执行完成，恢愎onscroll事件 
                                });
                            } else if (result.Data && result.Data.length <= 0) {
                                self._currentPage = 2;
                                self._totalPage = 2;
                            }
                            
                        }
                    });
                }
            }
            window.onscroll = scroll;
            //追加项 
            function _addItem(arr, callback) {
                var a = 0;
                var len = arr.length;
                (function loadimg() {
                    var img = new Image();
                    img.onload = function () {
                        a += 1;
                        if (a == len) {
                            callback(arr);
                        } else {
                            loadimg();
                        }
                    };
                    img.onerror = function () {
                        arr.splice(a, 1);
                        len -= 1;
                        loadimg();
                    };
                    img.src = arr[a].FileMdUrl;
                })();
            }
        }
    };
   
    function _remove(_id) {
        var dom = document.getElementById(_id);
        if (dom) {
            dom.parentNode.removeChild(dom);
        }
    }
    function _append(container, htm) {
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
    };
    //追加html 
    function _appendhtml(parent, child) {
        if (typeof (child) == "string") {
            var div = document.createElement("div");
            div.innerHTML = child;
            var frag = document.createDocumentFragment();
            (function () {
                if (div.firstChild) {
                    frag.appendChild(div.firstChild);
                    arguments.callee();
                } else {
                    parent.appendChild(frag);
                }
            })();
        } else {
            parent.appendChild(child);
        }
    }
    //获取数字数组的最大值 
    function _getMaxValue(arr) {
        var a = arr[0];
        for (var k in arr) {
            if (arr[k] > a) {
                a = arr[k];
            }
        }
        return a;
    }
    //获取数字数组最小值的索引 
    function _getMinKey(arr) {
        var a = arr[0];
        var b = 0;
        for (var k in arr) {
            if (arr[k] < a) {
                a = arr[k];
                b = k;
            }
        }
        return b;
    }
    //ajax请求 
    function _ajax(param) {
        param = param || {};
        var _url = param.url,
            type = param.type && param.type.toLowerCase() || 'post',
            data = param.data || null,
            jsonp = param.jsonp && param.jsonp.toLowerCase(), //函数名称
            dataType = param.dataType,
            success = param.success,
            error = param.error,
            beforeSend = param.beforeSend,
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
                if (xhr.readyState == 4) {//0：未初始化，尚未调用open方法，1：调用open方法完成初始化，尚未调用send方法,2：调用send方法发送请求，还未收到任何响应,3：收到部分响应，4：收到全部响应数据
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                        var responseText = xhr.responseText;
                        if (dataType == 'json') {
                            responseText = JSON.parse(responseText);
                        }
                        if (typeof success === "function") success(responseText);
                    }
                } else if (xhr.readyState == 2) {
                    beforeSend && beforeSend();
                }
            };
            //超时处理
            xhr.ontimeout = function () {
                if (typeof error === "function") error('timeout');
            };
            xhr.send(postStr);
        }
    }

    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return FlowImg;
        });
    } else {
        window.FlowImg = FlowImg;
    }

})();
