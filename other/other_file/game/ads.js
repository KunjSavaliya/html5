
<script>
// Function to show the interstitial ad
function showInterstitialAd() {
    (adsbygoogle = window.adsbygoogle || []).push({})};
// Set a timer to show the ad after a certain time (e.g., 30 seconds)
setTimeout(showInterstitialAd, 300); // 30 seconds
</script>
 function header() {
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function() {
    googletag.defineSlot('/21715635079,22948036142/html5gameslive.com/header', [[300, 250], [728, 90], [980, 300], [970, 90]],
    'div-gpt-ad-1688049646773-0').addService(googletag.pubads());
    googletag.pubads().enableSingleRequest();
     googletag.pubads().collapseEmptyDivs();
     googletag.enableServices(); });
 }
 function footer() {
    window.googletag = window.googletag || {cmd: []};
    googletag.cmd.push(function() {
    googletag.defineSlot('/21715635079,22948036142/html5gameslive.com/footer', [[728, 90], [300, 250], [970, 90], [980, 300]],
     'div-gpt-ad-1688049622003-0').addService(googletag.pubads());
     googletag.pubads().enableSingleRequest();
     googletag.pubads().collapseEmptyDivs();
     googletag.enableServices(); });

 }
 var anchorSlot;
  var staticSlott;
 function anchor(){


  window.googletag = window.googletag || {cmd: []};
   googletag.cmd.push(function() {
    if (document.body.clientWidth <= 500)
     {
         anchorSlot = googletag.defineOutOfPageSlot( '/21715635079,22948036142/html5gameslive.com/anchor', googletag.enums.OutOfPageFormat.TOP_ANCHOR);
    }
    else
    {
        anchorSlot = googletag.defineOutOfPageSlot( '/21715635079,22948036142/html5gameslive.com/anchor', googletag.enums.OutOfPageFormat.BOTTOM_ANCHOR);
    }
    if (anchorSlot)
     {
         anchorSlot .setTargeting('test', 'anchor') .addService(googletag.pubads());
     }
      staticSlott = googletag.defineSlot( '/21715635079,22948036142/html5gameslive.com/anchor', [[728, 90], [300, 100]],
      'div-gpt-ad-1688049684679-0') .addService(googletag.pubads());
      googletag.pubads().enableSingleRequest();
      googletag.enableServices();
      //googletag.display(staticSlott);
     });
    }
    var interstitialSlot;
 var staticSlot;
    function interstitial(){
        //  alert('..');
        window.googletag = window.googletag || {cmd: []};

 googletag.cmd.push(function(){
     interstitialSlot = googletag.defineOutOfPageSlot('/21715635079,22948036142/html5gameslive.com/intertials', googletag.enums.OutOfPageFormat.INTERSTITIAL);
     if(interstitialSlot)
     {

         interstitialSlot.addService(googletag.pubads());
         document.getElementById('div-gpt-ad-1688049706458-0').style.display = 'block';
     }
     staticSlot = googletag.defineSlot('/21715635079,22948036142/html5gameslive.com/intertials', [[1024, 768], [768, 1024], [320, 480], [480, 320]],
     'div-gpt-ad-1688049706458-0').addService(googletag.pubads());
     googletag.pubads().enableSingleRequest();
     googletag.enableServices(); });
    //  googletag.display(interstitialSlot);

    }
