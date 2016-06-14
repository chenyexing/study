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

class SN_Keys
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

	private _keyCache = {};
	private _keyHandlerAdded:boolean;

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
	public keyup( key:{keyCode:number,ctrl?:boolean,alt?:boolean,shift?:boolean}, callback:Function, once:boolean = false )
	{
		var hash:string = this._getHashName( key.keyCode, key.ctrl, key.alt, key.shift );

		if( !this._keyHandlerAdded )
		{
			this._keyHandlerAdded = true;
			$( "body" ).keyup( ( e )=>{this.keyupHandler( e );} );
		}

		this._keyCache[ hash ] = { key: key, callback: callback, once: once };
	}

	private _getHashName( keyCode:number, ctrl?:boolean, alt?:boolean, shift?:boolean ):string
	{
		var hash:string = "__KH_";
		if( ctrl === true )hash += "c";
		if( alt === true )hash += "a";
		if( shift === true )hash += "s";
		hash += keyCode;

		return hash;
	}

	//--------------------------------------------------------------------------
	//
	//  Event handlers
	//
	//--------------------------------------------------------------------------

	private keyupHandler( e )
	{
		var hash:string = this._getHashName( e.which, e.ctrlKey, e.altKey, e.shiftKey );

		if( this._keyCache.hasOwnProperty( hash ) )
		{
			var k = this._keyCache[ hash ];

			// 快捷键比较
			if( k.key.keyCode == e.which )
			{
				// 控制组合键检测
				if( k.key.ctrl && !e.ctrlKey || k.key.alt && !e.altKey || k.key.shift && !e.shiftKey )
				{
					e.preventDefault();
					return false;
				}

				// 执行回调
				if( is_function( k.callback ) )
					k.callback();

				// 删除单次快捷键注册数据
				if( k.once )delete this._keyCache[ hash ];
			}
		}
	}
}

interface JQueryStatic
{
	sn_keys:SN_Keys;
}

(function( $ )
{
	$[ "sn_keys" ] = new SN_Keys();
})
( jQuery );