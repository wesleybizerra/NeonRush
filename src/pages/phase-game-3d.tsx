import React, { Suspense, useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, RigidBody, RapierRigidBody } from '@react-three/rapier';
import { OrbitControls, Sky, Environment, PerspectiveCamera, useGLTF, KeyboardControls, useKeyboardControls, Html, Preload } from '@react-three/drei';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

// Componente de Carro
const CarModel = () => {
  const rigidBody = useRef<RapierRigidBody>(null);
  const [, get] = useKeyboardControls();
  const [modelError, setModelError] = useState(false);
  
  let scene;
  try {
    const gltf = useGLTF('./models/cars/car.glb');
    scene = gltf.scene;
  } catch (e) {
    if (!modelError) setModelError(true);
  }

  const clonedScene = React.useMemo(() => scene ? scene.clone() : null, [scene]);

  useFrame((state) => {
    if (!rigidBody.current) return;
    
    const { forward, backward, left, right } = get();
    
    // Força de aceleração e rotação
    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };
    
    const speed = 20;
    const turnSpeed = 8;

    if (forward) impulse.z -= speed;
    if (backward) impulse.z += speed;
    if (left) torque.y += turnSpeed;
    if (right) torque.y -= turnSpeed;

    rigidBody.current.applyImpulse(impulse, true);
    rigidBody.current.applyTorqueImpulse(torque, true);

    // Suavizar a velocidade angular (atrito de rotação)
    const angVel = rigidBody.current.angularVelocity();
    rigidBody.current.setAngularVelocity({ x: angVel.x * 0.95, y: angVel.y * 0.95, z: angVel.z * 0.95 }, true);

    // Câmera segue o carro
    const pos = rigidBody.current.translation();
    state.camera.position.lerp({ x: pos.x, y: pos.y + 5, z: pos.z + 10 } as any, 0.1);
    state.camera.lookAt(pos.x, pos.y, pos.z);
  });

  return (
    <RigidBody 
      ref={rigidBody} 
      colliders="cuboid" 
      position={[0, 2, 0]} 
      mass={1}
      friction={0.5}
      linearDamping={0.5}
      angularDamping={0.5}
    >
      {clonedScene ? (
        <primitive object={clonedScene} scale={0.6} />
      ) : (
        <group>
          {/* Carro Procedural Neon */}
          <mesh castShadow>
            <boxGeometry args={[2, 0.8, 4]} />
            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.6, -0.5]} castShadow>
            <boxGeometry args={[1.8, 0.6, 2]} />
            <meshStandardMaterial color="#00ff88" transparent opacity={0.4} />
          </mesh>
          {/* Rodas */}
          {[[-1, -0.4, 1.5], [1, -0.4, 1.5], [-1, -0.4, -1.5], [1, -0.4, -1.5]].map((pos, i) => (
            <mesh key={i} position={pos as any} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.4, 0.4, 0.4]} />
              <meshStandardMaterial color="#050505" />
            </mesh>
          ))}
          {/* Faróis */}
          <pointLight position={[0.8, 0, -2.1]} intensity={2} color="white" distance={10} />
          <pointLight position={[-0.8, 0, -2.1]} intensity={2} color="white" distance={10} />
        </group>
      )}
    </RigidBody>
  );
};

