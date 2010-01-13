function InitConsoleSample(){
	$("#testCustomSelector").click(function(){
		var selector = $("#selector").val();
		var $selection = $(selector);
		if ($selection.length)
			$selection.Console();
		else
			$("<div>'" + selector + "' selector did not match any elements..</div>").dialog({ 
				modal :true,
				buttons : {
				'OK': function(){
					$(this).dialog('destroy').remove();
					}}
				});
	});
	$("#testCustomData").click(function(){
		$.Console.Info('message',['dsad','dasdas'],{orJSON:'312'});
	});
}