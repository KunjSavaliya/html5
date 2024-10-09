/**
 * @license MelonJS Game Engine
 */
(function($, undefined) {
	var document = $.document;
	/**
	 * @namespace
	 */
	me = {
		mod : "melonJS",
		nocache : '',
		audio : null,
		video : null,
		timer : null,
		input : null,
		state : null,
		game : null,
		entityPool : null,
		levelDirector : null,
		XMLParser : null,
		loadingScreen : null,
		TMXTileMap : null
	};
	/**
	 * @namespace
	 */
	me.debug = {
		/**
		 * @memberOf me.debug
		 */
		displayFPS : false,
		/**
		 * @type {Boolean}
		 * @memberOf me.debug
		 */
		renderHitBox : false,
		/**
		 * @type {Boolean}
		 * @memberOf me.debug
		 */
		renderDirty : false
	};
	/**
	 * @namespace
	 */
	me.sys = {
		/**
		 * @type {Boolean}
		 * @memberOf me.sys
		 */
		ua : navigator.userAgent.toLowerCase(),
		/**
		 * @type {Boolean}
		 * @memberOf me.sys
		 */
		sound : false,
		/**
		 * @type {Boolean}
		 * @memberOf me.sys
		 */
		localStorage : (typeof($.localStorage) == 'object'),
		/**
		 * @type {Boolean}
		 * @memberOf me.sys
		 */
		gyro : ($.DeviceMotionEvent !== undefined),
		/**
		 * @type {Boolean}
		 * @memberOf me.sys
		 */
		nativeBase64 : (typeof($.atob) == 'function'),
		/**
		 * Touch apabilities <br>
		 * @type {Boolean}
		 * @memberOf me.sys
		 */
		touch : false,
		/**
		 * @type {Int}
		 * @memberOf me.sys
		 */
		fps : 60,
		/**
		 * @type {Boolean}
		 * @memberOf me.sys
		 */
		interpolation : false,
		/**
		 * @type {int}
		 * @memberOf me.sys
		 */
		scale : 1.0,
		/**
		 * @type {Number}
		 * @memberOf me.sys
		 */
		gravity : undefined,
		/**
		 * @type {Boolean}
		 * @memberOf me.sys
		 */
		useNativeAnimFrame : false,
		/**
		 * @type {Boolean}
		 * @memberOf me.sys
		 */
		cacheImage : false,
		/**
		 * @type {Boolean}
		 * @memberOf me.sys
		 */
		dirtyRegion : false,
		/**
		 * @type {Boolean}
		 * @memberOf me.sys
		 */
		enableWebGL : false,
		/**
		 * @type {Boolean}
		 * @memberOf me.sys
		 */
		stopOnAudioError : true
	};
	$.me = me;
	var me_initialized = false;
	var readyBound = false, isReady = false, readyList = [];
	function domReady() {
		if (!isReady) {
			if (!document.body) {
				return setTimeout(domReady, 13);
			}
			if (document.removeEventListener)
				document.removeEventListener("DOMContentLoaded", domReady, false);
			else
				$.removeEventListener("load", domReady, false);
			isReady = true;
			for ( var fn = 0; fn < readyList.length; fn++) {
				readyList[fn].call($, []);
			}
			readyList.length = 0;
		}
	}
	;
	function bindReady() {
		if (readyBound) {
			return;
		}
		readyBound = true;
		if (document.readyState === "complete") {
			return util.domReady();
		} else {
			if (document.addEventListener) {
				document.addEventListener("DOMContentLoaded", domReady, false);
			}
			$.addEventListener("load", domReady, false);
		}
	}
	;
	/**
	 * @param {Function} handler A function to execute after the DOM is ready.
	 * @example
	 */
	onReady = function(fn) {
		bindReady();
		if (isReady) {
			fn.call($, []);
		} else {
			readyList.push(function() {
				return fn.call($, []);
			});
		}
		return this;
	};
	$.onReady(function() {
		_init_ME();
	});
	var initializing = false,
		fnTest = /xyz/.test(function() {/**@nosideeffects*/xyz;}) ? /\bparent\b/ : /.*/;
	/**
	 * @param {Object} object Object (or Properties) to inherit from
	 * @example
	 */
	Object.extend = function(prop) {
		var parent = this.prototype;
		initializing = true;
		var proto = new this();
		initializing = false;
		for ( var name in prop) {
			proto[name] = typeof prop[name] == "function"
					&& typeof parent[name] == "function"
					&& fnTest.test(prop[name]) ? (function(name, fn) {
				return function() {
					var tmp = this.parent;
					this.parent = parent[name];
					var ret = fn.apply(this, arguments);
					this.parent = tmp;
					return ret;
				};
			})(name, prop[name]) : prop[name];
		}
		function Class() {
			if (!initializing && this.init) {
				this.init.apply(this, arguments);
			}
		}
		Class.prototype = proto;
		Class.constructor = Class;
		Class.extend = arguments.callee;
		return Class;
	};
	if (typeof Object.create !== 'function') {
		/**
		 * @param {Object} Object
		 * @example
		 */
		Object.create = function(o) {
			function _fn() {};
			_fn.prototype = o;
			return new _fn();
		};
	};
	if (!Function.bind) {
		/**
		 * @param {Object} context the object to bind to.
		 * @param {Array.<string>} [args] Optional additional arguments to curry for the function.
		 * @example
		 */
		Function.prototype.bind = function() {
			var fn = this, args = Array.prototype.slice.call(arguments), object = args.shift();
			return function() {
				return fn.apply(object, args.concat(Array.prototype.slice.call(arguments)));
			};
		};
	};
	if(typeof console === "undefined") {
		/**
		 * @private
		 */
		console = { log: function() {} };
	}
	/**
	 * @returns id that can be used to clear the deferred function using clearTimeout
	 * @example
	 */
	Function.prototype.defer = function() {
		var fn = this, args = Array.prototype.slice.call(arguments);
		return window.setTimeout(function() {
			return fn.apply(fn, args);
		}, 0.01);
	};
	if (!Object.defineProperty) {
		/**
		 * @param {Object} obj The object on which to define the property.
		 * @param {String} prop The name of the property to be defined or modified.
		 * @param {Object} desc The descriptor for the property being defined or modified.
		 */
		Object.defineProperty = function(obj, prop, desc) {
			if (obj.__defineGetter__) {
				if (desc.get) {
					obj.__defineGetter__(prop, desc.get);
				}
				if (desc.set) {
					obj.__defineSetter__(prop, desc.set);
				}
			} else {
				throw "melonJS: Object.defineProperty not supported";
			}
		}
	};
	/**
	 * @extends String
	 * @return {String} trimmed string
	 */
	String.prototype.trim = function() {
		return (this.replace(/^\s+/, '')).replace(/\s+$/, '');
	};
	/**
	 * @extends String
	 * @return {Boolean} true if string contains only digits
	 */
	String.prototype.isNumeric = function() {
		return (this != null && !isNaN(this) && this.trim() != "");
	};
	/**
	 * @extends String
	 * @return {Boolean} true if the string is either true or false
	 */
	String.prototype.isBoolean = function() {
		return (this != null && ("true" == this.trim() || "false" == this
				.trim()));
	};
	/**
	 * @extends String
	 * @return {Boolean}
	 */
	String.prototype.contains = function(word) {
		return this.indexOf(word) > -1;
	};
   /**
	 * @extends String
	 * @return {String}
	 */
	String.prototype.toHex = function() {
      var res = "", c = 0;
      while(c<this.length){
         res += this.charCodeAt(c++).toString(16);
      }
      return res;
	};
	/**
	 * @extends Number
	 * @return {Number} clamped value
	 */
	Number.prototype.clamp = function(low, high) {
		return this < low ? low : this > high ? high : this;
	};
	/**
	 * @param {Number} min minimum value.
	 * @param {Number} max maximum value.
	 * @extends Number
	 * @return {Number} random value
	 */
	Number.prototype.random = function(min, max) {
		return (~~(Math.random() * (max - min + 1)) + min);
	};
	/**
	 * @param {Number} [num="Object value"] value to be rounded.
	 * @param {Number} dec number of decimal digit to be rounded to.
	 * @extends Number
	 * @return {Number} rounded value
	 * @example
	 */
	Number.prototype.round = function() {
		var num = (arguments.length == 1) ? this : arguments[0];
		var powres = Math.pow(10, arguments[1] || arguments[0]);
		return (Math.round(num * powres) / powres);
	};
	/**
	 * @extends Number
	 * @return {String} converted hexadecimal value
	 */
	Number.prototype.toHex = function() {
		return "0123456789ABCDEF".charAt((this - this % 16) >> 4)
				+ "0123456789ABCDEF".charAt(this % 16);
	};
	/**
	 * @extends Number
	 * @return {Number} sign of a the number
	 */
	Number.prototype.sign = function() {
		return this < 0 ? -1 : (this > 0 ? 1 : 0);
	};
	/**
	 * @param {Number} [angle="angle"] angle in degrees
	 * @extends Number
	 * @return {Number} corresponding angle in radians
	 * @example
	 */
    Number.prototype.degToRad = function (angle) {
        return (angle||this) / 180.0 * Math.PI;
    };
	/**
	 * @param {Number} [angle="angle"] angle in radians
	 * @extends Number
	 * @return {Number} corresponding angle in degrees
	 * @example
	 */
	Number.prototype.radToDeg = function (angle) {
        return (angle||this) * (180.0 / Math.PI);
    };
	/**
	 * @class
	 * @constructor
	 * @ignore
	 *
	 **/
	function _TinyXMLParser() {
		var parserObj = {
			xmlDoc : null,
			parser : null,
			parseFromString : function(textxml) {
				if ($.DOMParser) {
					this.parser = new DOMParser();
					this.xmlDoc = this.parser.parseFromString(textxml, "text/xml");
				} else
				{
					this.xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
					this.xmlDoc.async = "false";
					this.xmlDoc.loadXML(textxml);
				}
				if (this.xmlDoc == null) {
					console.log("xml " + this.xmlDoc + " not found!");
				}
			},
			getFirstElementByTagName : function(name) {
				return this.xmlDoc ? this.xmlDoc.getElementsByTagName(name)[0] : null;
			},
			getAllTagElements : function() {
				return this.xmlDoc ? this.xmlDoc.getElementsByTagName('*') : null;
			},
			getStringAttribute : function(elt, str, val) {
				var ret = elt.getAttribute(str);
				return ret ? ret.trim() : val;
			},
			getIntAttribute : function(elt, str, val) {
				var ret = this.getStringAttribute(elt, str, val);
				return ret ? parseInt(ret) : val;
			},
			getFloatAttribute : function(elt, str, val) {
				var ret = this.getStringAttribute(elt, str, val);
				return ret ? parseFloat(ret) : val;
			},
			getBooleanAttribute : function(elt, str, val) {
				var ret = this.getStringAttribute(elt, str, val);
				return ret ? (ret == "true") : val;
			},
			free : function() {
				this.xmlDoc = null;
				this.parser = null;
			}
		}
		return parserObj;
	}
	;
	function _init_ME() {
		if (me_initialized)
			return;
		var a = document.createElement('audio');
		me.utils.setNocache(document.location.href.match(/\?nocache/));
		if (a.canPlayType) {
			me.audio.capabilities.mp3 = ("no" != a.canPlayType("audio/mpeg"))
					&& ("" != a.canPlayType("audio/mpeg"));
			me.audio.capabilities.ogg = ("no" != a.canPlayType('audio/ogg; codecs="vorbis"'))
					&& ("" != a.canPlayType('audio/ogg; codecs="vorbis"'));
			me.audio.capabilities.wav = ("no" != a.canPlayType('audio/wav; codecs="1"'))
					&& ("" != a.canPlayType('audio/wav; codecs="1"'));
			me.sys.sound = me.audio.capabilities.mp3 ||
                        me.audio.capabilities.ogg ||
                        me.audio.capabilities.wav;
		}
		if ((me.sys.ua.search("iphone") > -1)
				|| (me.sys.ua.search("ipod") > -1)
				|| (me.sys.ua.search("ipad") > -1)
				|| (me.sys.ua.search("android") > -1)) {
			me.sys.sound = false;
		}
		me.sys.touch = ('createTouch' in document) || ('ontouchstart' in $);
		me.timer.init();
		me.XMLParser = new _TinyXMLParser();
		me.loadingScreen = new me.DefaultLoadingScreen();
		me.state.init();
		me.entityPool.init();
		me.levelDirector.reset();
		me_initialized = true;
	};
	/**
	 * @ignore
	 */
	var drawManager = (function() {
		var api = {};
		var dirtyRects = [];
		var fullscreen_rect;
		var dirtyObjects = [];
		api.isDirty = false;
		api.reset = function() {
			dirtyRects.length = 0;
			dirtyObjects.length = 0;
			fullscreen_rect = me.game.viewport.getRect();
			api.makeAllDirty();
		};
		api.makeDirty = function(obj, updated, oldRect) {
			if (updated) {
				api.isDirty = true;
				if (me.sys.dirtyRegion) {
					if (oldRect) {
						dirtyRects.push(oldRect.union(obj));
					} else if (obj.getRect) {
						dirtyRects.push(obj.getRect());
					}
				}
			}
			if (obj.visible) {
				dirtyObjects.splice(0, 0, obj);
			}
		};
		api.makeAllDirty = function() {
			dirtyRects.length = 0;
			dirtyRects.push(fullscreen_rect);
			api.isDirty = true;
		};
		api.remove = function(obj) {
			var idx = dirtyObjects.indexOf(obj);
			if (idx != -1) {
				dirtyObjects.splice(idx, 1);
				var wasVisible = obj.visible;
				obj.visible = false;
				api.makeDirty(obj, true);
				obj.visible = wasVisible;
			}
 		};
		api.draw = function(context) {
			for ( var r = dirtyRects.length, rect; r--, rect = dirtyRects[r];) {
				for ( var o = dirtyObjects.length, obj; o--,
						obj = dirtyObjects[o];) {
					if (me.sys.dirtyRegion && obj.isEntity
							&& !obj.overlaps(rect)) {
						continue;
					}
					obj.draw(context, rect);
				}
				if (me.debug.renderDirty) {
					rect.draw(context, "white");
				}
			}
		};
		api.flush = function() {
			if (me.sys.dirtyRegion) {
				dirtyRects.length = 0;
			}
			dirtyObjects.length = 0;
			api.isDirty = false;
		};
		return api;
	})();
	/**
	 * @final
	 * @memberOf me
	 * @constructor Should not be called by the user.
	 */
	me.game = (function() {
		var api = {};
		var frameBuffer = null;
		var gameObjects = [];
		var objCount = 0;
		var initialized = false;
		var pendingDefer = null;
		/**
		 * @public
		 * @type me.Viewport
		 * @name me.game#viewport
		 */
		api.viewport = null;
		/**
		 * @public
		 * @type me.HUD_Object
		 * @name me.game#HUD
		 */
		api.HUD = null;
		/**
		 * @public
		 * @type me.TiledLayer
		 * @name me.game#collisionMap
		 */
		api.collisionMap = null;
		/**
		 * @public
		 * @type me.TMXTileMap
		 * @name me.game#currentLevel
		 */
		api.currentLevel = null;
		api.NO_OBJECT = 0;
		/**
		 * @constant
		 * @name me.game#ENEMY_OBJECT
		 */
		api.ENEMY_OBJECT = 1;
		/**
		 * @constant
		 * @name me.game#COLLECTABLE_OBJECT
		 */
		api.COLLECTABLE_OBJECT = 2;
		/**
		 * @constant
		 * @name me.game#ACTION_OBJECT
		 */
		api.ACTION_OBJECT = 3;
		/**
		 * @public
		 * @type function
		 * @name me.game#onLevelLoaded
		 * @example
		 */
		 api.onLevelLoaded = null;
		/**
		 * @name me.game#init
		 * @private
		 * @function
		 * @param {int} [width="full size of the created canvas"] width of the canvas
		 * @param {int} [height="full size of the created canvas"] width of the canvas
		 * init function.
		 */
		api.init = function(width, height) {
			if (!initialized) {
				var width = width || me.video.getWidth();
				var height = height || me.video.getHeight();
				api.viewport = new me.Viewport(0, 0, width, height);
				frameBuffer = me.video.getScreenFrameBuffer();
				initialized = true;
			}
		};
		/**
		 * @see me.game#disableHUD
		 * @name me.game#reset
		 * @public
		 * @function
		 */
		api.reset = function() {
			if (pendingDefer)
			{
				clearTimeout(pendingDefer);
			}
			pendingDefer = null;
			if (!initialized)
				api.init();
			api.removeAll();
			if (api.viewport)
				api.viewport.reset();
			if (api.HUD != null) {
				api.add(api.HUD);
			}
			drawManager.reset();
		};
		/**
		 * @name me.game#loadTMXLevel
		 * @private
		 * @function
		 */
		api.loadTMXLevel = function(level) {
			api.currentLevel = level;
			api.collisionMap = api.currentLevel.getLayerByName("collision");
			if (!api.collisionMap || !api.collisionMap.isCollisionMap) {
				alert("WARNING : no collision map detected");
			}
			api.currentLevel.addTo(me.game);
			if ((api.currentLevel.realwidth < api.viewport.getWidth()) ||
			    (api.currentLevel.realheight < api.viewport.getHeight())) {
				throw "melonJS: map size should be at least equal to the defined display size";
			}
			api.viewport.setBounds(api.currentLevel.realwidth, api.currentLevel.realheight);
			var objectGroups = api.currentLevel.getObjectGroups();
			for ( var group = 0; group < objectGroups.length; group++) {
				for ( var entity = 0; entity < objectGroups[group].objects.length; entity++) {
					api.addEntity(objectGroups[group].objects[entity],
							objectGroups[group].z);
				}
			}
			api.sort();
			if (api.onLevelLoaded) {
				api.onLevelLoaded.apply(api.onLevelLoaded, new Array(level.name))
			}
		};
		/**
		 * @name me.game#add
		 * @param {me.ObjectEntity} obj Object to be added
		 * @param {int} [z="obj.z"] z index
		 * @public
		 * @function
		 * @example
		 */
		api.add = function(object, zOrder) {
			object.z = (zOrder) ? zOrder : object.z;
			gameObjects.push(object);
			objCount = gameObjects.length;
		};
		/**
		 * @name me.game#addEntity
		 * @private
		 * @function
		 */
		api.addEntity = function(entityType, zOrder) {
			api.add(me.entityPool.newIstanceOf(entityType), zOrder);
		};
		/**
		 * @name me.game#getEntityByName
		 * @public
		 * @function
		 * @param {String} entityName entity name
		 * @return {me.ObjectEntity[]} Array of object entities
		 */
		api.getEntityByName = function(entityName)
		{
			var objList = [];
			entityName = entityName.toLowerCase();
			for (var i = objCount, obj; i--, obj = gameObjects[i];) {
				if(obj.name == entityName) {
					objList.push(obj);
				}
			}
			return objList;
		};
		/**
		 * @name me.game#getEntityByGUID
		 * @public
		 * @function
		 * @param {String} GUID entity GUID
		 * @return {me.ObjectEntity} Object Entity (or null if not found)
		 */
		api.getEntityByGUID = function(guid)
		{
			for (var i = objCount, obj; i--, obj = gameObjects[i];) {
				if(obj.isEntity && obj.GUID == guid) {
					return obj;
				}
			}
			return null;
		};
		/**
		 * @name me.game#addHUD
		 * @public
		 * @function
		 * @param {int} x x position of the HUD
		 * @param {int} y y position of the HUD
		 * @param {int} w width of the HUD
		 * @param {int} h height of the HUD
		 * @param {String} [bg="none"] a CSS string specifying the background color (e.g. "#0000ff" or "rgb(0,0,255)")
		 */
		api.addHUD = function(x, y, w, h, bg) {
			if (api.HUD == null) {
				api.HUD = new me.HUD_Object(x, y, w, h, bg);
				api.add(api.HUD);
			}
		};
		/**
		 * @name me.game#disableHUD
		 * @public
		 * @function
		 */
		api.disableHUD = function() {
			if (api.HUD != null) {
				api.remove(api.HUD);
				api.HUD = null;
			}
		};
		/**
		 * @name me.game#update
		 * @private
		 * @function
		 */
		api.update = function() {
			me.timer.update();
			var oldRect = null;
			for ( var i = objCount, obj; i--, obj = gameObjects[i];) {
				oldRect = (me.sys.dirtyRegion && obj.isEntity) ? obj.getRect() : null;
				var updated = obj.update();
				if (obj.isEntity) {
					obj.visible = api.viewport.isVisible(obj.collisionBox);
				}
				drawManager.makeDirty(obj, updated, updated ? oldRect : null);
			}
			if (api.viewport.update(drawManager.isDirty)) {
				drawManager.makeAllDirty();
			}
		};
		/**
		 * @name me.game#remove
		 * @public
		 * @function
		 * @param {me.ObjectEntity} obj Object to be removed
		 */
		api.remove = function(obj) {
			if (!obj.destroy || obj.destroy()) {
				obj.visible = false
				obj.isEntity = false;
				drawManager.remove(obj);
				/** @private */
				pendingDefer = (function (obj)
				{
				   var idx = gameObjects.indexOf(obj);
				   if (idx!=-1) {
					  gameObjects.splice(idx, 1);
					  objCount = gameObjects.length;
				   }
				   pendingDefer = null;
				}).defer(obj);
			}
      };
		/**
		 * @name me.game#removeAll
		 * @public
		 * @function
		 */
		api.removeAll = function() {
			for (var i = objCount, obj; i--, obj = gameObjects[i];) {
				obj.autodestroy = true;
				if(obj.destroy) {
					obj.destroy();
				}
			}
			objCount = 0;
			gameObjects.length = 0;
			drawManager.flush();
		};
		/**
		 * @name me.game#sort
		 * @public
		 * @function
		 */
		api.sort = function() {
			gameObjects.sort(function(a, b) {
				return (b.z - a.z);
			});
			api.repaint();
		};
		/**
		 * @name me.game#collide
		 * @public
		 * @function
		 * @param {me.ObjectEntity} obj Object to be tested for collision
		 * @return {me.Vector2d} collision vector {@link me.Rect#collideVsAABB}
		 * @example
		 *
		*/
		api.collide = function(objB) {
			var result = null;
			for ( var i = objCount, obj; i--, obj = gameObjects[i];)
			{
				if (obj.visible && obj.collidable && obj.isEntity && (obj!=objB))
				{
					if (result = obj.checkCollision(objB))
						break;
				}
			}
			return result;
		};
		/**
		 * @name me.game#repaint
		 * @public
		 * @function
		 */
		api.repaint = function() {
			drawManager.makeAllDirty();
		};
		/**
		 * @name me.game#draw
		 * @private
		 * @function
		 */
		api.draw = function() {
			if (drawManager.isDirty) {
				drawManager.draw(frameBuffer);
				api.viewport.draw(frameBuffer)
			}
			drawManager.flush();
		};
		return api;
	})();
	/**
	 * @class
	 * @extends Object
	 * @memberOf me
	 * @constructor
	 * @see me.state
	 * @example
	 *
	 */
	me.ScreenObject = Object.extend(
	/** @scope me.ScreenObject.prototype */
	{
		visible : true,
		addAsObject : false,
		rect : null,
		/**
		 * @param {Boolean} [addAsObjet] add the object in the game manager object pool<br>
		 */
		init : function(addAsObject) {
			this.addAsObject = addAsObject;
			this.visible = (addAsObject === true) || false;
			this.rect = new me.Rect(new me.Vector2d(0, 0), 0, 0);
		},
		/**
		 * @private
		 */
		reset : function() {
			me.game.reset();
			if (this.addAsObject) {
				this.visible = true;
				this.rect = me.game.viewport.getRect();
				me.game.add(this, 999);
			}
			this.onResetEvent.apply(this, arguments);
			me.game.sort();
		},
		/**
		 * @private
		 */
		getRect : function() {
			return this.rect;
		},
		/**
		 * @private
		 */
		destroy : function() {
			this.onDestroyEvent.apply(this, arguments);
			return true;
		},
		/**
		 * @example
		 *
		 */
		update : function() {
			return false;
		},
		/**
		 * @private
		 */
		onUpdateFrame : function() {
			me.game.update();
			me.game.draw();
			me.video.blitSurface();
		},
		/**
		 * @example
		 */
		draw : function() {
		},
		/**
		 *	@param {String[]} [arguments] optional arguments passed when switching state
		 */
		onResetEvent : function() {
		},
		onDestroyEvent : function() {
		}
	});
	window.requestAnimFrame = (function() {
		return window.requestAnimationFrame
				|| window.webkitRequestAnimationFrame
				|| window.mozRequestAnimationFrame
				|| window.oRequestAnimationFrame
				|| window.msRequestAnimationFrame || function() {
					return -1;
				}
	})();
	window.cancelRequestAnimFrame = (function() {
		return window.cancelAnimationFrame
				|| window.webkitCancelRequestAnimationFrame
				|| window.mozCancelRequestAnimationFrame
				|| window.oCancelRequestAnimationFrame
				|| window.msCancelRequestAnimationFrame || function() {
					return -1;
				}
	})();
	/**
	 * @final
	 * @memberOf me
	 * @constructor Should not be called by the user.
	 */
	me.state = (function() {
		var obj = {};
		var _state = -1;
		var _intervalId = -1;
		var _animFrameId = -1;
		var _screenObject = {};
		var _fade = {
			color : "",
			duration : 0
		};
		/** @private */
		var _onSwitchComplete = null;
		var _extraArgs = null;
		var _activeUpdateFrame = null;
		var _fps = null;
		/**
		 * @ignore
		 */
		function _startRunLoop() {
			if ((_intervalId == -1) && (_animFrameId == -1)) {
				me.timer.reset();
				if (me.sys.useNativeAnimFrame) {
					_animFrameId = window.requestAnimFrame(_renderFrame);
					if (_animFrameId != -1) {
						return;
					}
					me.sys.useNativeAnimFrame = false;
				}
				_intervalId = setInterval(_activeUpdateFrame, _fps);
			}
		}
		;
		/**
		 * @ignore
		 */
		function _renderFrame() {
			_activeUpdateFrame();
			window.requestAnimFrame(_renderFrame);
		}
		;
		/**
		 * @ignore
		 */
		function _stopRunLoop() {
			if (_intervalId != -1) {
				clearInterval(_intervalId);
				_intervalId = -1;
			}
			if (_animFrameId != -1) {
				cancelRequestAnimFrame(_animFrameId);
				_animFrameId = -1;
			}
		}
		;
		/**
		 * @ignore
		 */
		function _switchState(state) {
			_stopRunLoop();
			if (_screenObject[_state]) {
				if (_screenObject[_state].screen.visible)
					me.game.remove(_screenObject[_state].screen);
				else
					_screenObject[_state].screen.destroy();
			}
			if (_screenObject[state])
			{
				_state = state;
				_screenObject[_state].screen.reset.apply(_screenObject[_state].screen, _extraArgs);
				_activeUpdateFrame = _screenObject[_state].screen.onUpdateFrame.bind(_screenObject[_state].screen);
				_startRunLoop();
				if (_onSwitchComplete) {
					_onSwitchComplete();
				}
				me.game.repaint();
			 }
		};
		/**
		 * @constant
		 * @name me.state#LOADING
		 */
		obj.LOADING = 0;
		/**
		 * @constant
		 * @name me.state#MENU
		 */
		obj.MENU = 1;
		/**
		 * @constant
		 * @name me.state#READY
		 */
		obj.READY = 2;
		/**
		 * @constant
		 * @name me.state#PLAY
		 */
		obj.PLAY = 3;
		/**
		 * @constant
		 * @name me.state#GAMEOVER
		 */
		obj.GAMEOVER = 4;
		/**
		 * @constant
		 * @name me.state#GAME_END
		 */
		obj.GAME_END = 5;
		/**
		 * @constant
		 * @name me.state#SCORE
		 */
		obj.SCORE = 6;
		/**
		 * @constant
		 * @name me.state#CREDITS
		 */
		obj.CREDITS = 7;
		/**
		 * @constant
		 * @name me.state#SETTINGS
		 */
		obj.SETTINGS = 8;
		/**
		 * @type function
		 * @name me.state#onPause
		 */
		obj.onPause = null;
		/**
		 * @type function
		 * @name me.state#onResume
		 */
		obj.onResume = null;
		/**
		 * @ignore
		 */
		obj.init = function() {
			obj.set(obj.LOADING, me.loadingScreen);
			$.addEventListener("blur", function() {
				if (_state != obj.LOADING) {
					obj.pause(true);
					if (obj.onPause)
						obj.onPause();
				}
			}, false);
			$.addEventListener("focus", function() {
				if (_state != obj.LOADING) {
					obj.resume(true);
					if (obj.onResume)
						obj.onResume();
					me.game.repaint();
				}
			}, false);
			_fps = ~~(1000 / me.sys.fps);
		};
		/**
		 * @name me.state#pause
		 * @public
		 * @function
		 * @param {Boolean} pauseTrack pause current track on screen pause
		 */
		obj.pause = function(music) {
			_stopRunLoop();
			if (music)
				me.audio.pauseTrack();
		};
		/**
		 * @name me.state#resume
		 * @public
		 * @function
		 * @param {Boolean} resumeTrack resume current track on screen resume
		 */
		obj.resume = function(music) {
			_startRunLoop(_state);
			if (music)
				me.audio.resumeTrack();
		};
		/**
		 * @name me.state#isRunning
		 * @public
		 * @function
		 * @param {Boolean} true if a "process is running"
		 */
		obj.isRunning = function() {
			return ((_intervalId != -1) || (_animFrameId != -1))
		};
		/**
		 * @name me.state#set
		 * @public
		 * @function
		 * @param {Int} state @see me.state#Constant
		 * @param {me.ScreenObject} so
		 */
		obj.set = function(state, so) {
			_screenObject[state] = {};
			_screenObject[state].screen = so;
			_screenObject[state].transition = true;
		};
		/**
		 * @name me.state#current
		 * @public
		 * @function
		 * @return {me.ScreenObject} so
		 */
		obj.current = function() {
			return _screenObject[_state].screen;
		};
		/**
		 * @name me.state#transition
		 * @public
		 * @function
		 * @param {String} effect (only "fade" is supported for now)
		 * @param {String} color in RGB format (e.g. "#000000")
		 * @param {Int} [duration="1000"] in ms
		 */
		obj.transition = function(effect, color, duration) {
			if (effect == "fade") {
				_fade.color = color;
				_fade.duration = duration;
			}
		};
		/**
		 * @name me.state#setTransition
		 * @public
		 * @function
		 */
		obj.setTransition = function(state, enable) {
			_screenObject[state].transition = enable;
		};
		/**
		 * @name me.state#change
		 * @public
		 * @function
		 * @param {Int} state @see me.state#Constant
		 * @param {Arguments} [args] extra arguments to be passed to the reset functions
		 */
		obj.change = function(state) {
			switch (state) {
				default: {
					_extraArgs = null;
					if (arguments.length > 1) {
						_extraArgs = Array.prototype.slice.call(arguments, 1);
					}
					if (_fade.duration && _screenObject[state].transition) {
						/** @private */
						_onSwitchComplete = function() {
							me.game.viewport.fadeOut(_fade.color, _fade.duration);
						};
						me.game.viewport.fadeIn(_fade.color, _fade.duration,
								function() {
									_switchState(state);
								});
					}
					else {
						_switchState.defer(state);
					}
					break;
				}
			}
		};
		/**
		 * @name me.state#isCurrent
		 * @public
		 * @function
		 * @param {Int} state @see me.state#Constant
		 */
		obj.isCurrent = function(state) {
			return _state == state;
		};
		return obj;
	})();
})(window);
(function($, undefined) {
	/**
	 * a default loading screen
	 * @memberOf me
	 * @private
	 * @constructor
	 */
	me.DefaultLoadingScreen = me.ScreenObject.extend({
		/*---
			constructor
			---*/
		init : function() {
			this.parent(true);
			this.logo1 = new me.Font('century gothic', 32, 'white');
			this.logo2 = new me.Font('century gothic', 32, '#89b002');
			this.logo2.bold();
			this.invalidate = false;
			this.loadPercent = 0;
			me.loader.onProgress = this.onProgressUpdate.bind(this);
		},
		onDestroyEvent : function() {
			this.logo1 = this.logo2 = null;
		},
		onProgressUpdate : function(progress) {
			this.loadPercent = progress;
			this.invalidate = true;
		},
		update : function() {
			if (this.invalidate === true) {
				this.invalidate = false;
				return true;
			}
			return false;
		},
		/*---
			draw function
		  ---*/
		draw : function(context) {
			var y = context.canvas.height / 2;
			var logo1_width = this.logo1.measureText(context, "melon").width;
			var logo_width = logo1_width + this.logo2.measureText(context, "JS").width;
			me.video.clearSurface(context, "black");
			this.logo1.draw(context, 'melon',
					((context.canvas.width - logo_width) / 2),
					(context.canvas.height + 60) / 2);
			this.logo2.draw(context, 'JS',
					((context.canvas.width - logo_width) / 2) + logo1_width,
					(context.canvas.height + 60) / 2);
			y += 40;
			var width = Math.floor(this.loadPercent * context.canvas.width);
			context.strokeStyle = "silver";
			context.strokeRect(0, y, context.canvas.width, 6);
			context.fillStyle = "#89b002";
			context.fillRect(2, y + 2, width - 4, 2);
		}
	});
	/************************************************************************************/
	/*			PRELOADER SINGLETON																			*/
	/************************************************************************************/
	/**
	 * a small class to manage loading of stuff and manage resources
	 * There is no constructor function for me.input.
	 * @final
	 * @memberOf me
	 * @constructor Should not be called by the user.
	 */
	me.loader = (function() {
		var obj = {};
		var imgList = [];
		var xmlList = {};
		var binList = {};
		var resourceCount = 0;
		var loadCount = 0;
		var timerId = 0;
		var tmxCount = 0;
		/**
		 * check the loading status
		 * @private
		 */
		function checkLoadStatus() {
			if (loadCount == (resourceCount - tmxCount)) {
				for ( var xmlObj in xmlList) {
					if (xmlList[xmlObj].isTMX) {
						me.levelDirector.addTMXLevel(xmlObj);
						obj.onResourceLoaded();
					}
				}
				if (obj.onload) {
					timerId = setTimeout(obj.onload, 300);
				} else
					alert("no load callback defined");
			} else {
				timerId = setTimeout(checkLoadStatus, 100);
			}
		};
		/**
		 * load Images
		 *
		 *	call example :
		 *
		 *	preloadImages(
		 *				 [{name: 'image1', src: 'images/image1.png'},
		 * 				  {name: 'image2', src: 'images/image2.png'},
		 *				  {name: 'image3', src: 'images/image3.png'},
		 *				  {name: 'image4', src: 'images/image4.png'}]);
		 * @private
		 */
		function preloadImage(img, onload, onerror) {
			imgList.push(img.name);
			imgList[img.name] = new Image();
			imgList[img.name].onload = onload;
			imgList[img.name].onerror = onerror;
			imgList[img.name].src = img.src + me.nocache;
		};
		/**
		 * preload XML files
		 * @private
		 */
		function preloadXML(xmlData, isTMX, onload, onerror) {
			var onloadCB = onload;
			if ($.XMLHttpRequest) {
				var xmlhttp = new XMLHttpRequest();
				if (xmlhttp.overrideMimeType)
					xmlhttp.overrideMimeType('text/xml');
			} else {
				var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			}
			xmlhttp.open("GET", xmlData.src + me.nocache, false);
			xmlhttp.onerror = onerror;
			xmlhttp.onload = function(event) {
				xmlList[xmlData.name] = {};
				xmlList[xmlData.name].xml = xmlhttp.responseText;
				xmlList[xmlData.name].isTMX = isTMX;
				onloadCB();
			};
			if (isTMX) {
				this.resourceCount += 1;
				this.tmxCount += 1;
			}
			xmlhttp.send();
		};
		/**
		 * preload Binary files
		 * @private
		 */
		function preloadBinary(data, onload, onerror) {
			var onloadCB = onload;
			var httpReq = new XMLHttpRequest();
			httpReq.open("GET", data.src + me.nocache, false);
			httpReq.responseType = "arraybuffer";
			xmlhttp.onerror = onerror;
			httpReq.onload = function(event){
				var arrayBuffer = httpReq.response;
				if (arrayBuffer) {
					var byteArray = new Uint8Array(arrayBuffer);
					var buffer = [];
					binList[data.name] = new dataType();
					for (var i = 0; i < byteArray.byteLength; i++) {
						buffer[i] = String.fromCharCode(byteArray[i]);
					}
					binList[data.name].data = buffer.join("");
					onloadCB();
				}
			};
			httpReq.send();
		};
		/* ---
			PUBLIC STUFF
			---										*/
		/* ---
			onload callback : to be initialized
			---*/
		/**
		 * onload callback
		 * @public
		 * @type Function
		 * @name me.loader#onload
		 * @example
		 *
		 *
		 * me.loader.onload = this.loaded.bind(this);
		 */
		obj.onload = undefined;
		/**
		 * onProgress callback<br>
		 * each time a resource is loaded, the loader will fire the specified function,
		 * giving the actual progress [0 ... 1], as argument.
		 * @public
		 * @type Function
		 * @name me.loader#onProgress
		 * @example
		 *
		 *
		 * me.loader.onProgress = this.updateProgress.bind(this);
		 */
		obj.onProgress = undefined;
		/**
		 *	just increment the number of already loaded resources
		 * @private
		 */
		obj.onResourceLoaded = function(e) {
			loadCount++;
			if (obj.onProgress) {
				obj.onProgress(obj.getLoadProgress());
			}
		};
		/**
		 * on error callback for image loading
		 * @private
		 */
		obj.onLoadingError = function(res) {
			throw "melonJS: Failed loading resource " + res.src;
		};
		/**
		 * set all the specified game resources to be preloaded.<br>
		 * each resource item must contain the following fields :<br>
		 * - name    : internal name of the resource<br>
		 * - type    : "image", "tmx", "audio"<br>
		 * - src     : path and file name of the resource<br>
		 * (!) for audio :<br>
		 * - src     : path (only) where resources are located<br>
		 * - channel : number of channels to be created<br>
		 * <br>
		 * @name me.loader#preload
		 * @public
		 * @function
		 * @param {Array.<string>} resources
		 * @example
		 * var g_resources = [ {name: "tileset-platformer",  type:"image",   src: "data/map/tileset-platformer.png"},
		 *                     {name: "map1",                type: "tmx",    src: "data/map/map1_slopes.tmx"},
		 *                     {name: "cling",               type: "audio",  src: "data/audio/",	channel : 2},
		 *                     {name: "ymTrack",             type: "binary", src: "data/audio/main.ym"}
		 *
		 *                    ];
		 * ...
		 *
		 *
		 * me.loader.preload(g_resources);
		 */
		obj.preload = function(res) {
			for ( var i = 0; i < res.length; i++) {
				resourceCount += obj.load(res[i], obj.onResourceLoaded.bind(obj), obj.onLoadingError.bind(obj, res[i]));
			};
			checkLoadStatus();
		};
		/**
		 * Load a single resource (to be used if you need to load additional resource during the game)<br>
		 * Given parmeter must contain the following fields :<br>
		 * - name    : internal name of the resource<br>
		 * - type    : "binary", "image", "tmx", "audio"
		 * - src     : path and file name of the resource<br>
		 * @name me.loader#load
		 * @public
		 * @function
		 * @param {Object} resource
		 * @param {Function} onload function to be called when the resource is loaded
		 * @param {Function} onerror function to be called in case of error
		 * @example
		 *
		 * me.loader.load({name: "avatar",  type:"image",  src: "data/avatar.png"}, this.onload.bind(this), this.onerror.bind(this));
		 */
		obj.load = function(res, onload, onerror) {
			res.name = res.name.toLowerCase();
			switch (res.type) {
				case "binary":
					preloadBinary(res, onload, onerror);
					return 1;
				case "image":
					preloadImage(res, onload, onerror);
					return 1;
				case "tmx":
					preloadXML(res, true, onload, onerror);
					return 1;
				case "audio":
					me.audio.setLoadCallback(onload);
					if (me.audio.isAudioEnable()) {
						me.audio.load(res);
						return 1;
					}
					break;
				default:
					throw "melonJS: me.loader.load : unknow or invalide resource type : %s"	+ res.type;
					break;
			};
			return 0;
		};
		/**
		 * return the specified XML object
		 * @name me.loader#getXML
		 * @public
		 * @function
		 * @param {String} xmlfile name of the xml element ("map1");
		 * @return {Xml}
		 */
		obj.getXML = function(elt) {
			elt = elt.toLowerCase();
			if (xmlList != null)
				return xmlList[elt].xml;
			else {
				return null;
			}
		};
		/**
		 * return the specified Binary object
		 * @name me.loader#getBinary
		 * @public
		 * @function
		 * @param {String} name of the binary object ("ymTrack");
		 * @return {Object}
		 */
		obj.getBinary = function(elt) {
			elt = elt.toLowerCase();
			if (binList != null)
				return binList[elt];
			else {
				return null;
			}
		};
		/**
		 * return the specified Image Object
		 * @name me.loader#getImage
		 * @public
		 * @function
		 * @param {String} Image name of the Image element ("tileset-platformer");
		 * @return {Image}
		 */
		obj.getImage = function(elt) {
			elt = elt.toLowerCase();
			if (imgList[elt] != null) {
				if (me.sys.cacheImage === true) {
					var tempCanvas = me.video.createCanvasSurface(
							imgList[elt].width, imgList[elt].height);
					tempCanvas.drawImage(imgList[elt], 0, 0);
					return tempCanvas.canvas;
				} else {
					return imgList[elt];
				}
			} else {
				return null;
			}
		};
		/**
		 * Return the loading progress in percent
		 * @name me.loader#getLoadProgress
		 * @public
		 * @function
		 * @deprecated use callback instead
		 * @return {Number}
		 */
		obj.getLoadProgress = function() {
			return loadCount / resourceCount;
		};
		return obj;
	})();
	/*---------------------------------------------------------*/
	/*---------------------------------------------------------*/
})(window);
/*
 * MelonJS Game Engine
 * Copyright (C) 2012, Olivier BIOT
 * http:
 *
 */
