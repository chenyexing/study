//------------------------------------------------------------------------------
//
// ...
// class: sn_modal 
// author: 喵大斯( as3er.net )
// created: 2015/11/9
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------

///<reference path="../jquery/jquery.d.ts"/>
///<reference path="../jquery/jquery.ext.d.ts"/>

class SN_Modal
{
	//--------------------------------------------------------------------------
	//
	//  Class constructor
	//
	//--------------------------------------------------------------------------

	public constructor( options:any )
	{
		this.options = $.extend( {}, this.defaults, options );
		this.$modal = $( this.options.target ).attr( 'class', 'modal fade' ).hide();
	}

	//--------------------------------------------------------------------------
	//
	//	Class properties
	//
	//--------------------------------------------------------------------------

	// 当前模块的 JQuery 引用
	private $modal:JQuery;

	private _moveable:boolean;

	// 默认配置
	private defaults = {
		title: "",				// 模态窗口的标题栏内容
		target: "#__SN_MODAL",	// 已存在的模态窗口的 ID，若未创建将会自动创建
		html: "",				// 创建 Modal 的模板HTML内容
		content: "",			// 模态窗口的静态内容
		appendTo: "body",		// 默认情况下，模态窗口和遮罩背景的HTML被附加到body元素。使用此选项可将它们附加到其他元素中。
		cache: false,			// 对于静态不需要改变的远程加载页面，可以缓存此结果，以便下次重复利用不再重新请求
		keyboard: false,		// 按下 ESC 关闭模态窗口
		nobackdrop: false,		// 是否不显示遮罩背景：true-隐藏，false-显示（默认）
		force: true,			// 每次打开窗口时，是否强制还原窗口到正常大小，而不是保持上次遗留的最大化状态
		size: "md",				// 模态窗口的尺寸大小：lg、md、sm
		enter: "",				// 确定按钮的标签
		cancel: "",				// 取消按钮的标签
		icon: ""				// 标题栏的前置图标：使用 glyphicon 样式名来指定图标，如 glyphicon glyphicon-ok-circle，取后图标具体样式 glyphicon-ok-circle
	};

	//----------------------------------------
	// 当前配置参数集合
	//----------------------------------------

	// 当前配置
	private options:any;

	public setOptions( options:any )
	{
		this.options = $.extend( {}, this.options, options );
	}

	//----------------------------------------
	// 是否处于最大化状态
	//----------------------------------------

	/**
	 * 当前是否处于最大化状态
	 * @returns {boolean}
	 */
	public getMaximumState():boolean
	{
		return $( window ).width() == this.$modal.find( ".modal-content" ).outerWidth();
	}

	//--------------------------------------------------------------------------
	//
	//	Class methods
	//
	//--------------------------------------------------------------------------

