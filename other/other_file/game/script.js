$(document).ready(function() {
    var width = Math.max(window.screen.width, window.innerWidth);
    // console.log( width);
        $("#MB_Topbanner").css("width", width);
        $("#MB_Topbanner").css("max-width", width);
        $("#MB_Topbanner").css("height", width);
        $("#MB_Middle").css("width", width);
        $("#MB_Middle").css("max-width", width);
        $("#MB_Middle").css("height", width); 
        $("#MB_inter").css("width", width);
        $("#MB_inter").css("max-width", width);
        $("#MB_inter").css("height", width);
        $("#interstial_main").css("width", width);
        $("#interstial_main").css("max-width", width);
        $("#interstial_main").css("height", width);
        $("#MB_Anchor").css("width", width);
        $("#MB_Anchor").css("max-width", width);
        $("#MB_Anchor").css("height", width); 
    });
document.addEventListener("DOMContentLoaded", function() {
const interstitialAd = document.getElementById("interstitialAd");
const closeAdButton = document.getElementById("closeAdButton");
const btnfeedbackreason = document.getElementById("btnfeedbackreason");
setTimeout(function(){
  $("#PC_Topbanner").css({"display":"none"});
  $("#MB_Topbanner").css({"display":"none"});
 }, 500);
$("#feedbackAdButton").click(function(){
    $("#feedbackAd").css({"display":"block"});
  
});
 closeAdButton.addEventListener("click", function() {
  interstitialAd.style.display = 'none';
  if($(window).innerWidth() >= 1200){
    $("#PC_Topbanner").css({"display":"block"});
  }
  else{
    $("#MB_Topbanner").css({"display":"block"});
  }
});
$("#btnfeedbackreason").click(function(){
    $("#feedbackAd2").css({"display":"block"});
    $("#feedbackAd").css({"display":"none"});
 });
 $("#feedback_row1").click(function(){
    $("#feedback_response").css({"display":"block"});
    $("#feedbackAd2").css({"display":"none"});
    setTimeout(function(){
  $("#feedback_response").css({"display":"none"});
}, 1500);
 });
 $("#feedback_row2").click(function(){
    $("#feedback_response").css({"display":"block"});
    $("#feedbackAd2").css({"display":"none"});
    setTimeout(function(){
  $("#feedback_response").css({"display":"none"});
}, 1500);
 });$("#feedback_row3").click(function(){
    $("#feedback_response").css({"display":"block"});
    $("#feedbackAd2").css({"display":"none"});
    setTimeout(function(){
  $("#feedback_response").css({"display":"none"});
}, 1500);
 });
}); 