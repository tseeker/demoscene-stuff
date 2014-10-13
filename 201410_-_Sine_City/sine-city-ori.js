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

var luma = [.299 , .587 , .114];


// Shaders
var shaderBits = {
	precision: 'precision highp float;' ,
	inPosition: 'attribute vec2 inPosition;' ,
	voTexCoords: 'varying vec2 voTexCoords;' ,
	raymarchVSMain: [
		"void main( )" ,
		"{" ,
			"gl_Position = vec4( inPosition , 0. , 1. );" ,
			"voTexCoords = inPosition;" ,
		"}"
	].join('') ,
	rmUtils: [
		"const vec3 LUMA = vec3( " , shaderVec(luma) , " );" ,

		"struct Material" ,
		"{" ,
			"vec3 albedo;" ,
			"float metallic;" ,
			"float smoothness;" ,
			"float r0;" ,
		"};" ,

		"float hash( float n )" ,
		"{" ,
			"return fract(sin(n)*43758.5453);" ,
		"}" ,

		"float noise( vec3 x )" ,
		"{" ,
			"vec3 p = floor(x);" ,
			"vec3 f = fract(x);" ,

			"f = f*f*(3.0-2.0*f);" ,
			"float n = p.x + p.y*57.0 + 113.0*p.z;" ,
			"return mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x)," ,
					"mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y)," ,
				"   mix(mix( hash(n+113.0), hash(n+114.0),f.x)," ,
					"mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);" ,
		"}" ,

		"float atan2( in float y , in float x )" ,
		"{" ,
			"return ( x == 0.0" ,
				"? ( y > 0.0 ? ( 3.14159 * .5 ) : ( -3.14159 * .5 ) )" ,
				": atan( y , x ) );",
		"}" ,

		"vec2 solve(float a, float b, float c)" ,
		"{" ,
			"float d = b * b - 4. * a * c;" ,
			"if ( d < 0. ) {" ,
				"return vec2(-1.);" ,
			"}" ,
			"d=sqrt(d);" ,
			"vec2 s = -.5*vec2(b+d,b-d)/a;" ,
			"return vec2(min(s.x,s.y),max(s.x,s.y));" ,
		"}" ,

		"float lx( vec2 v , float x )" ,
		"{" ,
			"vec2 s = pow(abs(v),vec2(x));" ,
			"return pow( s.x + s.y , 1. / x );" ,
		"}" ,

		"mat2 rot( float angle )" ,
		"{" ,
			"vec2 cs = vec2( cos(angle),sin(angle));" ,
			"return mat2( -cs.x,cs.y,cs.y,cs.x );" ,
		"}" ,

		"float schlick( vec3 hv , vec3 cd , float r0, float smooth )" ,
		"{" ,
			"float d = clamp((1. - dot( hv, -cd )), 0., 1.) , d2 = d * d;" ,
			"return r0 + (1. - r0) * d * d2 * d2 * smooth;" ,
		"}" ,

		"float getSpecular(vec3 i, vec3 l, vec3 n, float smooth)" ,
		"{          " ,
			"float rDotL = max(dot(reflect(i, n), l), 0.0);" ,
			"float sp = exp2(4.0 + 6.0 * smooth);" ,
			"float si = (sp + 2.0) * 0.125;" ,
			"return pow(rDotL, sp) * si;" ,
		"}" ,

	].join('\n'),
	beadCyl: [
		"float beadCyl( vec3 p )" ,
		"{" ,
			"vec2 q = mod( p.xy , vec2(15.) ) - vec2(7.5);" ,
			"return length(q) - .5 + .05 * sin(p.z*9.42477);" ,
		"}"
	].join('\n'),
};

var shaders = {
	raymarchVS: [ 'v' ,
		'inPosition' , 'voTexCoords' , 'raymarchVSMain' ] ,
};
var programs = {
};

function shaderFloat( v ) {
	return '' + v + ( v == Math.floor(v) ? '.' : '' );
}
function shaderVec( v ) {
	return v.map(shaderFloat).join(',');
}

function compileShader( def ) {
	var type = def[0] == 'f' ? glCtx.FRAGMENT_SHADER : glCtx.VERTEX_SHADER;
	var src = '';
	for ( var i = 1 ; i < def.length ; i ++ ) {
		src += shaderBits[ def[ i ] ];
	}

	var shader = glCtx.createShader( type );
	glCtx.shaderSource( shader , src );
	glCtx.compileShader( shader );
	if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
		src = src.split( /\n/ );
		for ( var i in src ) {
			var j = parseInt(i)+1;
			src[i] = j + ": " + src[i];
		}
		throw "SHADER ERROR\n" + glCtx.getShaderInfoLog(shader) + "\n" + src.join('\n');
	}


	return shader;
}

function compileShaders( ) {
	for ( var name in shaders ) {
		shaders[name] = compileShader( shaders[name] );
	}
}

function buildProgram( name ) {
	var p = glCtx.createProgram( );
	var d = programs[name];
	var ul = d.shift();
	while( d.length ) {
		glCtx.attachShader( p , shaders[ d.shift() ] );
	}
	glCtx.bindAttribLocation( p , 0 , "inPosition" );
	glCtx.linkProgram( p );
	var nul = {};
	while ( ul.length ) {
		d = ul.shift();
		nul[d] = glCtx.getUniformLocation( p , 'u' + d );
	}
	programs[name] = [p,nul];
}

