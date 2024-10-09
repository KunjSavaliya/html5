// const params = new Proxy(new URLSearchParams(window.location.search), {
//     get: (searchParams, prop) => searchParams.get(prop),
// });
// let dac = params.dac;


// const script = document.createElement('script');
// script.setAttribute('async', '');
// script.setAttribute('crossorigin', 'anonymous');
// script.setAttribute('data-ad-channel', dac);
// script.setAttribute('data-ad-client', 'ca-pub-1234567812345678');
// script.setAttribute('data-ad-frequency-hint', '30s');
// script.setAttribute('data-page-url', 'unibots.in');
// script.setAttribute('src', 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');

// document.head.appendChild(script);

// window.adsbygoogle = window.adsbygoogle || [];
// const adBreak = adConfig = function(o) {
//     adsbygoogle.push(o);
// }

// adConfig({
//     sound: 'on',
//     preloadAdBreaks: 'on'
// });

function ShowInterstitial_Preroll() {
    // adBreak({
    //     type: 'preroll',
    //     name: 'game_preroll',
    //     adBreakDone: (info) => {
    //         console.log(info.breakStatus);
    //         c2_callFunction("ForceUnmute", []);
    //     }
    // });
    c2_callFunction("ForceMute", []);
}

function ShowInterstitial_Next() {
    // adBreak({
    //     type: 'next',
    //     name: 'game_preroll',
    //     adBreakDone: (info) => {
    //         console.log(info.breakStatus);
    //         c2_callFunction("ForceUnmute", []);
    //     }
    // });
    c2_callFunction("ForceMute", []);
}


function ShowRewarded() {
    // adBreak({
    //     type: 'reward',
    //     name: 'show_rewarded',
    //     beforeAd: () => {
            c2_callFunction("ForceMute", []);
        // },
        // afterAd: () => {
            c2_callFunction("ForceUnmute", []);
        // },
        // beforeReward: (showAdFn) => {
        //     showAdFn();
        // },
        // adDismissed: () => {
            // c2_callFunction("RewardedAdDismissed", []);
        // },
        // adViewed: () => {
            c2_callFunction("RewardedAdWatched", []);

    //     }
    // });

}