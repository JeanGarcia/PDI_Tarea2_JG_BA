// Create by Jean Garcia

var x1 = [];
var b = [];
var g = [];
var r = [];
var save = [];
var indx=0;

for(var i = 0; i < 256; i++){
    x1.push(i);
    b.push(0); g.push(0);r.push(0);
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
// var inputElement = document.getElementById("negative");
// inputElement.addEventListener("click", negative , false);


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
                var npadding, resto, cont=0, cont2=0;
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

                var start = bitmap.fileheader.bfOffBits, NumbClr = bitmap.infoheader.biClrUsed, off= 54;

                bitmap.palette = new Uint8Array(buffer,(bitmap.fileheader.bfOffBits-(NumbClr*4)), NumbClr*4);

                if (bitmap.infoheader.biBitCount == 24) { // EN 24 BITS - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                    cont=0, cont2=0;
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
                    cont=0, cont2=0;
                    npadding = (bitmap.infoheader.biWidth) % 4;

                    if(npadding > 0) { // CON PADDDING!.
                        alert("8 bits con padding");
                        resto = 4-npadding;
                        
                        var Indc = [];
                        
                        for (var y = 0; y < bitmap.infoheader.biHeight; y++) { 
                            for (var x = 0; x < bitmap.infoheader.biWidth; x++) {
                                Indc[cont] = datav.getUint8(start + cont2,true);
                                cont++;
                                cont2++;
                            }
                            cont2 = cont2 + resto;
                        }
                        
                        bitmap.pixels = new Uint8Array (bitmap.infoheader.biHeight * bitmap.infoheader.biWidth*3);
                        for(var i = 0; i<bitmap.infoheader.biHeight; i++){
                            for(var j = 0; j<bitmap.infoheader.biWidth; j++){
                                bitmap.pixels[((i*bitmap.infoheader.biWidth)+j)*3] = bitmap.palette[Indc[((i*bitmap.infoheader.biWidth)+j)]*4];
                                bitmap.pixels[((i*bitmap.infoheader.biWidth)+j)*3+1] = bitmap.palette[Indc[((i*bitmap.infoheader.biWidth)+j)]*4+1];
                                bitmap.pixels[((i*bitmap.infoheader.biWidth)+j)*3+2] = bitmap.palette[Indc[((i*bitmap.infoheader.biWidth)+j)]*4+2];
                            }
                        }
                    } else {
                        alert("8 bits sin padding");
                        var Indc = new Uint8Array(buffer, start); // SIN PADDING!!!.
                        bitmap.pixels = new Uint8Array (bitmap.infoheader.biHeight * bitmap.infoheader.biWidth*3);
                        for(var i = 0; i<bitmap.infoheader.biHeight; i++){
                            for(var j = 0; j<bitmap.infoheader.biWidth; j++){
                                bitmap.pixels[((i*bitmap.infoheader.biWidth)+j)*3] = bitmap.palette[Indc[((i*bitmap.infoheader.biWidth)+j)]*4];
                                bitmap.pixels[((i*bitmap.infoheader.biWidth)+j)*3+1] = bitmap.palette[Indc[((i*bitmap.infoheader.biWidth)+j)]*4+1];
                                bitmap.pixels[((i*bitmap.infoheader.biWidth)+j)*3+2] = bitmap.palette[Indc[((i*bitmap.infoheader.biWidth)+j)]*4+2];
                            }
                        }
                    }
                    bitmap.infoheader.biBitCount = 24;

                } else if(bitmap.infoheader.biBitCount == 4) { // PADDING EN 4 BITS  - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                    cont=0, cont2=0;
                    var Indc = new Uint8Array(buffer, start);
                    bitmap.pixels = new Uint8Array (bitmap.infoheader.biHeight * bitmap.infoheader.biWidth*3);
                    
                    if(((bitmap.infoheader.biWidth*bitmap.infoheader.biBitCount)%32) == 0){//NO PADDING
                        alert("4 bits sin padding");
                        for(var i = 0; i<bitmap.infoheader.biHeight; i++){
                            for(var j = 0; j<bitmap.infoheader.biWidth; j++){
                                ep4to24(Indc[cont2], i, j, bitmap.infoheader.biWidth);
                                cont2++;
                            }
                        }
                        
                    }else{
                        var RD = bitmap.infoheader.biWidth*4;
                        var M32 = 32*((RD/32)+1);
                        var PD  = M32 - RD;
                        var ByteF = Math.floor(RD/8);
                        var ByteP = Math.floor(PD/8);
                        
                        //var Indc = new Uint8Array(buffer, start);
                        /*var Indc2 = new Uint8Array(buffer, start);
                        var Indc = [];
                        
                        for (var y = 0; y < bitmap.infoheader.biHeight; y++) { 
                            for (var x = 0; x < bitmap.infoheader.biWidth; x++) {
                                Indc[cont] = Indc2[cont2];
                                cont++;
                                cont2++;
                            }
                            cont2 = cont2 + ByteP;  
                        }*/
                        
                        console.log(ByteF); console.log(ByteP); console.log(ByteF+ByteP);
                        console.log(RD);console.log(PD); console.log(RD+PD);console.log((RD+PD)/8);
                        if((ByteF + ByteP) == (RD + PD)/8){ //EASY PADDING :V
                            alert("4 bits con easy padding!");
                            for(var i = 0; i<bitmap.infoheader.biHeight; i++){
                                for(var j = 0; j<Math.floor(bitmap.infoheader.biWidth); j++){
                                    ep4to24(Indc[cont], i, j, Math.floor(bitmap.infoheader.biWidth));
                                    cont++;
                                }
                                cont += ByteP;
                            }
                        }else{//HARD PADDDING
                            alert("4 bits con HARD PADDING!");
                            for(var i = 0; i<bitmap.infoheader.biHeight; i++){
                                var act = 0;
                                for(var j = 0; j<bitmap.infoheader.biWidth; j++){
                                    act = p4to24(Indc[cont],i,act,0, bitmap.infoheader.biWidth*2);
                                    cont++;
                                }
                                p4to24(Indc[((i*bitmap.infoheader.biWidth)+j)],i, act,1,bitmap.infoheader.biWidth*2);
                            }
                        }
                    }
                    bitmap.infoheader.biBitCount = 24;
                    /*bitmap.pixels = new Uint8Array(buffer, start);
                        bitmap.pixels2 = [];
                        bitmap.pixels2 = findtheindex(bitmap.infoheader.biBitCount); // se busca los indices.*/
                }else if(bitmap.infoheader.biBitCount == 1){
                    cont=0, cont2=0;
                    var Indc = new Uint8Array(buffer, start);
                    bitmap.pixels = new Uint8Array (bitmap.infoheader.biHeight * bitmap.infoheader.biWidth*3);
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
                
                                resetH();
                                filldata();

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

                            b[bmpdata[index2]]++; g[bmpdata[index2 + 1]]++; r[bmpdata[index2 + 2]]++;
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

                            b[palette[index2*4]]++; g[palette[index2*4 + 1]]++; r[palette[index2*4 + 2]]++;
                        }
                    }

                } else {
                    // Para 4 y 1 bit, se recorre el arreglo de indices reemplazando los indices por el color indexado en la paleta y almacenandolo en la estructura imageData que puede ser usada por el canvas.
                    var cont=0;
                    var bmpdata = bitmap.pixels;
                    for (var y = 0; y < Height; ++y) { 
                        for (var x = 0; x < Width; ++x) {

                            var index1 = (x + Width * (Height - y)) * 4;
                            var index2 = bmpdata[cont];
                            cont++;

                            data[index1] = palette[index2*4 + 2]; // el R
                            data[index1 + 1] = palette[index2*4 + 1];// el G
                            data[index1 + 2] = palette[index2*4]; // el B
                            data[index1 + 3] = 255; // el alfa

                            b[palette[index2*4]]++; g[palette[index2*4 + 1]]++; r[palette[index2*4 + 2]]++;
                        }
                    }

                } 

                return imageData;
            }
            
            function ep4to24(B, i, j ,w){
                var mask = 240;

                for(var d=1, l=0; d>=0; d--, l++){
                    var index = ((mask >> 4*l)&B)>>(4*d);
                    bitmap.pixels[((i*w+j)*2+l)*3] = bitmap.palette[index*4];
                    bitmap.pixels[((i*w+j)*2+l)*3+1] = bitmap.palette[index*4+1];
                    bitmap.pixels[((i*w+j)*2+l)*3+2] = bitmap.palette[index*4+2];
                }
            }
            
            function ep1to24(B, i, j, w){
                var mask = 128;
                var l = 0;
                
                for(var d=7; d>=0; d--){
                    var index = ((mask>>l)&B)>>d;
                    bitmap.pixels[((i*w+j)*8+l)*3] = bitmap.paleta[index*3];
                    bitmap.pixels[((i*w+j)*8+l)*3+1] = bitmap.paleta[index*3+1];
                    bitmap.pixels[((i*w+j)*8+l)*3+2] = bitmap.paleta[index*3+1];
                    l++;
                }
            }
            
            function p4to24(B, i, act, topp, w){
                var mask = 240;
                
                for(var d=1, l=0; d>=topp; d--, l++){
                    var index = ((mask>>4*l)&B)>>(4*d);
                    bitmap.pixels[((i*w)+act)*3] = bitmap.palette[index*4];
                    bitmap.pixels[((i*w)+act)*3+1] = bitmap.palette[index*4+1];
                    bitmap.pixels[((i*w)+act)*3+2] = bitmap.palette[index*4+2];
                    act++;
                }
                return act;
            }
            
            function p1to24(B, i, act, topp, w){
                var masks = 128;
                var l = 0;
                
                for(var d=7; d>=topp; d--){
                    var index = ((mask>>l)&B)>>d;
                    bitmap.pixels[((i*w)+act)*3] = bitmap.paleta[index*3];
                    bitmap.pixels[((i*w)+act)*3+1] = bitmap.paleta[index*3+1];
                    bitmap.pixels[((i*w)+act)*3+2] = bitmap.paleta[index*3+2];
                    l++; act++;
                }
                return act;
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
            // function transform() {
            // // Se elige la funcion de transformacion a usar, segun la escogida por el usuario.
            //     var option = document.getElementById("selection").value;

            //     if(option=="negativo"){
            //         negative();
            //     } else if (option=="rotacw") {
            //         rotatecw();
            //     }else if (option=="rotaccw") {
            //         rotatecw();
            //         mirrorh();
            //         mirrorv();
            //     }else if (option=="espejoh") {
            //         mirrorh();
            //     }else if (option=="espejov") {
            //         mirrorv();
            //     }else if(option=="Equal")
            //         equal();

            //     var imageData = convertToImageData(); 
            //     ctx1.putImageData(imageData, 0, 0);
            //     fillHist();
            // }
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

                var imageData = convertToImageData(); 
                ctx1.putImageData(imageData, 0, 0);
                fillHist();

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

                var imageData = convertToImageData(); 
                ctx1.putImageData(imageData, 0, 0);
                fillHist();
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

                var imageData = convertToImageData(); 
                ctx1.putImageData(imageData, 0, 0);
                fillHist();
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

                var imageData = convertToImageData(); 
                ctx1.putImageData(imageData, 0, 0);
                fillHist();
            }

            function equal(){
                var NM = bitmap.infoheader.biWidth*bitmap.infoheader.biHeight;
                var eqB = [];  var eqG = []; var eqR = [];
                eqB[0] = 0; eqG[0] = 0; eqR[0] = 0;
                eqB[255] = 255; eqG[255] = 255; eqR[255] = 255;
                var iAcumB = b[0]; var iAcumG = g[0]; var iAcumR = r[0];
                
                for(var i=1; i<255; i++){
                    eqB[i] = (iAcumB * 255) / NM;
                    iAcumB += b[i];
                    
                    eqG[i] = (iAcumG * 255) / NM;
                    iAcumG += g[i];
                    
                    eqR[i] = (iAcumR * 255) / NM;
                    iAcumR += r[i];
                }
                
                for(var i = 0; i<bitmap.pixels.length/3; i++){
                    bitmap.pixels[i*3] = eqB[bitmap.pixels[i*3]];
                    bitmap.pixels[i*3+1] = eqG[bitmap.pixels[i*3+1]];
                    bitmap.pixels[i*3+2] = eqR[bitmap.pixels[i*3+2]];
                }

                
            }
            
            function fillHist(){
            
                var trace1 ={
                    x: x1,
                    y: b,
                    type: 'scatter',
                    line: {
                        color: 'rgb(0,0,255)'
                    }
                };
                
                var trace2 ={
                    x: x1,
                    y: g,
                    type: 'scatter',
                    line: {
                        color: 'rgb(0,255,0)'
                    }
                };
                
                var trace3 ={
                    x: x1,
                    y: r,
                    type: 'scatter',
                    line: {
                        color: 'rgb(255,0,0)'
                    }
                };
                
                var data = [trace1, trace2, trace3];
                Plotly.newPlot(hist, data);
            }
            
            function resetH(){
                for(var x = 0; x < 256; x++){
                    b[x] = 0; g[x] = 0; r[x] = 0;
                }
                    
            }

            function filldata(){
                $("#DataD").text(" Width: " + bitmap.infoheader.biWidth+"px" +  "\n Height: " + bitmap.infoheader.biHeight+"px");
                $("#DataP").text(bitmap.infoheader.biBitCount);

                if(bitmap.infoheader.biBitCount == 24)
                    $("#DataM").text(((bitmap.infoheader.biWidth * bitmap.infoheader.biHeight * 3) + 54 )/1000000 );
                else if (bitmap.infoheader.biBitCount == 8)
                    $("#DataM").text(((bitmap.infoheader.biWidth * bitmap.infoheader.biHeight) + 54 +  (bitmap.infoheader.biClrUsed * 4))/1000000 );
                else if (bitmap.infoheader.biBitCount == 4)
                    $("#DataM").text((((bitmap.infoheader.biWidth * bitmap.infoheader.biHeight)/2) + 54 +  (bitmap.infoheader.biClrUsed * 4) )/1000000 );
                else
                    $("#DataM").text(((bitmap.infoheader.biWidth * bitmap.infoheader.biHeight/8) + 54 + (bitmap.infoheader.biClrUsed * 4) )/1000000 );

                $("#DataN").text(bitmap.infoheader.biClrUsed);
            }