<?php
// define('TEST', 'World');
// $constant = 'constant';
// echo "Hello {$constant('TEST')}"

// $test1 = 1;
// $test1 === 3 && $test1 = 2;
// $url = 'http://www.baidu.com';
// //Header("HTTP/1.1 301 Moved Permanently"); 
// Header("Location: $url"); 
//header("content-type:utf-8");

?>
<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="initial-scale=1.0, width=device-width, height=device-height, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<title>Document</title>
	<script src="http://apps.bdimg.com/libs/jquery/2.1.1/jquery.min.js"></script>
</head>
<style>
.box{
	width:150px;
	height:150px;
	border:1px solid #ccc;
	border-radius:4px;
	background:#eee;
}
.test{
	position:relative;
	top:200px;
	left:250px;
	width:200px;
	background:#ccc;
	padding:0px;
	border:1px solid #666;
}
.test_item{
	height:30px;
	list-style:none;
	line-height:30px;
	padding:0 0 0 10px;
	cursor:pointer;
	cursor:url(wait_i.cur)
}
.test_item:hover{
	background:green;
	margin:0px;
	
}
</style>
<body>
<div class="box">
回收站
</div>
<ul class="test">
	<li class="test_item">拖动测试1</li>
	<li class="test_item">拖动测试2</li>
	<li class="test_item">拖动测试3</li>
	<li class="test_item">拖动测试4</li>
	<li class="test_item">拖动测试5</li>
	<li class="test_item">拖动测试6</li>
	<li class="test_item">拖动测试7</li>
	<li class="test_item">拖动测试8</li>
	<li class="test_item">拖动测试9</li>
	<li class="test_item">拖动测试10</li>
	<li class="test_item">拖动测试11</li>
	<li class="test_item">拖动测试12</li>
	<li class="test_item">拖动测试13</li>
	<li class="test_item">拖动测试14</li>
	<li class="test_item">拖动测试15</li>	
</ul>
<script>
$(document).mousedown(function(eDown){
	eDown.preventDefault();
	var target = eDown.target;
	if ($(target).hasClass('test_item')){
		 $(target).addClass('moveselect_item')
		 $('ul').addClass('moveselect')
	}
}).mousemove(function(eMove){
	if ($('.test').hasClass('moveselect')) {
	    $('body,html').css({
	        'cursor' : 'url(./wait_i.cur),move'
		})
		return;
	}
}).mouseup(function(eUp){
	if ($(eUp.target).hasClass('box')) {
	    $('.box').append('<span>'+$('.test .moveselect_item').text()+'</span>');
	}
	$('.test .moveselect_item').removeClass('moveselect_item');
    $('.test').removeClass('moveselect');
	$('body,html').css({
	    'cursor' :　'default'
	})
})
</script>
</body>
</html>

