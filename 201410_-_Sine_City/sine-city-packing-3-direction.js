var USE_SYNTH = 1;

// Vector stuff
function vecOp(code) {
	return eval('(function(o,a,b){for(var i=o.length;--i>=0;)' + code + ';return o})')
}
function vomNew(s) {
	return new Float32Array(s)
}
var vecNorm = function(o,a) {
	var l = Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]);
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

var materials = [[[.05],.7,.02,.01],[[.2],.7,.9,.01,5,[.1]],[[1],.5,.4,.02],[[3,0,0],.3,.1,.6,6,[.6,0,0]],[[0,2,0],.9,.5,.4,15,[0,.2,0]],[[3,1.5,0],.95,.6,.9,.3,[.3,.6,0]],[[.1],0,.04,.002,3,[3]],[[0,1.5,2],.9,.3,.4]];
var raymarchers = [[100,.025,1,.7,64,.0005,.5,.3,.4,.015,4,2,.75,[0,1,2,3],'y=x+.1*(sin(x.zxy*.17+u4[0]*.5)+sin(x.yzx*.7+u4[0]*1.5))*8.5*(1.+cos(sin(x.z*.1)+x.z*.3)),z=14.-length(y.xy),w=x.x==.0?1.570795*(x.y>.0?1.:-1.):atan(x.y,x.x),q=8.35-u4[8]*1.35,y=!3(9.*(mod(w+x.z*.02,.628)-.314),length(x.xy)-9.,mod(x.z,12.56)-6.28),u=min(length(y.xy)-.25+.1*cos(x.z*8.+u4[0]*.1),length(y.yz)-.5),y=!3(q*(mod(w+x.z*.02,1.256636)-.628318),y.y+9.-q,mod(x.z,62.8318)-31.4159),o=step(u,z)+1.,z=min(u,z),u=length(y)-1.3;if(u<z)z=u,o=3.;y.y+=q-9.,u=yyx(y.yz,8.)-2.;if(u<z)z=u,o=.0;return !2(z,o);',[[.25,0],[.5,.5]]],[6,.00025,1.08,.7,100,.000008,10,.03,2.1,.2,6,.4,5.1,[0,2,5],'z=1.,y=x;for(int i=0;i<7;i++)x=2.*clamp(x,-!3(.58,.9,1.1),!3(.58,.9,1.1))-x,w=max((1.3+u4[9]*.1*cos(u4[0]*.5))/dot(x,x),1.),x*=w,z*=w;w=length(x.xy),e=!2(w-3.,-w*x.z/length(x)-2.*log(1.+.01*a))/abs(z),w=max(e.x,e.y),o=step(e.y,e.x),y+=!3(.1,.3,-.4)*u0-u2+.25*sin(x*1.),e.x=length(y)-.1*u4[8];if(e.x<w)w=e.x,o=2.;return !2(w,o);',[[.05]]],[100,.000025,1,.75,80,.00005,.5,.3,3,.01,4,.75,4.75,[6,0,4],'x.xy*=t(a*.009),w=min(min(yz(x.xzy),yz(x)),yz(x.yzx)),y=mod(x,!3(15.))-!3(7.5),o=step(z=max(length(max(abs(y)-!3(2.5),!3(.0)))-.25,3.5-length(y)),w),w=min(w,z),z=length(y+.1*sin(y*5.5+u4[0]))-2.;if(z<w)w=z,o=2.;return !2(w,o);',[[.05]]],[20,.0005,1,.6,128,.0001,.5,.002,.01,.08,4,.5,1.75,[2,7],'y=x,y.xz=mod(x.xz,8.)-4.,y.yz*=t(u4[8]+.1*a),y.xy*=t(u4[8]*.5+.2*a),y.y*=.9+.1*sin(u4[8]*5.),w=max(length(y)-3.,-min(length(y)-2.8,max(mod(y.y,.8)-.4,-mod(y.y+.4,.8)+.4))),z=x.y+1.+sin(x.x*4.+u4[8]*2.)*sin(x.z+u4[8])*.1,o=clamp(.5+.5*(z-w)/1.,.0,1.),w=mix(z,w,o)-1.*o*(1.-o),y=x,y.xz=mod(y.xz,8.)-4.,y/=1.25+.25*sin(u4[8]*5.),y.xy*=t(u4[8]*5.),y.yz*=t(u4[8]*2.5),z=max(length(y)-1.,.04-length(max(abs(mod(y,.5)-.25)-!3(.15),!3(.0))));return !2(min(w,z),step(z,w));',[[.02],[.05,.5],[.05,.5]]]];

