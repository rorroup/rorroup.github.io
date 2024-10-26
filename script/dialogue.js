
/* References
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield*
*/


var npc_active = false;

function npc_end(){
	document.getElementById("dialogue").style.display = "none";
	document.getElementById("dialogue_name").replaceChildren();
	document.getElementById("dialogue_text").replaceChildren();
	document.getElementById("dialogue_prompt").replaceChildren();
	document.getElementById("dialogue_button").style.visibility = "hidden";
	document.getElementById("npc").style.display = "none";
	npc_active = false;
	document.getElementById("MANAGER").style.display = "none";
	return false;
}

function npc_run(){
	let npc_iterator = npc_active.next();
	if(npc_iterator.done == true){
		npc_end();
	}
	return npc_iterator.value;
}

document.getElementById("dialogue_button").addEventListener("click", function(event_){
	npc_run();
});

function dialogueButtonText(text_ = "Next"){
	document.getElementById("dialogue_button").textContent = text_;
	document.getElementById("dialogue_button").style.visibility = "visible";
}

function* writeDialogue(text_, button_ = "Next"){
	document.getElementById("dialogue").style.display = "block";
	if(text_ != false){
		document.getElementById("dialogue_text").innerHTML = text_;
	}
	if(button_ == false){
		document.getElementById("dialogue_button").style.visibility = "hidden";
	}else{
		dialogueButtonText(button_);
	}
	yield text_;
	return text_;
}

function* setTalker(talker){
	// document.getElementById("dialogue").style.display = "block";
	document.getElementById("dialogue_name").innerHTML = talker;
	return talker;
}

function* setChoices(options){
	document.getElementById("dialogue_button").style.visibility = "hidden";
	let choices = [];
	let selected = -1;
	for(let i = 0; i < options.length; i++){
		let choice = document.createElement("div");
		choice.innerHTML = options[i];
		choice.classList.add("dialogue_choice");
		choice.addEventListener("click", function(event_){
			selected = i;
			npc_run();
		});
		choices.push(choice);
	}
	document.getElementById("dialogue_prompt").replaceChildren(...choices);
	yield selected;
	document.getElementById("dialogue_prompt").replaceChildren();
	return selected;
}

function* setInput(attributes_ = {type: "text", placeholder: "Write your answer"}, buttonText = "Submit"){
	document.getElementById("dialogue_button").style.visibility = "hidden";
	let response = "";
	let input_prompt = document.createElement("div");
	input_prompt.id = "dialogue_input";
	let input = document.createElement("input");
	for(const [key, value] of Object.entries(attributes_)){
		input.setAttribute(key, value);
	}
	if(input.type == "text"){
		input.addEventListener("keyup", function(event_){
			if(event_.key === "Enter"){
				response = input.value;
				npc_run();
			}
		});
	}
	let button_ = document.createElement("button");
	button_.textContent = buttonText;
	button_.addEventListener("click", function(event_){
		response = input.value;
		npc_run();
	});
	input_prompt.replaceChildren(input, button_);
	document.getElementById("dialogue_prompt").replaceChildren(input_prompt);
	input.focus();
	yield response;
	document.getElementById("dialogue_prompt").replaceChildren();
	return response;
}

// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Tips
function* animateNPC(animation){
	let npc = document.getElementById("npc");
	let npc_eyes = npc.lastElementChild.firstElementChild;
	let npc_eyeL = npc_eyes.children[0];
	let npc_eyeR = npc_eyes.children[1];
	let npc_mouth = npc.lastElementChild.lastElementChild;
	switch(animation){
		case "idle":
			npc_mouth.className = "";
			npc_eyeL.className = "";
			npc_eyeR.className = "";
			requestAnimationFrame((time) => {
				requestAnimationFrame((time) => {
					npc_eyeL.className = "eyes_blink";
					npc_eyeR.className = "eyes_blink";
					npc_mouth.className = "mouth_idle";
				});
			});
			break;
		case "talk":
			npc_mouth.className = "";
			npc_eyeL.className = "";
			npc_eyeR.className = "";
			requestAnimationFrame((time) => {
				requestAnimationFrame((time) => {
					npc_eyeL.className = "eyes_blink";
					npc_eyeR.className = "eyes_blink";
					npc_mouth.className = "mouth_talk";
				});
			});
			break;
		case "wink":
			npc_mouth.className = "";
			npc_eyeL.className = "";
			npc_eyeR.className = "";
			requestAnimationFrame((time) => {
				requestAnimationFrame((time) => {
					npc_eyeR.className = "eyes_blink";
					npc_mouth.className = "mouth_smile";
				});
			});
			break;
		case "surprise":
			npc_mouth.className = "";
			npc_eyeL.className = "";
			npc_eyeR.className = "";
			requestAnimationFrame((time) => {
				requestAnimationFrame((time) => {
					npc_eyeL.className = "eyes_surprise";
					npc_eyeR.className = "eyes_surprise";
					npc_mouth.className = "mouth_surprise";
				});
			});
			break;
		case "happy":
			npc_eyeL.className = "";
			npc_eyeR.className = "";
			npc_mouth.className = "";
			requestAnimationFrame((time) => {
				requestAnimationFrame((time) => {
					npc_eyeL.className = "eyes_happy";
					npc_eyeR.className = "eyes_happy";
					npc_mouth.className = "mouth_smile";
				});
			});
			break;
		case "angry":
			npc_eyeL.className = "";
			npc_eyeR.className = "";
			npc_mouth.className = "";
			requestAnimationFrame((time) => {
				requestAnimationFrame((time) => {
					npc_eyeL.className = "eyes_angryL";
					npc_eyeR.className = "eyes_angryR";
					npc_mouth.className = "mouth_angry";
				});
			});
			break;
		default:
			break;
	}
	document.getElementById("npc").style.display = "block";
	return animation;
}


var introduced = false;
var playerName = false;

