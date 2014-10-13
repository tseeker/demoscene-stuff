var USE_SYNTH = 0;

// Vector stuff
function vecOp(code) {
	return eval('(function(o,a,b){for(var i=o.length;--i>=0;)' + code + ';return o})')
}
function vomNew(s) {
	return new Float32Array(s)
}
var vecDot = function(a,b) {
	var s = 0;
	for ( var i in a ) {
		s += a[i]*b[i];
	}
	return s;
};
var vecLen = function(a) {
	return Math.sqrt( vecDot(a,a) )
};
var vecNorm = function(o,a) {
	var l = vecLen(a);
	return l ? vecScale(o,a,1/l) : vecCopy(o,a);
};
var vecCross = function(o,a,b) {
	return vecSet(o,
		a[1]*b[2]-a[2]*b[1] ,
		a[2]*b[0]-a[0]*b[2] ,
		a[0]*b[1]-a[1]*b[0]
	);
};
var vecs2Mat3 = function(o,a,b,c){
	for ( var i = 0 ; i < 3 ; i ++ ) {
		o[i*3+0] = a[i];
		o[i*3+1] = b[i];
		o[i*3+2] = c[i];
	}
};
var vecSet = vecOp('o[i]=arguments[i+1]') ,
    vecCopy = vecOp('o[i]=a[i]') ,
    vecAdd = vecOp('o[i]=a[i]+b[i]') ,
    vecSub = vecOp('o[i]=a[i]-b[i]') ,
    vecScale = vecOp('o[i]=a[i]*b');


// Shaders
var shaderHeader = 'precision highp float;varying !2 zx;';


function shaderFloat( v ) {
	return '' + v + ( v == Math.floor(v) ? '.' : '' );
}
function shaderVec( v ) {
	return v.map(shaderFloat).join(',');
}


// Raymarchers

var materials = [
	{
		albedo: [.05,.05,.05] ,
		metallic: .7 ,
		smoothness: .02 ,
		r0: .01
	} , {
		albedo: [ .2,.2,.2 ] ,
		noise: [ .1,.1,.1] ,
		noiseScale: 5 ,
		metallic: .7 ,
		smoothness: .9 ,
		r0: .01
	} , {
		albedo: [ 1,1,1 ] ,
		metallic: .5 ,
		smoothness: .4 ,
		r0: .02
	} , {
		albedo: [ 3,0,0 ] ,
		noise: [.6,0,0],
		noiseScale: 6 ,
		metallic: .3 ,
		smoothness: .1 ,
		r0: .6
	} , {
		albedo: [ 0,2,0 ] ,
		noise: [0,.2,0],
		noiseScale: 15 ,
		metallic: .9 ,
		smoothness: .5 ,
		r0: .4
	} , {
		albedo: [ 3,1.5,0 ] ,
		noise: [.3,.6,0],
		noiseScale: .3 ,
		metallic: .95 ,
		smoothness: .6 ,
		r0: .9
	} , {
		albedo: [ .1,.1,.1 ] ,
		noise: [3,3,3] ,
		noiseScale: 3,
		metallic: 0 ,
		smoothness: .04 ,
		r0: .002
	} , {
		albedo: [ 0,1.5,2 ] ,
		metallic: .9 ,
		smoothness: .3 ,
		r0: .4
	}
];


var raymarchers = {
	tunnel: {
		maxDistance: 100 ,
		epsilon: .025 ,
		epsilonMultiplier: 1 ,
		step: .7 ,
		depth: 64 ,

		normalDelta: .0005 ,
		noiseScale: .5 ,
		reflectionDistance: .3 ,

		fog: .4 ,
		fogDensity: .015 ,

		aoSteps: 4 ,
		aoDelta: 2 ,
		aoWeight: .75 ,

		materials: [0,1,2,3] ,

		map: [
			"y=x+.1*(sin(x.zxy*.17+u4[0]*.5)+sin(x.yzx*.7+u4[0]*1.5))*8.5*(1.+cos(sin(x.z*.1)+x.z*.3)),",

			"z=14.-length(y.xy),",
			"w=x.x==.0?1.570795*(x.y>.0?1.:-1.):atan(x.y,x.x),",
			"q=8.35-u4[8]*1.35,",

			"y=!3(9.*(mod(w+x.z*.02,.628)-.314),length(x.xy)-9.,mod(x.z,12.56)-6.28),",
			"u=min(length(y.xy)-.25+.1*cos(x.z*8.+u4[0]*.1),length(y.yz)-.5),",
			"y=!3(q*(mod(w+x.z*.02,1.256636)-.628318),y.y+9.-q,mod(x.z,62.8318)-31.4159)," ,
			"o=step(u,z)+1.,",
			"z=min(u,z),",
			"u=length(y)-1.3;",
			"if(u<z)z=u,o=3.;" ,
			"y.y+=q-9.," ,
			"u=yyx(y.yz,8.)-2.;" ,
			"if(u<z)z=u,o=.0;" ,
			"return !2(z,o);"
		].join('\n') ,
		lights: [
			{
				attenuation: .25 ,
				vRadius: 0
			} , {
				attenuation: .5 ,
				vRadius: .5
			}
		] ,
	} ,
	fractals: {
		maxDistance: 6 ,
		epsilon: .00025 ,
		epsilonMultiplier: 1.08 ,
		step: .7 ,
		depth: 100 ,

		normalDelta: .000008 ,
		noiseScale: 10 ,
		reflectionDistance: .03 ,

		fog: 2.1 ,
		fogDensity: .2 ,

		aoSteps: 6 ,
		aoDelta: .4 ,
		aoWeight: 5.1 ,

		materials: [0,2,5] ,

		map: [
			"z=1.," ,
			"y=x;" ,
			"for(int i=0;i<7;i++)" ,
				"x=2.*clamp(x,-!3(.58,.9,1.1),!3(.58,.9,1.1))-x," ,
				"w=max((1.3+u4[9]*.1*cos(u4[0]*.5))/dot(x,x),1.)," ,
				"x*=w," ,
				"z*=w;" ,
			"w=length(x.xy),",
			"e=!2(w-3.,-w*x.z/length(x)-2.*log(1.+.01*a))/abs(z),",
			"w=max(e.x,e.y),",
			"o=step(e.y,e.x),",
			"y+=!3(.1,.3,-.4)*u0-u2+.25*sin(x*1.),",
			"e.x=length(y)-.1*u4[8];",
			"if(e.x<w)w=e.x,o=2.;" ,
			"return !2(w,o);"
		].join('\n') ,
		lights: [
			{
				attenuation: .05
			}
		] ,
	} ,
	squares: {
		maxDistance: 100 ,
		epsilon: .000025 ,
		epsilonMultiplier: 1 ,
		step: .75 ,
		depth: 80 ,

		normalDelta: .00005 ,
		noiseScale: .5 ,
		reflectionDistance: .3 ,

		fog: 3 ,
		fogDensity: .01 ,

		aoSteps: 4 ,
		aoDelta: .75 ,
		aoWeight: 4.75 ,

		materials: [6,0,4] ,

		map: [
			"x.xy*=t(a*.009),",

			"w=min(min(yz(x.xzy),yz(x)),yz(x.yzx)),",

			"y=mod(x,!3(15.))-!3(7.5),",
			"o=step(z=max(length(max(abs(y)-!3(2.5),!3(.0)))-.25,3.5-length(y)),w),",
			"w=min(w,z),",
			"z=length(y+.1*sin(y*5.5+u4[0]))-2.;",
			"if(z<w)",
				"w=z,",
				"o=2.;",
			"return !2(w,o);"
		].join('\n') ,
		lights: [
			{
				attenuation: .05
			}
		] ,
	} ,
	balls: {
		maxDistance: 20 ,
		epsilon: .0005 ,
		epsilonMultiplier: 1 ,
		step: .6 ,
		depth: 128 ,

		normalDelta: .0001 ,
		noiseScale: .5 ,
		reflectionDistance: .002 ,

		fog: .01 ,
		fogDensity: .08 ,

		aoSteps: 4 ,
		aoDelta: .5 ,
		aoWeight: 1.75 ,

		materials: [2,7] ,

		map: [
			"y=x,",
			"y.xz=mod(x.xz,8.)-4.,",
			"y.yz*=t(u4[8]+.1*a),",
			"y.xy*=t(u4[8]*.5+.2*a),",
			"y.y*=.9+.1*sin(u4[8]*5.),",
			"w=max(length(y)-3.,-min(length(y)-2.8,",
				"max(mod(y.y,.8)-.4,-mod(y.y+.4,.8)+.4))),",
			"z=x.y+1.+sin(x.x*4.+u4[8]*2.)*sin(x.z+u4[8])*.1,",
			"o=clamp(.5+.5*(z-w)/1.,.0,1.),",
			"w=mix(z,w,o)-1.*o*(1.-o),",
			"y=x,",
			"y.xz=mod(y.xz,8.)-4.,",
			"y/=1.25+.25*sin(u4[8]*5.),",
			"y.xy*=t(u4[8]*5.),",
			"y.yz*=t(u4[8]*2.5),",
			"z=max(length(y)-1.,.04-length(max(abs(mod(y,.5)-.25)-!3(.15),!3(.0))));",
			"return !2(min(w,z),step(z,w));"
		].join('\n') ,
		lights: [
			{
				attenuation: .02
			},{
				attenuation: .05 ,
				vRadius: .5
			} , {
				attenuation: .05 ,
				vRadius: .5
			}
		] ,
	}
};

