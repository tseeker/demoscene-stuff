f=function(a,b,c){return eval('(function('+a+'){'+b+(b?';':'')+(c?('return '+c):'')+'})')},

yz=f('a','','.003959503758*P(2,(a-128)/12)'),$=[f('a','','S(a*6.283184)'),f('a','','(a%1)<.5?1:-1'),f('a','','2*(a%1)-1'),f('a,b','b=(a%1)*4','(b<2)?(b-1):(3-b)')],e=f('a','','f(\'a,b,c\',\'for(var i=a.length;--i>=0;)\'+a,\'a\')'),zw=f('a,b,c','c=Math.sqrt(b[0]*b[0]+b[1]*b[1]+b[2]*b[2])','c?$f(a,b,1/c):yf(a,b)'),fw=f('a,b,c','','y(a,b[1]*c[2]-b[2]*c[1],b[2]*c[0]-b[0]*c[2],b[0]*c[1]-b[1]*c[0])'),y=e('a[i]=arguments[i+1]'),yf=e('a[i]=b[i]'),_f=e('a[i]=b[i]-c[i]'),$f=e('a[i]=b[i]*c'),e=f('a','','new Float32Array(a)'),R=f('a,b','','a-b+Math.random()*b*2');

with(Math)S=sin,C=cos,M=max,N=min,P=pow;with(document.body)style.background='black',innerHTML='<canvas id=C1 style=position:fixed;cursor:none></canvas><canvas id=C2 style=display:none>';for(i in zx=C1.getContext('webgl'))zx[i.match(/^..|[A-Z]|\d[fi]v?$/g).join('')]=zx[i];yx='precision highp float;varying vec2 zx;',w=f('a','','a+(a==(a|0)?\'.\':\'\')'),v=f('a','','a.map(w).join(\',\')');

