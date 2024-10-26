
var RESUME_DATA = {};
var RESUME_SELECTED = "";

/* References
* https://youtu.be/tc8DU14qX6I  // 1.1: fetch() - Working With Data & APIs in JavaScript
*/
async function resume_loadResumeData(language){
	if(!(language in RESUME_DATA)){
		const response = await fetch("asset/resumedata_" + language + ".json");
		const data = await response.json();
		RESUME_DATA[language] = data;
	}
	return;
}

function resume_loadResume(language_index = 1){
	const languages = [
		"spanish",
		"english",
	];
	resume_loadResumeData(languages[language_index]).then(() => {
		resume_buildResume(languages[language_index]);
	}).catch(error => {
		console.error(error);
		let title = document.createElement("h1");
		title.appendChild(document.createTextNode("Error"));
		let description = document.createElement("p");
		description.appendChild(document.createTextNode("Unable to write resume."));
		document.getElementById("resume_resume").replaceChildren(
			title,
			description,
		);
	});
}

resume_loadResume();

function resume_buildRightContent(data){
	let content = [];
	for(let i = 0; i < data.length; i++){
		let item_ = document.createElement("div");
		if("person" in data[i]){
			let person = document.createElement("p");
			person.appendChild(document.createTextNode(data[i]["person"]));
			item_.appendChild(person);
		}
		if("date" in data[i]){
			let date = document.createElement("p");
			date.appendChild(document.createTextNode(data[i]["date"]));
			date.classList.add("resume_rightItemDate");
			item_.appendChild(date);
		}
		if(("job" in data[i]) || ("institution" in data[i])){
			let p = document.createElement("p");
			if("job" in data[i]){
				let job = document.createElement("b");
				job.appendChild(document.createTextNode(data[i]["job"]));
				p.appendChild(job);
				p.appendChild(document.createTextNode(" "));
			}
			if("institution" in data[i]){
				let institution = document.createElement("i");
				institution.appendChild(document.createTextNode(data[i]["institution"]));
				p.appendChild(institution);
			}
			item_.appendChild(p);
		}
		if("detail" in data[i]){
			let detail = document.createElement("p");
			for(let j = 0; j < data[i]["detail"].length; j++){
				detail.appendChild(document.createTextNode(data[i]["detail"][j]));
				detail.appendChild(document.createElement("br"));
			}
			detail.classList.add("resume_rightItemContent");
			item_.appendChild(detail);
		}
		item_.classList.add("resume_rightItem");
		content.push(item_);
	}
	return content;
}

function resume_buildRightText(data){
	let content = document.createElement("p");
	for(let i = 0; i < data.length; i++){
		content.appendChild(document.createTextNode(data[i]));
		content.appendChild(document.createElement("br"));
	}
	content.classList.add("resume_rightItem");
	return [content];
}

function resume_buildSkillTable(data){
	let table = document.createElement("table");
	let tbody = document.createElement("tbody");
	for(let i = 0; i < data.length; i++){
		let table_row = document.createElement("tr");
		for(let j = 0; j < data[i].length; j++){
			let table_data = document.createElement("td");
			table_data.innerHTML = isNaN(data[i][j]) ? data[i][j] : (Array(data[i][j] + 1).join("&#x25CF;") + Array(5 - data[i][j] + 1).join("&#x25CB;"));
			table_row.appendChild(table_data);
		}
		tbody.appendChild(table_row);
	}
	table.appendChild(tbody);
	table.classList.add("resume_leftContent");
	return [table];
}

function resume_buildInformation(data){
	const category = {
		"direction": "fa-solid fa-house-chimney",
		"age": "fa-solid fa-hourglass-half",
		"civil": "&#9901;",
		"nationality": "fa-solid fa-flag",
		"phone": "fa-solid fa-phone",
		"email": "fa-solid fa-envelope",
	}
	let d = document.createElement("div");
	for(let i = 0; i < data.length; i++){
		let p = document.createElement("p");
		if(data[i][0].toLowerCase() == "civil"){
			let icon = document.createElement("span");
			icon.innerHTML = category[data[i][0].toLowerCase()];
			icon.id = "icon_marriage";
			p.appendChild(icon);
			p.appendChild(document.createTextNode(" " + data[i][1]));
		}else{
			let icon = document.createElement("i");
			icon.className = category[data[i][0].toLowerCase()];
			p.appendChild(icon);
			p.appendChild(document.createTextNode(" " + data[i][1]));
		}
		d.appendChild(p);
	}
	d.classList.add("resume_leftContent");
	return [d];
}

