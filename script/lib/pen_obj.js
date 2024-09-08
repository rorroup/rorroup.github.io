
var pen_obj = {
	obj_read: async function(t){
		let loadedObjects = [];
		let vertexData = {
			v: [],
			vt: [],
			vn: [],
		};
		let ERROR = 0;
		let o = {
			name: "",
			f: [],
			material: Material_DEFAULT,
		};
		
		let mtllib = {};
		
		let tableloaded = document.getElementById("tableload").children[0];
		
		// TODO: 
		// account for whitespaces and missing texCoord indices.
		const l = t.split('\n');
		for(let j = 0; j < l.length; j++){
			const row = l[j];
			if(row[0] != '#'){
				const tr = document.createElement("tr");
				
				let w = row.split(' ');
				
				switch(w[0]){
					case "o":{
						if(o.f.length > 0){
							loadedObjects.push(o);
						}
						
						o = {
							name: "",
							f: [],
							material: Material_DEFAULT,
						};
						if(w.length >= 2){
							o.name = w[1];
						}
						let td = document.createElement("td");
						td.textContent = w[0];
						tr.appendChild(td);
						let td2 = document.createElement("td");
						td2.textContent = o.name;
						tr.appendChild(td2);
						tableloaded.appendChild(tr);
						}
						break;
					case "v":{
						if(w.length == 4){
							let x = Number(w[1]);
							let y = Number(w[2]);
							let z = Number(w[3]);
							if(!isNaN(x) && !isNaN(y) && !isNaN(z)){
								vertexData.v.push([x, y ,z]);
							}else{
								ERROR++;
							}
							
							let td = document.createElement("td");
							td.textContent = w[0];
							tr.appendChild(td);
							let tdx = document.createElement("td");
							tdx.textContent = w[1];
							tr.appendChild(tdx);
							let tdy = document.createElement("td");
							tdy.textContent = w[2];
							tr.appendChild(tdy);
							let tdz = document.createElement("td");
							tdz.textContent = w[3];
							tr.appendChild(tdz);
							tableloaded.appendChild(tr);
						}else{
							ERROR++;
						}
						}
						break;
					case "vt":{
						if(w.length == 3){
							let x = Number(w[1]);
							let y = Number(w[2]);
							if(!isNaN(x) && !isNaN(y)){
								vertexData.vt.push([x, y]);
							}else{
								ERROR++;
							}
							
							let td = document.createElement("td");
							td.textContent = w[0];
							tr.appendChild(td);
							let tdx = document.createElement("td");
							tdx.textContent = w[1];
							tr.appendChild(tdx);
							let tdy = document.createElement("td");
							tdy.textContent = w[2];
							tr.appendChild(tdy);
							tableloaded.appendChild(tr);
						}else{
							ERROR++;
						}
						}
						break;
					case "vn":{
						if(w.length == 4){
							let x = Number(w[1]);
							let y = Number(w[2]);
							let z = Number(w[3]);
							if(!isNaN(x) && !isNaN(y) && !isNaN(z)){
								vertexData.vn.push([x, y ,z]);
							}else{
								ERROR++;
							}
							
							let td = document.createElement("td");
							td.textContent = w[0];
							tr.appendChild(td);
							let tdx = document.createElement("td");
							tdx.textContent = w[1];
							tr.appendChild(tdx);
							let tdy = document.createElement("td");
							tdy.textContent = w[2];
							tr.appendChild(tdy);
							let tdz = document.createElement("td");
							tdz.textContent = w[3];
							tr.appendChild(tdz);
							tableloaded.appendChild(tr);
						}else{
							ERROR++;
						}
						}
						break;
					case "f":{
						if(w.length == 4){
							let l = [];
							for(let i = 1; i < 4; i++){
								let ww = w[i].split('/');
								let v = Number(ww[0]);
								let vn = Number(ww[1]);
								let vt = Number(ww[2]);
								if(!isNaN(v) && !isNaN(vn) && !isNaN(vt)){
									l.push([v, vn, vt]);
								}else{
									ERROR++;
								}
							}
							o.f.push(l);
							
							let td = document.createElement("td");
							td.textContent = w[0];
							tr.appendChild(td);
							let tdx = document.createElement("td");
							tdx.textContent = w[1];
							tr.appendChild(tdx);
							let tdy = document.createElement("td");
							tdy.textContent = w[2];
							tr.appendChild(tdy);
							let tdz = document.createElement("td");
							tdz.textContent = w[3];
							tr.appendChild(tdz);
							tableloaded.appendChild(tr);
						}else{
							ERROR++;
						}
						}
						break;
					case "mtllib":{
						if(w.length == 2){
							const response = await fetch(`asset/${w[1]}`);
							const txt = await response.text();
							let loaded_colors = await pen_obj.mtl_load(txt);
							mtllib = {...mtllib, ...loaded_colors};
						}
						}
						break;
					case "usemtl":{
						if(w.length == 2){
							if(w[1] in mtllib){
								o.material = mtllib[w[1]];
							}
						}
						}
						break;
					default:
						break;
				}
			}
		}
		if(o.f.length > 0){
			loadedObjects.push(o);
		}
		// console.log(`O: ${loadedObjects.length}. V: ${vertexData.v.length}. VN: ${vertexData.vn.length}. VT: ${vertexData.vt.length}.`);
		return {
			o: loadedObjects,
			vd: vertexData,
			e: ERROR,
		};
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