(function($, undefined) {
	/************************************************************************************/
	/*                                                                                  */
	/*      a vector2D Object                                                           */
	/*                                                                                  */
	/************************************************************************************/
	/**
	 * a 2D Vector Object
	 * @class
	 * @extends Object
	 * @memberOf me
	 * @constructor
	 * @param {int} x x position of the vector
	 * @param {int} y y position of the vector
	 */
	me.Vector2d = Object.extend(
	/** @scope me.Vector2d.prototype */
	{
		/**
		 * x value of the vector
		 * @public
		 * @type Number
		 * @name me.Vector2d#x
		 */
		x : 0,
		/**
		 * y value of the vector
		 * @public
		 * @type Number
		 * @name me.Vector2d#y
		 */
		y : 0,
		/** @private */
		init : function(/**Int*/ x, /**Int*/ y) {
			this.x = x || 0;
			this.y = y || 0;
		},
		set : function(/**Int*/ x, /**Int*/ y) {
			this.x = x;
			this.y = y;
		},
		setZero : function() {
			this.set(0, 0);
		},
		setV : function(/**me.Vector2d*/ v) {
			this.x = v.x;
			this.y = v.y;
		},
		add : function(/**me.Vector2d*/ v) {
			this.x += v.x;
			this.y += v.y;
		},
		sub : function(/**me.Vector2d*/ v) {
			this.x -= v.x;
			this.y -= v.y;
		},
		scale : function(/**me.Vector2d*/ v) {
			this.x *= v.x;
			this.y *= v.y;
		},
		div : function(/**Int*/	n) {
			this.x /= n;
			this.y /= n;
		},
		abs : function() {
			if (this.x < 0)
				this.x = -this.x;
			if (this.y < 0)
				this.y = -this.y;
		},
		/** @return {me.Vector2D} */
		clamp : function(low, high) {
			return new me.Vector2d(this.x.clamp(low, high), this.y
					.clamp(low, high));
		},
		minV : function(/**me.Vector2d*/ v) {
			this.x = this.x < v.x ? this.x : v.x;
			this.y = this.y < v.y ? this.y : v.y;
		},
		maxV : function(/**me.Vector2d*/ v) {
			this.x = this.x > v.x ? this.x : v.x;
			this.y = this.y > v.y ? this.y : v.y;
		},
		/** @return {me.Vector2D} New Vector2d */
		floor : function() {
			return new me.Vector2d(~~this.x, ~~this.y);
		},
		/** @return {me.Vector2D} New Vector2d */
		ceil : function() {
			return new me.Vector2d(Math.ceil(this.x), Math.ceil(this.y));
		},
		/** @return {me.Vector2D} New Vector2d */
		negate : function() {
			return new me.Vector2d(-this.x, -this.y);
		},
		negateSelf : function() {
			this.x = -this.x;
			this.y = -this.y;
		},
		copy : function(/**me.Vector2d*/ v) {
			this.x = v.x;
			this.y = v.y;
		},
		/** @return {int} */
		length : function() {
			return Math.sqrt(this.x * this.x + this.y * this.y);
		},
		normalize : function() {
			var len = this.length();
			if (len < Number.MIN_VALUE) {
				return 0.0;
			}
			var invL = 1.0 / len;
			this.x *= invL;
			this.y *= invL;
			return len;
		},
		/** @return {int} */
		dotProduct : function(/**me.Vector2d*/ v) {
			return this.x * v.x + this.y * v.y;
		},
		/** @return {int} */
		distance : function(/**me.Vector2d*/ v) {
			return Math.sqrt((this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y));
		},
		/** @return {me.Vector2d} */
		clone : function() {
			return new me.Vector2d(this.x, this.y);
		},
		/** @return {String} */
		toString : function() {
			return 'x:' + this.x + 'y:' + this.y;
		}
	});
	/************************************************************************************/
	/*                                                                                  */
	/*      a rectangle Class Object                                                    */
	/*                                                                                  */
	/************************************************************************************/
	/**
	 * a rectangle Object
	 * @class
	 * @extends Object
	 * @memberOf me
	 * @constructor
	 * @param {me.Vector2d} v x,y position of the rectange
	 * @param {int} w width of the rectangle
	 * @param {int} h height of the rectangle
	 */
	me.Rect = Object
			.extend(
			/** @scope me.Rect.prototype */
			{
				/**
				 * position of the Rectange
				 * @public
				 * @type me.Vector2d
				 * @name me.Rect#pos
				 */
				pos : null,
				/**
				 * allow to reduce the collision box size<p>
				 * while keeping the original position vector (pos)<p>
				 * corresponding to the entity<p>
				 * colPos is a relative offset to pos
				 * @private
				 * @type me.Vector2d
				 * @name me.Rect#colPos
				 * @see me.Rect#adjustSize
				 */
				colPos : null,
				/**
				 * left coordinate of the Rectange<br>
				 * takes in account the adjusted size of the rectangle (if set)
				 * @public
				 * @type Int
				 * @name me.Rect#left
				 */
				left : null,
				/**
				 * right coordinate of the Rectange<br>
				 * takes in account the adjusted size of the rectangle (if set)
				 * @public
				 * @type Int
				 * @name me.Rect#right
				 */
				right : null,
				/**
				 * top coordinate of the Rectange<br>
				 * takes in account the adjusted size of the rectangle (if set)
				 * @public
				 * @type Int
				 * @name me.Rect#top
				 */
				top : null,
				/**
				 * bottom coordinate of the Rectange<br>
				 * takes in account the adjusted size of the rectangle (if set)
				 * @public
				 * @type Int
				 * @name me.Rect#bottom
				 */
				bottom : null,
				/**
				 * width of the Rectange
				 * @public
				 * @type Int
				 * @name me.Rect#width
				 */
				width : 0,
				/**
				 * height of the Rectange
				 * @public
				 * @type Int
				 * @name me.Rect#height
				 */
				height : 0,
				hWidth : 0,
				hHeight : 0,
				hProp : false,
				vProp : false,
				/** @private */
				init : function(v, w, h) {
					this.pos = v;
					this.colPos = new me.Vector2d();
					this.width = w;
					this.height = h;
					this.hWidth = ~~(w / 2);
					this.hHeight = ~~(h / 2);
					Object.defineProperty(this, "left", {
						get : function() {
							return this.pos.x;
						},
						configurable : true
					});
					Object.defineProperty(this, "right", {
						get : function() {
							return this.pos.x + this.width;
						},
						configurable : true
					});
					Object.defineProperty(this, "top", {
						get : function() {
							return this.pos.y;
						},
						configurable : true
					});
					Object.defineProperty(this, "bottom", {
						get : function() {
							return this.pos.y + this.height;
						},
						configurable : true
					});
				},
				/**
				 * set new value to the rectangle
				 * @param {me.Vector2d} v x,y position for the rectangle
				 * @param {int} w width of the rectangle
				 * @param {int} h height of the rectangle
				 */
				set : function(v, w, h) {
					this.pos = v;
					this.width = w;
					this.height = h;
					this.hWidth = ~~(w / 2);
					this.hHeight = ~~(h / 2);
				},
				/**
				 * return a new Rect with this rectangle coordinates
				 * @return {me.Rect} new rectangle
				 */
				getRect : function() {
					return new me.Rect(this.pos.clone(), this.width,
							this.height);
				},
				/**
				 * merge this rectangle with another one
				 * @param {me.Rect} rect other rectangle to union with
				 * @return {me.Rect} the union(ed) rectangle
				 */
				union : function(/** {me.Rect} */ r) {
					var x1 = Math.min(this.pos.x, r.pos.x);
					var y1 = Math.min(this.pos.y, r.pos.y);
					this.width = Math.ceil(Math.max(this.pos.x + this.width,
							r.pos.x + r.width)
							- x1);
					this.height = Math.ceil(Math.max(this.pos.y + this.height,
							r.pos.y + r.height)
							- y1);
					this.pos.x = ~~x1;
					this.pos.y = ~~y1;
					return this;
				},
				/**
				 * update the size of the collision rectangle<br>
				 * the colPos Vector is then set as a relative offset to the initial position (pos)<br>
				 * <img src="me.Rect.colpos.png"/>
				 * @private
				 * @param {int} x x offset (specify -1 to not change the width)
				 * @param {int} w width of the hit box
				 * @param {int} y y offset (specify -1 to not change the height)
				 * @param {int} h height of the hit box
				 */
				adjustSize : function(x, w, y, h) {
					if (x != -1) {
						this.colPos.x = x;
						this.width = w;
						this.hWidth = ~~(this.width / 2);
						if (!this.hProp) {
							Object.defineProperty(this, "left", {
								get : function() {
									return this.pos.x + this.colPos.x;
								},
								configurable : true
							});
							Object.defineProperty(this, "right", {
								get : function() {
									return this.pos.x + this.colPos.x + this.width;
								},
								configurable : true
							});
							this.hProp = true;
						}
					}
					if (y != -1) {
						this.colPos.y = y;
						this.height = h;
						this.hHeight = ~~(this.height / 2);
						if (!this.vProp) {
							Object.defineProperty(this, "top", {
								get : function() {
									return this.pos.y + this.colPos.y;
								},
								configurable : true
							});
							Object.defineProperty(this, "bottom", {
								get : function() {
									return this.pos.y + this.colPos.y + this.height;
								},
								configurable : true
							});
							this.vProp = true;
						}
					}
				},
				/**
				 *
				 * flip on X axis
				 * usefull when used as collision box, in a non symetric way
				 * @private
				 * @param sw the sprite width
				 */
				flipX : function(sw) {
					this.colPos.x = sw - this.width - this.colPos.x;
					this.hWidth = ~~(this.width / 2);
				},
				/**
				 *
				 * flip on Y axis
				 * usefull when used as collision box, in a non symetric way
				 * @private
				 * @param sh the height width
				 */
				flipY : function(sh) {
					this.colPos.y = sh - this.height - this.colPos.y;
					this.hHeight = ~~(this.height / 2);
				},
				/**
				 * check if this rectangle is intersecting with the specified one
				 * @param  {me.Rect} rect
				 * @return {boolean} true if overlaps
				 */
				overlaps : function(r)	{
					return (this.left < r.right &&
							r.left < this.right &&
							this.top < r.bottom &&
							r.top < this.bottom);
				},
				/**
				 * check if this rectangle is within the specified one
				 * @param  {me.Rect} rect
				 * @return {boolean} true if within
				 */
				within: function(r) {
					return (r.left <= this.left &&
						    r.right >= this.right &&
						    r.top <= this.top &&
							r.bottom >= this.bottom);
                },
				/**
				 * check if this rectangle contains the specified one
				 * @param  {me.Rect} rect
				 * @return {boolean} true if contains
				 */
				contains: function(r) {
					return (r.left >= this.left &&
							r.right <= this.right &&
							r.top >= this.top &&
							r.bottom <= this.bottom);
                },
				/**
				 * check if this rectangle contains the specified point
				 * @param  {me.Vector2d} point
				 * @return {boolean} true if contains
				 */
				containsPoint: function(v) {
					return  (v.x >= this.left && v.x <= this.right &&
							(v.y >= this.top) && v.y <= this.bottom)
				},
				/**
				 * AABB vs AABB collission dectection<p>
				 * If there was a collision, the return vector will contains the following values:
				 * @example
				 * if (v.x != 0 || v.y != 0)
				 * {
				 *   if (v.x != 0)
				 *   {
				 *
				 *      if (v.x<0)
				 *         console.log("x axis : left side !");
				 *      else
				 *         console.log("x axis : right side !");
				 *   }
				 *   else
				 *   {
				 *
				 *      if (v.y<0)
				 *         console.log("y axis : top side !");
				 *      else
				 *         console.log("y axis : bottom side !");
				 *   }
				 *
				 * }
				 * @private
				 * @param {me.Rect} rect
				 * @return {me.Vector2d}
				 */
				collideVsAABB : function(/** {me.Rect} */ rect) {
					var p = new me.Vector2d(0, 0);
					if (this.overlaps(rect)) {
						var dx = this.left + this.hWidth  - rect.left - rect.hWidth;
						var dy = this.top  + this.hHeight - rect.top  - rect.hHeight;
						p.x = (rect.hWidth + this.hWidth) - (dx < 0 ? -dx : dx);
						p.y = (rect.hHeight + this.hHeight)
								- (dy < 0 ? -dy : dy);
						if (p.x < p.y) {
							p.y = 0;
							p.x = dx < 0 ? -p.x : p.x;
						} else {
							p.x = 0;
							p.y = dy < 0 ? -p.y : p.y;
						}
					}
					return p;
				},
				/**
				 * @private
				 * debug purpose
				 */
				draw : function(context, color) {
					context.strokeStyle = color || "red";
					context.strokeRect(this.left - me.game.viewport.pos.x,
							this.top - me.game.viewport.pos.y, this.width,
							this.height);
				}
	});
	/*---------------------------------------------------------*/
	/*---------------------------------------------------------*/
})(window);
/*
 * MelonJS Game Engine
 * Copyright (C) 2012, Olivier BIOT
 * http:
 *
 */
