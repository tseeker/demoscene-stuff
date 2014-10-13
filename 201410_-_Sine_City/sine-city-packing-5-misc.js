var USE_SYNTH = 0;

with(Math)S=sin,C=cos,M=max,N=min,P=pow;


f = function(a,b,c){return eval('(function('+a+'){'+b+(b?';':'')+(c?('return '+c):'')+'})')},

getnotefreq=f('a','','.003959503758*P(2,(a-128)/12)'),
mOscillators=[
	f('a','','S(a*6.283184)'),
	f('a','','(a%1)<.5?1:-1'),
	f('a','','2*(a%1)-1'),
	f('a,b','b=(a%1)*4','(b<2)?(b-1):(3-b)')
],

// Vector stuff
vecOp=f('a','','f(\'a,b,c\',\'for(var i=a.length;--i>=0;)\'+a,\'a\')'),
vomNew=f('a','','new Float32Array(a)'),
vecNorm=f('a,b,c','c=Math.sqrt(b[0]*b[0]+b[1]*b[1]+b[2]*b[2])','c?vecScale(a,b,1/c):vecCopy(a,b)'),
vecCross=f('a,b,c','','vecSet(a,b[1]*c[2]-b[2]*c[1],b[2]*c[0]-b[0]*c[2],b[0]*c[1]-b[1]*c[0])'),
vecSet=vecOp('a[i]=arguments[i+1]'),
vecCopy=vecOp('a[i]=b[i]'),
vecSub=vecOp('a[i]=b[i]-c[i]'),
vecScale=vecOp('a[i]=b[i]*c'),


// Shaders
shaderHeader='precision highp %;varying !2 zx;',
shaderFloat=f('a','','a+(a==(a|0)?\'.\':\'\')'),
shaderVec=f('a','','a.map(shaderFloat).join(\',\')');


// Raymarchers

materials = [[[.05],.7,.02,.01],[[.2],.7,.9,.01,5,[.1]],[[1],.5,.4,.02],[[3,0,0],.3,.1,.6,6,[.6,0,0]],[[0,2,0],.9,.5,.4,15,[0,.2,0]],[[3,1.5,0],.95,.6,.9,.3,[.3,.6,0]],[[.1],0,.04,.002,3,[3]],[[0,1.5,2],.9,.3,.4]];
raymarchers = [[100,.025,1,.7,64,.0005,.5,.3,.4,.015,4,2,.75,[0,1,2,3],'y=x+.1*(sin(x.zxy*.17+u4[0]*.5)+sin(x.yzx*.7+u4[0]*1.5))*8.5*(1.+cos(sin(x.z*.1)+x.z*.3)),z=14.-length(y.xy),w=x.x==.0?1.570795*(x.y>.0?1.:-1.):atan(x.y,x.x),q=8.35-u4[8]*1.35,y=!3(9.*(mod(w+x.z*.02,.628)-.314),length(x.xy)-9.,mod(x.z,12.56)-6.28),u=min(length(y.xy)-.25+.1*cos(x.z*8.+u4[0]*.1),length(y.yz)-.5),y=!3(q*(mod(w+x.z*.02,1.256636)-.628318),y.y+9.-q,mod(x.z,62.8318)-31.4159),o=step(u,z)+1.,z=min(u,z),u=length(y)-1.3;if(u<z)z=u,o=3.;y.y+=q-9.,u=yyx(y.yz,8.)-2.;if(u<z)z=u,o=.0;return !2(z,o);',[[.25,0],[.5,.5]]],[6,.00025,1.08,.7,100,.000008,10,.03,2.1,.2,6,.4,5.1,[0,2,5],'z=1.,y=x;for(int i=0;i<7;i++)x=2.*clamp(x,-!3(.58,.9,1.1),!3(.58,.9,1.1))-x,w=max((1.3+u4[9]*.1*cos(u4[0]*.5))/dot(x,x),1.),x*=w,z*=w;w=length(x.xy),e=!2(w-3.,-w*x.z/length(x)-2.*log(1.+.01*a))/abs(z),w=max(e.x,e.y),o=step(e.y,e.x),y+=!3(.1,.3,-.4)*u0-u2+.25*sin(x*1.),e.x=length(y)-.1*u4[8];if(e.x<w)w=e.x,o=2.;return !2(w,o);',[[.05]]],[100,.000025,1,.75,80,.00005,.5,.3,3,.01,4,.75,4.75,[6,0,4],'x.xy*=t(a*.009),w=min(min(yz(x.xzy),yz(x)),yz(x.yzx)),y=mod(x,!3(15.))-!3(7.5),o=step(z=max(length(max(abs(y)-!3(2.5),!3(.0)))-.25,3.5-length(y)),w),w=min(w,z),z=length(y+.1*sin(y*5.5+u4[0]))-2.;if(z<w)w=z,o=2.;return !2(w,o);',[[.05]]],[20,.0005,1,.6,128,.0001,.5,.002,.01,.08,4,.5,1.75,[2,7],'y=x,y.xz=mod(x.xz,8.)-4.,y.yz*=t(u4[8]+.1*a),y.xy*=t(u4[8]*.5+.2*a),y.y*=.9+.1*sin(u4[8]*5.),w=max(length(y)-3.,-min(length(y)-2.8,max(mod(y.y,.8)-.4,-mod(y.y+.4,.8)+.4))),z=x.y+1.+sin(x.x*4.+u4[8]*2.)*sin(x.z+u4[8])*.1,o=clamp(.5+.5*(z-w)/1.,.0,1.),w=mix(z,w,o)-1.*o*(1.-o),y=x,y.xz=mod(y.xz,8.)-4.,y/=1.25+.25*sin(u4[8]*5.),y.xy*=t(u4[8]*5.),y.yz*=t(u4[8]*2.5),z=max(length(y)-1.,.04-length(max(abs(mod(y,.5)-.25)-!3(.15),!3(.0))));return !2(min(w,z),step(z,w));',[[.02],[.05,.5],[.05,.5]]]];

