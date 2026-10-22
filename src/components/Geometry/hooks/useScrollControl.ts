import { useEffect } from 'react'
import type { Mesh, BufferGeometry, NormalBufferAttributes } from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useThree } from '@react-three/fiber'

gsap.registerPlugin(ScrollTrigger)

export default function useScrollControl(
  meshRef: Mesh<BufferGeometry<NormalBufferAttributes>> | null
) {
  const { camera } = useThree()

  useEffect(() => {
    if (!meshRef) return

    gsap
      .timeline({
        scrollTrigger: {
          trigger: '#scroll-container',
          start: '1 top',
          scrub: 3,
          end: 'bottom bottom'
        }
      })
      .to(
        camera.position,
        {
          x: 1,
          y: 1,
          z: 2,
          duration: 6
        },
        0
      )
      .to(
        meshRef.rotation,
        {
          y: Math.PI,
          duration: 6
        },
        0
      )

    // gsap.to(meshRef.rotation, {
    //   y: Math.PI,
    //   ease: 'none',
    //   scrollTrigger: {
    //     trigger: '#scroll-container',
    //     start: 'top top',
    //     end: 'bottom bottom',
    //     scrub: 3,
    //     markers: true
    //   }
    // })

    // gsap.to(camera.position, {
    //   x: 1,
    //   y: 1,
    //   z: 2,
    //   ease: 'none',
    //   scrollTrigger: {
    //     trigger: '#scroll-container',
    //     start: 'top top',
    //     end: 'bottom top',
    //     scrub: 3,
    //     markers: true
    //   }
    // })
  }, [meshRef, camera])

  return null
}
