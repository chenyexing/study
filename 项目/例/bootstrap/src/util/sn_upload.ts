//------------------------------------------------------------------------------
//
// 上传文件客户端模块
// class: sn_upload 
// author: 喵大斯( as3er.net )
// created: 2015/11/5
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------

class SN_Upload
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

	private _callback:Function;

	//----------------------------------------
	// html frame
	//----------------------------------------

	static HTML:string = `
	<div class='modal fade'>
		<div class="modal-dialog modal-md">
			<div class="inner text-center">
			</div>
		</div>
	</div>
	`;

	//----------------------------------------
	// options
	//----------------------------------------

	// 默认设置
	private _options:any = {
		id: "__SN_UPLOADER",
		swf: "",
		url: "",
		vars: ""
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

	private _getSWF( swf:string, vars:string = "" ):string
	{
		if( $.browser.type == "ie" )
		{
			return `<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" name="__SWF" id="__SWF" width="510" height="410">
						<param name="movie" value="${swf}" />
						<param name="quality" value="high" />
						<param name="allowScriptAccess" value="always" />
						<param name="allowFullScreen" value="true" />
						<param name="allowNetworking" value="all" />
						<param name="wmode" value="transparent">
						<param name="flashVars" value="${vars}">
					</object>`;
		}
		else
		{
			return `<embed src="${swf}"
					name="__SWF_EMBED"
					id="__SWF_EMBED"
					quality="high"
					wmode="transparent"
					allowScriptAccess="always"
					allowNetworking="all"
					pluginspage="http://www.macromedia.com/go/getflashplayer"
					type="application/x-shockwave-flash"
					flashVars="${vars}">
					</embed>`;
		}
	}

	/**
	 * 弹出上传控件，以上传新的文件
	 * @param options 上传参数
	 * @param callback 上传成功的后的回调方法
	 */
	public upload( options?:any, callback?:Function )
	{
		if( is_function( callback ) ) this._callback = callback;
		if( !is_empty( options ) ) this.options( options );

		var $backdrop:JQuery = $( '.modal-backdrop' );
		if( $backdrop.isNull() ) $backdrop = $( '<div class="modal-backdrop fade"/>' ).appendTo( "body" );
		$backdrop[ 0 ].offsetWidth;

		var $pad = $( '#' + this._options.id );
		if( $pad.isNull() )
		{
			$pad = $( SN_Upload.HTML ).appendTo( "body" );
			$pad.attr( "id", this._options.id );
		}

		// 插入SWF模块
		$pad.find( ".inner" ).html( this._getSWF( this._options.swf, this._options.vars ) );

		var $swf = $.browser.type == "ie" ? $( "#__SWF" ) : $( "#__SWF_EMBED" );

		$swf.css( "min-width", 500 );
		$swf.width( "100%" );
		$swf.height( 420 );

		$backdrop.addClass( 'in' );
		$pad.show().addClass( 'in' );
	}

	/**
	 * 关闭上传窗口
	 */
	public close()
	{
		$( '.modal-backdrop' ).remove();
		$( '#' + this._options.id ).hide().removeClass( 'in' );
	}

	/**
	 * 上传完成时的回调方法
	 */
	public complete( value )
	{
		if( is_function( this._callback ) ) this._callback( value );
	}

	//--------------------------------------------------------------------------
	//
	//  Event handlers
	//
	//--------------------------------------------------------------------------
}

interface JQueryStatic
{
	sn_upload:SN_Upload;
}

(function( $ )
{
	$[ "sn_upload" ] = new SN_Upload();
})
( jQuery );