tunMul=1,
R=f('a,b','','a-b+Math.random()*b*2'),
lightFunc=f('a,b','','f(\'a\',\'vecCopy(a[0],camPos),a[1]=\'+a+\',a[2]=\'+b)'),

tun1CamCommon=f('a','vecSet(camPos,-6,0,a=demoTime*6),vecSet(lookAt,misc[1]=1,misc[8]=0,a),vecSet(camUp,0,1,0)'),
desyncFunc=f('a','','f(\'\',\'misc[4]=(\'+(a>0?a:\'\')+\'-stepTime*\'+a+\'/direction[t][6])*R(.875,.125)\')'),
balls1CamFunc=f('a,b,c,d','c=desyncFunc(c),d=f(\'a,b,c,d\',\'vecSet(camPos,misc[2]=misc[8]=0,4,d=demoTime*3),vecSet(lookAt,a,0,d+b),vecSet(camUp,0,0,1),c()\')','function(){d(a,b,c)}'),
balls2CamCommon=f('a','a=demoTime*5,vecSet(camPos,C(demoTime)*12,8,S(demoTime)*12+a),vecSet(lookAt,1,0,a),vecSet(camUp,0,1,0),toNearPlane=2.5,misc[8]=demoTime-direction[43][5]'),
balls2LightFunc=f('a','','f(\'a\',\'vecSet(a[0],\'+a+\'*C(demoTime*2)*5,3,\'+a+\'*S(demoTime*2)*5+demoTime*30),a[1]=1,a[2]=4\')'),
fract1CamCommon=f('','vecSet(camPos,4,2.5+.025*demoTime,6.7),vecSet(lookAt,misc[8]=misc[9]=0,2.5-.05*demoTime,6.7),vecSet(camUp,0,0,1),toNearPlane=3'),
fract1CamFunc=f('a','a=desyncFunc(a)','function(){fract1CamCommon(),a()}'),
fract2CamCommon=f('a,b','vecSet(camPos,5*S(b=demoTime*.2),9*C(demoTime*.41),7.8),vecSet(lookAt,C(b),S(demoTime*.33),camPos[2]-2),vecSet(camUp,0,0,misc[9]=1),misc[8]=a,toNearPlane=3'),

drawText=f('a,b,c','with(twoDCtx)shadowBlur=c2height/5,fillText(a,b,c=c2height/2),shadowBlur=0,strokeText(a,b,c)'),
titleParts=['TheT(ourist)','presents','Sine City'],
titleText=f('a,b,c,d,e,f','drawText(titleParts[a],canvasWidth/15),misc[5]=1-c2rHeight+R(0,b),misc[6]=c,vecSet(textColour,d,e,f)'),
greetingsText=f('','drawText(\'Greetings to ... Mog, Sycop, Tim & Wullon ... Adinpsz ... Alcatraz ... ASD ... Bits\\\'n\\\'Bites ... Brain Control ... Cocoon ... Conspiracy ... Ctrl+Alt+Test ... Fairlight ... Farbrausch ... Kewlers ... LNX ... Loonies ... Mercury ... Popsy Team ... Razor 1911 ... RGBA ... 7th Cube ... Still ... TPOLM ... TRBL ... Umlaut Design ... X-Men ... Youth Uprising ... Everyone here at DemoJS 2014!\',canvasWidth*(1-(demoTime-direction[34][5])/2)),misc[5]=1-c2rHeight+R(.01,.01),vecSet(textColour,misc[6]=1,1,1)'),
squaresCam=f('a,b','a=demoTime-direction[25][5],vecSet(camPos,b=a*10-80,0,0),vecSet(lookAt,b+C(a*.5)*80,S(a*.25)*40,100),vecSet(camUp,0,toNearPlane=2.5,0)'),
squaresCam2=f('a,b','a=demoTime-direction[a][5],vecSet(camPos,0,0,b=a*20-80),vecSet(lookAt,C(a*.5)*80,S(a*.25)*40,100+b),vecSet(camUp,0,1,0),misc[4]=R(a=.0125,a)'),
tunnelLight=f('a','vecSub(a[0],camPos,vecNorm(a[0],lookAt)),a[0][1]-=.5,a[1]=3,a[2]=30'),
tunnelCam=f('a','a=(demoTime-direction[a][5])*30*tunMul,vecSet(camPos,1.1*C(a*.1),S(a*.02),a),a+=5,vecSet(lookAt,-S(a*.05),-.7*C(a*.033),a),vecSet(camUp,0,toNearPlane=2,0)'),
tunnelLightBall=f('a','','f(\'a,b\',\'b=demoTime-direction[\'+a+\'][5],vecSet(a[0],4*S(b*.5)*C(b*.7),3*C(b*1.5),b*30*tunMul+14+16*S(b*3.3)*C(b*.77)),a[1]=1,a[2]=2\')'),

