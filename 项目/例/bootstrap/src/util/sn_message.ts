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

class SN_Message
{
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

	private _options = {
		id: 'page_message',
		okClass: 'page_mess_ok',
		errClass: 'page_mess_error',
		animate: true,
		delay: 1500,

		// where should the modal be appended to (default to document.body).
		// Added for unit tests, not really needed in real life.
		appendTo: 'body'
	};

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
	public message( msg:string, type:number = 1 )
	{
		clearTimeout( this._timeid );

		var $selector = $( '#' + this._options.id );

		// 添加到页面
		if( $selector.isNull() )
		{
			$selector = $( '<div/>', { id: this._options.id } ).appendTo( this._options.appendTo );
		}

		// 是否支持背景动画
		if( this._options.animate )
		{
			$selector.addClass( 'page_mess_animate' );
		}
		else
		{
			$selector.removeClass( 'page_mess_animate' );
		}

		// 消息内容
		$selector.html( msg );

		// 样式类型
		if( type == 2 )
		{
			$selector.removeClass( this._options.okClass ).addClass( this._options.errClass );
		}
		else if( type == 1 )
		{
			$selector.removeClass( this._options.errClass ).addClass( this._options.okClass );
		}

		// 动画处理
		$selector.show();
		this._timeid = setTimeout( function()
		{
			$selector.slideUp( 150 );
		}, this._options.delay );
	}

	public msg( msg:string ){this.message( msg, 1 );}

	public err( msg:string ){this.message( msg, 2 );}

	//--------------------------------------------------------------------------
	//
	//  Event handlers
	//
	//--------------------------------------------------------------------------
}

interface JQueryStatic
{
	sn_message:SN_Message;
}

(function( $ )
{
	$[ "sn_message" ] = new SN_Message();
})
( jQuery );