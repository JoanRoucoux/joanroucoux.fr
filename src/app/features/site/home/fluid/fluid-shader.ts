export const FLUID_VERTEX = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

export const FLUID_FRAGMENT = `precision highp float;
uniform vec2 R;
uniform float T;
uniform float L;
uniform vec4 W;
vec2 g(vec2 p){float a=6.2831853*fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);return vec2(cos(a),sin(a));}
float n(vec2 p){
  vec2 i=floor(p),f=fract(p);
  vec2 u=f*f*f*(f*(f*6.-15.)+10.);
  float a=dot(g(i),f),b=dot(g(i+vec2(1.,0.)),f-vec2(1.,0.));
  float c=dot(g(i+vec2(0.,1.)),f-vec2(0.,1.)),d=dot(g(i+vec2(1.,1.)),f-vec2(1.,1.));
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y)*.72+.5;
}
float fbm(vec2 p){return n(p)*.78+n(p*1.9+vec2(17.3,9.1))*.22;}
vec3 ramp(float x){
  vec3 c=vec3(.006,.006,.04);
  c=mix(c,vec3(.02,.07,.42),smoothstep(0.,.22,x));
  c=mix(c,vec3(.08,.3,1.),smoothstep(.22,.32,x));
  c=mix(c,vec3(.5,.85,1.),smoothstep(.32,.345,x));
  c=mix(c,vec3(.03,.08,.5),smoothstep(.345,.42,x));
  c=mix(c,vec3(.006,.006,.04),smoothstep(.42,.6,x));
  c=mix(c,vec3(.32,.02,.22),smoothstep(.6,.74,x));
  c=mix(c,vec3(.95,.12,.52),smoothstep(.74,.82,x));
  c=mix(c,vec3(1.,.55,.82),smoothstep(.82,.845,x));
  c=mix(c,vec3(.2,.03,.35),smoothstep(.845,.92,x));
  c=mix(c,vec3(.006,.006,.04),smoothstep(.92,1.,x));
  return c;
}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*R)/min(R.x,R.y);
  vec2 p=mat2(.94,-.34,.34,.94)*uv;
  p=vec2(p.x*.5,p.y*.85)+vec2(3.1,1.7);
  float t=T*.03;
  vec2 q=vec2(fbm(p+vec2(0.,t)),fbm(p+vec2(5.2,1.3)-t))-.5;
  vec2 w=vec2(fbm(p+3.2*q+vec2(1.7,9.2)+t*.6),fbm(p+3.2*q+vec2(8.3,2.8)-t*.5))-.5;
  float f=fbm(p+4.*w+q);
  float ph=fract(f*4.2+dot(w,vec2(1.8,1.1)));
  vec3 col=ramp(ph);
  col+=col*pow(.5+.5*sin(f*74.+w.y*20.),6.)*.6;
  float shade=smoothstep(.27,.6,fbm(p*.6+q*2.2+vec2(11.,4.)+t*.4));
  col*=mix(.14,1.,shade);
  if(L>.5){
    float a=max(col.r,max(col.g,col.b));
    vec3 pig=mix(vec3(1.),col/max(a,.001),.8);
    col=mix(vec3(.937,.937,.969),pig,a*.9);
  }
  float a=1.;
  if(W.x!=0.){
    float x=gl_FragCoord.x/W.w;
    float y=(W.x>0.?gl_FragCoord.y:R.y-gl_FragCoord.y)/W.w;
    float e=W.y+15.*sin(x*.0052+T*.5)+9.*sin(x*.0113-T*.75+1.7)+5.*sin(x*.021+T*1.05+.6);
    a=smoothstep(e-W.z,e+W.z,y);
  }
  gl_FragColor=vec4(col*a,a);
}
`;
