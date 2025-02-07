
$.Enemy = function( opt ) {
	for( var k in opt ) {
		this[k] = opt[k];
	}
	this.lightness = $.util.isset( this.lightness ) ? this.lightness : 50;
	this.saturation = $.util.isset( this.saturation ) ? this.saturation : 100;
	this.setup = this.setup || function(){};
	this.death = this.death || function(){};
	this.index = $.indexGlobal++;
	this.inView = this.hitFlag = this.vx = this.vy = 0;
	this.lifeMax = opt.life;
	this.fillStyle ='hsla(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%, 0.1)';
	this.strokeStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%, 1)';
	this.setup();
	if( $.levelDiffOffset > 0 ){
		this.life += $.levelDiffOffset * 0.25;
		this.lifeMax = this.life;
		this.speed += Math.min( $.hero.vmax, $.levelDiffOffset * 0.25 );
		this.value += $.levelDiffOffset * 5;
	}
};
$.Enemy.prototype.update = function( i ) {
	this.behavior();
	this.x += this.vx * $.dt;
	this.y += this.vy * $.dt;
	if( this.lockBounds && !$.util.arcInRect( this.x, this.y, this.radius + 10, 0, 0, $.ww, $.wh ) ) {
		$.enemies.splice( i, 1 );
	}
	if( $.util.arcInRect( this.x, this.y, this.radius, -$.screen.x, -$.screen.y, $.cw, $.ch ) ) {
		this.inView = 1;
	} else {
		this.inView = 0;
	}
};
$.Enemy.prototype.receiveDamage = function( i, val ) {
	if( this.inView ) {
		$.audio.play( 'hit' );
	}
	this.life -= val;
	this.hitFlag = 10;
	if( this.life <= 0 ) {
		if( this.inView ) {
			$.explosions.push( new $.Explosion( {
				x: this.x,
				y: this.y,
				radius: this.radius,
				hue: this.hue,
				saturation: this.saturation
			} ) );
			$.particleEmitters.push( new $.ParticleEmitter( {
				x: this.x,
				y: this.y,
				count: 10,
				spawnRange: this.radius,
				friction: 0.85,
				minSpeed: 5,
				maxSpeed: 20,
				minDirection: 0,
				maxDirection: $.twopi,
				hue: this.hue,
				saturation: this.saturation
			} ) );
			$.textPops.push( new $.TextPop( {
				x: this.x,
				y: this.y,
				value: this.value,
				hue: this.hue,
				saturation: this.saturation,
				lightness: 60
			} ) );
			$.rumble.level = 6;
		}
		this.death();
		$.spawnPowerup( this.x, this.y );
		$.score += this.value;
		$.level.kills++;
		$.kills++;
		$.enemies.splice( i, 1 );
	}
};
$.Enemy.prototype.renderHealth = function( i ) {
	if( this.inView && this.life > 0 && this.life < this.lifeMax ) {
		$.ctxmg.fillStyle = 'hsla(0, 0%, 0%, 0.75)';
		$.ctxmg.fillRect( this.x - this.radius, this.y - this.radius - 6, this.radius * 2, 3 );
		$.ctxmg.fillStyle = 'hsla(' + ( this.life / this.lifeMax ) * 120 + ', 100%, 50%, 0.75)';
		$.ctxmg.fillRect( this.x - this.radius, this.y - this.radius - 6, ( this.radius * 2 ) * ( this.life / this.lifeMax ), 3 );
	}
};
$.Enemy.prototype.render = function( i ) {
	if( this.inView ) {
		var mod = $.enemyOffsetMod / 6;
		$.util.fillCircle( $.ctxmg, this.x, this.y, this.radius, this.fillStyle );
		$.util.strokeCircle( $.ctxmg, this.x, this.y, this.radius / 4 + Math.cos( mod ) * this.radius / 4, this.strokeStyle, 1.5 );
		$.util.strokeCircle( $.ctxmg, this.x, this.y, this.radius - 0.5, this.strokeStyle, 1 );
		$.ctxmg.strokeStyle = this.strokeStyle;
		$.ctxmg.lineWidth = 4;
		$.ctxmg.beginPath();
		$.ctxmg.arc( this.x, this.y, this.radius - 0.5, mod + $.pi, mod + $.pi + $.pi / 2 );
		$.ctxmg.stroke();
		$.ctxmg.beginPath();
		$.ctxmg.arc( this.x, this.y, this.radius - 0.5, mod, mod + $.pi / 2 );
		$.ctxmg.stroke();
		if( $.slow) {
			$.util.fillCircle( $.ctxmg, this.x, this.y, this.radius, 'hsla(' + $.util.rand( 160, 220 ) + ', 100%, 50%, 0.25)' );
		}
		if( this.hitFlag > 0 ) {
			this.hitFlag -= $.dt;
			$.util.fillCircle( $.ctxmg, this.x, this.y, this.radius, 'hsla(' + this.hue + ', ' + this.saturation + '%, 75%, ' + this.hitFlag / 10 + ')' );
			$.util.strokeCircle( $.ctxmg, this.x, this.y, this.radius, 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + $.util.rand( 60, 90) + '%, ' + this.hitFlag / 10 + ')', $.util.rand( 1, 10) );
		}
		this.renderHealth();
	}
};