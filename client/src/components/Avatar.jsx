import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars, OrbitControls } from '@react-three/drei';

const NeuralCore = ({ isSpeaking, isListening, state }) => {
    const mesh = useRef();

    useFrame((state, delta) => {
        if (mesh.current) {
            // Basic rotation
            mesh.current.rotation.x += delta * 0.2;
            mesh.current.rotation.y += delta * 0.3;

            // Pulse scale based on speaking state
            if (isSpeaking) {
                const time = state.clock.getElapsedTime();
                const scale = 1 + Math.sin(time * 10) * 0.2;
                mesh.current.scale.set(scale, scale, scale);
                mesh.current.distort = 0.6 + Math.sin(time * 5) * 0.2;
                mesh.current.speed = 4;
            } else if (isListening) {
                const time = state.clock.getElapsedTime();
                // Slow pulse
                const scale = 1 + Math.sin(time * 2) * 0.05;
                mesh.current.scale.set(scale, scale, scale);
                mesh.current.distort = 0.3;
                mesh.current.speed = 1;
            } else {
                // Idle
                mesh.current.scale.set(1, 1, 1);
                mesh.current.distort = 0.4;
                mesh.current.speed = 1.5;
            }
        }
    });

    // Color logic
    // Speaking: Purple/Pink
    // Listening: Green/Cyan
    // Thinking: Yellow/Orange (Use isAnalyzing prop if available, else default)
    let color = "#8b5cf6"; // Violet
    if (isSpeaking) color = "#ec4899"; // Pink
    else if (isListening) color = "#00ff9d"; // Neon Green
    else if (state === 'thinking') color = "#f59e0b"; // Orange

    return (
        <Sphere args={[1, 64, 64]} ref={mesh} position={[0, 0, 0]}>
            <MeshDistortMaterial
                color={color}
                attach="material"
                distort={0.4} // Strength, 0 disables the effect (default=1)
                speed={1.5} // Speed (default=1)
                roughness={0.2}
                metalness={0.8}
                emissive={color}
                emissiveIntensity={0.5}
            />
        </Sphere>
    );
};

const Avatar = ({ isSpeaking, isListening, isAnalyzing }) => {
    let state = 'idle';
    if (isAnalyzing) state = 'thinking';

    return (
        <div className="w-full h-[400px] relative">
            <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={1} />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <NeuralCore isSpeaking={isSpeaking} isListening={isListening} state={state} />

                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
};

export default Avatar;
