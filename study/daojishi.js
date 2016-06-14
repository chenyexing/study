
$(function(){
//	var time = 5;
//	var t;
//	function timeout(){
//		$("#num").value = time;
//		time = time - 1;
//		if(time < 0){
//			break;
//		}
//		t = setTimeout("timeout()",1000);
//	}
})
	
	var time = 5;
	var t;
	
	function timeout(){
	
		$("#num").val = time;
      	$("#num").val(time);
		console.log(time)
		
		time = time - 1;
		if(time < 0){
			alert("结束");
			return;
		}
		t = setTimeout("timeout()",1000);
		
}
