let resistenciaNominal;
let resistenciaObtenida;
let diametroCilindro; // en mm
let longitudCilindro; // en mm
let areaCilindro;
// Velocidad de carga en MPa/s. Rango aceptable: 0.15 a 0.35 MPa/s (ASTM C-39)
// Valor recomendado por NTC-673: 0.25 MPa/s						
//const velocidadCarga = 0.25;
//Precisión aceptable: +- 0.05 MPa/s (NTC-673)
const precision = 0.05; 

// Para calcular los valores de esfuerzo y deformación se usa la ecuación de 
// Thorenfeldt, Tomaszewicz y Jensen del libro de Wight, 
// "Reinforced concrete mechanics and design, 2016"
// Para concretos con f'c entre 15 y 125 MPa

let data = [];
let datosExcel = [];
let datosCarga = [];					
let deformacion;	
let carga;
let e;

function grafica() {
  resistenciaNominal = parseInt(document.getElementById('resistenciaNominal').value);
	resistenciaObtenida = resistenciaNominal + resistenciaNominal*Math.random()*0.15 - resistenciaNominal*Math.random()*0.15;
	diametroCilindro = 150 + Math.random() - Math.random(); 
	longitudCilindro = 300 + Math.random() - Math.random(); 
	areaCilindro = Math.PI*(diametroCilindro/2)**2;
	const FC = resistenciaObtenida*1000/7; // FC es f'c en psi
	const n = 0.8 + (FC/2500);
	const Ec = 57000*Math.sqrt(FC);
	const e0 = (FC/Ec)*(n/(n-1));	

	for (e = 0.00000; e <= 0.00300; e += 0.00001) {
							
		let coef = e/e0;

		let k = (coef <= 1) ? 1 : 0.67 + (FC / 9000);								
							
		let fc = (7/1000) * ( n * FC * coef ) / ( n - 1 + coef**(n*k));
							
		carga = (((fc * areaCilindro) + Math.random()*precision - Math.random()*precision)  / 1000).toFixed(3); 
							
		deformacion = (longitudCilindro * e).toFixed(3);
								
		datosExcel.push([carga, deformacion]);					
								
		datosCarga.push(carga);		
							
		data.push({x: deformacion, y: carga});
							
	}	 

	// Configuración de la animación de la gráfica
	tippy('[data-tippy-content]');
	const totalDuration = data.length*100;
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

	return myChart, datosExcel;
}

// Se obtiene la carga máxima aplicada
function getMaxOfArray(datosCarga) {
	return Math.max.apply(null, datosCarga);
}

let cargaMaxima = getMaxOfArray(datosCarga);

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
	

					

	
							
								 
	