/**
 * Created by Administrator on 2016/3/10 0010.
 */
$(document).ready(readyHandler);
function readyHandler(){
    //$("a").attr("target","_blank");
    //$(".menu").mouseup($(".menu_1").slideToggle())

    $("p").mouseup(function(){
        $(".menu_1").slideToggle();
    });

    $(".top_right").find(".sign").on("click",signHandler);

    function signHandler()
    {

        var sign;
        sign = new SignBox();

        function SignBox(){
            var self = this;
            var html = "";  //下面的html 就是这行的html
            html+="<form>";
            html+="<div id=\"sign_in\">";
            html+="<div id=\"sign\">";
            html+="<input class=\"username\" type=\"text\" placeholder=\"USER NAME\" maxlength=\"15px\">";
            html+="<input class=\"password\" type=\"password\" placeholder=\"PASSWORD\" maxlength=\"15px\">";
            html+="<input class=\"submit\" type=\"submit\" value=\"SIGN IN\">";
            html+="</div>";
            html+="<div class=\"word\">";
            html+="<span class=\"word_1\"><a href=\"#\">SIGN UP</a></span>";
            html+="<span class=\"word_2\"><a href=\"#\">FOTGOT PASSWORD?</a></span>";
            html+="</div>";
            html+="</div>";
            html+="</form>";
            var _target=$(html); //把html给_target
            _target.appendTo("body");
            //console.log(_target.html());

            var _mask = $( "<div class='sign_mask'></div>" );

            var _handler;

            this.show=function()
            {
                _handler=handleer;

                this.mask(true);

                $(window).on("resize",this.resizeHandler);

                _target.find(".word_1").on("click",this.enterHandler);
            };

            //this.clone=function()
            //{
            //    _target.remove();
            //    this.mask(false);
            //    _target.find(".submit").off("click");
            //};

            this.mask=function(show)
            {
                if (show)
                {
                    $("body").append(_mask);
                    //console.log(_mask);

                    var w=$(window).width();
                    var h=$(window).height();

                    _mask.width(w);
                    _mask.height(h);
                }
                else
                {
                    _mask.remove();
                }
            };

            this.resizeHandler=function()
            {
                var w=$(window).width();
                var h=$(window).height();

                _mask.width(w);
                _mask.height(h);
            };

            this.enterHandler=function()
            {
                if($.isFunction(_handler))_handler();
                self.close();
            }
        }

    }
}