var tunMul=1;
var randAround = function(c,d) { return c - d + Math.random()*d*2 };
var lightFunc = function(intensity,distance) {
	return function(lctx) {
		vecCopy(lctx[0],camPos);
		lctx[1]=intensity;
		lctx[2] = distance;
	}
};
var tun1CamCommon = function(dir) {
	var z = demoTime*6;
	vecSet(camPos,-6,0,z);
	vecSet(lookAt,1,0,z);
	vecSet(camUp,0,1,0);
	misc[1] = 1;
	misc[8] = 0;
};
var desyncFunc = function(desync) {
	return function(tt) {
		var z = stepTime / direction[t][6];
		misc[4] = -z * desync;
		if ( desync > 0 ) {
			misc[4] += desync;
		}
		misc[4] *= randAround(.875,.125);
	};
};
var balls1CamFunc = function(lax,laz,desync) {
	var dsf = desyncFunc(desync);
	return function() {
		var z = demoTime*3;
		vecSet(camPos,0,4,z);
		vecSet(lookAt,lax,0,z+laz);
		vecSet(camUp,0,0,1);
		misc[8]= misc[2] = 0;
		dsf();
	};
};
var balls2CamCommon = function() {
	var z = demoTime*5;
	vecSet(camPos,Math.cos(demoTime)*12,8,Math.sin(demoTime)*12+z);
	vecSet(lookAt,1,0,z);
	vecSet(camUp,0,1,0);
	toNearPlane = 2.5;
	z = demoTime - direction[43][5];
	misc[8]=z;
};
var balls2LightFunc = function(scale) {
	return function(lctx) {
		var z = demoTime*30;
		vecSet(lctx[0],scale*Math.cos(demoTime*2)*5,3,scale*Math.sin(demoTime*2)*5+z);
		lctx[1] = 1;
		lctx[2] = 4;
	};
};
var fract1CamCommon = function() {
	var z = demoTime;
	vecSet(camPos,4,2.5+.025*z,6.7);
	vecSet(lookAt,0,2.5-.05*z,6.7);
	vecSet(camUp,0,0,1);
	misc[8] = misc[9] = 0;
	toNearPlane = 3;
};
var fract1CamFunc = function(desync) {
	var dsf = desyncFunc(desync);
	return function(){
		fract1CamCommon();
		dsf();
	};
};
var fract2CamCommon = function(bs) {
	vecSet(camPos,5*Math.sin(demoTime*.2),9*Math.cos(demoTime*.41),7.8);
	vecCopy(lookAt,camPos);
	lookAt[0] = Math.cos(demoTime*.2);
	lookAt[1] = Math.sin(demoTime*.33);
	lookAt[2] -= 2;
	vecSet(camUp,0,0,1);
	toNearPlane = 3;
	misc[8] = bs;
	misc[9] = 1;
};

var drawText = function(str,x) {
	twoDCtx.shadowBlur = c2height/5;
	twoDCtx.fillText( str , x , c2height / 2 );
	twoDCtx.shadowBlur = 0;
	twoDCtx.strokeText( str , x , c2height / 2 );
};
var titleText = function(str,shake,alpha,r,g,b) {
	drawText( str , canvasWidth/15 );
	misc[5] = 1 - c2rHeight + randAround(0,shake);
	misc[6] = alpha;
	vecSet( textColour , r , g , b );
};
var greetingsText = function() {
	var t = ( demoTime - direction[34][5] ) * canvasWidth * .5;
	drawText( "Greetings to ... Mog, Sycop, Tim & Wullon ... Adinpsz ... Alcatraz ... ASD ... Bits'n'Bites ... Brain Control ... Cocoon ... Conspiracy ... Ctrl+Alt+Test ... Fairlight ... Farbrausch ... Kewlers ... LNX ... Loonies ... Mercury ... Popsy Team ... Razor 1911 ... RGBA ... 7th Cube ... Still ... TPOLM ... TRBL ... Umlaut Design ... X-Men ... Youth Uprising ... Everyone here at DemoJS 2014!" , canvasWidth - t );
	misc[5] = 1 - c2rHeight + randAround(.01,.01);
	misc[6] = 1;
	vecSet( textColour , 1 , 1 , 1 );
};

