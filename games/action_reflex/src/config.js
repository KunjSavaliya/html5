define(["src/me"], function (me) {

  var config = {
    debug: false,
    display: {
      width: 512,
      height: 384,
    },
    fontSize: 28,
    initialScreen: me.state.MENU,
    ballAppearThroughTubeAnimation: true,
    startScreen: "scr001",
    startPosition: null,

    initialScore: 0,
    initialCompleted: 0,
    screensTotal: 75,
    bouyInitialCount: 0,
    bouyCost: 500,

    hammerInitialCount: 0,
    hammerCost: 700,

    keyInitialCount: 0,
    keyCost: 900,
    timelineWidth: 256,
    timelineDuration: 432,
    timePenalty: 4,
  };

  config.timelineUnitDuration = config.timelineDuration / config.timelineWidth;

  return config;

});