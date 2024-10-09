
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
const script = document.createElement('script');
script.setAttribute('async', '');
script.setAttribute('crossorigin', 'anonymous');
script.setAttribute('src', 'https://cpt.geniee.jp/hb/v1/217397/939/wrapper.min.js');
document.head.appendChild(script);
window.adsbygoogle = window.adsbygoogle || [];
window.gnshbrequest = window.gnshbrequest || {cmd:[]};
const adBreak = adConfig = function (o) {

  const body = document.getElementsByTagName('BODY')[0]
  let box5 = document.getElementById('1539057_Banner_300x250_Knifehit')
  if (!box5) {
    const box5 = document.createElement("div");
    box5.id= '1539057_Banner_300x250_Knifehit'
    box5['data-cptid'] = '1539057_Banner_300x250_Knifehit';
    box5.style.display = "block";
    body.appendChild(box5)
  }
  window.gnshbrequest.cmd.push(function() {
    window.gnshbrequest.applyPassback("1539057_Banner_300x250_Knifehit", "[data-cptid='1539057_Banner_300x250_Knifehit']");
  });
}
adConfig({sound: 'on', preloadAdBreaks: 'on'});
function ShowInterstitial_Preroll() {
  console.log('ShowInterstitial_Preroll=======')
  adBreak({
    type: 'preroll',
    name: 'game_preroll',
    adBreakDone: (info) => {
      console.log(info.breakStatus);
      c3_callFunction("ForceUnmute", []);
    }
  });
  c3_callFunction("ForceMute", []);
}
function ShowInterstitial_Next() {
  console.log('ShowInterstitial_Next=======')
  adBreak({
    type: 'next',
    name: 'game_preroll',
    adBreakDone: (info) => {
      console.log(info.breakStatus);
      c3_callFunction("ForceUnmute", []);
    }
  });
  c3_callFunction("ForceMute", []);
}
function ShowRewarded() {
  console.log('ShowRewarded=======')
  adBreak({
    type: 'reward',
    name: 'show_rewarded',
    beforeAd: () => {
      c3_callFunction("ForceMute", []);
    },
    afterAd: () => {
      c3_callFunction("ForceUnmute", []);
    },
    beforeReward: (showAdFn) => {
      showAdFn();
    },
    adDismissed: () => {
      c3_callFunction("RewardedAdDismissed", []);
    },
    adViewed: () => {
      c3_callFunction("RewardedAdWatched", []);
    }
  });
}