for(h=[[35633,yx+'attribute vec2 i;void main(){gl_Position=vec4(i,.0,1.),zx=i;}']],zy=[],i=0;i<4;i++)h[i+1]=[35632,f('a,b,c,d,e','b=\'uniform \',d=5,c=yx+b+\'mat3 u0;\'+b+\'sampler2D u1;\'+b+\'vec3 u2,u3;\'+b+\'float u4[10];\';for(e in a[15])c+=b+\'vec3 u\'+d+++\';\'+b+\'float u\'+d+++\', u\'+d+++\';\';c+=\'const vec2 c=vec2(1.,-1.)*\'+a[5]+\';float p,z,w,u,o,zy,q,x,a,zz;vec2 e,h;vec3 l=vec3(zx,1.),m,r,s=u2,yx=vec3(1.),n=vec3(.0),b,v,xxx,xy,d,xx,xz,y;vec4 f;float g(float x){return fract(sin(x)*43758.5453);}float yy(vec3 x){vec3 m=floor(x),y=fract(x);y*=y*(3.-2.*y);float z=m.x+m.y*57.+m.z*113.;return mix(mix(mix(g(z),g(z+1.),y.x),mix(g(z+57.),g(z+58.),y.x),y.y),mix(mix(g(z+113.),g(z+114.),y.x),mix(g(z+170.),g(z+171.),y.x),y.y),y.z);}float yyx(vec2 x,float a){e=pow(abs(x),vec2(a));return pow(e.x+e.y,1./a);}mat2 t(float x){e=vec2(cos(x),sin(x));return mat2(-e.x,e.y,e.y,e.x);}float yz(vec3 x){return length(mod(x.xy,vec2(15.))-vec2(7.5))-.5+.05*sin(x.z*9.42477);}vec2 k(vec3 x,float a){\'+a[14]+\'}void main(){l.y+=mod(u4[4],1.)*2.2;if(l.y>1.){if(l.y<1.2)discard;l.y-=2.2;}l.x*=1.6,r=normalize(l*u0);for(int j=0;j<2;j++){v=r,xxx=s,xy=vec3(.0),x=.0,a=\'+a[1]+\';for(int i=0;i<\'+a[4]+\';i++){h=k(s+r*x,x);if(h.x<a||i>\'+a[4]+\'/(j+1)||x>\'+a[0]+\'.)break;x+=h.x*\'+a[3]+\',a*=\'+w(a[2])+\';}h.x=x;if(x<\'+a[0]+\'.){d=s+r*x,f=vec4(k(d+c.xyy,x).x,k(d+c.yyx,x).x,k(d+c.yxy,x).x,k(d+c.xxx,x).x),xx=normalize(f.x*c.xyy+f.y*c.yyx+f.z*c.yxy+f.w*c.xxx),a=.0,p=\'+a[12]+\';for(int i=1;i<=\'+a[10]+\';i++)x=(float(i)/\'+a[10]+\'.)*\'+w(a[11])+\',m=d+xx*x,q=max(.1,1.-clamp(pow(a+=p*(x-k(m,distance(m,s)).x),1.),.0,1.)),p*=.5;\';for(e in d=a[13])b=[[[.05],.7,.02,.01],[[.2],.7,.9,.01,5,[.1]],[[1],.5,.4,.02],[[2,0,0],.3,.1,.6,5,[.1,0,0]],[[0,2,0],.7,.9,.8,15,[0,.2,0]],[[3,1.5,0],.95,.6,.9,.3,[.3,.6,0]],[[.1],0,.04,.002,3,[3]],[[0,1.5,2],.5,.5,.7]][d[e]],c+=(e>0?\'else \':\'\')+\'if(h.y==\'+e+\'.)xz=\'+(b[4]?(\'mix(vec3(\'+v(b[0])+\'),vec3(\'+v(b[5])+\'),yy(d*\'+w(a[6]*b[4])+\'))\'):(\'vec3(\'+v(b[0])+\')\'))+\',w=\'+w(b[1])+\',u=\'+b[2]+\',o=\'+b[3]+\';\';d=5,c+=\'v=reflect(r,xx),z=\'+a[9]+\'*h.x,z=clamp(exp(-z*z*z*1.442695),.0,1.),x=clamp((1.+dot(normalize(v+r),r)),.0,1.),a=x*x,zz=o+(1.-o)*x*a*a*(u*.9+.1),y=mix(vec3(1.),xz/dot(vec3(.299,.587,.114),xz),w),m=vec3(.0),zy=exp2(4.+6.*u),\';for(e in b=a[15])c+=\'p=length(b=u\'+d+\'-d),b/=p,p=max(1.,p-u\'+(d+2)+\')*\'+b[e][0]+\',p=1./max(1.,p*p),m+=mix((1.-w)*xz*q,y*pow(max(dot(reflect(r,xx),b),.0),zy)*(zy+2.)/8.,zz)*p*max(dot(b,xx),.0)*vec3(u\'+(d+1)+\'),\',d+=3;d=5,c+=\'xy=yx*z*normalize(y)*o*(u*.9+.1)*zz,m=mix(vec3(\'+w(a[8])+\'),m,z),xxx+=normalize(v)*\'+a[7]+\';}else m=vec3(\'+w(a[8])+\');\';for(e in b=a[15])(j=b[e][1])?c+=\'b=s-u\'+d+\',p=dot(r,r),a=2.*dot(b,r),x=a*a-4.*p*(dot(b,b)-\'+(j*j)+\'),e=x>.0?(x=sqrt(x),-.5*vec2(a+x,a-x)/p):vec2(-1.),e=vec2(min(e.x,e.y),max(e.x,e.y));if(e.x>.0&&e.y<h.x)z=\'+a[9]+\'*e.x,m+=clamp(exp(-z*z*z*1.442695),.0,1.)*u\'+(d+2)+\'*vec3(u\'+(d+1)+\')*pow((e.y-e.x)/\'+w(j*2)+\',64.)*yy((u2+r*e.x)*3.);\':0,d+=3','c+=\'n+=m*yx;if(all(lessThan(xy,vec3(.01))))break;yx=xy,s=xxx,r=normalize(v);}h=vec2(zx.x,l.y)*.5+.5,h.y=(1.-h.y-u4[5])/u4[7],f=texture2D(u1,h),n=max(vec3(.0),mix(mix(mix(n,(n.x==n.y&&n.x==n.z)?n:vec3(dot(n,vec3(.299,.587,.114))),u4[1]),vec3(u4[3]),smoothstep(.05,.95,u4[2])),f.rgb*u3,f.a*u4[6])-vec3(.004)),x=(l.x+1.)*(l.y+1.)*(u4[0]*10.),gl_FragColor=vec4((1.-(smoothstep(.98,1.,yy(l*8.+u4[0]*20.))+smoothstep(.95,1.,yy(l*1.5+u4[0]*10.))))*smoothstep(1.042+.008*cos(u4[0]*40.),.8,yyx(zx,8.))*(1.-(mod((mod(x,13.)+1.)*(mod(x,47.)+1.),.01))*8.)*((.95+.05*cos(u4[0]*41.))*(n*(6.2*n+.5))/(n*(6.2*n+vec3(1.7))+vec3(.06))+vec3(smoothstep(.98,1.,yy(l*8.-u4[0]*40.)))),1.);}\';')(x=[[100,.025,1,.7,64,.0005,.5,.3,.4,.015,4,2,.75,[0,1,2,3],'y=x+.1*(sin(x.zxy*.17+u4[0]*.5)+sin(x.yzx*.7+u4[0]*1.5))*8.5*(1.+cos(sin(x.z*.1)+x.z*.3)),z=14.-length(y.xy),w=x.x==.0?1.570795*(x.y>.0?1.:-1.):atan(x.y,x.x),q=8.35-u4[8]*1.35,y=vec3(9.*(mod(w+x.z*.02,.628)-.314),length(x.xy)-9.,mod(x.z,12.56)-6.28),u=min(length(y.xy)-.25+.1*cos(x.z*8.+u4[0]*.1),length(y.yz)-.5),y=vec3(q*(mod(w+x.z*.02,1.256636)-.628318),y.y+9.-q,mod(x.z,62.8318)-31.4159),o=step(u,z)+1.,z=min(u,z),u=length(y)-1.3;if(u<z)z=u,o=3.;y.y+=q-9.,u=yyx(y.yz,8.)-2.;if(u<z)z=u,o=.0;return vec2(z,o);',[[.25,0],[.1,2.1]]],[6,.000125,1.08,.7,100,.000008,10,.03,2.1,.2,6,.4,5.1,[0,2,5],'z=1.,y=x;for(int i=0;i<7;i++)x=2.*clamp(x,-vec3(.58,.9,1.1),vec3(.58,.9,1.1))-x,w=max((1.3+u4[9]*.1*cos(u4[0]*.5))/dot(x,x),1.),x*=w,z*=w;w=length(x.xy),e=vec2(w-3.,-w*x.z/length(x)-2.*log(1.+.01*a))/abs(z),w=max(e.x,e.y),o=step(e.y,e.x),y+=vec3(.1,.3,-.4)*u0-u2+.25*sin(x*1.),e.x=length(y)-.1*u4[8];if(e.x<w)w=e.x,o=2.;return vec2(w,o);',[[.05]]],[100,.000025,1,.75,80,.0005,.5,.3,3,.01,4,.75,4.75,[6,0,4],'x.xy*=t(a*.009),w=min(min(yz(x.xzy),yz(x)),yz(x.yzx)),y=mod(x,vec3(15.))-vec3(7.5),o=step(z=max(length(max(abs(y)-vec3(2.5),vec3(.0)))-.25,3.5-length(y)),w),w=min(w,z),z=length(y+.1*sin(y*5.5+u4[0]))-2.;if(z<w)w=z,o=2.;return vec2(w,o);',[[.05]]],[20,.0005,1,.6,128,.0001,.5,.002,.01,.08,4,.5,1.75,[2,7],'y=x,y.xz=mod(x.xz,8.)-4.,y.yz*=t(u4[8]+.1*a),y.xy*=t(u4[8]*.5+.2*a),y.y*=.9+.1*sin(u4[8]*5.),w=max(length(y)-3.,-min(length(y)-2.8,max(mod(y.y,.8)-.4,-mod(y.y+.4,.8)+.4))),z=x.y+1.+sin(x.x*4.+u4[8]*2.)*sin(x.z+u4[8])*.1,o=clamp(.5+.5*(z-w)/1.,.0,1.),w=mix(z,w,o)-1.*o*(1.-o),y=x,y.xz=mod(y.xz,8.)-4.,y/=1.25+.25*sin(u4[8]*5.),y.xy*=t(u4[8]*5.),y.yz*=t(u4[8]*2.5),z=max(length(y)-1.,.04-length(max(abs(mod(y,.5)-.25)-vec3(.15),vec3(.0))));return vec2(min(w,z),step(z,w));',[[.02],[.05,1.5],[.05,1.5]]]][i])],zy[i]=[5+x[15].length*3,0,i+1];

