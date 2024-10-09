const LoadScript = (client, subdomain, pubId, callback) => {
  const existingScript = document.getElementById("googleAdSense");
  if (!existingScript) {
    const script = document.createElement("script");
    // console.log(pubId );
    if (pubId) {
      var meta = document.createElement("meta");
      meta.name = "google-adsense-platform-account";
      meta.content = "ca-host-pub-5761017298734489";
      document.getElementsByTagName("head")[0].appendChild(meta);

      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${
        pubId ? pubId : 1203149545224208
      }&host=ca-host-pub-5761017298734489`;
    } else {
      if (subdomain === "arealnews") {
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5761017298734489`;
      } else {
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5761017298734489`;
      }
    }
    console.log(script.src);
    script.id = "googleAdSense";
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("data-ad-frequency-hint", "30s");
    // script.setAttribute("data-adbreak-test", "on");
    script.setAttribute("data-ad-channel", `${client}`);
    document.body.appendChild(script);
    script.onload = () => {
      if (callback) callback();
    };
  }
  if (existingScript && callback) callback();
};


const scriptLoad = async () => {
  let client = {
    id: "5795623987",
    ga: "G-KNLRHMD636",
  };
  let channel = client.id;
  let ga = client.ga;
  let pubId = client.pubid;
  // console.log("pubId", pubId);
  pubId = "1203149545224208"
  // ReactGA.initialize(ga);
  let subdomain = window.location.host.split(".")[0];
  LoadScript(channel, subdomain, pubId, () => {
    console.log("============================================");
  });
};

scriptLoad();