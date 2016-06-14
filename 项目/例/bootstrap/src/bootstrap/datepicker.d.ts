//------------------------------------------------------------------------------
//
// 日期选择器定义文件
// author: 喵大斯( as3er.net )
// created: 2015/12/18
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------

/**
 * 重新刷新页面中的日期控件绑定
 */
declare function update_dater();

/**
 * 绑定单个 input 对象作为日期选择器
 * @param target input 的 JQuery 实例
 * @param format 日期格式，如：Y-m-d
 * @param func 选定日期时的回调方法
 */
declare function ipt_dater_init( target:JQuery, format:string, func:Function );