with(zx){for(i in h)j=h[i],shS(i=h[i]=crS(j[0]),j[1]),coS(i),geSP(i,35713);for(i in zy){w=crP(),m=zy[i],x=m.shift();for(j in m)atS(w,h[m[j]]);liP(w),m=[];for(;x--;)m[x]=geUL(w,'u'+x);zy[i]=[w,m]}biB(i=34962,crB()),buD(i,e([1,4,1,-1,-4,-1]),35044),biT(i=3553,crT()),teP(i,j=10240,k=9728),teP(i,++j,k),teP(i,++j,k=33071),teP(i,++j,k),teID(i,0,j=6408,j,5121,C2)}

w=f('a,b','','f(\'a\',\'yf(a[0],p),a[1]=\'+a+\',a[2]=\'+b)'),v=f('a','','f(\'\',\'x[4]=(\'+(a>0?a:\'\')+\'-xz*\'+a+\'/h[t][6])*R(.875,.125)\')'),q=f('a,b,c,d','c=v(c),d=f(\'a,b,c,d\',\'y(p,x[2]=x[8]=0,4,d=f*3),y(s,a,0,d+b),y(n,0,0,1),c()\')','function(){d(a,b,c)}'),u=f('a','','f(\'a\',\'y(a[0],\'+a+\'*C(\'+a+\'*f*2)*5,4.25,\'+a+\'*S(\'+a+\'*f*2.5)*5+D(44)*10),a[1]=1.5+S(f+\'+a+\'),a[2]=8+2*S(f+\'+a+\')\')'),r=f('a','a=v(a)','function(){r(),a()}'),o=f('a','_f(a[0],p,zw(a[0],s)),a[0][1]-=.5,a[1]=3,a[2]=30'),m=f('','v(\'Greetings to ... Mog, Sycop, Tim & Wullon ... Adinpsz ... Alcatraz ... ASD ... Bits\\\'n\\\'Bites ... Brain Control ... Cocoon ... Conspiracy ... Ctrl+Alt+Test ... Fairlight ... Farbrausch ... Kewlers ... LNX ... Loonies ... Mercury ... Popsy Team ... Razor 1911 ... RGBA ... 7th Cube ... Still ... TPOLM ... TRBL ... Umlaut Design ... X-Men ... Youth Uprising ... Everyone here at DemoJS 2014!\',yw*(1-D(35)/3)),x[5]=1-zf+R(.01,.01),y(fz,x[6]=1,1,1)'),g=f('a','','f(\'a,b\',\'b=D(\'+a+\'),y(a[0],4*S(b*.5)*C(b*.7),3*C(b*1.5),b*30*fx+14+16*S(b*3.3)*C(b*.77)),a[1]=3+3*(f%1),a[2]=16\')'),

