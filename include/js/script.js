// Create by Jean Garcia and Brayhan Villalba

var x1 = [];
var b = [];
var g = [];
var r = [];
var save = [];
var bitmap = {}; // los datos de la imagen.
var activo = {};


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



//  --------------------------------FUNCIONES ----------------------------------------------
            function handleFiles(e) { // Se abre el archivo.
                var file = e.target.files[0];
                var reader = new FileReader();
                reader.addEventListener("load", processimage, false);
                reader.readAsArrayBuffer(file);
            }
//  ------------------------------------------------------------------------------
            function processimage(e) { // se almacena el contenido del archivo en un buffer para procesarlo, obtener el mapa, y convertirlo a imagen.
                var buffer = e.target.result;
                getBMP(buffer);
                var imageData = convertToImageData();
                ctx1.putImageData(imageData, 0, 0);
                fillHist();
            }
//  ------------------------------------------------------------------------------
            function getBMP(buffer) { // se obtiene el mapa de bits de la imagen .
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

                bitmap.zoom = {}; // datos para controlar el ZOOM
                activo.zoom = 0; 
                activo.rotate = 0;


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

                 } else if(bitmap.infoheader.biBitCount == 4) { // PADDING EN 4 BITS  - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                    cont=0, cont2=0;
                    var Indc = new Uint8Array(buffer, start);
                    bitmap.pixels = new Uint8Array (bitmap.infoheader.biHeight * bitmap.infoheader.biWidth*3);
                    
                    if(((bitmap.infoheader.biWidth*bitmap.infoheader.biBitCount)%32) == 0){//NO PADDING

                        for(var i = 0; i<bitmap.infoheader.biHeight; i++){
                            for(var j = 0; j<bitmap.infoheader.biWidth/2; j++){
                                ep4to24(Indc[cont2], i, j, Math.floor(bitmap.infoheader.biWidth/2));
                                cont2++;
                            }
                        }
                        
                    }else{
                        var RD = bitmap.infoheader.biWidth*4;
                        var M32 = 32*(Math.floor(RD/32)+1);
                        var PD  = M32 - RD;
                        var ByteF = Math.floor(RD/8);
                        var ByteP = Math.floor(PD/8);
                        var cont = 0;

                        if((ByteF + ByteP) == (RD + PD)/8){ //EASY PADDING :V

                            for(var i = 0; i<bitmap.infoheader.biHeight; i++){
                                for(var j = 0; j<bitmap.infoheader.biWidth/2; j++){
                                    ep4to24(Indc[cont], i, j, Math.floor(bitmap.infoheader.biWidth/2));
                                    cont++;
                                }
                                cont += ByteP;
                            }
                        }else{//HARD PADDDING

                            for(var i = 0; i<bitmap.infoheader.biHeight; i++){
                                var act = 0;
                                for(var j = 0; j<bitmap.infoheader.biWidth/2; j++){
                                    act = p4to24(Indc[cont],i,act,0, bitmap.infoheader.biWidth);
                                    cont++;
                                }
                                p4to24(Indc[cont],i, act,1,bitmap.infoheader.biWidth);
                                cont += ByteP;
                            }
                        }
                    }

                }else if(bitmap.infoheader.biBitCount == 1){
                    cont=0, cont2=0;
                    var Indc = new Uint8Array(buffer, start);
                    bitmap.pixels = new Uint8Array (bitmap.infoheader.biHeight * bitmap.infoheader.biWidth*8);

                    if(((bitmap.infoheader.biWidth*bitmap.infoheader.biBitCount)%32) == 0){//NO PADDING

                        for(var i = 0; i<bitmap.infoheader.biHeight; i++){
                            for(var j = 0; j<bitmap.infoheader.biWidth/8; j++){
                                ep1to24(Indc[cont2], i, j, bitmap.infoheader.biWidth/8);
                                cont2++;
                            }
                        }
                        
                    }else{
                        var RD = bitmap.infoheader.biWidth;
                        var M32 = 32*(Math.floor(RD/32)+1);
                        var PD  = M32 - RD;
                        var ByteF = Math.floor(RD/8);
                        var ByteP = Math.floor(PD/8);
                        
                        if((ByteF + ByteP) == (RD + PD)/8){ //EASY PADDING :V
                            for(var i = 0; i<bitmap.infoheader.biHeight; i++){
                                for(var j = 0; j<bitmap.infoheader.biWidth/8; j++){
                                    ep1to24(Indc[cont], i, j, Math.floor(bitmap.infoheader.biWidth/8));
                                    cont++;
                                }
                                cont += ByteP;
                            }
                        }else{//HARD PADDDING

                            for(var i = 0; i<bitmap.infoheader.biHeight; i++){
                                var act = 0;
                                for(var j = 0; j<bitmap.infoheader.biWidth/8; j++){
                                    act = p1to24(Indc[cont],i,act,0, bitmap.infoheader.biWidth);
                                    cont++;
                                }
                                p1to24(Indc[cont],i, act,1,bitmap.infoheader.biWidth);
                                cont += ByteP;
                            }
                        }
                    }
                }

                save = Array.from(bitmap.pixels);
                activo.width = bitmap.infoheader.biWidth;
                activo.height = bitmap.infoheader.biHeight;

                
                resizeCanvas(bitmap.infoheader.biWidth,bitmap.infoheader.biHeight);
            }
