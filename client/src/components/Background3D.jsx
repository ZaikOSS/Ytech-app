import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Sphere } from '@react-three/drei';

const AbstractShapes = () => {
  return (
    <>
      {/* Primary Green Blob */}
      <Float speed={1.5} rotationIntensity={0} floatIntensity={3} floatingRange={[-2, 2]}>
        <Sphere args={[2, 32, 32]} position={[-4, 2, -5]}>
          <meshBasicMaterial color="#10B981" />
        </Sphere>
      </Float>

      {/* Dark Brand Color Blob */}
      <Float speed={1} rotationIntensity={0} floatIntensity={2} floatingRange={[-1, 1]}>
        <Sphere args={[3, 32, 32]} position={[4, -1, -8]}>
          <meshBasicMaterial color="#091426" />
        </Sphere>
      </Float>

      {/* Lighter Mint Green Blob */}
      <Float speed={2} rotationIntensity={0} floatIntensity={4} floatingRange={[-3, 3]}>
        <Sphere args={[1.5, 32, 32]} position={[0, -3, -3]}>
          <meshBasicMaterial color="#6ee7b7" />
        </Sphere>
      </Float>
    </>
  );
};

const Background3D = () => {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#f8fafc] pointer-events-none overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <AbstractShapes />
      </Canvas>
      {/* Extremely heavy blur overlay to create a soft, non-disturbing 'aurora' effect */}
      <div 
        className="absolute inset-0 z-10" 
        style={{ 
          backdropFilter: 'blur(140px)', 
          WebkitBackdropFilter: 'blur(140px)', 
          backgroundColor: 'rgba(248, 250, 252, 0.5)' 
        }}
      ></div>
    </div>
  );
};

export default Background3D;
