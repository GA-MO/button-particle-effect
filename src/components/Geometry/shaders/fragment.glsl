varying float vDistort;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uAlpha;

vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}     

void main() {
  float distort = vDistort * uIntensity;

  vec3 brightness = vec3(.4, .0, .5);
  vec3 contrast = vec3(.2, .2, .2);
  vec3 oscilation = vec3(.6, .4, .2);
  vec3 phase = vec3(.1, .4, .8);
  // vec3 brightness = vec3(.4, .0, .5);
  // vec3 contrast = vec3(.3, .3, .1);
  // vec3 oscilation = vec3(.7, .1, .1); // (.7, .8, .1);
  // vec3 phase = vec3(.1, .4, .8);

  vec3 color = cosPalette(distort, brightness, contrast, oscilation, phase);

  gl_FragColor = vec4(uColor, (vDistort + uAlpha));
} 


