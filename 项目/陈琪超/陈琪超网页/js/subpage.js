/**
 * Created by Administrator on 2016/3/19 0019.
 */
var topic_clone;
var isShow=false;

$(document).ready(readyHandler);

function readyHandler()
{
    var t=$("#topic");
    topic_clone= t.clone();
    topic_clone.removeAttr("id");
    topic_clone.addClass("topic_clone");
    topic_clone.appendTo("body");
    topic_clone.hide();

    $(window).on("scroll",scrollHandler);
}
function scrollHandler(){
    var wTop=$(window).scrollTop();
    var dTop=$("#topic").scrollTop();

    if(wTop>=dTop&&!isShow)
    {
        isShow=true;
        //console.log(123);
        topic_clone.show();
    }
    else if (wTop<=dTop&&isShow)
    {
        isShow=false;
        //console.log(456);
        topic_clone.hide();
    }
}