// direction    0<->rows / 1<->rm / 2<->setGlobals / 3<->lights / 4<->updateText / 5<->startTime / 6<->time / 7<->endTime
direction = [
	[
		36 ,
		0 ,
		f('','tun1CamCommon(misc[2]=1-rStepTime*rStepTime*rStepTime,toNearPlane=5)') ,
		a=[lightFunc(3,20)]
	] , [
		18 ,
		0 ,
		f('','tun1CamCommon(misc[2]=0,toNearPlane=5-2.25*rStepTime)') ,
		a
	] , [
		36 ,
		0 ,
		f('','tun1CamCommon(misc[2]=rStepTime,toNearPlane=2.75-2.25*rStepTime)') ,
		a
	] , [
		18 ,
		3 ,
		f('a','vecSet(camPos,0,4,a=demoTime*3),vecSet(lookAt,4,0,a),vecSet(camUp,0,0,1),misc[2]=1-rStepTime*rStepTime*rStepTime,toNearPlane=2.5') ,
		[ lightFunc(.75,8) ]
	] , [
		22 ,
		3 ,
		balls1CamFunc(4,0,0) ,
		a=[lightFunc(1,8)]
	] , [
		22 ,
		3 ,
		balls1CamFunc(2,-2,0) ,
		a
	] , [
		3 ,
		3 ,
		balls1CamFunc( 6 , 0 , -.5 ) ,
		b=[lightFunc(.5,4)]
	] , [
		9 ,
		3 ,
		balls1CamFunc( 6 , 0 , .5 ) ,
		b
	] , [
		3 ,
		3 ,
		balls1CamFunc( 2 , 2 , -.2 ) ,
		a
	] , [
		9 ,
		3 ,
		balls1CamFunc( 2 , 2 , .2 ) ,
		a
	] , [
		3 ,
		3 ,
		balls1CamFunc( 2 , 5 , -.7 ) ,
		a=[ lightFunc(1,2) ]
	] , [
		7 ,
		3 ,
		balls1CamFunc( 2 , 2 , .7 ) ,
		a
	] , [
		9 ,
		3 ,
		f('a','vecSet(camPos,0,4+rStepTime*2,a=demoTime*3),vecSet(lookAt,2,0,a+2),vecSet(camUp,0,0,misc[3]=1),misc[2]=rStepTime') ,
		a
	] , [
		21 ,
		1 ,
		f('','fract1CamCommon(misc[2]=1-rStepTime*rStepTime*rStepTime,misc[3]=1)'),
		a=[f('a','vecCopy(a[0],camPos),a[0][2]+=2,a[1]=1,a[2]=3')]
	] , [
		14 ,
		1 ,
		fract1CamFunc(0) ,
		a
	] , [
		3 ,
		1 ,
		fract1CamFunc(-.4) ,
		a
	] , [
		9 ,
		1 ,
		fract1CamFunc(.4) ,
		a
	] , [
		3 ,
		1 ,
		fract1CamFunc(-.2) ,
		a
	] , [
		9 ,
		1 ,
		fract1CamFunc(.2) ,
		a
	] , [
		12 ,
		1 ,
		f('','fract1CamCommon(misc[4]=(-(6*rStepTime)%1)*R(.875,.125))'),
		a
	] , [
		22 ,
		1 ,
		f('','fract1CamCommon(misc[4]=((30*rStepTime)%1)*R(.925,.075),misc[2]=rStepTime,misc[3]=.4),toNearPlane=3-2.5*M(1,2*rStepTime)'),
		a
	] , [
		3 ,
		1 ,
		b=f('','fract1CamCommon(misc[4]=0,misc[2]=1)'),
		a
	] , [
		12 ,
		1 ,
		b ,
		a,
		f('','titleText(0,.08,1,1,1,1)')
	] , [
		12 ,
		1 ,
		b ,
		a,
		f('','titleText(0,.08,1-rStepTime,1,1,1)')
	] , [
		12 ,
		1 ,
		b ,
		a,
		f('','titleText(1,.08,1-rStepTime,1,1,1)')
	] , [
		20 ,
		2 ,
		f('','squaresCam(misc[2]=1-rStepTime)') ,
		b=[lightFunc(1,30)],
		f('','titleText(2,.04,rStepTime,1,1,1)')
	] , [
		52 ,
		2 ,
		f('','squaresCam(misc[2]=0)'),
		b,
		f('','titleText(2,.04,1,1,1,1)')
	] , [
		12 ,
		2 ,
		f('','squaresCam(misc[2]=1-M(0,rStepTime*2),misc[3]=1)'),
		b,
		f('','titleText(2,.04,1,1-rStepTime,1-rStepTime/2,1-rStepTime)')
	] , [
		12 ,
		2 ,
		f('a','squaresCam(misc[1]=1-rStepTime/2,misc[4]=(1-rStepTime)*.7+R(a=.0125,a))') ,
		b,
		f('','titleText(2,.04,1,0,.5,0)')
	] , [
		9 ,
		2 ,
		f('','squaresCam2(29,misc[1]=(1-rStepTime)/2,misc[2]=1-M(0,rStepTime*1.5)),misc[4]+=misc[1]*.6'),
		b,
		f('','titleText(2,.04,1-rStepTime,0,.5,0)')
	] , [
		69 ,
		2 ,
		f('','squaresCam2(29,misc[1]=0)') ,
		b
	] , [
		11 ,
		2 ,
		f('','squaresCam2(29,misc[2]=rStepTime,misc[3]=.2)'),
		b
	] , [
		11 ,
		0 ,
		f('','tunnelCam(32,misc[2]=1-rStepTime)'),
		b=[ tunnelLight ]
	] , [
		17 ,
		0 ,
		f('','tunnelCam(32,misc[2]=0,misc[4]=(1-rStepTime)*1.2*R(1,.02))') ,
		b
	] , [
		18 ,
		0 ,
		f('','tunnelCam(32,misc[4]=0,misc[8]=rStepTime)') ,
		b ,
		greetingsText
	] , [
		36 ,
		0 ,
		f('','tunnelCam(32,misc[2]=1-N(misc[8]=1,4*rStepTime))'),
		b = [ tunnelLight , tunnelLightBall(32) ],
		greetingsText
	] , [
		33 ,
		0 ,
		f('','tunnelCam(32,misc[2]=rStepTime,misc[3]=.7,misc[4]=-((4*rStepTime)%1)*R(1,.05))'),
		b ,
		greetingsText
	] , [
		9 ,
		1 ,
		f('','fract2CamCommon(misc[4]=0,misc[2]=rStepTime,misc[3]=1)'),
		a,
		greetingsText
	] , [
		20 ,
		1 ,
		f('','fract2CamCommon(rStepTime,misc[2]=0)'),
		a,
		greetingsText
	] , [
		31 ,
		1 ,
		f('','fract2CamCommon(1,misc[2]=1-N(1,5*rStepTime))'),
		a,
		greetingsText
	] , [
		5 ,
		1 ,
		f('','fract2CamCommon(1,misc[2]=1-rStepTime)'),
		a,
		greetingsText
	] , [
		18 ,
		1 ,
		f('','fract2CamCommon(1,misc[2]=1-N(1,5*rStepTime),misc[4]=M(0,1.6*rStepTime-.8)*R(1,.05))'),
		a,
		greetingsText
	] , [
		12 ,
		1 ,
		f('','fract2CamCommon(1,misc[2]=rStepTime,misc[4]=(1-rStepTime)*.8*R(1,.05),misc[3]=.1)'),
		a,
		greetingsText
	] , [
		22 ,
		3 ,
		f('','balls2CamCommon(misc[2]=1-rStepTime,misc[4]=0)'),
		a = [ lightFunc(.6,30) , balls2LightFunc(1),balls2LightFunc(-1) ],
		greetingsText
	] , [
		59 ,
		3 ,
		f('','balls2CamCommon(misc[2]=1-N(1,(12*rStepTime)%4),misc[3]=.8)'),
		a,
		greetingsText
	] , [
		8 ,
		3 ,
		f('','balls2CamCommon(misc[2]=rStepTime,misc[4]=R(0,misc[3]=.1))'),
		a
	] , [
		7 ,
		0 ,
		f('','misc[tunMul=2]=1-rStepTime,tunnelCam(46,misc[4]=R(0,.1),misc[8]=1)'),
		a = [ tunnelLight , tunnelLightBall(46) ]
	] , [
		22 ,
		0 ,
		f('','tunnelCam(46,misc[4]=R(0,.1))'),
		a
	] , [
		10 ,
		0 ,
		f('','tunnelCam(46,misc[4]=R(0,.1+rStepTime*.4)+stepTime*4,misc[2]=rStepTime,misc[3]=1)'),
		a
	] , [
		10 ,
		2 ,
		f('','squaresCam2(49,misc[2]=1-rStepTime),misc[4]=R(0,.5)+(demoTime-direction[48][5])*4'),
		a=[ lightFunc(1,30) ]
	] , [
		40 ,
		2 ,
		f('','squaresCam2(49),misc[4]=R(0,.5)-(demoTime-direction[48][5])*6'),
		a
	] , [
		40 ,
		2 ,
		f('','squaresCam2(49),misc[4]=R(misc[3]=0,.5)+(demoTime-direction[48][5])*8,misc[2]=rStepTime'),
		a
	] , [
		68 ,
		2 ,
		f('','squaresCam2(49,misc[2]=1)'),
		a
	]
];

