import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { BufferGeometry, Color, ShaderMaterial, Spherical, Vector2, Vector3 } from 'three'
import { useControls } from 'leva'
import vertexShader from './shader/vertex.glsl'
import fragmentShader from './shader/fragment.glsl'

function Sphere() {
  const shaderRef = useRef<ShaderMaterial>(null)
  const geomRef = useRef<BufferGeometry>(null)

  useLayoutEffect(() => {
    if (geomRef.current) {
      geomRef.current.computeTangents()
    }
  }, [])

  const {
    distortionFrequency,
    distortionStrength,
    displacementFrequency,
    displacementStrength,
    fresnelOffset,
    fresnelMultiplier,
    fresnelPower,
    uLightAIntensity,
    uLightBIntensity
  } = useControls({
    distortionFrequency: { value: 1.5, min: 0, max: 10 },
    distortionStrength: { value: 0.65, min: 0, max: 2 },
    displacementFrequency: { value: 2.12, min: 0, max: 10 },
    displacementStrength: { value: 0.152, min: 0, max: 1 },
    fresnelOffset: { value: -1.609, min: -2, max: 2 },
    fresnelMultiplier: { value: 3.587, min: 0, max: 5 },
    fresnelPower: { value: 1.793, min: 0, max: 5 },
    uLightAIntensity: { value: 1.85, min: 0, max: 10 },
    uLightBIntensity: { value: 1.4, min: 0, max: 10 }
  })

  const lights = useMemo(() => {
    const lights = {
      a: {
        color: new Color('#ffd200'),
        spherical: new Spherical(1, 0.615, 2.049)
      },
      b: {
        color: new Color('#DB8828'),
        spherical: new Spherical(1, 2.561, -1.844)
      }
    }

    return lights
  }, [])

  const offset = useMemo(() => {
    const offset = {
      spherical: new Spherical(1, Math.random() * Math.PI, Math.random() * Math.PI * 2),
      direction: new Vector3(0, 0, 0)
    }
    offset.direction.setFromSpherical(offset.spherical)
    return offset
  }, [])

  const uniforms = useMemo(
    () => ({
      uLightAColor: { value: lights.a.color },
      uLightAPosition: { value: new Vector3(1, 1, 0).setFromSpherical(lights.a.spherical) },
      uLightAIntensity: { value: uLightAIntensity },
      uLightBColor: { value: lights.b.color },
      uLightBPosition: { value: new Vector3(-1, -1, 0).setFromSpherical(lights.b.spherical) },
      uLightBIntensity: { value: uLightBIntensity },
      uSubdivision: { value: new Vector2(600, 600) },
      uOffset: { value: new Vector3(0, 0, 0) },
      uDistortionFrequency: { value: 1.5 },
      uDistortionStrength: { value: 0.65 },
      uDisplacementFrequency: { value: 2.12 },
      uDisplacementStrength: { value: 0.152 },
      uFresnelOffset: { value: -1.609 },
      uFresnelMultiplier: { value: 3.587 },
      uFresnelPower: { value: 1.793 },
      uTime: { value: 0 }
    }),
    []
  )

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
      shaderRef.current.uniforms.uDistortionFrequency.value = distortionFrequency
      shaderRef.current.uniforms.uDistortionStrength.value = distortionStrength
      shaderRef.current.uniforms.uDisplacementFrequency.value = displacementFrequency
      shaderRef.current.uniforms.uDisplacementStrength.value = displacementStrength
      shaderRef.current.uniforms.uFresnelOffset.value = fresnelOffset
      shaderRef.current.uniforms.uFresnelMultiplier.value = fresnelMultiplier
      shaderRef.current.uniforms.uFresnelPower.value = fresnelPower
      shaderRef.current.uniforms.uLightAIntensity.value = uLightAIntensity
      shaderRef.current.uniforms.uLightBIntensity.value = uLightBIntensity

      const offsetTime = state.clock.getElapsedTime() * 0.3
      offset.spherical.phi =
        (Math.sin(offsetTime * 0.001) * Math.sin(offsetTime * 0.00321) * 0.5 + 0.5) * Math.PI
      offset.spherical.theta =
        (Math.sin(offsetTime * 0.0001) * Math.sin(offsetTime * 0.000321) * 0.5 + 0.5) * Math.PI * 2
      offset.direction.setFromSpherical(offset.spherical)
      offset.direction.multiplyScalar(displacementFrequency * 2)

      shaderRef.current.uniforms.uOffset.value = offset.direction
    }
  })

  return (
    <group>
      <mesh>
        <sphereGeometry args={[1, 600, 600]} ref={geomRef} />
        <shaderMaterial
          ref={shaderRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          defines={{
            USE_TANGENT: '1'
          }}
        />
      </mesh>
    </group>
  )
}

export default function MySphere() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3] }}
      style={{ width: '100%', height: '100%', position: 'fixed' }}
    >
      <ambientLight intensity={0.2} />
      <Sphere />
      <OrbitControls makeDefault enableZoom={false} enablePan={false} />
    </Canvas>
  )
}
