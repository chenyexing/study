// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module( 'starter', [ 'ionic' ] )

	.config(["$stateProvider",
		"$urlRouterProvider",
	function($stateProvider,$urlRouterProvider)
	{
		$stateProvider
			.state("home",{
				url:"/",
				templateUrl:"home.html",
				controller:"HomeCtrl"
	} )
			.state("sub",{
			url:"/sub",
			templateUrl:"sub.html",
			controller:"SubCtrl"
		});
		$urlRouterProvider.otherwise("/sub");
	}])
	.controller("HomeCtrl",["$scope",function($scope){}])
	.controller("SubCtrl",["$scope","$ionicPopup",function($scope,$ionicPopup)
	{
		//	判断对象是否存在
		if(navigator.geolocation)
		{
			var map = new BMap.Map('map');
			function showPosition( position )
			{
				var msg = "经度："+position.coords.longitude+","+
						  "纬度："+position.coords.latitude;
				//$ionicPopup.alert({title:"位置信息",template:msg})
				var point = new BMap.Point(
					position.coords.longitude,
					position.coords.latitude);
				map.centerAndZoom( point , 15 );
			}

			navigator.geolocation.watchPosition(
				showPosition,
				function(errInfo)
				{
					$ionicPopup.alert(errInfo.message);
					console.log(errInfo)

				}
				,{enableHighAccuracy:true})
		}else
		{
			console.log("该浏览器不支持获取地理位置")
		}
	}])


	.run( function( $ionicPlatform )
	{
		$ionicPlatform.ready( function()
		{
			if( window.cordova && window.cordova.plugins.Keyboard )
			{
				// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
				// for form inputs)
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar( true );

				// Don't remove this line unless you know what you are doing. It stops the viewport
				// from snapping when text inputs are focused. Ionic handles this internally for
				// a much nicer keyboard experience.
				cordova.plugins.Keyboard.disableScroll( true );
			}
			if( window.StatusBar )
			{
				StatusBar.styleDefault();
			}
		} );
	} )

	.controller("RefreshCtrl",["$scope","$http",function($scope,$http)
	{
		$scope.data = [1,2,3,4,5];
		$scope.doRefresh = function()
		{
			//通过异步的形式获取新数据，赋值给data来刷新视图
			$http.get("data.json" )
				.success(
				function(result)
				{
					$scope.data = result.data;
				}
			).finally(
					function()
					{
						$scope.$broadcast("scroll.refreshComplete")
					}
			);
		}
	}])

	.controller( "GoodCtrl", [ "$scope",
		"$ionicPopup",
		"$ionicActionSheet",
		function( $scope, $ionicPopup,$ionicActionSheet )
		{
			$scope.showDelete = false;
			$scope.showReorder = false;

			$scope.data = [
				{ label: "11", face: "01-zj.png", desc: "1" },
				{ label: "22", face: "02-bx.png", desc: "2" },
				{ label: "33", face: "03-gl.png", desc: "3" },
				{ label: "44", face: "04-bj.png", desc: "4" },
				{ label: "55", face: "05-wl.png", desc: "5" }
			];

			$scope.pullMenu = function()
			{
				$ionicActionSheet.show( {
					titleText: "标题",
					canceText: "取消",
					destructiveText: "danger",
					buttons: [
						{ text: "香蕉" },
						{ text: "牛奶" },
						{ text: "榴莲糖" }
					],
					canecl: function()
					{
						$scope.message( "what?你不要？" );
					},
					destructiveButtonClicked: function()
					{
						$scope.message( "大哥别浪费" );

						return false;
					},
					buttonClicked: function( index )
					{
						$scope.message( buttons[ index ].text );

						return false;
					}
				} )
			};

			$scope.message = function( content )
			{
				$ionicPopup.prompt(
					{
						title: "提示信息",
						template: "序号：",
						inputType: 'text',
						inputPlaceholder: 'content```'
					}
				).then( function( result )
				{
					console.log( result )
				});
			};

			$scope.onEdit = function( index )
			{
				$ionicPopup.prompt(
					{
						title: "提示信息",
						template: "序号：",
						inputType: 'text',
						inputPlaceholder: 'content```'
					}
				).then( function( result )
				{
					console.log( result );

					//如何拿到 与 index 对应的item的数据元素
					//即 $scope.data 数组的元素   trim(去除左右空格，返回新字符串)
					if( result.trim() != "" )
						$scope.data[ index ].desc = result;

					//设置新属性，视图会自动更新
				} )
			};

			$scope.toggleStatus = function()
			{
				$scope.showDelete = !$scope.showDelete;
				$scope.showReorder = false;
			};

			$scope.toggleOrder = function()
			{
				$scope.showReorder = !$scope.showReorder;
				$scope.showDelete = false;
			};

			$scope.onDelete = function( item )
			{
				var index = $scope.data.indexOf( item );
				$scope.data.splice( index, 1 )
			};

			$scope.onMoveItem = function( item, $fromIndex, $toIndex )
			{
				console.log( item, $fromIndex, $toIndex );
				//先从自身位置删除
				$scope.data.splice( $fromIndex - 1, 1 );

				//再添加目标位置
				$scope.data.splice( $toIndex - 1, 0, item );
			}

		} ] );