var squaresCam = function() {
	var t = demoTime - direction[25][5];
	var z = t*10 - 80;
	vecSet(camPos,z,0,0);
	vecSet(lookAt,z+Math.cos(t*.5) * 80,Math.sin(t*.25)*40,100);
	vecSet(camUp,0,1,0);
};

var squaresCam2 = function(s) {
	var t = demoTime - direction[s][5];
	var z = t*20 - 80;
	vecSet(camPos,0,0,z);
	vecSet(lookAt,Math.cos(t*.5) * 80,Math.sin(t*.25)*40,z+100);
	vecSet(camUp,Math.sin(t),Math.cos(t),0);
	misc[4] = randAround(.0125,.0125);
};

var tunnelLight = function(lctx) {
	vecSub(lctx[0],camPos,vecNorm(lctx[0],lookAt));
	lctx[0][1] -= .5;
	lctx[1] = 3;
	lctx[2] = 30;
};
var tunnelCam = function(mul) {
	var z = demoTime*30*tunMul;
	vecSet(camPos,1.1*Math.cos(z*.1),Math.sin(z*.02),z);
	z += 5;
	vecSet(lookAt,-Math.sin(z*.05),-.7*Math.cos(z*.033),z);
	vecSet(camUp,0,1,0);
	toNearPlane = 2;
};
var tunnelLightBall = function(lctx) {
	vecSet(lctx[0] , 4*Math.sin(demoTime*.5)*Math.cos(demoTime*.7) ,
			3*Math.cos(demoTime*1.5),
			demoTime*30*tunMul+14+16*Math.sin(demoTime*3.3)*Math.cos(demoTime*.77)
	);
	lctx[1] = 1;
	lctx[2] = 15;
};