	public show()
	{
		var $backdrop:JQuery;

		// nobackdrop 为 false 时搜索或创建遮罩背景
		if( !this.options.nobackdrop )
		{
			$backdrop = $( '.modal-backdrop' );

			if( $backdrop.isNull() )
			{
				$backdrop = $( '<div class="modal-backdrop fade" />' ).appendTo( this.options.appendTo );
			}
			$backdrop[ 0 ].offsetWidth; // force reflow
		}

		// 若构造方法未成功创建创建模态窗口主体
		if( this.$modal.isNull() )
		{
			var html:string = `
			<div class="modal fade" id="${this.options.target.substr( 1 )}">
				<div class="modal-content modal-dialog">
					<div class="modal-header">
						<a class="close glyphicon glyphicon-remove" title="关闭" href="#" data-dismiss="modal"></a>
						<a class="close glyphicon glyphicon-unchecked" title="最大化/还原" href="#" data-maximum="modal"></a>
						<h4 class="text-danger" style="padding:0;margin:0;">
							<span class="glyphicon glyphicon-ok-circle"></span>
							<span class="title"></span>
						</h4>
					</div>
					<div class="modal-body inner" style="word-break:break-all;word-wrap:break-word;"></div>
					<div class="modal-footer">
						<button type="button" class="btn btn-primary" data-action="ok">
							<span class="glyphicon glyphicon-ok"></span>
							<span>确定</span>
						</button>
						<button type="button" class="btn btn-default" data-dismiss="modal">
							<span class="glyphicon glyphicon-remove"></span>
							<span>取消</span>
						</button>
					</div>
				</div>
			</div>`;
			this.$modal = $( is_empty( this.options.html ) ? html : this.options.html ).appendTo( this.options.appendTo ).hide();
		}

		// 边框
		this.$modal.find( ".modal-dialog" ).css( "border", "6px solid rgba(255,255,255,0.5)" );

		// 标题栏
		this.$modal.find( ".modal-header > :header > .title" ).html( is_empty( this.options.title ) ? "窗口标题" : this.options.title );

		// 按钮标签
		this.$modal.find( ".btn[data-action='ok'] span:last-child" ).html( is_empty( this.options.enter ) ? "确定" : this.options.enter );
		this.$modal.find( ".btn[data-dismiss='modal'] span:last-child" ).html( is_empty( this.options.cancel ) ? "取消" : this.options.cancel );

		// 其它参数处理
		if( !is_empty( this.options.css ) )
		{
			this.$modal.find( ".inner" ).addClass( this.options.css );
		}

		if( !is_empty( this.options.size ) )
		{
			var dialog = this.$modal.find( ".modal-dialog" );
			dialog.removeClass( "modal-lg modal-md modal-sm" );
			dialog.addClass( "modal-" + this.options.size );
		}

		// 按 ESC 快捷键关闭功能
		if( is_bool( this.options.keyboard ) ) this.escape();

		// 显示遮罩背景
		if( !this.options.nobackdrop )$backdrop.addClass( "in" );

		// 注册关闭事件
		this.$modal.off( "enter.sn_modal" ).on( "enter.sn_modal", ()=>
		{
			// 点确定的回调方法
			if( is_function( this.options.onEnter ) )this.options.onEnter( this.$modal.find( ".inner" ) );
			this.close();
		} );
		this.$modal.off( "close.sn_modal" ).on( "close.sn_modal", ()=>
		{
			// 关闭之前的回调方法
			if( is_function( this.options.onClose ) )this.options.onClose( this.$modal.find( ".inner" ) );
			this.close();
		} );
		this.$modal.off( "maximum.sn_modal" ).on( "maximum.sn_modal", ()=>{ this.maximumHandler(); } );
		$( window ).resize( ()=>
		{
			if( this.getMaximumState() ) this.maximum();
			else this.restore();
		} );

		// 窗口内容
		if( !is_empty( this.options.remote ) && this.options.remote !== "#" )
		{
			this.$modal.find( '.inner' ).load( this.options.remote, ( content )=>
			{
				if( is_function( this.options.onComplete ) )this.options.onComplete( this.$modal.find( ".inner" ) );

				if( this.options.cache )
				{
					this.options.content = content;
					delete this.options.remote;
				}
			} );
		}
		else
		{
			this.$modal.find( ".inner" ).html( this.options.content );
			if( is_function( this.options.onComplete ) )this.options.onComplete( this.$modal.find( ".inner" ) );
		}

		// 窗口内容相关事件
		this.$modal.on( "click.sn_modal", '[data-dismiss="modal"]', ( e )=>
		{
			e.preventDefault();
			this.$modal.trigger( "close" );
		} );
		this.$modal.on( "click.sn_modal", '[data-maximum="modal"]', ( e )=>
		{
			e.preventDefault();
			this.$modal.trigger( "maximum" );
		} );
		this.$modal.on( "click.sn_modal", '[data-action="ok"]', ( e )=>
		{
			e.preventDefault();
			this.$modal.trigger( "enter" );
		} );

		this.$modal.find( ".modal-header" ).mousedown( ( e )=>{this._mouseDownHandler( e );} );
		this.$modal.find( ".modal-header" ).mouseup( ( e )=>{this._mouseUpHandler( e );} );
		this.$modal.find( ".modal-header" ).css( "cursor", "move" );

		// 显示窗口
		this.$modal.show().addClass( 'in' );
		if( is_function( this.options.onShow ) )this.options.onShow( this.$modal.find( ".inner" ) );

		// 限制窗口内容最大高度（显示后才能正确获取高度值）
		this._limitHeight();

		// 打开窗口时，强制还原窗口
		if( this.options.force ) this.restore();

		return this;
	}

	public close()
	{
		this.$modal.off( "maximum.sn_modal" );
		this.$modal.off( "enter.sn_modal" );
		this.$modal.off( "close.sn_modal" );
		this.$modal.off( "click.sn_modal" );
		this.$modal.hide().find( '.inner' ).html( "" );

		if( !is_empty( this.options.size ) ) this.$modal.find( ".modal-dialog" ).removeClass( "modal-" + this.options.size );

		$( document ).off( "keyup.sn_modal" );
		$( '.modal-backdrop' ).remove();

		return this;
	}

	// 最大化
	public maximum()
	{
		var content = this.$modal.find( ".modal-content" );
		var body = this.$modal.find( ".modal-body" );
		var borderWidth = parseInt( content.css( "border-width" ) );
		var winHeight = $( window ).height();
		var winWidth = $( window ).width();
		var headHeight = this.$modal.find( ".modal-header" ).outerHeight();
		var footHeight = this.$modal.find( ".modal-footer" ).outerHeight();

		content.css( "left", 0 );
		content.css( "top", 0 );
		content.outerWidth( winWidth );
		content.removeClass( "modal-dialog" );

		body.css( "max-height", "" );
		body.outerWidth( winWidth - borderWidth * 2 );
		body.outerHeight( winHeight - borderWidth * 2 - headHeight - footHeight );
	}

