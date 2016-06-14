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

class SN_Submit
{
	//--------------------------------------------------------------------------
	//
	// Class constants
	//
	//--------------------------------------------------------------------------

	static OK:string = "alert-success";
	static ERR:string = "alert-danger";
	static INFO:string = "alert-info";

	//--------------------------------------------------------------------------
	//
	//  Class constructor
	//
	//--------------------------------------------------------------------------

	public constructor()
	{
	}

	//--------------------------------------------------------------------------
	//
	//	Class properties
	//
	//--------------------------------------------------------------------------

	private _timeid:number;

	// 默认设置
	private _options:any = {
		context: null,
		type: "POST",
		dataType: "text",
		timeout: 2000,// 2秒
		cache: false,
		url: null,
		data: null
	};

	public options( value:any )
	{
		$.extend( this._options, value );
	}

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
	private message( msg:string, type?:string )
	{
		var $backdrop:JQuery = $( 'div[data-id="__submit_backdrop"]' );

		if( $backdrop.isNull() )
		{
			$backdrop = $( '<div data-id="__submit_backdrop" class="modal-backdrop fade"/>' ).appendTo( "body" );
		}
		$backdrop[ 0 ].offsetWidth;

		var $pad:JQuery = $( '#__FORM_NOTE_CONTENT' );
		if( $pad.isNull() )
		{
			$pad = $( '<div id="__FORM_NOTE_CONTENT" class="modal fade"><div class="alert text-center" role="alert" style="margin:20% 10% auto 10%;"></div></div>' ).appendTo( "body" );
		}

		// 消息样式处理
		var $alert = $pad.find( ".alert" );
		$alert.html( msg.toString() );
		$alert.removeClass( "alert-info" );
		$alert.removeClass( "alert-success" );
		$alert.removeClass( "alert-danger" );
		$alert.addClass( type );

		// 显示消息
		$backdrop.addClass( 'in' );
		$pad.show().addClass( "in" );
		$pad.dblclick( this.close );

		// 自动延迟关闭
		var delay:number = type == SN_Submit.ERR ? 2000 : 100;
		clearTimeout( this._timeid );
		this._timeid = setTimeout( this.close, delay );
	}

	private close()
	{
		var $backdrop:JQuery = $( 'div[data-id="__submit_backdrop"]' );
		var $pad:JQuery = $( '#__FORM_NOTE_CONTENT' );

		$backdrop.fadeOut( 150, function(){$( this ).remove();} );
		$pad.fadeOut( 150, function(){$( this ).remove();} );
		clearTimeout( this._timeid );
	}

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
	public submit( url:string,
				   data?:any,
				   callback?:Function,
				   type:string = "post",
				   dataType:string = "json",
				   message:string = "正在提交命令请求..." )
	{
		// 默认设置
		this._options.context = this;// 供 complete 回调使用
		this._options.url = url;
		this._options.data = data;

		// 发送请求的类型
		type = type.toUpperCase();
		if( "GET;POST".indexOf( type ) != -1 )
			this._options.type = type;

		// 返回结果的类型（默认为 text）
		if( "json;xml;html;text".indexOf( dataType ) != -1 )
			this._options.dataType = dataType;

		// 成功时的回调方法
		if( $.isFunction( callback ) )
			this._options.success = callback;

		// 发生错误时的回调
		this._options.error = this.__errorHandler;

		// 其它扩展回调
		//sets.beforeSend = this.__beforeSendHandler;
		//sets.dataFilter = this.__dataFilterHandler;

		// 返回成功后，关闭遮罩
		this._options.complete = this.__completeHandler;

		// 发送请求
		this.message( message, SN_Submit.INFO );
		$.ajax( this._options );
	}

	public get( url:any, data?:any, callback?:Function, dataType:string = "json" )
	{
		if( is_string( url ) )
		{
			this.submit( url, data, callback, "get", dataType );
		}
		else
		{
			this.submit( url.url, data, callback, "get", dataType, url.message );
		}
	}

	public post( url:any, data?:any, callback?:Function, dataType:string = "json" )
	{
		if( is_string( url ) )
		{
			this.submit( url, data, callback, "post", dataType );
		}
		else
		{
			this.submit( url.url, data, callback, "post", dataType, url.message );
		}
	}

	//--------------------------------------------------------------------------
	//
	//  Event handlers
	//
	//--------------------------------------------------------------------------

	// beforeSend 在发送请求之前调用，并且传入一个XMLHttpRequest作为参数
	private __beforeSendHandler( http )
	{
		// 发送请求前可修改 XMLHttpRequest 对象的函数，如添加自定义 HTTP 头。XMLHttpRequest 对象是唯一的参数。
		// 这是一个 Ajax 事件。如果返回false可以取消本次ajax请求
		return true;
	}

	// 在请求出错时调用。传入XMLHttpRequest对象，描述错误类型的字符串以及一个异常对象（如果有的话）
	private __errorHandler( http, status )
	{
		// (默认: 自动判断 (xml 或 html)) 请求失败时调用此函数。
		// 有以下三个参数：XMLHttpRequest 对象、错误信息、（可选）捕获的异常对象。
		// 如果发生了错误，错误信息（第二个参数）除了得到null之外，还可能是"timeout", "error", "notmodified" 和 "parsererror"。
		var msg = "";

		switch( status )
		{
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
		this.message( "<b>错误：</b>" + msg, SN_Submit.ERR );
	}

	// 在请求成功之后调用。传入返回的数据以及"dataType"参数的值。并且必须返回新的数据（可能是处理过的）传递给success回调函数
	private __dataFilterHandler( data, type )
	{
		// 给Ajax返回的原始数据的进行预处理的函数。
		// 提供data和type两个参数：data是Ajax返回的原始数据，type是调用jQuery.ajax时提供的dataType参数。
		// 函数返回的值将由jQuery进一步处理
		return data;
	}

	// 当请求完成之后调用这个函数，无论成功或失败。传入XMLHttpRequest对象，以及一个包含成功或错误代码的字符串
	private __completeHandler( http, status )
	{
		// 请求完成后回调函数 (请求成功或失败之后均调用)。参数： XMLHttpRequest 对象和一个描述成功请求类型的字符串
		if( status == "success" )
		{
			// 请求成功后，立即关闭
			//this.message( "successed...", SN_Submit.OK );
			this.close();
		}
	}
}

interface JQueryStatic
{
	sn_submit:SN_Submit;
}

(function( $ )
{
	$[ "sn_submit" ] = new SN_Submit();
})
( jQuery );