(function($, undefined) {
	var MIN = Math.min, MAX = Math.max;
	/************************************************************************************/
	/*		a viewport/camera entity																		*/
	/************************************************************************************/
	/**
	 * a camera/viewport Object
	 * @class
	 * @extends me.Rect
	 * @memberOf me
	 * @constructor
	 * @param {int} minX start x offset
	 * @param {int} minY start y offset
	 * @param {int} maxX end x offset
	 * @param {int} maxY end y offset
	 * @param {int} [realw] real world width limit
	 * @param {int} [realh] real world height limit
	 */
	me.Viewport = me.Rect
			.extend(
			/** @scope me.Viewport.prototype */
			{
				/**
				 *	Axis constant
				 * @public
				 * type enum
				 */
				AXIS : {
					NONE : 0,
					HORIZONTAL : 1,
					VERTICAL : 2,
					BOTH : 3
				},
				limits : null,
				target : null,
				follow_axis : 0,
				_shake : null,
				_fadeIn : null,
				_fadeOut : null,
				_deadwidth : 0,
				_deadheight : 0,
				_limitwidth : 0,
				_limitheight : 0,
				/** @private */
				init : function(minX, minY, maxX, maxY, realw, realh) {
					this.parent(new me.Vector2d(minX, minY), maxX - minX, maxY - minY);
					this.last = new me.Vector2d(-1, -1);
					this.limits = new me.Vector2d(realw||this.width, realh||this.height);
					this.target = null;
					this.follow_axis = this.AXIS.NONE;
					this._shake = {
						intensity : 0,
						duration : 0,
						axis : this.AXIS.BOTH,
						onComplete : null
					};
					this._fadeOut = {
						color : 0,
						alpha : 0.0,
						duration : 0,
						tween : null
					};
					this._fadeIn = {
						color : 0,
						alpha : 1.0,
						duration : 0,
						tween : null
					};
					this.setDeadzone(this.width / 6, this.height / 6);
				},
				/** @private */
				_followH : function(target) {
					if ((target.x - this.pos.x) > (this._deadwidth))
						this.pos.x = ~~MIN((target.x) - (this._deadwidth),
								this._limitwidth);
					else if ((target.x - this.pos.x) < (this.deadzone.x))
						this.pos.x = ~~MAX((target.x) - this.deadzone.x, 0);
				},
				/** @private */
				_followV : function(target) {
					if ((target.y - this.pos.y) > (this._deadheight))
						this.pos.y = ~~MIN((target.y) - (this._deadheight),
								this._limitheight);
					else if ((target.y - this.pos.y) < (this.deadzone.y))
						this.pos.y = ~~MAX((target.y) - this.deadzone.y, 0);
				},
				/**
				 * reset the viewport to specified coordinates
				 * @param {int} x
				 * @param {int} y
				 */
				reset : function(x, y) {
					this.pos.x = x || 0;
					this.pos.y = y || 0;
					this.last.set(-1, -1);
					this.target = null;
					this.follow_axis = null;
				},
				/**
				 * Change the deadzone settings
				 * @param {int} w deadzone width
				 * @param {int} h deadzone height
				 */
				setDeadzone : function(w, h) {
					this.deadzone = new me.Vector2d(~~((this.width - w) / 2),
							~~((this.height - h) / 2 - h * 0.25));
					this._deadwidth = this.width - this.deadzone.x;
					this._deadheight = this.height - this.deadzone.y;
					this.update(true);
				},
				/**
				 * set the viewport bound (real world limit)
				 * @param {int} w real world width
				 * @param {int} h real world height
				 */
				setBounds : function(w, h) {
					this.limits.set(w, h);
					this._limitwidth = this.limits.x - this.width;
					this._limitheight = this.limits.y - this.height;
				},
				/**
				 * set the viewport to follow the specified entity
				 * @param {Object} Object ObjectEntity or Position Vector to follow
				 * @param {axis} [axis="AXIS.BOTH"] AXIS.HORIZONTAL, AXIS.VERTICAL, AXIS.BOTH
				 */
				follow : function(target, axis) {
					if (target instanceof me.ObjectEntity)
						this.target = target.pos;
					else if (target instanceof me.Vector2d)
						this.target = target;
					else
						throw "melonJS: invalid target for viewport.follow";
					this.follow_axis = axis || this.AXIS.BOTH;
					this.update(true);
				},
				/**
				 *	move the viewport to the specified coordinates
				 * @param {int} x
				 * @param {int} y
				 */
				move : function(x, y) {
					var newx = ~~(this.pos.x + x);
					var newy = ~~(this.pos.y + y);
					if ((newx >= 0) && (newx <= this._limitwidth))
						this.pos.x = newx;
					if ((newy >= 0) && (newy <= this._limitheight))
						this.pos.y = newy;
				},
				/** @private */
				update : function(updateTarget) {
					if (this.target && updateTarget) {
						switch (this.follow_axis) {
						case this.AXIS.NONE:
							break;
						case this.AXIS.HORIZONTAL:
							this._followH(this.target,
									(this._shake.duration > 0));
							break;
						case this.AXIS.VERTICAL:
							this._followV(this.target,
									(this._shake.duration > 0));
							break;
						case this.AXIS.BOTH:
							this._followH(this.target,
									(this._shake.duration > 0));
							this._followV(this.target,
									(this._shake.duration > 0));
							break;
						default:
							break;
						}
						updateTarget = (this.last.x != this.pos.x)
								|| (this.last.y != this.pos.y)
						this.last.copy(this.pos);
					}
					if (this._shake.duration > 0) {
						this._shake.duration -= me.timer.tick;
						if (this._shake.duration < 0) {
							if (this._shake.onComplete)
								this._shake.onComplete();
						} else {
							if ((this._shake.axis == this.AXIS.BOTH)
									|| (this._shake.axis == this.AXIS.HORIZONTAL)) {
								var shakex = (Math.random() * this._shake.intensity);
								if (this.pos.x + this.width + shakex < this.limits.x)
									this.pos.x += ~~shakex;
								else
									this.pos.x -= ~~shakex;
							}
							if ((this._shake.axis == this.AXIS.BOTH)
									|| (this._shake.axis == this.AXIS.VERTICAL)) {
								var shakey = (Math.random() * this._shake.intensity);
								if (this.pos.y + this.height + shakey < this.limits.y)
									this.pos.y += ~~shakey;
								else
									this.pos.y -= ~~shakey;
							}
							updateTarget = true;
						}
					}
					if ((this._fadeIn.tween!=null) || (this._fadeOut.tween!=null)) {
						updateTarget = true;
					}
					return updateTarget;
				},
				/**
				 *	shake the camera
				 * @param {int} intensity maximum offset that the screen can be moved while shaking
				 * @param {int} duration expressed in frame
				 * @param {axis} axis specify on which axis you want the shake effect (AXIS.HORIZONTAL, AXIS.VERTICAL, AXIS.BOTH)
				 * @param {function} [onComplete] callback once shaking effect is over
				 * @example
				 *
				 * me.game.viewport.shake(10, 30, me.game.viewport.AXIS.BOTH);
				 */
				shake : function(intensity, duration, axis, onComplete) {
					axis = axis || this.AXIS.BOTH;
					if (axis == this.AXIS.BOTH) {
						if (this.width == this.limits.x)
							axis = this.AXIS.VERTICAL;
						else if (this.height == this.limits.y)
							axis = this.AXIS.HORIZONTAL;
					}
					if ((axis == this.AXIS.HORIZONTAL)
							&& (this.width == this.limits.x))
						return;
					if ((axis == this.AXIS.VERTICAL)
							&& (this.height == this.limits.y))
						return;
					this._shake.intensity = intensity;
					this._shake.duration = duration;
					this._shake.axis = axis;
					this._shake.onComplete = onComplete || null;
				},
				/**
				 * fadeOut(flash) effect<p>
				 * screen is filled with the specified color and slowy goes back to normal
				 * @param {string} color in #rrggbb format
				 * @param {Int} [duration="1000"] in ms
				 * @param {function} [onComplete] callback once effect is over
				 */
				fadeOut : function(color, duration, onComplete) {
					this._fadeOut.color = color;
					this._fadeOut.duration = duration || 1000;
					this._fadeOut.alpha = 1.0;
					this._fadeOut.tween = new me.Tween(this._fadeOut).to({alpha: 0.0}, this._fadeOut.duration ).onComplete(onComplete||null);
					this._fadeOut.tween.start();
				},
				/**
				 * fadeIn effect <p>
				 * fade to the specified color
				 * @param {string} color in #rrggbb format
				 * @param {int} [duration="1000"] in ms
				 * @param {function} [onComplete] callback once effect is over
				 */
				fadeIn : function(color, duration, onComplete) {
					this._fadeIn.color = color;
					this._fadeIn.duration = duration || 1000;
					this._fadeIn.alpha = 0.0;
					this._fadeIn.tween = new me.Tween(this._fadeIn).to({alpha: 1.0}, this._fadeIn.duration ).onComplete(onComplete||null);
					this._fadeIn.tween.start();
				},
				/**
				 *	return the viewport width
				 * @return {int}
				 */
				getWidth : function() {
					return this.width;
				},
				/**
				 *	return the viewport height
				 * @return {int}
				 */
				getHeight : function() {
					return this.height;
				},
				/**
				 *	set the viewport around the specified entity<p>
				 * <b>BROKEN !!!!</b>
				 * @private
				 * @param {Object}
				 */
				focusOn : function(target) {
					this.pos.x = target.x - this.width * 0.5;
					this.pos.y = target.y - this.height * 0.5;
				},
				/**
				 *	check if the specified rectange is in the viewport
				 * @param {me.Rect} rect
				 * @return {boolean}
				 */
				isVisible : function(rect) {
					return rect.overlaps(this);
				},
				/**
				 * @private
				 *	render the camera effects
				 */
				draw : function(context) {
					if (this._fadeIn.tween) {
						if (me.sys.enableWebGL) {
							me.video.clearSurface(context, me.utils.HexToRGB(this._fadeIn.color, this._fadeIn.alpha));
						} else {
							context.globalAlpha = this._fadeIn.alpha;
							me.video.clearSurface(context, me.utils.HexToRGB(this._fadeIn.color));
							context.globalAlpha = 1.0;
						}
						if (this._fadeIn.alpha==1.0)
							this._fadeIn.tween = null;
					}
					if (this._fadeOut.tween) {
						if (me.sys.enableWebGL) {
							me.video.clearSurface(context, me.utils.HexToRGB(this._fadeOut.color, this._fadeOut.alpha));
						} else {
							context.globalAlpha = this._fadeOut.alpha;
							me.video.clearSurface(context, me.utils.HexToRGB(this._fadeOut.color));
							context.globalAlpha = 1.0;
						}
						if (this._fadeOut.alpha==0.0)
							this._fadeOut.tween = null;
					}
				}
			});
	/*---------------------------------------------------------*/
	/*---------------------------------------------------------*/
})(window);
/*
 * MelonJS Game Engine
 * Copyright (C) 2012, Olivier BIOT
 * http:
 *
 */