function resume_buildLinks(data){
	const page = {
		"portfolio": ["fa-solid fa-code", "#"],
		"resume": ["fa-solid fa-file-pdf", "https://www.overleaf.com/read/zsdkjnhtqrsn#83a76a"],
		"github": ["fa-brands fa-github", "https://github.com/rorroup"],
		"linkedin": ["fa-brands fa-linkedin", "https://www.linkedin.com/in/rodrigo-urrutia-pozo/"],
		"whatsapp": ["fa-brands fa-whatsapp", "https://wa.me/56978700660"],
		// "discord": ["fa-brands fa-discord", "#"],
		// "youtube": ["fa-brands fa-youtube", "#"],
		// "twitch": ["fa-brands fa-twitch", "#"],
		// "facebook": ["fa-brands fa-facebook", "#"],
		// "twitter": ["fa-brands fa-twitter", "#"],
		// "instagram": ["fa-brands fa-instagram", "#"],
		"onlyfans": ["", "#what_did_you_expect"],
	}
	let d = document.createElement("div");
	for(let i = 0; i < data.length; i++){
		let a = document.createElement("a");
		let icon = document.createElement("i");
		icon.className = page[data[i][0].toLowerCase()][0];
		a.appendChild(icon);
		a.appendChild(document.createTextNode(" " + data[i][1]));
		a.setAttribute("href", page[data[i][0].toLowerCase()][1]);
		a.setAttribute("target", "_blank");
		let p = document.createElement("p");
		p.appendChild(a);
		d.appendChild(p);
	}
	d.classList.add("resume_leftContent");
	return [d];
}

function resume_buildResume(language){
	if(RESUME_SELECTED == language){
		return;
	}
	const resume_data = RESUME_DATA[language];
	
	document.getElementById("resume_top").replaceChildren(
		document.createElement("h1").appendChild(document.createTextNode(resume_data["name"])).parentNode,
		document.createElement("p").appendChild(document.createTextNode(resume_data["title"])).parentNode
	);
	document.getElementById("resume_left").replaceChildren(
		resume_sectionLeft(resume_data, "Personal", resume_buildInformation),
		resume_sectionLeft(resume_data, "Links", resume_buildLinks),
		resume_sectionLeft(resume_data, "Software", resume_buildSkillTable),
		resume_sectionLeft(resume_data, "Programming", resume_buildSkillTable),
		resume_sectionLeft(resume_data, "Language", resume_buildSkillTable),
	);
	document.getElementById("resume_right").replaceChildren(
		resume_sectionRight(resume_data, "Profile", resume_buildRightText),
		resume_sectionRight(resume_data, "Experience", resume_buildRightContent),
		resume_sectionRight(resume_data, "Education", resume_buildRightContent),
		resume_sectionRight(resume_data, "References", resume_buildRightContent),
	);
	
	for(let i = 0; i < document.getElementById("resume_language").getElementsByTagName("tbody")[0].children.length; i++){
		document.getElementById("resume_language").getElementsByTagName("tbody")[0].children[i].addEventListener("click", function(event_){resume_loadResume(i);});
	}
	RESUME_SELECTED = language;
}

function resume_sectionLeft(resume_data, section_name, resume_builder){
	let section = document.createElement("div");
	section.id = "resume_" + section_name.toLowerCase();
	section.classList.add("resume_sectionLeft");
	let section_title = document.createElement("h3");
	section_title.appendChild(document.createTextNode(resume_data[section_name]["name"]));
	section.replaceChildren(section_title, ...resume_builder(resume_data[section_name]["content"]));
	return section;
}

function resume_sectionRight(resume_data, section_name, resume_builder){
	let section = document.createElement("div");
	section.id = "resume_" + section_name.toLowerCase();
	section.classList.add("resume_sectionRight");
	let section_title = document.createElement("h3");
	section_title.appendChild(document.createTextNode(resume_data[section_name]["name"]));
	section.replaceChildren(section_title, document.createElement("hr"), ...resume_builder(resume_data[section_name]["content"]));
	return section;
}