cmU=vomNew(3),
    cmV=vomNew(3),
    cmW=vomNew(3),
    cd=vomNew(3),
    cu=vomNew(3),
    cm=vomNew(9);


// Main

with(document.body)style.background='black',innerHTML='<canvas id=C1 style=position:fixed;cursor:none></canvas><canvas id=C2 style=display:none>';
twoDCtx = C2.getContext('2d');
glCtx=C1.getContext('webgl');
(window.onresize=f('a,b,c,d,e','with(twoDCtx)a=innerWidth,b=innerHeight,c=(b*1.6)|0,d=(a*.625)|0,glCtx.viewport(0,0,C2.style.width=C2.width=C1.width=canvasWidth=c>a?a:c,C1.height=e=c>a?d:b),c2height=C2.style.height=C2.height=M(e/8,100),c2rHeight=c2height/e,C1.style.left=((a-canvasWidth)/2)|0,C1.style.top=((b-e)/2)|0,shadowColor=\'#ccc\',font=\'normal small-caps bold \'+((c2height/2)|0)+\'px monospace\',fillStyle=\'#111\',strokeStyle=\'#ddd\''))();


for(shaders=[[glCtx.VERTEX_SHADER,shaderHeader+'attribute !2 i;void main(){gl_Position=!4(i,.0,1.),zx=i;}']],programs=[],i=0;i<4;i++)shaders[i+1]=[glCtx.FRAGMENT_SHADER,f('a,b,c,d,e','b=\'uniform \',d=5,c=shaderHeader+b+\'mat3 u0;\'+b+\'sampler2D u1;\'+b+\'!3 u2,u3;\'+b+\'% u4[10];\';for(e in a[15])c+=b+\'!3 u\'+d+++\';\'+b+\'% u\'+d+++\', u\'+d+++\';\';c+=\'const !2 c=!2(1.,-1.)*\'+a[5]+\';% p,z,w,u,o,zy,q,x,a,zz;!2 e,h;!3 l=!3(zx,1.),m,r,s=u2,yx=!3(1.),n=!3(.0),b,v,xxx,xy,d,xx,xz,y;!4 f;% g(% x){return fract(sin(x)*43758.5453);}% yy(!3 x){m=floor(x),y=fract(x),y*=y*(3.-2.*y),z=m.x+m.y*57.+m.z*113.;return mix(mix(mix(g(z),g(z+1.),y.x),mix(g(z+57.),g(z+58.),y.x),y.y),mix(mix(g(z+113.),g(z+114.),y.x),mix(g(z+170.),g(z+171.),y.x),y.y),y.z);}% yyx(!2 x,% a){e=pow(abs(x),!2(a));return pow(e.x+e.y,1./a);}mat2 t(% x){e=!2(cos(x),sin(x));return mat2(-e.x,e.y,e.y,e.x);}% yz(!3 x){return length(mod(x.xy,!2(15.))-!2(7.5))-.5+.05*sin(x.z*9.42477);}!2 k(!3 x,% a){\'+a[14]+\'}void main(){l.y+=mod(u4[4],1.)*2.2;if(l.y>1.){if(l.y<1.2)discard;l.y-=2.2;}l.x*=1.6,r=normalize(l*u0);for(int j=0;j<2;j++){v=r,xxx=s,xy=!3(.0),x=.0,a=\'+a[1]+\';for(int i=0;i<\'+a[4]+\';i++){h=k(s+r*x,x);if(h.x<a||i>\'+a[4]+\'/(j+1)||x>\'+a[0]+\'.)break;x+=h.x*\'+a[3]+\',a*=\'+shaderFloat(a[2])+\';}h.x=x;if(x<\'+a[0]+\'.){d=s+r*x,f=!4(k(d+c.xyy,x).x,k(d+c.yyx,x).x,k(d+c.yxy,x).x,k(d+c.xxx,x).x),xx=normalize(f.x*c.xyy+f.y*c.yyx+f.z*c.yxy+f.w*c.xxx),a=.0,p=\'+a[12]+\';for(int i=1;i<=\'+a[10]+\';i++)x=(%(i)/\'+a[10]+\'.)*\'+shaderFloat(a[11])+\',m=d+xx*x,q=max(.1,1.-clamp(pow(a+=p*(x-k(m,distance(m,s)).x),1.),.0,1.)),p*=.5;\';for(e in d=a[13])b=materials[d[e]],c+=(e>0?\'else \':\'\')+\'if(h.y==\'+e+\'.)xz=\'+(b[4]?(\'mix(!3(\'+shaderVec(b[0])+\'),!3(\'+shaderVec(b[5])+\'),yy(d*\'+shaderFloat(a[6]*b[4])+\'))\'):(\'!3(\'+shaderVec(b[0])+\')\'))+\',w=\'+shaderFloat(b[1])+\',u=\'+b[2]+\',o=\'+b[3]+\';\';d=5,c+=\'v=reflect(r,xx),z=\'+a[9]+\'*h.x,z=clamp(exp(-z*z*z*1.442695),.0,1.),x=clamp((1.+dot(normalize(v+r),r)),.0,1.),a=x*x,zz=o+(1.-o)*x*a*a*(u*.9+.1),y=mix(!3(1.),xz/dot(!3(.299,.587,.114),xz),w),m=!3(.0),zy=exp2(4.+6.*u),\';for(e in b=a[15])c+=\'p=length(b=u\'+d+\'-d),b/=p,p=max(1.,p-u\'+(d+2)+\')*\'+b[e][0]+\',p=1./max(1.,p*p),m+=mix((1.-w)*xz*q,y*pow(max(dot(reflect(r,xx),b),.0),zy)*(zy+2.)/8.,zz)*p*max(dot(b,xx),.0)*!3(u\'+(d+1)+\'),\',d+=3;d=5,c+=\'xy=yx*z*normalize(y)*o*(u*.9+.1)*zz,m=mix(!3(\'+shaderFloat(a[8])+\'),m,z),xxx+=normalize(v)*\'+a[7]+\';}else m=!3(\'+shaderFloat(a[8])+\');\';for(e in b=a[15])(a=b[e][1])?c+=\'b=s-u\'+d+\',p=dot(r,r),a=2.*dot(b,r),x=a*a-4.*p*(dot(b,b)-\'+(a*a)+\'),e=x<.0?!2(-1.):(x=sqrt(x),-.5*!2(a+x,a-x)/p),e=!2(min(e.x,e.y),max(e.x,e.y));if(e.x>.0&&e.y<h.x)m+=u\'+(d+2)+\'*!3(u\'+(d+1)+\')*pow((e.y-e.x)/\'+shaderFloat(a*2)+\',64.);\':0,d+=3','c+=\'n+=m*yx;if(all(lessThan(xy,!3(.01))))break;yx=xy,s=xxx,r=normalize(v);}h=!2(zx.x,l.y)*.5+.5,h.y=(1.-h.y-u4[5])/u4[7],f=texture2D(u1,h),n=max(!3(.0),mix(mix(mix(n,(n.x==n.y&&n.x==n.z)?n:!3(dot(n,!3(.299,.587,.114))),u4[1]),!3(u4[3]),smoothstep(.05,.95,u4[2])),f.rgb*u3,f.a*u4[6])-!3(.004)),x=(l.x+1.)*(l.y+1.)*(u4[0]*10.),gl_FragColor=!4((1.-(smoothstep(.98,1.,yy(l*8.+u4[0]*20.))+smoothstep(.95,1.,yy(l*1.5+u4[0]*10.))))*smoothstep(1.042+.008*cos(u4[0]*40.),.8,yyx(zx,8.))*(1.-(mod((mod(x,13.)+1.)*(mod(x,47.)+1.),.01))*8.)*((.95+.05*cos(u4[0]*41.))*(n*(6.2*n+.5))/(n*(6.2*n+!3(1.7))+!3(.06))+!3(smoothstep(.98,1.,yy(l*8.-u4[0]*40.)))),1.);}\';')(misc=raymarchers[i])],programs[i]=[5+misc[15].length*3,0,i+1];

