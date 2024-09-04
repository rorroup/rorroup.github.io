
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
			color: [0.2, 0.2, 0.2],
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
							color: [0.2, 0.2, 0.2],
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
							let loaded_colors = await pen_obj.mtl_read(txt);
							mtllib = {...mtllib, ...loaded_colors};
						}
						}
						break;
					case "usemtl":{
						if(w.length == 2){
							if(w[1] in mtllib){
								if("Kd" in mtllib[w[1]]){
									o.color = mtllib[w[1]]["Kd"];
								}
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
	
	mtl_read: async function(t){
		let materials = {};
		let newmtl = {};
		t.split('\n').forEach((row) => {
			if(row[0] != '#'){
				let w = row.split(' ');
				switch(w[0]){
					case "newmtl":{
						if("newmtl" in newmtl){
							materials[newmtl["newmtl"]] = newmtl;
						}
						newmtl = {};
						if(w.length >= 2){
							newmtl[w[0]] = w[1];
						}
						}
						break;
					case "Kd":{
						if(w.length == 4){
							let r = Number(w[1]);
							let g = Number(w[2]);
							let b = Number(w[3]);
							if(!isNaN(r) && !isNaN(g) && !isNaN(b)){
								newmtl[w[0]] = [r, g, b];
							}
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
					default:
						break;
				}
			}
		});
		if("newmtl" in newmtl){
			materials[newmtl["newmtl"]] = newmtl;
		}
		return materials;
	},
};