(function($, undefined) {
	var MIN = Math.min;
	/**
	 * me.ObjectSettings contains the object attributes defined in Tiled<br>
	 * and is created by the engine and passed as parameter to the corresponding object when loading a level<br>
	 * the field marked Mandatory are to be defined either in Tiled, or in the before calling the parent constructor
	 * <img src="object_properties.png"/><br>
	 * @final
	 * @memberOf me
	 * @constructor Should not be called by the user.
	 */
	me.ObjectSettings = {
		/**
		 * object entity name<br>
		 * as defined in the Tiled Object Properties
		 * @public
		 * @type {String}
		 * @name me.ObjectSettings#name
		 */
		name : null,
		/**
		 * image ressource name to be loaded<br>
		 * MANDATORY<br>
		 * (in case of TiledObject, this field is automatically set)
		 * @public
		 * @type {String}
		 * @name me.ObjectSettings#image
		 */
		image : null,
		/**
		 * specify a transparent color for the image in rgb format (rrggb or #rrggb)<br>
		 * OPTIONAL<br>
		 * (using this option will imply processing time on the image)
		 * @public
		 * @type {String}
		 * @name me.ObjectSettings#transparent_color
		 */
		transparent_color : null,
		/**
		 * width of a single sprite in the spritesheet<br>
		 * MANDATORY<br>
		 * (in case of TiledObject, this field is automatically set)
		 * @public
		 * @type {Int}
		 * @name me.ObjectSettings#spritewidth
		 */
		spritewidth : null,
		/**
		 * height of a single sprite in the spritesheet<br>
		 * OPTIONAL<br>
		 * if not specified the value will be set to the corresponding image height<br>
		 * (in case of TiledObject, this field is automatically set)
		 * @public
		 * @type {Int}
		 * @name me.ObjectSettings#spriteheight
		 */
		spriteheight : null,
		/**
		 * custom type for collision detection<br>
		 * OPTIONAL
		 * @public
		 * @type {String}
		 * @name me.ObjectSettings#type
		 */
		type : 0,
		/**
		 * Enable collision detection for this object<br>
		 * OPTIONAL
		 * @public
		 * @type {Boolean}
		 * @name me.ObjectSettings#collidable
		 */
		collidable : false
	};
	/************************************************************************************/
	/*		a pool of entity																					*/
	/*    allowing to add new entity at runtime														*/
	/************************************************************************************/
	/**
	 * a pool of object entity <br>
	 * this object is used by the engine to instanciate object defined in the map<br>
	 * which means, that on level loading the engine will try to instanciate every object<br>
	 * found in the map, based on the user defined name in each Object Properties<br>
	 * <img src="object_properties.png"/><br>
	 * There is no constructor function for me.entityPool, this is a static object
	 * @final
	 * @memberOf me
	 * @constructor Should not be called by the user.
	 */
	me.entityPool = (function() {
		var obj = {};
		/*---------------------------------------------
			PRIVATE STUFF
		---------------------------------------------*/
		var entityClass = {};
		/*---------------------------------------------
			PUBLIC STUFF
		---------------------------------------------*/
		/*---
			init
			---*/
		obj.init = function() {
			obj.add("me.LevelEntity", me.LevelEntity);
			obj.add("me.ObjectEntity", me.ObjectEntity);
			obj.add("me.CollectableEntity", me.CollectableEntity);
			obj.add("me.InvisibleEntity", me.InvisibleEntity);
		};
		/**
		 * add an object to the pool
		 * @name me.entityPool#add
		 * @public
		 * @function
		 * @param {String} className as defined in the Name fied of the Object Properties (in Tiled)
		 * @param {Object} object corresponding Object to be instanciated
		 * @example
		 *
		 * me.entityPool.add("playerspawnpoint", PlayerEntity);
		 * me.entityPool.add("cherryentity", CherryEntity);
		 * me.entityPool.add("heartentity", HeartEntity);
		 * me.entityPool.add("starentity", StarEntity);
		 */
		obj.add = function(className, entityObj) {
			entityClass[className.toLowerCase()] = entityObj;
		};
		/**
		 *	return a new instance of the requested object
		 * @private
		 */
		obj.newIstanceOf = function(prop) {
			if (!entityClass[prop.name.toLowerCase()]) {
				alert("cannot instance entity of type '" + prop.name
						+ "': Class not found!");
				return null;
			}
			return new entityClass[prop.name.toLowerCase()](prop.x, prop.y, prop);
		};
		return obj;
	})();
	/************************************************************************/
	/*      a parallax layer object entity                                  */
	/************************************************************************/
	/**
	 * @ignore
	 */
	var ParallaxLayer = me.Rect.extend({
		/**
		 * @ignore
		 */
		init : function(imagesrc, speed, zOrder) {
			this.image = me.loader.getImage(imagesrc);
			if (this.image==null)
				throw "melonJS: image " + imagesrc + " for Parallax Layer not found!";
			this.parent(new me.Vector2d(0, 0), this.image.width, this.image.height);
			this.baseOffset = 0;
			this.z = zOrder || 0;
			this.scrollspeed = speed;
			this.vp_width = me.game.viewport.width;
		},
		/*--
		   draw the layer
		   x coordinate is the current base offset in the texture
		--*/
		draw : function(context, x, y) {
			var xpos = 0;
			var new_width = MIN(this.width - x, this.vp_width);
			do {
				context.drawImage(this.image, x, 0, new_width, this.height,
						xpos, y, new_width, this.height);
				xpos += new_width;
				x = 0;
				new_width = MIN(this.width, this.vp_width - xpos);
			} while ((xpos < this.vp_width));
		}
	});
	/************************************************************************************/
	/*      a very basic & cheap parallax object entity                                 */
	/*      to be rewritten, this code is not optimized at all                          */
	/************************************************************************************/
	/**
	 * @constructor
	 * @memberOf me
	 *	@param {int} [z="0"] z order value for the parallax background
	 */
	me.ParallaxBackgroundEntity = me.Rect
			.extend({
				/**
				 * @ignore
				 */
				init : function(z) {
					this.parent(new me.Vector2d(0, 0), 0, 0);
					this.name = "parallaxBackgroundEntity";
					this.visible = true;
					this.z = z || 0;
					this.vp = me.game.viewport.pos;
					this.lastx = this.vp.x;
					this.parallaxLayers = [];
					this.updated = true;
				},
				/**
				 * add a layer to the parallax
				 */
				addLayer : function(imagesrc, speed, zOrder) {
					var idx = this.parallaxLayers.length;
					this.parallaxLayers.push(new ParallaxLayer(imagesrc, speed,
							zOrder));
					if (this.parallaxLayers[idx].width > this.width) {
						this.width = this.parallaxLayers[idx].width;
					}
					if (this.parallaxLayers[idx].height > this.height) {
						this.height = this.parallaxLayers[idx].height;
					}
				},
				/**
				 * @private
				 */
				clearTile : function(x, y) {
					;
				},
				/**
				 * this method is called by the @see me.game object
				 * @protected
				 */
				update : function() {
					return this.updated;
				},
				/**
				 * override the default me.Rect get Rectangle definition
				 * since the layer if a scrolling object
				 * (is this correct?)
				 * @return {me.Rect} new rectangle
				 */
				getRect : function() {
					return new me.Rect(this.vp.clone(), this.width, this.height);
				},
				/**
				 * draw the parallax object on the specified context
				 * @param {context} context 2D Context
				 * @protected
				 */
				draw : function(context) {
					var x = this.vp.x;
					if (x > this.lastx) {
						for ( var i = 0, layer; layer = this.parallaxLayers[i++];) {
							layer.baseOffset = (layer.baseOffset + layer.scrollspeed
									* me.timer.tick)
									% layer.width;
							layer.draw(context, ~~layer.baseOffset, 0);
							this.lastx = x;
							this.updated = true;
						}
						return;
					} else if (x < this.lastx) {
						for ( var i = 0, layer; layer = this.parallaxLayers[i++];) {
							layer.baseOffset = (layer.width + (layer.baseOffset - layer.scrollspeed
									* me.timer.tick))
									% layer.width;
							layer.draw(context, ~~layer.baseOffset, 0);
							this.lastx = x;
							this.updated = true;
						}
						return;
					}
					for ( var i = 0, layer; layer = this.parallaxLayers[i++];) {
						layer.draw(context, ~~layer.baseOffset, 0);
						this.lastx = x;
						this.updated = false;
					}
				}
			});
	/**
	 * A Simple object to display a sprite on screen.
	 * @class
	 * @extends me.Rect
	 * @memberOf me
	 * @constructor
	 * @param {int} x the x coordinates of the sprite object
	 * @param {int} y the y coordinates of the sprite object
	 * @param {me.loader#getImage} image reference to the Sprite Image
	 * @param {int} [spritewidth] sprite width
	 * @param {int} [spriteheigth] sprite height
	 * @example
	 *
	 * mySprite = new SpriteObject (100, 100, me.loader.getImage("mySpriteImage"));
	 */
	me.SpriteObject = me.Rect
			.extend(
			/** @scope me.SpriteObject.prototype */
			{
				scale	   : null,
				scaleFlag : false,
				lastflipX : false,
				lastflipY : false,
				z : 0,
				offset : null,
				/**
				 * a flag that can prevent the object to be destroyed<br>
				 * if set to false, the objet won't be destroy when calling me.game.remove(obj)<br>
				 * default value : true
				 * @public
				 * @type Boolean
				 * @name me.SpriteObject#autodestroy
				 */
				autodestroy : true,
				/**
				 * the visible state of the object<br>
				 * default value : true
				 * @public
				 * @type Boolean
				 * @name me.SpriteObject#visible
				 */
				visible : true,
				image : null,
				collisionBox : null,
				flickering : false,
				flickerTimer : -1,
				flickercb : null,
				flickerState : false,
				vp : null,
				/**
				 * @ignore
				 */
				init : function(x, y, image, spritewidth, spriteheight) {
					this.parent(new me.Vector2d(x, y),
								spritewidth  || image.width,
								spriteheight || image.height);
					this.image = image;
					this.scale = new me.Vector2d(1.0, 1.0);
					this.collisionBox = new me.Rect(this.pos, this.width, this.height);
					this.vp = me.game.viewport;
					this.offset = new me.Vector2d(0, 0);
					this.spritecount = new me.Vector2d(~~(this.image.width / this.width),
													   ~~(this.image.height / this.height));
				},
				/**
				 *	specify a transparent color
				 *	@param {String} color color key in rgb format (rrggb or #rrggb)
				 */
				setTransparency : function(col) {
					col = (col.charAt(0) == "#") ? col.substring(1, 7) : col;
					this.image = me.video.applyRGBFilter(this.image, "transparent", col.toUpperCase()).canvas;
				},
				/**
				 * return the flickering state of the object
				 * @return Boolean
				 */
				isFlickering : function() {
					return this.flickering;
				},
				/**
				 * make the object flicker
				 * @param {Int} duration
				 * @param {Function} callback
				 * @example
				 *
				 *
				 * this.flicker(60, function()
				 * {
				 *    me.game.remove(this);
				 * });
				 */
				flicker : function(duration, callback) {
					this.flickerTimer = duration;
					if (this.flickerTimer < 0) {
						this.flickering = false;
						this.flickercb = null;
					} else if (!this.flickering) {
						this.flickercb = callback;
						this.flickering = true;
					}
				},
				/**
				 *	Flip object on horizontal axis
				 *	@param {Boolean} flip enable/disable flip
				 */
				flipX : function(flip) {
					if (flip != this.lastflipX) {
						this.lastflipX = flip;
						this.scale.x = -this.scale.x;
						this.scaleFlag = ((this.scale.x != 1.0) || (this.scale.y != 1.0))
						this.collisionBox.flipX(this.width);
					}
				},
				/**
				 *	Flip object on vertical axis
				 *	@param {Boolean} flip enable/disable flip
				 */
				flipY : function(flip) {
					if (flip != this.lastflipY) {
						this.lastflipY = flip;
						this.scale.y = -this.scale.y;
						this.scaleFlag = ((this.scale.x != 1.0) || (this.scale.y != 1.0))
						this.collisionBox.flipY(this.height);
					}
				},
				/**
				 *	Resize the object around his center<br>
				 *  Note : This won't resize the corresponding collision box
				 *	@param {Boolean} ratio scaling ratio
				 */
				resize : function(ratio)
				{
					if (ratio > 0) {
						this.scale.x = this.scale.x < 0.0 ? -ratio : ratio;
						this.scale.y = this.scale.y < 0.0 ? -ratio : ratio;
						this.scaleFlag = ((this.scale.x!= 1.0)  || (this.scale.y!= 1.0))
					}
				},
				/**
				 * sprite update<br>
				 * not to be called by the end user<br>
				 * called by the game manager on each game loop
				 * @protected
				 * @return false
				 **/
				update : function() {
					if (this.flickering) {
						this.flickerTimer -= me.timer.tick;
						if (this.flickerTimer < 0) {
							if (this.flickercb)
								this.flickercb();
							this.flicker(-1);
						}
						return true;
					}
					return false;
				},
				/**
				 * object draw<br>
				 * not to be called by the end user<br>
				 * called by the game manager on each game loop
				 * @protected
				 * @param {Context2d} context 2d Context on which draw our object
				 **/
				draw : function(context) {
					if (this.flickering) {
						this.flickerState = !this.flickerState;
						if (!this.flickerState) return;
					}
					var xpos = ~~(this.pos.x - this.vp.pos.x), ypos = ~~(this.pos.y - this.vp.pos.y);
					if (this.scaleFlag) {
						context.translate(xpos + this.hWidth, ypos + this.hHeight);
						context.scale(this.scale.x, this.scale.y);
						context.translate(-this.hWidth, -this.hHeight);
						xpos = ypos = 0;
					}
					context.drawImage(this.image,
									this.offset.x, this.offset.y,
									this.width, this.height,
									xpos, ypos,
									this.width, this.height);
					if (this.scaleFlag) {
						context.setTransform(1, 0, 0, 1, 0, 0);
					}
					if (me.debug.renderHitBox) {
						this.parent(context, "blue");
						this.collisionBox.draw(context, "red");
					}
				},
				/**
				 * Destroy function<br>
				 * object is only removed if the autodestroy flag is set (to be removed, useless)
				 * @private
				 */
				destroy : function() {
					if (this.autodestroy) {
						this.onDestroyEvent();
					}
					return this.autodestroy;
				},
				/**
				 * OnDestroy Notification function<br>
				 * Called by engine before deleting the object
				 */
				onDestroyEvent : function() {
					;
				}
			});
	/************************************************************************************/
	/*                                                                                  */
	/*      a generic object entity                                                     */
	/*                                                                                  */
	/************************************************************************************/
	/**
	 * an object to manage animation
	 * @class
	 * @extends me.SpriteObject
	 * @memberOf me
	 * @constructor
	 * @param {int} x the x coordinates of the sprite object
	 * @param {int} y the y coordinates of the sprite object
	 * @param {me.loader#getImage} Image reference of the animation sheet
	 * @param {int} spritewidth width of a single sprite within the spritesheet
	 * @param {int} [spriteheight] height of a single sprite within the spritesheet (value will be set to the image height if not specified)
	 */
	me.AnimationSheet = me.SpriteObject
			.extend(
			/** @scope me.AnimationSheet.prototype */
			{
				fpscount : 0,
				/**
				 * animation cycling speed<br>
				 * default value : me.sys.fps / 10;
				 * @public
				 * @type Number
				 * @name me.AnimationSheet#animationspeed
				 */
				animationspeed : 0,
				/** @private */
				init : function(x, y, image, spritewidth, spriteheight) {
					this.anim = [];
					this.resetAnim = null;
					this.current = null;
					this.parent(x, y, image, spritewidth, spriteheight);
					if ((this.spritecount.x * this.spritecount.y) == 1) {
						this.setAnimationFrame = function() {;};
					}
					this.animationspeed = me.sys.fps / 10;
					this.addAnimation("default", null);
					this.setCurrentAnimation("default");
				},
				/**
				 * add an animation <br>
				 * the index list must follow the logic as per the following example :<br>
				 * <img src="spritesheet_grid.png"/>
				 * @param {String} name animation id
				 * @param {Int[]} index list of sprite index defining the animaton
				 * @example
				 *
				 * this.addAnimation ("walk", [0,1,2,3,4,5]);
				 *
				 * this.addAnimation ("eat", [6,6]);
				 *
				 * this.addAnimation ("roll", [7,8,9,10]);
				 */
				addAnimation : function(name, frame) {
					this.anim[name] = {
						name : name,
						frame : [],
						idx : 0,
						length : 0
					};
					if (frame == null) {
						frame = [];
						for ( var i = 0, count = this.spritecount.x * this.spritecount.y; i < count ; i++) {
							frame[i] = i;
						}
					}
					for ( var i = 0 , len = frame.length ; i < len; i++) {
						this.anim[name].frame[i] = new me.Vector2d(this.width * (frame[i] % this.spritecount.x),
																   this.height * ~~(frame[i] / this.spritecount.x));
					}
					this.anim[name].length = this.anim[name].frame.length;
				},
				/**
				 * set the current animation
				 * @param {String} name animation id
				 * @param {Object} [onComplete] animation id to switch to when complete, or callback
				 * @example
				 *
				 * this.setCurrentAnimation("walk");
				 *
				 * this.setCurrentAnimation("eat", "walk");
				 *
				 * this.setCurrentAnimation("die", function(){me.game.remove(this)});
				 **/
				setCurrentAnimation : function(name, resetAnim) {
					this.current = this.anim[name];
					this.resetAnim = resetAnim || null;
					this.setAnimationFrame(this.current.idx);
				},
				/**
				 * return true if the specified animation is the current one.
				 * @param {String} name animation id
				 * @example
				 * if (!this.isCurrentAnimation("walk"))
				 * {
				 *
				 * }
				 */
				isCurrentAnimation : function(name) {
					return (this.current.name == name);
				},
				/**
				 * force the current animation frame index.
				 * @param {int} [index=0]
				 * @example
				 *
				 * this.setAnimationFrame();
				 */
				setAnimationFrame : function(idx) {
					this.current.idx = (idx || 0) % this.current.length;
					this.offset = this.current.frame[this.current.idx];
				},
				/**
				 * update the animation<br>
				 * this is automatically called by the game manager {@link me.game}
				 * @protected
				 */
				update : function() {
					this.parent();
					if (this.visible && (this.fpscount++ > this.animationspeed)) {
						this.setAnimationFrame(++this.current.idx);
						this.fpscount = 0;
						if ((this.current.idx == 0) && this.resetAnim)  {
							if (typeof(this.resetAnim) == "string")
								this.setCurrentAnimation(this.resetAnim);
							else if (typeof(this.resetAnim) == "function")
								this.resetAnim();
						}
						return true;
					}
					return false;
				}
			});
	/************************************************************************************/
	/*                                                                                  */
	/*      a generic object entity                                                     */
	/*                                                                                  */
	/************************************************************************************/
	/**
	 * a Generic Object Entity<br>
	 * Object Properties (settings) are to be defined in Tiled, <br>
	 * or when calling the parent constructor
	 *
	 * @class
	 * @extends me.AnimationSheet
	 * @memberOf me
	 * @constructor
	 * @param {int} x the x coordinates of the sprite object
	 * @param {int} y the y coordinates of the sprite object
	 * @param {me.ObjectSettings} settings Object Properties as defined in Tiled <br> <img src="object_properties.png"/>
	 */
	me.ObjectEntity = me.AnimationSheet
			.extend(
			/** @scope me.ObjectEntity.prototype */
			{
			   /**
				* Entity "Game Unique Identifier"<br>
				* @public
				* @type String
				* @name me.ObjectEntity#GUID
				*/
				GUID : null,
				type : 0,
				collidable : false,
				/** @private */
				init : function(x, y, settings) {
					this.parent(x, y,
								(typeof settings.image == "string") ? me.loader.getImage(settings.image) : settings.image,
								settings.spritewidth,
								settings.spriteheight);
					if (settings.transparent_color) {
						this.setTransparency(settings.transparent_color);
					}
					this.GUID = me.utils.createGUID();
					this.name = settings.name?settings.name.toLowerCase():"";
					this.pos.set(x, me.game.currentLevel?y + me.game.currentLevel.tileheight - this.height:y);
					/**
					 * entity current velocity<br>
					 * @public
					 * @type me.Vector2d
					 * @name me.ObjectEntity#vel
					 */
					this.vel = new me.Vector2d();
					/**
					 * entity current acceleration<br>
					 * @public
					 * @type me.Vector2d
					 * @name me.ObjectEntity#accel
					 */
					this.accel = new me.Vector2d();
					/**
					 * entity current friction<br>
					 * @public
					 * @type me.Vector2d
					 * @name me.ObjectEntity#friction
					 */
					this.friction = new me.Vector2d();
					/**
					 * max velocity (to limit entity velocity)<br>
					 * @public
					 * @type me.Vector2d
					 * @name me.ObjectEntity#maxVel
					 */
					this.maxVel = new me.Vector2d(1000,1000);
					/**
					 * Default gravity value of the entity<br>
					 * default value : 0.98 (earth gravity)<br>
					 * to be set to 0 for RPG, shooter, etc...
					 * @public
					 * @type Number
					 * @name me.ObjectEntity#gravity
					 */
					this.gravity = (me.sys.gravity!=undefined)?me.sys.gravity:0.98;
					this.isEntity = true;
					/**
					 * dead/living state of the entity<br>
					 * default value : true
					 * @public
					 * @type Boolean
					 * @name me.ObjectEntity#alive
					 */
					this.alive = true;
					/**
					 * falling state of the object<br>
					 * true if the object is falling<br>
					 * false if the object is standing on something<br>
					 * (!) READ ONLY property
					 * @public
					 * @type Boolean
					 * @name me.ObjectEntity#falling
					 */
					this.falling = false;
					/**
					 * jumping state of the object<br>
					 * equal true if the entity is jumping<br>
					 * (!) READ ONLY property
					 * @public
					 * @type Boolean
					 * @name me.ObjectEntity#jumping
					 */
					this.jumping = true;
					this.slopeY = 0;
					/**
					 * equal true if the entity is standing on a slope<br>
					 * (!) READ ONLY property
					 * @public
					 * @type Boolean
					 * @name me.ObjectEntity#onslope
					 */
					this.onslope = false;
					/**
					 * equal true if the entity is on a ladder<br>
					 * (!) READ ONLY property
					 * @public
					 * @type Boolean
					 * @name me.ObjectEntity#onladder
					 */
					this.onladder = false;
					this.collidable = settings.collidable || false;
					this.type = settings.type || 0;
					this.collisionMap = me.game.collisionMap;
					/**
					 * Define if an entity can go through breakable tiles<br>
					 * default value : false<br>
					 * @public
					 * @type Boolean
					 * @name me.ObjectEntity#canBreakTile
					 */
					this.canBreakTile = false;
					/**
					 * a callback when an entity break a tile<br>
					 * @public
					 * @type Function
					 * @name me.ObjectEntity#onTileBreak
					 */
					this.onTileBreak = null;
				},
				/**
				 * specify the size of the hit box for collision detection<br>
				 * (allow to have a specific size for each object)<br>
				 * e.g. : object with resized collision box :<br>
				 * <img src="me.Rect.colpos.png"/>
				 * @param {int} x x offset (specify -1 to not change the width)
				 * @param {int} w width of the hit box
				 * @param {int} y y offset (specify -1 to not change the height)
				 * @param {int} h height of the hit box
				 */
				updateColRect : function(x, w, y, h) {
					this.collisionBox.adjustSize(x, w, y, h);
				},
				/**
				 * collision detection
				 * @private
				 */
				checkCollision : function(obj) {
					var res = this.collisionBox.collideVsAABB(obj.collisionBox);
					if (res.x != 0 || res.y != 0) {
						this.onCollision(res, obj);
						res.type = this.type;
						res.obj  = this;
						return res;
					}
					return null;
				},
				/**
				 * onCollision Event function<br>
				 * called by the game manager when the object collide with shtg<br>
				 * by default, if the object type is Collectable, the destroy function is called
				 * @param {me.Vector2d} res collision vector
				 * @param {me.ObjectEntity} obj the other object that hit this object
				 * @protected
				 */
				onCollision : function(res, obj) {
					if (this.collidable
							&& (this.type == me.game.COLLECTABLE_OBJECT))
						me.game.remove(this);
				},
				/**
				 * set the entity default velocity<br>
				 * note : velocity is by default limited to the same value, see setMaxVelocity if needed<br>
				 * @param {Int} x velocity on x axis
				 * @param {Int} y velocity on y axis
				 * @protected
				 */
				setVelocity : function(x, y) {
					this.accel.x = (x != 0) ? x : this.accel.x;
					this.accel.y = (y != 0) ? y : this.accel.y;
					this.setMaxVelocity(x,y);
				},
				/**
				 * cap the entity velocity to the specified value<br>
				 * (!) this will only cap the y velocity for now(!)
				 * @param {Int} x max velocity on x axis
				 * @param {Int} y max velocity on y axis
				 * @protected
				 */
				setMaxVelocity : function(x, y) {
					this.maxVel.x = x;
					this.maxVel.y = y;
				},
				/**
				 * set the entity default friction<br>
				 * @param {Int} x horizontal friction
				 * @param {Int} y vertical friction
				 * @protected
				 */
				setFriction : function(x, y) {
					this.friction.x = x || 0;
					this.friction.y = y || 0;
				},
				/**
				 * helper function for platform games: <br>
				 * make the entity move left of right<br>
				 * @param {Boolean} left will automatically flip horizontally the entity sprite
				 * @protected
				 * @example
				 * if (me.input.isKeyPressed('left'))
				 * {
				 *     this.doWalk(true);
				 * }
				 * else if (me.input.isKeyPressed('right'))
				 * {
				 *     this.doWalk(false);
				 * }
				 */
				doWalk : function(left) {
					this.flipX(left);
					this.vel.x += (left) ? -this.accel.x * me.timer.tick : this.accel.x * me.timer.tick;
				},
				/**
				 * helper function for platform games: <br>
				 * make the entity move up and down<br>
				 * only valid is the player is on a ladder
				 * @param {Boolean} up will automatically flip vertically the entity sprite
				 * @protected
				 * @example
				 * if (me.input.isKeyPressed('up'))
				 * {
				 *     this.doClimb(true);
				 * }
				 * else if (me.input.isKeyPressed('down'))
				 * {
				 *     this.doClimb(false);
				 * }
				 */
				doClimb : function(up) {
					if (this.onladder) {
						this.vel.y = (up) ? -this.accel.x * me.timer.tick
								: this.accel.x * me.timer.tick;
						return true;
					}
					return false;
				},
				/**
				 * helper function for platform games: <br>
				 * make the entity jump<br>
				 * @protected
				 */
				doJump : function() {
					if (!this.jumping && !this.falling) {
						this.vel.y = -this.maxVel.y * me.timer.tick;
						this.jumping = true;
						return true;
					}
					return false;
				},
				/**
				 * helper function for platform games: <br>
				 * force to the entity to jump (for double jump)<br>
				 * @protected
				 */
				forceJump : function() {
					this.jumping = this.falling = false;
					this.doJump();
				},
				/**
				 * return the distance to the specified entity
				 * @param {me.ObjectEntity} entity Entity
				 * @return {float} distance
				 */
				distanceTo: function(o)
				{
					var dx = (this.pos.x + this.hWidth)  - (o.pos.x + o.hWidth);
					var dy = (this.pos.y + this.hHeight) - (o.pos.y + o.hHeight);
					return Math.sqrt(dx*dx+dy*dy);
				},
				/**
				 * handle the player movement on a slope
				 * and update vel value
				 * @private
				 */
				checkSlope : function(tile, left) {
					this.pos.y = tile.pos.y - this.height;
					if (left)
						this.slopeY = tile.height - (this.collisionBox.right + this.vel.x - tile.pos.x);
					else
						this.slopeY = (this.collisionBox.left + this.vel.x - tile.pos.x);
					this.vel.y = 0;
					this.pos.y += this.slopeY.clamp(0, tile.height);
				},
				/**
				 * compute the new velocity value
				 * @private
				 */
				computeVelocity : function(vel) {
					if (this.gravity) {
						vel.y += !this.onladder?(this.gravity * me.timer.tick):0;
						this.falling = (vel.y > 0);
						this.jumping = this.falling?false:this.jumping;
					}
					if (this.friction.x)
						vel.x = me.utils.applyFriction(vel.x,this.friction.x);
					if (this.friction.y)
						vel.y = me.utils.applyFriction(vel.y,this.friction.y);
					if (vel.y !=0)
						vel.y = vel.y.clamp(-this.maxVel.y,this.maxVel.y);
					if (vel.x !=0)
						vel.x = vel.x.clamp(-this.maxVel.x,this.maxVel.x);
				},
				/**
				 * handle the player movement, "trying" to update his position<br>
				 * @return {me.Vector2d} a collision vector
				 * @example
				 *
				 * if (me.input.isKeyPressed('left'))
				 * {
				 *     this.vel.x -= this.accel.x * me.timer.tick;
				 * }
				 * else if (me.input.isKeyPressed('right'))
				 * {
				 *     this.vel.x += this.accel.x * me.timer.tick;
				 * }
				 *
				 * var res = this.updateMovement();
				 *
				 *
				 * if (res.x != 0)
				 * {
				 *
				 *   if (res.x<0)
				 *      console.log("x axis : left side !");
				 *   else
				 *      console.log("x axis : right side !");
				 * }
				 * else if(res.y != 0)
				 * {
				 *
				 *    if (res.y<0)
				 *       console.log("y axis : top side !");
				 *    else
				 *       console.log("y axis : bottom side !");
				 *
				 *
				 *    console.log(res.yprop.type)
				 * }
				 *
				 *
				 * var updated = (this.vel.x!=0 || this.vel.y!=0);
				 */
				updateMovement : function() {
					this.computeVelocity(this.vel);
					var collision = this.collisionMap.checkCollision(this.collisionBox, this.vel);
					this.onslope  = collision.yprop.isSlope || collision.xprop.isSlope;
					this.onladder = false;
					if (collision.y) {
						this.onladder = collision.yprop.isLadder;
						if (collision.y > 0) {
							if (collision.yprop.isSolid	|| (collision.yprop.isPlatform && (this.collisionBox.bottom - 1 <= collision.ytile.pos.y))) {
								this.pos.y = ~~this.pos.y;
								this.vel.y = (this.falling) ?collision.ytile.pos.y - this.collisionBox.bottom: 0 ;
								this.falling = false;
							}
							else if (collision.yprop.isSlope && !this.jumping) {
								this.checkSlope(collision.ytile, collision.yprop.isLeftSlope);
								this.falling = false;
							}
							else if (collision.yprop.isBreakable) {
								if  (this.canBreakTile) {
									me.game.currentLevel.clearTile(collision.ytile.row,	collision.ytile.col);
									if (this.onTileBreak)
										this.onTileBreak();
								}
								else {
									this.pos.y = ~~this.pos.y;
									this.vel.y = (this.falling) ?collision.ytile.pos.y - this.collisionBox.bottom: 0;
									this.falling = false;
								}
							}
						}
						else if (collision.y < 0) {
							if (!collision.yprop.isPlatform	&& !collision.yprop.isLadder) {
								this.falling = true;
								this.vel.y = 0;
							}
						}
					}
					if (collision.x) {
						this.onladder = collision.xprop.isLadder ;
						if (collision.xprop.isSlope && !this.jumping) {
							this.checkSlope(collision.xtile, collision.xprop.isLeftSlope);
							this.falling = false;
						} else {
							if (!collision.xprop.isPlatform && !collision.xprop.isLadder) {
								if (collision.xprop.isBreakable	&& this.canBreakTile) {
									me.game.currentLevel.clearTile(collision.xtile.row,	collision.xtile.col);
									if (this.onTileBreak) {
										this.onTileBreak();
									}
								} else {
									this.vel.x = 0;
								}
							}
						}
					}
					this.pos.add(this.vel);
					return collision;
				}
	});
	/************************************************************************************/
	/*                                                                                  */
	/*      a Collectable entity                                                        */
	/*                                                                                  */
	/************************************************************************************/
	/**
	 * @class
	 * @extends me.ObjectEntity
	 * @memberOf me
	 * @constructor
	 * @param {int} x the x coordinates of the sprite object
	 * @param {int} y the y coordinates of the sprite object
	 * @param {me.ObjectSettings} settings object settings
	 */
	me.CollectableEntity = me.ObjectEntity.extend(
	/** @scope me.CollectableEntity.prototype */
	{
		/** @private */
		init : function(x, y, settings) {
			this.parent(x, y, settings);
			this.collidable = true;
			this.type = me.game.COLLECTABLE_OBJECT;
		}
	});
	/************************************************************************************/
	/*                                                                                  */
	/*      a non visible entity                                                        */
	/*      NOT FINISHED                                                                */
	/************************************************************************************/
	/**
	 * @class
	 * @extends me.Rect
	 * @memberOf me
	 * @constructor
	 * @param {int} x the x coordinates of the object
	 * @param {int} y the y coordinates of the object
	 * @param {me.ObjectSettings} settings object settings
	 */
	me.InvisibleEntity = me.Rect
			.extend(
			/** @scope me.InvisibleEntity.prototype */
			{
			   /**
				* Entity "Game Unique Identifier"<br>
				* @public
				* @type String
				* @name me.ObjectEntity#GUID
				*/
				GUID : null,
				z : 0,
				collisionBox : null,
				/** @private */
				init : function(x, y, settings) {
					this.parent(new me.Vector2d(x, y), settings.width, settings.height);
					this.collisionBox = new me.Rect(this.pos, settings.width, settings.height);
					this.GUID = me.utils.createGUID();
					this.name = settings.name?settings.name.toLowerCase():"";
					this.visible = true;
					this.collidable = true;
					this.isEntity = true;
				},
				/**
				 * specify the size of the hit box for collision detection<br>
				 * (allow to have a specific size for each object)<br>
				 * e.g. : object with resized collision box :<br>
				 * <img src="me.Rect.colpos.png"/>
				 * @param {int} x x offset (specify -1 to not change the width)
				 * @param {int} w width of the hit box
				 * @param {int} y y offset (specify -1 to not change the height)
				 * @param {int} h height of the hit box
				 */
				updateColRect : function(x, w, y, h) {
					this.collisionBox.adjustSize(x, w, y, h);
				},
				/**
				 * collision detection
				 * @private
				 */
				checkCollision : function(obj) {
					var res = this.collisionBox.collideVsAABB(obj.collisionBox);
					if (res.x != 0 || res.y != 0) {
						this.onCollision(res, obj);
						res.type = this.type;
						res.obj  = this;
						return res;
					}
					return null;
				},
				/**
				 * onCollision Event function<br>
				 * called by the game manager when the object collide with shtg<br>
				 * by default, if the object type is Collectable, the destroy function is called
				 * @param {me.Vector2d} res collision vector
				 * @param {me.ObjectEntity} obj the other object that hit this object
				 * @protected
				 */
				onCollision : function(res, obj) {
					if (this.collidable
							&& (this.type == me.game.COLLECTABLE_OBJECT))
						me.game.remove(this);
				},
				/**
				 * Destroy function
				 * @private
				 */
				destroy : function() {
					this.onDestroyEvent();
					return true;
				},
				/**
				 * OnDestroy Notification function<br>
				 * Called by engine before deleting the object
				 */
				onDestroyEvent : function() {
					;
				},
				/** @private */
				update : function() {
					return false;
				},
				/** @private */
				draw : function(context) {
					if (me.debug.renderHitBox) {
						context.strokeStyle = "blue";
						context.strokeRect(this.pos.x - me.game.viewport.pos.x,
								this.pos.y - me.game.viewport.pos.y,
								this.width, this.height);
						this.collisionBox.draw(context);
					}
				}
			});
	/************************************************************************************/
	/*                                                                                  */
	/*      a level entity                                                              */
	/*                                                                                  */
	/************************************************************************************/
	/**
	 * @class
	 * @extends me.InvisibleEntity
	 * @memberOf me
	 * @constructor
	 * @param {int} x the x coordinates of the object
	 * @param {int} y the y coordinates of the object
	 * @param {me.ObjectSettings} settings object settings
	 */
	me.LevelEntity = me.InvisibleEntity.extend(
	/** @scope me.LevelEntity.prototype */
	{
		/** @private */
		init : function(x, y, settings) {
			this.parent(x, y, settings);
			this.nextlevel = settings.to;
			this.fade = settings.fade;
			this.duration = settings.duration;
			this.fading = false;
			this.gotolevel = settings.to;
		},
		/**
		 * @private
		 */
		onFadeComplete : function() {
			me.levelDirector.loadLevel(this.gotolevel);
			me.game.viewport.fadeOut(this.fade, this.duration);
		},
		/**
		 * go to the specified level
		 * @protected
		 */
		goTo : function(level) {
			this.gotolevel = level || this.nextlevel;
			if (this.fade && this.duration) {
				if (!this.fading) {
					this.fading = true;
					me.game.viewport.fadeIn(this.fade, this.duration,
							this.onFadeComplete.bind(this));
				}
			} else {
				me.levelDirector.loadLevel(this.gotolevel);
			}
		},
		/** @private */
		onCollision : function() {
			this.goTo();
		}
	});
	/*---------------------------------------------------------*/
	/*---------------------------------------------------------*/
})(window);
/*
 * MelonJS Game Engine
 * Copyright (C) 2012, Olivier BIOT
 * http:
 *
 * Font / Bitmap font
 *
 * ASCII Table
 * http:
 * [ !"#$%&'()*+'-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_'abcdefghijklmnopqrstuvwxyz]
 *
 * -> first char " " 32d (0x20);
 */