var lightFunc = function(intensity,distance) {
	return function(ctx,lctx) {
		vecCopy(lctx.pos,ctx.camPos);
		vecSet(lctx.colour,intensity,intensity,intensity);
		lctx.distance = distance;
		return true;
	}
};
var tun1CamCommon = function(ctx,dir) {
	var z = demoTime*6;
	vecSet(ctx.camPos,-6,0,z);
	vecSet(ctx.lookAt,1,0,z);
	vecSet(ctx.up,0,1,0);
	ctx.misc[1] = 1;
	ctx.misc[8] = 0;
	return ctx.stepTime / dir.time;
};
var desyncFunc = function(desync) {
	return function(ctx,tt) {
		var z = ctx.stepTime / tt;
		ctx.misc[4] = -z * desync;
		if ( desync > 0 ) {
			ctx.misc[4] += desync;
		}
		ctx.misc[4] *= Math.random( ) * .25 + .75;
	};
};
var balls1CamFunc = function(lax,laz,desync) {
	var dsf = desyncFunc(desync);
	return function(ctx) {
		var z = demoTime*3;
		vecSet(ctx.camPos,0,4,z);
		vecSet(ctx.lookAt,lax,0,z+laz);
		vecSet(ctx.up,0,0,1);
		ctx.misc[8]= ctx.misc[2] = 0;
		dsf(ctx,this.time);
	};
};
var balls2CamCommon = function(ctx) {
	var z = demoTime*5;
	vecSet(ctx.camPos,Math.cos(demoTime)*12,8,Math.sin(demoTime)*12+z);
	vecSet(ctx.lookAt,1,0,z);
	vecSet(ctx.up,0,1,0);
	ctx.toNearPlane = 2.5;
	z = demoTime - direction[43].startTime;
	ctx.misc[8]=z;
};
var balls2LightFunc = function(scale) {
	return function(ctx,lctx) {
		var z = demoTime*30;
		vecSet(lctx.pos,scale*Math.cos(demoTime*2)*5,3,scale*Math.sin(demoTime*2)*5+z);
		vecSet(lctx.colour,1,1,1);
		lctx.distance = 4;
		return true;
	};
};
var fract1CamCommon = function(ctx) {
	var z = demoTime;
	vecSet(ctx.camPos,4,2.5+.025*z,6.7);
	vecSet(ctx.lookAt,0,2.5-.05*z,6.7);
	vecSet(ctx.up,0,0,1);
	ctx.misc[8] = ctx.misc[9] = 0;
	ctx.toNearPlane = 3;
};
var fract1CamFunc = function(desync) {
	var dsf = desyncFunc(desync);
	return function(ctx){
		fract1CamCommon(ctx);
		dsf(ctx,this.time);
	};
};
var fract2CamCommon = function(ctx,bs) {
	vecSet(ctx.camPos,5*Math.sin(demoTime*.2),9*Math.cos(demoTime*.41),7.8);
	vecCopy(ctx.lookAt,ctx.camPos);
	ctx.lookAt[0] = Math.cos(demoTime*.2);
	ctx.lookAt[1] = Math.sin(demoTime*.33);
	ctx.lookAt[2] -= 2;
	vecSet(ctx.up,0,0,1);
	ctx.toNearPlane = 3;
	ctx.misc[8] = bs;
	ctx.misc[9] = 1;
};

