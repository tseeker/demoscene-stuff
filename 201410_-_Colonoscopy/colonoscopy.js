document.body.innerHTML='<canvas id=a style=position:fixed;top:0;left:0>',
a.width=w=innerWidth,
a.height=h=innerHeight;
for(b in c=a.getContext('webgl'))
	c[b.match(/^..|[A-Z]|1f$/g).join('')]=c[b];
with(c)
	d=crP(),
	a=function(b){
		e=crS(f),
		shS(e,b),
		coS(e),
		atS(d,e)
	},
	a('attribute vec4 p;void main(){gl_Position=p;}',f=35633),
	a('precision highp float;uniform float y;float a(vec3 b){float c=mod(y,4.)-2.,d=b.x==0.?1.570796*sign(b.y):atan(b.y,b.x);c=1.5*exp(-c*c*4.);return 2.5+c+.25*sin(b.z*4.+d*10.)*cos(b.z*1.7)-length(b.xy+cos(b.z*.4+sin(y*.1)*10.)+.2*sin(d*d*c)/(1.+c));}void main(){vec2 c=gl_FragCoord.xy/vec2('+w+'.,'+h+'.)-.5;c.x*='+(w/h)+';vec3 d=normalize(vec3(c,4.)),e=vec3(.5*sin(y),.5*cos(y),y*5.),f=e,g;for(int i=0;i<100;i++)f+=a(f)*d;c=vec2(.01,0.),g=normalize(vec3(a(f+c.xyy)-a(f-c.xyy),2.*c.x,a(f+c.yyx)-a(f-c.yyx))),e-=f,f=normalize(e-.5),gl_FragColor=vec4((pow(clamp(-dot(reflect(f,g),d),0.,1.),3.)*vec3(.6,.35,.35)+vec3(.4,.25,.05)*dot(g,f))*min(1.,6./length(e))*clamp(15.-y*.5,0.,1.)*clamp(y*.33,0.,1.),1.);}',--f),
	enVAA(veAP(biB(f-=670,crB(liP(d))),2,5126,buD(f,new Float32Array([1,4,1,-1,-4,-1]),f+82),f=0,usP(d))),
	d=geUL(d,'y'),
	a=requestAnimationFrame,
	b=function(e){
		f=f?f:e,
		drA(4,un1f(d,.001*(e-f)),3),
		a(b)
	},
	a(b)