(function($, undefined) {
	/**
	 * a generic system font object.
	 * @class
	 * @extends Object
	 * @memberOf me
	 * @constructor
	 * @param {String} font
	 * @param {int} size
	 * @param {String} color
	 * @param {String} [align="top"]
	 */
	me.Font = Object.extend(
	/** @scope me.Font.prototype */
	{
		ALIGN : {
			LEFT : "left",
			CENTER : "center",
			RIGHT : "right"
		},
		font : null,
		height : null,
		color : null,
		align : null,
		/** @private */
		init : function(font, size, color, align) {
			this.set(font, size, color, align);
		},
		/**
		 * make the font bold
		 */
		bold : function() {
			this.font = "bold " + this.font;
		},
		/**
		 * make the font italic
		 */
		italic : function() {
			this.font = "italic " + this.font;
		},
		/**
		 * Change the font settings
		 * @param {String} font
		 * @param {int} size
		 * @param {String} color
		 * @param {String} [align="top"]
		 */
		set : function(font, size, color, align) {
			this.font = "" + size + "px " + font;
			this.height = size;
			this.color = color;
			this.align = align || "top";
		},
		/**
		 * FIX ME !
		 * @private
		 */
		getRect : function() {
			return new me.Rect(new Vector2d(0, 0), 0, 0);
		},
		/**
		 * measure the given test width
		 * @param {Context} context 2D Context
		 * @param {String} text
		 * @return {int} width
		 */
		measureText : function(context, text) {
			context.font = this.font;
			context.fillStyle = this.color;
			context.textBaseLine = this.align;
			var dim = context.measureText(text);
			dim.height = this.height;
			return dim;
		},
		/**
		 * draw a text at the specified coord
		 * @param {Context} context 2D Context
		 * @param {String} text
		 * @param {int} x
		 * @param {int} y
		 */
		draw : function(context, text, x, y) {
			context.font = this.font;
			context.fillStyle = this.color;
			context.textBaseLine = this.align;
			context.fillText(text, ~~x, ~~y);
		}
	});
	/**
	 * a bitpmap font object
	 * @class
	 * @extends me.Font
	 * @memberOf me
	 * @constructor
	 * @param {String} font
	 * @param {int/Object} size either an int value, or an object like {x:16,y:16}
	 * @param {int} [scale="1.0"]
	 * @param {String} [firstChar="0x20"]
	 */
	me.BitmapFont = me.Font.extend(
	/** @scope me.BitmapFont.prototype */
	{
		size : null,
		sSize : null,
		firstChar : 0x20,
		charCount : 0,
		/** @private */
		init : function(font, size, scale, firstChar) {
			this.parent(font, null, null);
			this.size = new me.Vector2d();
			this.sSize = new me.Vector2d();
			this.firstChar = firstChar || 0x20;
			this.loadFontMetrics(font, size);
			this.align = this.ALIGN.RIGHT
			if (scale) {
				this.resize(scale);
			}
		},
		/**
		 * Load the font metrics
		 * @private
		 */
		loadFontMetrics : function(font, size) {
			this.font = me.loader.getImage(font);
			this.size.x = size.x || size;
			this.size.y = size.y || this.font.height;
			this.sSize.copy(this.size);
			this.charCount = ~~(this.font.width / this.size.x);
		},
		/**
		 * change the font settings
		 * @param {String} align ("left", "center", "right")
		 * @param {int} [scale]
		 */
		set : function(align, scale) {
			this.align = align;
			if (scale) {
				this.resize(scale);
			}
		},
		/**
		 * change the font display size
		 * @param {int} scale ratio
		 */
		resize : function(scale) {
			this.sSize.copy(this.size);
			this.sSize.x *= scale;
			this.sSize.y *= scale;
		},
		/**
		 * measure the given test width
		 * @param {String} text
		 * @return {int} width
		 */
		measureText : function(text) {
			return {
				width : text.length * this.sSize.x,
				height : this.sSize.y
			};
		},
		/**
		 * draw a text at the specified coord
		 * @param {Context} context 2D Context
		 * @param {String} text
		 * @param {int} x
		 * @param {int} y
		 */
		draw : function(context, text, x, y) {
			text = new String(text);
			switch(this.align) {
				case this.ALIGN.RIGHT:
					x -= this.measureText(text).width;
					break;
				case this.ALIGN.CENTER:
					x -= this.measureText(text).width * 0.5;
					break;
			};
			for ( var i = 0,len = text.length; i < len; i++) {
				var idx = text.charCodeAt(i) - this.firstChar;
				context.drawImage(this.font,
						this.size.x * (idx % this.charCount),
						this.size.y * ~~(idx / this.charCount),
						this.size.x, this.size.y,
						~~x, ~~y,
						this.sSize.x, this.sSize.y);
				x += this.sSize.x;
			}
		}
	});
	/*---------------------------------------------------------*/
	/*---------------------------------------------------------*/
})(window);
/*
 * MelonJS Game Engine
 * Copyright (C) 2012, Olivier BIOT
 * http:
 *
 */
(function($, undefined) {
	/**
	 * GUI Object<br>
	 * A very basic object to manage GUI elements <br>
	 * The object simply register on the "mousedown" <br>
	 * or "touchstart" event and call the onClicked function"
	 * @class
	 * @extends me.SpriteObject
	 * @memberOf me
	 * @example
	 *
	 *
	 * var myButton = me.GUI_Object.extend(
	 * {
	 *    init:function(x, y)
	 *    {
	 *       settings = {}
	 *       settings.image = "button";
	 *       settings.spritewidth = 100;
	 *       settings.spriteheight = 50;
	 *
	 *       this.parent(x, y, settings);
	 *    },
	 *
	 *
	 *
	 *    onClicked:function()
	 *    {
	 *       console.log("clicked!");
	 *
	 *       return true;
	 *    }
	 * });
	 *
	 *
	 * me.game.add((new myButton(10,10)),4);
	 *
	 */
	me.GUI_Object = me.SpriteObject.extend({
	/** @scope me.GUI_Object.prototype */
		/**
		 * object can be clicked or not
		 * @public
		 * @type boolean
		 * @name me.GUI_Object#isClickable
		 */
		isClickable : true,
		updated : false,
		/**
		 * @Constructor
		 * @private
		 */
		 init : function(x, y, settings) {
			this.parent(x, y,
						((typeof settings.image == "string") ? me.loader.getImage(settings.image) : settings.image),
						settings.spritewidth,
						settings.spriteheight);
			me.input.registerMouseEvent('mousedown', this.collisionBox, this.clicked.bind(this));
		},
		/**
		 * return true if the object has been clicked
		 * @private
		 */
		update : function() {
			if (this.updated) {
				this.updated = false;
				return true;
			}
			return false;
		},
		/**
		 * function callback for the mousedown event
		 * @private
		 */
		clicked : function() {
			if (this.isClickable) {
				this.updated = true;
				return this.onClicked();
			}
		},
		/**
		 * function called when the object is clicked <br>
		 * to be extended <br>
		 * return true if we need to stop propagating the event
		 * @public
		 * @function
		 */
		onClicked : function() {
			return true;
		},
		/**
		 * OnDestroy notification function<br>
		 * Called by engine before deleting the object<br>
		 * be sure to call the parent function if overwritten
		 */
		onDestroyEvent : function() {
			me.input.releaseMouseEvent('mousedown', this.collisionBox);
		}
	});
	/*---------------------------------------------------------*/
	/*---------------------------------------------------------*/
})(window);
/*
 * MelonJS Game Engine
 * Copyright (C) 2012, Olivier BIOT
 * http:
 *
 *
 */
(function($, undefined) {
	/************************************************************************************/
	/*      HUD FUNCTIONS :                                                             */
	/*      a basic HUD to be extended                                                  */
	/*                                                                                  */
	/************************************************************************************/
	/**
	 * Item skeleton for HUD element
	 * @class
	 * @extends Object
	 * @memberOf me
	 * @constructor
	 * @param {int} x x position (relative to the HUD position)
	 * @param {int} y y position (relative to the HUD position)
	 * @param {int} [val="0"] default value
	 * @example
	 *
	 *
	 * ScoreObject = me.HUD_Item.extend(
	 * {
	 *
	 *    init: function(x, y)
	 *    {
	 *
	 *       this.parent(x, y);
	 *
	 *       this.font = new me.BitmapFont("font16px", 16);
	 *    },
	 *
	 *    draw : function (context, x, y)
	 *    {
	 *       this.font.draw (context, this.value, this.pos.x +x, this.pos.y +y);
	 *    }
	 * });
	 *
	 *
	 * me.game.addHUD(0,0,480,100);
	 *
	 * me.game.HUD.addItem("score", new ScoreObject(470,10));
	 */
	me.HUD_Item = Object.extend(
	/** @scope me.HUD_Item.prototype */
	{
		init : function(x, y, val) {
			/**
			 * position of the item
			 * @public
			 * @type me.Vector2d
			 * @name me.HUD_Item#pos
			 */
			this.pos = new me.Vector2d(x || 0, y || 0);
			this.visible = true;
			this.defaultvalue = val || 0;
			/**
			 * value of the item
			 * @public
			 * @type Int
			 * @name me.HUD_Item#value
			 */
			this.value = val || 0;
			this.updated = true;
		},
		/**
		 * reset the item to the default value
		 */
		reset : function() {
			this.set(this.defaultvalue);
		},
		/**
		 * set the item value to the specified one
		 */
		set : function(value) {
			this.value = value;
			this.updated = true;
			return true;
		},
		/**
		 * update the item value
		 * @param {int} value add the specified value
		 */
		update : function(value) {
			return this.set(this.value + value);
		},
		/**
		 * draw the HUD item
		 * @protected
		 * @param {Context2D} context 2D context
		 * @param {x} x
		 * @param {y} y
		 */
		draw : function(context, x, y) {
			;
		}
	});
	/*---------------------------------------------------------*/
	/**
	 * HUD Object<br>
	 * There is no constructor function for me.HUD_Object<br>
	 * Object instance is accessible through me.game.HUD if previously initialized using me.game.addHUD(...);
	 * @class
	 * @extends Object
	 * @memberOf me
	 * @example
	 *
	 *
	 * ScoreObject = me.HUD_Item.extend(
	 * {
	 *
	 *    init: function(x, y)
	 *    {
	 *
	 *       this.parent(x, y);
	 *
	 *       this.font = new me.BitmapFont("font16px", 16);
	 *    },
	 *
	 *    draw : function (context, x, y)
	 *    {
	 *       this.font.draw (context, this.value, this.pos.x +x, this.pos.y +y);
	 *    }
	 * });
	 *
	 *
	 * me.game.addHUD(0,0,480,100);
	 *
	 * me.game.HUD.addItem("score", new ScoreObject(470,10));
	 */
	me.HUD_Object = me.Rect.extend(
	/** @scope me.HUD_Object.prototype */
	{
		/**
		 * @Constructor
		 * @private
		 */
		init : function(x, y, w, h, bg) {
			this.parent(new me.Vector2d(x || 0, y || 0),
						w || me.video.getWidth(), h || me.video.getHeight());
			this.bgcolor = bg;
			this.HUDItems = {};
			this.HUDobj = [];
			this.objCount = 0;
			this.visible = true;
			this.HUD_invalidated = true;
			this.HUDCanvasSurface = me.video.createCanvasSurface(this.width, this.height);
			this.z = 999;
		},
		/**
		 * add an item to the me.game.HUD Object
		 * @name me.HUD_Object#addItem
		 * @public
		 * @function
		 * @param {String} name name of the item
		 * @param {me.HUD_Item} item HUD Item to be added
		 * @example
		 *
		 * me.game.HUD.addItem("score", new ScoreObject(470,10));
		 */
		addItem : function(name, item) {
			this.HUDItems[name] = item;
			this.HUDobj.push(this.HUDItems[name]);
			this.objCount++;
			this.HUD_invalidated = true;
		},
		/**
		 * remove an item from the me.game.HUD Object
		 * @name me.HUD_Object#removeItem
		 * @public
		 * @function
		 * @param {String} name name of the item
		 * @example
		 *
		 * me.game.HUD.removeItem("score");
		 */
		removeItem : function(name) {
			if (this.HUDItems[name]) {
				this.HUDobj.splice(this.HUDobj.indexOf(this.HUDItems[name]),1);
				this.HUDItems[name] = null;
				this.objCount--;
				this.HUD_invalidated = true;
			}
		},
		/**
		 * set the value of the specified item
		 * @name me.HUD_Object#setItemValue
		 * @public
		 * @function
		 * @param {String} name name of the item
		 * @param {int} val value to be set
		 * @example
		 *
		 * me.game.HUD.setItemValue("score", 100);
		 */
		setItemValue : function(name, value) {
			if (this.HUDItems[name] && (this.HUDItems[name].set(value) == true))
				this.HUD_invalidated = true;
		},
		/**
		 * update (add) the value of the specified item
		 * @name me.HUD_Object#updateItemValue
		 * @public
		 * @function
		 * @param {String} name name of the item
		 * @param {int} val value to be set
		 * @example
		 *
		 * me.game.HUD.setItemValue("score", 10);
		 */
		updateItemValue : function(name, value) {
			if (this.HUDItems[name] && (this.HUDItems[name].update(value) == true))
				this.HUD_invalidated = true;
		},
		/**
		 * return the value of the specified item
		 * @name me.HUD_Object#getItemValue
		 * @public
		 * @function
		 * @param {String} name name of the item
		 * @return {int}
		 * @example
		 *
		 * score = me.game.HUD.getItemValue("score");
		 */
		getItemValue : function(name) {
			return (this.HUDItems[name]) ? this.HUDItems[name].value : 0;
		},
		/**
		 * return true if the HUD has been updated
		 * @private
		 */
		update : function() {
			return this.HUD_invalidated;
		},
		/**
		 * reset the specified item to default value
		 * @name me.HUD_Object#reset
		 * @public
		 * @function
		 * @param {String} [name="all"] name of the item
		 */
		reset : function(name) {
			if (name != undefined) {
				if (this.HUDItems[name])
					this.HUDItems[name].reset();
				this.HUD_invalidated = true;
			} else {
				this.resetAll();
			}
		},
		/**
		 * reset all items to default value
		 * @private
		 */
		resetAll : function() {
			for ( var i = this.objCount, obj; i--, obj = this.HUDobj[i];) {
				obj.reset();
			}
			this.HUD_invalidated = true;
		},
		/**
		 * override the default me.Rect get Rectangle definition
		 * since the HUD if a flaoting object
		 * (is this correct?)
		 * @private
		 * @return {me.Rect} new rectangle
		 */
		getRect : function() {
			p = this.pos.clone();
			p.add(me.game.viewport.pos);
			return new me.Rect(p, this.width, this.height);
		},
		/**
		 * draw the HUD
		 * @private
		 */
		draw : function(context) {
			if (this.HUD_invalidated) {
				if (this.bgcolor) {
					me.video.clearSurface(this.HUDCanvasSurface, this.bgcolor);
				}
				else {
					this.HUDCanvasSurface.canvas.width = this.HUDCanvasSurface.canvas.width;
				}
				for ( var i = this.objCount, obj; i--, obj = this.HUDobj[i];) {
					if (obj.visible) {
						obj.draw(this.HUDCanvasSurface, 0, 0);
						if (obj.updated) {
							obj.updated = false;
						}
					}
				}
			}
			context.drawImage(this.HUDCanvasSurface.canvas, this.pos.x, this.pos.y);
			this.HUD_invalidated = false;
		}
	});
	/*---------------------------------------------------------*/
	/*---------------------------------------------------------*/
})(window);
/*
 * MelonJS Game Engine
 * Copyright (C) 2012, Olivier BIOT
 * http:
 *
 * Audio Mngt Objects
 *
 *
 */
(function($, undefined) {
	/*
	 * -----------------------------------------------------
	 *
	 * a audio class singleton to manage the game fx & music
	 * -----------------------------------------------------
	 */
	/**
	 * There is no constructor function for me.audio.
	 *
	 * @final
	 * @memberOf me
	 * @constructor Should not be called by the user.
	 */
	me.audio = (function() {
		var obj = {};
		var audio_channels = [];
		var supportedFormat = [ "mp3", "ogg", "wav" ];
		var requestedFormat = null;
		var activeAudioExt = -1;
		var load_cb = null;
		var current_track = null;
		var sound_enable = true;
		var reset_val = 0;
		var retry_counter = 0;
		/*
		 * ---------------------------------------------
		 *
		 * PRIVATE STUFF
		 *
		 * ---------------------------------------------
		 */
		/*
		 * ---
		 *
		 * return the audio format extension supported by the browser ---
		 */
		function getSupportedAudioFormat() {
			var extIdx = 0;
			if (!me.sys.sound) {
				sound_enable = false;
				return;
			}
			if ((requestedFormat.search(/mp3/i) != -1) && obj.capabilities.mp3) {
				return supportedFormat[extIdx];
			}
			if ((requestedFormat.search(/ogg/i) != -1) && obj.capabilities.ogg) {
				return supportedFormat[++extIdx];
			}
			if ((requestedFormat.search(/wav/i) != -1) && obj.capabilities.wav) {
				return supportedFormat[++extIdx];
			}
			sound_enable = false;
			return -1;
		}
		;
		/*
		 * ---
		 *
		 * return the specified sound ---
		 */
		function get(sound_id) {
			var channels = audio_channels[sound_id];
			for ( var i = 0, soundclip; soundclip = channels[i++];) {
				if (soundclip.ended || !soundclip.currentTime)
				{
					soundclip.currentTime = reset_val;
					return soundclip;
				}
			}
			channels[0].pause();
			channels[0].currentTime = reset_val;
			return channels[0];
		}
		;
		/*
		 * ---
		 *
		 * event listener callback on load error
		 *
		 * ---
		 */
		function soundLoadError(sound_id) {
			if (retry_counter++ > 3) {
				var errmsg = "melonJS: failed loading " + sound_id + "." + activeAudioExt;
				if (me.sys.stopOnAudioError===false) {
					me.audio.disable();
					if (load_cb) {
						load_cb();
					}
					console.log(errmsg + ", disabling audio");
				} else {
					throw errmsg;
				}
			} else {
				audio_channels[sound_id][0].load();
			}
		};
		/*
		 * ---
		 *
		 * event listener callback when a sound is loaded
		 *
		 * ---
		 */
		function soundLoaded(sound_id, sound_channel) {
			retry_counter = 0;
			if (sound_channel > 1) {
				var soundclip = audio_channels[sound_id][0];
				for (var channel = 1; channel < sound_channel; channel++) {
					var node = soundclip.cloneNode(true);
					if (node.currentSrc.length == 0) {
						node.src = soundclip.src;
					}
					audio_channels[sound_id][channel] = node;
					audio_channels[sound_id][channel].load();
				}
			}
			if (load_cb) {
				load_cb();
			}
		}
		;
		/**
		 * play the specified sound
		 *
		 * @name me.audio#play
		 * @public
		 * @function
		 * @param {String}
		 *            sound_id audio clip id
		 * @param {String}
		 *            [loop="false"] loop audio
		 * @param {Function}
		 *            [callback] callback function
		 * @example
		 *          play & repeat the "engine" audio clip
		 *          me.audio.play("engine", true);
		 *          audio clip and call myFunc when finished
		 *          me.audio.play("gameover_sfx", false, myFunc);
		 */
		function _play_audio_enable(sound_id, loop, callback) {
			var soundclip = get(sound_id.toLowerCase());
			soundclip.loop = loop || false;
			soundclip.play();
			if (callback && !loop) {
				soundclip.addEventListener('ended', function(event) {
					soundclip.removeEventListener('ended', arguments.callee,
							false);
					callback();
				}, false);
			}
		}
		;
		/*
		 * ---
		 *
		 * play_audio with simulated callback ---
		 */
		function _play_audio_disable(sound_id, loop, callback) {
			if (callback && !loop) {
				setTimeout(callback, 2000);
			}
		}
		;
		/*
		 * ---------------------------------------------
		 *
		 * PUBLIC STUFF
		 *
		 * ---------------------------------------------
		 */
		obj.capabilities = {
			mp3 : false,
			ogg : false,
			ma4 : false,
			wav : false
		};
		/**
		 * initialize the audio engine<br>
		 * the melonJS loader will try to load audio files corresponding to the
		 * browser supported audio format<br>
		 * if not compatible audio format is found, audio will be disabled
		 *
		 * @name me.audio#init
		 * @public
		 * @function
		 * @param {String}
		 *            audioFormat audio format provided ("mp3, ogg, wav")
		 * @example
		 *          available audio format me.audio.init("mp3,ogg");
		 *          Safari, the loader will load all audio.mp3 files,
		 *          Opera the loader will however load audio.ogg files
		 */
		obj.init = function(audioFormat) {
			if (audioFormat)
				requestedFormat = new String(audioFormat);
			else
				requestedFormat = new String("mp3");
			activeAudioExt = getSupportedAudioFormat();
			if (sound_enable)
				obj.play = _play_audio_enable;
			else
				obj.play = _play_audio_disable;
			return sound_enable;
		};
		/*
		 * ---
		 *
		 *
		 * ---
		 */
		/**
		 * set call back when a sound (and instances) is/are loaded
		 *
		 * @name me.audio#setLoadCallback
		 * @private
		 * @function
		 */
		obj.setLoadCallback = function(callback) {
			load_cb = callback;
		};
		/**
		 * return true if audio is enable
		 *
		 * @see me.audio#enable
		 * @name me.audio#isAudioEnable
		 * @public
		 * @function
		 * @return {boolean}
		 */
		obj.isAudioEnable = function() {
			return sound_enable;
		};
		/**
		 * enable audio output <br>
		 * only useful if audio supported and previously disabled through
		 * audio.disable()
		 *
		 * @see me.audio#disable
		 * @name me.audio#enable
		 * @public
		 * @function
		 */
		obj.enable = function() {
			sound_enable = me.sys.sound;
			if (sound_enable)
				obj.play = _play_audio_enable;
			else
				obj.play = _play_audio_disable;
		};
		/**
		 * disable audio output
		 *
		 * @name me.audio#disable
		 * @public
		 * @function
		 */
		obj.disable = function() {
			sound_enable = false;
			obj.play = _play_audio_disable;
		};
		/**
		 * load a sound sound struct : name: id of the sound src: src path
		 * channel: number of channel to allocate
		 *
		 * @private
		 */
		obj.load = function(sound) {
			if (activeAudioExt == -1)
				return 0;
			var soundclip = new Audio(sound.src + sound.name + "."
					+ activeAudioExt + me.nocache);
			soundclip.preload = 'auto';
			soundclip.addEventListener('canplaythrough', function(e) {
				this.removeEventListener('canplaythrough', arguments.callee,
						false);
				soundLoaded(sound.name, sound.channel);
			}, false);
			soundclip.addEventListener("error", function(e) {
				soundLoadError(sound.name);
			}, false);
			soundclip.src = sound.src + sound.name + "." + activeAudioExt
					+ me.nocache;
			soundclip.load();
			audio_channels[sound.name] = [ soundclip ];
			return 1;
		};
		/**
		 * stop the specified sound on all channels
		 *
		 * @name me.audio#stop
		 * @public
		 * @function
		 * @param {String}
		 *            sound_id audio clip id
		 * @example me.audio.stop("cling");
		 */
		obj.stop = function(sound_id) {
			if (sound_enable) {
				var sound = audio_channels[sound_id.toLowerCase()];
				for (var channel_id = sound.length; channel_id--;) {
					sound[channel_id].pause();
					sound[channel_id].currentTime = reset_val;
				}
			}
		};
		/**
		 * pause the specified sound on all channels<br>
		 * this function does not reset the currentTime property
		 *
		 * @name me.audio#pause
		 * @public
		 * @function
		 * @param {String}
		 *            sound_id audio clip id
		 * @example me.audio.pause("cling");
		 */
		obj.pause = function(sound_id) {
			if (sound_enable) {
				var sound = audio_channels[sound_id.toLowerCase()];
				for (var channel_id = sound.length; channel_id--;) {
					sound[channel_id].pause();
				}
			}
		};
		/**
		 * play the specified audio track<br>
		 * this function automatically set the loop property to true<br>
		 * and keep track of the current sound being played.
		 *
		 * @name me.audio#playTrack
		 * @public
		 * @function
		 * @param {String}
		 *            sound_id audio track id
		 * @example me.audio.playTrack("awesome_music");
		 */
		obj.playTrack = function(sound_id) {
			if (sound_enable) {
				if (current_track != null)
					obj.stopTrack();
				current_track = get(sound_id.toLowerCase());
				if (current_track) {
					current_track.loop = true;
					current_track.play();
				}
			}
		};
		/**
		 * stop the current audio track
		 *
		 * @see me.audio#playTrack
		 * @name me.audio#stopTrack
		 * @public
		 * @function
		 * @example
		 *          stop the current music me.audio.stopTrack();
		 */
		obj.stopTrack = function() {
			if (sound_enable && current_track) {
				current_track.pause();
				current_track = null;
			}
		};
		/**
		 * pause the current audio track
		 *
		 * @name me.audio#pauseTrack
		 * @public
		 * @function
		 * @example me.audio.pauseTrack();
		 */
		obj.pauseTrack = function() {
			if (sound_enable && current_track) {
				current_track.pause();
			}
		};
		/**
		 * resume the previously paused audio track
		 *
		 * @name me.audio#resumeTrack
		 * @public
		 * @function
		 * @param {String}
		 *            sound_id audio track id
		 * @example
		 *          pause the audio track me.audio.pauseTrack();
		 *          music me.audio.resumeTrack();
		 */
		obj.resumeTrack = function() {
			if (sound_enable && current_track) {
				current_track.play();
			}
		};
		return obj;
	})();
	/*---------------------------------------------------------*/
	/*---------------------------------------------------------*/
})(window);
/*
 * MelonJS Game Engine
 * Copyright (C) 2012, Olivier BIOT
 * http:
 *
 */