var drawText = function(str,x) {
	twoDCtx.shadowBlur = c2height/5;
	twoDCtx.fillText( str , x , c2height / 2 );
	twoDCtx.shadowBlur = 0;
	twoDCtx.strokeText( str , x , c2height / 2 );
};
var titleText = function(str,shake,alpha,r,g,b) {
	drawText( str , canvasWidth/15 );
	context.misc[5] = 1 - c2rHeight + Math.random() * shake - shake * .5;
	context.misc[6] = alpha;
	vecSet( context.textColour , r , g , b );
};
var greetings = "Greetings to ... Mog, Sycop, Tim & Wullon ... Adinpsz ... Alcatraz ... ASD ... Bits'n'Bites ... Brain Control ... Cocoon ... Conspiracy ... Ctrl+Alt+Test ... Fairlight ... Farbrausch ... Kewlers ... LNX ... Loonies ... Mercury ... Popsy Team ... Razor 1911 ... RGBA ... 7th Cube ... Still ... TPOLM ... TRBL ... Umlaut Design ... X-Men ... Youth Uprising ... Everyone here at DemoJS 2014!";
var greetingsText = function() {
	var t = ( demoTime - direction[34].startTime ) * canvasWidth * .5;
	drawText( greetings , canvasWidth - t );
	context.misc[5] = 1 - c2rHeight + Math.random() * .02 - .01;
	context.misc[6] = 1;
	vecSet( context.textColour , 1 , 1 , 1 );
};

var squaresCam = function(ctx) {
	var t = demoTime - direction[25].startTime;
	var z = t*10 - 80;
	vecSet(ctx.camPos,z,0,0);
	vecSet(ctx.lookAt,z+Math.cos(t*.5) * 80,Math.sin(t*.25)*40,100);
	vecSet(ctx.up,0,1,0);
};

var squaresCam2 = function(ctx,s) {
	var t = demoTime - direction[s].startTime;
	var z = t*20 - 80;
	vecSet(ctx.camPos,0,0,z);
	vecSet(ctx.lookAt,Math.cos(t*.5) * 80,Math.sin(t*.25)*40,z+100);
	vecSet(ctx.up,Math.sin(t),Math.cos(t),0);
	ctx.misc[4] = Math.random() * .025 - .0125;
};

var tunnelLight = function(ctx,lctx) {
	vecAdd(lctx.pos,vecNorm(lctx.pos,vecScale(lctx.pos,ctx.lookAt,-1)),ctx.camPos);
	lctx.pos[1] -= .5;
	vecSet(lctx.colour,3,3,3);
	lctx.distance = 30;
	return true;
};
var tunnelCam = function(ctx,mul) {
	var z = demoTime*30*ctx.tunMul;
	vecSet(ctx.camPos,1.1*Math.cos(z*.1),Math.sin(z*.02),z);
	z += 5;
	vecSet(ctx.lookAt,-Math.sin(z*.05),-.7*Math.cos(z*.033),z);
	vecSet(ctx.up,0,1,0);
	ctx.toNearPlane = 2;
};
var tunnelLightBall = function(ctx,lctx) {
	vecSet(lctx.pos , 4*Math.sin(demoTime*.5)*Math.cos(demoTime*.7) ,
			3*Math.cos(demoTime*1.5),
			demoTime*30*ctx.tunMul+14+16*Math.sin(demoTime*3.3)*Math.cos(demoTime*.77)
	);
	vecSet(lctx.colour,1,1,1);
	lctx.distance = 15;
	return true;
};

