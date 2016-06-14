//------------------------------------------------------------------------------
//
// 工作时间段选择器
// class: time_selecter 
// author: 喵大斯( as3er.net )
// created: 2015/10/28
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------

///<reference path="../jquery/jquery.d.ts"/>
///<reference path="../jquery/jquery.ext.d.ts"/>

/**
 * 工作时间段选择器
 * <p>
 * 作为目标对象的元素必须是支持 $(el).text() 或者 $(el).val() 的元素。
 * </p>
 */
class SN_TimeSelecter
{
	//--------------------------------------------------------------------------
	//
	// Class constants
	//
	//--------------------------------------------------------------------------

	static SELECTER_ID:string = "__SN_TIME_SELECTER";

	//--------------------------------------------------------------------------
	//
	//  Class constructor
	//
	//--------------------------------------------------------------------------

	/**
	 * 构建工作时间段选择器
	 */
	public constructor()
	{
	}

	//--------------------------------------------------------------------------
	//
	//	Class properties
	//
	//--------------------------------------------------------------------------

	private $target:JQuery;
	private $table:JQuery;

	// 当前时间段所针对的目标对象（由 this.show() 方法指定）
	private _curTarget:JQuery;

	//----------------------------------------
	// 时间段选择器上，一个小时均分成多少个单元格
	//----------------------------------------

	private _hour_split:number;

	//----------------------------------------
	// 开始时间的单元格
	//----------------------------------------

	private _startTimeEl:JQuery;

	//----------------------------------------
	// 结束时间的单元格
	//----------------------------------------

	private _stopTimeEl:JQuery;

	//----------------------------------------
	// 当选定时间段后的回调方法
	//----------------------------------------

	private _callback:Function;

	//--------------------------------------------------------------------------
	//
	//	Class methods
	//
	//--------------------------------------------------------------------------

	/**
	 * 初始化时间段范围
	 * @param start 起始时间，必须是 0-24 之间的整数，且小于 end 参数
	 * @param end 结束时间，必须是 0-24 之间的整数，且大于 start 参数
	 * @param hour_split 1小时分成多少份（参数允许的值：2,3,4,5,6）
	 * @param work_start 上班时间
	 * @param work_stop 下班时间
	 * @param rest_time 工作期间休息时间
	 */
	public init( start:number = 0,
				 end:number = 24,
				 hour_split:number = 6,
				 work_start:string = "9:30",
				 work_stop:string = "20:00",
				 rest_time:Array<string> = [ "12:00-13:00", "18:00-19:00" ] ):void
	{
		hour_split = hour_split < 2 || hour_split > 6 ? 6 : hour_split;
		this._hour_split = hour_split;

		// 参数检测
		if( start < 0 || end > 24 || start >= end )return;

		// 容器检测
		var $body:JQuery = $( "body" );
		this.$target = $body.find( "#" + SN_TimeSelecter.SELECTER_ID );

		if( this.$target.isNull() )
		{
			this.$target = $( "<div id='" + SN_TimeSelecter.SELECTER_ID + "'><table></table></div>" ).appendTo( $body );
			this.$target.click( function( e ){e.stopPropagation();} );
			$( document ).click( ()=>{this.hide();} );
		}
		this.$table = this.$target.find( ">table" );

		// 内容填充
		var head:string = ""; // 时间点头
		var th:string = "";
		var ts:string = "";

		// 上下班时间
		var wsa = work_start.split( ":" );
		var wea = work_stop.split( ":" );
		var wsh = parseInt( wsa[ 0 ] );
		var wsm = parseInt( wsa[ 1 ] );
		var weh = parseInt( wea[ 0 ] );
		var wem = parseInt( wea[ 1 ] );

		// 休息时间
		var wrs:any[] = [];
		for( var i = 0; i < rest_time.length; i++ )
		{
			var se = { start: [], end: [] };
			var cur = rest_time[ i ].split( "-" );// 值如：[12:00,13:00]
			var cur_sa = cur[ 0 ].split( ":" );// 值如：["12","00"]
			var cur_ea = cur[ 1 ].split( ":" );// 值如：["13","00"]

			se.start.push( parseInt( cur_sa[ 0 ] ), parseInt( cur_sa[ 1 ] ) );
			se.end.push( parseInt( cur_ea[ 0 ] ), parseInt( cur_ea[ 1 ] ) );
			wrs.push( se );
		}

		// 颜色区分
		var d:Date = new Date();
		var d1:Date = new Date();
		var d2:Date = new Date();

		for( var hour = start; hour < end; hour++ )
		{
			head += "<th colspan='" + hour_split + "' width='" + (hour_split * 10) + "'>" + hour + "点</th>";

			// 小时分成若干等份，以单元格表示
			for( var sec = 0; sec < 60; sec += 60 / hour_split )
			{
				d.setHours( hour, sec );

				var id:string = hour + ":" + ( sec == 0 ? "00" : sec );
				var bg:string = "normal";
				var times:number = d.getTime();

				// 工作时间性质区分
				//--------------------------------------------------
				// 上下班时间
				d1.setHours( wsh, wsm );
				d2.setHours( weh, wem );
				if( times >= d1.getTime() && times < d2.getTime() ) bg = "working";

				// 上班期间的休息时间
				for( var i = 0; i < wrs.length; i++ )
				{
					var rest = wrs[ i ];
					d1.setHours( rest.start[ 0 ], rest.start[ 1 ] );
					d2.setHours( rest.end[ 0 ], rest.end[ 1 ] );

					if( times >= d1.getTime() && times < d2.getTime() )
					{
						bg = "rest";
					}
				}

				// 时间点插槽头标识
				th += "<td id='h" + id + "' class='slot-head " + bg + "'></td>";

				// 时间点插槽
				ts += "<td id='t" + id + "' class='slot-time normal'></td>";
			}
		}

		this.$table.empty();
		this.$table.append( "<thead><tr>" + head + "</tr></thead>" );
		this.$table.append( "<tbody><tr>" + th + "</tr><tr>" + ts + "</tr></tbody>" );
		this.$table.find( "td[id^=t]" ).click( ( e )=>{this.slotClickHandler( e );} );

		// 为所有注册时间选择的对象添加弹出事件
		$( "[data-time-selecter]" ).each( ( index, el )=>
		{
			this.activate( $( el ) );
		} );
	}