(function($, undefined) {
	/**
	 * a Timer object to manage time function (FPS, Game Tick, Time...)<p>
	 * There is no constructor function for me.timer
	 * @final
	 * @memberOf me
	 * @constructor Should not be called by the user.
	 */
	me.timer = (function() {
		var api = {};
		/*---------------------------------------------
			PRIVATE STUFF
			---------------------------------------------*/
		var htmlCounter = null;
		var debug = false;
		var framecount = 0;
		var framedelta = 0;
		/* fps count stuff */
		var last = 0;
		var now = 0;
		var delta = 0;
		var step = Math.ceil(1000 / me.sys.fps);
		var minstep = (1000 / me.sys.fps) * 1.25;
		/**
		 * draw the fps counter
		 * @private
		 */
		function draw(fps) {
			htmlCounter.replaceChild(document.createTextNode("(" + fps + "/"
					+ me.sys.fps + " fps)"), htmlCounter.firstChild);
		};
		/*---------------------------------------------
			PUBLIC STUFF
			---------------------------------------------*/
		/**
		 * last game tick value
		 * @public
		 * @type {Int}
		 * @name me.timer#tick
		 */
		api.tick = 1.0;
		/* ---
			init our time stuff
			---							*/
		api.init = function() {
			htmlCounter = document.getElementById("framecounter");
			debug = (htmlCounter !== null);
			api.reset();
		};
		/**
		 * reset time (e.g. usefull in case of pause)
		 * @name me.timer#reset
		 * @private
		 * @function
		 */
		api.reset = function() {
			now = last = new Date().getTime();
			framedelta = 0;
			framecount = 0;
		};
		/**
		 * return the current time
		 * @name me.timer#getTime
		 * @return {Date}
		 * @function
		 */
		api.getTime = function() {
			return now;
		};
		/* ---
			update game tick
			should be called once a frame
			---                           */
		api.update = function() {
			last = now;
			now = new Date().getTime();
			delta = (now - last);
			if (debug) {
				framecount++;
				framedelta += delta;
				if (framecount % 10 == 0) {
					var lastfps = ~~((1000 * framecount) / framedelta);
					draw(lastfps.clamp(0, me.sys.fps));
					framedelta = 0;
					framecount = 0;
				}
			}
			api.tick = (delta > minstep && me.sys.interpolation) ? delta / step	: 1;
		};
		return api;
	})();
	/************************************************************************************/
	/**
	 * video functions
	 * There is no constructor function for me.video
	 * @final
	 * @memberOf me
	 * @constructor Should not be called by the user.
	 */
	me.video = (function() {
		var api = {};
		var canvas = null;
		var context2D = null;
		var backBufferCanvas = null;
		var backBufferContext2D = null;
		var wrapper = null;
		var double_buffering = false;
		var game_width_zoom = 0;
		var game_height_zoom = 0;
		/*---------------------------------------------
			PUBLIC STUFF
			---------------------------------------------*/
		/* ---
			init the video part
			---							*/
		/**
		 * init the "video" part<p>
		 * return false if initialization failed (canvas not supported)
		 * @name me.video#init
		 * @function
		 * @param {String} wrapper the "div" element id to hold the canvas in the HTML file  (if null document.body will be used)
		 * @param {Int} width game width
		 * @param {Int} height game height
		 * @param {Boolean} [double_buffering] enable/disable double buffering
		 * @param {Number} [scale] enable scaling of the canvas (note : if scale is used, double_buffering must be enabled)
		 * @return {Boolean}
		 * @example
		 *
		 * if (!me.video.init('jsapp', 480, 320))
		 * {
		 *    alert("Sorry but your browser does not support html 5 canvas !");
		 *    return;
		 * }
		 */
		api.init = function(wrapperid, game_width, game_height,	doublebuffering, scale) {
			double_buffering = doublebuffering || false;
			me.sys.scale = double_buffering === true ? scale || 1.0 : 1.0;
			game_width_zoom = game_width * me.sys.scale;
			game_height_zoom = game_height * me.sys.scale;
			canvas = document.createElement("canvas");
			canvas.setAttribute("width", (game_width_zoom) + "px");
			canvas.setAttribute("height", (game_height_zoom) + "px");
			canvas.setAttribute("border", "0px solid black");
			if (wrapperid) {
				wrapper = document.getElementById(wrapperid);
			}
			else {
				wrapper = document.body;
			}
			wrapper.appendChild(canvas);
			if (me.sys.enableWebGL && window.WebGLRenderingContext) {
				try {
					WebGL2D.enable(canvas);
					context2D = canvas.getContext('webgl-2d');
					me.sys.cacheImage = true;
				} catch (e) {
					context2D = null;
				}
			}
			if (context2D == null) {
				me.sys.enableWebGL = false;
				if (!canvas.getContext)
					return false;
				context2D = canvas.getContext('2d');
			}
			if (double_buffering) {
				backBufferContext2D = api.createCanvasSurface(game_width,
						game_height);
				backBufferCanvas = backBufferContext2D.canvas;
			} else {
				backBufferContext2D = context2D;
				backBufferCanvas = context2D.canvas;
			}
			return true;
		};
		/**
		 * return a reference to the wrapper
		 * @name me.video#getWrapper
		 * @function
		 * @return {Document}
		 */
		api.getWrapper = function() {
			return wrapper;
		};
		/**
		 * return the width of the display canvas (before scaling)
		 * @name me.video#getWidth
		 * @function
		 * @return {Int}
		 */
		api.getWidth = function() {
			return backBufferCanvas.width;
		};
		/**
		 * return the relative (to the page) position of the specified Canvas
		 * @name me.video#getPos
		 * @function
		 * @param {Canvas} [canvas] system one if none specified
		 * @return {me.Vector2d}
		 */
		api.getPos = function(c) {
			var obj = c || canvas;
			var offset = new me.Vector2d(obj.offsetLeft, obj.offsetTop);
			while ( obj = obj.offsetParent ) {
				offset.x += obj.offsetLeft;
				offset.y += obj.offsetTop;
			}
			return offset;
		};
		/**
		 * return the height of the display canvas (before scaling)
		 * @name me.video#getHeight
		 * @function
		 * @return {Int}
		 */
		api.getHeight = function() {
			return backBufferCanvas.height;
		};
		/**
		 * allocate and return a new Canvas 2D surface
		 * @name me.video#createCanvasSurface
		 * @function
		 * @param {Int} width canvas width
		 * @param {Int} height canvas height
		 * @return {Context2D}
		 */
		api.createCanvasSurface = function(width, height) {
			var privateCanvas = document.createElement("canvas");
			privateCanvas.width = width || backBufferCanvas.width;
			privateCanvas.height = height || backBufferCanvas.height;
			/* !! this should be working, no ?
			if (me.sys.enableWebGL)
			{
			   WebGL2D.enable(privateCanvas);
			   return privateCanvas.getContext('webgl-2d');
			}
			else
			{
			 */
			return privateCanvas.getContext('2d');
		};
		/**
		 * return a reference of the display canvas
		 * @name me.video#getScreenCanvas
		 * @function
		 * @return {Canvas}
		 */
		api.getScreenCanvas = function() {
			return canvas;
		};
		/**
		 * return a reference to the screen framebuffer
		 * @name me.video#getScreenFrameBuffer
		 * @function
		 * @return {Context2D}
		 */
		api.getScreenFrameBuffer = function() {
			return backBufferContext2D;
		};
		/* ---
			Update the display size (zoom ratio change)
			if no parameter called from the outside (select box)
			---								*/
		/**
		 * change the display scaling factor
		 * @name me.video#updateDisplaySize
		 * @function
		 * @param {Number} scale scaling value
		 */
		api.updateDisplaySize = function(scale) {
			if (double_buffering) {
				if (scale)
					me.sys.scale = scale;
				else
					me.sys.scale = document.getElementById("screen size").value;
				game_width_zoom = backBufferCanvas.width * me.sys.scale;
				game_height_zoom = backBufferCanvas.height * me.sys.scale;
				canvas.width = game_width_zoom;
				canvas.height = game_height_zoom;
			}
		};
		/**
		 * Clear the specified context with the given color
		 * @name me.video#clearSurface
		 * @function
		 * @param {Context2D} context
		 * @param {Color} col
		 */
		api.clearSurface = function(context, col) {
			context.fillStyle = col;
			context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		};
		/**
		 * scale & keep canvas centered<p>
		 * usefull for zooming effect
		 * @name me.video#scale
		 * @function
		 * @param {Context2D} context
		 * @param {scale} scale
		 */
		api.scale = function(context, scale) {
			context
					.translate(
							-(((context.canvas.width * scale) - context.canvas.width) >> 1),
							-(((context.canvas.height * scale) - context.canvas.height) >> 1));
			context.scale(scale, scale);
		};
		/**
		 * enable/disable Alpha for the specified context
		 * @name me.video#setAlpha
		 * @function
		 * @param {Context2D} context
		 * @param {Boolean} enable
		 */
		api.setAlpha = function(context, enable) {
			context.globalCompositeOperation = enable ? "source-over" : "copy";
		};
		/**
		 * render the main framebuffer on screen
		 * @name me.video#blitSurface
		 * @function
		 */
		api.blitSurface = function() {
			if (double_buffering) {
				api.blitSurface = function() {
					context2D.drawImage(backBufferCanvas, 0, 0,
							backBufferCanvas.width, backBufferCanvas.height, 0,
							0, game_width_zoom, game_height_zoom);
				};
			} else {
				api.blitSurface = function() {
				};
			}
			api.blitSurface();
		};
		/**
		 * apply the specified filter to the main canvas
		 * and return a new canvas object with the modified output<br>
		 * (!) Due to the internal usage of getImageData to manipulate pixels,
		 * this function will throw a Security Exception with FF if used locally
		 * @name me.video#applyRGBFilter
		 * @function
		 * @param {Object} object Canvas or Image Object on which to apply the filter
		 * @param {String} effect "b&w", "brightness", "transparent"
		 * @param {String} option : level [0...1] (for brightness), color to be replaced (for transparent)
		 * @return {Context2D} context object
		 */
		api.applyRGBFilter = function(object, effect, option) {
			var fcanvas = api.createCanvasSurface(object.width, object.height);
			var imgpix = me.utils.getPixels(object);
			var pix = imgpix.data;
			switch (effect) {
			case "b&w": {
				for ( var i = 0, n = pix.length; i < n; i += 4) {
					var grayscale = (3 * pix[i] + 4 * pix[i + 1] + pix[i + 2]) >>> 3;
					pix[i] = grayscale;
					pix[i + 1] = grayscale;
					pix[i + 2] = grayscale;
				}
				break;
			}
			case "brightness": {
				var brightness = Math.abs(option).clamp(0.0, 1.0);
				for ( var i = 0, n = pix.length; i < n; i += 4) {
					pix[i] *= brightness;
					pix[i + 1] *= brightness;
					pix[i + 2] *= brightness;
				}
				break;
			}
			case "transparent": {
				for ( var i = 0, n = pix.length; i < n; i += 4) {
					if (me.utils.RGBToHex(pix[i], pix[i + 1], pix[i + 2]) === option) {
						pix[i + 3] = 0;
					}
				}
				break;
			}
			default:
				return null;
			}
			fcanvas.putImageData(imgpix, 0, 0);
			return fcanvas;
		};
		return api;
	})();
	/*---------------------------------------------------------*/
	/*---------------------------------------------------------*/
})(window);
(function($, undefined) {
	/**
	 * @final
	 * @memberOf me
	 * @constructor Should not be called by the user.
	 */
	me.input = (function() {
		var obj = {};
		var KeyBinding = [];
		var keyStatus = [];
		var keyLock = [];
		var keyLocked = [];
		var keyboardInitialized = false;
		var mouseInitialized = false;
		var accelInitialized = false;
		/**
		 * enable keyboard event
		 * @private
		 */
		function enableKeyboardEvent() {
			if (!keyboardInitialized) {
				$.addEventListener('keydown', keydown, false);
				$.addEventListener('keyup', keyup, false);
				keyboardInitialized = true;
			}
		};
		/**
		 * enable mouse event
		 * @private
		 */
		function enableMouseEvent() {
			if (!mouseInitialized) {
				obj.touches.push({ x: 0, y: 0 });
				obj.mouse.pos = new me.Vector2d(0,0);
				obj.mouse.offset = me.video.getPos();
				if (me.sys.touch) {
					me.video.getScreenCanvas().addEventListener('touchmove', onMouseMove, false );
					me.video.getScreenCanvas().addEventListener('touchstart', onTouchEvent, false );
					me.video.getScreenCanvas().addEventListener('touchend', onTouchEvent, false );
				}
				else {
					$.addEventListener('mousewheel', onMouseWheel, false );
					me.video.getScreenCanvas().addEventListener('mousemove', onMouseMove, false);
					me.video.getScreenCanvas().addEventListener('mousedown', onMouseEvent, false );
					me.video.getScreenCanvas().addEventListener('mouseup', onMouseEvent, false );
				}
				mouseInitialized = true;
			}
		};
		/**
		 * prevent event propagation
		 * @private
		 */
		function preventDefault(e) {
			if (e.stopPropagation) {
				e.stopPropagation();
			}
			else {
				e.cancelBubble = true;
			}
			if (e.preventDefault)  {
				e.preventDefault();
			}
			else  {
				e.returnValue = false;
			}
		};
		/**
		 * key down event
		 * @private
		 */
		function keydown(e, keyCode) {
			var action = KeyBinding[keyCode || e.keyCode || e.which];
			if (action) {
				if (!keyLocked[action]) {
					keyStatus[action] = true;
					keyLocked[action] = keyLock[action];
				}
				preventDefault(e);
				return false;
			}
			return true;
		};
		/**
		 * key up event
		 * @private
		 */
		function keyup(e, keyCode) {
			var action = KeyBinding[keyCode || e.keyCode || e.which];
			if (action) {
				keyStatus[action] = false;
				keyLocked[action] = false;
				preventDefault(e);
				return false;
			}
			return true;
		}
		/**
		 * propagate mouse event to registed object
		 * @private
		 */
		function dispatchMouseEvent(e) {
			var handlers = obj.mouse.handlers[e.type];
			if (handlers) {
				for(var t=0, l=obj.touches.length; t<l; t++) {
					for (var i = handlers.length, handler; i--, handler = handlers[i];) {
						if ((handler.rect === null) || handler.rect.containsPoint({x:obj.touches[t].x,y:obj.touches[t].y})) {
							if (handler.cb(e) === false) {
								break;
							}
						}
					}
				}
			}
		};
		/**
		 * @private
		 */
		function updateCoordFromEvent(e) {
			obj.touches.length=0;
			if (!e.touches) {
				var x = e.pageX - obj.mouse.offset.x;
				var y = e.pageY - obj.mouse.offset.y;
				if (me.sys.scale != 1.0) {
					x/=me.sys.scale;
					y/=me.sys.scale;
				}
				obj.touches.push({ x: x, y: y, id: 0});
			}
			else {
				for(var i=0, l=e.changedTouches.length; i<l; i++) {
					var t = e.changedTouches[i];
					var x = t.clientX - obj.mouse.offset.x;
					var y = t.clientY - obj.mouse.offset.y;
					if (me.sys.scale != 1.0) {
						x/=me.sys.scale;
						y/=me.sys.scale;
					}
					obj.touches.push({ x: x, y: y, id: t.identifier });
				}
			}
			obj.mouse.pos.set(obj.touches[0].x,obj.touches[0].y);
		};
		/**
		 * @private
		 */
		function onMouseWheel(e) {
			dispatchMouseEvent(e);
			preventDefault(e);
		};
		/**
		 * @private
		 */
		function onMouseMove(e) {
			updateCoordFromEvent(e);
			dispatchMouseEvent(e);
			preventDefault(e);
		};
		/**
		 * @private
		 */
		function onMouseEvent(e) {
			var keycode = obj.mouse.bind[e.button || 0];
			dispatchMouseEvent(e);
			if (keycode) {
				if (e.type === 'mousedown' || e.type === 'touchstart')
					keydown(e, keycode);
				else
					keyup(e, keycode);
			}
			else {
				preventDefault(e);
			}
		};
		/**
		 * @private
		 */
		function onTouchEvent(e) {
			updateCoordFromEvent(e);
			onMouseEvent(e);
		};
		/**
		 * @private
		 */
		function onDeviceMotion(e) {
			obj.accel = e.accelerationIncludingGravity;
		};
		/**
		 * @public
		 * @enum {number}
		 * @name me.input#accel
		 */
		obj.accel = {
			x: 0,
			y: 0,
			z: 0
		};
		/**
		 * @public
		 * @enum {number}
		 * @name me.input#mouse
		 */
		 obj.mouse = {
			pos : null,
			offset : null,
			LEFT:	0,
			MIDDLE: 1,
			RIGHT:	2,
			bind: [3],
			handlers:{}
		};
		/**
		 * @public
		 * @type {Array}
		 * @name me.input#touches
		 */
		obj.touches = [];
		/**
		 * @public
		 * @enum {number}
		 * @name me.input#KEY
		 */
		obj.KEY = {
			'LEFT' : 37,
			'UP' : 38,
			'RIGHT' : 39,
			'DOWN' : 40,
			'ENTER' : 13,
			'SHIFT' : 16,
			'CTRL' : 17,
			'ALT' : 18,
			'PAUSE' : 19,
			'ESC' : 27,
			'SPACE' : 32,
			'NUM0' : 48,
			'NUM1' : 49,
			'NUM2' : 50,
			'NUM3' : 51,
			'NUM4' : 52,
			'NUM5' : 53,
			'NUM6' : 54,
			'NUM7' : 55,
			'NUM8' : 56,
			'NUM9' : 57,
			'A' : 65,
			'B' : 66,
			'C' : 67,
			'D' : 68,
			'E' : 69,
			'F' : 70,
			'G' : 71,
			'H' : 72,
			'I' : 73,
			'J' : 74,
			'K' : 75,
			'L' : 76,
			'M' : 77,
			'N' : 78,
			'O' : 79,
			'P' : 80,
			'Q' : 81,
			'R' : 82,
			'S' : 83,
			'T' : 84,
			'U' : 85,
			'V' : 86,
			'W' : 87,
			'X' : 88,
			'Y' : 89,
			'Z' : 90
		};
		/**
		 * @name me.input#isKeyPressed
		 * @public
		 * @function
		 * @param {String} action user defined corresponding action
		 * @return {boolean} true if pressed
		 * @example
		 */
		obj.isKeyPressed = function(action) {
			if (keyStatus[action]) {
				if (keyLock[action]) {
					keyLocked[action] = true;
					keyStatus[action] = false;
				}
				return true;
			}
			return false;
		};
		/**
		 * @name me.input#keyStatus
		 * @public
		 * @function
		 * @param {String} action user defined corresponding action
		 * @return {boolean} down (true) or up(false)
		 */
		obj.keyStatus = function(action) {
			return (keyLocked[action] === true) ? true : keyStatus[action];
		};
		/**
		 * @name me.input#triggerKeyEvent
		 * @public
		 * @function
		 * @param {me.input#KEY} keycode
		 * @param {boolean} true to trigger a key press, or false for key release
		 * @example
		 */
		obj.triggerKeyEvent = function(keycode, status) {
			if (status) {
				keydown({}, keycode);
			}
			else {
				keyup({}, keycode);
			}
		};
		/**
		 * @name me.input#bindKey
		 * @public
		 * @function
		 * @param {me.input#KEY} keycode
		 * @param {String} action user defined corresponding action
		 * @param {boolean} lock cancel the keypress event once read
		 * @example
		 */
		obj.bindKey = function(keycode, action, lock) {
			enableKeyboardEvent();
			KeyBinding[keycode] = action;
			keyLock[action] = lock ? lock : false;
			keyLocked[action] = false;
		};
		/**
		 * @name me.input#unbindKey
		 * @public
		 * @function
		 * @param {me.input#KEY} keycode
		 * @example
		 */
		obj.unbindKey = function(keycode) {
			keyStatus[KeyBinding[keycode]] = false;
			keyLock[KeyBinding[keycode]] = false;
			KeyBinding[keycode] = null;
		};
		/**
		 * @name me.input#bindMouse
		 * @public
		 * @function
		 * @param {Integer} button (accordingly to W3C values : 0,1,2 for left, middle and right buttons)
		 * @param {me.input#KEY} keyCode
		 * @example
		 */
		obj.bindMouse = function (button, keyCode)
		{
			enableMouseEvent();
			if (!KeyBinding[keyCode])
			  throw "melonJS : no action defined for keycode " + keyCode;
			obj.mouse.bind[button] = keyCode;
		};
		/**
		 * @name me.input#unbindMouse
		 * @public
		 * @function
		 * @param {Integer} button (accordingly to W3C values : 0,1,2 for left, middle and right buttons)
		 * @example
		 */
		obj.unbindMouse = function(button) {
			obj.mouse.bind[button] = null;
		};
		/**
		 * @name me.input#bindTouch
		 * @public
		 * @function
		 * @param {me.input#KEY} keyCode
		 * @example
		 */
		obj.bindTouch = function (keyCode)
		{
			object.bindMouse(me.input.mouse.LEFT,keycode);
		};
		/**
		 * @name me.input#unbindTouch
		 * @public
		 * @function
		 * @example
		 */
		obj.unbindTouch = function() {
			obj.unbindMouse(me.input.mouse.LEFT);
		};
		/**
		 * @name me.input#registerMouseEvent
		 * @public
		 * @function
		 * @param {String} eventType ('mousemove','mousedown','mouseup','mousewheel','touchstart','touchmove','touchend')
		 * @param {me.Rect} rect (object must inherits from me.Rect)
		 * @param {Function} callback
		 * @example
		 *
		 */
		obj.registerMouseEvent = function(eventType, rect, callback) {
			enableMouseEvent();
			switch (eventType) {
				case 'mousewheel':
				case 'mousemove':
				case 'mousedown':
				case 'mouseup':
				case 'touchmove':
				case 'touchstart':
				case 'touchend':
					if (me.sys.touch) {
						if (eventType == 'mousemove')
							eventType = 'touchmove';
						else if (eventType == 'mousedown')
							eventType = 'touchstart';
						else if (eventType == 'mouseup')
							eventType = 'touchend';
					}
					if (!obj.mouse.handlers[eventType]) {
						obj.mouse.handlers[eventType] = [];
 					}
					obj.mouse.handlers[eventType].push({rect:rect||null,cb:callback});
					break;
				default :
					throw "melonJS : invalid event type : " + eventType;
			}
		};
		/**
		 * @name me.input#releaseMouseEvent
		 * @public
		 * @function
		 * @param {String} eventType ('mousemove','mousedown','mouseup','mousewheel','touchstart','touchmove','touchend')
		 * @param {me.Rect} region
		 * @example
		 *
		 */
		obj.releaseMouseEvent = function(eventType, rect) {
			switch (eventType) {
				case 'mousewheel':
				case 'mousemove':
				case 'mousedown':
				case 'mouseup':
				case 'touchmove':
				case 'touchstart':
				case 'touchend':
					if (me.sys.touch) {
						if (eventType == 'mousemove')
							eventType = 'touchmove';
						else if (eventType == 'mousedown')
							eventType = 'touchstart';
						else if (eventType == 'mouseup')
							eventType = 'touchend';
					}
					var handlers = obj.mouse.handlers[eventType];
					if (handlers) {
						for (var i = handlers.length, handler; i--, handler = handlers[i];) {
							if (handler.rect === rect) {
								handler.rect = handler.cb = null;
								obj.mouse.handlers[eventType].splice(i, 1);
							}
						}
					}
					break;
				default :
					throw "melonJS : invalid event type : " + eventType;
			}
		};
		/**
		 * watch Accelerator event
		 * @name me.input#watchAccelerometer
		 * @public
		 * @function
		 * @return {boolean} false if not supported by the device
		 */
		obj.watchAccelerometer = function() {
			if ($.sys.gyro) {
				if (!accelInitialized) {
					$.addEventListener('devicemotion', onDeviceMotion, false);
					accelInitialized = true;
				}
				return true;
			}
			return false;
		};
		/**
		 * @name me.input#unwatchAccelerometer
		 * @public
		 * @function
		 */
		obj.unwatchAccelerometer = function() {
			if (accelInitialized) {
				$.removeEventListener('devicemotion', onDeviceMotion, false);
				accelInitialized = false;
			}
		};
		return obj;
	})();
})(window);
(function($, undefined) {
	/**
	 *  Base64 decoding
	 *  @see <a href="http:
	 */
	var Base64 = (function() {
		var singleton = {};
		var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		singleton.decode = function(input) {
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
			if (me.sys.nativeBase64) {
				return $.atob(input);
			}
			else {
				var output = [], chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;
				while (i < input.length) {
					enc1 = _keyStr.indexOf(input.charAt(i++));
					enc2 = _keyStr.indexOf(input.charAt(i++));
					enc3 = _keyStr.indexOf(input.charAt(i++));
					enc4 = _keyStr.indexOf(input.charAt(i++));
					chr1 = (enc1 << 2) | (enc2 >> 4);
					chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
					chr3 = ((enc3 & 3) << 6) | enc4;
					output.push(String.fromCharCode(chr1));
					if (enc3 != 64) {
						output.push(String.fromCharCode(chr2));
					}
					if (enc4 != 64) {
						output.push(String.fromCharCode(chr3));
					}
				}
				output = output.join('');
				return output;
			}
		};
		return singleton;
	})();
	/**
	 * @final
	 * @memberOf me
	 * @private
	 * @constructor Should not be called by the user.
	 */
	me.utils = (function() {
		var api = {};
		var rgbCache = {};
		var GUID_base  = "";
		var GUID_index = 0;
		/**
		 *
		 * @param {String} input Base64 encoded data
		 * @return {String} Binary string
		 */
		api.decodeBase64 = function(input) {
			return Base64.decode(input);
		};
		/**
		 *
		 * @param {String} input Base64 encoded data
		 * @param {Int} [bytes] number of bytes per array entry
		 * @return {Int[]} Array of bytes
		 */
		api.decodeBase64AsArray = function(input, bytes) {
			bytes = bytes || 1;
			var dec = Base64.decode(input), ar = [], i, j, len;
			for (i = 0, len = dec.length / bytes; i < len; i++) {
				ar[i] = 0;
				for (j = bytes - 1; j >= 0; --j) {
					ar[i] += dec.charCodeAt((i * bytes) + j) << (j << 3);
				}
			}
			return ar;
		};
		/**
		 *
		 * @param  {String} input CSV formatted data
		 * @param  {Int} limit row split limit
		 * @return {Int[]} Int Array
		 */
		api.decodeCSV = function(input, limit) {
			input = input.trim().split("\n");
			var result = [];
			for ( var i = 0; i < input.length; i++) {
				entries = input[i].split(",", limit);
				for ( var e = 0; e < entries.length; e++) {
					result.push(+entries[e]);
				}
			}
			return result;
		};
		/* ---
			enable the nocache mechanism
		  ---*/
		api.setNocache = function(enable) {
			me.nocache = enable ? "?" + parseInt(Math.random() * 10000000) : '';
		};
		api.HexToRGB = function(h, a) {
			h = (h.charAt(0) == "#") ? h.substring(1, 7) : h;
			if (rgbCache[h] == null) {
				rgbCache[h] = parseInt(h.substring(0, 2), 16) + ","
						+ parseInt(h.substring(2, 4), 16) + ","
						+ parseInt(h.substring(4, 6), 16);
			}
			return (a ? "rgba(" : "rgb(") + rgbCache[h]
					+ (a ? "," + a + ")" : ")");
		};
		api.RGBToHex = function(r, g, b) {
			return r.toHex() + g.toHex() + b.toHex();
		};
		api.getPixels = function(arg) {
			if (arg instanceof HTMLImageElement) {
				var c = me.video.createCanvasSurface(arg.width, arg.height);
				c.drawImage(arg, 0, 0);
				return c.getImageData(0, 0, arg.width, arg.height);
			} else {
				return arg.getContext('2d').getImageData(0, 0, arg.width, arg.height);
			}
		};
		api.resetGUID = function(base) {
			GUID_base  = base.toString().toUpperCase().toHex();
			GUID_index = 0;
		};
		api.createGUID = function() {
			return GUID_base + "-" + (GUID_index++);
		};
		api.applyFriction = function(v, f) {
			return (v+f<0)?v+(f*me.timer.tick):(v-f>0)?v-(f*me.timer.tick):0;
		};
		return api;
	})();
})(window);
(function($, undefined) {
	function Stat_Item(val) {
		this.defaultvalue = val || 0;
		this.value = val || 0;
		this.updated = true;
	};
	Stat_Item.prototype.reset = function() {
		this.set(this.defaultvalue);
	};
	Stat_Item.prototype.update = function(val) {
		return this.set(this.value + val);
	};
    Stat_Item.prototype.set = function(value) {
		this.value = value;
		this.updated = true;
		return this.updated;
	};
	/*---------------------------------------------------------*/
	/**
	 * @final
	 * @memberOf me
	 * @constructor Should not be called by the user.
	 */
	me.gamestat = (function() {
		var singleton = {};
		var items = {};
		var obj = [];
		var objCount = 0;
		/**
		 * @name me.gamestat#add
		 * @public
		 * @function
		 * @param {String} name name of the item
		 * @param {int} [val="0"] default value
		 * @example
		 *
		 */
		singleton.add = function(name, val) {
			items[name] = new Stat_Item(val);
			obj.push(items[name]);
			objCount++;
		};
		/**
		 * @name me.gamestat#updateValue
		 * @public
		 * @function
		 * @param {String} name name of the item
		 * @param {int} val value to be added
		 * @example
		 *
		 */
		singleton.updateValue = function(name, value) {
			if (items[name])
				items[name].update(value);
		};
		/**
		 * @name me.gamestat#setValue
		 * @public
		 * @function
		 * @param {String} name name of the item
		 * @param {int} val value to be set
		 * @example
		 *
		 */
		singleton.setValue = function(name, value) {
			if (items[name])
				items[name].set(value);
		};
		/**
		 * @name me.gamestat#getItemValue
		 * @public
		 * @function
		 * @param {String} name name of the item
		 * @return {int}
		 * @example
		 *
		 */
		singleton.getItemValue = function(name) {
			return (items[name]) ? items[name].value : 0;
		};
		/**
		 * @name me.gamestat#reset
		 * @public
		 * @function
		 * @param {String} [name="all"] name of the item
		 * @example
		 */
		singleton.reset = function(name) {
			if (name != undefined) {
				if (items[name])
					items[name].reset();
			} else {
				singleton.resetAll();
			}
		};
		/**
		 * @name me.gamestat#resetAll
		 * @private
		 * @function
		 */
		singleton.resetAll = function() {
			for ( var i = objCount, objt; i--, objt = obj[i];) {
				objt.reset();
			}
		};
		return singleton;
	})();
})(window);
(function($, undefined) {
	var removepath = /^.*(\\|\/|\:)/;
	var removeext = /\.[^\.]*$/;
	me.LevelConstants = {
		COLLISION_MAP : "collision",
		PARALLAX_MAP : "parallax"
	};
	/**
	 * a basic tile object
	 * @class
	 * @extends me.Rect
	 * @memberOf me
	 * @constructor
	 * @param {int} x x index of the Tile in the map
	 * @param {int} y y index of the Tile in the map
	 * @param {int} w Tile width
	 * @param {int} h Tile height
	 * @param {int} tileId tileId>
	 */
	me.Tile = me.Rect.extend({
		 /**
		  * tileId
		  * @public
		  * @type int
		  * @name me.Tile#tileId
		  */
		tileId : null,
		/** @private */
		init : function(x, y, w, h, tileId) {
			this.parent(new me.Vector2d(x * w, y * h), w, h);
			this.tileId = tileId;
			this.row = x;
			this.col = y;
		}
	});
	/**
	 * a Tile Set Object
	 * @class
	 * @memberOf me
	 * @constructor
	 */
	me.Tileset = Object.extend({
		init: function (name, tilewidth, tileheight, spacing, margin, imagesrc) {
			this.name = name;
			this.tilewidth = tilewidth;
			this.tileheight = tileheight;
			this.spacing = spacing;
			this.margin = margin;
			this.image = (imagesrc) ? me.loader.getImage(imagesrc.replace(
					removepath, '').replace(removeext, '')) : null;
			if (!this.image) {
				console.log("melonJS: '" + imagesrc + "' file for tileset '" + this.name + "' not found!");
			}
			this.type = {
				SOLID : "solid",
				PLATFORM : "platform",
				L_SLOPE : "lslope",
				R_SLOPE : "rslope",
				LADDER : "ladder",
				BREAKABLE : "breakable"
			};
			this.TileProperties = [];
			this.tileXOffset = [];
			this.tileYOffset = [];
			if (this.image) {
				this.hTileCount = ~~((this.image.width - this.margin) / (this.tilewidth + this.spacing));
				this.vTileCount = ~~((this.image.height - this.margin) / (this.tileheight + this.spacing));
			}
		},
		getPropertyList: function() {
			return {
				isCollidable : false,
				isSolid : false,
				isPlatform : false,
				isSlope : false,
				isLeftSlope : false,
				isRightSlope : false,
				isLadder : false,
				isBreakable : false
			};
		},
		/**
		 * @name me.Tileset#getTileProperties
		 * @public
		 * @function
		 * @param {Integer} tileId
		 * @return {Object}
		 */
		getTileProperties: function(tileId) {
			return this.TileProperties[tileId];
		},
		isTileCollidable : function(tileId) {
			return this.TileProperties[tileId].isCollidable;
		},
		getTileImage : function(tileId) {
			var image = me.video.createCanvasSurface(this.tilewidth, this.tileheight);
			this.drawTile(image, 0, 0, tileId);
			return image.canvas;
		},
		getTileOffsetX : function(tileId) {
			if (this.tileXOffset[tileId] == null) {
				this.tileXOffset[tileId] = this.margin + (this.spacing + this.tilewidth)  * (tileId % this.hTileCount);
			}
			return this.tileXOffset[tileId];
		},
		getTileOffsetY : function(tileId) {
			if (this.tileYOffset[tileId] == null) {
				this.tileYOffset[tileId] = this.margin + (this.spacing + this.tileheight)	* ~~(tileId / this.hTileCount);
			}
			return this.tileYOffset[tileId];
		},
		drawTile : function(context, dx, dy, tileId, flipx, flipy, flipad) {
			if (flipx || flipy || flipad) {
				var m11 = 1;
				var m12 = 0;
				var m21 = 0;
				var m22 = 1;
				var mx	= dx;
				var my	= dy;
				dx = dy = 0;
				if (flipad){
					m11=0;
					m12=1;
					m21=1;
					m22=0;
					my += this.tileheight - this.tilewidth;
				}
				if (flipx){
					m11 = -m11;
					m21 = -m21;
					mx += flipad ? this.tileheight : this.tilewidth;
				}
				if (flipy){
					m12 = -m12;
					m22 = -m22;
					my += flipad ? this.tilewidth : this.tileheight;
				}
				context.setTransform(m11, m12, m21, m22, mx, my);
			}
			context.drawImage(this.image,
							  this.getTileOffsetX(tileId), this.getTileOffsetY(tileId),
							  this.tilewidth, this.tileheight,
							  dx, dy,
							  this.tilewidth, this.tileheight);
			if  (flipx || flipy || flipad)  {
				context.setTransform(1, 0, 0, 1, 0, 0);
			}
		}
	});
	/**
	 * @memberOf me
	 * @private
	 * @constructor
	 */
	CollisionTiledLayer = Object.extend({
		init: function CollisionTiledLayer(realwidth, realheight) {
			this.realwidth = realwidth;
			this.realheight = realheight;
			this.isCollisionMap = true;
		},
		/**
		 * @private
		 **/
		checkCollision : function(obj, pv) {
			var x = (pv.x < 0) ? obj.left + pv.x : obj.right + pv.x;
			var y = (pv.y < 0) ? obj.top + pv.y : obj.bottom + pv.y;
			var res = {
				x : 0,
				y : 0,
				xprop : {},
				yprop : {}
			};
			if (x <= 0 || x >= this.realwidth) {
				res.x = pv.x;
			}
			if (y <= 0 || y >= this.realheight) {
				res.y = pv.y;
			}
			return res;
		}
	});
	/**
	 * @class
	 * @memberOf me
	 * @constructor
	 */
	me.TiledLayer = Object.extend({
		init: function(w, h, tw, th, tilesets, z) {
			this.width = w;
			this.height = h;
			this.tilewidth  = tw;
			this.tileheight = th;
			this.realwidth = this.width * this.tilewidth;
			this.realheight = this.height * this.tileheight;
			this.z = z;
			this.name = null;
			this.visible = false;
			this.layerData = null;
			this.xLUT = {};
			this.yLUT = {};
			/**
			 * @public
			 * @type me.TMXTilesetGroup
			 * @name me.TiledLayer#tilesets
			 */
			this.tilesets = tilesets;
			this.tileset = tilesets?this.tilesets.getTilesetByIndex(0):null;
		},
		/**
		 * @private
		 */
		initArray : function(createLookup) {
			this.layerData = [];
			for ( var x = 0; x < this.width + 1; x++) {
				this.layerData[x] = [];
				for ( var y = 0; y < this.height + 1; y++) {
					this.layerData[x][y] = null;
				}
			}
			if (createLookup) {
				for ( var x = 0; x < this.width * this.tilewidth; x++)
					this.xLUT[x] = ~~(x / this.tilewidth);
				for ( var y = 0; y < this.height * this.tileheight; y++)
					this.yLUT[y] = ~~(y / this.tileheight);
			}
		},
		/**
		 * @name me.TiledLayer#getTileId
		 * @public
		 * @function
		 * @param {Integer} x x position
		 * @param {Integer} y y position
		 * @return {Int} TileId
		 */
		getTileId : function(x, y) {
			var tile = this.layerData[this.xLUT[x]][this.yLUT[y]];
			return tile ? tile.tileId : null;
		},
		/**
		 * @name me.TiledLayer#getTile
		 * @public
		 * @function
		 * @param {Integer} x x position
		 * @param {Integer} y y position
		 * @return {me.Tile} Tile Object
		 */
		getTile : function(x, y) {
			return this.layerData[this.xLUT[x]][this.yLUT[y]];
		},
		/**
		 * @name me.TiledLayer#setTile
		 * @public
		 * @function
		 * @param {Integer} x x position
		 * @param {Integer} y y position
		 * @param {Integer} tileId tileId
		 */
		setTile : function(x, y, tileId) {
			this.layerData[x][y] = new me.Tile(x, y, this.tilewidth, this.tileheight, tileId);
		},
		/**
		 * @name me.TiledLayer#clearTile
		 * @public
		 * @function
		 * @param {Integer} x x position
		 * @param {Integer} y y position
		 */
		clearTile : function(x, y) {
			this.layerData[x][y] = null;
		},
		/**
		 * @private
		 */
		checkCollision : function(obj, pv) {
			var x = (pv.x < 0) ? ~~(obj.left + pv.x) : Math.ceil(obj.right  - 1 + pv.x);
			var y = (pv.y < 0) ? ~~(obj.top  + pv.y) : Math.ceil(obj.bottom - 1 + pv.y);
			var res = {
				x : 0,
				xtile : undefined,
				xprop : {},
				y : 0,
				ytile : undefined,
				yprop : {}
			};
			if (x <= 0 || x >= this.realwidth) {
				res.x = pv.x;
			} else if (pv.x != 0 ) {
				res.xtile = this.getTile(x, Math.ceil(obj.bottom - 1));
				if (res.xtile && this.tileset.isTileCollidable(res.xtile.tileId)) {
					res.x = pv.x;
					res.xprop = this.tileset.getTileProperties(res.xtile.tileId);
				} else {
					res.xtile = this.getTile(x, ~~obj.top);
					if (res.xtile && this.tileset.isTileCollidable(res.xtile.tileId)) {
						res.x = pv.x;
						res.xprop = this.tileset.getTileProperties(res.xtile.tileId);
					}
				}
			}
			if ( pv.y != 0 ) {
				res.ytile = this.getTile((pv.x < 0) ? ~~obj.left : Math.ceil(obj.right - 1), y);
				if (res.ytile && this.tileset.isTileCollidable(res.ytile.tileId)) {
					res.y = pv.y || 1;
					res.yprop = this.tileset.getTileProperties(res.ytile.tileId);
				} else {
					res.ytile = this.getTile((pv.x < 0) ? Math.ceil(obj.right - 1) : ~~obj.left, y);
					if (res.ytile && this.tileset.isTileCollidable(res.ytile.tileId)) {
						res.y = pv.y || 1;
						res.yprop = this.tileset.getTileProperties(res.ytile.tileId);
					}
				}
			}
			return res;
		},
		/**
		 * @private
		 */
		update : function() {
			return false;
		}
	});
	/**
	 * @class
	 * @memberOf me
	 * @constructor
	 */
	me.TileMap = Object.extend({
		init: function(x, y) {
			this.pos = new me.Vector2d(x, y);
			this.z = 0;
			/**
			 * @public
			 * @type String
			 * @name me.TileMap#name
			 */
			this.name = null;
			/**
			 * @public
			 * @type Int
			 * @name me.TileMap#width
			 */
			this.width = 0;
			/**
			 * @public
			 * @type Int
			 * @name me.TileMap#height
			 */
			this.height = 0;
			/**
			 * @public
			 * @type Int
			 * @name me.TileMap#realwidth
			 */
			this.realwidth = -1;
			/**
			 * @public
			 * @type Int
			 * @name me.TileMap#realheight
			 */
			this.realheight = -1;
			/**
			 * @public
			 * @type Int
			 * @name me.TileMap#tilewidth
			 */
			this.tilewidth = 0;
			/**
			 * @public
			 * @type Int
			 * @name me.TileMap#tileheight
			 */
			this.tileheight = 0;
			this.tilesets = null;
			this.mapLayers = [];
			this.objectGroups = [];
			this.initialized = false;
		},
		/**
		 * @private
		 */
		reset : function() {
			this.tilesets = null;
			this.mapLayers.length = 0;
			this.objectGroups.length = 0;
			this.initialized = false;
		},
		/**
		 * @private
		 */
		getObjectGroupByName : function(name) {
			return this.objectGroups[name];
		},
		/**
		 * @private
		 */
		getObjectGroups : function() {
			return this.objectGroups;
		},
		/**
		 * @name me.TileMap#getLayerByName
		 * @public
		 * @function
		 * @param {String} name Layer Name
		 * @return {me.TiledLayer} Layer Object
		 */
		getLayerByName : function(name) {
			var layer = null;
			name = name.trim().toLowerCase();
			for ( var i = this.mapLayers.length; i--;) {
				if (this.mapLayers[i].name.toLowerCase().contains(name)) {
					layer = this.mapLayers[i];
					break;
				}
			};
			if ((name.toLowerCase().contains(me.LevelConstants.COLLISION_MAP)) && (layer == null)) {
				layer = new CollisionTiledLayer(me.game.currentLevel.realwidth,	me.game.currentLevel.realheight);
			}
			return layer;
		},
		/**
		 * @name me.TileMap#clearTile
		 * @public
		 * @function
		 * @param {Integer} x x position
		 * @param {Integer} y y position
		 */
		clearTile : function(x, y) {
			for ( var i = this.mapLayers.length; i--;) {
				if (this.mapLayers[i].visible || this.mapLayers[i].isCollisionMap) {
					this.mapLayers[i].clearTile(x, y);
				}
			};
		},
		/**
		 * @private
		 */
		addTo : function(gameMngr) {
			if (this.visible) {
				gameMngr.add(this);
			}
			for ( var i = this.mapLayers.length; i--;) {
				if (this.mapLayers[i].visible) {
					gameMngr.add(this.mapLayers[i]);
				}
			};
		},
		/**
		 * @private
		 */
		 update : function() {
			return false;
		}
	});
	/**
	 * @final
	 * @memberOf me
	 * @constructor Should not be called by the user.
	 */
	me.levelDirector = (function() {
		var obj = {};
		var levels = {};
		var levelIdx = [];
		var currentLevelIdx = 0;
		/**
		 * @private
		 */
		obj.reset = function() {
		};
		/**
		 * @private
		 */
		obj.addLevel = function(level) {
			throw "melonJS: no level loader defined";
		};
		/**
		 *
		 * @private
		 */
		obj.addTMXLevel = function(levelId, callback) {
			if (levels[levelId] == null) {
				levels[levelId] = new me.TMXTileMap(levelId, 0, 0);
				levels[levelId].name = levelId;
				levelIdx[levelIdx.length] = levelId;
			}
			if (callback)
				callback();
		};
		/**
		 * load a level into the game manager<br>
		 * (will also create all level defined entities, etc..)
		 * @name me.levelDirector#loadLevel
		 * @public
		 * @function
		 * @param {String} level level id
		 * @example
		 *
		 *
		 *
		 * ...
		 * {name: "a4_level1",   type: "tmx",   src: "data/level/a4_level1.tmx"},
		 * {name: "a4_level2",   type: "tmx",   src: "data/level/a4_level2.tmx"},
		 * {name: "a4_level3",   type: "tmx",   src: "data/level/a4_level3.tmx"},
		 * ...
		 * ...
		 *
		 * me.levelDirector.loadLevel("a4_level1");
		 */
		obj.loadLevel = function(levelId) {
			levelId = levelId.toString().toLowerCase();
			if (levels[levelId] === undefined) {
				throw ("melonJS: level " + levelId + " not found");
			}
			if (levels[levelId] instanceof me.TMXTileMap) {
				var isRunning = me.state.isRunning();
				if (isRunning) {
					me.state.pause();
				}
				me.game.reset();
				me.utils.resetGUID(levelId);
				if (levels[currentLevelIdx]) {
					levels[currentLevelIdx].reset();
				}
				levels[levelId].load();
				currentLevelIdx = levelIdx.indexOf(levelId);
				me.game.loadTMXLevel(levels[levelId]);
				if (isRunning) {
					me.state.resume();
				}
			} else
				throw "melonJS: no level loader defined";
			return true;
		};
		/**
		 * return the current level id<br>
		 * @name me.levelDirector#getCurrentLevelId
		 * @public
		 * @function
		 * @return {String}
		 */
		obj.getCurrentLevelId = function() {
			return levelIdx[currentLevelIdx];
		},
		/**
		 * reload the current level<br>
		 * @name me.levelDirector#reloadLevel
		 * @public
		 * @function
		 */
		obj.reloadLevel = function() {
			return obj.loadLevel(obj.getCurrentLevelId());
		},
		/**
		 * load the next level<br>
		 * @name me.levelDirector#nextLevel
		 * @public
		 * @function
		 */
		obj.nextLevel = function() {
			if (currentLevelIdx + 1 < levelIdx.length) {
				return obj.loadLevel(levelIdx[currentLevelIdx + 1]);
			} else {
				return false;
			}
		};
		/**
		 * load the previous level<br>
		 * @name me.levelDirector#previousLevel
		 * @public
		 * @function
		 */
		obj.previousLevel = function() {
			if (currentLevelIdx - 1 >= 0) {
				return obj.loadLevel(levelIdx[currentLevelIdx - 1]);
			} else {
				return false;
			}
		};
		return obj;
	})();
	/*---------------------------------------------------------*/
	/*---------------------------------------------------------*/
})(window);
/*
 * MelonJS Game Engine
 * Copyright (C) 2012, Olivier BIOT
 * http:
 *
 * Tile QT 0.7.x format
 * http:
 *
 */
