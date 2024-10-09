const getClientConf = async () => {

  return {
    id: "5795623987",
    ga: "G-KNLRHMD636",
  };
};

// =================================== X ===================================
// Loading Google Adsense Script
// =================================== X ===================================
const scriptLoad = (client, subdomain, pubId, callback) => {
  const existingScript = document.getElementById("googleAdSense");
  if (!existingScript) {
    const script = document.createElement("script");
    if (pubId) {
      let meta = document.createElement("meta");
      meta.name = "google-adsense-platform-account";
      meta.content = `ca-host-pub-${pubId}`;
      document.getElementsByTagName("head")[0].appendChild(meta);

      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${
        pubId
      }&host=ca-host-pub-${pubId}`;
    } else {
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5761017298734489`;
    }
    console.log(script.src);
    script.id = "googleAdSense";
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("data-ad-frequency-hint", "30s");
    script.setAttribute("data-ad-channel", `${client}`);

    // script.setAttribute("data-adbreak-test", "on");

    document.body.appendChild(script);
    script.onload = () => {
      if (callback) callback();
    };
  }
  if (existingScript && callback) callback();
};

let showAd = () => {
  console.log("show Ad preload run");
  window.adBreak({
    type: "browse",
    name: "browse",
  });
};

window.adConfig = function (o) {
  console.log("inside ad config fn");
  window.adsbygoogle.push(o);
};
window.adBreak = function (o) {
  console.log("inside adBreak fn");
  window.adsbygoogle.push(o);
};

// =================================== X ===================================
// Loading Google Adsense Script
// =================================== X ===================================
const loadAd = async () => {
  let client = await getClientConf();
  let subdomain = window.location.host.split(".")[0];
  scriptLoad(client.id, subdomain, '1203149545224208' , () => {
    (window.adsbygoogle || []).push({});

    if (!window.adsbygoogle?.loaded) {
      window.adConfig({
        preloadAdBreaks: "on",
        onReady: showAd,
      });
    } else {
      window.adConfig = function (o) {
        console.log("inside ad config fn");
        window.adsbygoogle.push(o);
      };
      showAd();
    }
  });
};

loadAd();