// Componente da Pista
const TrackModel = () => {
  let scene;
  try {
    const gltf = useGLTF('./models/track/track.glb');
    scene = gltf.scene;
  } catch (e) {
    // Silently fail to procedural
  }

  const clonedScene = React.useMemo(() => scene ? scene.clone() : null, [scene]);
  
  return (
    <group>
      {clonedScene ? (
        <RigidBody type="fixed" colliders="trimesh">
          <primitive object={clonedScene} />
        </RigidBody>
      ) : (
        <RigidBody type="fixed" colliders="cuboid">
          {/* Pista Procedural Infinita (ou grande) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[40, 1000]} />
            <meshStandardMaterial color="#111" roughness={0.8} />
          </mesh>
          {/* Linhas da Pista */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <planeGeometry args={[0.2, 1000]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[19.8, 0.02, 0]}>
            <planeGeometry args={[0.4, 1000]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={5} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-19.8, 0.02, 0]}>
            <planeGeometry args={[0.4, 1000]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={5} />
          </mesh>
        </RigidBody>
      )}
    </group>
  );
};

const EnvironmentObject = ({ modelPath, position, scale = 1 }: { modelPath: string, position: [number, number, number], scale?: number }) => {
  // No Electron, caminhos relativos precisam ser exatos a partir do index.html
  // Adicionamos um fallback para o caminho absoluto se o relativo falhar
  const resolvedPath = modelPath.startsWith('./') ? modelPath : `./${modelPath}`;
  
  try {
    const { scene } = useGLTF(resolvedPath);
    const clonedScene = React.useMemo(() => scene.clone(), [scene]);
    return <primitive object={clonedScene} position={position} scale={scale} />;
  } catch (e) {
    console.error(`Falha ao carregar modelo: ${modelPath}`, e);
    // Se o modelo falhar, mostra um cubo de erro profissional
    return (
      <mesh position={position}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#ff0055" emissive="#ff0055" />
      </mesh>
    );
  }
};

const CityEnvironment = () => {
  // Criamos uma cidade procedural profissional caso os modelos 3D não existam ou falhem
  return (
    <group>
      {/* Chão Neon Estilizado */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#050505" />
      </mesh>
      <gridHelper args={[1000, 100, "#00ff88", "#111"]} position={[0, 0.01, 0]} />

      {/* Prédios Procedurais com Luzes Emissivas */}
      {Array.from({ length: 120 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 500;
        const z = (Math.random() - 0.5) * 500;
        // Mantém o centro limpo para a pista
        if (Math.abs(x) < 25 && Math.abs(z) < 25) return null; 
        
        const h = 10 + Math.random() * 60;
        const w = 5 + Math.random() * 12;
        const color = i % 3 === 0 ? "#00ff88" : (i % 3 === 1 ? "#0088ff" : "#ff00ff");
        
        return (
          <group key={`building-${i}`} position={[x, h / 2, z]}>
            <mesh>
              <boxGeometry args={[w, h, w]} />
              <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={0.8} />
            </mesh>
            {/* Janelas Neon nas faces */}
            <mesh position={[0, 0, w/2 + 0.1]}>
              <planeGeometry args={[w * 0.8, h * 0.8]} />
              <meshStandardMaterial 
                color={color} 
                emissive={color} 
                emissiveIntensity={3} 
                transparent 
                opacity={0.4}
              />
            </mesh>
          </group>
        );
      })}

      {/* Árvores Neon Estilizadas (Estilo Tron) */}
      {Array.from({ length: 80 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 300;
        const z = (Math.random() - 0.5) * 300;
        if (Math.abs(x) < 15 && Math.abs(z) < 15) return null;
        
        return (
          <group key={`tree-${i}`} position={[x, 0, z]}>
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.1, 0.4, 3]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[0, 4.5, 0]}>
              <octahedronGeometry args={[2]} />
              <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2} />
            </mesh>
          </group>
        );
      })}
      
      {/* Luzes de Atmosfera Globais */}
      <pointLight position={[0, 100, 0]} intensity={3} color="#00ff88" />
      <pointLight position={[200, 100, 200]} intensity={2} color="#0088ff" />
      <pointLight position={[-200, 100, -200]} intensity={2} color="#ff00ff" />
    </group>
  );
};

const LoadingScreen = () => {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowError(true), 10000); // 10 segundos
    return () => clearTimeout(timer);
  }, []);

  return (
    <Html center>
      <div className="flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl p-12 rounded-3xl border border-white/10 min-w-[300px]">
        {!showError ? (
          <>
            <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 text-center">Aquecendo Motores...</p>
            <p className="text-[10px] text-white/40 mt-2 uppercase text-center">Carregando Modelos 3D</p>
          </>
        ) : (
          <>
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500 text-center">Falha no Carregamento</p>
            <p className="text-[10px] text-white/40 mt-2 uppercase text-center">Verifique se a pasta 'models' está correta</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Tentar Novamente
            </button>
          </>
        )}
      </div>
    </Html>
  );
};

export const PhaseGame3D = () => {
  const { phaseId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(`Iniciando Fase 3D: ${phaseId}`);
    return () => console.log(`Saindo da Fase 3D: ${phaseId}`);
  }, [phaseId]);

  const map = [
    { name: 'forward', keys: ['ArrowUp', 'w'] },
    { name: 'backward', keys: ['ArrowDown', 's'] },
    { name: 'left', keys: ['ArrowLeft', 'a'] },
    { name: 'right', keys: ['ArrowRight', 'd'] },
  ];

  return (
    <div className="w-full h-screen bg-black relative">
      <button 
        onClick={() => navigate('/phases')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 rounded-full bg-black/50 border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md hover:bg-emerald-500 hover:text-black transition-all"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao Mapa
      </button>

      <KeyboardControls map={map}>
        <Canvas shadows gl={{ antialias: true }}>
          <color attach="background" args={['#050505']} />
          <fog attach="fog" args={['#050505', 10, 100]} />
          <PerspectiveCamera makeDefault position={[0, 5, 12]} />
          <OrbitControls maxPolarAngle={Math.PI / 2.1} makeDefault />
          <Sky sunPosition={[100, 20, 100]} />
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
          <directionalLight position={[-10, 10, 5]} intensity={0.5} />
          <Environment preset="night" />

          <Suspense fallback={<LoadingScreen />}>
            <Physics gravity={[0, -9.81, 0]}>
              <CarModel />
              <TrackModel />
              <CityEnvironment />
            </Physics>
            <Preload all />
          </Suspense>
        </Canvas>
      </KeyboardControls>
      
      <div className="absolute bottom-8 left-8 z-10">
        <div className="rounded-2xl bg-black/50 border border-white/10 p-6 backdrop-blur-md">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">
            Distrito <span className="text-emerald-500">{phaseId}</span>
          </h1>
          <div className="mt-4 flex gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Objetivo</span>
              <span className="text-xs font-bold">Cruzar a linha de chegada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
