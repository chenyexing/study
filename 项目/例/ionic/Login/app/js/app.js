/**
 * Created by Administrator on 2016/4/21.
 */


var app = angular.module('loginApp',["ngRoute"]);

//这个方法用来在应用程序运行之前设置一些配置信息
app.config(function($routeProvider)
{
	$routeProvider
	//括号里面是写要传入的参数
		.when("/",{
			templateUrl:"main/_main.html",
			controller:"MainCtrl"
		})
		.when("/login",{
			templateUrl:"login/_login.html",
			controller:"LoginCtrl"
		})
		.otherwise({  //除了上面链接的其他情况 都跳转到这个链接
			redirectTo:"/"
		});
});