h = [
	[ 36 , 0 , f('','w(x[2]=1-z*z*z,_=5)') , a=[w(3,20)] ],
	[ 18 , 0 , f('','w(x[2]=0,_=5-2.25*z)') , a ],
	[ 36 , 0 , f('','w(x[2]=z,_=2.75-2.25*z)') , a ],
	[ 18 , 3 , f('a','y(p,0,4,a=f*3),y(s,4,0,a),y(n,0,0,1),x[2]=1-z*z*z,_=2.5') , [ w(.75,8) ] ],
	[ 22 , 3 , q(4,0,0) , a=[w(1,8)] ],
	[ 22 , 3 , q(2,-2,0) , a ],
	[ 3 , 3 , q( 6 , 0 , -.5 ) , b=[w(.5,4)] ],
	[ 9 , 3 , q( 6 , 0 , .5 ) , b ],
	[ 3 , 3 , q( 2 , 2 , -.2 ) , a ],
	[ 9 , 3 , q( 2 , 2 , .2 ) , a ],
	[ 3 , 3 , q( 2 , 5 , -.7 ) , a=[ w(1,2) ] ],
	[ 7 , 3 , q( 2 , 5 , .7 ) , a ],
	[ 9 , 3 , f('a','y(p,0,4+z*8,a=f*3),y(s,2,0,a+5),y(n,0,0,x[3]=1),x[2]=z') , a ],
	[ 23 , 1 , f('','r(x[2]=1-z*z*z,x[3]=1)'), a=[f('a','yf(a[0],p),a[0][2]+=2,a[1]=1,a[2]=3')] ],
	[ 3 , 1 , r(-.9) , a ],
	[ 9 , 1 , r(.9) , a ],
	[ 3 , 1 , r(-.3) , a ],
	[ 9 , 1 , r(.3) , a ],
	[ 3 , 1 , r(-.6) , a ],
	[ 9 , 1 , r(.6) , a ],
	[ 12 , 1 , f('','r(x[4]=(-(6*z)%1)*R(.875,.125))'), a ],
	[ 22 , 1 , f('','r(x[4]=((30*z)%1)*R(.925,.075),x[2]=z,x[3]=.4),_=3-2.5*M(1,2*z)'), a ],
	[ 3 , 1 , b=f('','r(x[4]=0,x[2]=1)'), a ],
	[ 12 , 1 , b , a, f('','m(0,.08,1,1,1,1)') ],
	[ 12 , 1 , b , a, f('','m(0,.08,1-z,1,1,1)') ],
	[ 12 , 1 , b , a, f('','m(1,.08,1-z,1,1,1)') ],
	[ 20 , 2 , f('','o(x[2]=1-z)') , b=[w(1,30)], f('','m(2,.04,z,1,1,1)') ],
	[ 52 , 2 , f('','o(x[2]=0)'), b, f('','m(2,.04,1,1,1,1)') ],
	[ 12 , 2 , f('','o(x[2]=1-M(0,z*2),x[3]=1)'), b, f('','m(2,.04,1,1-z,1-z/2,1-z)') ],
	[ 12 , 2 , f('a','o(x[1]=1-z/2,x[4]=(1-z)*.7+R(a=.0125,a))') , b, f('','m(2,.04,1,0,.5,0)') ],
	[ 9 , 2 , f('','g(30,x[1]=(1-z)/2,x[2]=1-M(0,z*1.5),x[4]+=x[1]*.6)'), b, f('','m(2,.04,1-z,0,.5,0)') ],
	[ 69 , 2 , f('','g(30,x[1]=0)') , b ],
	[ 11 , 2 , f('','g(30,x[2]=z,x[3]=.2)'), b ],
	[ 11 , 0 , f('','e(33,x[2]=1-z)'), b=[ o ] ],
	[ 17 , 0 , f('','e(33,x[2]=0,x[4]=(1-z)*1.2*R(1,.02))') , b ],
	[ 18 , 0 , f('','e(33,x[4]=0,x[8]=z)') , b , m ],
	[ 36 , 0 , f('','e(33,x[2]=1-N(x[8]=1,4*z))'), b = [ o , g(33) ], m ],
	[ 33 , 0 , f('','e(33,x[2]=z,x[3]=.7,x[4]=-((4*z)%1)*R(1,.05))'), b , m ],
	[ 9 , 1 , f('','u(x[4]=0,x[2]=1-z,x[3]=1)'), a, m ],
	[ 20 , 1 , f('','u(z,x[2]=0)'), a, m ],
	[ 31 , 1 , f('','u(1,x[2]=1-N(1,5*z))'), a, m ],
	[ 5 , 1 , f('','u(1,x[2]=1-z)'), a, m ],
	[ 18 , 1 , f('','u(1,x[2]=1-N(1,5*z),x[4]=M(0,1.6*z-.8)*R(1,.05))'), a, m ],
	[ 12 , 1 , f('','u(1,x[2]=z,x[4]=(1-z)*.8*R(1,.05),x[3]=.1)'), a, m ],
	[ 22 , 3 , f('','q(x[2]=1-z,x[4]=0)'), b = [ w(.6,30) , u(1),u(-1.5) ], m ],
	[ 59 , 3 , f('','q(x[2]=1-N(1,(12*z)%4),x[3]=.8)'), b, m ],
	[ 8 , 3 , f('','q(x[2]=z,x[4]=R(0,x[3]=.1))'), b ],
	[ 7 , 0 , f('','x[fx=2]=1-z,e(46,x[4]=R(0,.1),x[8]=1)'), c = [ o , g(47) ] ],
	[ 22 , 0 , f('','e(47,x[4]=R(0,.1))'), c ],
	[ 10 , 0 , f('','e(47,x[4]=R(0,.1),x[2]=z,x[3]=1)'), c ],
	[ 10 , 1 , f('','u(1,x[2]=1-z,x[4]=R(0,.1))'), a ] ,
	[ 4 , 1 , f('','u(1,x[2]=1-((z*4)%1),x[4]=R(0,.1))'), a ] ,
	[ 2 , 1 , f('','u(1,x[4]=R(x[2]=0,.1))'), a ] ,
	[ 36 , 1 , f('','u(1,x[2]=1-N(1,2*((z*3)%1)),x[4]=R(0,.1+.1*z)),_=3+2*z'), a ] ,
	[ 12 , 2 , f('','g(54,x[2]=1-((z*4)%1))'+(b=',x[4]=R(0,.2)+D(54)*2')), a=[ w(1,30) ] ],
	[ 6 , 2 , f('','g(54,x[2]=1-((z*6)%1))'+b), a ],
	[ 30 , 2 , f('','g(54,x[1]=N(1,z*2),x[2]=z,x[3]=0)'+b), a ],
	[ 21 , 2 , f('','g(54,x[2]=1)'), a ]
];

