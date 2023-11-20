
// https://stackoverflow.com/a/17546215
function escapeHTML(html) {
    return document.createElement('div').appendChild(document.createTextNode(html)).parentNode.innerHTML;
}

function stageDisplay(stage, show = true){
	if(show && !document.getElementById(stage).classList.contains("show")){
		document.getElementById(stage).classList.add("show");
	}else if(!show && document.getElementById(stage).classList.contains("show")){
		document.getElementById(stage).classList.remove("show");
	}
	return show;
}