	public activate( el:JQuery, event?:string, callback?:Function ):void
	{
		var evt:string = !is_empty( event ) ? event : el.attr( "data-time-selecter" );
		var func = is_function( callback ) ? callback : eval( el.attr( "data-time-callback" ) );

		// 回调方法
		if( is_function( func ) ) this._callback = func;

		// 若事件名为空，则终止操作
		if( is_empty( evt ) )return;

		$( el ).bind( evt, ( e )=>
		{
			e.stopPropagation();// 以免向上冒泡到 document 又隐藏选择器
			this.show( $( e.currentTarget ) );
		} );
	}

	/**
	 * 在时间段选择器显示之前，根据之前的选择设置已经选择的时间段
	 * @param target 目标对象（所选择的时间将以文本内容的形式填充到目标对象）
	 */
	public setSelected( target:JQuery )
	{
		var start = $( target ).data( "start" );
		var stop = $( target ).data( "stop" );

		if( is_string( start ) && is_string( stop ) )
		{
			this._startTimeEl = this.$table.find( "td[id='t" + start + "']" );

			// 结束时间要减去1个单位时间
			this._stopTimeEl = this.$table.find( "td[id='t" + stop + "']" ).prev();
		}
		else
		{
			this._startTimeEl = start;
			this._stopTimeEl = stop;
		}
		this.updateSelectedStyle();
	}

	/**
	 * 将时间段选择器显示在指定对象下方
	 * @param target 目标对象（所选择的时间将以文本内容的形式填充到目标对象）
	 */
	public show( target:JQuery )
	{
		this._curTarget = target;
		this.setSelected( target );

		var d = $( "#" + SN_TimeSelecter.SELECTER_ID );
		var pos = target.offset();
		var top = pos.top + target.outerHeight() + 2;

		d.hide();
		d.css( { left: pos.left + 5, top: top + 5 } );
		d.animate( { top: top, opacity: 'show' }, 150 );
	}

	public hide()
	{
		this.$target.hide();
	}

