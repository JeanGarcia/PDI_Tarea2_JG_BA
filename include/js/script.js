// Create by Jean Garcia

var x1 = [];
var y1 = [];
var y2 = [];
var y3 = [];

for(var i = 0; i < 256; i++){
	x1.push(i);
	y1.push(0); y2.push(0);y3.push(0);
}

var hist = document.getElementById("Hist");

// Cuando el usuario escoge un archivo, se llama a la funcion handleFiles.
var inputElement = document.getElementById("input");
inputElement.addEventListener("change", handleFiles, false);

// Se crea el contexto del canvas a utilizar.
var canvas1 = document.getElementById('canvas1');
var ctx1 = canvas1.getContext('2d');

//Se crea un canvas auxiliar para modificar y luego actualizar.
canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var bitmap = {}; // los datos de la imagen.

// Controla cuando el usuario desea aplicar una transformacion
var inputElement = document.getElementById("boton");
inputElement.addEventListener("click", transform , false);


//  --------------------------------FUNCIONES ----------------------------------------------
            function handleFiles(e) {
            // Se abre el archivo.
                var file = e.target.files[0];
                var reader = new FileReader();
                reader.addEventListener("load", processimage, false);
                reader.readAsArrayBuffer(file);
            }
//  ------------------------------------------------------------------------------
            function processimage(e) {
            // se almacena el contenido del archivo en un buffer para procesarlo, obtener el mapa, y convertirlo a imagen.
                var buffer = e.target.result;
                getBMP(buffer);
                var imageData = convertToImageData();
                ctx1.putImageData(imageData, 0, 0);
    	            fillHist();
            }
//  ------------------------------------------------------------------------------
            function getBMP(buffer) { 
            // se obtiene el mapa de bits de la imagen .
                var datav = new DataView(buffer);
                var npadding, resto, cont=0, cont2=0, start;
                // Se lee y almacena la cabecera.
                bitmap.fileheader = {};
                bitmap.fileheader.bfType = datav.getUint16(0, true);
                bitmap.fileheader.bfSize = datav.getUint32(2, true);
                bitmap.fileheader.bfReserved1 = datav.getUint16(6, true);
                bitmap.fileheader.bfReserved2 = datav.getUint16(8, true);
                bitmap.fileheader.bfOffBits = datav.getUint32(10, true);

                // Se lee y almacena la información de la cabecera.
                bitmap.infoheader = {};
                bitmap.infoheader.biSize = datav.getUint32(14, true);
                bitmap.infoheader.biWidth = datav.getUint32(18, true);
                bitmap.infoheader.biHeight = datav.getUint32(22, true);
                bitmap.infoheader.biPlanes = datav.getUint16(26, true);
                bitmap.infoheader.biBitCount = datav.getUint16(28, true);
                bitmap.infoheader.biCompression = datav.getUint32(30, true);
                bitmap.infoheader.biSizeImage = datav.getUint32(34, true);
                bitmap.infoheader.biXPelsPerMeter = datav.getUint32(38, true);
                bitmap.infoheader.biYPelsPerMeter = datav.getUint32(42, true);
                bitmap.infoheader.biClrUsed = datav.getUint32(46, true);
                bitmap.infoheader.biClrImportant = datav.getUint32(50, true);

                start = bitmap.fileheader.bfOffBits, NumbClr = bitmap.infoheader.biClrUsed, off= 54;
                
                bitmap.palette = new Uint8Array(buffer,(bitmap.fileheader.bfOffBits-(NumbClr*4)), NumbClr*4);

                if (bitmap.infoheader.biBitCount == 24) { // EN 24 BITS - - - - - - - - - - - - - - - - - - - - - - - - - - - -

                    npadding = (bitmap.infoheader.biWidth*3) % 4;

                    if(npadding > 0) { // CON PADDDING!.

                        resto = 4-npadding;

                        bitmap.pixels = new Uint8Array (bitmap.infoheader.biHeight*bitmap.infoheader.biWidth * 3);

                        for (var y = 0; y < bitmap.infoheader.biHeight; y++) { 
                            for (var x = 0; x < bitmap.infoheader.biWidth; x++) {

                                bitmap.pixels[cont] = datav.getUint8(start + cont2,true);
                                bitmap.pixels[cont + 1] = datav.getUint8(start+ cont2 + 1,true);
                                bitmap.pixels[cont + 2] = datav.getUint8(start+ cont2 + 2,true);
                                cont = cont + 3;
                                cont2 = cont2 + 3;

                            }
                            cont2 = cont2 + resto;
                        }
                    } else {
                        bitmap.pixels = new Uint8Array(buffer, start); // SIN PADDING!!!.
                    }

                } else if (bitmap.infoheader.biBitCount == 8) { // EN 8 BITS  - - - - - - - - - - - - - - - - - - - - - - - - - - - -

                    npadding = (bitmap.infoheader.biWidth) % 4;

                    if(npadding > 0) { // CON PADDDING!.

                        resto = 4-npadding;

                        bitmap.pixels = new Uint8Array (bitmap.infoheader.biHeight * bitmap.infoheader.biWidth);

                        for (var y = 0; y < bitmap.infoheader.biHeight; y++) { 
                            for (var x = 0; x < bitmap.infoheader.biWidth; x++) {

                                bitmap.pixels[cont] = datav.getUint8(start + cont2,true);
                                cont++;
                                cont2++;

                            }
                            cont2 = cont2 + resto;
                        }
                        console.log(cont);
                        console.log(cont2);
                    } else {
                        bitmap.pixels = new Uint8Array(buffer, start); // SIN PADDING!!!.
                    }

                } else if(bitmap.infoheader.biBitCount == 4) { // PADDING EN 4 BITS  - - - - - - - - - - - - - - - - - - - - - - - - - - - -

                    if ( (bitmap.infoheader.biWidth * bitmap.infoheader.biBitCount) % 32 == 0) {  // CON PADDDING!.

                      var RW, mult, PD, ByteF, ByteP;

                        RW = bitmap.infoheader.biWidth * 4;
                        mult = 32 * ((RW / 32) + 1);
                        PD = mult - RW;
                        ByteF = RW / 8;
                        ByteP = PD / 8;

                        bitmap.pixels2 = new Uint8Array (bitmap.infoheader.biHeight * bitmap.infoheader.biWidth);

                        for (var y = 0; y < bitmap.infoheader.biHeight; y++) { 
                            for (var x = 0; x < bitmap.infoheader.biWidth/2; x++) {

                                bitmap.pixels2[cont] = datav.getUint8(start + cont2,true);
                                cont++;
                                cont2++;

                            }
                            cont2 = cont2 + resto;
                        }

                    } else {  // SIN PADDING!!!.
                        console.log("no pad!");
                        bitmap.pixels2 = [];
                        bitmap.pixels2 = findtheindex(bitmap.infoheader.biBitCount); // se busca los indices.
                    }
                    
                }

                resizeCanvas(bitmap.infoheader.biWidth,bitmap.infoheader.biHeight);
                
            }
