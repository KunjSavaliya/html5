define(["src/me"], function (me) {
  var PortalEntity = me.InvisibleEntity.extend({
    init: function (x, y, settings) {
      this.parent(x, y, settings);
      this.to = settings.to;
    },
  });

  return PortalEntity;
});