function buildPrograms( ) {
	compileShaders( );
	for ( var name in programs ) {
		buildProgram(name);
	}
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
		extraUniforms: {BallOffset:'float'} ,
		extraBits: [] ,

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

		setCamera: function( ctx ) {
			var z = ctx.time*30;
			vecSet(ctx.camPos,0,0,z);
			z += 5;
			vecSet(ctx.lookAt,-Math.sin(z*.05),-.7*Math.cos(z*.033),z);
			vecSet(ctx.up,0,1,0);
			ctx.toNearPlane = 2;
		} ,
		map: [
			"vec3 q = p + .1 * ( sin(p.zxy*.17+uTime*.5)+sin(p.yzx*.7+uTime*1.5) )*8.5*(1. + cos(sin(p.z * .1 ) + p.z * .3 ));" ,
			"float b = 14. - length( q.xy )," ,
			"ap = atan2(p.y,p.x),c,m,n=8.35-uBallOffset*1.35;" ,
			"q = vec3( 9.*(mod(ap+p.z*.02,.628)-.314) , length(p.xy)-9. , mod(p.z,12.56)-6.28);" ,
			"c = length(q.xy)-.25+.1*cos(p.z*8.+uTime*.1);" ,
			"c = min(c,length(q.yz)-.5);",
			"q = vec3(n*(mod(ap+p.z*.02,1.256636)-.628318),q.y+9.-n,mod(p.z,62.8318)-31.4159);" ,
			"m = step(c,b)+1.;" ,
			"b=min(c,b);" ,
			"c=length(q) - 1.3;" ,
			"if(c<b){b=c;m=3.;}" ,
			"q.y+=n-9.;" ,
			"c = lx(q.yz,8.)-2.;" ,
			"if(c<b){b=c;m=0.;}" ,
			"return vec2(b,m);"
		].join('\n') ,
		lights: [
			{
				attenuation: .25 ,
				vRadius: 0 ,
				update: function(ctx,lctx) {
					vecSet(lctx.pos , 0 , -.5 , ctx.time*30-.5);
					vecSet(lctx.colour,3,3,3);
					lctx.distance = 30;
					return true;
				}
			} , {
				attenuation: .5 ,
				vRadius: .5 ,
				update: function(ctx,lctx) {
					vecSet(lctx.pos , 4*Math.sin(ctx.time*.5)*Math.cos(ctx.time*.7) ,
							3*Math.cos(ctx.time*1.5),
							ctx.time*30+14+16*Math.sin(ctx.time*3.3)*Math.cos(ctx.time*.77)
					);
					vecSet(lctx.colour,1,1,1);
					lctx.distance = 15;
					return true;
				}
			}
		] ,
	} ,
	fractals: {
		extraUniforms: {BallSize:'float',TimeEffect:'float'} ,
		extraBits: [] ,

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
		aoWeight: 5 ,

		materials: [0,2,5] ,

		setCamera: function( ctx ) {
			var z = ctx.time*30;
			vecSet(ctx.camPos,5*Math.sin(ctx.time*.1),10*Math.cos(ctx.time*.2),7.5);
			vecSet(ctx.lookAt,0,0,ctx.camPos[2]-2);
			vecSet(ctx.up,0,0,1);
			ctx.toNearPlane = 3;
		} ,
		map: [
			"const vec3 CSize=vec3(.58,.9,1.1);" ,
			"float scale=1.,k,m;" ,
			"vec3 fp=p;" ,
			"for(int i=0;i<7;i++){" ,
				"p=2.*clamp(p,-CSize,CSize)-p;" ,
				"k=max((1.3+uTimeEffect*.1*cos(uTime*.5))/dot(p,p),1.);" ,
				"p*=k;" ,
				"scale*=k;" ,
			"}" ,
			"k=length(p.xy);" ,
			"vec2 ds=vec2(k-3.,-k*p.z/length(p)-2.*log(1.+.01*d))/abs(scale);" ,
			"k=max(ds.x,ds.y);" ,
			"m=step(ds.y,ds.x);" ,
			// FIXME!
			"vec3 ctr=uCamPos-vec3(.1,.3,-.4)*uCamMat;" ,
			"fp-=ctr;fp+=.25*sin(p*1.);" ,
			"ds.x = length(fp)-.1*uBallSize;" ,
			"if (ds.x < k ) { k = ds.x ; m = 2.; }" ,
			"return vec2(k,m);"
		].join('\n') ,
		lights: [
			{
				attenuation: .05 ,
				update: function(ctx,lctx) {
					vecCopy(lctx.pos,ctx.camPos);
					lctx.pos[2]+=2;
					vecSet(lctx.colour,1,1,1);
					lctx.distance = 3;
					return true;
				}
			}
		] ,
	} ,
	squares: {
		extraUniforms: [] ,
		extraBits: ['beadCyl'] ,

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

		setCamera: function( ctx ) {
			var z = ctx.time*30;
			vecSet(ctx.camPos,Math.cos(ctx.time)*40.,0.,Math.sin(ctx.time*.5)*80.);
			vecSet(ctx.lookAt,0,0,-100);
			vecSet(ctx.up,0,1,0);
			ctx.toNearPlane = 2.5;
		} ,
		map: [
			"p.xy*=rot(d*.009 );" ,
			"vec3 q;" ,

			"float y,m,x = beadCyl( p.xzy );" ,
			"x = min( x , beadCyl( p ) );" ,
			"x = min( x , beadCyl(p.yzx ) );" ,

			"q = mod( p , vec3(15.) ) - vec3(7.5);" ,
			"y = max(length(max(abs(q) - vec3(2.5),vec3(0.))) - .25 , 3.5 - length(q) );" ,
			"m = step(y,x);" ,
			"x = min(x,y);" ,
			"y = length(q+.1*sin(q*5.5+uTime))-2.;" ,
			"if (y<x) {" ,
				"x = y;" ,
				"m=2.;" ,
			"}" ,
			"return vec2( x , m );"
		].join('\n') ,
		lights: [
			{
				attenuation: .05 ,
				update: function(ctx,lctx) {
					vecCopy(lctx.pos,ctx.camPos);
					vecSet(lctx.colour,1,1,1);
					lctx.distance = 30;
					return true;
				}
			}
		] ,
	} ,
	balls: {
		extraUniforms: {EffectTime:'float'} ,

		maxDistance: 20 ,
		epsilon: .0005 ,
		epsilonMultiplier: 1.0 ,
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

		setCamera: function( ctx ) {
			var z = ctx.time*30;
			vecSet(ctx.camPos,Math.cos(ctx.time)*12,8,Math.sin(ctx.time)*12);
			vecSet(ctx.lookAt,1,0,0);
			vecSet(ctx.up,0,1,0);
			ctx.toNearPlane = 2.5;
		} ,

		map: [
			"float t = uEffectTime;" ,
			"vec3 r = p;" ,
			"r.xz = mod(r.xz,8.)-4.;" ,
			"r.yz *= rot(t+.1*d);" ,
			"r.xy *= rot(t*.5+.2*d);" ,
			"r.y *= .9 + .1 * sin(t * 5.);" ,
			"float a = max( length(r)-3. , -min( length(r)-2.8 , " ,
				"max(mod(r.y,.8)-.4 , -mod(r.y+.4,.8)+.4)));" ,
			"float b = p.y+1.+sin(p.x*4.+t*2.)*sin(p.z+t)*.1;" ,
			"float h = clamp( .5+.5*(b-a)/1., .0, 1. );" ,
			"a = mix(b,a,h)-1.*h*(1.-h);" ,
			"r=p;" ,
			"r.xz = mod(r.xz,8.)-4.;" ,
			"r /= 1.25 + .25 * sin(t*5.);" ,
			"r.xy *= rot(t*5.);" ,
			"r.yz *= rot(t*2.5);" ,
			"b = max( length(r)-1. , .04-length(max(abs(mod(r,.5)-.25) - vec3(.15),vec3(0.))) );" ,
			"return vec2( min(a,b) , step(b,a) );"
		].join('\n') ,
		lights: [
			{
				attenuation: .02 ,
				update: function(ctx,lctx) {
					vecCopy(lctx.pos,ctx.camPos);
					vecSet(lctx.colour,.6,.6,.6);
					lctx.distance = 30;
					return true;
				}
			},{
				attenuation: .05 ,
				vRadius: .5 ,
				update: function(ctx,lctx) {
					vecSet(lctx.pos,Math.cos(ctx.time*2)*5,0,Math.sin(ctx.time*2)*5);
					vecSet(lctx.colour,1,1,1);
					lctx.distance = 4;
					return true;
				}
			} , {
				attenuation: .05 ,
				vRadius: .5 ,
				update: function(ctx,lctx) {
					vecSet(lctx.pos,-Math.cos(ctx.time*2)*5,0,-Math.sin(ctx.time*2)*5);
					vecSet(lctx.colour,1,1,1);
					lctx.distance = 4;
					return true;
				}
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
	var z = ctx.time*6;
	vecSet(ctx.camPos,-6,0,z);
	vecSet(ctx.lookAt,1,0,z);
	vecSet(ctx.up,0,1,0);
	ctx.greyMix = 1;
	ctx.extras[0] = '1f(p.BallOffset,0)';
	return ctx.stepTime / dir.time;
};
var desyncFunc = function(desync) {
	return function(ctx,tt) {
		var z = ctx.stepTime / tt;
		ctx.desync = -z * desync;
		if ( desync > 0 ) {
			ctx.desync += desync;
		}
		ctx.desync *= Math.random( ) * .25 + .75;
	};
};
var balls1CamFunc = function(lax,laz,desync) {
	var dsf = desyncFunc(desync);
	return function(ctx) {
		var z = ctx.time*3;
		vecSet(ctx.camPos,0,4,z);
		vecSet(ctx.lookAt,lax,0,z+laz);
		vecSet(ctx.up,0,0,1);
		ctx.fade = 0;
		dsf(ctx,this.time);
	};
};
var balls2CamCommon = function(ctx) {
	var z = ctx.time*5;
	vecSet(ctx.camPos,Math.cos(ctx.time)*12,8,Math.sin(ctx.time)*12+z);
	vecSet(ctx.lookAt,1,0,z);
	vecSet(ctx.up,0,1,0);
	ctx.toNearPlane = 2.5;
	z = ctx.time - direction[43].startTime;
	ctx.extras[0] = '1f(p.EffectTime,'+z+')';
};
var balls2LightFunc = function(scale) {
	return function(ctx,lctx) {
		var z = ctx.time*30;
		vecSet(lctx.pos,scale*Math.cos(ctx.time*2)*5,3,scale*Math.sin(ctx.time*2)*5+z);
		vecSet(lctx.colour,1,1,1);
		lctx.distance = 4;
		return true;
	};
};
var fract1CamCommon = function(ctx) {
	var z = ctx.time;
	vecSet(ctx.camPos,4,2.5+.025*z,6.7);
	vecSet(ctx.lookAt,0,2.5-.05*z,6.7);
	vecSet(ctx.up,0,0,1);
	ctx.extras = [ '1f(p.BallSize,0)' , '1f(p.TimeEffect,0)' ];
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
	vecSet(ctx.camPos,5*Math.sin(ctx.time*.2),9*Math.cos(ctx.time*.41),7.8);
	vecCopy(ctx.lookAt,ctx.camPos);
	ctx.lookAt[0] = Math.cos(ctx.time*.2);
	ctx.lookAt[1] = Math.sin(ctx.time*.33);
	ctx.lookAt[2] -= 2;
	vecSet(ctx.up,0,0,1);
	ctx.toNearPlane = 3;
	ctx.extras = [ '1f(p.BallSize,'+bs+')' , '1f(p.TimeEffect,1)' ];
};

var drawText = function(str,x) {
	twoDCtx.shadowBlur = c2height/5;
	twoDCtx.fillText( str , x , c2height / 2 );
	twoDCtx.shadowBlur = 0;
	twoDCtx.strokeText( str , x , c2height / 2 );
};
var titleText = function(str,shake,alpha,r,g,b) {
	drawText( str , canvasWidth/15 );
	vecSet( context.text , 1 - c2rHeight + Math.random() * shake - shake * .5 , alpha , c2rHeight );
	vecSet( context.textColour , r , g , b );
};
var greetings = "Greetings to ... Mog, Sycop, Tim & Wullon ... Adinpsz ... Alcatraz ... ASD ... Bits'n'Bites ... Brain Control ... Cocoon ... Conspiracy ... Ctrl+Alt+Test ... Fairlight ... Farbrausch ... Kewlers ... LNX ... Loonies ... Mercury ... Popsy Team ... Razor 1911 ... RGBA ... 7th Cube ... Still ... TPOLM ... TRBL ... Umlaut Design ... X-Men ... Youth Uprising ... Everyone here at DemoJS 2014!";
var greetingsText = function() {
	var t = ( context.time - direction[34].startTime ) * canvasWidth * .5;
	drawText( greetings , canvasWidth - t );
	vecSet( context.text , 1 - c2rHeight + Math.random() * .02 - .01 , 1 , c2rHeight );
	vecSet( context.textColour , 1 , 1 , 1 );
};

var squaresCam = function(ctx) {
	var t = ctx.time - direction[25].startTime;
	var z = t*10 - 80;
	vecSet(ctx.camPos,z,0,0);
	vecSet(ctx.lookAt,z+Math.cos(t*.5) * 80,Math.sin(t*.25)*40,100);
	vecSet(ctx.up,0,1,0);
};

var squaresCam2 = function(ctx,s) {
	var t = ctx.time - direction[s].startTime;
	var z = t*20 - 80;
	vecSet(ctx.camPos,0,0,z);
	vecSet(ctx.lookAt,Math.cos(t*.5) * 80,Math.sin(t*.25)*40,z+100);
	vecSet(ctx.up,Math.sin(t),Math.cos(t),0);
	ctx.desync = Math.random() * .025 - .0125;
};

var tunnelLight = function(ctx,lctx) {
	vecAdd(lctx.pos,vecNorm(lctx.pos,vecScale(lctx.pos,ctx.lookAt,-1)),ctx.camPos);
	lctx.pos[1] -= .5;
	vecSet(lctx.colour,3,3,3);
	lctx.distance = 30;
	return true;
};
var tunnelCam = function(ctx,mul) {
	var z = ctx.time*30*ctx.tunMul;
	vecSet(ctx.camPos,1.1*Math.cos(z*.1),Math.sin(z*.02),z);
	z += 5;
	vecSet(ctx.lookAt,-Math.sin(z*.05),-.7*Math.cos(z*.033),z);
	vecSet(ctx.up,0,1,0);
	ctx.toNearPlane = 2;
};
var tunnelLightBall = function(ctx,lctx) {
	vecSet(lctx.pos , 4*Math.sin(ctx.time*.5)*Math.cos(ctx.time*.7) ,
			3*Math.cos(ctx.time*1.5),
			ctx.time*30*ctx.tunMul+14+16*Math.sin(ctx.time*3.3)*Math.cos(ctx.time*.77)
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
			ctx.fade = 1 - z;
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
			ctx.fade = 0;
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
			ctx.fade = z;
		} ,
		lights: [
			lightFunc(3,20)
		] ,
		updateText: null
	} , {
		rows: 18 ,
		rm: 'balls' ,
		setGlobals: function( ctx ) {
			var z = ctx.time*3;
			vecSet(ctx.camPos,0,4,z);
			vecSet(ctx.lookAt,4,0,z);
			vecSet(ctx.up,0,0,1);
			z = ctx.stepTime / this.time;
			z *= z*z;
			ctx.fade = 1 - z;
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
			var z = ctx.time*3;
			ctx.fade = ctx.stepTime / this.time;
			vecSet(ctx.camPos,0,4+ctx.fade*2,z);
			vecSet(ctx.lookAt,2,0,z+2);
			vecSet(ctx.up,0,0,1);
			ctx.fadeColour = 1;
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
			ctx.fadeColour = 1;
			var z = ctx.stepTime / this.time;
			ctx.fade = 1 - z*z*z;
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
			ctx.desync = -( 6 * ctx.stepTime / this.time ) % 1;
			ctx.desync *= Math.random( ) * .25 + .75;
		} ,
		lights : [ fractLight ],
		updateText: null
	} , {
		rows: 22 ,
		rm: 'fractals' ,
		setGlobals: function(ctx) {
			fract1CamCommon(ctx);
			ctx.fadeColour = .4;
			ctx.fade = ctx.stepTime / this.time;
			ctx.toNearPlane = 3 - 2.5*Math.max(1,2*ctx.fade);
			ctx.desync = ( 30 * ctx.fade ) % 1;
			ctx.desync *= Math.random( ) * .15 + .85;
		} ,
		lights : [ fractLight ],
		updateText: null
	} , {
		rows: 3 ,
		rm: 'fractals' ,
		setGlobals: neutral = function(ctx) {
			fract1CamCommon(ctx);
			ctx.fadeColour = .4;
			ctx.fade = 1;
			ctx.desync = 0;
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
			ctx.fade = 1 - ctx.stepTime / this.time;
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
			ctx.fade = 0;
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
			ctx.fadeColour = 1;
			ctx.fade = Math.max(0,1-z*2);
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
			ctx.desync = ( 1 - z ) * .7 + Math.random() * .025 - .0125;
			ctx.greyMix = 1 - .5 * z;
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
			ctx.fade = Math.max(0,1-z*1.5);
			ctx.desync += ( z - 1 ) * .3;
			ctx.greyMix = .5 - .5 * z;
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
			ctx.greyMix = 0;
		} ,
		lights : [ lightFunc(1,30) ],
		updateText: null
	} , {
		rows: 11 ,
		rm: 'squares' ,
		setGlobals: function(ctx) {
			squaresCam2(ctx,29);
			ctx.fadeColour = .2;
			ctx.fade = context.stepTime / this.time;
		} ,
		lights : [ lightFunc(1,30) ],
		updateText: null
	} , {
		rows: 11 ,
		rm: 'tunnel' ,
		setGlobals: function(ctx) {
			ctx.tunMul = 1;
			tunnelCam(ctx);
			ctx.fade = 1 - context.stepTime / this.time;
		} ,
		lights : [ tunnelLight ],
		updateText: null
	} , {
		rows: 17 ,
		rm: 'tunnel' ,
		setGlobals: function(ctx) {
			tunnelCam(ctx);
			ctx.fade = 0;
			ctx.desync = (1.2 - 1.2 * context.stepTime / this.time) * (.98 + .04*Math.random());
		} ,
		lights : [ tunnelLight ],
		updateText: null
	} , {
		rows: 18 ,
		rm: 'tunnel' ,
		setGlobals: function(ctx) {
			tunnelCam(ctx);
			ctx.desync = 0;
			ctx.extras[0] = '1f(p.BallOffset,'+(context.stepTime / this.time) + ')';
		} ,
		lights : [ tunnelLight ],
		updateText: greetingsText
	} , {
		rows: 36 ,
		rm: 'tunnel' ,
		setGlobals: function(ctx) {
			tunnelCam(ctx);
			ctx.fade = 1 - Math.min(4*context.stepTime / this.time,1);
			ctx.extras[0] = '1f(p.BallOffset,1)';
		} ,
		lights : tunLights = [ tunnelLight , tunnelLightBall ],
		updateText: greetingsText
	} , {
		rows: 33 ,
		rm: 'tunnel' ,
		setGlobals: function(ctx) {
			tunnelCam(ctx);
			ctx.fadeColour = .7;
			ctx.fade = context.stepTime / this.time;
			ctx.extras[0] = '1f(p.BallOffset,1)';
			ctx.desync = -((4*ctx.fade)%1)*(.95+Math.random()*.1);
		} ,
		lights : tunLights ,
		updateText: greetingsText
	} , {
		rows: 9 ,
		rm: 'fractals' ,
		setGlobals: function(ctx) {
			fract2CamCommon(ctx,0);
			ctx.fadeColour = 1;
			ctx.fade = context.stepTime / this.time;
		} ,
		lights : [ fractLight ],
		updateText: greetingsText
	} , {
		rows: 20 ,
		rm: 'fractals' ,
		setGlobals: function(ctx) {
			fract2CamCommon(ctx,context.stepTime / this.time);
			ctx.fade = 0;
		} ,
		lights : [ fractLight ],
		updateText: greetingsText
	} , {
		rows: 31 ,
		rm: 'fractals' ,
		setGlobals: function(ctx) {
			fract2CamCommon(ctx,1);
			ctx.fade = Math.min(0,1-5*context.stepTime / this.time);
		} ,
		lights : [ fractLight ],
		updateText: greetingsText
	} , {
		rows: 5 ,
		rm: 'fractals' ,
		setGlobals: function(ctx) {
			fract2CamCommon(ctx,1);
			ctx.fade = 1-context.stepTime / this.time;
		} ,
		lights : [ fractLight ],
		updateText: greetingsText
	} , {
		rows: 18 ,
		rm: 'fractals' ,
		setGlobals: function(ctx) {
			fract2CamCommon(ctx,1);
			ctx.fade = Math.min(0,1-5*context.stepTime / this.time);
			ctx.desync = Math.max(0,1.6*context.stepTime / this.time - .8 )*(.95+Math.random()*.1);
		} ,
		lights : [ fractLight ],
		updateText: greetingsText
	} , {
		rows: 12 ,
		rm: 'fractals' ,
		setGlobals: function(ctx) {
			fract2CamCommon(ctx,1);
			ctx.fadeColour = .1;
			ctx.fade = context.stepTime / this.time;
			ctx.desync = .8*(1-ctx.fade)*(.9+Math.random()*.2);
		} ,
		lights : [ fractLight ],
		updateText: greetingsText
	} , {
		rows: 22 ,
		rm: 'balls' ,
		setGlobals: function(ctx) {
			balls2CamCommon(ctx);
			ctx.fade = 1-context.stepTime / this.time;
			ctx.desync = 0;
		} ,
		lights : ballsLights = [ lightFunc(.6,30) , balls2LightFunc(1),balls2LightFunc(-1) ],
		updateText: greetingsText
	} , {
		rows: 59 ,
		rm: 'balls' ,
		setGlobals: function(ctx) {
			balls2CamCommon(ctx);
			ctx.fadeColour = .8;
			ctx.fade = Math.max(0,1-(12*context.stepTime / this.time)%4);
		} ,
		lights : ballsLights,
		updateText: greetingsText
	} , {
		rows: 8 ,
		rm: 'balls' ,
		setGlobals: function(ctx) {
			balls2CamCommon(ctx);
			ctx.fadeColour = .1;
			ctx.fade = context.stepTime / this.time;
			ctx.desync = .1-Math.random()*.2;
		} ,
		lights : ballsLights,
		updateText: null
	} , {
		rows: 7 ,
		rm: 'tunnel' ,
		setGlobals: function(ctx) {
			ctx.tunMul = 2;
			tunnelCam(ctx);
			ctx.fade = 1-context.stepTime / this.time;
			ctx.desync = .1-Math.random()*.2;
		} ,
		lights : tunLights ,
		updateText: null
	} , {
		rows: 22 ,
		rm: 'tunnel' ,
		setGlobals: function(ctx) {
			tunnelCam(ctx);
			ctx.desync = .1-Math.random()*.2;
		} ,
		lights : tunLights ,
		updateText: null
	} , {
		rows: 10 ,
		rm: 'tunnel' ,
		setGlobals: function(ctx) {
			tunnelCam(ctx);
			ctx.desync = context.stepTime*4+.1-Math.random()*.2;
			ctx.fadeColour = 1;
			ctx.fade = context.stepTime / this.time;
		} ,
		lights : tunLights ,
		updateText: null
	} , {
		rows: 10 ,
		rm: 'squares' ,
		setGlobals: function(ctx) {
			squaresCam2(ctx,49);
			ctx.desync = (context.time-direction[48].startTime)*4+.1-Math.random()*.2;
			ctx.fade = 1-context.stepTime / this.time;
		} ,
		lights : [ lightFunc(1,30) ] ,
		updateText: null
	} , {
		rows: 40 ,
		rm: 'squares' ,
		setGlobals: function(ctx) {
			squaresCam2(ctx,49);
			ctx.desync = -(context.time-direction[48].startTime)*6;
		} ,
		lights : [ lightFunc(1,30) ] ,
		updateText: null
	} , {
		rows: 40 ,
		rm: 'squares' ,
		setGlobals: function(ctx) {
			squaresCam2(ctx,49);
			ctx.desync = (context.time-direction[48].startTime)*8;
			ctx.fadeColour = 0;
			ctx.fade = context.stepTime / this.time;
		} ,
		lights : [ lightFunc(1,30) ] ,
		updateText: null
	} , {
		rows: 68 ,
		rm: 'squares' ,
		setGlobals: function(ctx) {
			squaresCam2(ctx,49);
			ctx.fade = 1
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
console.log( "endTime: " + t + " (rows: " + rows + "; patterns: " + Math.floor(rows/36) + " + " + (rows - 36*Math.floor(rows/36)) + " extra row(s))" );
console.log( "len : " + direction.length );
t = 0;

function getMaterialsCode(indices,noiseScale)
{
	var code = 'Material getMaterial( vec3 pos , float index ) {\n'
		+ 'Material m;';

	for ( var i in indices ) {
		if ( i > 0 ) {
			code += 'else ';
		}
		var m = materials[ indices[i] ];
		code += 'if ( index == ' + shaderFloat( i ) + ' ) {\n'
			+ 'm.albedo = ';
		if ( m.noiseScale ) {
			code += 'mix( vec3(' + shaderVec( m.albedo ) + ') , vec3('
				+ shaderVec( m.noise ) + ') , noise( pos * '
				+ shaderFloat( noiseScale * m.noiseScale ) + ') )';
		} else {
			code += 'vec3(' + shaderVec( m.albedo ) + ')';
		}
		code += ';\nm.metallic=' + shaderFloat( m.metallic ) + ';\nm.smoothness='
			+ shaderFloat( m.smoothness ) + ';\nm.r0=' + shaderFloat( m.r0 ) + ';\n}';
	}

	return code + 'return m;\n}\n';
}

function createRaymarcherCode( def , nLights ) {
	var uniforms = [ 'CamMat' , 'CamPos' , 'Time' , 'Desync' , 'GreyMix' , 'Fade' , 'FadeColour' , 'TextParams' , 'TextColour' , 'Texture' ];
	var code = shaderBits['precision']
		+ shaderBits['voTexCoords']
		+ [ 'uniform mat3 uCamMat;' ,
		    'uniform vec3 uCamPos;' ,
		    'uniform float uTime;' ,
		    'uniform float uGreyMix;' ,
		    'uniform float uFade;' ,
		    'uniform float uFadeColour;' ,
		    'uniform vec3 uTextParams;' ,
		    'uniform vec3 uTextColour;' ,
		    'uniform sampler2D uTexture;' ,
		    'uniform float uDesync;'
		  ].join('\n');
	for ( var i in def.lights ) {
		code += 'uniform vec3 uLightPos' + i + ', uLightColor' + i + ";\nuniform float uLightDistance" + i + ";\n";
		uniforms.splice( uniforms.length , 0 , 'LightPos' + i , 'LightColor' + i , 'LightDistance' + i );
	}
	for ( var i in def.extraUniforms ) {
		code += 'uniform ' + def.extraUniforms[i] + " u" + i + ";\n";
		uniforms.push(i);
	}
	for ( var i in def.extraBits ) {
		code += shaderBits[def.extraBits[i]];
	}
	code += shaderBits['rmUtils'];
	code += 'vec2 cMap( vec3 p , float d ) {' + def.map
		+ '}' + getMaterialsCode(def.materials,def.noiseScale)
		+ [
			"vec3 getNormal( vec3 hp , float d )" ,
			"{" ,
				"vec2 e = vec2(1.,-1.)*" , shaderFloat(def.normalDelta)  , ";" ,
				"vec4 f = vec4(" ,
					"cMap(hp+e.xyy,d).x," ,
					"cMap(hp+e.yyx,d).x," ,
					"cMap(hp+e.yxy,d).x," ,
					"cMap(hp+e.xxx,d).x" ,
				");" ,
				"return normalize(f.x * e.xyy + f.y * e.yyx + f.z * e.yxy + f.w * e.xxx);" ,
			"}" ,

			"float ambientOcclusion(vec3 p, vec3 n, vec3 cp){" ,
				"const int steps = ", def.aoSteps , ";" ,
				"const float delta = ", shaderFloat( def.aoDelta ) , ";" ,

				"float a = 0.0;" ,
				"float weight = " , shaderFloat( def.aoWeight ) , ";" ,
				"float m;" ,
				"for(int i=1; i<=steps; i++) {" ,
					"float d = (float(i) / float(steps)) * delta;" ,
					"vec3 op = p + n * d;" ,
					"a += weight*(d - cMap(op,distance(op,cp)).x);" ,
					"weight *= 0.5;" ,
				"}" ,
				"return max(0.1 , 1.0 - clamp( pow(a , 1. ) , 0.0, 1.0) );" ,
			"}" ,


			"vec2 march( vec3 pos , vec3 dir , int nSteps)" ,
			"{" ,
				"float cd = 0. , e = " , shaderFloat( def.epsilon ) , ';' ,
				"vec2 m;" ,

				"for ( int i = 0 ; i < " , def.depth , " ; i++ ) {" ,
					"m = cMap( pos + dir * cd , cd );" ,
					"if ( m.x < e || i > nSteps || cd >" , shaderFloat( def.maxDistance ) , " ) {" ,
						"break;" ,
					"}" ,
					"cd += m.x * " , shaderFloat( def.step ) , ";" ,
					"e *= " , shaderFloat( def.epsilonMultiplier ) , ";" ,
				"}" ,

				"return vec2(cd,m.y);" ,
			"}" ,

			"void main( ) " ,
			"{" ,
				"vec3 tc = vec3(voTexCoords,1.);" ,
				"tc.y += mod(uDesync,1.)*2.2;" ,
				"if ( tc.y > 1. ) {" ,
					"if ( tc.y < 1.2 ) discard;" ,
					"tc.y -= 2.2;" ,
				"}" ,
				"tc.x *= 1.6;" ,
				"vec3 dir = normalize( tc * uCamMat ) ," ,
					"pos = uCamPos , outColor = vec3( 0. ) , " ,
					"cMul = vec3( 1. ) , ld , l;" ,

				"float ll;" ,
				"for ( int j = 0 ; j < 2 ; j ++ ) {" ,
					"vec3 col, nDir = dir , nPos = pos, ncMul = vec3(0.);" ,
					"vec2 vl,r = march( pos , dir , " , def.depth , " / ( j + 1 ) );" ,
					"if ( r.x < " , shaderFloat( def.maxDistance ) , " ) {" ,
						"vec3 hp = pos + dir * r.x , n=getNormal( hp , r.x ),hDir;" ,
						"nDir = reflect(dir,n);" ,
						"hDir = normalize( nDir + dir );" ,
						"float fog = " , shaderFloat( def.fogDensity ) , " * r.x;" ,
						"fog *= fog*fog*1.442695;" ,
						"fog = clamp( exp(-fog) , 0., 1. );" ,
						"Material m = getMaterial( hp , r.y );" ,
						"float occlusion = ambientOcclusion( hp , n , pos ) , " ,
							"fresnel = schlick( hDir , dir , m.r0 , m.smoothness * .9 + .1 );" ,
						"vec3 sCol = mix(vec3(1.),m.albedo/dot(LUMA,m.albedo),m.metallic) ," ,
							"dc , sc;" ,
						"col = vec3(0.);" ,
		].join('\n');

	for ( var l in def.lights ) {
		var ld = def.lights[l];
		code += [
			"ld = uLightPos" + l + " - hp;" ,
			"ll = length(ld);" ,
			"ld /= ll;" ,
			"ll = max( 1. , ll - uLightDistance" + l + ") * " , shaderFloat( ld.attenuation ) , ";" ,
			"ll = 1. / max( 1. , ll * ll );" ,
			"l = ll * max(dot(ld,n),0.) * uLightColor" + l + ";" ,
			"dc = (1. - m.metallic) * m.albedo * occlusion;" ,
			"sc = sCol * getSpecular( dir , ld , n , m.smoothness );" ,
			"col += mix( dc , sc , fresnel ) * l;" 
		].join('\n');
		code += ";";
	}
	code += [
						"ncMul = cMul * fog * normalize(sCol) * m.r0 * (m.smoothness * .9 + .1) * fresnel;" ,
						"col = mix( vec3(" , shaderFloat(def.fog) , ") , col , fog );" ,
						"nPos += normalize(nDir) * " , shaderFloat(def.reflectionDistance) , ";" ,
					"} else {" ,
						"col=vec3(" , shaderFloat(def.fog) , ');' ,
					"}" ,
	].join('\n');

	for ( var l in def.lights ) {
		var ld = def.lights[l];
		var r = ld.vRadius;
		if ( r ) {
			code += [
					"ld = pos - uLightPos" + l + ";" ,
					"vl = solve(dot(dir,dir),2.*dot(ld,dir),dot(ld,ld)-" + shaderFloat(r*r) + ");" ,
					"if ( vl.x > 0. && vl.y < r.x ) {" ,
						"float fog = " , shaderFloat( def.fogDensity ) , " * vl.x;" ,
						"fog *= fog*fog*1.442695;" ,
						"fog = clamp( exp(-fog) , 0., 1. );" ,
						"col += fog * uLightDistance" + l + " * uLightColor" + l + " * pow( (vl.y-vl.x) / " + shaderFloat(r*2) + " , 64. );" ,
					"}"
			].join( "\n" );
		}
	}

	code += [
					"outColor += col * cMul;" ,
					"if ( all(lessThan(ncMul, vec3(.01))) ) {" ,
						"break;" ,
					"}" ,
					"cMul = ncMul;" ,
					"pos = nPos;" ,
					"dir = normalize(nDir);" ,
				"}" ,

				"vec3 cMix = ( outColor.r == outColor.g && outColor.b == outColor.g ) ? outColor : vec3( dot( outColor , LUMA ) );" ,
				"outColor = mix( mix( outColor , cMix , uGreyMix ) , vec3(uFadeColour) , smoothstep( .05 , .95 , uFade ) );" ,

				"cMix.xy = vec2(voTexCoords.x,tc.y) * .5 + .5;" ,
				"cMix.y = ( 1. - cMix.y - uTextParams.x ) / uTextParams.z;" ,
				"vec4 tcol = texture2D( uTexture , cMix.xy );" ,
				"outColor = mix(outColor , tcol.rgb * uTextColour ,  tcol.a * uTextParams.y );" ,

				"outColor = max( vec3( 0. ) , outColor - vec3( .004 ) );" ,
				"outColor = ( outColor * ( 6.2 * outColor + .5 ) ) / ( outColor * ( 6.2 * outColor + vec3( 1.7 ) ) + vec3( .06 ) );" ,

				"float g = smoothstep(.98,1.,noise(tc*8.-uTime*40.));" ,
				"outColor *= .95 + .05 * cos(uTime*41.);" ,
				"outColor += vec3(g);" ,
				"g = 1.-(smoothstep(.98,1.,noise(tc*8.+uTime*20.))+smoothstep(.95,1.,noise(tc*1.5+uTime*10.)));" ,

				"float v = g*smoothstep(1.042+.008*cos(uTime*40.),.8,lx(voTexCoords,8.));" ,
				"g = (tc.x + 1. ) * (tc.y + 1. ) * (uTime * 10.0);" ,
				"v *= 1.-(mod((mod(g, 13.0) + 1.0) * (mod(g, 47.0) + 1.0), 0.01)) * 8.;" ,

				"gl_FragColor = vec4(v*outColor,1.);" ,
			"}" ,
	].join('\n');
	return [ code , uniforms ];
}

function buildRaymarchers( )
{
	var ml = 1;
	for ( var n in raymarchers ) {
		var rm = raymarchers[n];
		var nl = rm.lights.length;
		ml=nl>ml?nl:ml;
		for ( var i=1;i<=nl;i++) {
			var sn = 'rmfs_' + n + '_' + i;
			var sd = createRaymarcherCode(rm,i);
			shaderBits[sn] = sd[0];
			shaders[sn] = ['f',sn];
			programs['rm_' + n + '_' + i] = [ sd[1] , 'raymarchVS' , sn ];
		}
	}
	var context = {
		camPos: vomNew(3),
		lookAt: vomNew(3),
		up: vomNew(3),
		toNearPlane: 0 ,
		time: 0 ,
		desync: 0 ,
		greyMix: 0 ,
		fade: 0 ,
		fadeColour: 0 ,
		text: vomNew(3) ,
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
	ctx.extras = [];
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

	var p = programs[ 'rm_' + ds.rm + '_' + active.length ];
	glCtx.useProgram( p[ 0 ] );
	glCtx.enableVertexAttribArray( 0 );
	glCtx.vertexAttribPointer( 0 , 2 , glCtx.FLOAT , false , 8 , 0 );
	p = p[1];
	glCtx.uniform1f( p.GreyMix , ctx.greyMix );
	glCtx.uniform1f( p.Fade , ctx.fade );
	glCtx.uniform1f( p.FadeColour , ctx.fadeColour );
	glCtx.uniform1f( p.Desync , ctx.desync );
	glCtx.uniform1f( p.Time , ctx.time );
	glCtx.uniform3fv( p.CamPos , ctx.camPos );
	glCtx.uniform3fv( p.TextParams , ctx.text );
	glCtx.uniform3fv( p.TextColour , ctx.textColour );
	glCtx.uniform1i( p.Texture , 0 );
	glCtx.uniformMatrix3fv( p.CamMat , false , cm );
	for ( var e in ctx.extras ) {
		eval( 'glCtx.uniform' + ctx.extras[e] );
	}
	for ( var i in active ) {
		glCtx.uniform1f( p[ 'LightDistance' + i ] , active[ i ].distance );
		glCtx.uniform3fv( p[ 'LightPos' + i ] , active[ i ].pos );
		glCtx.uniform3fv( p[ 'LightColor' + i ] , active[ i ].colour );
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
var context = buildRaymarchers( );
buildPrograms();
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
	var delta = time - previousFrame, demoTime = .001*(time - timeStart);
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
	context.time = demoTime;
	context.stepTime = demoTime - ds.startTime;
	if ( ds.updateText ) {
		twoDCtx.clearRect( 0 , 0 , canvasWidth , 100 );
		ds.updateText();
		glCtx.texImage2D( glCtx.TEXTURE_2D , 0 , glCtx.RGBA , glCtx.RGBA , glCtx.UNSIGNED_BYTE , C2 );
	} else {
		vecSet(context.text,0,0,100/canvasHeight);
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

