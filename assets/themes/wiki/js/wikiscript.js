$(document).ready(function(){
    //建立目录框架
    var menu = $('<div class="ad_menu"><div class="ad_menu_title" title="点击展开/收起">目录</div><ul class="ad_menu_ul"></ul></div>');
    var start = '<ul>';
    var end = '</ul>';
    //插入到DOM树中
    $(".content").prepend(menu);
    var flag=false;
    //获取数据
    $(":header").each(function(){
	if ( $(this).is('h1')){
		if(flag==true){
			$('.ad_menu_ul').append(end)
		}
		flag=false;
		var str='<li><a href="#'+$(this).attr('id')+'">'+$(this).text()+'</a></li>';
		$('.ad_menu_ul').append(str);
	}
	if ( $(this).is('h2')){
		if(flag==false){
			flag=true;
			$('.ad_menu_ul').append(start)
		}
		var str='<li><a href="#'+$(this).attr('id')+'">'+$(this).text()+'</a></li>';
		$('.ad_menu ul').last().append(str)
	}
      })
    $(".ad_menu").delay(500)
    $(".ad_menu").fadeTo(500,"0.25")
    $(".ad_menu").hover(function(){
		$(this).stop().fadeTo(300,"0.9");
	},function(){
		$(this).stop().fadeTo(300,"0.25");
	})
    $(".ad_menu_title").click(function(){
		$('.ad_menu_ul').slideToggle("300");
	})
    x = $(".ad_menu").html();
});