misc = vomNew(10) , camPos = vomNew(3),lookAt=vomNew(3),camUp=vomNew(3),toNearPlane=0,textColour=vomNew(3) , lights= [[vomNew(3),0,0],[vomNew(3),0,0],[vomNew(3),0,0]];
for ( i in shaders ) {
	var def = shaders[i];
	glCtx.shaderSource( i= shaders[i] = glCtx.createShader( def[0] ) , def[1].replace(/!/g,'vec').replace(/%/g,'float') );
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


mCurrentCol=timeStart = 0,mNumWords=10717272,mMixBuf=new Int32Array(mNumWords);

mainfunc = function(){setTimeout(function(){
requestAnimationFrame(draw=function(time){
	requestAnimationFrame(draw);
	if ( timeStart == 0 ) {
		A.currentTime = 0;
		A.play( );
		timeStart = time;
		previousFrame = timeStart - 33;
	}
	var delta = time - previousFrame;
	demoTime = .001*(time - timeStart);
	if ( delta < 33 ) {
		return;
	}
	previousFrame = time - ( delta % 33 );

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
	for(var i=0;i<3;i++)cm[i*3]=cmU[i],cm[i*3+1]=cmV[i],cm[i*3+2]=cmW[i];

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
},500)};

for(t=i=0;i<53;i++)direction[i][5]=t,t+=(direction[i][6]=direction[i][0]/8),direction[i][7]=t;
t=0;

if ( USE_SYNTH ) {
	synthGen = setInterval(function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v){
		for(d=new Int32Array(mNumWords),f=[[[0,198,128,0,3,192,128,1,0,0,96,128,28,0,0,0,0,2,63,61,13,16,44,8,0,0],[1,2,3,4,5,2,3,4,6,7,1,2,3,4,5,2,3,4,5,2,3,4,1,2,3,8,9],[[[115,,,,,,,,,,,,117,,,,,,,,,,,,113],[12,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,96]],[[115,,,,,,,,,,,,,,,110],[12,,,,,,,,,,,,,,,12,,,,,,,,,,,,,,,,,,,,,115,,,,,,,,,,,,,,,148]],[[115,,,,,,,,,,,,117,,,,,,,,,,,,118],[12,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,96]],[[122,,,,,,,,,,,,,,,123,,,,,115],[12,,,,,,,,,,,,,,,12,,,,,12,,,,,,,,,,,,,,,,115,,,,,,,,,,,,,,,8,,,,,128]],[[118,,,,,,,,,,,,117,,,,,,,,,,,,113],[12,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,96]],[[115],[12,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,255]],[[,,,,,,,,,,,,,,,,118,118,118],[,,,,,,,,,,,,,,,,12,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,128]],[[122,,,,,,,,,,,,,,,123,,,,,115],[12,,,,,,,,,,,,,,,12,,,,,13,12,,,,,,,,,,,,,,,115,,,,,,,,,,,,,,,8,,,,,95,61]],[[],[]]]],[[0,255,116,1,0,255,101,0,0,15,1,4,45,0,13,6,1,2,62,27,60,48,0,0,44,2],[,1,,2,,1,,2,,3,4,4,5,4,5,4,5,4,5,4,5,4,5,4,3,6],[[[,,,,,139,,,139,139,,,,,,139,,,,,,,,139,,,139,139,,,,,139,139,139],[]],[[,,139,139,,,,,139,139,,,,,139,139,,,,,,,,,,139,139,139,,,,,139,139,139],[]],[[,,,139,,,,,139,139,,,,,,139,,,,,139,139,,,,,,139,,,,139,139,139],[]],[[139,,,,139,,139,,,139,,,139,,,,139,,139,,,139,,,139,,,,139,,139,,,139],[]],[[139,,,139,139,,139,,,139,,,139,,,139,139,,139,,,139,,,139,,,139,139,,139,,,139],[]],[[139,,,139,139,,139,,,139,,,139,,,139,139,,139,,,139,139],[]]]],[[0,0,140,0,0,0,140,0,0,128,4,10,34,0,187,5,0,1,239,135,34,19,108,8,8,4],[,,1,,1,,3,,1,3,2,2,2,2,2,3,2,3,2,3,2,3,2,3,1],[[[,,,,,,,,,,127,,,,,,,,,,,,127,,,,,,,,,,,,127],[]],[[,,,139,,,,,,139,139,,,,,139,,,,,,139,139,,,,,139,,,,,139,,139],[]],[[,,127,,,,,,,,127,,,,127,,,,,,,,127,,,,127,,,,,,,,127],[]]]],[[1,192,128,0,3,201,128,0,0,93,5,6,58,3,195,6,1,3,35,63,14,17,11,10,61,6],[,,,,1,2,3,4,5,6,7,5,8,9,10,11,8,9,10,11,12,13,14,15,16],[[[,,,,,,,,147,146,145,,,,,,,,,,145,147,146,,,,,,,,,,149,148,147],[]],[[,,,,,,151,151,151,,,,,,,146,142,138,,,,,,,,,,,,,,,147,150,147],[]],[[,,146,,,146,,,,,,,,,147,146,145,,,,,,,,,,146,145,142,,,142,,,142],[]],[[,,141,,,,,,,,,,,,141,140,139,,,146,,,146,,,127],[]],[[,139,,151,,,,,,,,,,151,,139,,,,,,,,,,139,,151],[]],[[,139,,151,150,149,,,,,,,,139,,149,148,147,,,,,,,,139,,,146,,,145,,,144],[]],[[,139,,,139,142,,,142,144,146,,144,,,,146,147,,,147,146,141,,137,,,,142,141,,141,,137],[]],[[139,,127,,142,,,130,,,144,142,141,,129,,141,,,144,,,141,144,142,,,,149,,,146,,,151],[]],[[,149,,149,,146,144,142,,,141,,142,,,139,,,,151,147,,,,146,147,,144,146,,142,144,141,146],[]],[[,,,,,,,,147,146,145,,,,,141,144,147,146,,144,,137,,,144,146,142,144,,,142,144,141,146],[]],[[,146,,151,,146,,,,144,142,144,146,,,,142,,,,,139,,,,,151,146,139,144,139,142,141,142,151],[]],[[,,147,,,149,146,,,142,,142,141,,,144,,144,,,144,146,142,144,142,,,,151,150,149,,137,,149],[]],[[,151,,,147,151,,,146,151,,,,,144,151,,149,147,149,151,,146,,,144,143,142,,,139,,151,139],[]],[[,,134,,,134,,,134,,,146,144,,,141,144,,,146,147,146,,,144,,139,140,141,,,153,,,141],[]],[[,142,,151,,,142,143,144,,,,151,,,139,,,137,,149,,137,,,,125,,,141,142,141,,,146],[]],[[139,,127,139,,127,139,,127,139,127],[]]]],[[2,160,128,1,0,160,128,0,1,60,4,7,41,0,60,4,1,3,14,0,35,32,31,12,89,1],[,,,,,,,,,,,,1,2,1,2,1,2,1,2,1,2,1,2,1,3],[[[,,139,,,,,,,,,,,,139,,,,,,,,,,,,139,,,,,139,139,,,139],[]],[[,,139,,,151,,,139,,,151,,,139,,,151,,,139,,,151,,,139,,,151,,,146,146,146,146],[]],[[,,139,,,151,,,139,,,151,,,139,,139,139,139,139,127],[]]]],[[2,100,128,0,3,201,128,0,0,0,0,6,29,0,195,6,1,3,28,229,119,77,147,6,61,2],[,,,,,,,,,6,1,2,3,4,5,2,3,4,1,2,3,4,1,2,3,7],[[[115,115,115,115,115,115,115,115,115,115,115,115,117,117,117,117,117,117,117,117,117,117,117,117,113,113,113,113,113,113,113,113,113,113,113,113],[]],[[115,115,115,115,115,115,115,115,115,115,115,115,115,115,115,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110],[]],[[115,115,115,115,115,115,115,115,115,115,115,115,117,117,117,117,117,117,117,117,117,117,117,117,118,118,118,118,118,118,118,118,118,118,118,118],[]],[[110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,111,111,111,111,111,115,115,115,115,115,115,115,115,115,115,115,115,115,115,115,115],[]],[[118,118,118,118,118,118,118,118,118,118,118,118,117,117,117,117,117,117,117,117,117,117,117,117,113,113,113,113,113,113,113,113,113,113,113,113],[]],[[,,,,,,,,,,,,,,,,,,130,,130,,130,,130,,130,,130,118,130,118,130,118,130,118],[,,,,,,,,,,,,,,,,,,26,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,2]],[[110,122,,122,134,,110,122,,122,134,,110,122,,111,123,,111,123,115,127,139,127,115],[,,,,,,,,,,,,,,,,,,,,26,25,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,8,147]]]],[[2,100,128,0,3,201,128,0,0,0,5,6,58,0,195,6,1,2,135,0,0,32,147,6,121,6],[],[]],[[2,100,128,0,3,201,128,0,0,0,5,6,58,0,195,6,1,2,135,0,0,32,147,6,121,6],[],[]]][mCurrentCol],o=[],g=h=m=p=0;p<=26;p++)for(b=f[1][p],a=0;a<36;a++){((e=b?f[2][b-1][1][a]:0)?((f[0][e-1]=f[2][b-1][1][a+36]||0),e<14?(o=[]):0):0),c=(p*36+a)*5513;for(j=0;j<4;j++)if(n=b?f[2][b-1][0][a+j*36]:0){if(!o[n])for(q=f[0][10],r=f[0][11],s=f[0][12],t=getnotefreq(n+f[0][2]-128),l=getnotefreq(n+f[0][6]-128)*(1+.0008*f[0][7]),u=v=0,q*=q*4,r*=r*4,s*=s*4,o[n]=new Int32Array(q+r+s),k=0;k<q+r+s;k++)e=k<q?(k/q):(1-(k<q+r?0:((k-q-r)/s))),o[n][k]=(80*(mOscillators[f[0][0]](u+=t*(f[0][3]?(e*e):1))*f[0][1]+mOscillators[f[0][4]](v+=l*(f[0][8]?(e*e):1))*f[0][5]+R(0,1)*f[0][9])*e)|0;for(k=0,i=c*2;k<o[n].length;k++,i+=2)d[i]+=o[n][k]}q=f[0][20]*1e-5,r=f[0][24]/255,s=f[0][25]*5513;for(j=0;j<5513;j++)(((n=e=d[k=(c+j)*2])||m)?(t=1.5*S(f[0][18]*.00307999186353015873*(f[0][16]?(mOscillators[f[0][13]](P(2,f[0][15]-9)*k/5513)*f[0][14]/512+.5):1)),g+=t*h,l=(1-f[0][19]/255)*(e-h)-g,h+=t*l,e=f[0][17]==3?h:f[0][17]==1?l:g,q?(e*=q,e=(e<1?e>-1?mOscillators[0](e*.25):-1:1)/q):0,e*=f[0][21]/32,m=e*e>1e-5,t=S(6.283184*P(2,f[0][23]-9)*k/5513)*f[0][22]/512+.5,n=e*(1-t),e*=t):0),(k>=s?(n+=d[k-s+1]*r,e+=d[k-s]*r):0),mMixBuf[k]+=(d[k]=n|0),mMixBuf[k+1]+=(d[k+1]=e|0)}
		if(++mCurrentCol==8)for(clearInterval(synthGen),s=(f=String.fromCharCode).apply(String,[82,73,70,70,168,16,71,1,87,65,86,69,102,109,116,32,16,0,0,0,1,0,2,0,68,172,0,0,16,177,2,0,4,0,16,0,100,97,116,97,132,16,71,1]),i=0;i<mNumWords||(((A=document.createElement('audio')).src='data:audio/wav;base64,'+btoa(s),A.oncanplaythrough=mainfunc)&&0);i++)e=mMixBuf[i],e=e<-32767?-32767:(e>32767?32767:e),s+=f(e&255,(e>>8)&255)
	}, 0);
} else {
	A = document.createElement("audio");
	A.oncanplaythrough=mainfunc;
	A.src= 'music.ogg';
}
