//------------------------------------------------------------------------------
//
// 键盘快捷键操作辅助工具类
// class: sn_keys 
// author: 喵大斯( as3er.net )
// created: 2015/10/16
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------
///<reference path="../jquery/jquery.d.ts"/>
///<reference path="../jquery/jquery.ext.d.ts"/>
var SN_Keys = (function () {
    //--------------------------------------------------------------------------
    //
    //  Class constructor
    //
    //--------------------------------------------------------------------------
    function SN_Keys() {
        //--------------------------------------------------------------------------
        //
        //	Class properties
        //
        //--------------------------------------------------------------------------
        this._keyCache = {};
    }
    //--------------------------------------------------------------------------
    //
    //	Class methods
    //
    //--------------------------------------------------------------------------
    /**
     * 注册一个快捷键操作
     * <p>注意：只有在指定目标对象获得焦点时，快捷键才会有响应。</p>
     * @param key 快捷键配置
     * @param callback 当符合所设置快捷键时所执行的回调方法
     * @param once 是否在执行一次后，立即删除
     */
    SN_Keys.prototype.keyup = function (key, callback, once) {
        var _this = this;
        if (once === void 0) { once = false; }
        var hash = this._getHashName(key.keyCode, key.ctrl, key.alt, key.shift);
        if (!this._keyHandlerAdded) {
            this._keyHandlerAdded = true;
            $("body").keyup(function (e) { _this.keyupHandler(e); });
        }
        this._keyCache[hash] = { key: key, callback: callback, once: once };
    };
    SN_Keys.prototype._getHashName = function (keyCode, ctrl, alt, shift) {
        var hash = "__KH_";
        if (ctrl === true)
            hash += "c";
        if (alt === true)
            hash += "a";
        if (shift === true)
            hash += "s";
        hash += keyCode;
        return hash;
    };
    //--------------------------------------------------------------------------
    //
    //  Event handlers
    //
    //--------------------------------------------------------------------------
    SN_Keys.prototype.keyupHandler = function (e) {
        var hash = this._getHashName(e.which, e.ctrlKey, e.altKey, e.shiftKey);
        if (this._keyCache.hasOwnProperty(hash)) {
            var k = this._keyCache[hash];
            // 快捷键比较
            if (k.key.keyCode == e.which) {
                // 控制组合键检测
                if (k.key.ctrl && !e.ctrlKey || k.key.alt && !e.altKey || k.key.shift && !e.shiftKey) {
                    e.preventDefault();
                    return false;
                }
                // 执行回调
                if (is_function(k.callback))
                    k.callback();
                // 删除单次快捷键注册数据
                if (k.once)
                    delete this._keyCache[hash];
            }
        }
    };
    return SN_Keys;
}());
(function ($) {
    $["sn_keys"] = new SN_Keys();
})(jQuery);
//------------------------------------------------------------------------------
//
// 页面消息提示工具（在页面最上方显示弹出消息条）
// class: sn_message 
// author: 喵大斯( as3er.net )
// created: 2015/10/16
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------
///<reference path="../jquery/jquery.d.ts"/>
///<reference path="../jquery/jquery.ext.d.ts"/>
var SN_Message = (function () {
    //--------------------------------------------------------------------------
    //
    //  Class constructor
    //
    //--------------------------------------------------------------------------
    function SN_Message() {
        this._options = {
            id: 'page_message',
            okClass: 'page_mess_ok',
            errClass: 'page_mess_error',
            animate: true,
            delay: 1500,
            // where should the modal be appended to (default to document.body).
            // Added for unit tests, not really needed in real life.
            appendTo: 'body'
        };
    }
    //--------------------------------------------------------------------------
    //
    //	Class methods
    //
    //--------------------------------------------------------------------------
    /**
     * 显示页面提示消息
     * @param msg 消息内容
     * @param type 消息类型（1-成功消息；2-错误消息）
     */
    SN_Message.prototype.message = function (msg, type) {
        if (type === void 0) { type = 1; }
        clearTimeout(this._timeid);
        var $selector = $('#' + this._options.id);
        // 添加到页面
        if ($selector.isNull()) {
            $selector = $('<div/>', { id: this._options.id }).appendTo(this._options.appendTo);
        }
        // 是否支持背景动画
        if (this._options.animate) {
            $selector.addClass('page_mess_animate');
        }
        else {
            $selector.removeClass('page_mess_animate');
        }
        // 消息内容
        $selector.html(msg);
        // 样式类型
        if (type == 2) {
            $selector.removeClass(this._options.okClass).addClass(this._options.errClass);
        }
        else if (type == 1) {
            $selector.removeClass(this._options.errClass).addClass(this._options.okClass);
        }
        // 动画处理
        $selector.show();
        this._timeid = setTimeout(function () {
            $selector.slideUp(150);
        }, this._options.delay);
    };
    SN_Message.prototype.msg = function (msg) { this.message(msg, 1); };
    SN_Message.prototype.err = function (msg) { this.message(msg, 2); };
    return SN_Message;
}());
(function ($) {
    $["sn_message"] = new SN_Message();
})(jQuery);
//------------------------------------------------------------------------------
//
// 表单AJAX提交器（自带超时处理、网络速度考虑）
// class: sn.submit 
// author: 喵大斯( as3er.net )
// created: 2015/10/16
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------
///<reference path="../jquery/jquery.d.ts"/>
///<reference path="../jquery/jquery.ext.d.ts"/>
var SN_Submit = (function () {
    //--------------------------------------------------------------------------
    //
    //  Class constructor
    //
    //--------------------------------------------------------------------------
    function SN_Submit() {
        // 默认设置
        this._options = {
            context: null,
            type: "POST",
            dataType: "text",
            timeout: 2000,
            cache: false,
            url: null,
            data: null
        };
    }
    SN_Submit.prototype.options = function (value) {
        $.extend(this._options, value);
    };
    //--------------------------------------------------------------------------
    //
    //	Class methods
    //
    //--------------------------------------------------------------------------
    /**
     * 显示请求相关的消息
     * @param msg 消息内容
     * @param type 消息类型（SN_Submit.OK,SN_Submit.INFO,SN_Submit.ERR）
     */
    SN_Submit.prototype.message = function (msg, type) {
        var $backdrop = $('div[data-id="__submit_backdrop"]');
        if ($backdrop.isNull()) {
            $backdrop = $('<div data-id="__submit_backdrop" class="modal-backdrop fade"/>').appendTo("body");
        }
        $backdrop[0].offsetWidth;
        var $pad = $('#__FORM_NOTE_CONTENT');
        if ($pad.isNull()) {
            $pad = $('<div id="__FORM_NOTE_CONTENT" class="modal fade"><div class="alert text-center" role="alert" style="margin:20% 10% auto 10%;"></div></div>').appendTo("body");
        }
        // 消息样式处理
        var $alert = $pad.find(".alert");
        $alert.html(msg.toString());
        $alert.removeClass("alert-info");
        $alert.removeClass("alert-success");
        $alert.removeClass("alert-danger");
        $alert.addClass(type);
        // 显示消息
        $backdrop.addClass('in');
        $pad.show().addClass("in");
        $pad.dblclick(this.close);
        // 自动延迟关闭
        var delay = type == SN_Submit.ERR ? 2000 : 100;
        clearTimeout(this._timeid);
        this._timeid = setTimeout(this.close, delay);
    };
    SN_Submit.prototype.close = function () {
        var $backdrop = $('div[data-id="__submit_backdrop"]');
        var $pad = $('#__FORM_NOTE_CONTENT');
        $backdrop.fadeOut(150, function () { $(this).remove(); });
        $pad.fadeOut(150, function () { $(this).remove(); });
        clearTimeout(this._timeid);
    };
    /**
     * 托管提交表单到指定地址
     *
     * @param url 提交地址
     * @param data 需要提交的数据
     * @param callback 成功时的回调方法（会传入返回结果作为参数）
     * @param type 发送请求的类型（get,post 默认使用 post 类型发送请求）
     * @param dataType 返回数据的类型（将尝试对返回数据进行指定转换，可用值“json(默认),xml,html,text”）
     * @param message 当提交命令请求时的提示信息
     */
    SN_Submit.prototype.submit = function (url, data, callback, type, dataType, message) {
        if (type === void 0) { type = "post"; }
        if (dataType === void 0) { dataType = "json"; }
        if (message === void 0) { message = "正在提交命令请求..."; }
        // 默认设置
        this._options.context = this; // 供 complete 回调使用
        this._options.url = url;
        this._options.data = data;
        // 发送请求的类型
        type = type.toUpperCase();
        if ("GET;POST".indexOf(type) != -1)
            this._options.type = type;
        // 返回结果的类型（默认为 text）
        if ("json;xml;html;text".indexOf(dataType) != -1)
            this._options.dataType = dataType;
        // 成功时的回调方法
        if ($.isFunction(callback))
            this._options.success = callback;
        // 发生错误时的回调
        this._options.error = this.__errorHandler;
        // 其它扩展回调
        //sets.beforeSend = this.__beforeSendHandler;
        //sets.dataFilter = this.__dataFilterHandler;
        // 返回成功后，关闭遮罩
        this._options.complete = this.__completeHandler;
        // 发送请求
        this.message(message, SN_Submit.INFO);
        $.ajax(this._options);
    };
    SN_Submit.prototype.get = function (url, data, callback, dataType) {
        if (dataType === void 0) { dataType = "json"; }
        if (is_string(url)) {
            this.submit(url, data, callback, "get", dataType);
        }
        else {
            this.submit(url.url, data, callback, "get", dataType, url.message);
        }
    };
    SN_Submit.prototype.post = function (url, data, callback, dataType) {
        if (dataType === void 0) { dataType = "json"; }
        if (is_string(url)) {
            this.submit(url, data, callback, "post", dataType);
        }
        else {
            this.submit(url.url, data, callback, "post", dataType, url.message);
        }
    };
    //--------------------------------------------------------------------------
    //
    //  Event handlers
    //
    //--------------------------------------------------------------------------
    // beforeSend 在发送请求之前调用，并且传入一个XMLHttpRequest作为参数
    SN_Submit.prototype.__beforeSendHandler = function (http) {
        // 发送请求前可修改 XMLHttpRequest 对象的函数，如添加自定义 HTTP 头。XMLHttpRequest 对象是唯一的参数。
        // 这是一个 Ajax 事件。如果返回false可以取消本次ajax请求
        return true;
    };
    // 在请求出错时调用。传入XMLHttpRequest对象，描述错误类型的字符串以及一个异常对象（如果有的话）
    SN_Submit.prototype.__errorHandler = function (http, status) {
        // (默认: 自动判断 (xml 或 html)) 请求失败时调用此函数。
        // 有以下三个参数：XMLHttpRequest 对象、错误信息、（可选）捕获的异常对象。
        // 如果发生了错误，错误信息（第二个参数）除了得到null之外，还可能是"timeout", "error", "notmodified" 和 "parsererror"。
        var msg = "";
        switch (status) {
            case "timeout":
                {
                    msg = "由于网络环境问题，提交请求已超时未响应，请稍后重试";
                    break;
                }
            case "error":
                {
                    msg = "请求发生错误，请稍后重试";
                    break;
                }
            case "notmodified":
                {
                    msg = "请求结果与之前没有变化";
                    break;
                }
            case "parsererror":
                {
                    msg = "解析返回结果时发生错误，请稍后重试";
                    break;
                }
            default:
                {
                    msg = "请求发生未知错误，请检查";
                }
        }
        this.message("<b>错误：</b>" + msg, SN_Submit.ERR);
    };
    // 在请求成功之后调用。传入返回的数据以及"dataType"参数的值。并且必须返回新的数据（可能是处理过的）传递给success回调函数
    SN_Submit.prototype.__dataFilterHandler = function (data, type) {
        // 给Ajax返回的原始数据的进行预处理的函数。
        // 提供data和type两个参数：data是Ajax返回的原始数据，type是调用jQuery.ajax时提供的dataType参数。
        // 函数返回的值将由jQuery进一步处理
        return data;
    };
    // 当请求完成之后调用这个函数，无论成功或失败。传入XMLHttpRequest对象，以及一个包含成功或错误代码的字符串
    SN_Submit.prototype.__completeHandler = function (http, status) {
        // 请求完成后回调函数 (请求成功或失败之后均调用)。参数： XMLHttpRequest 对象和一个描述成功请求类型的字符串
        if (status == "success") {
            // 请求成功后，立即关闭
            //this.message( "successed...", SN_Submit.OK );
            this.close();
        }
    };
    //--------------------------------------------------------------------------
    //
    // Class constants
    //
    //--------------------------------------------------------------------------
    SN_Submit.OK = "alert-success";
    SN_Submit.ERR = "alert-danger";
    SN_Submit.INFO = "alert-info";
    return SN_Submit;
}());
(function ($) {
    $["sn_submit"] = new SN_Submit();
})(jQuery);
//------------------------------------------------------------------------------
//
// ...
// class: sn_modal 
// author: 喵大斯( as3er.net )
// created: 2015/11/9
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------
///<reference path="../jquery/jquery.d.ts"/>
///<reference path="../jquery/jquery.ext.d.ts"/>
var SN_Modal = (function () {
    //--------------------------------------------------------------------------
    //
    //  Class constructor
    //
    //--------------------------------------------------------------------------
    function SN_Modal(options) {
        // 默认配置
        this.defaults = {
            title: "",
            target: "#__SN_MODAL",
            html: "",
            content: "",
            appendTo: "body",
            cache: false,
            keyboard: false,
            nobackdrop: false,
            force: true,
            size: "md",
            enter: "",
            cancel: "",
            icon: "" // 标题栏的前置图标：使用 glyphicon 样式名来指定图标，如 glyphicon glyphicon-ok-circle，取后图标具体样式 glyphicon-ok-circle
        };
        this.options = $.extend({}, this.defaults, options);
        this.$modal = $(this.options.target).attr('class', 'modal fade').hide();
    }
    SN_Modal.prototype.setOptions = function (options) {
        this.options = $.extend({}, this.options, options);
    };
    //----------------------------------------
    // 是否处于最大化状态
    //----------------------------------------
    /**
     * 当前是否处于最大化状态
     * @returns {boolean}
     */
    SN_Modal.prototype.getMaximumState = function () {
        return $(window).width() == this.$modal.find(".modal-content").outerWidth();
    };
    //--------------------------------------------------------------------------
    //
    //	Class methods
    //
    //--------------------------------------------------------------------------
    SN_Modal.prototype.show = function () {
        var _this = this;
        var $backdrop;
        // nobackdrop 为 false 时搜索或创建遮罩背景
        if (!this.options.nobackdrop) {
            $backdrop = $('.modal-backdrop');
            if ($backdrop.isNull()) {
                $backdrop = $('<div class="modal-backdrop fade" />').appendTo(this.options.appendTo);
            }
            $backdrop[0].offsetWidth; // force reflow
        }
        // 若构造方法未成功创建创建模态窗口主体
        if (this.$modal.isNull()) {
            var html = "\n\t\t\t<div class=\"modal fade\" id=\"" + this.options.target.substr(1) + "\">\n\t\t\t\t<div class=\"modal-content modal-dialog\">\n\t\t\t\t\t<div class=\"modal-header\">\n\t\t\t\t\t\t<a class=\"close glyphicon glyphicon-remove\" title=\"\u5173\u95ED\" href=\"#\" data-dismiss=\"modal\"></a>\n\t\t\t\t\t\t<a class=\"close glyphicon glyphicon-unchecked\" title=\"\u6700\u5927\u5316/\u8FD8\u539F\" href=\"#\" data-maximum=\"modal\"></a>\n\t\t\t\t\t\t<h4 class=\"text-danger\" style=\"padding:0;margin:0;\">\n\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-ok-circle\"></span>\n\t\t\t\t\t\t\t<span class=\"title\"></span>\n\t\t\t\t\t\t</h4>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"modal-body inner\" style=\"word-break:break-all;word-wrap:break-word;\"></div>\n\t\t\t\t\t<div class=\"modal-footer\">\n\t\t\t\t\t\t<button type=\"button\" class=\"btn btn-primary\" data-action=\"ok\">\n\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-ok\"></span>\n\t\t\t\t\t\t\t<span>\u786E\u5B9A</span>\n\t\t\t\t\t\t</button>\n\t\t\t\t\t\t<button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">\n\t\t\t\t\t\t\t<span class=\"glyphicon glyphicon-remove\"></span>\n\t\t\t\t\t\t\t<span>\u53D6\u6D88</span>\n\t\t\t\t\t\t</button>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>";
            this.$modal = $(is_empty(this.options.html) ? html : this.options.html).appendTo(this.options.appendTo).hide();
        }
        // 边框
        this.$modal.find(".modal-dialog").css("border", "6px solid rgba(255,255,255,0.5)");
        // 标题栏
        this.$modal.find(".modal-header > :header > .title").html(is_empty(this.options.title) ? "窗口标题" : this.options.title);
        // 按钮标签
        this.$modal.find(".btn[data-action='ok'] span:last-child").html(is_empty(this.options.enter) ? "确定" : this.options.enter);
        this.$modal.find(".btn[data-dismiss='modal'] span:last-child").html(is_empty(this.options.cancel) ? "取消" : this.options.cancel);
        // 其它参数处理
        if (!is_empty(this.options.css)) {
            this.$modal.find(".inner").addClass(this.options.css);
        }
        if (!is_empty(this.options.size)) {
            var dialog = this.$modal.find(".modal-dialog");
            dialog.removeClass("modal-lg modal-md modal-sm");
            dialog.addClass("modal-" + this.options.size);
        }
        // 按 ESC 快捷键关闭功能
        if (is_bool(this.options.keyboard))
            this.escape();
        // 显示遮罩背景
        if (!this.options.nobackdrop)
            $backdrop.addClass("in");
        // 注册关闭事件
        this.$modal.off("enter.sn_modal").on("enter.sn_modal", function () {
            // 点确定的回调方法
            if (is_function(_this.options.onEnter))
                _this.options.onEnter(_this.$modal.find(".inner"));
            _this.close();
        });
        this.$modal.off("close.sn_modal").on("close.sn_modal", function () {
            // 关闭之前的回调方法
            if (is_function(_this.options.onClose))
                _this.options.onClose(_this.$modal.find(".inner"));
            _this.close();
        });
        this.$modal.off("maximum.sn_modal").on("maximum.sn_modal", function () { _this.maximumHandler(); });
        $(window).resize(function () {
            if (_this.getMaximumState())
                _this.maximum();
            else
                _this.restore();
        });
        // 窗口内容
        if (!is_empty(this.options.remote) && this.options.remote !== "#") {
            this.$modal.find('.inner').load(this.options.remote, function (content) {
                if (is_function(_this.options.onComplete))
                    _this.options.onComplete(_this.$modal.find(".inner"));
                if (_this.options.cache) {
                    _this.options.content = content;
                    delete _this.options.remote;
                }
            });
        }
        else {
            this.$modal.find(".inner").html(this.options.content);
            if (is_function(this.options.onComplete))
                this.options.onComplete(this.$modal.find(".inner"));
        }
        // 窗口内容相关事件
        this.$modal.on("click.sn_modal", '[data-dismiss="modal"]', function (e) {
            e.preventDefault();
            _this.$modal.trigger("close");
        });
        this.$modal.on("click.sn_modal", '[data-maximum="modal"]', function (e) {
            e.preventDefault();
            _this.$modal.trigger("maximum");
        });
        this.$modal.on("click.sn_modal", '[data-action="ok"]', function (e) {
            e.preventDefault();
            _this.$modal.trigger("enter");
        });
        this.$modal.find(".modal-header").mousedown(function (e) { _this._mouseDownHandler(e); });
        this.$modal.find(".modal-header").mouseup(function (e) { _this._mouseUpHandler(e); });
        this.$modal.find(".modal-header").css("cursor", "move");
        // 显示窗口
        this.$modal.show().addClass('in');
        if (is_function(this.options.onShow))
            this.options.onShow(this.$modal.find(".inner"));
        // 限制窗口内容最大高度（显示后才能正确获取高度值）
        this._limitHeight();
        // 打开窗口时，强制还原窗口
        if (this.options.force)
            this.restore();
        return this;
    };
    SN_Modal.prototype.close = function () {
        this.$modal.off("maximum.sn_modal");
        this.$modal.off("enter.sn_modal");
        this.$modal.off("close.sn_modal");
        this.$modal.off("click.sn_modal");
        this.$modal.hide().find('.inner').html("");
        if (!is_empty(this.options.size))
            this.$modal.find(".modal-dialog").removeClass("modal-" + this.options.size);
        $(document).off("keyup.sn_modal");
        $('.modal-backdrop').remove();
        return this;
    };
    // 最大化
    SN_Modal.prototype.maximum = function () {
        var content = this.$modal.find(".modal-content");
        var body = this.$modal.find(".modal-body");
        var borderWidth = parseInt(content.css("border-width"));
        var winHeight = $(window).height();
        var winWidth = $(window).width();
        var headHeight = this.$modal.find(".modal-header").outerHeight();
        var footHeight = this.$modal.find(".modal-footer").outerHeight();
        content.css("left", 0);
        content.css("top", 0);
        content.outerWidth(winWidth);
        content.removeClass("modal-dialog");
        body.css("max-height", "");
        body.outerWidth(winWidth - borderWidth * 2);
        body.outerHeight(winHeight - borderWidth * 2 - headHeight - footHeight);
    };
    // 还原大小
    SN_Modal.prototype.restore = function () {
        var content = this.$modal.find(".modal-content");
        var body = this.$modal.find(".modal-body");
        var borderWidth = parseInt(content.css("border-width"));
        var winWidth = $(window).width();
        var winHeight = $(window).height();
        var headHeight = this.$modal.find(".modal-header").outerHeight();
        var footHeight = this.$modal.find(".modal-footer").outerHeight();
        content.css("left", "");
        content.css("top", "");
        content.width("");
        content.height("");
        content.addClass("modal-dialog");
        // 设置 modal-dialog 样式后才会有正确的 margin-top 值
        var marginTop = parseInt(content.css("margin-top"));
        body.css("max-height", (winHeight - marginTop * 2 - headHeight - footHeight) + "px");
        body.css("overflow-y", "auto");
        body.width("100%");
        body.outerWidth(this.$modal.find(".modal-header").outerWidth());
        var curHeight = winHeight - borderWidth * 2 - marginTop * 2 - headHeight - footHeight;
        body.outerHeight(is_number(this.options.height) && this.options.height > 0 ? this.options.height : curHeight);
    };
    SN_Modal.prototype.destroy = function () {
        this.$modal.remove();
        $(document).off("keyup.sn_modal");
        $('.modal-backdrop').remove();
        this.$modal = null;
        if (!is_empty(this.options.self))
            this.options.self.removeData("sn_modal");
        return this;
    };
    SN_Modal.prototype.escape = function () {
        var _this = this;
        $(document).on("keyup.sn_modal", function (e) {
            if (e.which == 27)
                _this.close();
        });
    };
    SN_Modal.prototype._limitHeight = function () {
        var content = this.$modal.find(".modal-content");
        var body = this.$modal.find(".modal-body");
        var winHeight = $(window).height();
        var marginTop = parseInt(content.css("margin-top"));
        var headHeight = this.$modal.find(".modal-header").outerHeight();
        var footHeight = this.$modal.find(".modal-footer").outerHeight();
        body.css("max-height", (winHeight - marginTop * 2 - headHeight - footHeight) + "px");
        body.css("overflow-y", "auto");
    };
    //--------------------------------------------------------------------------
    //
    //  Event handlers
    //
    //--------------------------------------------------------------------------
    SN_Modal.prototype.maximumHandler = function () {
        if (!this.getMaximumState())
            this.maximum();
        else
            this.restore();
    };
    SN_Modal.prototype._mouseDownHandler = function (e) {
        var _this = this;
        // 最大化时不需要移动窗口
        if (this.getMaximumState())
            return;
        this._moveable = true;
        // 鼠标相对于当前窗口的位置
        var target = this.$modal.find(".modal-content");
        var pos = target.position();
        var offsetX = e.pageX - pos.left;
        var offsetY = e.pageY - pos.top;
        $(document).bind("mousemove", {
            ox: offsetX,
            oy: offsetY
        }, function (e) {
            if (_this._moveable) {
                target.css("left", e.pageX - e.data.ox);
                target.css("top", e.pageY - e.data.oy);
            }
        });
    };
    SN_Modal.prototype._mouseUpHandler = function (e) {
        this._moveable = false;
        $(document).unbind("mousemove");
    };
    return SN_Modal;
}());
(function ($) {
    $["sn_modal"] = function (options) {
        return new SN_Modal(options);
    };
    $.fn["sn_modal"] = function (options) {
        return this.each(function () {
            var $this = $(this);
            var modal = $this.data("sn_modal");
            if (is_empty(modal)) {
                var data = $this.data();
                var opts = $.extend({}, options, data);
                opts.self = $this;
                if ($this.attr('href') !== '' && $this.attr('href') != '#') {
                    opts.remote = $this.attr('href');
                }
                modal = new SN_Modal(opts);
                $this.data("sn_modal", modal);
            }
            modal.show();
        });
    };
    $(document).on("click.sn_modal", "[data-trigger='modal']", function () {
        $(this).sn_modal();
        if ($(this).is('a'))
            return false;
    });
})(jQuery);
//------------------------------------------------------------------------------
//
// 工作时间段选择器
// class: time_selecter 
// author: 喵大斯( as3er.net )
// created: 2015/10/28
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------
///<reference path="../jquery/jquery.d.ts"/>
///<reference path="../jquery/jquery.ext.d.ts"/>
/**
 * 工作时间段选择器
 * <p>
 * 作为目标对象的元素必须是支持 $(el).text() 或者 $(el).val() 的元素。
 * </p>
 */