fx=1,x=e(10),p=e(3),s=e(3),n=e(3),fz=e(3),ff=e(3),fy=e(3),yy=e(3),xf=e(9),xw=[[e(3),0,0],[e(3),0,0],[e(3),0,zz=0]],_=new Int32Array(xz=10717272),w=f('a','y(p,-6,0,a=f*6),y(s,x[1]=1,x[8]=0,a),y(n,0,1,0)'),q=f('a','a=D(44)*10,y(p,C(f)*12,9.5,S(f)*12+a),y(s,1,1,a),y(n,0,_=2.5,0),x[8]=D(44)'),r=f('','y(p,4,2.5+.025*f,6.7),y(s,x[8]=x[9]=0,2.5-.05*f,6.7),y(n,0,0,1),_=3'),u=f('a,b','b=fx*f,y(p,5*S(b*.2),9*C(b*.41),7.8),y(s,C(b*.2),S(b*.33),p[2]-2),y(n,0,0,x[9]=1),x[8]=a,_=3'),v=f('a,b,c','with(yx)shadowBlur=ww/5,fillText(a,b,c=ww/2),shadowBlur=0,strokeText(a,b,c)'),m=f('a,b,c,d,e,f','v([\'TheT(ourist)\',\'presents\',\'Sine City\'][a],yw/15),x[5]=1-zf+R(0,b),x[6]=c,y(fz,d,e,f)'),o=f('a,b','a=D(26),y(p,b=a*10-80,0,0),y(s,b+C(a*.5)*80,S(a*.25)*40,100),y(n,0,_=2.5,0)'),g=f('a,b','a=D(a)*fx,y(p,0,0,b=a*20-80),y(s,C(a*.5)*80,S(a*.25)*40,100+b),y(n,0,_=2,0),x[4]=R(a=.0125,a)'),e=f('a','a=D(a)*fx*30,y(p,1.1*C(a*.1),S(a*.02)-2,a),a+=5,y(s,-S(a*.05),-.7*C(a*.033)-2,a),y(n,0,_=2/fx,0)'),K=f('a,b','b=100/3,J(K),zz?0:(A.play(),zz=a,$=zz-b),yz=a-$,f=.001*(a-zz);if(yz>b){$=a-(yz%b),j=h[t];while(j&&j[7]<f)j=h[++t];if(j){x[0]=f,x[7]=zf,xz=f-j[5],z=xz/j[6];with(zx){j[4]?(yx.clearRect(0,0,yw,100),teID(3553,j[4](),k=6408,k,5121,C2)):0,j[2](),zw(yy,_f(yy,s,p)),zw(ff,fw(ff,n,yy)),zw(fy,fw(fy,yy,ff)),$f(yy,yy,_);for(i=0;i<3;i++)xf[i*3]=ff[i],xf[i*3+1]=fy[i],xf[i*3+2]=yy[i];for(i in j[3])j[3][i](xw[i]);f=zy[j[1]],usP(f[k=0]),f=f[1],veAP(enVAA(unM3fv(f[k++],un1i(f[k++],un3fv(f[k++],p)),xf)),2,5126,un3fv(f[k++],fz),8,un1fv(f[k++],x));for(i in j[3])un3fv(f[k++],xw[i][0]),un1f(f[k++],xw[i][1]),un1f(f[k++],xw[i][2]);drA(4,0,3)}}}'),L=f('','setTimeout(function(){(J=requestAnimationFrame)(K)},1500)'),D=f('a','','f-h[a][5]');

