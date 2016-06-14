//------------------------------------------------------------------------------
//
// 倒计时插件
// class: sn_countdown 
// author: 喵大斯( as3er.net )
// created: 2015/11/2
// copyright (c) 2015 喵大斯( aosnow@yeah.net )
//
//------------------------------------------------------------------------------

///<reference path="../jquery/jquery.d.ts"/>
///<reference path="../jquery/jquery.ext.d.ts"/>

class SN_Countdown
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

	private _cache = {};

	// 倒计时工具是否正在运行
	private _started:boolean;

	//--------------------------------------------------------------------------
	//
	//	Class methods
	//
	//--------------------------------------------------------------------------

	/**
	 * 倒计时多少秒后，执行指定的方法
	 * @param taskid 任务名称（相同名称的倒计时任务将被覆盖）
	 * @param sec 倒计时完成时的总时间（单位：秒）
	 * @param completeHandler 完成时的回调（回调方法无参数）
	 * @param secondHandler 每秒触发的回调（回调方法需接收3个参数：function(剩余秒数，逝去秒数，总秒数)）
	 * @param once 是否在执行一次后，立即失效
	 */
	public countdown( taskid:string, sec:number, completeHandler:Function, secondHandler:Function = null, once:boolean = false )
	{
		if( !this._cache.hasOwnProperty( taskid ) )this._cache[ taskid ] = {
			taskid: "",
			sec: 0,
			past: 0,
			complete: null,
			second: null,
			once: false
		};

		this._cache[ taskid ].taskid = taskid;
		this._cache[ taskid ].sec = sec;
		this._cache[ taskid ].complete = completeHandler;
		this._cache[ taskid ].second = secondHandler;
		this._cache[ taskid ].once = once;

		this.start();
	}

	public start()
	{
		if( this._started )return false;
		this._started = true;
		this.doit();
	}

	public stop()
	{
		if( !this._started )return false;
		this._started = false;
	}

	//--------------------------------------------------------------------------
	//
	//  Event handlers
	//
	//--------------------------------------------------------------------------

	private doit()
	{
		// 已经停止不再继续执行
		if( !this._started )return false;

		// 执行数量，若没有需要倒计时的任务，则停止
		var count = 0;

		for( var id in this._cache )
		{
			var cd = this._cache[ id ];

			// 累加秒数时间
			cd.past++;

			// 回调
			if( is_function( cd.complete ) && cd.past > cd.sec )
			{
				cd.complete();

				if( cd.once )
				{
					delete this._cache[ id ];
				}
				else
				{
					cd.past = 0;
				}
			}
			else if( is_function( cd.second ) )
			{
				cd.second( cd.sec - cd.past, cd.past, cd.sec );
			}

			// 数量统计
			count++;
		}

		if( count == 0 )this.stop();

		// 每秒循环
		window.setTimeout( ()=>{this.doit();}, 1000 );
	}
}

interface JQueryStatic
{
	sn_cd:SN_Countdown;
}

(function( $ )
{
	$[ "sn_cd" ] = new SN_Countdown();
})
( jQuery );


