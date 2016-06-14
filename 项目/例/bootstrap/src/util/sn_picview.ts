//------------------------------------------------------------------------------
//
// ...
// class: sn_picview 
// author: 喵大斯( as3er.net )
// created: 2015/11/17
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------

///<reference path="../jquery/jquery.d.ts"/>
///<reference path="../jquery/jquery.ext.d.ts"/>
///<reference path="../bootstrap/bootstrap.d.ts"/>
///<reference path="sn_modal.ts"/>

class SN_Picview
{
	//--------------------------------------------------------------------------
	//
	//  Class constructor
	//
	//--------------------------------------------------------------------------

	/*

	 1、设计图片控制工具栏
	 2、如何关闭全屏查看图片工具


	 */

	public constructor()
	{
		var opts = {
			html: `
			<div class="modal fade" id="__SN_PICVIEWER">
			<div class="modal-body inner"></div>
			<div class="modal-ctrl btn-group btn-group-lg">
				<!--<button type="button" class="btn btn-primary" data-action="pre">-->
					<!--<span class="glyphicon glyphicon-chevron-left"></span> 上一张-->
				<!--</button>-->
				<button type="button" class="btn btn-default" data-action="view">
					<span class="glyphicon glyphicon-download-alt"></span> 查看原始图片
				</button>
				<button type="button" class="btn btn-default" data-action="close">
					<span class="glyphicon glyphicon-remove"></span> 关闭
				</button>
				<!--<button type="button" class="btn btn-primary" data-action="next">-->
					<!--下一张 <span class="glyphicon glyphicon-chevron-right"></span>-->
				<!--</button>-->
			</div>
			</div>
			`,
			onComplete: ( body:JQuery )=>{this.completeHandler( body );},
			onShow: ( body:JQuery )=>
			{
				// 只有在显示后才能获取 Div 控制栏的尺寸大小，进行定位
				var img:JQuery = body.find( "img" );
				var ctrl:JQuery = body.next( ".modal-ctrl" );

				this.resize( img );
				this.relocate( img, ctrl );
			}
		};
		this.$modal = $.sn_modal( opts );
	}

	//--------------------------------------------------------------------------
	//
	//	Class properties
	//
	//--------------------------------------------------------------------------

	private $modal:SN_Modal;

	//--------------------------------------------------------------------------
	//
	//	Class methods
	//
	//--------------------------------------------------------------------------

	/**
	 * 全屏查看图片
	 * @param url
	 * @param width
	 * @param height
	 */
	public view( url:string, width:number, height:number )
	{
		var html:string = `
		<a href="${url}" target="_blank">
		<img src="${url}" data-param="${width},${height}" style="display:none;">
		</a>
		`;

		this.$modal.setOptions( { content: html } );
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

	public view_img( img:JQuery )
	{
		img.parent().get( 0 ).click();
	}

	public resize( img:JQuery )
	{
		var data = img.attr( "data-param" ).split( "," );
		var iw:number = parseInt( data[ 0 ] );
		var ih:number = parseInt( data[ 1 ] );

		var win:JQuery = $( window );
		var ww:number = win.width() * 0.8 >> 0;
		var wh:number = win.height() * 0.85 - 50 >> 0;

		if( iw > ww )
		{
			ih = ww / iw * ih >> 0;
			iw = ww;
		}

		if( ih > wh )
		{
			iw = wh / ih * iw >> 0;
			ih = wh;
		}

		img.width( iw );
		img.height( ih );
	}

	public relocate( img:JQuery, ctrl:JQuery )
	{
		var iw:number = img.width();
		var ih:number = img.height();
		var win:JQuery = $( window );

		var tx:number = win.width() - iw >> 1;
		var ty:number = (win.height() - ih >> 1) * 0.8 >> 0;

		img.css( "position", "fixed" );
		img.pos( tx, ty );
		img.fadeIn( 200 );

		tx = win.width() - ctrl[ 0 ].offsetWidth >> 1;
		ty = win.height() - ctrl[ 0 ].offsetHeight - 50;

		ctrl.css( "position", "fixed" );
		ctrl.pos( tx, ty );
		ctrl.fadeIn( 200 );
	}

	//--------------------------------------------------------------------------
	//
	//  Event handlers
	//
	//--------------------------------------------------------------------------

	// 内容加载完成时的处理逻辑
	private completeHandler( body:JQuery )
	{
		var img:JQuery = body.find( "img" );
		var ctrl:JQuery = body.next( ".modal-ctrl" );

		$( window ).off( "resize" ).on( "resize", { img: img, ctrl: ctrl }, ( e )=>
		{
			this.resize( e.data.img );
			this.relocate( e.data.img, e.data.ctrl );
		} );

		// 按钮功能
		//var btnPre:JQuery = ctrl.find( "[data-action='pre']" );
		var btnView:JQuery = ctrl.find( "[data-action='view']" );
		var btnClose:JQuery = ctrl.find( "[data-action='close']" );
		//var btnNext:JQuery = ctrl.find( "[data-action='next']" );

		btnView.off( "click" ).on( "click", ( e )=>{this.view_img( img );} );
		btnClose.off( "click" ).on( "click", ()=>{this.close();} );
	}
}

interface JQueryStatic
{
	/**
	 * 直接打开图片全屏预览查看工具
	 */
	sn_picview:SN_Picview;
}

(function( $ )
{
	$.sn_picview = new SN_Picview();
})
( jQuery );