//  ------------------------------------------------------------------------------
            function convertToImageData() { 
            // el mapa de bit se convierte en imagen.
                
                var Width = bitmap.infoheader.biWidth;
                var Height = bitmap.infoheader.biHeight;
                var imageData = ctx.createImageData(Width, Height);
                var data = imageData.data;
                var bmpdata = bitmap.pixels;
                var palette = bitmap.palette;


                if(bitmap.infoheader.biBitCount == 24) {
                    // se reorganizan los pixeles para poderlos meter en la estructura imageData que puede ser usada por el canvas.
                    for (var y = 0; y < Height; ++y) { 
                        for (var x = 0; x < Width; ++x) {

                            var index1 = (x + Width * (Height - y)) * 4;
                            var index2 = x * 3 + (Width*3) * y;
                            data[index1] = bmpdata[index2 + 2];
                            data[index1 + 1] = bmpdata[index2 + 1];
                            data[index1 + 2] = bmpdata[index2];
                            data[index1 + 3] = 255;

                        }
                    }

                } else if (bitmap.infoheader.biBitCount == 8) {
                    // se recorre el arreglo de indices reemplazando los indices por el color indexado en la paleta y almacenandolo en la estructura imageData que puede ser usada por el canvas.
                    var cont=0;

                    for (var y = 0; y < Height; ++y) { 
                        for (var x = 0; x < Width; ++x) {

                            var index1 = (x + Width * (Height - y)) * 4;
                            var index2 = bmpdata[cont];
                            cont++;

                            data[index1] = palette[index2*4 + 2]; // el R
                            data[index1 + 1] = palette[index2*4 + 1];// el G
                            data[index1 + 2] = palette[index2*4]; // el B
                            data[index1 + 3] = 255; // el alfa

                        }
                    }

                } else {
                    // Para 4 y 1 bit, se recorre el arreglo de indices reemplazando los indices por el color indexado en la paleta y almacenandolo en la estructura imageData que puede ser usada por el canvas.
                    var cont=0;
                    var bmpdata = bitmap.pixels2;
                    for (var y = 0; y < Height; ++y) { 
                        for (var x = 0; x < Width; ++x) {

                            var index1 = (x + Width * (Height - y)) * 4;
                            var index2 = bmpdata[cont];
                            cont++;

                            data[index1] = palette[index2*4 + 2]; // el R
                            data[index1 + 1] = palette[index2*4 + 1];// el G
                            data[index1 + 2] = palette[index2*4]; // el B
                            data[index1 + 3] = 255; // el alfa

                        }
                    }

                } 

                return imageData;
            }