//  ------------------------------------------------------------------------------
            function convertToImageData() { // el mapa de bit se convierte en imagen.
                if(activo.zoom != 0) { // HAY ZOOM (Puede o no contener Rotaciones)
                    var Width = bitmap.zoom.width;
                    var Height = bitmap.zoom.height;
                    var imageData = ctx.createImageData(Width, Height);
                    var data = imageData.data;
                    var bmpdata = bitmap.zoom.pixels;
                } else{
                    var Width = activo.width;
                    var Height = activo.height;
                    var imageData = ctx.createImageData(Width, Height);
                    var data = imageData.data;
                    var bmpdata = save;
                }

                resetH();

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


                    for (var y = 0; y < activo.height; ++y) {   // llenar los valores del histograma
                        for (var x = 0; x < activo.width; ++x) {

                            var index1 = (x + activo.width * (activo.height - y)) * 4;
                            var index2 = x * 3 + (activo.width*3) * y;

                             b[truncates(save[index2])]++; g[truncates(save[index2 + 1])]++; r[truncates(save[index2 + 2])]++;
                        }
                    }
                
                
                fillHist();
                filldata();

                return imageData;
            }
//  ------------------------------------------------------------------------------
            function ep4to24(B, i, j ,w){ // Pasar de 4 a 24 bits con un padding facil :v 
                var mask = 240;

                for(var d=1, l=0; d>=0; d--, l++){
                    var index = ((mask >> (4*l))&B)>>(4*d);
                    bitmap.pixels[((i*w+j)*2+l)*3] = bitmap.palette[index*4];
                    bitmap.pixels[((i*w+j)*2+l)*3+1] = bitmap.palette[index*4+1];
                    bitmap.pixels[((i*w+j)*2+l)*3+2] = bitmap.palette[index*4+2];
                }
            }
//  ------------------------------------------------------------------------------
            function ep1to24(B, i, j, w){ // Pasar de 1 a 24 bits con un padding facil :v
                var mask = 128;
                var l = 0;
                
                for(var d=7; d>=0; d--){
                    var index = ((mask>>l)&B)>>d;
                    bitmap.pixels[((i*w+j)*8+l)*3] = bitmap.palette[index*4];
                    bitmap.pixels[((i*w+j)*8+l)*3+1] = bitmap.palette[index*4+1];
                    bitmap.pixels[((i*w+j)*8+l)*3+2] = bitmap.palette[index*4+2];
                    l++;
                }
            }