// direction    0<->rows / 1<->rm / 2<->setGlobals / 3<->lights / 4<->updateText / 5<->startTime / 6<->time / 7<->endTime
var direction = [
	[
		// Music rows
		36 ,
		// Raymarcher id
		0 ,
		function( ) {
			tun1CamCommon();
			misc[2] = 1 - rStepTime*rStepTime*rStepTime;
			toNearPlane = 5;
		} ,
		[
			lightFunc(3,20)
		]
	] , [
		18 ,
		0 ,
		function( ) {
			tun1CamCommon();
			toNearPlane = 5 - 2.25 * rStepTime;
			misc[2] = 0;
		} ,
		[
			lightFunc(3,20)
		]
	] , [
		36 ,
		0 ,
		function( ) {
			tun1CamCommon();
			toNearPlane = 2.75 - 2.25 * rStepTime;
			misc[2] = rStepTime;
		} ,
		[
			lightFunc(3,20)
		]
	] , [
		18 ,
		3 ,
		function( ) {
			var z = demoTime*3;
			vecSet(camPos,0,4,z);
			vecSet(lookAt,4,0,z);
			vecSet(camUp,0,0,1);
			z = rStepTime;
			z *= z*z;
			misc[2] = 1 - z;
			toNearPlane = 2.5;
		} ,
		[
			lightFunc(.75,8)
		]
	] , [
		22 ,
		3 ,
		balls1CamFunc(4,0,0) ,
		[
			lightFunc(1,8)
		]
	] , [
		22 ,
		3 ,
		balls1CamFunc(2,-2,0) ,
		[
			lightFunc(1,8)
		]
	] , [
		3 ,
		3 ,
		balls1CamFunc( 6 , 0 , -.5 ) ,
		[
			lightFunc(.5,4)
		]
	] , [
		9 ,
		3 ,
		balls1CamFunc( 6 , 0 , .5 ) ,
		[
			lightFunc(.5,4)
		]
	] , [
		3 ,
		3 ,
		balls1CamFunc( 2 , 2 , -.2 ) ,
		[
			lightFunc(1,8)
		]
	] , [
		9 ,
		3 ,
		balls1CamFunc( 2 , 2 , .2 ) ,
		[
			lightFunc(1,8)
		]
	] , [
		3 ,
		3 ,
		balls1CamFunc( 2 , 5 , -.7 ) ,
		[
			lightFunc(1,2)
		]
	] , [
		7 ,
		3 ,
		balls1CamFunc( 2 , 2 , .7 ) ,
		[
			lightFunc(1,2)
		]
	] , [
		9 ,
		3 ,
		function() {
			var z = demoTime*3;
			misc[2] = rStepTime;
			vecSet(camPos,0,4+rStepTime*2,z);
			vecSet(lookAt,2,0,z+2);
			vecSet(camUp,0,0,1);
			misc[3] = 1;
		} ,
		[
			lightFunc(1,2)
		]
	] , [
		21 ,
		1 ,
		function( ) {
			fract1CamCommon();
			misc[3] = 1;
			misc[2] = 1 - rStepTime*rStepTime*rStepTime;
		} , [
			fractLight = function(lctx) {
				vecCopy(lctx[0],camPos);
				lctx[0][2]+=2;
				lctx[1] = 1;
				lctx[2] = 3;
			}
		]
	] , [
		14 ,
		1 ,
		fract1CamFunc(0) ,
		[
			fractLight
		]
	] , [
		3 ,
		1 ,
		fract1CamFunc(-.4) ,
		[ fractLight ]
	] , [
		9 ,
		1 ,
		fract1CamFunc(.4) ,
		[ fractLight ]
	] , [
		3 ,
		1 ,
		fract1CamFunc(-.2) ,
		[ fractLight ]
	] , [
		9 ,
		1 ,
		fract1CamFunc(.2) ,
		[ fractLight ]
	] , [
		12 ,
		1 ,
		function() {
			fract1CamCommon();
			misc[4] = -( 6 * rStepTime ) % 1;
			misc[4] *= randAround(.875,.125);
		} ,
		[ fractLight ]
	] , [
		22 ,
		1 ,
		function() {
			fract1CamCommon();
			misc[3] = .4;
			misc[2] = rStepTime;
			toNearPlane = 3 - 2.5*Math.max(1,2*rStepTime);
			misc[4] = ( 30 * misc[2] ) % 1;
			misc[4] *= randAround(.925,.075);
		} ,
		[ fractLight ]
	] , [
		3 ,
		1 ,
		neutral = function() {
			fract1CamCommon();
			misc[3] = .4;
			misc[2] = 1;
			misc[4] = 0;
		} ,
		[ fractLight ]
	] , [
		12 ,
		1 ,
		neutral ,
		[ fractLight ],
		function() {
			titleText( "TheT(ourist)" , .08 , 1 , 1 , 1 , 1 );
		}
	] , [
		12 ,
		1 ,
		neutral ,
		[ fractLight ],
		function() {
			titleText( "TheT(ourist)" , .08 , 1 - rStepTime , 1 , 1 , 1 );
		}
	] , [
		12 ,
		1 ,
		neutral ,
		[ fractLight ],
		function() {
			titleText( "presents" , .08 , 1 - rStepTime , 1 , 1 , 1 );
		}
	] , [
		20 ,
		2 ,
		function() {
			squaresCam();
			toNearPlane = 2.5;
			misc[2] = 1 - rStepTime;
		} ,
		[ lightFunc(1,30) ],
		function() {
			titleText( "Sine City" , .04 , rStepTime , 1 , 1 , 1 );
		}
	] , [
		52 ,
		2 ,
		function() {
			squaresCam();
			misc[2] = 0;
		} ,
		[ lightFunc(1,30) ],
		function() {
			titleText( "Sine City" , .04 , 1 , 1 , 1 , 1 );
		}
	] , [
		12 ,
		2 ,
		function(){
			squaresCam();
			misc[3] = 1;
			misc[2] = Math.max(0,1-rStepTime*2);
		} ,
		[ lightFunc(1,30) ],
		function() {
			titleText( "Sine City" , .04 , 1 , 1 - rStepTime , 1 - rStepTime * .5 , 1 - rStepTime );
		}
	] , [
		12 ,
		2 ,
		function() {
			squaresCam();
			misc[4] = ( 1 - rStepTime ) * .7 + randAround(.0125,.0125);
			misc[1] = 1 - .5 * rStepTime;
		} ,
		[ lightFunc(1,30) ],
		function() {
			titleText( "Sine City" , .04 , 1 , 0 , .5 , 0 );
		}
	] , [
		9 ,
		2 ,
		function() {
			squaresCam2(29);
			misc[2] = Math.max(0,1-rStepTime*1.5);
			misc[4] += ( rStepTime - 1 ) * .3;
			misc[1] = .5 - .5 * rStepTime;
		} ,
		[ lightFunc(1,30) ],
		function() {
			titleText( "Sine City" , .04 , 1 - rStepTime , 0 , .5 , 0 );
		}
	] , [
		69 ,
		2 ,
		function() {
			squaresCam2(29);
			misc[1] = 0;
		} ,
		[ lightFunc(1,30) ]
	] , [
		11 ,
		2 ,
		function() {
			squaresCam2(29);
			misc[3] = .2;
			misc[2] = rStepTime;
		} ,
		[ lightFunc(1,30) ]
	] , [
		11 ,
		0 ,
		function() {
			tunnelCam();
			misc[2] = 1 - rStepTime;
		} ,
		[ tunnelLight ]
	] , [
		17 ,
		0 ,
		function() {
			tunnelCam();
			misc[2] = 0;
			misc[4] = (1.2 - 1.2 * rStepTime) * randAround(1,.02);
		} ,
		[ tunnelLight ]
	] , [
		18 ,
		0 ,
		function() {
			tunnelCam();
			misc[4] = 0;
			misc[8] = rStepTime;
		} ,
		[ tunnelLight ],
		greetingsText
	] , [
		36 ,
		0 ,
		function() {
			tunnelCam();
			misc[2] = 1 - Math.min(4*rStepTime,1);
			misc[8] = 1;
		} ,
		tunLights = [ tunnelLight , tunnelLightBall ],
		greetingsText
	] , [
		33 ,
		0 ,
		function() {
			tunnelCam();
			misc[2] = rStepTime;
			misc[3] = .7;
			misc[4] = -((4*rStepTime)%1)*randAround(1,.05);
		} ,
		tunLights ,
		greetingsText
	] , [
		9 ,
		1 ,
		function() {
			fract2CamCommon(0);
			misc[2] = rStepTime;
			misc[3] = 1;
		} ,
		[ fractLight ],
		greetingsText
	] , [
		20 ,
		1 ,
		function() {
			fract2CamCommon(rStepTime);
			misc[2] = 0;
		} ,
		[ fractLight ],
		greetingsText
	] , [
		31 ,
		1 ,
		function() {
			fract2CamCommon(1);
			misc[2] = Math.min(0,1-5*rStepTime);
		} ,
		[ fractLight ],
		greetingsText
	] , [
		5 ,
		1 ,
		function() {
			fract2CamCommon(1);
			misc[2] = 1-rStepTime;
		} ,
		[ fractLight ],
		greetingsText
	] , [
		18 ,
		1 ,
		function() {
			fract2CamCommon(1);
			misc[2] = Math.min(0,1-5*rStepTime);
			misc[4] = Math.max(0,1.6*rStepTime - .8 )*randAround(1,.05);
		} ,
		[ fractLight ],
		greetingsText
	] , [
		12 ,
		1 ,
		function() {
			fract2CamCommon(1);
			misc[3] = .1;
			misc[2] = rStepTime;
			misc[4] = .8*(1-rStepTime)*randAround(1,.1);
		} ,
		[ fractLight ],
		greetingsText
	] , [
		22 ,
		3 ,
		function() {
			balls2CamCommon();
			misc[2] = 1-rStepTime;
			misc[4] = 0;
		} ,
		ballsLights = [ lightFunc(.6,30) , balls2LightFunc(1),balls2LightFunc(-1) ],
		greetingsText
	] , [
		59 ,
		3 ,
		function() {
			balls2CamCommon();
			misc[3] = .8;
			misc[2] = Math.max(0,1-(12*rStepTime)%4);
		} ,
		ballsLights,
		greetingsText
	] , [
		8 ,
		3 ,
		function() {
			balls2CamCommon();
			misc[3] = .1;
			misc[2] = rStepTime;
			misc[4] = randAround(.1,.1);
		} ,
		ballsLights
	] , [
		7 ,
		0 ,
		function() {
			tunMul = 2;
			tunnelCam();
			misc[2] = 1-rStepTime;
			misc[4] = randAround(.1,.1);
		} ,
		tunLights
	] , [
		22 ,
		0 ,
		function() {
			tunnelCam();
			misc[4] = randAround(.1,.1);
		} ,
		tunLights
	] , [
		10 ,
		0 ,
		function() {
			tunnelCam();
			misc[4] = stepTime*4+randAround(.1,.1);
			misc[3] = 1;
			misc[2] = rStepTime;
		} ,
		tunLights
	] , [
		10 ,
		2 ,
		function() {
			squaresCam2(49);
			misc[4] = (demoTime-direction[48][5])*4+randAround(.1,.1);
			misc[2] = 1-rStepTime;
		} ,
		[ lightFunc(1,30) ]
	] , [
		40 ,
		2 ,
		function() {
			squaresCam2(49);
			misc[4] = -(demoTime-direction[48][5])*6;
		} ,
		[ lightFunc(1,30) ]
	] , [
		40 ,
		2 ,
		function() {
			squaresCam2(49);
			misc[4] = (demoTime-direction[48][5])*8;
			misc[3] = 0;
			misc[2] = rStepTime;
		} ,
		[ lightFunc(1,30) ]
	] , [
		68 ,
		2 ,
		function() {
			squaresCam2(49);
			misc[2] = 1
		} ,
		[ lightFunc(1,30) ]
	]
];
var t = 0;
for ( var i in direction ) {
	direction[ i ][5] = t;
	t += ( direction[i][6] = direction[ i ][0] * .125 );
	direction[ i ][7] = t;
}
t = 0;