//  ------------------------------------------------------------------------------
            function resizeCanvas(width, height) { 
            // se cambia el tamaño del canvas dependiendo del tamaño de la imagen.
                canvas1.width = width;
                canvas1.height = height;
            }
//  ------------------------------------------------------------------------------
            function dec2bin(dec){
            //Transoformar la cadena de bits que leemos de a 8bits a solo gran string para poder manejarlo facilmente en el caso de 1 y 4bits.
                return (dec >>> 0).toString(2);
            }
//  ------------------------------------------------------------------------------
            function findtheindex(bit) {
            // buscar los verdaderos valores de los indices.
                var aux = [];
                var cont = 0;
                var bin;

               for(var x=0; x < bitmap.pixels.length ; x++){

                    bin = dec2bin(bitmap.pixels[x]);
                    var size = bin.length; 

                    if (size < 8){
                    var zeros = 8 - size;
                        for(var y=0; y < zeros; y++) 
                            bin = "0" + bin;
                    }

                    if (bit == 4) {
                        aux[cont] = parseInt(bin.slice(0,4),2);
                        aux[cont + 1] = parseInt(bin.slice(4,8),2);
                        cont= cont + 2;

                    } else {
                        aux[cont] = parseInt(bin.slice(0,1),2);
                        aux[cont + 1] = parseInt(bin.slice(1,2),2);
                        aux[cont + 2] = parseInt(bin.slice(2,3),2);
                        aux[cont + 3] = parseInt(bin.slice(3,4),2);
                        aux[cont + 4] = parseInt(bin.slice(4,5),2);
                        aux[cont + 5] = parseInt(bin.slice(5,6),2);
                        aux[cont + 6] = parseInt(bin.slice(6,7),2);
                        aux[cont + 7] = parseInt(bin.slice(7,8),2);
                        cont = cont + 8;
                    }

                }

                return aux;
            }
//  ------------------------------------------------------------------------------
            function transform() {
            // Se elige la funcion de transformacion a usar, segun la escogida por el usuario.
                var option = document.getElementById("selection").value;

                if(option=="negativo"){
                    negative();
                } else if (option=="rotacw") {
                    rotatecw();
                }else if (option=="rotaccw") {
                    rotatecw();
                    mirrorh();
                    mirrorv();
                }else if (option=="espejoh") {
                    mirrorh();
                }else if (option=="espejov") {
                    mirrorv();
                }

                var imageData = convertToImageData(); 
                ctx1.putImageData(imageData, 0, 0);
                        fillHist();
            }
//  ------------------------------------------------------------------------------
            function negative () {
            // Se transforman todos los colores a su respectivo negativo.
                if(bitmap.infoheader.biBitCount == 24) {
                    for(var x=0; x<bitmap.pixels.length;x++) {
                        bitmap.pixels[x] = 255 - bitmap.pixels[x];
                    }
                } else {
                    for(var x=0; x<bitmap.palette.length;x++) {
                        bitmap.palette[x] = 255 - bitmap.palette[x];
                    }
                }
            }
//  ------------------------------------------------------------------------------
            function mirrorh () {
            // Se hace un espejo horizontal para 24,8,4 y 1 bit.

                var Height = bitmap.infoheader.biHeight;
                var Width = bitmap.infoheader.biWidth;

                if(bitmap.infoheader.biBitCount == 24) {

                    var aux = bitmap.pixels.slice();

                    for (var y = 0; y < Height; ++y) { 
                        for (var x = 0; x < Width; ++x) {

                            var index1 = (x + Width * (Height - y)) * 3;
                            var index2 = x * 3 + (Width * 3) * y;

                            aux[index1] = bitmap.pixels[index2];
                            aux[index1 + 1] = bitmap.pixels[index2 + 1];
                            aux[index1 + 2] = bitmap.pixels[index2 + 2];
                        }
                    }

                    bitmap.pixels = aux;

                } else if (bitmap.infoheader.biBitCount == 8) {

                    var aux = bitmap.pixels.slice();

                    for (var y = 0; y < Height; ++y) { 
                        for (var x = 0; x < Width; ++x) {

                            var index1 = (x + Width * (Height - y));
                            var index2 = x + Width * y;

                            aux[index1] = bitmap.pixels[index2];
                        }
                    }

                    bitmap.pixels = aux;

                } else {

                    var aux = bitmap.pixels2.slice();

                    for (var y = 0; y < Height; ++y) { 
                        for (var x = 0; x < Width; ++x) {

                            var index1 = (x + Width * (Height - y));
                            var index2 = x + Width * y;

                            aux[index1] = bitmap.pixels2[index2];
                        }
                    }

                    bitmap.pixels2 = aux;
                }
            }