var direction = [
	{
		// Music rows
		rows: 36 ,
		// Raymarcher id
		rm: 'tunnel' ,
		setGlobals: function( ctx ) {
			var z = tun1CamCommon(ctx,this);
			z *= z*z;
			ctx.misc[2] = 1 - z;
			ctx.toNearPlane = 5;
		} ,
		lights: [
			lightFunc(3,20)
		] ,
		updateText: null
	} , {
		rows: 18 ,
		rm: 'tunnel' ,
		setGlobals: function( ctx ) {
			var z = tun1CamCommon(ctx,this);
			ctx.toNearPlane = 5 - 2.25 * z;
			ctx.misc[2] = 0;
		} ,
		lights: [
			lightFunc(3,20)
		] ,
		updateText: null
	} , {
		rows: 36 ,
		rm: 'tunnel' ,
		setGlobals: function( ctx ) {
			var z = tun1CamCommon(ctx,this);
			ctx.toNearPlane = 2.75 - 2.25 * z;
			ctx.misc[2] = z;
		} ,
		lights: [
			lightFunc(3,20)
		] ,
		updateText: null
	} , {
		rows: 18 ,
		rm: 'balls' ,
		setGlobals: function( ctx ) {
			var z = demoTime*3;
			vecSet(ctx.camPos,0,4,z);
			vecSet(ctx.lookAt,4,0,z);
			vecSet(ctx.up,0,0,1);
			z = ctx.stepTime / this.time;
			z *= z*z;
			ctx.misc[2] = 1 - z;
			ctx.toNearPlane = 2.5;
		} ,
		lights: [
			lightFunc(.75,8)
		] ,
		updateText: null
	} , {
		rows: 22 ,
		rm: 'balls' ,
		setGlobals: balls1CamFunc(4,0,0) ,
		lights: [
			lightFunc(1,8)
		] ,
		updateText: null
	} , {
		rows: 22 ,
		rm: 'balls' ,
		setGlobals: balls1CamFunc(2,-2,0) ,
		lights: [
			lightFunc(1,8)
		] ,
		updateText: null
	} , {
		rows: 3 ,
		rm: 'balls' ,
		setGlobals: balls1CamFunc( 6 , 0 , -.5 ) ,
		lights: [
			lightFunc(.5,4)
		] ,
		updateText: null
	} , {
		rows: 9 ,
		rm: 'balls' ,
		setGlobals: balls1CamFunc( 6 , 0 , .5 ) ,
		lights: [
			lightFunc(.5,4)
		] ,
		updateText: null
	} , {
		rows: 3 ,
		rm: 'balls' ,
		setGlobals: balls1CamFunc( 2 , 2 , -.2 ) ,
		lights: [
			lightFunc(1,8)
		] ,
		updateText: null
	} , {
		rows: 9 ,
		rm: 'balls' ,
		setGlobals: balls1CamFunc( 2 , 2 , .2 ) ,
		lights: [
			lightFunc(1,8)
		] ,
		updateText: null
	} , {
		rows: 3 ,
		rm: 'balls' ,
		setGlobals: balls1CamFunc( 2 , 5 , -.7 ) ,
		lights: [
			lightFunc(1,2)
		] ,
		updateText: null
	} , {
		rows: 7 ,
		rm: 'balls' ,
		setGlobals: balls1CamFunc( 2 , 2 , .7 ) ,
		lights: [
			lightFunc(1,2)
		] ,
		updateText: null
	} , {
		rows: 9 ,
		rm: 'balls' ,
		setGlobals: function(ctx) {
			var z = demoTime*3;
			ctx.misc[2] = ctx.stepTime / this.time;
			vecSet(ctx.camPos,0,4+ctx.misc[2]*2,z);
			vecSet(ctx.lookAt,2,0,z+2);
			vecSet(ctx.up,0,0,1);
			ctx.misc[3] = 1;
		} ,
		lights: [
			lightFunc(1,2)
		] ,
		updateText: null
	} , {
		rows: 21 ,
		rm: 'fractals' ,
		setGlobals: function( ctx ) {
			fract1CamCommon(ctx);
			ctx.misc[3] = 1;
			var z = ctx.stepTime / this.time;
			ctx.misc[2] = 1 - z*z*z;
		} , lights : [
			fractLight = function(ctx,lctx) {
				vecCopy(lctx.pos,ctx.camPos);
				lctx.pos[2]+=2;
				vecSet(lctx.colour,1,1,1);
				lctx.distance = 3;
				return true;
			}
		],
		updateText: null
	} , {
		rows: 14 ,
		rm: 'fractals' ,
		setGlobals: fract1CamFunc(0) ,
		lights : [
			fractLight
		],
		updateText: null
	} , {
		rows: 3 ,
		rm: 'fractals' ,
		setGlobals: fract1CamFunc(-.4) ,
		lights : [ fractLight ],
		updateText: null
	} , {
		rows: 9 ,
		rm: 'fractals' ,
		setGlobals: fract1CamFunc(.4) ,
		lights : [ fractLight ],
		updateText: null
	} , {
		rows: 3 ,
		rm: 'fractals' ,
		setGlobals: fract1CamFunc(-.2) ,
		lights : [ fractLight ],
		updateText: null
	} , {
		rows: 9 ,
		rm: 'fractals' ,
		setGlobals: fract1CamFunc(.2) ,
		lights : [ fractLight ],
		updateText: null
	} , {
		rows: 12 ,
		rm: 'fractals' ,
		setGlobals: function(ctx) {
			fract1CamCommon(ctx);
			ctx.misc[4] = -( 6 * ctx.stepTime / this.time ) % 1;
			ctx.misc[4] *= Math.random( ) * .25 + .75;
		} ,
		lights : [ fractLight ],
		updateText: null
	} , {
		rows: 22 ,
		rm: 'fractals' ,
		setGlobals: function(ctx) {
			fract1CamCommon(ctx);
			ctx.misc[3] = .4;
			ctx.misc[2] = ctx.stepTime / this.time;
			ctx.toNearPlane = 3 - 2.5*Math.max(1,2*ctx.misc[2]);
			ctx.misc[4] = ( 30 * ctx.misc[2] ) % 1;
			ctx.misc[4] *= Math.random( ) * .15 + .85;
		} ,
		lights : [ fractLight ],
		updateText: null
	} , {
		rows: 3 ,
		rm: 'fractals' ,
		setGlobals: neutral = function(ctx) {
			fract1CamCommon(ctx);
			ctx.misc[3] = .4;
			ctx.misc[2] = 1;
			ctx.misc[4] = 0;
		} ,
		lights : [ fractLight ],
		updateText: null
	} , {
		rows: 12 ,
		rm: 'fractals' ,
		setGlobals: neutral ,
		lights : [ fractLight ],
		updateText: function() {
			titleText( "TheT(ourist)" , .08 , 1 , 1 , 1 , 1 );
		}
	} , {
		rows: 12 ,
		rm: 'fractals' ,
		setGlobals: neutral ,
		lights : [ fractLight ],
		updateText: function() {
			titleText( "TheT(ourist)" , .08 , 1 - context.stepTime / this.time , 1 , 1 , 1 );
		}
	} , {
		rows: 12 ,
		rm: 'fractals' ,
		setGlobals: neutral ,
		lights : [ fractLight ],
		updateText: function() {
			titleText( "presents" , .08 , 1 - context.stepTime / this.time , 1 , 1 , 1 );
		}
	} , {
		rows: 20 ,
		rm: 'squares' ,
		setGlobals: function(ctx) {
			squaresCam(ctx);
			ctx.toNearPlane = 2.5;
			ctx.misc[2] = 1 - ctx.stepTime / this.time;
		} ,
		lights : [ lightFunc(1,30) ],
		updateText: function() {
			titleText( "Sine City" , .04 , context.stepTime / this.time , 1 , 1 , 1 );
		}
	} , {
		rows: 52 ,
		rm: 'squares' ,
		setGlobals: function(ctx) {
			squaresCam(ctx);
			ctx.misc[2] = 0;
		} ,
		lights : [ lightFunc(1,30) ],
		updateText: function() {
			titleText( "Sine City" , .04 , 1 , 1 , 1 , 1 );
		}
	} , {
		rows: 12 ,
		rm: 'squares' ,
		setGlobals: function(ctx){
			squaresCam(ctx);
			var z = context.stepTime / this.time;
			ctx.misc[3] = 1;
			ctx.misc[2] = Math.max(0,1-z*2);
		} ,
		lights : [ lightFunc(1,30) ],
		updateText: function() {
			var z = context.stepTime / this.time;
			titleText( "Sine City" , .04 , 1 , 1 - z , 1 - z * .5 , 1 - z );
		}
	} , {
		rows: 12 ,
		rm: 'squares' ,
		setGlobals: function(ctx) {
			squaresCam(ctx);
			var z = context.stepTime / this.time;
			ctx.misc[4] = ( 1 - z ) * .7 + Math.random() * .025 - .0125;
			ctx.misc[1] = 1 - .5 * z;
		} ,
		lights : [ lightFunc(1,30) ],
		updateText: function() {
			titleText( "Sine City" , .04 , 1 , 0 , .5 , 0 );
		}
	} , {
		rows: 9 ,
		rm: 'squares' ,
		setGlobals: function(ctx) {
			squaresCam2(ctx,29);
			var z = context.stepTime / this.time;
			ctx.misc[2] = Math.max(0,1-z*1.5);
			ctx.misc[4] += ( z - 1 ) * .3;
			ctx.misc[1] = .5 - .5 * z;
		} ,
		lights : [ lightFunc(1,30) ],
		updateText: function() {
			titleText( "Sine City" , .04 , 1 - context.stepTime / this.time , 0 , .5 , 0 );
		}
	} , {
		rows: 69 ,
		rm: 'squares' ,
		setGlobals: function(ctx) {
			squaresCam2(ctx,29);
			ctx.misc[1] = 0;
		} ,
		lights : [ lightFunc(1,30) ],
		updateText: null
	} , {
		rows: 11 ,
		rm: 'squares' ,
		setGlobals: function(ctx) {
			squaresCam2(ctx,29);
			ctx.misc[3] = .2;
			ctx.misc[2] = context.stepTime / this.time;
		} ,
		lights : [ lightFunc(1,30) ],
		updateText: null
	} , {
		rows: 11 ,
		rm: 'tunnel' ,
		setGlobals: function(ctx) {
			ctx.tunMul = 1;
			tunnelCam(ctx);
			ctx.misc[2] = 1 - context.stepTime / this.time;
		} ,
		lights : [ tunnelLight ],
		updateText: null
	} , {
		rows: 17 ,
		rm: 'tunnel' ,
		setGlobals: function(ctx) {
			tunnelCam(ctx);
			ctx.misc[2] = 0;
			ctx.misc[4] = (1.2 - 1.2 * context.stepTime / this.time) * (.98 + .04*Math.random());
		} ,
		lights : [ tunnelLight ],
		updateText: null
	} , {
		rows: 18 ,
		rm: 'tunnel' ,
		setGlobals: function(ctx) {
			tunnelCam(ctx);
			ctx.misc[4] = 0;
			ctx.misc[8] = context.stepTime / this.time;
		} ,
		lights : [ tunnelLight ],
		updateText: greetingsText
	} , {
		rows: 36 ,
		rm: 'tunnel' ,
		setGlobals: function(ctx) {
			tunnelCam(ctx);
			ctx.misc[2] = 1 - Math.min(4*context.stepTime / this.time,1);
			ctx.misc[8] = 1;
		} ,
		lights : tunLights = [ tunnelLight , tunnelLightBall ],
		updateText: greetingsText
	} , {
		rows: 33 ,
		rm: 'tunnel' ,
		setGlobals: function(ctx) {
			tunnelCam(ctx);
			ctx.misc[2] = context.stepTime / this.time;
			ctx.misc[3] = .7;
			ctx.misc[4] = -((4*ctx.misc[2])%1)*(.95+Math.random()*.1);
		} ,
		lights : tunLights ,
		updateText: greetingsText
	} , {
		rows: 9 ,
		rm: 'fractals' ,
		setGlobals: function(ctx) {
			fract2CamCommon(ctx,0);
			ctx.misc[2] = context.stepTime / this.time;
			ctx.misc[3] = 1;
		} ,
		lights : [ fractLight ],
		updateText: greetingsText
	} , {
		rows: 20 ,
		rm: 'fractals' ,
		setGlobals: function(ctx) {
			fract2CamCommon(ctx,context.stepTime / this.time);
			ctx.misc[2] = 0;
		} ,
		lights : [ fractLight ],
		updateText: greetingsText
	} , {
		rows: 31 ,
		rm: 'fractals' ,
		setGlobals: function(ctx) {
			fract2CamCommon(ctx,1);
			ctx.misc[2] = Math.min(0,1-5*context.stepTime / this.time);
		} ,
		lights : [ fractLight ],
		updateText: greetingsText
	} , {
		rows: 5 ,
		rm: 'fractals' ,
		setGlobals: function(ctx) {
			fract2CamCommon(ctx,1);
			ctx.misc[2] = 1-context.stepTime / this.time;
		} ,
		lights : [ fractLight ],
		updateText: greetingsText
	} , {
		rows: 18 ,
		rm: 'fractals' ,
		setGlobals: function(ctx) {
			fract2CamCommon(ctx,1);
			ctx.misc[2] = Math.min(0,1-5*context.stepTime / this.time);
			ctx.misc[4] = Math.max(0,1.6*context.stepTime / this.time - .8 )*(.95+Math.random()*.1);
		} ,
		lights : [ fractLight ],
		updateText: greetingsText
	} , {
		rows: 12 ,
		rm: 'fractals' ,
		setGlobals: function(ctx) {
			fract2CamCommon(ctx,1);
			ctx.misc[3] = .1;
			ctx.misc[2] = context.stepTime / this.time;
			ctx.misc[4] = .8*(1-ctx.misc[2])*(.9+Math.random()*.2);
		} ,
		lights : [ fractLight ],
		updateText: greetingsText
	} , {
		rows: 22 ,
		rm: 'balls' ,
		setGlobals: function(ctx) {
			balls2CamCommon(ctx);
			ctx.misc[2] = 1-context.stepTime / this.time;
			ctx.misc[4] = 0;
		} ,
		lights : ballsLights = [ lightFunc(.6,30) , balls2LightFunc(1),balls2LightFunc(-1) ],
		updateText: greetingsText
	} , {
		rows: 59 ,
		rm: 'balls' ,
		setGlobals: function(ctx) {
			balls2CamCommon(ctx);
			ctx.misc[3] = .8;
			ctx.misc[2] = Math.max(0,1-(12*context.stepTime / this.time)%4);
		} ,
		lights : ballsLights,
		updateText: greetingsText
	} , {
		rows: 8 ,
		rm: 'balls' ,
		setGlobals: function(ctx) {
			balls2CamCommon(ctx);
			ctx.misc[3] = .1;
			ctx.misc[2] = context.stepTime / this.time;
			ctx.misc[4] = .1-Math.random()*.2;
		} ,
		lights : ballsLights,
		updateText: null
	} , {
		rows: 7 ,
		rm: 'tunnel' ,
		setGlobals: function(ctx) {
			ctx.tunMul = 2;
			tunnelCam(ctx);
			ctx.misc[2] = 1-context.stepTime / this.time;
			ctx.misc[4] = .1-Math.random()*.2;
		} ,
		lights : tunLights ,
		updateText: null
	} , {
		rows: 22 ,
		rm: 'tunnel' ,
		setGlobals: function(ctx) {
			tunnelCam(ctx);
			ctx.misc[4] = .1-Math.random()*.2;
		} ,
		lights : tunLights ,
		updateText: null
	} , {
		rows: 10 ,
		rm: 'tunnel' ,
		setGlobals: function(ctx) {
			tunnelCam(ctx);
			ctx.misc[4] = context.stepTime*4+.1-Math.random()*.2;
			ctx.misc[3] = 1;
			ctx.misc[2] = context.stepTime / this.time;
		} ,
		lights : tunLights ,
		updateText: null
	} , {
		rows: 10 ,
		rm: 'squares' ,
		setGlobals: function(ctx) {
			squaresCam2(ctx,49);
			ctx.misc[4] = (demoTime-direction[48].startTime)*4+.1-Math.random()*.2;
			ctx.misc[2] = 1-context.stepTime / this.time;
		} ,
		lights : [ lightFunc(1,30) ] ,
		updateText: null
	} , {
		rows: 40 ,
		rm: 'squares' ,
		setGlobals: function(ctx) {
			squaresCam2(ctx,49);
			ctx.misc[4] = -(demoTime-direction[48].startTime)*6;
		} ,
		lights : [ lightFunc(1,30) ] ,
		updateText: null
	} , {
		rows: 40 ,
		rm: 'squares' ,
		setGlobals: function(ctx) {
			squaresCam2(ctx,49);
			ctx.misc[4] = (demoTime-direction[48].startTime)*8;
			ctx.misc[3] = 0;
			ctx.misc[2] = context.stepTime / this.time;
		} ,
		lights : [ lightFunc(1,30) ] ,
		updateText: null
	} , {
		rows: 68 ,
		rm: 'squares' ,
		setGlobals: function(ctx) {
			squaresCam2(ctx,49);
			ctx.misc[2] = 1
		} ,
		lights : [ lightFunc(1,30) ] ,
		updateText: null
	}
];
var t = 0;
var BPM = 120;
for ( var i in direction ) {
	direction[ i ].startTime = t;
	t += ( direction[i].time = direction[ i ].rows * 60 / ( BPM * 4 ) );
	direction[ i ].endTime = t;
}
rows = t * BPM * 4 / 60;
t = 0;

