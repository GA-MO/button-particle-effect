import { Canvas, useFrame } from '@react-three/fiber'
// import { OrbitControls } from '@react-three/drei'
import { forwardRef, useLayoutEffect, useMemo, useRef } from 'react'
import {
  BufferGeometry,
  Color,
  Group,
  Mesh,
  PerspectiveCamera,
  ShaderMaterial,
  Spherical,
  Vector2,
  Vector3
} from 'three'
import { easing } from 'maath'
import { useControls } from 'leva'
import vertexShader from './shader/vertex.glsl'
import fragmentShader from './shader/fragment.glsl'

const Sphere = forwardRef<Mesh>((props, ref) => {
  const shaderRef = useRef<ShaderMaterial>(null)
  const geomRef = useRef<BufferGeometry>(null)

  useLayoutEffect(() => {
    if (geomRef.current) {
      geomRef.current.computeTangents()
    }
  }, [])

  const sphereControls = useControls('Sphere', {
    frequency: { value: 2.3, min: 0, max: 10 },
    strength: { value: 0.15, min: 0, max: 2 },
    dpFrequency: { value: 1.4, min: 0, max: 10 },
    dpStrength: { value: 0.06, min: 0, max: 1 },
    fresnelOffset: { value: -1.4, min: -2, max: 2 },
    fresnelMultiplier: { value: 3.3, min: 0, max: 5 },
    fresnelPower: { value: 1.793, min: 0, max: 5 },
    lightAIntensity: { value: 3, min: 0, max: 10 },
    lightBIntensity: { value: 1.4, min: 0, max: 10 },
    speed: { value: 1.0, min: 0, max: 5, step: 0.1 }
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
      uLightAIntensity: { value: 1.85 },
      uLightBColor: { value: lights.b.color },
      uLightBPosition: { value: new Vector3(-1, -1, 0).setFromSpherical(lights.b.spherical) },
      uLightBIntensity: { value: 1.4 },
      uSubdivision: { value: new Vector2(1000, 1000) },
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
      shaderRef.current.uniforms.uDistortionFrequency.value = sphereControls.frequency
      shaderRef.current.uniforms.uDistortionStrength.value = sphereControls.strength
      shaderRef.current.uniforms.uDisplacementFrequency.value = sphereControls.dpFrequency
      shaderRef.current.uniforms.uDisplacementStrength.value = sphereControls.dpStrength
      shaderRef.current.uniforms.uFresnelOffset.value = sphereControls.fresnelOffset
      shaderRef.current.uniforms.uFresnelMultiplier.value = sphereControls.fresnelMultiplier
      shaderRef.current.uniforms.uFresnelPower.value = sphereControls.fresnelPower
      shaderRef.current.uniforms.uLightAIntensity.value = sphereControls.lightAIntensity
      shaderRef.current.uniforms.uLightBIntensity.value = sphereControls.lightBIntensity

      const offsetTime = state.clock.getElapsedTime() * 0.3 * sphereControls.speed
      offset.spherical.phi =
        (Math.sin(offsetTime * 0.001) * Math.sin(offsetTime * 0.00321) * 0.5 + 0.5) * Math.PI
      offset.spherical.theta =
        (Math.sin(offsetTime * 0.0001) * Math.sin(offsetTime * 0.000321) * 0.5 + 0.5) * Math.PI * 2
      offset.direction.setFromSpherical(offset.spherical)
      offset.direction.multiplyScalar(sphereControls.dpFrequency * 2)

      shaderRef.current.uniforms.uOffset.value = offset.direction
    }
  })

  return (
    <CameraRig>
      <mesh ref={ref}>
        <sphereGeometry args={[1, 1000, 1000]} ref={geomRef} />
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
    </CameraRig>
  )
})

function CameraRig({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<Group | null>(null)
  const cameraControls = useControls('Camera', {
    lookatX: { value: 0, min: -20, max: 20 },
    lookatY: { value: 0, min: -20, max: 20 },
    lookatZ: { value: 0, min: -20, max: 20 },
    cameraX: { value: 0, min: -10, max: 10 },
    cameraY: { value: 0, min: -10, max: 10 },
    cameraZ: { value: 10, min: -100, max: 100 }
  })
  const intro = false

  useFrame((state, delta) => {
    // Move the camera based on the intro state
    easing.damp3(
      state.camera.position,
      [
        intro ? -state.viewport.width / 4 : cameraControls.cameraX,
        cameraControls.cameraY,
        cameraControls.cameraZ
      ],
      0.25,
      delta
    )

    // Rotate the sphere based on the mouse position
    if (groupRef.current) {
      easing.dampE(
        groupRef.current?.rotation,
        [state.pointer.y / 5, -state.pointer.x / 5, 0],
        0.25,
        delta
      )
    }

    // Adjust the FOV based on the aspect ratio
    if (state.camera.type === 'PerspectiveCamera') {
      const perspectiveCamera = state.camera as PerspectiveCamera
      const tanFOV = Math.tan(((Math.PI / 180) * 45) / 2)
      perspectiveCamera.fov =
        (360 / Math.PI) * Math.atan(tanFOV * (state.viewport.height / state.viewport.width))
      perspectiveCamera.aspect = state.viewport.width / state.viewport.height
      perspectiveCamera.updateProjectionMatrix()
    }

    // state.camera.position.set(
    //   cameraControls.cameraX,
    //   cameraControls.cameraY,
    //   cameraControls.cameraZ
    // )
    // state.camera.lookAt(cameraControls.lookatX, cameraControls.lookatY, cameraControls.lookatZ)
  })
  return <group ref={groupRef}>{children}</group>
}

export default function MySphere() {
  const meshRef = useRef<Mesh>(null)
  return (
    <>
      <div className='scroll-wrapper' style={{ height: '300vh' }}>
        <Canvas
          camera={{ position: [0, 0, 3], fov: 45, near: 0.1, far: 1000 }}
          style={{
            top: 50,
            left: 0,
            width: '100%',
            height: '100vh'
          }}
        >
          <Sphere ref={meshRef} />
          {/* <OrbitControls /> */}
        </Canvas>
      </div>
    </>
  )
}
