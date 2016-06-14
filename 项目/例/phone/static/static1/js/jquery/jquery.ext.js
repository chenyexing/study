//------------------------------------------------------------------------------
//
// JQuery 扩展库
// author: 喵大斯( as3er.net )
// created: 2015/9/17
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------
/// <reference path="jquery.d.ts"/>
(function (jq) {
    /**
     * 动态加载CSS文件
     * @param url css 文件地址（本地服务器相对路径或者远程服务器全路径）
     */
    jq.getCSS = function (url) {
        jq('head').append("<link href=\"" + url + "\" rel=\"stylesheet\" type=\"text/css\" />");
    };
    // 检测浏览器类型
    // <p>$.browser.type - 结果为当前浏览器类型，而调用 $.browser[$.browser.type] 可以获知当前浏览器的版本号。</p>
    jq.browser = {};
    jq.browser.agent = navigator.userAgent;
    var bs = jq.browser;
    var ua = jq.browser.agent.toLowerCase();
    if (window.ActiveXObject) {
        bs.type = "ie";
        bs.ie = ua.match(/msie ([\d.]+)/)[1];
    }
    else if (document.getBoxObjectFor) {
        bs.type = "firefox";
        bs.firefox = ua.match(/firefox\/([\d.]+)/)[1];
    }
    else if (ua.indexOf("chrome/") > 0 && window.MessageEvent && !document.getBoxObjectFor) {
        bs.type = "chrome";
        bs.chrome = ua.match(/chrome\/([\d.]+)/)[1];
    }
    else if (window.opera) {
        bs.type = "opera";
        bs.opera = ua.match(/opera.([\d.]+)/)[1];
    }
    else if (window.openDatabase) {
        bs.type = "safari";
        if (ua.indexOf("nokia") > 0 && ua.match(/safari\/([\d.]+)/)) {
            bs.safari = ua.match(/safari\/([\d.]+)/)[1];
        }
        else if (ua.match(/version\/([\d.]+)/)) {
            bs.safari = ua.match(/version\/([\d.]+)/)[1];
        }
        else {
            bs.safari = "unknow";
        }
    }
    else {
        bs.type = "unknown";
        bs.unknown = "未知类型";
    }
})(jQuery);
//--------------------------------------------------------------------------
//
//	JQuery 对象方法扩展（需要匹配对象后调用，如 $("#xxx").xxx() ）
//
//--------------------------------------------------------------------------
jQuery.fn.extend({
    /**
     * 检测当前 selector 查询结果是否为空
     * @returns {boolean}
     */
    isNull: function () {
        return this.length <= 0;
    },
    /**
     * 取得 HTML 节点对象的标签名称
     * @returns {string}
     */
    tagName: function () {
        var pt = $(this).prop("tagName");
        pt = is_empty(pt) ? $(this).attr("tagName") : pt;
        pt = pt.toLowerCase();
        return pt;
    },
    /**
     * 设置指定对象的透明度
     * @param value 0-1之间的浮点数（0-完全不可见，1-完全不可见）
     */
    alpha: function (value) {
        if (value <= 0)
            value = 0;
        if (value >= 1)
            value = 1;
        // mozilla firefox
        this.css("-moz-opacity", value);
        // chrome
        this.css("opacity", value);
        // IE
        this.css("filter", "alpha(opacity=" + (value * 100) + ")");
    },
    /**
     * 设置/取得所查询对象是否可见
     * @param value true-设置为可见；false-设置为隐藏
     * @returns {boolean}
     */
    visible: function (value) {
        if (value == true || value == false) {
            value ? this.show() : this.hide();
        }
        return this.css("display") != "none";
    },
    /**
     * 设置指定可视对象的坐标（即 x 对应 left，y 对应 top）
     * @param x
     * @param y
     */
    pos: function (x, y) {
        this.css("left", x);
        this.css("top", y);
    },
    /**
     * 设置指定可视对象的 x 坐标
     * @param x
     */
    posX: function (x) {
        this.css("left", x);
    },
    /**
     * 设置指定可视对象的 y 坐标
     * @param y
     */
    posY: function (y) {
        this.css("top", y);
    }
});
//--------------------------------------------------------------------------
//
// 全局方法
//
//--------------------------------------------------------------------------
function is_bool(obj) { return $.type(obj) == "boolean"; }
function is_string(obj) { return $.type(obj) == "string"; }
function is_number(obj) { return $.type(obj) == "number"; }
function is_array(obj) { return $.type(obj) == "array"; }
function is_function(obj) { return $.type(obj) == "function"; }
function is_date(obj) { return $.type(obj) == "date"; }
function is_regexp(obj) { return $.type(obj) == "regexp"; }
/**
 * 测试对象是否是空字符、null、undefined 或者 {}
 * @param obj
 * @returns boolean
 */
function is_empty(obj) {
    return obj == "" || obj == null || typeof (obj) == void (0);
}
/**
 * 将毫秒转换成 “天 时:分:秒 毫秒”
 *
 * @param format 结果格式：d-天，h-时，i-分，s-秒，l-毫秒
 * @param ms 毫秒数
 * @returns string
 */
function ftime(format, ms) {
    var ss = 1000;
    var mi = ss * 60; //60000
    var hh = mi * 60; //3600000
    var dd = hh * 24; //86400000
    var day = (ms / dd) >> 0;
    var hour = ((ms - day * dd) / hh) >> 0;
    var minute = ((ms - day * dd - hour * hh) / mi) >> 0;
    var second = ((ms - day * dd - hour * hh - minute * mi) / ss) >> 0;
    var milliSecond = ms - day * dd - hour * hh - minute * mi - second * ss;
    var strDay = day < 10 ? "0" + day : "" + day;
    var strHour = hour < 10 ? "0" + hour : "" + hour;
    var strMinute = minute < 10 ? "0" + minute : "" + minute;
    var strSecond = second < 10 ? "0" + second : "" + second;
    var strMilliSecond = milliSecond < 10 ? "0" + milliSecond : "" + milliSecond;
    strMilliSecond = milliSecond < 100 ? "0" + strMilliSecond : "" + strMilliSecond;
    var r = format;
    r = r.replace(/d/ig, strDay);
    r = r.replace(/h/ig, strHour);
    r = r.replace(/i/ig, strMinute);
    r = r.replace(/s/ig, strSecond);
    r = r.replace(/l/ig, strMilliSecond);
    return r;
}
