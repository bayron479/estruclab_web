let resistenciaNominal;
let resistenciaObtenida;
const diametroCilindro = 150 + Math.random() - Math.random(); // en mm 
const longitudCilindro = 300 + Math.random() - Math.random(); // en mm 
const areaCilindro = Math.PI*(diametroCilindro/2)**2;
const precision = Number(0.05); 
// Velocidad de carga = 1 mm / min
const velocidadCarga = Number(1/60); // en mm/s 

// Para calcular los valores de esfuerzo y deformación se usa la ecuación de 
// Thorenfeldt, Tomaszewicz y Jensen del libro de Wight, 
// "Reinforced concrete mechanics and design, 7ed, 2016"
// Ecuación 3-23 p-91 Para concretos con f'c entre 15 y 125 MPa

let data = [];
let datosExcel = [];
let datosCarga = [];					
let deformacion = 0;
const  pasoDeformacion = velocidadCarga / (longitudCilindro - velocidadCarga );	
let carga = 0;
let cargaMaxima = 0;
let e = 0;


function grafica() {
  resistenciaNominal = parseInt(document.getElementById('resistenciaNominal').value);
	resistenciaObtenida = resistenciaNominal + resistenciaNominal*Math.random()*0.15 - resistenciaNominal*Math.random()*0.15;
	const FC = resistenciaObtenida*1000/7; // FC es f'c en psi
	const n = 0.8 + (FC/2500);
	const Ec = 57000*Math.sqrt(FC); // en psi
	const e0 = (FC/Ec)*(n/(n-1));	

	for (e = 0.00000; e <= 0.00300; e += pasoDeformacion) {
							
		let coef = e/e0;

		let k = (coef <= 1) ? 1 : 0.67 + (FC / 9000);								
							
		let fc = (7/1000) * ( n * FC * coef ) / ( n - 1 + coef**(n*k));
							
		carga = ((fc  + Math.random()*precision - Math.random()*precision) * areaCilindro  / 1000).toFixed(3); // en kN 
							
		deformacion = (longitudCilindro * e / (1 + e)).toFixed(3); // en mm
								
		datosExcel.push([Number(carga), Number(deformacion)]);					
								
		datosCarga.push(Number(carga));

		cargaMaxima = Math.max.apply(null, datosCarga);

		data.push({x: deformacion, y: carga});		
		
		if (carga < 0.95 * cargaMaxima) {			
			break;
		}
		else {
			continue;
		}	
							
	}	 

	// Configuración de la animación de la gráfica
	tippy('[data-tippy-content]');
	const totalDuration = data.length*1000;
	const delayBetweenPoints = totalDuration / data.length;	
	const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;
						
	const animation = {
		x: {
			type: 'number',
			easing: 'linear',
			duration: delayBetweenPoints,
			from: NaN, // the point is initially skipped
			delay(ctx) {
			if (ctx.type !== 'data' || ctx.xStarted) {
				return 0;
			}
			ctx.xStarted = true;
			return ctx.index * delayBetweenPoints;
			}
		},
							
		y: {
			type: 'number',
			easing: 'linear',
			duration: delayBetweenPoints,
								
			from: previousY,
			delay(ctx) {
				if (ctx.type !== 'data' || ctx.yStarted) {
					return 0;
				}
				ctx.yStarted = true;
				return ctx.index * delayBetweenPoints;
			}
		}
	};
						
	const config = {
		type: 'line',
		data: {
			datasets: [{   
				borderColor: 'rgb(200, 50, 50)',     
				borderWidth: 1.5,
				radius: 0,
				data: data,
			}],
		},
							
		options: {
			animation,
			interaction: {
				intersect: false
			},
			plugins: {
				legend: false,
				title: {
						display: true,
						text: 'Concreto a compresión'				
					}
			},
								
			scales:{
				x: {          
					type: 'linear',
					title: {
						display: true,
						text: 'Deformación (mm)'
					},
				},
									
				y: {
					type: 'linear',
					title: {
						display: true,
						text: 'Carga aplicada (kN)'
					}
				}
			}
		}
	};
	
		const myChart = new Chart(
			document.getElementById('myChart'),
			config
		);

	return myChart, datosCarga, cargaMaxima, datosExcel;
}


function reporteDiametro() {
	document.getElementById("reporte-diametro").innerHTML = "Diámetro: " + parseFloat(diametroCilindro).toFixed(2) + " mm" + "\n";
} 

function reporteLongitud() {
	document.getElementById("reporte-longitud").innerHTML = "Longitud inicial: " + parseFloat(longitudCilindro).toFixed(2) + " mm" + "\n";
}

var tiempoFalla;

//var finEnsayo = datosExcel.length*1000;

function mensajeCargaMaxima() {
	tiempoFalla = setTimeout("datoCargaMaxima()", 45000);
}

function datoCargaMaxima() {
	document.getElementById("reporte-carga").innerHTML = "Carga Máxima: " + parseFloat(cargaMaxima).toFixed(3) + " kN" + "\n";
}

// Datos en Excel
function datosEnsayo() {
	let wb = XLSX.utils.book_new();					
	wb.SheetNames.push("Test Sheet");					
	let ws_data = datosExcel;
	let ws = XLSX.utils.aoa_to_sheet(ws_data, { origin: "A2" });
	wb.Sheets["Test Sheet"] = ws;
	XLSX.utils.sheet_add_aoa(ws, [["Carga aplicada (kN)", "Deformación (mm)"]], { origin: "A1" });				 
	ws["!cols"] = [ { wch: 20 }, { wch: 20 } ];

	return XLSX.writeFile(wb, "datos_concreto_compresion.xlsx");	
}
	
// Animación 3d-gltf
 
 var scene = new THREE.Scene();
 var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
 var cilindroConcreto; var maquinaCarga;
 const renderer = new THREE.WebGLRenderer();
 renderer.setSize(window.innerWidth, window.innerHeight);
 const loader = new GLTFLoader();
 var obj;
 //loader.load('concreto-compresion.gltf', function (gltf) {
 loader.load('concreto-compresion.glb', function (gltf) {
 obj = gltf.scene;
 scene.add(gltf.scene);
   }, undefined, function (error) {
 	console.error( error );
 });	
 function animate() {
 	requestAnimationFrame( animate );
 	renderer.render( scene, camera );
 }
 animate();

	
							
								 
	