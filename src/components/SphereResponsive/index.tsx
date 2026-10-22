import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

// Vertex shader
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Fragment shader adapted from Shadertoy
const fragmentShader = `
  uniform float iTime;
  uniform vec2 iResolution;
  varying vec2 vUv;
  
  void main() {
    vec4 O;
    vec2 I = vUv * iResolution;
    
    vec2 r = iResolution.xy;
    vec2 z, i, f = I * (z += 4. - 4. * abs(0.7 - dot(I = (I + I - r) / r.y, I)));
    
    for(O *= 0.; i.y++ < 8.;
        O += (sin(f += cos(f.yx * i.y + i + iTime) / i.y + 0.7) + 1.).xyyx
        * abs(f.x - f.y));
    
    O = tanh(7. * exp(z.x - 4. - I.y * vec4(-1, 1, 2, 0)) / O);
    
    gl_FragColor = O;
  }
`

function Sphere() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.iTime.value = state.clock.elapsedTime
    }
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  const uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2(800, 600) }
  }

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default function SphereResponsive() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Sphere />
      </Canvas>
    </div>
  )
}
