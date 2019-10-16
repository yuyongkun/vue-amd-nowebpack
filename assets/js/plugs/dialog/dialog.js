(function(win, doc) {
    // width：定义弹出框的宽度，默认值是400。
    // height：定义弹出框的高度.
    // title：定义弹出框的标题，默认值是空。
    // html：定义弹出框的内容，默认值是空。
    // type：定义弹出框的类型，默认值是default，其他conform和alert。
    // closed: 标题栏中的关闭按钮，回调方法，默认为null。
    // conform：包含name指按钮的名称，默认值为确定，callback回调方法，默认值为null。
    // cancel：包含name指按钮的名称，默认值为取消，callback回调方法，默认值为null。
    // notAutoClosed:点击确认按钮时是否立即关闭弹框
    // 备注：如果使用conform或alert时，不设置type类型是不起作用。
    //使用原型对象的好处是可以让所有实例共享它所包含的属性和方法
    function Dialog(obj) {
        obj = obj || {};
        this.width = obj.width || 400;
        this.height = obj.height;
        this.title = obj.title;
        this.html = obj.html;
        this.type = obj.type || 'default';
        this.notAutoClosed = obj.notAutoClosed;
        this.hideAllbtn = obj.hideAllbtn;

        this.btnConformText = obj.btnConformText || '确定';
        this.btnCancleText = obj.btnCancleText || '取消';

        this.closed = obj.closed;
        this.conform = obj.conform;
        this.cancel = obj.cancel;
        this.init = obj.init;
        this.initialize();
    }
    Dialog.prototype.close = function () {
        var dialogContainer = document.getElementById('dialog-container');
        dialogContainer.parentNode.removeChild(dialogContainer);
    };
    Dialog.prototype.initialize = function () {
        var self = this;
        var conformHtm = '<button type="button" id="dialog-conform" class="dialog-conform">' + this.btnConformText + '</button>';
        var cancelmHtm = '<button type="button" id="dialog-cancel" class="dialog-cancel">' + this.btnCancleText + '</button>';
        var html = '<div id="dialog-container">' +
            '<div class="dialog-mask"></div>' +
            '<div id="dialog-box" class="dialog-box">' +
            '<div class="dialog-header clearfix">' +
            '<a id="dialog-closed" class="dialog-closed" title="关闭">×</a>' +
            '<h3 class="dialog-title">' + this.title + '</h3>' +
            '</div>' +
            '<div class="dialog-content">' + this.html + '</div>' +
            (this.hideAllbtn ? '' : '<div id="dialog-footer" class="dialog-footer">' + (this.type === 'alert' ? cancelmHtm + conformHtm : this.type === 'conform' ? conformHtm : '') + '</div>') +
            '</div>' +
            '</div>';
        appendHTML(document.body, html);
        if (this.type === 'default') {
            document.getElementById('dialog-footer').style.display = 'none';
        } else if (this.type === 'conform') {
            document.getElementById('dialog-footer').style.textAlign = 'center';
        }
        this.dialogBox = document.getElementById('dialog-box');
        this.dialogClosed = document.getElementById('dialog-closed');
        this.dialogConform = document.getElementById('dialog-conform');
        this.dialogCancel = document.getElementById('dialog-cancel');
        this.dialogBox.style.width = this.width + 'px';
        if (this.height) {
            this.dialogBox.style.height = this.height + 'px';
        }
        this.dialogBox.style.marginLeft = -(this.width / 2) + 'px';
        this.dialogBox.style.marginTop = '50px';
        if (navigator.appName == "Microsoft Internet Explorer" && parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE", "")) <= 8) {
            this.dialogBox.style.top = '50%';
            this.dialogBox.style.marginTop = -(document.getElementById('dialog-box').clientHeight/2)+'px';
        }
        this.dialogClosed && (this.dialogClosed.onclick = function() {
            self.close();
            self.closed && self.closed();
        });
        this.dialogConform && (this.dialogConform.onclick = function () {
            if (!self.notAutoClosed) {
                self.close();
            }
            self.conform && self.conform();
        });
        this.dialogCancel && (this.dialogCancel.onclick = function() {
            self.close();
            self.cancel && self.cancel();
        });

        // 弹框移动
        var moveNode = null,
            start_x1, start_y1, end_x1, end_y1, move = false,
            posX, posY;
        document.onmouseup = function () {
            move = false;
        }
        document.onmousemove = function (e) {
            if (move) {
                end_x1 = e.pageX;
                end_y1 = e.pageY;
                moveNode.style.marginLeft = posX + (end_x1 - start_x1) + 'px';
                moveNode.style.marginTop = posY + (end_y1 - start_y1) + 'px';
            }
        }
        var dialoghead = document.querySelector('.dialog-header');
        dialoghead.onmousedown = function (e) {
            e.preventDefault();
            move = true;
            moveNode = this.parentNode;
            posX = Number(moveNode.style.marginLeft.replace('px', '')) - 3;
            posY = Number(moveNode.style.marginTop.replace('px', '')) - 3;

            start_x1 = e.pageX;
            start_y1 = e.pageY;
        }

        this.init&&this.init();

    };
 
    function appendHTML(container, htm) {
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
    }
    if (typeof define === 'function' && define.amd) {
        define('dialog', [], function() {
            return Dialog;
        });

    } else {
        window.Dialog = Dialog;

    }


})(window, document);