function createRaymarcherCode( def , nLights ) {
	var w = 'uniform ';
	var code = shaderHeader
		+ [ w+'mat3 u0;' ,
		    w+'sampler2D u1;' ,
		    w+'!3 u2,u3;' ,
		    w+'float u4[10];'
		  ].join('\n');
	var u = 5;
	for ( var i in def.lights ) {
		code += w+'!3 u' + u++ + ', u' + u++ + ';'+w+'float u' + u++ + ';';
	}
	code += [
		"const !2 c=!2(1.,-1.)*"+def.normalDelta+";" ,
		"float p,z,w,u,o,zy,q,x,a,zz;" ,
		"!2 e,h;" ,
		"!3 l=!3(zx,1.),m,r,s=u2,yx=!3(1.),n=!3(.0),b,v,xxx,xy,d,xx,xz,y;" ,
		"!4 f;" ,

		"float g(float x)" ,
		"{" ,
			"return fract(sin(x)*43758.5453);" ,
		"}" ,

		"float yy(!3 x)" ,
		"{" ,
			"m=floor(x),y=fract(x)," ,
			"y*=y*(3.-2.*y)," ,
			"z=m.x+m.y*57.+m.z*113.;" ,
			"return mix(mix(mix(g(z),g(z+1.),y.x)," ,
					"mix(g(z+57.),g(z+58.),y.x),y.y)," ,
				"mix(mix(g(z+113.),g(z+114.),y.x)," ,
					"mix(g(z+170.),g(z+171.),y.x),y.y),y.z);" ,
		"}" ,

		"float yyx(!2 x,float a)" ,
		"{" ,
			"e=pow(abs(x),!2(a));" ,
			"return pow(e.x+e.y,1./a);" ,
		"}" ,

		"mat2 t(float x)" ,
		"{" ,
			"e=!2(cos(x),sin(x));" ,
			"return mat2(-e.x,e.y,e.y,e.x);" ,
		"}" ,

		"float yz(!3 x)" ,
		"{" ,
			"return length(mod(x.xy,!2(15.))-!2(7.5))-.5+.05*sin(x.z*9.42477);" ,
		"}" ,

		"!2 k(!3 x,float a) {"
	].join("\n");
	code += def.map + '}';
	code += [
			"void main()" ,
			"{" ,
				"l.y+=mod(u4[4],1.)*2.2;" ,
				"if(l.y>1.){" ,
					"if(l.y < 1.2)discard;" ,
					"l.y-=2.2;" ,
				"}" ,
				"l.x*=1.6," ,
				"r=normalize(l*u0);" ,

				"for(int j=0;j<2;j++){" ,
					"v=r,xxx=s,xy=!3(.0)," ,
					"x=.0,a=" + def.epsilon + ';' ,
					"for(int i=0;i<" + def.depth + ";i++){" ,
						"h=k(s+r*x,x);" ,
						"if(h.x< a||i>" + def.depth + "/(j+1)||x>" + def.maxDistance + ".)break;" ,
						"x+=h.x*" + def.step + ",a*=" + shaderFloat( def.epsilonMultiplier ) + ";" ,
					"}" ,
					"h.x=x;",

					"if(x<"+ def.maxDistance+ ".){" ,
						"d=s+r*x," ,
						"f=!4(" ,
							"k(d+c.xyy,x).x," ,
							"k(d+c.yyx,x).x," ,
							"k(d+c.yxy,x).x," ,
							"k(d+c.xxx,x).x" ,
						")," ,
						"xx=normalize(f.x*c.xyy+f.y*c.yyx+f.z*c.yxy+f.w*c.xxx)," ,
						"a=.0," ,
						"p=" + def.aoWeight + ";" ,
						"for(int i=1;i<="+def.aoSteps+";i++)" ,
							"x=(float(i)/"+def.aoSteps+".)*"+ shaderFloat( def.aoDelta ) + "," ,
							"m=d+xx*x," ,
							"a+=p*(x-k(m,distance(m,s)).x)," ,
							"p*=.5;" ,
						"q=max(.1,1.-clamp(pow(a,1.),.0,1.));" ,
		].join('\n');

	for ( var i in def.materials ) {
		if ( i > 0 ) {
			code += 'else ';
		}
		var m = materials[ def.materials[i] ];
		code += 'if(h.y==' + i + '.)'
			+ 'xz=';
		if ( m.noiseScale ) {
			code += 'mix(!3(' + shaderVec( m.albedo ) + '),!3('
				+ shaderVec( m.noise ) + '),yy(d*'
				+ shaderFloat( def.noiseScale * m.noiseScale ) + '))';
		} else {
			code += '!3(' + shaderVec( m.albedo ) + ')';
		}
		code += ',w=' + shaderFloat( m.metallic ) + ',u=' + m.smoothness + ',o=' + m.r0 + ';';
	}

	code += [
						"v=reflect(r,xx)," ,
						"z="+def.fogDensity+"*h.x," ,
						"z=clamp(exp(-z*z*z*1.442695),.0,1.)," ,
						"x=clamp((1.+dot(normalize(v+r),r)),.0,1.),a=x*x," ,
						"zz=o+(1.-o)*x*a*a*(u*.9+.1)," ,
						"y=mix(!3(1.),xz/dot(!3(.299,.587,.114),xz),w)," ,
						"m=!3(.0)," ,
						"zy=exp2(4.+6.*u)," ,
		].join('\n');

	u = 5;
	for ( var l in def.lights ) {
		var b = def.lights[l];
		code += [
			"p=length(b=u" + u + "-d)," ,
			"b/=p," ,
			"p=max(1.,p-u" + (u+2) + ")*" + b.attenuation + "," ,
			"p=1./max(1.,p*p)," ,
			"m+=mix((1.-w)*xz*q,y*pow(max(dot(reflect(r,xx),b),.0),zy)*(zy+2.)/8.,zz)*p*max(dot(b,xx),.0)*u" + (u+1) + ","
		].join('\n');
		u+=3;
	}
	code += [
						"xy=yx*z*normalize(y)*o*(u*.9+.1)*zz," ,
						"m=mix(!3(" + shaderFloat(def.fog) + "),m,z)," ,
						"xxx+=normalize(v)*" + def.reflectionDistance + ";" ,
					"}else" ,
						"m=!3(" + shaderFloat(def.fog) + ');'
	].join('\n');

	u=5;
	for ( var l in def.lights ) {
		var b = def.lights[l];
		var h = b.vRadius;
		if ( h ) {
			code += [
					"b=s-u" + u + "," ,
					"p=dot(r,r),a=2.*dot(b,r)," ,
					"x=a*a-4.*p*(dot(b,b)-" + (h*h) + ")," ,
					"e=x<.0?!2(-1.):(x=sqrt(x),-.5*!2(a+x,a-x)/p)," ,
					"e=!2(min(e.x,e.y),max(e.x,e.y));" ,
					"if(e.x>.0&&e.y<h.x)" ,
						"m+=u" + (u+2) + "*u" + (u+1) + "*pow((e.y-e.x)/" + shaderFloat(h*2) + ",64.);"
			].join( "\n" );
		}
		u+=3;
	}

	code += [
					"n+=m*yx;" ,
					"if(all(lessThan(xy,!3(.01))))break;" ,
					"yx=xy," ,
					"s=xxx," ,
					"r=normalize(v);" ,
				"}" ,

				"h=!2(zx.x,l.y)*.5+.5," ,
				"h.y=(1.-h.y-u4[5])/u4[7]," ,
				"f=texture2D(u1,h)," ,
				"n=max(!3(.0),mix(mix(mix(n,(n.x==n.y&&n.x==n.z)?n:!3(dot(n,!3(.299,.587,.114))),u4[1]),!3(u4[3]),smoothstep(.05,.95,u4[2])),f.rgb*u3,f.a*u4[6])-!3(.004)),",

				"x=(l.x+1.)*(l.y+1.)*(u4[0]*10.),",
				"gl_FragColor=!4((1.-(smoothstep(.98,1.,yy(l*8.+u4[0]*20.))+smoothstep(.95,1.,yy(l*1.5+u4[0]*10.))))*smoothstep(1.042+.008*cos(u4[0]*40.),.8,yyx(zx,8.))*(1.-(mod((mod(x,13.)+1.)*(mod(x,47.)+1.),.01))*8.)*((.95+.05*cos(u4[0]*41.))*(n*(6.2*n+.5))/(n*(6.2*n+!3(1.7))+!3(.06))+!3(smoothstep(.98,1.,yy(l*8.-u4[0]*40.)))),1.);",
			"}" ,
	].join('\n');
	return [ code , 5+def.lights.length*3 ];
}