//  ------------------------------------------------------------------------------
            function mirrorv () {
            // Se hace un espejo  vertical para 24,8,4 y 1 bit.
                var Height = bitmap.infoheader.biHeight;
                var Width = bitmap.infoheader.biWidth;

                if(bitmap.infoheader.biBitCount == 24) {

                    var aux = bitmap.pixels.slice();

                    for (var y = 0; y < Height; ++y) { 
                        for (var x = 0; x < Width; ++x) {

                            var index1 = x * 3 + (Width * 3) * y;
                            var index2 = (((Width * 3) - 1) - (x * 3) ) + (Width * 3) * y;

                            aux[index1] = bitmap.pixels[index2 - 2];  // B 
                            aux[index1 + 1] = bitmap.pixels[index2 - 1]; // G
                            aux[index1 + 2] = bitmap.pixels[index2]; // R
                        }
                    }

                    bitmap.pixels = aux;

                }else if (bitmap.infoheader.biBitCount == 8) {

                    var aux = bitmap.pixels.slice();

                    for (var y = 0; y < Height; ++y) { 
                        for (var x = 0; x < Width; ++x) {

                            var index1 = x + Width * y;
                            var index2 = ((Width - 1) - x ) + Width * y;

                            aux[index1] = bitmap.pixels[index2]; 
                        }
                    }

                    bitmap.pixels = aux;

                } else {

                    var aux = bitmap.pixels2.slice();

                    for (var y = 0; y < Height; ++y) { 
                        for (var x = 0; x < Width; ++x) {

                            var index1 = x + Width * y;
                            var index2 = ((Width - 1) - x) + Width * y;

                            aux[index1] = bitmap.pixels2[index2]; 
                        }
                    }

                    bitmap.pixels2 = aux;

                }
            }
//  ------------------------------------------------------------------------------
            function rotatecw() {
            // Se rota en sentido a las agujas del reloj para 24,8,4 y 1 bit.
                var Height = bitmap.infoheader.biHeight;
                var Width = bitmap.infoheader.biWidth;

                if(bitmap.infoheader.biBitCount == 24) {

                    var aux = bitmap.pixels.slice();
                    var cont = 0;

                    for (var y = 0; y < Width; ++y) { 
                        for (var x = 0; x < Height; ++x) {

                            var index1 = y * 3 + (Width * 3) * x;

                            aux[cont] = bitmap.pixels[index1];  // B
                            aux[cont + 1] = bitmap.pixels[index1 + 1]; // G
                            aux[cont + 2] = bitmap.pixels[index1 + 2]; // R
                            cont = cont + 3;

                        }
                    }
                    bitmap.pixels = aux;

                } else if (bitmap.infoheader.biBitCount == 8) {

                    var aux = bitmap.pixels.slice();
                    var cont = 0;

                    for (var y = 0; y < Width; ++y) { 
                        for (var x = 0; x < Height; ++x) {

                            var index1 = y + Width * x;
                            aux[cont] = bitmap.pixels[index1]; 
                            cont++;

                        }
                    }
                    bitmap.pixels = aux;

                } else {

                    var aux = bitmap.pixels2.slice();
                    var cont = 0;

                    for (var y = 0; y < Width; ++y) { 
                        for (var x = 0; x < Height; ++x) {

                            var index1 = y + Width * x;
                            aux[cont] = bitmap.pixels2[index1]; 
                            cont++;
                        
                        }
                    }
                    bitmap.pixels2 = aux;

                }

                // se actualizan los valores.

                bitmap.infoheader.biHeight = Width;
                bitmap.infoheader.biWidth =  Height;

                 mirrorh(); // esto es debido a que la data que teniamos estaba volteada.
                resizeCanvas(bitmap.infoheader.biWidth,bitmap.infoheader.biHeight); 
            }
            
            function fillHist(){			
		var trace1 ={
			x: x1,
			y: y1,
			type: 'scatter',
			line: {
				color: 'rgb(0,0,255)'
			}
		};
		
		var trace2 ={
			x: x1,
			y: y2,
			type: 'scatter',
			line: {
			            color: 'rgb(0,255,0)'
			}
		};
		
		var trace3 ={
			x: x1,
			y: y3,
			type: 'scatter',
			line: {
				color: 'rgb(255,0,0)'
			}
		};
		
		var data = [trace1, trace2, trace3];
		Plotly.newPlot(hist, data);
	}

