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

class SN_Image
{
	//--------------------------------------------------------------------------
	//
	//  Class constructor
	//
	//--------------------------------------------------------------------------

	public constructor( url:string = null )
	{
		var opts = {
			target: "#__SN_MODAL_IMAGE",
			title: "选择历史图片",
			size: "lg",
			css: "imglist",// 附加到 modal-body 的样式类，多个用空格隔开
			onComplete: this.completeHandler,
			onEnter: (body:JQuery)=>{this.enterHandler(body);}
		};
		if( is_empty( url ) ) opts[ "remote" ] = url;
		this.$modal = $.sn_modal( opts );
	}

	//--------------------------------------------------------------------------
	//
	//	Class properties
	//
	//--------------------------------------------------------------------------

	private _url:string;
	private $modal:SN_Modal;
	private _complete:Function;

	//--------------------------------------------------------------------------
	//
	//	Class methods
	//
	//--------------------------------------------------------------------------

	/**
	 * 设置加载远程地址内容
	 * @param url 返回图片列表的远程地址
	 */
	public setRemote( url:string )
	{
		if( is_empty( url ) ) return;
		this.$modal.setOptions( { remote: url } );
		this._url = url;
	}

	/**
	 * 设置需要在模块窗口显示的内容
	 * @param content
	 */
	public setContent( content:string )
	{
		if( is_empty( content ) ) return;
		this.$modal.setOptions( { content: content } );
	}

	/**
	 * 设置当点击确定按钮时的回调方法
	 * @param func
	 */
	public setComplete( func:Function )
	{
		if( is_function( func ) )this._complete = func;
	}

	public show()
	{
		this.$modal.show();
	}

	public close()
	{
		this.$modal.close();
	}

	public destroy()
	{
		this.$modal.destroy();
	}

	//--------------------------------------------------------------------------
	//
	//  Event handlers
	//
	//--------------------------------------------------------------------------

	private completeHandler( body:JQuery )
	{
		body.find( "li" ).each( ( index, el )=>
		{
			$( el ).click( function(){ $( el ).toggleClass( "selected" ); } );
		} );
	}

	private enterHandler( body:JQuery )
	{
		if( is_function( this._complete ) )this._complete( body.find( "li.selected" ) );
	}
}

interface JQueryStatic
{
	/**
	 * 直接通过指定的参数构造一个 SN_Image 实例
	 * @param url 图片列表内容页面地址
	 */
	sn_image( url?:string ):SN_Image;
}

(function( $ )
{
	$.sn_image = function( url:string = null )
	{
		return new SN_Image( url );
	};
})
( jQuery );