//  ------------------------------------------------------------------------------
            function p4to24(B, i, act, topp, w){ // Pasar de 4 a 24 bits con un padding dificl :C 
                var mask = 240;
                
                for(var d=1, l=0; d>=topp; d--, l++){
                    var index = ((mask>>(4*l))&B)>>(4*d);
                    bitmap.pixels[((i*w)+act)*3] = bitmap.palette[index*4];
                    bitmap.pixels[((i*w)+act)*3+1] = bitmap.palette[index*4+1];
                    bitmap.pixels[((i*w)+act)*3+2] = bitmap.palette[index*4+2];
                    act++;
                }
                return act;
            }
//  ------------------------------------------------------------------------------
            function p1to24(B, i, act, topp, w){ // Pasar de 1 a 24 bits con un padding dificl :C 
                var mask = 128;
                var l = 0;
                
                for(var d=7; d>=topp; d--){
                    var index = ((mask>>l)&B)>>d;
                    bitmap.pixels[((i*w)+act)*3] = bitmap.palette[index*4];
                    bitmap.pixels[((i*w)+act)*3+1] = bitmap.palette[index*4+1];
                    bitmap.pixels[((i*w)+act)*3+2] = bitmap.palette[index*4+2];
                    l++; act++;
                }
                return act;
            }
//  ------------------------------------------------------------------------------
            function resizeCanvas(width, height) { // se cambia el tamaño del canvas dependiendo del tamaño de la imagen.
                canvas1.width = width;
                canvas1.height = height;
            }
//  ------------------------------------------------------------------------------
            function dec2bin(dec){ //Transoformar la cadena de bits que leemos de a 8bits a solo gran string para poder manejarlo facilmente en el caso de 1 y 4bits.
                return (dec >>> 0).toString(2);
            }
