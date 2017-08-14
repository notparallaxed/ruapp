/* GLOBALS */
var Cardapio = [];
var cardweekday = 0;
var lastUpdate = null;
var erro = 0;

/* Classe Dia */
function Dia(){
    this.dia = ""
    this.carne = "";
    this.jantar = "";
    this.veg = "";
}

/* =-=-= EXTRAIR TEXTO DO PDF =-=-=-= */
function extractPDF(){
    PDFJS.getDocument("http://proap.ufabc.edu.br/images/PDF/Cardapio.pdf").then(function(pdf){
        pdf.getPage(1).then(function(page){
            page.getTextContent().then(function(content){

                pdfContent = "";

                content.items.forEach(function(value){
                    pdfContent += value.str;
                });

                pdfContent = pdfContent.split(" ");

                /* rearranjo da tabela em array */

                pdfContent.forEach(function(value, index){
                   if(value == "SAB"){
                       for (i=index + 1, k= 0; pdfContent[i] != "Carne"; i++, k++){
                           Cardapio[k] = new Dia();
                           Cardapio[k].dia = pdfContent[i];
                           }
                       }
                    if(value == "(Almoço)"){
                        var regular = new RegExp('[A-Z]');
                        var day = -1;
                        for (i=index + 1; pdfContent[i+1] != "(Jantar)"; i++){
                           if(regular.test(pdfContent[i])){
                               if (day != -1){
                                Cardapio[day].carne = Cardapio[day].carne.trim();
                               }
                               day++;
                           }
                           Cardapio[day].carne += pdfContent[i] + " ";
                        }
                    }
                    if(value == "(Jantar)"){
                        var regular = new RegExp('[A-Z]');
                        var day = -1;
                        for (i=index + 1; pdfContent[i+2] != "Opção"; i++){
                           if(regular.test(pdfContent[i])){
                               if (day != -1){
                                Cardapio[day].jantar = Cardapio[day].jantar.trim();
                               }
                               day++;
                           }
                           Cardapio[day].jantar += pdfContent[i] + " ";
                        }
                    }
                    if(value == "Opção" && pdfContent[index + 1] == "sem" && pdfContent[index + 2] == "carne"){
                        var regular = new RegExp('[A-Z]');
                        var day = -1;
                        for (i=index + 3; pdfContent[i] != "Guarnição"; i++){
                           if(regular.test(pdfContent[i]) && pdfContent[i] != "PTS"){
                               if (day != -1){
                                Cardapio[day].veg = Cardapio[day].veg.trim();
                               }
                               day++;
                           }
                           Cardapio[day].veg += pdfContent[i] + " ";
                        }
                    }
                });

                localStorage.setItem("cardapio", JSON.stringify(Cardapio));
                localStorage.setItem("lastUpdate", JSON.stringify(getMonday(new Date())));

                loadCardapio();


            }, function(){
                navigator.notification.alert("Something wrong happen here :(");
            });

        }, function(){
            navigator.notification.alert("Something wrong happen here :(");
        });

    }, function(){
        navigator.notification.alert("Something wrong happen here :(");
    });
}

function loadCardapio(day=null){
    today = new Date();
    if(day != null){
        today = day;
    }

    $("#txtDia").html(today.getDate() + "/" + today.getMonth() + "(" + getWeekDayName(today.getDay()) + ")");

    if(today.getDay() == 0){
        $("#cardapio ul").hide();
        $("#cardapio > h1").show();
    }else{
        $("#cardapio ul").show();
        $("#cardapio > h1").hide();
    }
       Cardapio.forEach(function(value,index){
          if(value.dia == today.getDate()){
            $("#principal").html(value.carne);
            $("#principalJantar").html(value.jantar);
            $("#vegetariano").html(value.veg);
          }
       });
}

/* getMondayFunction */
function getMonday(d){
    var atualday = d.getDay();
    var monday = d.getDate() - atualday + (atualday == 0? -6:1);
    return monday;
}

/* get wekk name */
function getWeekDayName(w){
    switch (w){
        case 0 : return "DOM"; break;
        case 1 : return "SEG"; break;
        case 2 : return "TER"; break;
        case 3 : return "QUA"; break;
        case 4 : return "QUI"; break;
        case 5 : return "SEX"; break;
        case 6 : return "SÁB"; break;
    }
}

/* =-=- WHEN DEVICE IS READY =-=-= */

$(document).ready(function(){

    Cardapio = JSON.parse(localStorage.getItem("cardapio"));
    lastUpdate = JSON.parse(localStorage.getItem("lastUpdate"));

    today = new Date();
    cardweekday = today.getDay();

   if(lastUpdate == getMonday(new Date())){
        loadCardapio();
   }else{
       console.log("Atualizando cardapio...");
       Cardapio = [];
       extractPDF();
   }

   /* =-=- evnt bntVoltarDia -=-= */
   $("#btnVoltarDia").click(function(evt){
      var now = new Date();
      if(now.getDay() == 0 && cardweekday == -6){
          evt.currentTarget.disabled = true;
          return;
      }
      if(now.getDay() != 0 && cardweekday == 0 ){
          evt.currentTarget.disabled = true;
          return;
      }
      if($("#btnNextDia").prop('disabled')){
          $("#btnNextDia").prop('disabled', false);
      }

       cardweekday--;
       today.setDate(today.getDate() + (cardweekday - today.getDay())); /* subtrai 1 dia do dia atual */

       loadCardapio(today);
   });

   /* =-=- evnt bntNextDia -=-= */
   $("#btnNextDia").click(function(evt){
       var now = new Date();
       if(now.getDay() == 0 && cardweekday == 0){
           evt.currentTarget.disabled = true;
           return;
       }
       if(now.getDay() != 0 && cardweekday == 6 ){
           evt.currentTarget.disabled = true;
           return;
       }
       if($("#btnVoltarDia").prop('disabled')){
           $("#btnVoltarDia").prop('disabled', false);
       }

        cardweekday++;
        today.setDate(today.getDate() + (cardweekday - today.getDay())); /* subtrai 1 dia do dia atual */

        loadCardapio(today);
   });

});
