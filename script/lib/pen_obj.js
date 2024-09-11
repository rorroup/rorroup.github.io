
var pen_obj = {
	obj_load: async function(text_){
		let models = [];
		let objects = [];
		let mtllib = {};
		let lineStart = -1;
		let o = {
			o: "",
			f: {
				v: [],
				vt: [],
				vn: [],
			},
			usemtl: "",
		};
		let v = [];
		let vt = [];
		let vn = [];
		
		let tableloaded = document.getElementById("tableload").children[0];
		
		const lines = text_.split('\n');
		for(let i = 0; i < lines.length; i++){
			const line = lines[i].trim();
			const content = line.split('#')[0].trim();
			if(content.length > 0){
				const tr = document.createElement("tr");
				
				const data = content.split(/\s+/);
				
				switch(data[0]){
					case "o":
						{
							if(o.f.v.length > 0){
								objects.push(o);
							}else if(lineStart >= 0){
								console.log(`[Warning] Object '${o.o}' declared on line ${lineStart + 1} defined no faces. Skipping Object.`);
							}
							lineStart = i;
							o = {
								o: "",
								f: {
									v: [],
									vt: [],
									vn: [],
								},
								usemtl: "",
							};
							if(data.length >= 2){
								o.o = data[1];
							}else{
								o.o = "UNNAMED_" + lineStart.toString().padStart(3, '0');
								console.log(`[Warning] Object declared without a name on line ${lineStart + 1}. Setting name to '${o.o}'.`);
							}
							let td = document.createElement("td");
							td.textContent = data[0];
							tr.appendChild(td);
							let td2 = document.createElement("td");
							td2.textContent = o.o;
							tr.appendChild(td2);
							tableloaded.appendChild(tr);
						}
						break;
					case "v":
						{
							if(data.length == 4){
								let param = [];
								for(let j = 1; j < data.length; j++){
									let value = Number(data[j]);
									if(isNaN(value)){
										console.log(`[Error] Unable to interpret '${data[j]}' on line ${i + 1} as a valid number. Aborting.`);
										return models;
									}
									param.push(value);
								}
								v.push(param);
								
								let td = document.createElement("td");
								td.textContent = data[0];
								tr.appendChild(td);
								let tdx = document.createElement("td");
								tdx.textContent = data[1];
								tr.appendChild(tdx);
								let tdy = document.createElement("td");
								tdy.textContent = data[2];
								tr.appendChild(tdy);
								let tdz = document.createElement("td");
								tdz.textContent = data[3];
								tr.appendChild(tdz);
								tableloaded.appendChild(tr);
							}else{
								console.log(`[Error] Malformed statement '${content}' on line ${i + 1}. Aborting.`);
								return models;
							}
						}
						break;
					case "vt":
						{
							if(data.length == 3){
								let param = [];
								for(let j = 1; j < data.length; j++){
									let value = Number(data[j]);
									if(isNaN(value)){
										console.log(`[Error] Unable to interpret '${data[j]}' on line ${i + 1} as a valid number. Aborting.`);
										return models;
									}
									param.push(value);
								}
								vt.push(param);
								
								let td = document.createElement("td");
								td.textContent = data[0];
								tr.appendChild(td);
								let tdx = document.createElement("td");
								tdx.textContent = data[1];
								tr.appendChild(tdx);
								let tdy = document.createElement("td");
								tdy.textContent = data[2];
								tr.appendChild(tdy);
								tableloaded.appendChild(tr);
							}else{
								console.log(`[Error] Malformed statement '${content}' on line ${i + 1}. Aborting.`);
								return models;
							}
						}
						break;
					case "vn":
						{
							if(data.length == 4){
								let param = [];
								for(let j = 1; j < data.length; j++){
									let value = Number(data[j]);
									if(isNaN(value)){
										console.log(`[Error] Unable to interpret '${data[j]}' on line ${i + 1} as a valid number. Aborting.`);
										return models;
									}
									param.push(value);
								}
								vn.push(param);
								
								let td = document.createElement("td");
								td.textContent = data[0];
								tr.appendChild(td);
								let tdx = document.createElement("td");
								tdx.textContent = data[1];
								tr.appendChild(tdx);
								let tdy = document.createElement("td");
								tdy.textContent = data[2];
								tr.appendChild(tdy);
								let tdz = document.createElement("td");
								tdz.textContent = data[3];
								tr.appendChild(tdz);
								tableloaded.appendChild(tr);
							}else{
								console.log(`[Error] Malformed statement '${content}' on line ${i + 1}. Aborting.`);
								return models;
							}
						}
						break;
					case "f":
						{
							if(data.length == 4){
								let o_v = [];
								let o_vt = [];
								let o_vn = [];
								for(let j = 1; j < data.length; j++){
									const vertexData = data[j].split('/');
									if(vertexData.length == 3){
										let param = [];
										for(let k = 0; k < vertexData.length; k++){
											const value = Number(vertexData[k]);
											if(isNaN(value)){
												console.log(`[Error] Unable to interpret '${vertexData[k]}' on line ${i + 1} for object '${o.o}' as a valid number. Aborting.`);
												return models;
											}
											if(!Number.isInteger(value)){
												console.log(`[Error] Index '${value}' on line ${i + 1} for object '${o.o}' must be an integer. Aborting.`);
												return models;
											}
											if(value <= 0 && vertexData[k] != ""){
												console.log(`[Error] Index '${value}' on line ${i + 1} for object '${o.o}' must be greater than 0. Aborting.`);
												return models;
											}
											param.push(value);
										}
										if(param[0] <= 0){
											console.log(`[Error] First index in group ${data[j]} on line ${i + 1} for object '${o.o}' can not be omitted. Aborting.`);
											return models;
										}
										o_v.push(param[0]);
										if(param[1] > 0){
											o_vt.push(param[1]);
										}
										if(param[2] > 0){
											o_vn.push(param[2]);
										}
									}else{
										console.log(`[Error] Malformed statement '${content}' on line ${i + 1} for object '${o.o}'. Aborting.`);
										return models;
									}
								}
								if(o_vt.length != o_v.length && o_vt.length != 0){
									console.log(`[Error] Second index in statement '${content}' on line ${i + 1} for object '${o.o}' can not be alternately omitted. Aborting.`);
									return models;
								}
								if(o_vn.length != o_v.length && o_vn.length != 0){
									console.log(`[Error] Third index in statement '${content}' on line ${i + 1} for object '${o.o}' can not be alternately omitted. Aborting.`);
									return models;
								}
								o.f.v.push(o_v);
								if(o_vt.length > 0){
									o.f.vt.push(o_vt);
								}
								if(o_vn.length > 0){
									o.f.vn.push(o_vn);
								}
								if(o.f.vt.length != o.f.v.length && o.f.vt.length != 0){
									console.log(`[Error] Second index in statement '${content}' on line ${i + 1} for object '${o.o}' omission mismatch. Aborting.`);
									return models;
								}
								if(o.f.vn.length != o.f.v.length && o.f.vn.length != 0){
									console.log(`[Error] Second index in statement '${content}' on line ${i + 1} for object '${o.o}' omission mismatch. Aborting.`);
									return models;
								}
								
								let td = document.createElement("td");
								td.textContent = data[0];
								tr.appendChild(td);
								let tdx = document.createElement("td");
								tdx.textContent = data[1];
								tr.appendChild(tdx);
								let tdy = document.createElement("td");
								tdy.textContent = data[2];
								tr.appendChild(tdy);
								let tdz = document.createElement("td");
								tdz.textContent = data[3];
								tr.appendChild(tdz);
								tableloaded.appendChild(tr);
							}else{
								console.log(`[Error] Malformed statement '${content}' on line ${i + 1} for object '${o.o}'. Aborting.`);
								return models;
							}
						}
						break;
					case "mtllib":
						{
							if(data.length >= 2){
								let text_ = false;
								try{
									const response = await fetch(`asset/${data[1]}`);
									// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#handling_the_response
									if(!response.ok){
										throw new Error(`Response status: ${response.status}`);
									}
									text_ = await response.text();
								}catch(error_){
									console.error(error_);
								}
								if(text_ != false){
									let loaded_materials = await pen_obj.mtl_load(text_);
									mtllib = {...mtllib, ...loaded_materials};
								}
							}else{
								console.log(`[Error] Malformed statement '${content}' on line ${i + 1}. Skipping line.`);
							}
						}
						break;
					case "usemtl":
						{
							if(data.length >= 2){
								o.usemtl = data[1];
							}else{
								console.log(`[Error] Malformed statement '${content}' on line ${i + 1} for object '${o.o}'. Skipping line.`);
							}
						}
						break;
					case "s":
						{
							
						}
						break;
					default:
						{
							console.log(`[Error] Unsupported instruction '${data[0]}' on line ${i + 1}. Skipping line.`);
						}
						break;
				}
			}
		}
		if(o.f.v.length > 0){
			objects.push(o);
		}else if(lineStart >= 0){
			console.log(`[Warning] Object '${o.o}' declared on line ${lineStart + 1} defined no faces. Skipping Object.`);
		}
		// console.log(`O: ${models.length}. V: ${vertexData.v.length}. VN: ${vertexData.vn.length}. VT: ${vertexData.vt.length}.`);
		
		document.getElementById("INFO").textContent = `OBJECTS READ: ${objects.length}\nLOADED OBJECTS: `;
		
		let s = 0;
		for(let i = 0; i < objects.length; i++){
			
			let object_ = objects[i];
			
			// console.log(`Attempting to load object: '${object_.o}'`);
			
			let model_v = [];
			let model_vt = [];
			let model_vn = [];
			let model_vc = 0;
			let model_usemtl = Material_DEFAULT;
			
			// use the faces indices to access the other arrays.
			for(let j = 0; j < object_.f.v.length; j++){
				for(let k = 0; k < object_.f.v[j].length; k++){
					if(object_.f.v[j][k] <= v.length){
						model_v.push(...v[object_.f.v[j][k] - 1]);
						model_vc++;
					}else{
						console.log(`[Error] Vertex index '${object_.f.v[j][k]}' of face number ${j + 1} of object '${object_.o}' is out of bounds. Skipping Object.`);
						k = object_.f.v[j].length;
						j = object_.f.v.length;
						model_vc = 0;
						break;
					}
				}
			}
			
			if(model_vc > 0){
				for(let j = 0; j < object_.f.vt.length; j++){
					for(let k = 0; k < object_.f.vt[j].length; k++){
						if(object_.f.vt[j][k] <= vt.length){
							model_vt.push(...vt[object_.f.vt[j][k] - 1]);
						}else{
							console.log(`[Error] Vertex texture index '${object_.f.vt[j][k]}' of face number ${j + 1} of object '${object_.o}' is out of bounds. Skipping Object.`);
							k = object_.f.vt[j].length;
							j = object_.f.vt.length;
							model_vc = 0;
							break;
						}
					}
				}
			}
			
			if(model_vc > 0){
				for(let j = 0; j < object_.f.vn.length; j++){
					for(let k = 0; k < object_.f.vn[j].length; k++){
						if(object_.f.vn[j][k] <= vn.length){
							model_vn.push(...vn[object_.f.vn[j][k] - 1]);
						}else{
							console.log(`[Error] Vertex normal index '${object_.f.vn[j][k]}' of face number ${j + 1} of object '${object_.o}' is out of bounds. Skipping Object.`);
							k = object_.f.vn[j].length;
							j = object_.f.vn.length;
							model_vc = 0;
							break;
						}
					}
				}
			}
			
			if(model_vc > 0){
				if(object_.usemtl != ""){
					if(object_.usemtl in mtllib){
						model_usemtl = mtllib[object_.usemtl];
					}else{
						console.log(`[Warning] Material '${object_.usemtl}' for object '${object_.o}' not found. Assigning default material.`);
					}
				}
				
				models.push(new Model(model_v, model_vt, model_vn, model_vc, model_usemtl));
				// console.log(`Object '${object_.o}' loaded successfully!`);
				s += 1;
			}
		}
		document.getElementById("INFO").textContent += `${s}/${models.length}`;
		
		return models;
	},
	
	mtl_load: async function(text_){
		let materials = {};
		let newmtl = false;
		let paramSet = [];
		let isValid = true;
		const lines = text_.split('\n');
		for(let i = 0; i < lines.length; i++){
			const line = lines[i].trim();
			const content = line.split('#')[0].trim();
			if(content.length > 0){
				const data = content.split(/\s+/);
				if(data[0] == "newmtl"){
					if(newmtl != false){
						materials[newmtl.newmtl] = newmtl;
					}
					newmtl = false;
					paramSet = [];
					isValid = true;
					if(data.length >= 2){
						const name = data[1];
						if(name in materials){
							isValid = false;
							console.log(`[Error] Failed to set material name '${name}' on line ${i + 1} because it is already in use. Skipping material.`);
						}else{
							newmtl = new Material(name);
						}
					}else{
						isValid = false;
						console.log(`[Error] Malformed statement '${content}' on line ${i + 1}. Skipping material.`);
					}
				}else if(newmtl == false){
					if(isValid){
						console.log(`[Error] Data '${content}' on line ${i + 1} does not belong to a material scope. Skipping line.`);
					}
				}else if(paramSet.includes(data[0])){
					console.log(`[Error] Field '${data[0]}' on line ${i + 1} for material '${newmtl.newmtl}' has already been set. Skipping line.`);
				}else{
					paramSet.push(data[0]);
					switch(data[0]){
						case "newmtl": break;
						case "Kd":
							{
								if(data.length == 4){
									let param = [];
									for(let j = 1; j < 4; j++){
										const color = Number(data[j]);
										if(isNaN(color)){
											console.log(`[Error] Failed to interpret '${data[j]}' on line ${i + 1} for field '${data[0]}' as a valid number. Using default value.`);
											break;
										}else{
											param.push(color);
										}
									}
									if(param.length == 3){
										newmtl.Kd = new Float32Array(param);
									}
								}else{
									console.log(`[Error] Malformed statement '${content}' on line ${i + 1} for material '${newmtl.newmtl}'. Using default value.`);
								}
							}
							break;
						// TODO:
						case "Ns":
						case "Ka":
						case "Ks":
						case "Ke":
						case "Ni":
						case "d":
						case "illum":
							{
								// console.log(`[Warning] '${data[0]}' field in line ${i + 1} for material '${newmtl["newmtl"]}' is not currently supported. Skipping line.`);
							}
							break;
						default:
							paramSet.pop();
							console.log(`[Error] Unsupported field '${data[0]}' in line ${i + 1} for material '${newmtl.newmtl}'. Skipping line.`);
							break;
					}
				}
			}
		}
		if(newmtl != false){
			materials[newmtl.newmtl] = newmtl;
		}
		return materials;
	},
};