(function($, undefined) {
	me.TMX_TAG_MAP                 = "map";
	me.TMX_TAG_NAME                = "name";
	me.TMX_TAG_VALUE               = "value";
	me.TMX_TAG_VERSION             = "version";
	me.TMX_TAG_ORIENTATION	       = "orientation";
	me.TMX_TAG_WIDTH               = "width";
	me.TMX_TAG_HEIGHT              = "height";
	me.TMX_TAG_OPACITY             = "opacity";
	me.TMX_TAG_TRANS               = "trans";
	me.TMX_TAG_TILEWIDTH           = "tilewidth";
	me.TMX_TAG_TILEHEIGHT          = "tileheight";
	me.TMX_TAG_TILEOFFSET          = "tileoffset";
	me.TMX_TAG_FIRSTGID            = "firstgid";
	me.TMX_TAG_GID                 = "gid";
	me.TMX_TAG_TILE                = "tile";
	me.TMX_TAG_ID                  = "id";
	me.TMX_TAG_DATA                = "data";
	me.TMX_TAG_COMPRESSION         = "compression";
	me.TMX_TAG_ENCODING            = "encoding";
	me.TMX_TAG_ATTR_BASE64         = "base64";
	me.TMX_TAG_CSV                 = "csv";
	me.TMX_TAG_SPACING             = "spacing";
	me.TMX_TAG_MARGIN              = "margin";
	me.TMX_TAG_PROPERTIES          = "properties";
	me.TMX_TAG_PROPERTY            = "property";
	me.TMX_TAG_IMAGE               = "image";
	me.TMX_TAG_SOURCE              = "source";
	me.TMX_TAG_VISIBLE             = "visible";
	me.TMX_TAG_TILESET             = "tileset";
	me.TMX_TAG_LAYER               = "layer";
	me.TMX_TAG_OBJECTGROUP         = "objectgroup";
	me.TMX_TAG_OBJECT              = "object";
	me.TMX_TAG_X                   = "x";
	me.TMX_TAG_Y                   = "y";
	me.TMX_TAG_WIDTH               = "width";
	me.TMX_TAG_HEIGHT              = "height";
})(window);
(function($, undefined) {
	/**
	 * @final
	 * @memberOf me
	 * @private
	 */
	me.TMXUtils = (function() {
		var api = {};
		/**
		 * Apply TMX Properties to the give object
		 * @private
		 */
		api.setTMXProperties = function(obj, xmldata) {
			var layer_properties = xmldata.getElementsByTagName(me.TMX_TAG_PROPERTIES)[0];
			if (layer_properties) {
				var oProp = layer_properties.getElementsByTagName(me.TMX_TAG_PROPERTY);
				for ( var i = 0; i < oProp.length; i++) {
					var propname = me.XMLParser.getStringAttribute(oProp[i], me.TMX_TAG_NAME);
					var value = me.XMLParser.getStringAttribute(oProp[i], me.TMX_TAG_VALUE);
					if (!value || value.isBoolean()) {
						value = value ? (value == "true") : true;
					}
					else if (value.isNumeric()) {
						value = parseInt(value);
					}
					obj[propname] = value;
				}
			}
		};
		return api;
	})();
	/*---------------------------------------------------------*/
	/*---------------------------------------------------------*/
})(window);
/*
 * MelonJS Game Engine
 * Copyright (C) 2012, Olivier BIOT
 * http:
 *
 * Tile QT 0.7.x format
 * http:
 *
 */
(function($, undefined) {
	/* -----
		check if properties are defined for the given objet
		------									*/
	function setTMXProperties(obj, xmldata) {
		var layer_properties = xmldata.getElementsByTagName(me.TMX_TAG_PROPERTIES)[0];
		if (layer_properties) {
			var oProp = layer_properties.getElementsByTagName(me.TMX_TAG_PROPERTY);
			for ( var i = 0; i < oProp.length; i++) {
				var propname = me.XMLParser.getStringAttribute(oProp[i], me.TMX_TAG_NAME);
				var value = me.XMLParser.getStringAttribute(oProp[i], me.TMX_TAG_VALUE);
				if (!value || value.isBoolean()) {
					value = value ? (value == "true") : true;
				}
				else if (value.isNumeric()) {
					value = parseInt(value);
				}
				obj[propname] = value;
			}
		}
	};
	/**
	 * TMX Group Object
	 * @class
	 * @extends Object
	 * @memberOf me
	 * @constructor
	 * @private
	 */
	me.TMXOBjectGroup = Object.extend(
	{
		init : function(name, tmxObjGroup, tilesets, z) {
			this.objects = [];
			this.name   = name;
			this.width  = me.XMLParser.getIntAttribute(tmxObjGroup, me.TMX_TAG_WIDTH);
			this.height = me.XMLParser.getIntAttribute(tmxObjGroup, me.TMX_TAG_HEIGHT);
			this.z      = z;
			var data = tmxObjGroup.getElementsByTagName(me.TMX_TAG_OBJECT);
			for ( var i = 0; i < data.length; i++) {
				this.objects.push(new TMXOBject(data[i], tilesets, z));
			}
		},
		getObjectCount : function() {
			return this.objects.length;
		},
		getObjectByIndex : function(idx) {
			return this.objects[idx];
		}
	});
	/**
	 * a TMX Object
	 * @class
	 * @extends Object
	 * @memberOf me
	 * @constructor
	 * @private
	 */
	TMXOBject = Object.extend(
	{
		init :  function(tmxObj, tilesets, z) {
			this.name = me.XMLParser.getStringAttribute(tmxObj, me.TMX_TAG_NAME);
			this.x = me.XMLParser.getIntAttribute(tmxObj, me.TMX_TAG_X);
			this.y = me.XMLParser.getIntAttribute(tmxObj, me.TMX_TAG_Y);
			this.z = z;
			this.gid = me.XMLParser.getIntAttribute(tmxObj, me.TMX_TAG_GID, null);
			if (this.gid) {
				var tileset = tilesets.getTilesetByGid(this.gid);
				this.width = tileset.tilewidth;
				this.height = tileset.tileheight;
				this.spritewidth = this.width;
				this.y -= this.height;
				this.image = tileset.getTileImage(this.gid - tileset.firstgid);
			}
			else {
				this.width = me.XMLParser.getIntAttribute(tmxObj, me.TMX_TAG_WIDTH, 0);
				this.height = me.XMLParser.getIntAttribute(tmxObj, me.TMX_TAG_HEIGHT, 0);
			}
			me.TMXUtils.setTMXProperties(this, tmxObj);
		},
		getObjectPropertyByName : function(name) {
			return this[name];
		}
	});
})(window);
(function($, undefined) {
	/**
	 * @class
	 * @memberOf me
	 * @constructor
	 */
	me.TMXTilesetGroup = Object.extend({
		init: function () {
			this.tilesets = [];
		},
		add : function(tileset) {
			this.tilesets.push(tileset);
		},
		getTilesetByIndex : function(i) {
			return this.tilesets[i];
		},
		/**
		 * @name me.TMXTilesetGroup#getTilesetByGid
		 * @public
		 * @function
		 * @param {Integer} gid
		 * @return {me.TMXTileset} corresponding tileset
		 */
		getTilesetByGid : function(gid) {
			var invalidRange = -1;
			for ( var i = 0, len = this.tilesets.length; i < len; i++) {
				if (this.tilesets[i].contains(gid))
					return this.tilesets[i];
				if (this.tilesets[i].firstgid == this.tilesets[i].lastgid) {
					if (gid >= this.tilesets[i].firstgid)
					invalidRange = i;
				}
			}
			if (invalidRange!=-1)
				return this.tilesets[invalidRange];
			else
			throw "no matching tileset found for gid " + gid;
		}
	});
    /**
	 * a TMX Tile Set Object
	 * @class
	 * @extends me.Tileset
	 * @memberOf me
	 * @constructor
	 */
	 me.TMXTileset = me.Tileset.extend({
		init: function (xmltileset) {
			this.firstgid = me.XMLParser.getIntAttribute(xmltileset, me.TMX_TAG_FIRSTGID);
			this.parent(me.XMLParser.getStringAttribute(xmltileset, me.TMX_TAG_NAME),
						me.XMLParser.getIntAttribute(xmltileset, me.TMX_TAG_TILEWIDTH),
						me.XMLParser.getIntAttribute(xmltileset, me.TMX_TAG_TILEHEIGHT),
						me.XMLParser.getIntAttribute(xmltileset, me.TMX_TAG_SPACING, 0),
						me.XMLParser.getIntAttribute(xmltileset, me.TMX_TAG_MARGIN, 0),
						xmltileset.getElementsByTagName(me.TMX_TAG_IMAGE)[0].getAttribute(me.TMX_TAG_SOURCE));
			this.lastgid = this.firstgid + ( ((this.hTileCount * this.vTileCount) - 1) || 0);
			this.trans = xmltileset.getElementsByTagName(me.TMX_TAG_IMAGE)[0].getAttribute(me.TMX_TAG_TRANS);
			if (this.trans !== null && this.image) {
				this.image = me.video.applyRGBFilter(this.image, "transparent", this.trans.toUpperCase()).canvas;
			}
			this.tileoffset = new me.Vector2d(0,0);
			var offset = xmltileset.getElementsByTagName(me.TMX_TAG_TILEOFFSET);
			if (offset.length>0) {
				this.tileoffset.x = me.XMLParser.getIntAttribute(offset[0], me.TMX_TAG_X);
				this.tileoffset.y = me.XMLParser.getIntAttribute(offset[0], me.TMX_TAG_Y);
			}
			var tileInfo = xmltileset.getElementsByTagName(me.TMX_TAG_TILE);
			for ( var i = 0; i < tileInfo.length; i++) {
				var tileID = me.XMLParser.getIntAttribute(tileInfo[i], me.TMX_TAG_ID) + this.firstgid;
				this.TileProperties[tileID] = {};
				var tileProp = this.TileProperties[tileID];
				me.TMXUtils.setTMXProperties(tileProp, tileInfo[i]);
				tileProp.isSolid = tileProp.type ? tileProp.type.toLowerCase() === this.type.SOLID : false;
				tileProp.isPlatform = tileProp.type ? tileProp.type.toLowerCase() === this.type.PLATFORM : false;
				tileProp.isLeftSlope = tileProp.type ? tileProp.type.toLowerCase() === this.type.L_SLOPE : false;
				tileProp.isRightSlope = tileProp.type ? tileProp.type.toLowerCase() === this.type.R_SLOPE	: false;
				tileProp.isBreakable = tileProp.type ? tileProp.type.toLowerCase() === this.type.BREAKABLE : false;
				tileProp.isLadder = tileProp.type ? tileProp.type.toLowerCase() === this.type.LADDER : false;
				tileProp.isSlope = tileProp.isLeftSlope || tileProp.isRightSlope;
				tileProp.isCollidable = tileProp.isSolid || tileProp.isPlatform
										|| tileProp.isSlope || tileProp.isLadder
										|| tileProp.isBreakable;
			}
		},
		/**
		 * return true if the gid belongs to the tileset
		 * @name me.TMXTileset#contains
		 * @public
		 * @function
		 * @param {Integer} gid
		 * @return {boolean}
		 */
		contains : function(gid) {
			return (gid >= this.firstgid && gid <= this.lastgid)
		}
	});
	/*---------------------------------------------------------*/
	/*---------------------------------------------------------*/
})(window);
/*
 * MelonJS Game Engine
 * Copyright (C) 2012, Olivier BIOT
 * http:
 *
 * Tile QT 0.7.x format
 * http:
 *
 */