for(t=i=0;i<58;i++)h[i][5]=t,t+=(h[i][6]=h[i][0]/8),h[i][7]=t;

t=0,yx=C2.getContext('2d'),(onresize=f('a,b,c,d,e','with(yx)a=innerWidth,b=innerHeight,c=(b*1.6)|0,d=(a*.625)|0,zx.vi(0,0,C2.style.width=C2.width=C1.width=yw=c>a?a:c,C1.height=e=c>a?d:b),ww=C2.style.height=C2.height=M(e/8,100),zf=ww/e,C1.style.left=((a-yw)/2)|0,C1.style.top=((b-e)/2)|0,shadowColor=\'#ccc\',font=\'normal small-caps bold \'+((ww/2)|0)+\'px monospace\',fillStyle=\'#111\',strokeStyle=\'#ddd\''))(),

I=setInterval(f('a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,u,v,w','for(d=new Int32Array(xz),f=[[[0,198,128,0,3,192,128,1,0,0,96,128,28,0,0,0,0,2,63,61,13,16,44,8,0,0],[1,2,3,4,5,2,3,4,6,7,1,2,3,4,5,2,3,4,5,2,3,4,1,2,3,8,9],[[[b=115,,,,,,,,,,,,117,,,,,,,,,,,,113],[12,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,96]],[[b,,,,,,,,,,,,,,,110],[12,,,,,,,,,,,,,,,12,,,,,,,,,,,,,,,,,,,,,b,,,,,,,,,,,,,,,148]],[[b,,,,,,,,,,,,117,,,,,,,,,,,,118],[12,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,96]],[[122,,,,,,,,,,,,,,,123,,,,,b],[12,,,,,,,,,,,,,,,12,,,,,12,,,,,,,,,,,,,,,,b,,,,,,,,,,,,,,,8,,,,,128]],[[118,,,,,,,,,,,,117,,,,,,,,,,,,113],[12,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,96]],[[b],[12,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,255]],[[,,,,,,,,,,,,,,,,118,118,118],[,,,,,,,,,,,,,,,,12,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,128]],[[122,,,,,,,,,,,,,,,123,,,,,b],[12,,,,,,,,,,,,,,,12,,,,,13,12,,,,,,,,,,,,,,,b,,,,,,,,,,,,,,,8,,,,,95,61]],[[],[]]]],[[0,255,116,1,0,255,101,0,0,15,1,4,45,0,13,6,1,2,62,27,60,48,0,0,44,2],[,1,,2,,1,,2,,3,4,4,5,4,5,4,5,4,5,4,5,4,5,4,3,6],[[[,,,,,a=139,,,a,a,,,,,,a,,,,,,,,a,,,a,a,,,,,a,a,a],[]],[[,,a,a,,,,,a,a,,,,,a,a,,,,,,,,,,a,a,a,,,,,a,a,a],[]],[[,,,a,,,,,a,a,,,,,,a,,,,,a,a,,,,,,a,,,,a,a,a],[]],[[a,,,,a,,a,,,a,,,a,,,,a,,a,,,a,,,a,,,,a,,a,,,a],[]],[[a,,,a,a,,a,,,a,,,a,,,a,a,,a,,,a,,,a,,,a,a,,a,,,a],[]],[[a,,,a,a,,a,,,a,,,a,,,a,a,,a,,,a,a],[]]]],[[0,0,140,0,0,0,140,0,0,128,4,10,34,0,187,5,0,1,239,135,34,19,108,8,8,4],[,,1,,1,,3,,1,3,2,2,2,2,2,3,2,3,2,3,2,3,2,3,1],[[[,,,,,,,,,,127,,,,,,,,,,,,127,,,,,,,,,,,,127],[]],[[,,,a,,,,,,a,a,,,,,a,,,,,,a,a,,,,,a,,,,,a,,a],[]],[[,,127,,,,,,,,127,,,,127,,,,,,,,127,,,,127,,,,,,,,127],[]]]],[[1,192,128,0,3,201,128,0,0,93,5,6,58,3,195,6,1,3,35,63,14,17,11,10,61,6],[,,,,1,2,3,4,5,6,7,5,8,9,10,11,8,9,10,11,12,13,14,15,16],[[[,,,,,,,,147,146,145,,,,,,,,,,145,147,146,,,,,,,,,,149,148,147],[]],[[,,,,,,151,151,151,,,,,,,146,142,138,,,,,,,,,,,,,,,147,150,147],[]],[[,,146,,,146,,,,,,,,,147,146,145,,,,,,,,,,146,145,142,,,142,,,142],[]],[[,,141,,,,,,,,,,,,141,140,a,,,146,,,146,,,127],[]],[[,a,,151,,,,,,,,,,151,,a,,,,,,,,,,a,,151],[]],[[,a,,151,150,149,,,,,,,,a,,149,148,147,,,,,,,,a,,,146,,,145,,,144],[]],[[,a,,,a,142,,,142,144,146,,144,,,,146,147,,,147,146,141,,137,,,,142,141,,141,,137],[]],[[a,,127,,142,,,130,,,144,142,141,,129,,141,,,144,,,141,144,142,,,,149,,,146,,,151],[]],[[,149,,149,,146,144,142,,,141,,142,,,a,,,,151,147,,,,146,147,,144,146,,142,144,141,146],[]],[[,,,,,,,,147,146,145,,,,,141,144,147,146,,144,,137,,,144,146,142,144,,,142,144,141,146],[]],[[,146,,151,,146,,,,144,142,144,146,,,,142,,,,,a,,,,,151,146,a,144,a,142,141,142,151],[]],[[,,147,,,149,146,,,142,,142,141,,,144,,144,,,144,146,142,144,142,,,,151,150,149,,137,,149],[]],[[,151,,,147,151,,,146,151,,,,,144,151,,149,147,149,151,,146,,,144,143,142,,,a,,151,a],[]],[[,,134,,,134,,,134,,,146,144,,,141,144,,,146,147,146,,,144,,a,140,141,,,153,,,141],[]],[[,142,,151,,,142,143,144,,,,151,,,a,,,137,,149,,137,,,,125,,,141,142,141,,,146],[]],[[a,,127,a,,127,a,,127,a,127],[]]]],[[2,160,128,1,0,160,128,0,1,60,4,7,41,0,60,4,1,3,14,0,35,32,31,12,89,1],[,,,,,,,,,,,,1,2,1,2,1,2,1,2,1,2,1,2,1,3],[[[,,a,,,,,,,,,,,,a,,,,,,,,,,,,a,,,,,a,a,,,a],[]],[[,,a,,,151,,,a,,,151,,,a,,,151,,,a,,,151,,,a,,,151,,,146,146,146,146],[]],[[,,a,,,151,,,a,,,151,,,a,,a,a,a,a,127],[]]]],[[2,100,128,0,3,201,128,0,0,0,0,6,29,0,195,6,1,3,28,229,119,77,147,6,61,2],[,,,,,,,,,6,1,2,3,4,5,2,3,4,1,2,3,4,1,2,3,7],[[[b,b,b,b,b,b,b,b,b,b,b,b,117,117,117,117,117,117,117,117,117,117,117,117,113,113,113,113,113,113,113,113,113,113,113,113],[]],[[b,b,b,b,b,b,b,b,b,b,b,b,b,b,b,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,110],[]],[[b,b,b,b,b,b,b,b,b,b,b,b,117,117,117,117,117,117,117,117,117,117,117,117,118,118,118,118,118,118,118,118,118,118,118,118],[]],[[110,110,110,110,110,110,110,110,110,110,110,110,110,110,110,111,111,111,111,111,b,b,b,b,b,b,b,b,b,b,b,b,b,b,b,b],[]],[[118,118,118,118,118,118,118,118,118,118,118,118,117,117,117,117,117,117,117,117,117,117,117,117,113,113,113,113,113,113,113,113,113,113,113,113],[]],[[,,,,,,,,,,,,,,,,,,130,,130,,130,,130,,130,,130,118,130,118,130,118,130,118],[,,,,,,,,,,,,,,,,,,26,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,2]],[[110,122,,122,134,,110,122,,122,134,,110,122,,111,123,,111,123,b,127,a,127,b],[,,,,,,,,,,,,,,,,,,,,26,25,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,8,147]]]],[[2,100,128,0,3,201,128,0,0,0,5,6,58,0,195,6,1,2,135,0,0,32,147,6,121,6],[],[]],[[2,100,128,0,3,201,128,0,0,0,5,6,58,0,195,6,1,2,135,0,0,32,147,6,121,6],[],[]]][t],o=[],g=h=m=p=0;p<=26;p++)for(b=f[1][p],a=0;a<36;a++){((e=b?f[2][b-1][1][a]:0)?((f[0][e-1]=f[2][b-1][1][a+36]||0),e<14?(o=[]):0):0),c=(p*36+a)*5513;for(j=0;j<4;j++)if(n=b?f[2][b-1][0][a+j*36]:0){if(!o[n])for(q=f[0][10],r=f[0][11],s=f[0][12],w=yz(n+f[0][2]-128),l=yz(n+f[0][6]-128)*(1+.0008*f[0][7]),u=v=0,q*=q*4,r*=r*4,s*=s*4,o[n]=new Int32Array(q+r+s),k=0;k<q+r+s;k++)e=k<q?(k/q):(1-(k<q+r?0:((k-q-r)/s))),o[n][k]=(80*($[f[0][0]](u+=w*(f[0][3]?(e*e):1))*f[0][1]+$[f[0][4]](v+=l*(f[0][8]?(e*e):1))*f[0][5]+R(0,1)*f[0][9])*e)|0;for(k=0,i=c*2;k<o[n].length;k++,i+=2)d[i]+=o[n][k]}q=f[0][20]*1e-5,r=f[0][24]/255,s=f[0][25]*5513;for(j=0;j<5513;j++)(((n=e=d[k=(c+j)*2])||m)?(w=1.5*S(f[0][18]*.00307999186353015873*(f[0][16]?($[f[0][13]](P(2,f[0][15]-9)*k/5513)*f[0][14]/512+.5):1)),g+=w*h,l=(1-f[0][19]/255)*(e-h)-g,h+=w*l,e=f[0][17]==3?h:f[0][17]==1?l:g,q?(e*=q,e=(e<1?e>-1?$[0](e*.25):-1:1)/q):0,e*=f[0][21]/32,m=e*e>1e-5,w=S(6.283184*P(2,f[0][23]-9)*k/5513)*f[0][22]/512+.5,n=e*(1-w),e*=w):0),(k>=s?(n+=d[k-s+1]*r,e+=d[k-s]*r):0),_[k]+=(d[k]=n|0),_[k+1]+=(d[k+1]=e|0)}if(++t==8)for(clearInterval(I),s=(f=String.fromCharCode).apply(String,[82,73,70,70,168,16,71,1,87,65,86,69,102,109,116,32,16,0,0,0,1,0,2,0,68,172,0,0,16,177,2,0,4,0,16,0,100,97,116,97,132,16,71,1]),t=i=0;i<xz||(((A=document.createElement(\'audio\')).src=\'data:audio/wav;base64,\'+btoa(s),A.oncanplaythrough=L)&&0);i++)e=_[i],e=e<-32767?-32767:(e>32767?32767:e),s+=f(e&255,(e>>8)&255)'),0);
