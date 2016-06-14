//------------------------------------------------------------------------------
//
// JQuery 扩展库定义文档
// author: 喵大斯( as3er.net )
// created: 2015/9/17
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------

/// <reference path="../jquery/jquery.d.ts"/>

//--------------------------------------------------------------------------
//
//	JQuery 静态方法扩展（直接使用 $.xxx() 形式调用）
//
//--------------------------------------------------------------------------

// 扩展 JQuery
interface JQueryStatic
{
	/**
	 * 动态加载CSS文件
	 * @param url css 文件地址（本地服务器相对路径或者远程服务器全路径）
	 */
	getCSS( url:string ):void;

	/**
	 * 浏览器信息
	 */
	browser:{type:string, agent:string, unknown?:string, ie?:string, firfox?:string, chrome?:string, opera?:string, safari?:string};
}

//--------------------------------------------------------------------------
//
//	JQuery 对象方法扩展（需要匹配对象后调用，如 $("#xxx").xxx() ）
//
//--------------------------------------------------------------------------

// 扩展 JQuery.fn.extend
interface JQuery
{
	/**
	 * 检测当前 selector 查询结果是否为空
	 * @returns {boolean}
	 */
	isNull():boolean;

	/**
	 * 取得 HTML 节点对象的标签名称
	 * @returns {string}
	 */
	tagName():string;

	/**
	 * 设置指定对象的透明度
	 * @param value 0-1之间的浮点数（0-完全不可见，1-完全不可见）
	 */
	alpha( value:number ):void;

	/**
	 * 设置/取得所查询对象是否可见
	 * @param value true-设置为可见；false-设置为隐藏
	 * @returns {boolean}
	 */
	visible( value ?:boolean ):boolean;

	/**
	 * 设置指定可视对象的坐标（即 x 对应 left，y 对应 top）
	 * @param x
	 * @param y
	 */
	pos( x:number, y:number ):void;

	/**
	 * 设置指定可视对象的 x 坐标
	 * @param x
	 */
	posX( x:number ):void;

	/**
	 * 设置指定可视对象的 y 坐标
	 * @param y
	 */
	posY( y:number ):void;
}

declare function is_bool( obj ):boolean;
declare function is_string( obj ):boolean;
declare function is_number( obj ):boolean;
declare function is_array( obj ):boolean;
declare function is_function( obj ):boolean;
declare function is_date( obj ):boolean;
declare function is_regexp( obj ):boolean;

/**
 * 测试对象是否是空字符、null、undefined 或者 {}
 * @param obj
 * @returns {boolean}
 */
declare function is_empty( obj ):boolean;

/**
 * 将毫秒转换成 “天 时:分:秒 毫秒”
 *
 * @param format 结果格式：d-天，h-时，i-分，s-秒，l-毫秒
 * @param ms 毫秒数
 * @returns string
 */
declare function ftime( format:string, ms:number ):string;