function createRaymarcherCode( def ) {
	var w = 'uniform ';
	var code = shaderHeader
		+ [ w+'mat3 u0;' ,
		    w+'sampler2D u1;' ,
		    w+'!3 u2,u3;' ,
		    w+'float u4[10];'
		  ].join('\n');
	var u = 5;
	for ( var i in def[15] ) {
		code += w+'!3 u' + u++ + ';'+w+'float u' + u++ + ', u' + u++ + ';';
	}
	code += [
		"const !2 c=!2(1.,-1.)*"+def[5]+";" ,
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
	code += def[14] + '}';
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
					"x=.0,a=" + def[1] + ';' ,
					"for(int i=0;i<" + def[4] + ";i++){" ,
						"h=k(s+r*x,x);" ,
						"if(h.x< a||i>" + def[4] + "/(j+1)||x>" + def[0] + ".)break;" ,
						"x+=h.x*" + def[3] + ",a*=" + shaderFloat( def[2] ) + ";" ,
					"}" ,
					"h.x=x;",

					"if(x<"+ def[0]+ ".){" ,
						"d=s+r*x," ,
						"f=!4(" ,
							"k(d+c.xyy,x).x," ,
							"k(d+c.yyx,x).x," ,
							"k(d+c.yxy,x).x," ,
							"k(d+c.xxx,x).x" ,
						")," ,
						"xx=normalize(f.x*c.xyy+f.y*c.yyx+f.z*c.yxy+f.w*c.xxx)," ,
						"a=.0," ,
						"p=" + def[12] + ";" ,
						"for(int i=1;i<="+def[10]+";i++)" ,
							"x=(float(i)/"+def[10]+".)*"+ shaderFloat( def[11] ) + "," ,
							"m=d+xx*x," ,
							"a+=p*(x-k(m,distance(m,s)).x)," ,
							"p*=.5;" ,
						"q=max(.1,1.-clamp(pow(a,1.),.0,1.));" ,
		].join('\n');

	for(var i in def[13])
		w=materials[def[13][i]],code+=(i>0?'else ':'')+'if(h.y==' + i + '.)xz='+(w[4]?('mix(!3('+shaderVec(w[0])+'),!3('+shaderVec(w[5])+'),yy(d*'+shaderFloat(def[6]*w[4])+'))'):('!3('+shaderVec(w[0])+')'))+',w='+shaderFloat(w[1])+',u='+w[2]+',o='+w[3]+';';

	code += [
						"v=reflect(r,xx)," ,
						"z="+def[9]+"*h.x," ,
						"z=clamp(exp(-z*z*z*1.442695),.0,1.)," ,
						"x=clamp((1.+dot(normalize(v+r),r)),.0,1.),a=x*x," ,
						"zz=o+(1.-o)*x*a*a*(u*.9+.1)," ,
						"y=mix(!3(1.),xz/dot(!3(.299,.587,.114),xz),w)," ,
						"m=!3(.0)," ,
						"zy=exp2(4.+6.*u)," ,
		].join('\n');

	u = 5;
	for ( var l in def[15] ) {
		var b = def[15][l];
		code += [
			"p=length(b=u" + u + "-d)," ,
			"b/=p," ,
			"p=max(1.,p-u" + (u+2) + ")*" + b[0] + "," ,
			"p=1./max(1.,p*p)," ,
			"m+=mix((1.-w)*xz*q,y*pow(max(dot(reflect(r,xx),b),.0),zy)*(zy+2.)/8.,zz)*p*max(dot(b,xx),.0)*!3(u" + (u+1) + "),"
		].join('\n');
		u+=3;
	}
	code += [
						"xy=yx*z*normalize(y)*o*(u*.9+.1)*zz," ,
						"m=mix(!3(" + shaderFloat(def[8]) + "),m,z)," ,
						"xxx+=normalize(v)*" + def[7] + ";" ,
					"}else" ,
						"m=!3(" + shaderFloat(def[8]) + ');'
	].join('\n');

	u=5;
	for ( var l in def[15] ) {
		var b = def[15][l];
		var h = b[1];
		if ( h ) {
			code += [
					"b=s-u" + u + "," ,
					"p=dot(r,r),a=2.*dot(b,r)," ,
					"x=a*a-4.*p*(dot(b,b)-" + (h*h) + ")," ,
					"e=x<.0?!2(-1.):(x=sqrt(x),-.5*!2(a+x,a-x)/p)," ,
					"e=!2(min(e.x,e.y),max(e.x,e.y));" ,
					"if(e.x>.0&&e.y<h.x)" ,
						"m+=u" + (u+2) + "*!3(u" + (u+1) + ")*pow((e.y-e.x)/" + shaderFloat(h*2) + ",64.);"
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
	return code;
}

var cmU=vomNew(3),
    cmV=vomNew(3),
    cmW=vomNew(3),
    cd=vomNew(3),
    cu=vomNew(3),
    cm=vomNew(9);


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
var misc = vomNew(10) , camPos = vomNew(3),lookAt=vomNew(3),camUp=vomNew(3),toNearPlane=0,textColour=vomNew(3) , lights= [[vomNew(3),0,0],[vomNew(3),0,0],[vomNew(3),0,0]];
var sn = 1;
for ( var i in raymarchers ) {
	var rm = raymarchers[i];
	shaders[sn] = [glCtx.FRAGMENT_SHADER,createRaymarcherCode(rm)];
	programs[i] = [ 5+rm[15].length*3 , 0 , sn++ ];
}
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

var demoTime, rStepTime,stepTime;
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
	while ( ds && ds[7] < demoTime ) {
		ds=direction[++t];
	}
	if ( ! ds ) {
		A.pause( );
		return;
	}
	misc[0] = demoTime;
	misc[7] = c2rHeight;
	stepTime = demoTime - ds[5];
	rStepTime = stepTime / ds[6];
	if ( ds[4] ) {
		twoDCtx.clearRect( 0 , 0 , canvasWidth , 100 );
		ds[4]();
		glCtx.texImage2D( glCtx.TEXTURE_2D , 0 , glCtx.RGBA , glCtx.RGBA , glCtx.UNSIGNED_BYTE , C2 );
	}

	ds[2]();
	vecNorm(cmW,vecSub(cmW,lookAt,camPos));
	vecNorm(cmU,vecCross(cmU,camUp,cmW));
	vecNorm(cmV,vecCross(cmV,cmW,cmU));
	vecScale(cmW,cmW,toNearPlane);
	vecs2Mat3(cm,cmU,cmV,cmW);

	for ( var i in ds[3] ) {
		ds[3][i](lights[ i ]);
	}

	var p = programs[ds[1]];
	glCtx.useProgram( p[ 0 ] );
	glCtx.enableVertexAttribArray( 0 );
	glCtx.vertexAttribPointer( 0 , 2 , glCtx.FLOAT , false , 8 , 0 );
	p = p[1];

	var u = 0;
	glCtx.uniformMatrix3fv( p[u++] , false , cm );
	glCtx.uniform1i( p[u++] , 0 );
	glCtx.uniform3fv( p[u++] , camPos );
	glCtx.uniform3fv( p[u++] , textColour );
	glCtx.uniform1fv( p[u++] , misc );
	for ( var i in ds[3] ) {
		glCtx.uniform3fv( p[u++] , lights[ i ][0] );
		glCtx.uniform1f( p[u++] , lights[ i ][1] );
		glCtx.uniform1f( p[u++] , lights[ i ][2] );
	}
	glCtx.drawArrays( 4 , 0 , 3 );
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