function buildRaymarchers( )
{
	var ml = 1;
	var sn = 1;
	for ( var n in raymarchers ) {
		var rm = raymarchers[n];
		var nl = rm.lights.length;
		ml=nl>ml?nl:ml;
		for ( var i=1;i<=nl;i++) {
			var sd = createRaymarcherCode(rm,i);
			shaders[sn] = [glCtx.FRAGMENT_SHADER,sd[0]];
			programs[n + '_' + i] = [ sd[1] , 0 , sn++ ];
		}
	}
	var context = {
		camPos: vomNew(3),
		lookAt: vomNew(3),
		up: vomNew(3),
		toNearPlane: 0 ,
		misc: vomNew(10) ,
		textColour: vomNew(3) ,
		lights: []
	};
	for ( var i = 0;i<ml;i++ ) {
		context.lights.push({
			pos: vomNew(3),
			colour: vomNew(3) ,
			distance: 0
		});
	}
	return context;
}

var cmU=vomNew(3),
    cmV=vomNew(3),
    cmW=vomNew(3),
    cd=vomNew(3),
    cu=vomNew(3),
    cm=vomNew(9);
function prepareRaymarcher( ds )
{
	var rm = raymarchers[ds.rm], ctx = context;
	ds.setGlobals( ctx );
	vecNorm(cmW,vecSub(cmW,ctx.lookAt,ctx.camPos));
	vecNorm(cmU,vecCross(cmU,ctx.up,cmW));
	vecNorm(cmV,vecCross(cmV,cmW,cmU));
	vecScale(cmW,cmW,ctx.toNearPlane);
	vecs2Mat3(cm,cmU,cmV,cmW);

	var active = [];
	for ( var i in ds.lights ) {
		if ( ds.lights[i] && ds.lights[ i ](ctx,ctx.lights[ i ]) ) {
			active.push( ctx.lights[ i ] );
		}
	}

	var p = programs[ds.rm + '_' + active.length ];
	glCtx.useProgram( p[ 0 ] );
	glCtx.enableVertexAttribArray( 0 );
	glCtx.vertexAttribPointer( 0 , 2 , glCtx.FLOAT , false , 8 , 0 );
	p = p[1];

	var u = 0;
	glCtx.uniformMatrix3fv( p[u++] , false , cm );
	glCtx.uniform1i( p[u++] , 0 );
	glCtx.uniform3fv( p[u++] , ctx.camPos );
	glCtx.uniform3fv( p[u++] , ctx.textColour );
	glCtx.uniform1fv( p[u++] , ctx.misc );
	for ( var i in active ) {
		glCtx.uniform3fv( p[u++] , active[ i ].pos );
		glCtx.uniform3fv( p[u++] , active[ i ].colour );
		glCtx.uniform1f( p[u++] , active[ i ].distance );
	}
	glCtx.drawArrays( 4 , 0 , 3 );
}


