var pressed={};
var lifted={};

$(document).on("keydown", function(e){
	e = e || window.event;
	pressed[e.keyCode] = true;
	lifted[e.keyCode] = false;	
	check();
});

$(document).on("keyup", function(e){
	e = e || window.event;
	lifted[e.keyCode] = true;
	pressed[e.keyCode] = false;
});

function check() {
	if (pressed[17] == true && lifted[17] == false && pressed[82] == true) {
		alert("Are you sure you want to leave this page?");
	}
}