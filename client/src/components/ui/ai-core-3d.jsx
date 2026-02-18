import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Sparkles, PerspectiveCamera } from '@react-three/drei';

const AnimatedSphere = () => {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            // Subtle rotation
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef} scale={1.8}>
                <sphereGeometry args={[1, 64, 64]} />
                {/* Liquid Metal / Living Intelligence Material */}
                <MeshDistortMaterial
                    color="#e0e0e0" // Silver-White
                    attach="material"
                    distort={0.4} // Wobbly effect
                    speed={2} // Morph speed
                    roughness={0.1}
                    metalness={0.9}
                    bumpScale={0.005}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    radius={1}
                />
            </mesh>
        </Float>
    );
};

const AiCore3D = ({ className }) => {
    return (
        <div className={`w-full h-full ${className}`}>
            <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />

                {/* Lighting System */}
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4a4aff" /> {/* Subtle blue rim light for depth */}

                {/* The Core */}
                <AnimatedSphere />

                {/* Atmosphere */}
                <Sparkles
                    count={30}
                    scale={6}
                    size={2}
                    speed={0.5}
                    opacity={0.4}
                    color="#ffffff"
                />
            </Canvas>
        </div>
    );
};

export default AiCore3D;