// Main

function resize() {
	var vw=window.innerWidth,vh=window.innerHeight;
	var cw=Math.floor(vh*1.6),ch=Math.floor(vw*.625);
	if(cw>vw){
		C1.width=canvasWidth=vw;
		C1.height=canvasHeight=ch;
	}else{
		C1.width=canvasWidth=cw;
		C1.height=canvasHeight=vh;
	}
	C2.style.width=C2.width=canvasWidth;
	c2height=C2.style.height=C2.height=Math.max(canvasHeight/8,100);
	c2rHeight=c2height/canvasHeight;
	twoDCtx.shadowColor = "#ccc";
	twoDCtx.font = "normal small-caps bold " + Math.floor(c2height/2) + "px monospace";
	twoDCtx.fillStyle = "#111";
	twoDCtx.strokeStyle = "#ddd";
	C1.style.left=Math.floor((vw-canvasWidth)*.5);
	C1.style.top=Math.floor((vh-canvasHeight)*.5);
	glCtx.viewport(0,0,canvasWidth,canvasHeight);
}

// FIXME: re-enable! document.body.style.cursor = 'none';
document.body.style.background = 'black';
document.body.innerHTML = '<canvas id=C1 style=position:fixed></canvas><canvas id=C2 style=display:none>';
glCtx=C1.getContext('webgl');
twoDCtx = C2.getContext('2d');
(window.onresize=resize)();
var shaders = [
	[ glCtx.VERTEX_SHADER , shaderHeader + "attribute !2 i;void main(){gl_Position=!4(i,.0,1.),zx=i;}"
	]
];
var programs = {};
var context = buildRaymarchers( );
for ( var i in shaders ) {
	var def = shaders[i];
	glCtx.shaderSource( i= shaders[i] = glCtx.createShader( def[0] ) , def[1].replace(/!/g,'vec') );
	glCtx.compileShader( i );
	if (!glCtx.getShaderParameter(i, glCtx.COMPILE_STATUS)) {
		def[1] = def[1].split( /\n/ );
		for ( var k in def[1] ) {
			var j = parseInt(k)+1;
			def[1][k] = j + ": " + def[1][k];
		}
		throw "SHADER ERROR\n" + glCtx.getShaderInfoLog(i) + "\n" + def[1].join('\n');
	}
}
for ( var name in programs ) {
	var p = glCtx.createProgram( );
	var d = programs[name];
	var ul = d.shift();
	while( d.length ) {
		glCtx.attachShader( p , shaders[ d.shift() ] );
	}
	glCtx.linkProgram( p );
	var nul = [];
	while ( ul-- ) {
		nul[ul] = glCtx.getUniformLocation( p , 'u' + ul );
	}
	programs[name] = [p,nul];
}
vtxBuffer = glCtx.createBuffer( );
glCtx.bindBuffer( glCtx.ARRAY_BUFFER , glCtx.createBuffer( ) );
glCtx.bufferData( glCtx.ARRAY_BUFFER , vomNew([1,4,1,-1,-4,-1]) , glCtx.STATIC_DRAW );
glCtx.clearColor(0,0,0,1);