	// 还原大小
	public restore()
	{
		var content = this.$modal.find( ".modal-content" );
		var body = this.$modal.find( ".modal-body" );
		var borderWidth = parseInt( content.css( "border-width" ) );
		var winWidth = $( window ).width();
		var winHeight = $( window ).height();
		var headHeight = this.$modal.find( ".modal-header" ).outerHeight();
		var footHeight = this.$modal.find( ".modal-footer" ).outerHeight();

		content.css( "left", "" );
		content.css( "top", "" );
		content.width( "" );
		content.height( "" );
		content.addClass( "modal-dialog" );

		// 设置 modal-dialog 样式后才会有正确的 margin-top 值
		var marginTop = parseInt( content.css( "margin-top" ) );

		body.css( "max-height", ( winHeight - marginTop * 2 - headHeight - footHeight ) + "px" );
		body.css( "overflow-y", "auto" );
		body.width( "100%" );
		body.outerWidth( this.$modal.find( ".modal-header" ).outerWidth() );

		var curHeight = winHeight - borderWidth * 2 - marginTop * 2 - headHeight - footHeight;
		body.outerHeight( is_number( this.options.height ) && this.options.height > 0 ? this.options.height : curHeight );
	}

	public destroy()
	{
		this.$modal.remove();
		$( document ).off( "keyup.sn_modal" );
		$( '.modal-backdrop' ).remove();
		this.$modal = null;
		if( !is_empty( this.options.self ) )this.options.self.removeData( "sn_modal" );

		return this;
	}

	public escape()
	{
		$( document ).on( "keyup.sn_modal", ( e )=>
		{
			if( e.which == 27 ) this.close();
		} );
	}

	private _limitHeight()
	{
		var content = this.$modal.find( ".modal-content" );
		var body = this.$modal.find( ".modal-body" );
		var winHeight = $( window ).height();
		var marginTop = parseInt( content.css( "margin-top" ) );
		var headHeight = this.$modal.find( ".modal-header" ).outerHeight();
		var footHeight = this.$modal.find( ".modal-footer" ).outerHeight();

		body.css( "max-height", ( winHeight - marginTop * 2 - headHeight - footHeight) + "px" );
		body.css( "overflow-y", "auto" );
	}

	//--------------------------------------------------------------------------
	//
	//  Event handlers
	//
	//--------------------------------------------------------------------------

	private maximumHandler()
	{
		if( !this.getMaximumState() ) this.maximum();
		else this.restore();
	}

	private _mouseDownHandler( e )
	{
		// 最大化时不需要移动窗口
		if( this.getMaximumState() ) return;

		this._moveable = true;

		// 鼠标相对于当前窗口的位置
		var target = this.$modal.find( ".modal-content" );
		var pos = target.position();
		var offsetX = e.pageX - pos.left;
		var offsetY = e.pageY - pos.top;

		$( document ).bind( "mousemove", {
			ox: offsetX,
			oy: offsetY
		}, ( e )=>
		{
			if( this._moveable )
			{
				target.css( "left", e.pageX - e.data.ox );
				target.css( "top", e.pageY - e.data.oy );
			}
		} );
	}

	private _mouseUpHandler( e )
	{
		this._moveable = false;
		$( document ).unbind( "mousemove" );
	}
}

interface JQueryStatic
{
	/**
	 * 直接通过指定的参数构造一个 SN_Modal 实例
	 * @param options 参数配置
	 */
	sn_modal( options:any ):SN_Modal;
}

interface JQuery
{
	/**
	 * 显示指定的模块
	 * <p>通过 selector 访问 SN_Modal 模块，其对象实例会缓存在该 selector 的 data 属性集合中 key 为 sn_modal 的值。</p>
	 * @param options 参数配置
	 */
	sn_modal( options:any ):JQuery;
}

(function( $ )
{
	$[ "sn_modal" ] = function( options:any )
	{
		return new SN_Modal( options );
	};

	$.fn[ "sn_modal" ] = function( options:any )
	{
		return this.each( function()
		{
			var $this = $( this );
			var modal = $this.data( "sn_modal" );

			if( is_empty( modal ) )
			{
				var data = $this.data();
				var opts = $.extend( {}, options, data );

				opts.self = $this;

				if( $this.attr( 'href' ) !== '' && $this.attr( 'href' ) != '#' )
				{
					opts.remote = $this.attr( 'href' );
				}
				modal = new SN_Modal( opts );
				$this.data( "sn_modal", modal );
			}
			modal.show();
		} );
	};

	$( document ).on( "click.sn_modal", "[data-trigger='modal']", function()
	{
		$( this ).sn_modal();
		if( $( this ).is( 'a' ) ) return false;
	} );
})
( jQuery );