function* npc_information(){
	if(introduced){ yield* setTalker(`<h2>Penicilina</h2>`); }
	yield* animateNPC("talk");
	yield* writeDialogue(`<p>Welcome visitor.<br/>It is my pleasure to have you here today.<br/>May you find something of your interest during your stay.</p>`);
	let topic = -1;
	while(topic != 2){
		if(introduced){ yield* setTalker(`<h2>Penicilina</h2>`); }
		yield* animateNPC("talk");
		yield* writeDialogue(`<p>Is there something you would like to know?</p>`);
		yield* animateNPC("idle");
		topic = yield* setChoices([
			`<p>Who are you?</p>`,
			`<p>What is this place?</p>`,
			`<p>Nothing, thanks.</p>`,
		]);
		switch(topic){
			case 0:
				if(playerName == false){
					yield* animateNPC("talk");
					yield* writeDialogue(`<p>It is common courtesy to state your name before asking for someone else's.</p>`);
					while(true){
						yield* animateNPC("talk");
						yield* writeDialogue(`<p>Go ahead. I grant you permission to speak your name.</p>`);
						yield* animateNPC("idle");
						playerName = yield* setInput({type: "text", placeholder: "Enter your name", maxlength: 128}, "Confirm");
						if(playerName.includes('<') || playerName.includes('>') || playerName.includes('&')){
							yield* animateNPC("happy");
							yield* writeDialogue(`<p>Of course...<br/>So it is '${escapeHTML(playerName)}' right?</p>`);
							yield* animateNPC("angry");
							yield* writeDialogue(`<h1>You think I'm stupid?!</h1>`);
							yield* writeDialogue(`<h1>Get out!</h1>`);
							location.reload();
							return;
						}else if(playerName == ""){
							yield* animateNPC("talk");
							yield* writeDialogue(`<p>Don't be shy.</p>`);
						}else if(playerName.length > 32){
							yield* animateNPC("talk");
							yield* writeDialogue(`<p>${escapeHTML(playerName)}.<br/>I see...</p>`);
							yield* animateNPC("talk");
							playerName = "Larry";
							yield* writeDialogue(`<p>It is a good name. I think it is long to the point it becomes unmanageable though.<br/>So I think I'll just call you ${playerName} for the time being.</p>`);
							break;
						}else if(playerName.length == 1){
							yield* animateNPC("talk");
							yield* writeDialogue(`<p>${escapeHTML(playerName)}.<br/>It's a bit short, but what do I even know right?</p>`);
							break;
						}else if(playerName.toLowerCase() == "penicilina"){
							yield* animateNPC("surprise");
							yield* writeDialogue(`<p>Your name is</p><h1>${escapeHTML(playerName)}</h1><p>???</p>`);
							yield* animateNPC("happy");
							yield* writeDialogue(`<p>Heh.<br/>Nice try.<br/>But I'm the one and only Penicilina so you simply can not be Penicilina.<br/>You better pick another name.</p>`);
						}else{
							yield* animateNPC("talk");
							yield* writeDialogue(`<p>${escapeHTML(playerName)}.<br/>That's a good name.</p>`);
							break;
						}
					}
				}
				yield* animateNPC("talk");
				yield* writeDialogue(`<p>My name is Rodrigo Urrutia. I am <b>almost</b> an electrical Engineer, and <b>kind of</b> a self taught programmer.<br/>Penicilina is the nick I would use on the internet, for playing video games for example. You can think of it as my
				<span class="dropdown_container">
					<i class="dropdown_trigger">chuunibyou</i>
					<span class="dropdown_content">
						<span>
							Chūnibyō is a Japanese colloquial term typically used to describe early teens who have grandiose delusions, who desperately want to stand out, and who have convinced themselves that they have hidden knowledge or secret powers.<br/> Source: <a href="https://en.wikipedia.org/wiki/Ch%C5%ABniby%C5%8D" target="_blank">Wikipedia</a>
						</span>
					</span>
				</span>
				name if you want.</p>`);
				introduced = true;
				yield* setTalker(`<h2>Penicilina</h2>`);
				yield* animateNPC("talk");
				yield* writeDialogue(`<p>You can find my complete build, or as you may call it: my <i>resume</i>, on that incredible statistics poster on the wall ahead this hallway.<br/>That one was written in HTML and is native to this page, but you can find the link to its original pdf version inside it, alongside some other personal links. You can change its language inside it as well.</p>`);
				break;
			case 1:
				yield* animateNPC("talk");
				yield* writeDialogue(`<p>Glad you asked. This is my personal web page.</p>`);
				yield* animateNPC("talk");
				yield* writeDialogue(`<p>I learned basic Python on my first year at University, but I didn't really think much of programming at the time. I found it confusing and kind of pointless.</p>`);
				yield* animateNPC("talk");
				yield* writeDialogue(`<p>Then, one day I watched a Python programming tutorial out of pure boredom, but that time I actually understood its power as a tool for solving actual problems.<br/>That really picked up my interest and made me wonder about the possibilities.</p>`);
				yield* animateNPC("talk");
				yield* writeDialogue(`<p>I dove right down the snake hole, where the more I would learn the more interesting scripts I would be able to write, but also the harder problems I would encounter, forcing me to go deeper every time. I began to have quite a bit of fun and programming quickly became my hobby. Until I inevitably reached the Python performance wall.</p>`);
				yield* animateNPC("talk");
				yield* writeDialogue(`<p>I decided to learn a new faster language. And from that point onwards for me it was either learning more programming or learning a programming language that can do other things.<br/>Though in the end I came to the realization that in all this time I had mostly been programming simple things, like scripts for simple file organization for my friends or myself, or just plain test scripts.<br/>So I decided to code something a little bit more real, something I could show to people.</p>`);
				yield* animateNPC("talk");
				yield* writeDialogue(`<p>That is what this page is, written completely by my hand, a simple program with a basic interface and some information. Being so simple it doesn't use frameworks, external dependencies nor third party libraries because that is the way I learned to program in the first place after all.<br/>Though that means there isn't any art, because despite me being a man of many talents, artistic endeavor is not one of them, so everything had to be built using basic geometric primitives, namely rectangles and circles. To be expected coming from someone who studied electrical engineering anyways. It was either that or exposing you to infamous
				<span class="dropdown_container">
					<i class="dropdown_trigger">programmer art</i>
					<span class="dropdown_content">
						<span>
							Programmer art refers to temporary assets added by the programmer to test functionality.<br/> Source: <a href="https://en.wikipedia.org/wiki/Programmer_art" target="_blank">Wikipedia</a>
						</span>
					</span>
				</span>
				.</p>`);
				break;
			case 2:
				break;
			default:
				yield* animateNPC("angry");
				yield* writeDialogue(`<p>This is not a valid option.<br/>I don't even know how you got here.<br/>You would do me a favor if you could tell me about it.</p>`, "Exit");
				return;
		}
	}
	if(introduced){ yield* setTalker(`<h2>Penicilina</h2>`); }
	yield* animateNPC("talk");
	yield* writeDialogue(`<p>Come back to me if you need something else.</p>`, "Close");
}
