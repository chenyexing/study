//------------------------------------------------------------------------------
//
// 自动撑高 TextArea
// class: sn_textarea_autoheight 
// author: 喵大斯( as3er.net )
// created: 2015/11/2
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------

class SN_TextArea_AutoHeight
{
	//--------------------------------------------------------------------------
	//
	//	Class methods
	//
	//--------------------------------------------------------------------------

	static TEXTAREA_COPY:JQuery;

	/**
	 * 从指定的父级容器中寻找 TextArea 对象进行自动高度支持设置
	 * @param pt
	 */
	static findAndSetTextArea( pt:JQuery ):void
	{
		pt.find( "textarea" ).each( function( index, el )
		{
			SN_TextArea_AutoHeight.autoHeight( $( el ) );
		} );
	}

	/**
	 * 将指定 TextArea 设置为可自动根据内容来适应调整高度
	 * @param textarea 目标 TextArea 对象
	 */
	static autoHeight( textarea:JQuery ):void
	{
		if( textarea.isNull() || textarea.tagName() != "textarea" )return;

		// 立即更新高度
		SN_TextArea_AutoHeight._setHeightByContent( textarea );

		// 添加事件监听
		textarea.bind( "keydown", { el: textarea }, function( e )
		{
			if( e.which == 13 )
				$( e.data.el ).height( $( e.data.el ).height() + parseInt( $( e.data.el ).css( "line-height" ) ) );
		} );
		textarea.bind( "keyup", SN_TextArea_AutoHeight._setHeightHandler );
		textarea.bind( "focusout", SN_TextArea_AutoHeight._setHeightHandler );
		$( window ).bind( "resize", { el: textarea }, SN_TextArea_AutoHeight._setHeightForResizeHandler );
	}

	static removeHeight( textarea:JQuery ):void
	{
		if( textarea.isNull() || textarea.tagName() != "textarea" )return;

		// 去除事件监听
		textarea.unbind( "keyup", SN_TextArea_AutoHeight._setHeightHandler );
		textarea.unbind( "focusout", SN_TextArea_AutoHeight._setHeightHandler );
		$( window ).unbind( "resize", SN_TextArea_AutoHeight._setHeightForResizeHandler );
	}

	static _setHeightByContent( textarea:JQuery ):void
	{
		SN_TextArea_AutoHeight.TEXTAREA_COPY = SN_TextArea_AutoHeight.TEXTAREA_COPY || $( "<textarea></textarea>" ).appendTo( "body" );

		var tac = SN_TextArea_AutoHeight.TEXTAREA_COPY;
		tac.css( {
			"position": "absolute",
			"left": "-9999px",
			"font-size": textarea.css( "font-size" ),
			"font-family": textarea.css( "font-family" ),
			"line-height": textarea.css( "line-height" ),
			"padding-top": textarea.css( "padding-top" ),
			"padding-bottom": textarea.css( "padding-bottom" ),
			"padding-left": textarea.css( "padding-left" ),
			"padding-right": textarea.css( "padding-right" )
		} );
		tac.attr( "rows", textarea.attr( "rows" ) );
		tac.outerWidth( textarea.outerWidth() );
		tac.val( textarea.val() );

		var max = parseInt( textarea.css( "max-height" ) );
		var sh = tac.prop( "scrollHeight" );

		if( $.browser.type == "ie" )
		{
			sh = textarea[ 0 ].scrollHeight;
			textarea.css( "overflow-y", sh > max ? "visible" : "hidden" );
			textarea[ 0 ].style[ "posHeight" ] = sh;
		}
		else
		{
			textarea.css( "overflow-y", sh > max ? "auto" : "hidden" );
			textarea.animate( { height: (sh > max ? max : sh ) }, 150 );
		}

	}

	//--------------------------------------------------------------------------
	//
	//  Event handlers
	//
	//--------------------------------------------------------------------------

	static _setHeightForResizeHandler( e ):void
	{
		SN_TextArea_AutoHeight._setHeightByContent( e.data.el );
	}

	static _setHeightHandler( e ):void
	{
		SN_TextArea_AutoHeight._setHeightByContent( $( this ) );
	}
}

interface JQueryStatic
{
	/**
	 * 从指定的父级容器中寻找 TextArea 对象进行自动高度支持设置
	 * @param pt 目标容器
	 */
	sn_textarea( pt:JQuery ):void;
}

interface JQuery
{
	/**
	 * 将指定 TextArea 设置为可自动根据内容来适应调整高度
	 * @param remove 是否移除支持自动高度的功能
	 */
	sn_textarea( remove?:boolean ):void;
}

(function( $ )
{
	$[ "sn_textarea" ] = function( pt?:JQuery )
	{
		pt = is_empty( pt ) || pt.isNull() ? $( "body" ) : pt;
		SN_TextArea_AutoHeight.findAndSetTextArea( pt );
	};
})
( jQuery );

jQuery.fn.extend( {
	sn_textarea: function( remove:boolean = false )
	{
		var regist = function( el )
		{
			if( el.tagName() != "textarea" ) return;
			el.css( "resize", "none" );// 禁止右下角拖动改变尺寸
			if( remove )SN_TextArea_AutoHeight.removeHeight( el );
			else SN_TextArea_AutoHeight.autoHeight( el );
		};

		if( $( this ).length > 1 )
		{
			$( this ).each( function( index, el )
			{
				regist( $( el ) );
			} );
		}
		else
		{
			regist( $( this ) );
		}
	}
} );