(function($, undefined) {
	/**
	 * a Generic Map Renderder
	 * Tile QT 0.7.x format
	 * @memberOf me
	 * @private
	 * @constructor
	 */
	TMXRenderer = Object.extend({
		init: function(predraw, width, height, tilewidth, tileheight) {
			this.predraw = predraw;
			this.width = width;
			this.height = height;
			this.tilewidth = tilewidth;
			this.tileheight = tileheight;
		},
		/**
		 * draw the a Tile on the map
		 * @private
		 */
		drawTile : function(context, x, y, gid, tileset, flipX, flipY) {
		}
	});
	/**
	 * an Orthogonal Map Renderder
	 * Tile QT 0.7.x format
	 * @memberOf me
	 * @private
	 * @constructor
	 */
	me.TMXOrthogonalRenderer = TMXRenderer.extend({
		/**
		 * draw the tile map
		 * @private
		 */
		drawTile : function(context, x, y, gid, tileset, flipX, flipY, flipad) {
			tileset.drawTile(context,
							 tileset.tileoffset.x + x * this.tilewidth,
							 tileset.tileoffset.y + (y + 1) * this.tileheight - tileset.tileheight,
							 gid - tileset.firstgid,
							 flipX, flipY, flipad);
		}
	});
	/**
	 * an Orthogonal Map Renderder
	 * Tile QT 0.7.x format
	 * @memberOf me
	 * @private
	 * @constructor
	 */
	me.TMXIsometricRenderer = TMXRenderer.extend({
		/**
		 * draw the tile map
		 * @private
		 */
		drawTile : function(context, x, y, gid, tileset, flipX, flipY, flipad) {
			tileset.drawTile(context,
							 ((this.width-1) * tileset.tilewidth + (x-y) * tileset.tilewidth>>1),
							 (-tileset.tilewidth + (x+y) * tileset.tileheight>>2),
							 gid - tileset.firstgid,
							 flipX, flipY, flipad);
		}
	});
})(window);
/*
 * MelonJS Game Engine
 * Copyright (C) 2012, Olivier BIOT
 * http:
 *
 * Tile QT 0.7.x format
 * http:
 *
 */
(function($, undefined) {
	/**
	 * a TMX Tile Map Object
	 * Tile QT 0.7.x format
	 * @class
	 * @extends me.TileMap
	 * @memberOf me
	 * @constructor
	 */
	me.TMXTileMap = me.TileMap.extend({
		init: function(xmlfile, x, y) {
			this.parent(x, y);
			this.xmlMap = me.loader.getXML(xmlfile);
			if (!this.xmlMap) {
				throw "melonJS:" + xmlfile + " TMX map not found";
			};
			this.version = "";
			this.orientation = "";
			this.tilesets = null;
		},
		/**
		 * @private
		 */
		reset : function() {
			this.background_image = null;
			for ( var i = this.mapLayers.length; i--;) {
				this.mapLayers[i].layerSurface = null;
				this.mapLayers[i].layerCanvas = null;
				this.mapLayers[i].layerData = null;
				this.mapLayers[i].xLUT = this.yLUT = null
				this.mapLayers[i].tilesets = this.tileset = null;
				this.mapLayers[i].objectGroups = null;
				this.mapLayers[i] = null;
			};
			this.initialized = false
			this.parent();
		},
		/**
		 * @private
		 */
		load : function() {
			if (this.initialized)
				return;
			var zOrder = 0,
			pLayer = 1;
			me.XMLParser.parseFromString(this.xmlMap);
			var xmlElements = me.XMLParser.getAllTagElements();
			for ( var i = 0; i < xmlElements.length; i++) {
				var tagName = xmlElements.item(i).nodeName;
				switch (tagName) {
				case me.TMX_TAG_MAP: {
				   var map = xmlElements.item(i);
				   this.version = me.XMLParser.getStringAttribute(map, me.TMX_TAG_VERSION);
				   this.orientation = me.XMLParser.getStringAttribute(map, me.TMX_TAG_ORIENTATION);
				   this.width = me.XMLParser.getIntAttribute(map, me.TMX_TAG_WIDTH);
				   this.height = me.XMLParser.getIntAttribute(map, me.TMX_TAG_HEIGHT);
				   this.tilewidth = me.XMLParser.getIntAttribute(map,	me.TMX_TAG_TILEWIDTH);
				   this.tileheight = me.XMLParser.getIntAttribute(map, me.TMX_TAG_TILEHEIGHT);
				   this.realwidth = this.width * this.tilewidth;
				   this.realheight = this.height * this.tileheight;
				   this.z = zOrder++;
				   me.TMXUtils.setTMXProperties(this, map);
				   this.visible = false;
				   if (this.background_color) {
					  this.visible = true;
					  this.background_color = me.utils
							.HexToRGB(this.background_color);
				   }
				   if (this.background_image) {
					  this.visible = true;
					  this.background_image = me.loader.getImage(this.background_image);
				   }
				   break;
				}
				case me.TMX_TAG_TILESET: {
				   if (!this.tilesets) {
					  this.tilesets = new me.TMXTilesetGroup();
				   }
				   this.tilesets.add(new me.TMXTileset(xmlElements.item(i)));
				   break;
				}
				case me.TMX_TAG_LAYER: {
				   var layer_name = me.XMLParser.getStringAttribute(xmlElements.item(i), me.TMX_TAG_NAME);
				   if (layer_name.toLowerCase().contains(me.LevelConstants.PARALLAX_MAP)) {
					  var visible = (me.XMLParser.getIntAttribute(xmlElements.item(i), me.TMX_TAG_VISIBLE, 1) == 1);
					  if (visible) {
						 var tprop = {};
						 me.TMXUtils.setTMXProperties(tprop, xmlElements.item(i));
						 var parallax_layer = this.getLayerByName(me.LevelConstants.PARALLAX_MAP);
						 if (!parallax_layer) {
							parallax_layer = new me.ParallaxBackgroundEntity(zOrder);
							this.mapLayers.push(parallax_layer);
						 }
						 parallax_layer.addLayer(tprop.imagesrc, pLayer++, zOrder++);
					  }
				   }
				   else {
					  this.mapLayers.push(new me.TMXLayer(xmlElements.item(i), this.tilewidth, this.tileheight, this.orientation, this.tilesets, zOrder++));
					  zOrder++;
				   }
				   break;
				}
				case me.TMX_TAG_OBJECTGROUP: {
				   var name = me.XMLParser.getStringAttribute(xmlElements.item(i), me.TMX_TAG_NAME);
				   this.objectGroups.push(new me.TMXOBjectGroup(name, xmlElements.item(i), this.tilesets, zOrder++));
				   break;
				}
				}
			}
			me.XMLParser.free();
			this.initialized = true;
		},
		/**
		 * draw the tile map
		 * this is only called if the background_color or background_image property is defined
		 * @private
		 */
		draw : function(context, rect) {
			if (this.background_color) {
				context.fillStyle = this.background_color;
				context.fillRect(rect.left, rect.top, rect.width, rect.height);
			}
			if (this.background_image) {
				context.drawImage(this.background_image, rect.left, rect.top,
						rect.width, rect.height, rect.left, rect.top, rect.width,
						rect.height);
			}
		}
	});
	var FlippedHorizontallyFlag		= 0x80000000;
	var FlippedVerticallyFlag		= 0x40000000;
	var FlippedAntiDiagonallyFlag   = 0x20000000;
	/**
	 * a TMX Tile Map Object
	 * Tile QT 0.7.x format
	 * @class
	 * @extends me.TiledLayer
	 * @memberOf me
	 * @constructor
	 */
	me.TMXLayer = me.TiledLayer.extend({
		init: function(layer, tilewidth, tileheight, orientation, tilesets, zOrder) {
			this.parent(me.XMLParser.getIntAttribute(layer, me.TMX_TAG_WIDTH),
						me.XMLParser.getIntAttribute(layer, me.TMX_TAG_HEIGHT),
						tilewidth,
						tileheight,
						tilesets,
						zOrder);
			this.orientation = orientation;
			this.layerInvalidated = true;
			this.name = me.XMLParser.getStringAttribute(layer, me.TMX_TAG_NAME);
			this.visible = (me.XMLParser.getIntAttribute(layer, me.TMX_TAG_VISIBLE, 1) == 1);
			this.opacity = me.XMLParser.getFloatAttribute(layer, me.TMX_TAG_OPACITY, 1.0);
			me.TMXUtils.setTMXProperties(this, layer);
			this.isCollisionMap = (this.name.toLowerCase().contains(me.LevelConstants.COLLISION_MAP));
			if (this.isCollisionMap) {
				this.visible = false;
			}
			this.vp = me.game.viewport;
			var xmldata = layer.getElementsByTagName(me.TMX_TAG_DATA)[0];
			var encoding = me.XMLParser.getStringAttribute(xmldata, me.TMX_TAG_ENCODING, null);
			var compression = me.XMLParser.getStringAttribute(xmldata, me.TMX_TAG_COMPRESSION, null);
			if (encoding == '')
				encoding = null;
			if (compression == '')
				compression = null;
			if (this.visible) {
				switch (this.orientation)
				{
					case "orthogonal": {
					  this.renderer = new me.TMXOrthogonalRenderer(true, this.width, this.height, this.tilewidth, this.tileheight);
					  break;
					}
					case "isometric": {
					  this.renderer = new me.TMXIsometricRenderer(true, this.width, this.height , this.tilewidth, this.tileheight);
					  break;
					}
					default : {
						throw "melonJS: " + this.orientation + " type TMX Tile Map not supported!";
					}
				}
				this.layerSurface = me.video.createCanvasSurface(this.width	* this.tilewidth, this.height * this.tileheight);
				this.layerCanvas = this.layerSurface.canvas;
				if (this.opacity > 0.0 && this.opacity < 1.0) {
					this.layerSurface.globalAlpha = this.opacity;
				}
			}
			if (this.visible || this.isCollisionMap) {
				this.initArray(this.isCollisionMap);
				this.fillArray(xmldata, encoding, compression);
			}
		},
		/**
		 * Build the tiled layer
		 * @private
		 */
		fillArray : function(xmldata, encoding, compression) {
			switch (compression) {
			 case null: {
				switch (encoding) {
				   case null: {
					  var data = xmldata.getElementsByTagName(me.TMX_TAG_TILE);
					  break;
				   }
				   case me.TMX_TAG_CSV:
				   case me.TMX_TAG_ATTR_BASE64: {
					  var nodeValue = '';
					  for ( var i = 0, len = xmldata.childNodes.length; i < len; i++) {
						 nodeValue += xmldata.childNodes[i].nodeValue;
					  }
					  if (encoding == me.TMX_TAG_ATTR_BASE64)
						 var data = me.utils.decodeBase64AsArray(nodeValue, 4);
					  else
						 var data = me.utils.decodeCSV(nodeValue, this.width);
					  nodeValue = null;
					  break;
				   }
				   default:
					  throw "melonJS: TMX Tile Map " + encoding + " encoding not supported!";
					  break;
				}
			 break;
			 }
			 default:
				throw "melonJS: " + compression+ " compressed TMX Tile Map not supported!";
				break;
			}
			var idx = 0;
			var flipx, flipy, flipad;
			var gid;
			for ( var y = 0 ; y <this.height; y++) {
				for ( var x = 0; x <this.width; x++) {
					gid = (encoding == null) ? me.XMLParser.getIntAttribute(data[idx++], me.TMX_TAG_GID) : data[idx++];
					flipx = (gid & FlippedHorizontallyFlag);
					flipy = (gid & FlippedVerticallyFlag);
					flipad = (gid & FlippedAntiDiagonallyFlag);
					gid &= ~(FlippedHorizontallyFlag | FlippedVerticallyFlag | FlippedAntiDiagonallyFlag);
					if (gid > 0) {
						this.setTile(x, y, gid);
						if (!this.tileset.contains(gid)) {
							this.tileset = this.tilesets.getTilesetByGid(gid);
						}
						if (this.visible) {
							this.renderer.drawTile(this.layerSurface, x, y, gid, this.tileset, flipx, flipy, flipad);
						}
					}
				}
			}
			data = null;
		},
		/**
		 * @name me.TMXLayer#clearTile
		 * @public
		 * @function
		 * @param {Integer} x x position
		 * @param {Integer} y y position
		 */
		clearTile : function(x, y) {
			this.parent(x, y);
			if (this.visible) {
				this.layerSurface.clearRect(x * this.tilewidth,	y * this.tileheight, this.tilewidth, this.tileheight);
			}
		},
		/**
		 * @private
		 */
		draw : function(context, rect) {
			context.drawImage(this.layerCanvas,
							this.vp.pos.x + rect.pos.x,
							this.vp.pos.y + rect.pos.y,
							rect.width, rect.height,
							rect.pos.x, rect.pos.y,
							rect.width, rect.height);
		}
	});
})(window);
/**
 * @preserve Tween JS
 * https:
 */
(function($, undefined) {
	/**
	 * <a href="https:
	 * @author <a href="http:
	 * @author <a href="http:
	 * @author <a href="http:
	 * @author <a href="http:
	 * @author <a href="http:
	 * @class
	 * @memberOf me
	 * @constructor
	 * @param {Object} object object on which to apply the tween
	 * @example
	 */
	me.Tween = function(object) {
		var _object = object, _valuesStart = {}, _valuesDelta = {}, _valuesEnd = {}, _duration = 1000, _delayTime = 0, _startTime = null, _easingFunction = me.Tween.Easing.Linear.EaseNone, _chainedTween = null, _onUpdateCallback = null, _onCompleteCallback = null;
		/**
		 * @name me.Tween#to
		 * @public
		 * @function
		 * @param {Properties} prop list of properties
		 * @param {int} duration tween duration
		 */
		this.to = function(properties, duration) {
			if (duration !== null) {
				_duration = duration;
			}
			for ( var property in properties) {
				if (_object[property] === null) {
					continue;
				}
				_valuesEnd[property] = properties[property];
			}
			return this;
		};
		/**
		 * start the tween
		 * @name me.Tween#start
		 * @public
		 * @function
		 */
		this.start = function() {
			me.game.add(this, 999);
			_startTime = me.timer.getTime() + _delayTime;
			for ( var property in _valuesEnd) {
				if (_object[property] === null) {
					continue;
				}
				_valuesStart[property] = _object[property];
				_valuesDelta[property] = _valuesEnd[property]
						- _object[property];
			}
			return this;
		};
		/**
		 * stop the tween
		 * @name me.Tween#stop
		 * @public
		 * @function
		 */
		this.stop = function() {
			me.game.remove(this);
			return this;
		};
		/**
		 * delay the tween
		 * @name me.Tween#delay
		 * @public
		 * @function
		 * @param {int} amount delay amount
		 */
		this.delay = function(amount) {
			_delayTime = amount;
			return this;
		};
		/**
		 * set the easing function
		 * @name me.Tween#easing
		 * @public
		 * @function
		 * @param {Function} easing easing function
		 */
		this.easing = function(easing) {
			_easingFunction = easing;
			return this;
		};
		/**
		 * chain the tween
		 * @name me.Tween#chain
		 * @public
		 * @function
		 * @param {me.Tween} chainedTween Tween to be chained
		 */
		this.chain = function(chainedTween) {
			_chainedTween = chainedTween;
			return this;
		};
		/**
		 * onUpdate callback
		 * @name me.Tween#onUpdate
		 * @public
		 * @function
		 * @param {function} onUpdateCallback callback
		 */
		this.onUpdate = function(onUpdateCallback) {
			_onUpdateCallback = onUpdateCallback;
			return this;
		};
		/**
		 * onComplete callback
		 * @name me.Tween#onComplete
		 * @public
		 * @function
		 * @param {function} onCompleteCallback callback
		 */
		this.onComplete = function(onCompleteCallback) {
			_onCompleteCallback = onCompleteCallback;
			return this;
		};
		/** @private*/
		this.update = function(/* time */) {
			var property, elapsed, value;
			var time = me.timer.getTime();
			if (time < _startTime) {
				return true;
			}
			if ( ( elapsed = ( time - _startTime ) / _duration ) >= 1) {
					elapsed = 1;
			}
			value = _easingFunction(elapsed);
			for (property in _valuesDelta) {
				_object[property] = _valuesStart[property]
						+ _valuesDelta[property] * value;
			}
			if (_onUpdateCallback !== null) {
				_onUpdateCallback.call(_object, value);
			}
			if (elapsed === 1) {
				me.game.remove(this);
				if (_onCompleteCallback !== null) {
					_onCompleteCallback.call(_object);
				}
				if (_chainedTween !== null) {
					_chainedTween.start();
				}
				return false;
			}
			return true;
		};
		/** @private*/
		this.destroy = function() {
			return true;
		};
	}
	/**
	 * @public
	 * @type enum
	 * @name me.Tween#Easing
	 */
	me.Tween.Easing = {
		Linear : {},
		Quadratic : {},
		Cubic : {},
		Quartic : {},
		Quintic : {},
		Sinusoidal : {},
		Exponential : {},
		Circular : {},
		Elastic : {},
		Back : {},
		Bounce : {}
	};
	/** @ignore */
	me.Tween.Easing.Linear.EaseNone = function(k) {
		return k;
	};
	/** @ignore */
	me.Tween.Easing.Quadratic.EaseIn = function(k) {
		return k * k;
	};
	/** @ignore */
	me.Tween.Easing.Quadratic.EaseOut = function(k) {
		return k * ( 2 - k );
	};
	/** @ignore */
	me.Tween.Easing.Quadratic.EaseInOut = function(k) {
		if ((k *= 2) < 1)
			return 0.5 * k * k;
		return -0.5 * (--k * (k - 2) - 1);
	};
	/** @ignore */
	me.Tween.Easing.Cubic.EaseIn = function(k) {
		return k * k * k;
	};
	/** @ignore */
	me.Tween.Easing.Cubic.EaseOut = function(k) {
		return --k * k * k + 1;
	};
	/** @ignore */
	me.Tween.Easing.Cubic.EaseInOut = function(k) {
		if ((k *= 2) < 1)
			return 0.5 * k * k * k;
		return 0.5 * ((k -= 2) * k * k + 2);
	};
	/** @ignore */
	me.Tween.Easing.Quartic.EaseIn = function(k) {
		return k * k * k * k;
	};
	/** @ignore */
	me.Tween.Easing.Quartic.EaseOut = function(k) {
		return 1 - --k * k * k * k;
	}
	/** @ignore */
	me.Tween.Easing.Quartic.EaseInOut = function(k) {
		if ((k *= 2) < 1)
			return 0.5 * k * k * k * k;
		return -0.5 * ((k -= 2) * k * k * k - 2);
	};
	/** @ignore */
	me.Tween.Easing.Quintic.EaseIn = function(k) {
		return k * k * k * k * k;
	};
	/** @ignore */
	me.Tween.Easing.Quintic.EaseOut = function(k) {
		return --k * k * k * k * k + 1;
	};
	/** @ignore */
	me.Tween.Easing.Quintic.EaseInOut = function(k) {
		if ((k *= 2) < 1)
			return 0.5 * k * k * k * k * k;
		return 0.5 * ((k -= 2) * k * k * k * k + 2);
	};
	/** @ignore */
	me.Tween.Easing.Sinusoidal.EaseIn = function(k) {
		return 1 - Math.cos( k * Math.PI / 2 );
	};
	/** @ignore */
	me.Tween.Easing.Sinusoidal.EaseOut = function(k) {
		return Math.sin(k * Math.PI / 2);
	};
	/** @ignore */
	me.Tween.Easing.Sinusoidal.EaseInOut = function(k) {
		return 0.5 * ( 1 - Math.cos( Math.PI * k ) );
	};
	/** @ignore */
	me.Tween.Easing.Exponential.EaseIn = function(k) {
		return k === 0 ? 0 : Math.pow( 1024, k - 1 );
	};
	/** @ignore */
	me.Tween.Easing.Exponential.EaseOut = function(k) {
		return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );
	};
	/** @ignore */
	me.Tween.Easing.Exponential.EaseInOut = function(k) {
		if ( k === 0 ) return 0;
		if ( k === 1 ) return 1;
		if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
		return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
	};
	/** @ignore */
	me.Tween.Easing.Circular.EaseIn = function(k) {
		return 1 - Math.sqrt( 1 - k * k );
	};
	/** @ignore */
	me.Tween.Easing.Circular.EaseOut = function(k) {
		return Math.sqrt(1 - --k * k);
	};
	/** @ignore */
	me.Tween.Easing.Circular.EaseInOut = function(k) {
		if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
		return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
	};
	/** @ignore */
	me.Tween.Easing.Elastic.EaseIn = function(k) {
		var s, a = 0.1, p = 0.4;
		if ( k === 0 ) return 0;
		if ( k === 1 ) return 1;
		if ( !a || a < 1 ) { a = 1; s = p / 4; }
		else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
		return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
	};
	/** @ignore */
	me.Tween.Easing.Elastic.EaseOut = function(k) {
		var s, a = 0.1, p = 0.4;
		if ( k === 0 ) return 0;
		if ( k === 1 ) return 1;
		if ( !a || a < 1 ) { a = 1; s = p / 4; }
		else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
		return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );
	};
	/** @ignore */
	me.Tween.Easing.Elastic.EaseInOut = function(k) {
		var s, a = 0.1, p = 0.4;
		if ( k === 0 ) return 0;
		if ( k === 1 ) return 1;
		if ( !a || a < 1 ) { a = 1; s = p / 4; }
		else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
		if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
		return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;
	};
	/** @ignore */
	me.Tween.Easing.Back.EaseIn = function(k) {
		var s = 1.70158;
		return k * k * ((s + 1) * k - s);
	};
	/** @ignore */
	me.Tween.Easing.Back.EaseOut = function(k) {
		var s = 1.70158;
		return --k * k * ( ( s + 1 ) * k + s ) + 1;
	};
	/** @ignore */
	me.Tween.Easing.Back.EaseInOut = function(k) {
		var s = 1.70158 * 1.525;
		if ((k *= 2) < 1)
			return 0.5 * (k * k * ((s + 1) * k - s));
		return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
	};
	/** @ignore */
	me.Tween.Easing.Bounce.EaseIn = function(k) {
		return 1 - Tween.Easing.Bounce.EaseOut(1 - k);
	};
	/** @ignore */
	me.Tween.Easing.Bounce.EaseOut = function(k) {
		if ( k < ( 1 / 2.75 ) ) {
			return 7.5625 * k * k;
		} else if (k < (2 / 2.75)) {
			return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
		} else if (k < (2.5 / 2.75)) {
			return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
		} else {
			return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
		}
	};
	/** @ignore */
	me.Tween.Easing.Bounce.EaseInOut = function(k) {
		if (k < 0.5)
			return Tween.Easing.Bounce.EaseIn(k * 2) * 0.5;
		return Tween.Easing.Bounce.EaseOut(k * 2 - 1) * 0.5 + 0.5;
	};
})(window);