var SN_TimeSelecter = (function () {
    //--------------------------------------------------------------------------
    //
    //  Class constructor
    //
    //--------------------------------------------------------------------------
    /**
     * 构建工作时间段选择器
     */
    function SN_TimeSelecter() {
    }
    //--------------------------------------------------------------------------
    //
    //	Class methods
    //
    //--------------------------------------------------------------------------
    /**
     * 初始化时间段范围
     * @param start 起始时间，必须是 0-24 之间的整数，且小于 end 参数
     * @param end 结束时间，必须是 0-24 之间的整数，且大于 start 参数
     * @param hour_split 1小时分成多少份（参数允许的值：2,3,4,5,6）
     * @param work_start 上班时间
     * @param work_stop 下班时间
     * @param rest_time 工作期间休息时间
     */
    SN_TimeSelecter.prototype.init = function (start, end, hour_split, work_start, work_stop, rest_time) {
        var _this = this;
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = 24; }
        if (hour_split === void 0) { hour_split = 6; }
        if (work_start === void 0) { work_start = "9:30"; }
        if (work_stop === void 0) { work_stop = "20:00"; }
        if (rest_time === void 0) { rest_time = ["12:00-13:00", "18:00-19:00"]; }
        hour_split = hour_split < 2 || hour_split > 6 ? 6 : hour_split;
        this._hour_split = hour_split;
        // 参数检测
        if (start < 0 || end > 24 || start >= end)
            return;
        // 容器检测
        var $body = $("body");
        this.$target = $body.find("#" + SN_TimeSelecter.SELECTER_ID);
        if (this.$target.isNull()) {
            this.$target = $("<div id='" + SN_TimeSelecter.SELECTER_ID + "'><table></table></div>").appendTo($body);
            this.$target.click(function (e) { e.stopPropagation(); });
            $(document).click(function () { _this.hide(); });
        }
        this.$table = this.$target.find(">table");
        // 内容填充
        var head = ""; // 时间点头
        var th = "";
        var ts = "";
        // 上下班时间
        var wsa = work_start.split(":");
        var wea = work_stop.split(":");
        var wsh = parseInt(wsa[0]);
        var wsm = parseInt(wsa[1]);
        var weh = parseInt(wea[0]);
        var wem = parseInt(wea[1]);
        // 休息时间
        var wrs = [];
        for (var i = 0; i < rest_time.length; i++) {
            var se = { start: [], end: [] };
            var cur = rest_time[i].split("-"); // 值如：[12:00,13:00]
            var cur_sa = cur[0].split(":"); // 值如：["12","00"]
            var cur_ea = cur[1].split(":"); // 值如：["13","00"]
            se.start.push(parseInt(cur_sa[0]), parseInt(cur_sa[1]));
            se.end.push(parseInt(cur_ea[0]), parseInt(cur_ea[1]));
            wrs.push(se);
        }
        // 颜色区分
        var d = new Date();
        var d1 = new Date();
        var d2 = new Date();
        for (var hour = start; hour < end; hour++) {
            head += "<th colspan='" + hour_split + "' width='" + (hour_split * 10) + "'>" + hour + "点</th>";
            // 小时分成若干等份，以单元格表示
            for (var sec = 0; sec < 60; sec += 60 / hour_split) {
                d.setHours(hour, sec);
                var id = hour + ":" + (sec == 0 ? "00" : sec);
                var bg = "normal";
                var times = d.getTime();
                // 工作时间性质区分
                //--------------------------------------------------
                // 上下班时间
                d1.setHours(wsh, wsm);
                d2.setHours(weh, wem);
                if (times >= d1.getTime() && times < d2.getTime())
                    bg = "working";
                // 上班期间的休息时间
                for (var i = 0; i < wrs.length; i++) {
                    var rest = wrs[i];
                    d1.setHours(rest.start[0], rest.start[1]);
                    d2.setHours(rest.end[0], rest.end[1]);
                    if (times >= d1.getTime() && times < d2.getTime()) {
                        bg = "rest";
                    }
                }
                // 时间点插槽头标识
                th += "<td id='h" + id + "' class='slot-head " + bg + "'></td>";
                // 时间点插槽
                ts += "<td id='t" + id + "' class='slot-time normal'></td>";
            }
        }
        this.$table.empty();
        this.$table.append("<thead><tr>" + head + "</tr></thead>");
        this.$table.append("<tbody><tr>" + th + "</tr><tr>" + ts + "</tr></tbody>");
        this.$table.find("td[id^=t]").click(function (e) { _this.slotClickHandler(e); });
        // 为所有注册时间选择的对象添加弹出事件
        $("[data-time-selecter]").each(function (index, el) {
            _this.activate($(el));
        });
    };
    SN_TimeSelecter.prototype.activate = function (el, event, callback) {
        var _this = this;
        var evt = !is_empty(event) ? event : el.attr("data-time-selecter");
        var func = is_function(callback) ? callback : eval(el.attr("data-time-callback"));
        // 回调方法
        if (is_function(func))
            this._callback = func;
        // 若事件名为空，则终止操作
        if (is_empty(evt))
            return;
        $(el).bind(evt, function (e) {
            e.stopPropagation(); // 以免向上冒泡到 document 又隐藏选择器
            _this.show($(e.currentTarget));
        });
    };
    /**
     * 在时间段选择器显示之前，根据之前的选择设置已经选择的时间段
     * @param target 目标对象（所选择的时间将以文本内容的形式填充到目标对象）
     */
    SN_TimeSelecter.prototype.setSelected = function (target) {
        var start = $(target).data("start");
        var stop = $(target).data("stop");
        if (is_string(start) && is_string(stop)) {
            this._startTimeEl = this.$table.find("td[id='t" + start + "']");
            // 结束时间要减去1个单位时间
            this._stopTimeEl = this.$table.find("td[id='t" + stop + "']").prev();
        }
        else {
            this._startTimeEl = start;
            this._stopTimeEl = stop;
        }
        this.updateSelectedStyle();
    };
    /**
     * 将时间段选择器显示在指定对象下方
     * @param target 目标对象（所选择的时间将以文本内容的形式填充到目标对象）
     */
    SN_TimeSelecter.prototype.show = function (target) {
        this._curTarget = target;
        this.setSelected(target);
        var d = $("#" + SN_TimeSelecter.SELECTER_ID);
        var pos = target.offset();
        var top = pos.top + target.outerHeight() + 2;
        d.hide();
        d.css({ left: pos.left + 5, top: top + 5 });
        d.animate({ top: top, opacity: 'show' }, 150);
    };
    SN_TimeSelecter.prototype.hide = function () {
        this.$target.hide();
    };
    /**
     * 根据当前选定的时间单元，来处理选择器的外观表现
     * @param td 目标操作的对应单元格
     */
    SN_TimeSelecter.prototype.updateSelectedStyle = function (td) {
        var _this = this;
        if (is_empty(this._startTimeEl) && is_empty(this._stopTimeEl)) {
            // 还原背景色
            this.$table.find("td[id^=t]").each(function () {
                $(this).removeClass("working").addClass("normal");
            });
        }
        else {
            // 设置时间段之间单元格的背景色
            var si = -1;
            var ei = -1;
            if (!is_empty(this._startTimeEl)) {
                si = this._startTimeEl.index();
                if (!is_empty(td) && !td.isNull())
                    td.removeClass("normal").addClass("working");
            }
            if (!is_empty(this._stopTimeEl)) {
                ei = this._stopTimeEl.index();
                if (!is_empty(td) && !td.isNull())
                    td.removeClass("normal").addClass("working");
            }
            else {
                // 当重新选择开始点后，要将上次选择的区间全部去除选定状态
                this.$table.find("td[id^=t]").each(function (index, el) {
                    if (!is_empty(_this._startTimeEl) && _this._startTimeEl.index() != index) {
                        $(el).removeClass("working").addClass("normal");
                    }
                });
            }
            if (!is_empty(this._startTimeEl) && !is_empty(this._stopTimeEl))
                this.$table.find("td[id^=t]").each(function (index, el) {
                    $(el).removeClass("normal");
                    $(el).removeClass("working");
                    if (index >= si && index <= ei) {
                        $(el).addClass("working");
                    }
                    else {
                        $(el).addClass("normal");
                    }
                });
        }
    };
    /**
     * 根据选定的时间单元，更新显示时间段到表格中
     */
    SN_TimeSelecter.prototype.updateSelectedText = function () {
        if (!is_empty(this._startTimeEl) && !is_empty(this._stopTimeEl)) {
            var sa = this._startTimeEl.attr("id").substr(1).split(":");
            var ea = this._stopTimeEl.attr("id").substr(1).split(":");
            var st = "";
            var et = "";
            var ds = new Date();
            var de = new Date();
            ds.setHours(parseInt(sa[0]), parseInt(sa[1]));
            de.setHours(parseInt(ea[0]), parseInt(ea[1]) + 60 / this._hour_split);
            st = ds.getHours() + ":" + (ds.getMinutes() == 0 ? "00" : ds.getMinutes());
            et = de.getHours() + ":" + (de.getMinutes() == 0 ? "00" : de.getMinutes());
            if (is_function(this._callback))
                this._callback(this._curTarget, st, et, ds.getHours(), ds.getMinutes(), de.getHours(), de.getMinutes());
        }
        else {
            if (is_function(this._callback))
                this._callback(this._curTarget, null);
        }
    };
    //--------------------------------------------------------------------------
    //
    //  Event handlers
    //
    //--------------------------------------------------------------------------
    SN_TimeSelecter.prototype.slotClickHandler = function (e) {
        var td = $(e.currentTarget); // 时间选择器上单击的单元格
        if (is_empty(this._startTimeEl)) {
            // 未选择时设定起始时间点
            this._startTimeEl = td;
        }
        else if (!is_empty(this._startTimeEl) && !is_empty(this._stopTimeEl)) {
            // 已选择起始、结束时间点，则重新设定起始点，并置空结束点
            // 相当于重新的选择了开始点，得继续选择结束点
            this._startTimeEl = td;
            this._stopTimeEl = null;
        }
        else {
            if (td.index() < this._startTimeEl.index()) {
                this._stopTimeEl = this._startTimeEl;
                this._startTimeEl = td;
            }
            else {
                this._stopTimeEl = td;
            }
        }
        // 更新选中时间段表现
        this.updateSelectedStyle(td);
        this.updateSelectedText();
        // 数据缓存
        $(this._curTarget).data("start", this._startTimeEl);
        $(this._curTarget).data("stop", this._stopTimeEl);
    };
    //--------------------------------------------------------------------------
    //
    // Class constants
    //
    //--------------------------------------------------------------------------
    SN_TimeSelecter.SELECTER_ID = "__SN_TIME_SELECTER";
    return SN_TimeSelecter;
}());
(function ($) {
    $["sn_times"] = new SN_TimeSelecter();
})(jQuery);
jQuery.fn.extend({
    sn_times: function (evt, callback) {
        $["sn_times"].activate($(this), evt, callback);
    }
});
//------------------------------------------------------------------------------
//
// 倒计时插件
// class: sn_countdown 
// author: 喵大斯( as3er.net )
// created: 2015/11/2
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------
///<reference path="../jquery/jquery.d.ts"/>
///<reference path="../jquery/jquery.ext.d.ts"/>
var SN_Countdown = (function () {
    //--------------------------------------------------------------------------
    //
    //  Class constructor
    //
    //--------------------------------------------------------------------------
    function SN_Countdown() {
        //--------------------------------------------------------------------------
        //
        //	Class properties
        //
        //--------------------------------------------------------------------------
        this._cache = {};
    }
    //--------------------------------------------------------------------------
    //
    //	Class methods
    //
    //--------------------------------------------------------------------------
    /**
     * 倒计时多少秒后，执行指定的方法
     * @param taskid 任务名称（相同名称的倒计时任务将被覆盖）
     * @param sec 倒计时完成时的总时间（单位：秒）
     * @param completeHandler 完成时的回调（回调方法无参数）
     * @param secondHandler 每秒触发的回调（回调方法需接收3个参数：function(剩余秒数，逝去秒数，总秒数)）
     * @param once 是否在执行一次后，立即失效
     */
    SN_Countdown.prototype.countdown = function (taskid, sec, completeHandler, secondHandler, once) {
        if (secondHandler === void 0) { secondHandler = null; }
        if (once === void 0) { once = false; }
        if (!this._cache.hasOwnProperty(taskid))
            this._cache[taskid] = {
                taskid: "",
                sec: 0,
                past: 0,
                complete: null,
                second: null,
                once: false
            };
        this._cache[taskid].taskid = taskid;
        this._cache[taskid].sec = sec;
        this._cache[taskid].complete = completeHandler;
        this._cache[taskid].second = secondHandler;
        this._cache[taskid].once = once;
        this.start();
    };
    SN_Countdown.prototype.start = function () {
        if (this._started)
            return false;
        this._started = true;
        this.doit();
    };
    SN_Countdown.prototype.stop = function () {
        if (!this._started)
            return false;
        this._started = false;
    };
    //--------------------------------------------------------------------------
    //
    //  Event handlers
    //
    //--------------------------------------------------------------------------
    SN_Countdown.prototype.doit = function () {
        var _this = this;
        // 已经停止不再继续执行
        if (!this._started)
            return false;
        // 执行数量，若没有需要倒计时的任务，则停止
        var count = 0;
        for (var id in this._cache) {
            var cd = this._cache[id];
            // 累加秒数时间
            cd.past++;
            // 回调
            if (is_function(cd.complete) && cd.past > cd.sec) {
                cd.complete();
                if (cd.once) {
                    delete this._cache[id];
                }
                else {
                    cd.past = 0;
                }
            }
            else if (is_function(cd.second)) {
                cd.second(cd.sec - cd.past, cd.past, cd.sec);
            }
            // 数量统计
            count++;
        }
        if (count == 0)
            this.stop();
        // 每秒循环
        window.setTimeout(function () { _this.doit(); }, 1000);
    };
    return SN_Countdown;
}());
(function ($) {
    $["sn_cd"] = new SN_Countdown();
})(jQuery);
//------------------------------------------------------------------------------
//
// 自动撑高 TextArea
// class: sn_textarea_autoheight 
// author: 喵大斯( as3er.net )
// created: 2015/11/2
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------
var SN_TextArea_AutoHeight = (function () {
    function SN_TextArea_AutoHeight() {
    }
    /**
     * 从指定的父级容器中寻找 TextArea 对象进行自动高度支持设置
     * @param pt
     */
    SN_TextArea_AutoHeight.findAndSetTextArea = function (pt) {
        pt.find("textarea").each(function (index, el) {
            SN_TextArea_AutoHeight.autoHeight($(el));
        });
    };
    /**
     * 将指定 TextArea 设置为可自动根据内容来适应调整高度
     * @param textarea 目标 TextArea 对象
     */
    SN_TextArea_AutoHeight.autoHeight = function (textarea) {
        if (textarea.isNull() || textarea.tagName() != "textarea")
            return;
        // 立即更新高度
        SN_TextArea_AutoHeight._setHeightByContent(textarea);
        // 添加事件监听
        textarea.bind("keydown", { el: textarea }, function (e) {
            if (e.which == 13)
                $(e.data.el).height($(e.data.el).height() + parseInt($(e.data.el).css("line-height")));
        });
        textarea.bind("keyup", SN_TextArea_AutoHeight._setHeightHandler);
        textarea.bind("focusout", SN_TextArea_AutoHeight._setHeightHandler);
        $(window).bind("resize", { el: textarea }, SN_TextArea_AutoHeight._setHeightForResizeHandler);
    };
    SN_TextArea_AutoHeight.removeHeight = function (textarea) {
        if (textarea.isNull() || textarea.tagName() != "textarea")
            return;
        // 去除事件监听
        textarea.unbind("keyup", SN_TextArea_AutoHeight._setHeightHandler);
        textarea.unbind("focusout", SN_TextArea_AutoHeight._setHeightHandler);
        $(window).unbind("resize", SN_TextArea_AutoHeight._setHeightForResizeHandler);
    };
    SN_TextArea_AutoHeight._setHeightByContent = function (textarea) {
        SN_TextArea_AutoHeight.TEXTAREA_COPY = SN_TextArea_AutoHeight.TEXTAREA_COPY || $("<textarea></textarea>").appendTo("body");
        var tac = SN_TextArea_AutoHeight.TEXTAREA_COPY;
        tac.css({
            "position": "absolute",
            "left": "-9999px",
            "font-size": textarea.css("font-size"),
            "font-family": textarea.css("font-family"),
            "line-height": textarea.css("line-height"),
            "padding-top": textarea.css("padding-top"),
            "padding-bottom": textarea.css("padding-bottom"),
            "padding-left": textarea.css("padding-left"),
            "padding-right": textarea.css("padding-right")
        });
        tac.attr("rows", textarea.attr("rows"));
        tac.outerWidth(textarea.outerWidth());
        tac.val(textarea.val());
        var max = parseInt(textarea.css("max-height"));
        var sh = tac.prop("scrollHeight");
        if ($.browser.type == "ie") {
            sh = textarea[0].scrollHeight;
            textarea.css("overflow-y", sh > max ? "visible" : "hidden");
            textarea[0].style["posHeight"] = sh;
        }
        else {
            textarea.css("overflow-y", sh > max ? "auto" : "hidden");
            textarea.animate({ height: (sh > max ? max : sh) }, 150);
        }
    };
    //--------------------------------------------------------------------------
    //
    //  Event handlers
    //
    //--------------------------------------------------------------------------
    SN_TextArea_AutoHeight._setHeightForResizeHandler = function (e) {
        SN_TextArea_AutoHeight._setHeightByContent(e.data.el);
    };
    SN_TextArea_AutoHeight._setHeightHandler = function (e) {
        SN_TextArea_AutoHeight._setHeightByContent($(this));
    };
    return SN_TextArea_AutoHeight;
}());
(function ($) {
    $["sn_textarea"] = function (pt) {
        pt = is_empty(pt) || pt.isNull() ? $("body") : pt;
        SN_TextArea_AutoHeight.findAndSetTextArea(pt);
    };
})(jQuery);
jQuery.fn.extend({
    sn_textarea: function (remove) {
        if (remove === void 0) { remove = false; }
        var regist = function (el) {
            if (el.tagName() != "textarea")
                return;
            el.css("resize", "none"); // 禁止右下角拖动改变尺寸
            if (remove)
                SN_TextArea_AutoHeight.removeHeight(el);
            else
                SN_TextArea_AutoHeight.autoHeight(el);
        };
        if ($(this).length > 1) {
            $(this).each(function (index, el) {
                regist($(el));
            });
        }
        else {
            regist($(this));
        }
    }
});
//------------------------------------------------------------------------------
//
// 上传文件客户端模块
// class: sn_upload 
// author: 喵大斯( as3er.net )
// created: 2015/11/5
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------
var SN_Upload = (function () {
    //--------------------------------------------------------------------------
    //
    //  Class constructor
    //
    //--------------------------------------------------------------------------
    function SN_Upload() {
        //----------------------------------------
        // options
        //----------------------------------------
        // 默认设置
        this._options = {
            id: "__SN_UPLOADER",
            swf: "",
            url: "",
            vars: ""
        };
    }
    SN_Upload.prototype.options = function (value) {
        $.extend(this._options, value);
    };
    //--------------------------------------------------------------------------
    //
    //	Class methods
    //
    //--------------------------------------------------------------------------
    SN_Upload.prototype._getSWF = function (swf, vars) {
        if (vars === void 0) { vars = ""; }
        if ($.browser.type == "ie") {
            return "<object classid=\"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\" name=\"__SWF\" id=\"__SWF\" width=\"510\" height=\"410\">\n\t\t\t\t\t\t<param name=\"movie\" value=\"" + swf + "\" />\n\t\t\t\t\t\t<param name=\"quality\" value=\"high\" />\n\t\t\t\t\t\t<param name=\"allowScriptAccess\" value=\"always\" />\n\t\t\t\t\t\t<param name=\"allowFullScreen\" value=\"true\" />\n\t\t\t\t\t\t<param name=\"allowNetworking\" value=\"all\" />\n\t\t\t\t\t\t<param name=\"wmode\" value=\"transparent\">\n\t\t\t\t\t\t<param name=\"flashVars\" value=\"" + vars + "\">\n\t\t\t\t\t</object>";
        }
        else {
            return "<embed src=\"" + swf + "\"\n\t\t\t\t\tname=\"__SWF_EMBED\"\n\t\t\t\t\tid=\"__SWF_EMBED\"\n\t\t\t\t\tquality=\"high\"\n\t\t\t\t\twmode=\"transparent\"\n\t\t\t\t\tallowScriptAccess=\"always\"\n\t\t\t\t\tallowNetworking=\"all\"\n\t\t\t\t\tpluginspage=\"http://www.macromedia.com/go/getflashplayer\"\n\t\t\t\t\ttype=\"application/x-shockwave-flash\"\n\t\t\t\t\tflashVars=\"" + vars + "\">\n\t\t\t\t\t</embed>";
        }
    };
    /**
     * 弹出上传控件，以上传新的文件
     * @param options 上传参数
     * @param callback 上传成功的后的回调方法
     */
    SN_Upload.prototype.upload = function (options, callback) {
        if (is_function(callback))
            this._callback = callback;
        if (!is_empty(options))
            this.options(options);
        var $backdrop = $('.modal-backdrop');
        if ($backdrop.isNull())
            $backdrop = $('<div class="modal-backdrop fade"/>').appendTo("body");
        $backdrop[0].offsetWidth;
        var $pad = $('#' + this._options.id);
        if ($pad.isNull()) {
            $pad = $(SN_Upload.HTML).appendTo("body");
            $pad.attr("id", this._options.id);
        }
        // 插入SWF模块
        $pad.find(".inner").html(this._getSWF(this._options.swf, this._options.vars));
        var $swf = $.browser.type == "ie" ? $("#__SWF") : $("#__SWF_EMBED");
        $swf.css("min-width", 500);
        $swf.width("100%");
        $swf.height(420);
        $backdrop.addClass('in');
        $pad.show().addClass('in');
    };
    /**
     * 关闭上传窗口
     */
    SN_Upload.prototype.close = function () {
        $('.modal-backdrop').remove();
        $('#' + this._options.id).hide().removeClass('in');
    };
    /**
     * 上传完成时的回调方法
     */
    SN_Upload.prototype.complete = function (value) {
        if (is_function(this._callback))
            this._callback(value);
    };
    //----------------------------------------
    // html frame
    //----------------------------------------
    SN_Upload.HTML = "\n\t<div class='modal fade'>\n\t\t<div class=\"modal-dialog modal-md\">\n\t\t\t<div class=\"inner text-center\">\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\t";
    return SN_Upload;
}());
(function ($) {
    $["sn_upload"] = new SN_Upload();
})(jQuery);
//------------------------------------------------------------------------------
//
// ...
// class: sn_oss 
// author: 喵大斯( as3er.net )
// created: 2015/11/27
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------
var SN_Oss = (function () {
    //--------------------------------------------------------------------------
    //
    //  Class constructor
    //
    //--------------------------------------------------------------------------
    function SN_Oss() {
        //----------------------------------------
        // options
        //----------------------------------------
        // 默认设置
        this._options = {
            id: "__SN_OSS_FILEUPLOADER",
            swf: "",
            vars: "max=6"
        };
    }
    SN_Oss.prototype.options = function (value) {
        $.extend(this._options, value);
    };
    //--------------------------------------------------------------------------
    //
    //	Class methods
    //
    //--------------------------------------------------------------------------
    SN_Oss.prototype._getSWF = function (swf, vars) {
        if (vars === void 0) { vars = ""; }
        if ($.browser.type == "ie") {
            return "<object classid=\"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\" name=\"__SWF\" id=\"__SWF\" width=\"510\" height=\"410\">\n\t\t\t\t\t\t<param name=\"movie\" value=\"" + swf + "\" />\n\t\t\t\t\t\t<param name=\"quality\" value=\"high\" />\n\t\t\t\t\t\t<param name=\"allowScriptAccess\" value=\"always\" />\n\t\t\t\t\t\t<param name=\"allowFullScreen\" value=\"false\" />\n\t\t\t\t\t\t<param name=\"allowNetworking\" value=\"all\" />\n\t\t\t\t\t\t<param name=\"wmode\" value=\"transparent\">\n\t\t\t\t\t\t<param name=\"flashVars\" value=\"" + vars + "\">\n\t\t\t\t\t</object>";
        }
        else {
            return "<embed src=\"" + swf + "\"\n\t\t\t\t\tname=\"__SWF_EMBED\"\n\t\t\t\t\tid=\"__SWF_EMBED\"\n\t\t\t\t\tquality=\"high\"\n\t\t\t\t\twmode=\"transparent\"\n\t\t\t\t\tallowScriptAccess=\"always\"\n\t\t\t\t\tallowNetworking=\"all\"\n\t\t\t\t\tpluginspage=\"http://www.macromedia.com/go/getflashplayer\"\n\t\t\t\t\ttype=\"application/x-shockwave-flash\"\n\t\t\t\t\tflashVars=\"" + vars + "\">\n\t\t\t\t\t</embed>";
        }
    };
    /**
     * 弹出上传控件，以上传新的文件
     * @param options 上传参数
     * @param callback 上传成功的后的回调方法
     */
    SN_Oss.prototype.upload = function (options, callback) {
        if (is_function(callback))
            this._callback = callback;
        if (!is_empty(options))
            this.options(options);
        var $backdrop = $('.modal-backdrop');
        if ($backdrop.isNull())
            $backdrop = $('<div class="modal-backdrop fade"/>').appendTo("body");
        $backdrop[0].offsetWidth;
        var $pad = $('#' + this._options.id);
        if ($pad.isNull()) {
            $pad = $(SN_Oss.HTML).appendTo("body");
            $pad.attr("id", this._options.id);
        }
        // 插入SWF模块
        if (is_empty(this._options.vars))
            this._options.vars = "init=$.sn_oss.initHandler";
        else
            this._options.vars += "&init=$.sn_oss.initHandler";
        this._options.vars += "&close=$.sn_oss.closeHandler";
        this._options.vars += "&complete=$.sn_oss.completeHandler";
        $pad.find(".inner").html(this._getSWF(this._options.swf, this._options.vars));
        var $swf = this.getSwfObject();
        $swf.css("min-width", 500);
        $swf.width("100%");
        $swf.height(420);
        $backdrop.addClass('in');
        $pad.show().addClass('in');
    };
    SN_Oss.prototype.getSwfObject = function () {
        return $.browser.type == "ie" ? $("#__SWF") : $("#__SWF_EMBED");
    };
    /**
     * 关闭上传窗口
     */
    SN_Oss.prototype.close = function () {
        $('.modal-backdrop').remove();
        $('#' + this._options.id).hide().removeClass('in');
    };
    //--------------------------------------------------------------------------
    //
    //  Event handlers
    //
    //--------------------------------------------------------------------------
    SN_Oss.prototype.initHandler = function () {
        var _this = this;
        // 验证信息获取
        $.post(this._options.verify, null, function (d) {
            _this.verifyHandler(d);
        }, "text");
    };
    SN_Oss.prototype.verifyHandler = function (data) {
        var $swf = this.getSwfObject();
        $swf[0].setBaseVars(data);
        // 文件上传后的附加前缀路径
        if (!is_empty(this._options.dir))
            $swf[0].setBaseDir(this._options.dir);
    };
    SN_Oss.prototype.closeHandler = function () {
        this.close();
    };
    SN_Oss.prototype.completeHandler = function (data) {
        if (is_function(this._callback))
            this._callback(data);
    };
    //----------------------------------------
    // html frame
    //----------------------------------------
    SN_Oss.HTML = "\n\t<div class='modal fade'>\n\t\t<div class=\"modal-dialog modal-md\">\n\t\t\t<div class=\"inner text-center\">\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\t";
    return SN_Oss;
}());
(function ($) {
    $["sn_oss"] = new SN_Oss();
})(jQuery);
//------------------------------------------------------------------------------
//
// 图片列表选择工具类
// class: sn_image 
// author: 喵大斯( as3er.net )
// created: 2015/11/10
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------
///<reference path="../jquery/jquery.d.ts"/>
///<reference path="../jquery/jquery.ext.d.ts"/>
///<reference path="sn_modal.ts"/>
var SN_Image = (function () {
    //--------------------------------------------------------------------------
    //
    //  Class constructor
    //
    //--------------------------------------------------------------------------
    function SN_Image(url) {
        var _this = this;
        if (url === void 0) { url = null; }
        var opts = {
            target: "#__SN_MODAL_IMAGE",
            title: "选择历史图片",
            size: "lg",
            css: "imglist",
            onComplete: this.completeHandler,
            onEnter: function (body) { _this.enterHandler(body); }
        };
        if (is_empty(url))
            opts["remote"] = url;
        this.$modal = $.sn_modal(opts);
    }
    //--------------------------------------------------------------------------
    //
    //	Class methods
    //
    //--------------------------------------------------------------------------
    /**
     * 设置加载远程地址内容
     * @param url 返回图片列表的远程地址
     */
    SN_Image.prototype.setRemote = function (url) {
        if (is_empty(url))
            return;
        this.$modal.setOptions({ remote: url });
        this._url = url;
    };
    /**
     * 设置需要在模块窗口显示的内容
     * @param content
     */
    SN_Image.prototype.setContent = function (content) {
        if (is_empty(content))
            return;
        this.$modal.setOptions({ content: content });
    };
    /**
     * 设置当点击确定按钮时的回调方法
     * @param func
     */
    SN_Image.prototype.setComplete = function (func) {
        if (is_function(func))
            this._complete = func;
    };
    SN_Image.prototype.show = function () {
        this.$modal.show();
    };
    SN_Image.prototype.close = function () {
        this.$modal.close();
    };
    SN_Image.prototype.destroy = function () {
        this.$modal.destroy();
    };
    //--------------------------------------------------------------------------
    //
    //  Event handlers
    //
    //--------------------------------------------------------------------------
    SN_Image.prototype.completeHandler = function (body) {
        body.find("li").each(function (index, el) {
            $(el).click(function () { $(el).toggleClass("selected"); });
        });
    };
    SN_Image.prototype.enterHandler = function (body) {
        if (is_function(this._complete))
            this._complete(body.find("li.selected"));
    };
    return SN_Image;
}());
(function ($) {
    $.sn_image = function (url) {
        if (url === void 0) { url = null; }
        return new SN_Image(url);
    };
})(jQuery);
//------------------------------------------------------------------------------
//
// ...
// class: sn_picview 
// author: 喵大斯( as3er.net )
// created: 2015/11/17
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------
///<reference path="../jquery/jquery.d.ts"/>
///<reference path="../jquery/jquery.ext.d.ts"/>
///<reference path="../bootstrap/bootstrap.d.ts"/>
///<reference path="sn_modal.ts"/>
var SN_Picview = (function () {
    //--------------------------------------------------------------------------
    //
    //  Class constructor
    //
    //--------------------------------------------------------------------------
    /*

     1、设计图片控制工具栏
     2、如何关闭全屏查看图片工具


     */
    function SN_Picview() {
        var _this = this;
        var opts = {
            html: "\n\t\t\t<div class=\"modal fade\" id=\"__SN_PICVIEWER\">\n\t\t\t<div class=\"modal-body inner\"></div>\n\t\t\t<div class=\"modal-ctrl btn-group btn-group-lg\">\n\t\t\t\t<!--<button type=\"button\" class=\"btn btn-primary\" data-action=\"pre\">-->\n\t\t\t\t\t<!--<span class=\"glyphicon glyphicon-chevron-left\"></span> \u4E0A\u4E00\u5F20-->\n\t\t\t\t<!--</button>-->\n\t\t\t\t<button type=\"button\" class=\"btn btn-default\" data-action=\"view\">\n\t\t\t\t\t<span class=\"glyphicon glyphicon-download-alt\"></span> \u67E5\u770B\u539F\u59CB\u56FE\u7247\n\t\t\t\t</button>\n\t\t\t\t<button type=\"button\" class=\"btn btn-default\" data-action=\"close\">\n\t\t\t\t\t<span class=\"glyphicon glyphicon-remove\"></span> \u5173\u95ED\n\t\t\t\t</button>\n\t\t\t\t<!--<button type=\"button\" class=\"btn btn-primary\" data-action=\"next\">-->\n\t\t\t\t\t<!--\u4E0B\u4E00\u5F20 <span class=\"glyphicon glyphicon-chevron-right\"></span>-->\n\t\t\t\t<!--</button>-->\n\t\t\t</div>\n\t\t\t</div>\n\t\t\t",
            onComplete: function (body) { _this.completeHandler(body); },
            onShow: function (body) {
                // 只有在显示后才能获取 Div 控制栏的尺寸大小，进行定位
                var img = body.find("img");
                var ctrl = body.next(".modal-ctrl");
                _this.resize(img);
                _this.relocate(img, ctrl);
            }
        };
        this.$modal = $.sn_modal(opts);
    }
    //--------------------------------------------------------------------------
    //
    //	Class methods
    //
    //--------------------------------------------------------------------------
    /**
     * 全屏查看图片
     * @param url
     * @param width
     * @param height
     */
    SN_Picview.prototype.view = function (url, width, height) {
        var html = "\n\t\t<a href=\"" + url + "\" target=\"_blank\">\n\t\t<img src=\"" + url + "\" data-param=\"" + width + "," + height + "\" style=\"display:none;\">\n\t\t</a>\n\t\t";
        this.$modal.setOptions({ content: html });
        this.$modal.show();
    };
    SN_Picview.prototype.close = function () {
        this.$modal.close();
    };
    SN_Picview.prototype.destroy = function () {
        this.$modal.destroy();
    };
    SN_Picview.prototype.view_img = function (img) {
        img.parent().get(0).click();
    };
    SN_Picview.prototype.resize = function (img) {
        var data = img.attr("data-param").split(",");
        var iw = parseInt(data[0]);
        var ih = parseInt(data[1]);
        var win = $(window);
        var ww = win.width() * 0.8 >> 0;
        var wh = win.height() * 0.85 - 50 >> 0;
        if (iw > ww) {
            ih = ww / iw * ih >> 0;
            iw = ww;
        }
        if (ih > wh) {
            iw = wh / ih * iw >> 0;
            ih = wh;
        }
        img.width(iw);
        img.height(ih);
    };
    SN_Picview.prototype.relocate = function (img, ctrl) {
        var iw = img.width();
        var ih = img.height();
        var win = $(window);
        var tx = win.width() - iw >> 1;
        var ty = (win.height() - ih >> 1) * 0.8 >> 0;
        img.css("position", "fixed");
        img.pos(tx, ty);
        img.fadeIn(200);
        tx = win.width() - ctrl[0].offsetWidth >> 1;
        ty = win.height() - ctrl[0].offsetHeight - 50;
        ctrl.css("position", "fixed");
        ctrl.pos(tx, ty);
        ctrl.fadeIn(200);
    };
    //--------------------------------------------------------------------------
    //
    //  Event handlers
    //
    //--------------------------------------------------------------------------
    // 内容加载完成时的处理逻辑
    SN_Picview.prototype.completeHandler = function (body) {
        var _this = this;
        var img = body.find("img");
        var ctrl = body.next(".modal-ctrl");
        $(window).off("resize").on("resize", { img: img, ctrl: ctrl }, function (e) {
            _this.resize(e.data.img);
            _this.relocate(e.data.img, e.data.ctrl);
        });
        // 按钮功能
        //var btnPre:JQuery = ctrl.find( "[data-action='pre']" );
        var btnView = ctrl.find("[data-action='view']");
        var btnClose = ctrl.find("[data-action='close']");
        //var btnNext:JQuery = ctrl.find( "[data-action='next']" );
        btnView.off("click").on("click", function (e) { _this.view_img(img); });
        btnClose.off("click").on("click", function () { _this.close(); });
    };
    return SN_Picview;
}());
(function ($) {
    $.sn_picview = new SN_Picview();
})(jQuery);
//------------------------------------------------------------------------------
//
// HTML 内容处理辅助
// class: sn_html 
// author: 喵大斯( as3er.net )
// created: 2015/12/28
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------
var SN_Html = (function () {
    //--------------------------------------------------------------------------
    //
    //  Class constructor
    //
    //--------------------------------------------------------------------------
    function SN_Html() {
    }
    //--------------------------------------------------------------------------
    //
    //	Class methods
    //
    //--------------------------------------------------------------------------
    SN_Html.prototype.set_filter_url = function (url) {
        this._filter_url = url;
    };
    SN_Html.prototype.filter = function (content, callback) {
        if (is_empty(this._filter_url) || is_empty(content)) {
            if (is_function(callback))
                callback(content);
            return content;
        }
        $.post(this._filter_url, { content: content }, function (data) {
            if (is_function(callback))
                callback(data);
            return data;
        }, "html");
        return null;
    };
    return SN_Html;
}());
(function ($) {
    $["sn_html"] = new SN_Html();
})(jQuery);
