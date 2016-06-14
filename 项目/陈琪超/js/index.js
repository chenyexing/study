/**
 * Created by Administrator on 2016/3/10 0010.
 */
$(document).ready(readyHandler);
function readyHandler(){
    $("a").attr("target","_blank");
    //$(".menu").mouseup($(".menu_1").slideToggle())

    $("p").mouseup(function(){
        $(".menu_1").slideToggle();
    });
    $("body")
}

