import MyGeometry from '../../components/Geometry'
// import MySphere from '../../components/MySphere'
// import ParticleEffect from '../../components/ParticleEffect'

export default function Home() {
  return (
    <div
      id='scroll-container'
      className='relative h-[300vh] w-screen bg-gradient-to-br from-gray-900 via-black to-blue-900'
    >
      {/* Particle background effect */}
      {/* <ParticleEffect enableControls={true} particleCount={400} className='fixed inset-0 z-0' /> */}
      {/* <MySphere /> */}
      <MyGeometry />
    </div>
  )
}