//  ------------------------------------------------------------------------------
            function findtheindex(bit) { // buscar los verdaderos valores de los indices.
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
            function negative () { // Se transforman todos los colores a su respectivo negativo.
                if(bitmap.infoheader.biBitCount == 24) {
                    for(var x=0; x<bitmap.pixels.length;x++) {
                        save[x] = 255 - save[x];
                    }
                } else {
                    for(var x=0; x<bitmap.palette.length;x++) {
                        bitmap.palette[x] = 255 - bitmap.palette[x];
                    }
                }
                if (activo.zoom != 0) {
                    if($('#bilinear:checked').val()=='billie'){zoomB();}else{ zoomNN();}
                }else {
                    var imageData = convertToImageData(); 
                    ctx1.putImageData(imageData, 0, 0);
                }

            }
//  ------------------------------------------------------------------------------
            function mirrorh () { // Se hace un espejo horizontal

                var Height = activo.height;
                var Width = activo.width;

                var aux = new Array (activo.width * activo.height * 3);

                for (var y = 0; y < Height; ++y) { 
                    for (var x = 0; x < Width; ++x) {

                        var index1 = (x + Width * (Height - y)) * 3;
                        var index2 = x * 3 + (Width * 3) * y;

                        aux[index1] = save[index2];
                        aux[index1 + 1] = save[index2 + 1];
                        aux[index1 + 2] = save[index2 + 2];
                    }
                }

                save = aux;

                if (activo.zoom != 0) {
                    if($('#bilinear:checked').val()=='billie'){zoomB();}else{ zoomNN();}
                }else {
                    var imageData = convertToImageData(); 
                    ctx1.putImageData(imageData, 0, 0);
                }

            }
//  ------------------------------------------------------------------------------
            function mirrorv () { // Se hace un espejo  vertical 
                var Height = activo.height;
                var Width = activo.width;

                var aux = new Array (activo.width * activo.height * 3);

                for (var y = 0; y < Height; ++y) { 
                    for (var x = 0; x < Width; ++x) {

                        var index1 = x * 3 + (Width * 3) * y;
                        var index2 = (((Width * 3) - 1) - (x * 3) ) + (Width * 3) * y;

                        aux[index1] = save[index2 - 2];  // B 
                        aux[index1 + 1] = save[index2 - 1]; // G
                        aux[index1 + 2] = save[index2]; // R
                    }
                }

                save = aux;

                if (activo.zoom != 0) {
                    if($('#bilinear:checked').val()=='billie'){zoomB();}else{ zoomNN();}
                }else {
                    var imageData = convertToImageData(); 
                    ctx1.putImageData(imageData, 0, 0);
                }
            }
//  ------------------------------------------------------------------------------
            function equal(){ // Ecualizacion de la imagen 

                save = Array.from(bitmap.pixels);
                activo.width = bitmap.infoheader.biWidth;
                activo.height = bitmap.infoheader.biHeight;

                resetH();

                var aux = new Array (activo.width*activo.height*3);

                    for (var y = 0; y < bitmap.activo.height; ++y) {   // llenar los valores del histograma
                        for (var x = 0; x < activo.width; ++x) {

                            var index1 = (x + activo.width * (activo.height - y)) * 4;
                            var index2 = x * 3 + (activo.width*3) * y;

                             b[truncates(save[index2])]++; g[truncates(save[index2 + 1])]++; r[truncates(save[index2 + 2])]++;
                        }
                    }

                var NM = activo.width*activo.height;
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
                
                var tam = save.length/3;

                for(var i = 0; i<tam; i++){
                    aux[i*3] = eqB[save[i*3]];
                    aux[i*3+1] = eqG[save[i*3+1]];
                    aux[i*3+2] = eqR[save[i*3+2]];
                }

                save= aux;

                if (activo.zoom != 0) {
                    if($('#bilinear:checked').val()=='billie'){zoomB();}else{ zoomNN();}
                }else {
                    var imageData = convertToImageData(); 
                    ctx1.putImageData(imageData, 0, 0);
                }


            }
//  ------------------------------------------------------------------------------
            function umbral(){ // Aplica umbralizacion a la imagen 

                var umbral = parseInt($("#umax").val());

                if(umbral<0 || umbral > 255 )
                    {alert ("por favor introduce un número entre 0 y 255, 0 para resetear"); return 0;}

                save = Array.from(bitmap.pixels);
                activo.width = bitmap.infoheader.biWidth;
                activo.height = bitmap.infoheader.biHeight;

                var aux = new Array (activo.width * activo.height * 3);
                var tam = save.length/3;

                for(var i=0; i<tam; i++){
                    var val2 = (save[i*3] + save[i*3+1] + save[i*3+1])/3;
                    if(val2 > parseInt(umbral))
                        val2 = 255;
                    else 
                        val2 = 0;
                    aux[i*3] = val2;
                    aux[i*3+1] = val2;
                    aux[i*3+2] = val2;
                }

                save = aux;

                if (activo.zoom != 0) {
                    if($('#bilinear:checked').val()=='billie'){zoomB();}else{ zoomNN();}
                }else {
                    var imageData = convertToImageData(); 
                    ctx1.putImageData(imageData, 0, 0);
                }

            }
//  ------------------------------------------------------------------------------
            function brightness(){ // Altera la luz de la imagen
                var light = parseInt($("#light").val());

                if(light<-255 || light > 255 )
                    {alert ("por favor introduce un número entre -255 y 255, 0 para resetear"); return 0; }

                save = Array.from(bitmap.pixels);
                activo.width = bitmap.infoheader.biWidth;
                activo.height = bitmap.infoheader.biHeight;

                var aux = new Array (activo.width*bitmap.activo.height*3);
                var tam = save.length;
                for(var i=0; i<tam; i++){
                    aux[i] = save[i] + light;
                }

                save = aux;

                if (activo.zoom != 0) {
                    if($('#bilinear:checked').val()=='billie'){zoomB();}else{ zoomNN();}
                }else {
                    var imageData = convertToImageData(); 
                    ctx1.putImageData(imageData, 0, 0);
                }
           

            }
//  ------------------------------------------------------------------------------
            function contrast(){ // Cambia el contraste de la imagen

                var contrast = parseFloat($("#contrast").val());
                if(contrast<0 || contrast > 999 )
                    {alert ("por favor introduce un número entre 0 y 999, 1 para resetear"); return 0; }

                save = Array.from(bitmap.pixels);
                activo.width = bitmap.infoheader.biWidth;
                activo.height = bitmap.infoheader.biHeight;

                var aux = new Array (activo.width*activo.height*3);
                var tam = save.length;
                for(var i=0; i<tam; i++){
                    aux[i] = Math.round((contrast * (save[i] - 128)) + 128);
                }

                save = aux;
            
                if (activo.zoom != 0) {
                    if($('#bilinear:checked').val()=='billie'){zoomB();}else{ zoomNN();}
                }else {
                    var imageData = convertToImageData(); 
                    ctx1.putImageData(imageData, 0, 0);
                }

            }
//  ------------------------------------------------------------------------------
            function truncates(num){ // los valores se mantengan entre cero y 255 
                if(num > 255)
                    return 255;
                else if(num < 0)
                    return 0;
                return num;
            }
//  ------------------------------------------------------------------------------
            function fillHist(){ // Representa el histograma en la interfaz 
            
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
//  ------------------------------------------------------------------------------
            function resetH(){// Resetea los valores del histograma 
                for(var x = 0; x < 256; x++){
                    b[x] = 0; g[x] = 0; r[x] = 0;
                }        
            }
//  ------------------------------------------------------------------------------
            function filldata(){// rellena los detalles de la imagen en la interfaz 
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
//  ------------------------------------------------------------------------------
            function scaleNN() { // escalado con los vecinos mas cercanos

                var oheight =activo.height;
                var owidth = activo.width;
                var nheight = parseInt($("#Sheight").val());
                var nwidth = parseInt($("#Swidth").val());

                if (nheight == 0 || nwidth == 0) {
                    alert("no puede escalar a cero, introduzca otro valor");
                    return 0;
                }


                save = Array.from(bitmap.pixels);
                activo.width = bitmap.infoheader.biWidth;
                activo.height = bitmap.infoheader.biHeight;

                var aux = new Array (nheight * nwidth * 3);

                var x_ratio = owidth/nwidth;
                var y_ratio = oheight/nheight;
                var px, py;

                for(var i=0; i<nheight; i++) {
                    for(var j=0; j<nwidth; j++){

                        px = Math.floor(j*x_ratio);
                        py = Math.floor(i*y_ratio);

                        aux[(i*nwidth*3)+j*3] = save[(py*owidth*3)+px*3]; 
                        aux[(i*nwidth*3)+ 3*j + 1] = save[(py*owidth*3)+ 3*px + 1]; 
                        aux[(i*nwidth*3)+ 3*j + 2] = save[(py*owidth*3)+ 3*px + 2]; 

                    }
                }

                save = aux;

                activo.width = nwidth;
                activo.height = nheight; 
                resizeCanvas(activo.width,activo.height); 

                if (activo.zoom != 0) {
                    if($('#bilinear:checked').val()=='billie'){zoomB();}else{ zoomNN();}
                }else {
                    var imageData = convertToImageData(); 
                    ctx1.putImageData(imageData, 0, 0);
                }

            }
//  ------------------------------------------------------------------------------
            function scaleB(){ // escalado con bilinear

                var oheight = activo.height;
                var owidth = activo.width;
                var nheight = parseInt($("#Sheight").val());
                var nwidth = parseInt($("#Swidth").val());

                if (nheight == 0 || nwidth == 0) {
                    alert("no puede escalar a cero, introduzca otro valor");
                    return 0;
                }

                save = Array.from(bitmap.pixels);
                activo.width = bitmap.infoheader.biWidth;
                activo.height = bitmap.infoheader.biHeight;

                var x, y, indexa, indexb, indexc, indexd, x_diff, y_diff, offset=0;
                var x_ratio = (owidth-1)/nwidth;
                var y_ratio = (oheight-1)/nheight; 

                var aux = new Array (nheight * nwidth * 3);

                for(var i=0; i<nheight; i++){
                    for(var j=0; j<nwidth; j++){

                        x = parseInt(x_ratio * j);
                        y = parseInt(y_ratio * i);
                        x_diff = (x_ratio * j) - x;
                        y_diff = (y_ratio * i) - y;

                        indexa = (y * owidth * 3 + x * 3);
                        indexb = (indexa + 3);
                        indexc = (indexa + owidth * 3);
                        indexd = (indexc + 3);

                        // Y = A(1-w)(1-h) + B(w)(1-h) + C(h)(1-w) + D(wh)
                        aux[offset] = save[indexa]*(1-x_diff)*(1-y_diff) + save[indexb]*(x_diff)*(1-y_diff) + save[indexc]*(y_diff)*(1-x_diff) + save[indexd]*(x_diff*y_diff);

                        aux[offset+1] = save[indexa+1]*(1-x_diff)*(1-y_diff) + save[indexb+1]*(x_diff)*(1-y_diff) + save[indexc+1]*(y_diff)*(1-x_diff) + save[indexd+1]*(x_diff*y_diff);

                        aux[offset+2] = save[indexa+2]*(1-x_diff)*(1-y_diff) + save[indexb+2]*(x_diff)*(1-y_diff) + save[indexc+2]*(y_diff)*(1-x_diff) + save[indexd+2]*(x_diff*y_diff);

                        offset = offset + 3;
                    }
                }

                save = aux;


                resizeCanvas(activo.width,activo.height); 

                if (activo.zoom != 0) {
                    if($('#bilinear:checked').val()=='billie'){zoomB();}else{ zoomNN();}
                }else {
                    var imageData = convertToImageData(); 
                    ctx1.putImageData(imageData, 0, 0);
                }

            }
//  ------------------------------------------------------------------------------
            function zoomNN (op) { // zoom con vecinos

                var oheight = activo.height;
                var owidth = activo.width;

                if(op == 1){ // Se desea un Zoom In
                    activo.zoom ++ ;
                } else if (op == 2) { // Se desea un Zoom Out
                    if(activo.zoom == -3){
                        alert("no puedes reducir al 0%, si quieres apartar esta imagen de tu vista prueba escogiendo otra.");
                        return 0 
                    }
                    activo.zoom --;
                } 

                var nheight = Math.floor(parseInt(oheight) + parseInt(oheight * 0.25  * activo.zoom));
                var nwidth = Math.floor(parseInt(owidth) + parseInt(owidth * 0.25  * activo.zoom));

                bitmap.zoom.pixels = new Array (nheight * nwidth * 3);

                var x_ratio = owidth/nwidth;
                var y_ratio = oheight/nheight;
                var px, py;

                for(var i=0; i<nheight; i++) {
                    for(var j=0; j<nwidth; j++){

                        px = Math.floor(j*x_ratio);
                        py = Math.floor(i*y_ratio);

                        bitmap.zoom.pixels[(i*nwidth*3)+j*3] = save[(py*owidth*3)+px*3]; 
                        bitmap.zoom.pixels[(i*nwidth*3)+ 3*j + 1] = save[(py*owidth*3)+ 3*px + 1]; 
                        bitmap.zoom.pixels[(i*nwidth*3)+ 3*j + 2] = save[(py*owidth*3)+ 3*px + 2]; 

                    }
                }

                bitmap.zoom.width = nwidth;
                bitmap.zoom.height = nheight; 
                resizeCanvas(bitmap.zoom.width,bitmap.zoom.height); 

                var imageData = convertToImageData(); 
                ctx1.putImageData(imageData, 0, 0);
            }
//  ------------------------------------------------------------------------------
            function zoomB(op){ // zoom con bilinear

                var oheight = activo.height;
                var owidth = activo.width;

                if(op == 1){ // Se desea un Zoom In
                    activo.zoom ++ ;
                } else if (op == 2) { // Se desea un Zoom Out
                    if(activo.zoom == -3){
                        alert("no puedes reducir al 0%, si quieres apartar esta imagen de tu vista prueba escogiendo otra.");
                        return 0 
                    }
                    activo.zoom --;
                } 

                var nheight = Math.floor(parseInt(oheight) + parseInt(oheight * 0.25  * activo.zoom));
                var nwidth = Math.floor(parseInt(owidth) + parseInt(owidth * 0.25  * activo.zoom));

                bitmap.zoom.pixels = new Array (nheight * nwidth * 3);

                var x, y, indexa, indexb, indexc, indexd, x_diff, y_diff, offset=0;
                var x_ratio = (owidth-1)/nwidth;
                var y_ratio = (oheight-1)/nheight; 

                for(var i=0; i<nheight; i++) {
                    for(var j=0; j<nwidth; j++){

                        x = parseInt(x_ratio * j);
                        y = parseInt(y_ratio * i);
                        x_diff = (x_ratio * j) - x;
                        y_diff = (y_ratio * i) - y;

                        indexa = (y * owidth * 3 + x * 3);
                        indexb = (indexa + 3);
                        indexc = (indexa + owidth * 3);
                        indexd = (indexc + 3);

                        // Y = A(1-w)(1-h) + B(w)(1-h) + C(h)(1-w) + D(wh)
                        bitmap.zoom.pixels[offset] = save[indexa]*(1-x_diff)*(1-y_diff) + save[indexb]*(x_diff)*(1-y_diff) + save[indexc]*(y_diff)*(1-x_diff) + save[indexd]*(x_diff*y_diff);

                        bitmap.zoom.pixels[offset+1] = save[indexa+1]*(1-x_diff)*(1-y_diff) + save[indexb+1]*(x_diff)*(1-y_diff) + save[indexc+1]*(y_diff)*(1-x_diff) + save[indexd+1]*(x_diff*y_diff);

                        bitmap.zoom.pixels[offset+2] = save[indexa+2]*(1-x_diff)*(1-y_diff) + save[indexb+2]*(x_diff)*(1-y_diff) + save[indexc+2]*(y_diff)*(1-x_diff) + save[indexd+2]*(x_diff*y_diff);

                        offset = offset + 3;

                    }
                }

                bitmap.zoom.width = nwidth;
                bitmap.zoom.height = nheight; 
                resizeCanvas(bitmap.zoom.width,bitmap.zoom.height); 

                var imageData = convertToImageData(); 
                ctx1.putImageData(imageData, 0, 0);
            }
//  ------------------------------------------------------------------------------
            function rotateNN() {  // rotacion con interpolacion de vecinos
                var angle = parseInt($("#angle").val());
                var Height = activo.height;
                var Width = activo.width;

                if(angle==0||angle<-359||angle>359) // evita que el usuario introduzca numeros o valores incorrectos.
                    {alert("por favor introduzca un ángulo válido"); return 0;}

                activo.rotate = activo.rotate + angle; // tomamos en cuenta la rotacion
                angle = activo.rotate; // calculamos cual es el verdadero angulo a rotar desde la original.
                var radian = Math.PI * angle / 180.0; // convierte los grados a radianes
                var cosB =  Math.cos(radian);
                var sinB =  Math.sin(radian);

                //var pitagoras = Math.sqrt(Math.pow(Width,2)+Math.pow(Height,2));
                    var offsetx = Width/2;
                    var offsety = Height/2;

                save = Array.from(bitmap.pixels);
                activo.width = bitmap.infoheader.biWidth;
                activo.height = bitmap.infoheader.biHeight;

                var aux = new Array (Width * Height * 3);
                var xnew, ynew, index1, index2;

                    for (var y = 0; y < Height; ++y) { 
                        for (var x = 0; x < Width; ++x) {

                            xnew =  Math.round( (x - offsetx) * cosB - (y - offsety) * sinB + offsetx); // la nueva posicion en x
                            ynew =  Math.round( (x - offsetx) * sinB + (y - offsety) * cosB + offsety); // la nueva posicion en y

                            if(xnew<Width && ynew<Height && ynew>0  &&  xnew>0) { // verifica que no intente colocar las esquinas
                                index1 = x * 3 + (Width*3) * y;
                                index2 = xnew * 3 + (Width*3) * ynew;

                                aux[index1] = save[index2]; 
                                aux[index1+1] = save[index2+1]; 
                                aux[index1+2] = save[index2+2];
                            }
                        }
                    }

                save = aux;

                activo.width = Width;
                activo.height = Height;

                resizeCanvas(activo.width,activo.height); 

                if (activo.zoom != 0) {
                    if($('#bilinear:checked').val()=='billie'){zoomB();}else{ zoomNN();}
                }else {
                    var imageData = convertToImageData(); 
                    ctx1.putImageData(imageData, 0, 0);
                }
            }
//  ------------------------------------------------------------------------------
            function rotateB() {  // rotacion con interpolacion Bilinear
                var angle = parseInt($("#angle").val());
                var Height = activo.height;
                var Width = activo.width;

                if(angle==0||angle<-359||angle>359) // evita que el usuario introduzca numeros o valores incorrectos.
                    {alert("por favor introduzca un ángulo válido"); return 0;}

                activo.rotate = activo.rotate + angle; // tomamos en cuenta la rotacion
                angle = activo.rotate; // calculamos cual es el verdadero angulo a rotar desde la original.
                var radian = Math.PI * angle / 180.0; // convierte los grados a radianes
                var cosB =  Math.cos(radian);
                var sinB =  Math.sin(radian);

                //var pitagoras = Math.sqrt(Math.pow(Width,2)+Math.pow(Height,2));
                    var offsetx = Width/2;
                    var offsety = Height/2;

                save = Array.from(bitmap.pixels);
                activo.width = bitmap.infoheader.biWidth;
                activo.height = bitmap.infoheader.biHeight;

                var aux = new Array (Width * Height * 3);
                var xnew, ynew, index1, index2, offset=0;


                    for (var y = 0; y < Height; ++y) { 
                        for (var x = 0; x < Width; ++x) {

                            xnew =  Math.round( (x - offsetx) * cosB - (y - offsety) * sinB + offsetx); // la nueva posicion en x
                            ynew =  Math.round( (x - offsetx) * sinB + (y - offsety) * cosB + offsety); // la nueva posicion en y

                            x_diff = x - xnew;
                            y_diff = y - ynew;

                            if(xnew<Width && ynew<Height && ynew>0  &&  xnew>0) { // verifica que no intente colocar las esquinas
 
                                indexa = (ynew * Width * 3 + xnew * 3);
                                indexb = (indexa + 3);
                                indexc = (indexa + Width * 3);
                                indexd = (indexc + 3);

                                // Y = A(1-w)(1-h) + B(w)(1-h) + C(h)(1-w) + D(wh)
                                aux[offset] = save[indexa]*(1-x_diff)*(1-y_diff) + save[indexb]*(x_diff)*(1-y_diff) + save[indexc]*(y_diff)*(1-x_diff) + save[indexd]*(x_diff*y_diff);

                                aux[offset+1] = save[indexa+1]*(1-x_diff)*(1-y_diff) + save[indexb+1]*(x_diff)*(1-y_diff) + save[indexc+1]*(y_diff)*(1-x_diff) + save[indexd+1]*(x_diff*y_diff);

                                aux[offset+2] = save[indexa+2]*(1-x_diff)*(1-y_diff) + save[indexb+2]*(x_diff)*(1-y_diff) + save[indexc+2]*(y_diff)*(1-x_diff) + save[indexd+2]*(x_diff*y_diff);

                                offset = offset + 3;
                            }
                        }
                    }

                save = aux;

                activo.width = Width;
                activo.height = Height;

                resizeCanvas(activo.width,activo.height); 

                if (activo.zoom != 0) {
                    if($('#bilinear:checked').val()=='billie'){zoomB();}else{ zoomNN();}
                }else {
                    var imageData = convertToImageData(); 
                    ctx1.putImageData(imageData, 0, 0);
                }
            }