textTexture = glCtx.createTexture( );
glCtx.bindTexture( glCtx.TEXTURE_2D , textTexture );
glCtx.texParameteri( glCtx.TEXTURE_2D , glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE );
glCtx.texParameteri( glCtx.TEXTURE_2D , glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE );
glCtx.texParameteri( glCtx.TEXTURE_2D , glCtx.TEXTURE_MIN_FILTER, glCtx.NEAREST );
glCtx.texParameteri( glCtx.TEXTURE_2D , glCtx.TEXTURE_MAG_FILTER, glCtx.NEAREST );
glCtx.texImage2D( glCtx.TEXTURE_2D , 0 , glCtx.RGBA , glCtx.RGBA , glCtx.UNSIGNED_BYTE , C2 );

timeStart = previousFrame = 0;
FRAME_TIME = 100/3;

paused = 0;
document.body.onkeypress = function(e) {
	if ( e.keyCode == 32 ) {
		var now = Date.now();
		if ( paused ) {
			timeStart += now - paused;
			paused = 0;
			requestAnimationFrame(draw);
			A.play( );
		} else {
			paused = now;
			A.pause( );
		}
	}
};

var demoTime;
mainfunc = function(){
requestAnimationFrame(draw=function(time){
	if ( ! paused ) {
		requestAnimationFrame(draw);
	}
	if ( timeStart == 0 ) {
		A.play( );
		timeStart = time;
		previousFrame = timeStart - FRAME_TIME;
	}
	var delta = time - previousFrame;
	demoTime = .001*(time - timeStart);
	if ( delta < FRAME_TIME ) {
		return;
	}
	previousFrame = time - ( delta % FRAME_TIME );

	var ds = direction[t];
	while ( ds && ds.endTime < demoTime ) {
		ds=direction[++t];
	}
	if ( ! ds ) {
		A.pause( );
		return;
	}
	context.misc[0] = demoTime;
	context.misc[7] = c2rHeight;
	context.stepTime = demoTime - ds.startTime;
	if ( ds.updateText ) {
		twoDCtx.clearRect( 0 , 0 , canvasWidth , 100 );
		ds.updateText();
		glCtx.texImage2D( glCtx.TEXTURE_2D , 0 , glCtx.RGBA , glCtx.RGBA , glCtx.UNSIGNED_BYTE , C2 );
	}
	prepareRaymarcher( ds );
})
}

if ( USE_SYNTH ) {
	synth = new CPlayer();
	synth.init(song);
	synthGen = setInterval(function(){
		if ( synth.generate() == 1 ) {
			clearInterval(synthGen);
			var s = '' , a = synth.createWave();
			for(var i=0;i<a.length;i++)
				s+= String.fromCharCode(a[i]);
			A = document.createElement("audio");
			A.src= 'data:audio/wav;base64,' + btoa(s);
			A.oncanplaythrough=mainfunc;
		}

	}, 0);
} else {
	A = document.createElement("audio");
	A.oncanplaythrough=mainfunc;
	A.src= 'music.ogg';
}