	/**
	 * 根据当前选定的时间单元，来处理选择器的外观表现
	 * @param td 目标操作的对应单元格
	 */
	private updateSelectedStyle( td?:JQuery )
	{
		if( is_empty( this._startTimeEl ) && is_empty( this._stopTimeEl ) )
		{
			// 还原背景色
			this.$table.find( "td[id^=t]" ).each( function()
			{
				$( this ).removeClass( "working" ).addClass( "normal" );
			} );
		}
		else
		{
			// 设置时间段之间单元格的背景色
			var si = -1;
			var ei = -1;

			if( !is_empty( this._startTimeEl ) )
			{
				si = this._startTimeEl.index();
				if( !is_empty( td ) && !td.isNull() ) td.removeClass( "normal" ).addClass( "working" );
			}

			if( !is_empty( this._stopTimeEl ) )
			{
				ei = this._stopTimeEl.index();
				if( !is_empty( td ) && !td.isNull() ) td.removeClass( "normal" ).addClass( "working" );
			}
			else
			{
				// 当重新选择开始点后，要将上次选择的区间全部去除选定状态
				this.$table.find( "td[id^=t]" ).each( ( index, el )=>
				{
					if( !is_empty( this._startTimeEl ) && this._startTimeEl.index() != index )
					{
						$( el ).removeClass( "working" ).addClass( "normal" );
					}
				} );
			}

			if( !is_empty( this._startTimeEl ) && !is_empty( this._stopTimeEl ) )
				this.$table.find( "td[id^=t]" ).each( function( index, el )
				{
					$( el ).removeClass( "normal" );
					$( el ).removeClass( "working" );

					if( index >= si && index <= ei )
					{
						$( el ).addClass( "working" );
					}
					else
					{
						$( el ).addClass( "normal" );
					}
				} );
		}
	}

	/**
	 * 根据选定的时间单元，更新显示时间段到表格中
	 */
	private updateSelectedText()
	{
		if( !is_empty( this._startTimeEl ) && !is_empty( this._stopTimeEl ) )
		{
			var sa:Array<string> = this._startTimeEl.attr( "id" ).substr( 1 ).split( ":" );
			var ea:Array<string> = this._stopTimeEl.attr( "id" ).substr( 1 ).split( ":" );

			var st = "";
			var et = "";

			var ds = new Date();
			var de = new Date();

			ds.setHours( parseInt( sa[ 0 ] ), parseInt( sa[ 1 ] ) );
			de.setHours( parseInt( ea[ 0 ] ), parseInt( ea[ 1 ] ) + 60 / this._hour_split );

			st = ds.getHours() + ":" + ( ds.getMinutes() == 0 ? "00" : ds.getMinutes() );
			et = de.getHours() + ":" + ( de.getMinutes() == 0 ? "00" : de.getMinutes() );

			if( is_function( this._callback ) )this._callback( this._curTarget, st, et, ds.getHours(), ds.getMinutes(), de.getHours(), de.getMinutes() );
		}
		else
		{
			if( is_function( this._callback ) )this._callback( this._curTarget, null );
		}
	}

	//--------------------------------------------------------------------------
	//
	//  Event handlers
	//
	//--------------------------------------------------------------------------

	private slotClickHandler( e ):void
	{
		var td = $( e.currentTarget );// 时间选择器上单击的单元格

		if( is_empty( this._startTimeEl ) )
		{
			// 未选择时设定起始时间点
			this._startTimeEl = td;
		}
		else if( !is_empty( this._startTimeEl ) && !is_empty( this._stopTimeEl ) )
		{
			// 已选择起始、结束时间点，则重新设定起始点，并置空结束点
			// 相当于重新的选择了开始点，得继续选择结束点
			this._startTimeEl = td;
			this._stopTimeEl = null;
		}
		else
		{
			if( td.index() < this._startTimeEl.index() )
			{
				this._stopTimeEl = this._startTimeEl;
				this._startTimeEl = td;
			}
			else
			{
				this._stopTimeEl = td;
			}
		}

		// 更新选中时间段表现
		this.updateSelectedStyle( td );
		this.updateSelectedText();

		// 数据缓存
		$( this._curTarget ).data( "start", this._startTimeEl );
		$( this._curTarget ).data( "stop", this._stopTimeEl );
	}
}

interface JQueryStatic
{
	// 若需要在目标对象上弹出时间段选择器，需要为其添加 <code>data-time-selecter="事件名"</code> 属性，当触发该对象的指定事件时将弹出选择器
	// 并且作为目标对象的元素必须是支持 <code>$(el).text()</code> 或者 <code>$(el).val()</code> 的元素。
	// 该功能是设计用来选择工作时间段的，用于工作报告、工作日志等系统中。
	sn_times:SN_TimeSelecter;
}

interface JQuery
{
	/**
	 * 激活指定对象支持弹出时间段选择器工具
	 * @param evt 当触发该对象的指定事件时弹出选择器
	 * @param callback 选择时间后的回调方法
	 */
	sn_times( evt?:string, callback?:Function ):void;
}

(function( $ )
{
	$[ "sn_times" ] = new SN_TimeSelecter();
})
( jQuery );

jQuery.fn.extend( {
	sn_times: function( evt?:string, callback?:Function )
	{
		$[ "sn_times" ].activate( $( this ), evt, callback );
	}
} );