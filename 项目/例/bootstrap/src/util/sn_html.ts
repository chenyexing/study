//------------------------------------------------------------------------------
//
// HTML 内容处理辅助
// class: sn_html 
// author: 喵大斯( as3er.net )
// created: 2015/12/28
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------

class SN_Html
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

	private _filter_url:string;

	//--------------------------------------------------------------------------
	//
	//	Class methods
	//
	//--------------------------------------------------------------------------

	public set_filter_url( url:string )
	{
		this._filter_url = url;
	}

	public filter( content:string, callback?:Function )
	{
		if( is_empty( this._filter_url ) || is_empty( content ) )
		{
			if( is_function( callback ) ) callback( content );
			return content;
		}

		$.post( this._filter_url, { content: content }, function( data )
		{
			if( is_function( callback ) ) callback( data );
			return data;
		}, "html" );

		return null;
	}

	//--------------------------------------------------------------------------
	//
	//  Event handlers
	//
	//--------------------------------------------------------------------------
}

interface JQueryStatic
{
	sn_html:SN_Html;
}

(function( $ )
{
	$[ "sn_html" ] = new SN_Html();
})
( jQuery );