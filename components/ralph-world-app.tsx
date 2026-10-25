import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const cityPalette = [
  "#1f2330",
  "#2a2d3e",
  "#2d3a47",
  "#384659",
  "#241722",
  "#2d2135",
  "#163841",
];

type Country = {
  id: string;
  name: string;
  city: string;
  flag: string;
  description: string;
  spawn: [number, number, number];
};

type Mission = {
  id: string;
  title: string;
  detail: string;
  reward: number;
  position: [number, number, number];
};

type GameSceneProps = {
  country: Country;
  username: string;
  onMissionComplete: () => void;
  isMissionCompleted: boolean;
};

function Building({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={cityPalette[Math.floor(Math.abs(position[0] + position[2]) % cityPalette.length)]} />
    </mesh>
  );
}

function NPC({ position, color = "#b1d9ff" }: { position: [number, number, number]; color?: string }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.8 + position[2]) * 0.7;
    group.current.position.z = position[2] + Math.cos(state.clock.elapsedTime * 0.7 + position[0]) * 0.7;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime + position[0]) * 1.2;
  });

  return (
    <group ref={group} position={position}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.4, 1.1, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color="#f3d4b2" />
      </mesh>
    </group>
  );
}

function Vehicle({ position }: { position: [number, number, number] }) {
  const vehicleRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!vehicleRef.current) return;
    vehicleRef.current.position.set(position[0], position[1], position[2]);
  }, [position]);

  return (
    <group ref={vehicleRef} position={position}>
      <mesh castShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[2.2, 0.8, 4]} />
        <meshStandardMaterial color="#68d7ff" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0, 1.2, 0.1]}>
        <boxGeometry args={[1.3, 0.7, 1.6]} />
        <meshStandardMaterial color="#dcecff" emissive="#3eb8ff" emissiveIntensity={0.25} />
      </mesh>
      {[[-0.9, 0.36, 1.2], [0.9, 0.36, 1.2], [-0.9, 0.36, -1.2], [0.9, 0.36, -1.2]].map((wheel, index) => (
        <mesh key={index} castShadow position={wheel as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.42, 20]} />
          <meshStandardMaterial color="#101820" />
        </mesh>
      ))}
    </group>
  );
}

function MissionMarker({ position, active }: { position: [number, number, number]; active: boolean }) {
  const ring = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ring.current) return;
    ring.current.rotation.z = state.clock.elapsedTime * 0.6;
    ring.current.scale.setScalar(active ? 1.15 + Math.sin(state.clock.elapsedTime * 2.4) * 0.14 : 1);
  });

  return (
    <group position={position}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[1.2, 1.7, 48]} />
        <meshStandardMaterial color={active ? "#8ef0ff" : "#ffb743"} emissive={active ? "#79e3ff" : "#ffb743"} emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.45, 1.25, 18]} />
        <meshStandardMaterial color={active ? "#80dfff" : "#ffad2e"} />
      </mesh>
    </group>
  );
}

function PlayerAvatar({ position }: { position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!group.current) return;
    group.current.position.set(position[0], position[1], position[2]);
  }, [position]);

  return (
    <group ref={group} position={position}>
      <mesh castShadow position={[0, 0.7, 0]}>
        <capsuleGeometry args={[0.38, 1.2, 6, 12]} />
        <meshStandardMaterial color="#8dd6ff" />
      </mesh>
      <mesh castShadow position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color="#f4d2a3" />
      </mesh>
    </group>
  );
}

function GameWorld({ country, username, onMissionComplete, isMissionCompleted }: GameSceneProps) {
  const playerRef = useRef<THREE.Group>(null);
  const vehicleRef = useRef<THREE.Group>(null);
  const keys = useRef({ KeyW: false, KeyA: false, KeyS: false, KeyD: false, ShiftLeft: false, ShiftRight: false });
  const [nearVehicle, setNearVehicle] = useState(false);
  const [isDriving, setIsDriving] = useState(false);
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>(country.spawn);
  const [vehiclePosition, setVehiclePosition] = useState<[number, number, number]>([10, 0, 10]);
  const missionPosition: [number, number, number] = [-12, 0, -8];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code in keys.current) {
        keys.current[event.code as keyof typeof keys.current] = true;
      }

      if (event.code === "KeyF") {
        if (nearVehicle) {
          setIsDriving((prev) => !prev);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code in keys.current) {
        keys.current[event.code as keyof typeof keys.current] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [nearVehicle]);

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    let moveX = 0;
    let moveZ = 0;

    if (keys.current.KeyW) moveZ -= 1;
    if (keys.current.KeyS) moveZ += 1;
    if (keys.current.KeyA) moveX -= 1;
    if (keys.current.KeyD) moveX += 1;

    const running = keys.current.ShiftLeft || keys.current.ShiftRight;
    const movement = new THREE.Vector3(moveX, 0, moveZ);

    if (!isDriving && movement.lengthSq() > 0) {
      movement.normalize();
      const speed = running ? 7.8 : 4.3;
      const nextX = playerPosition[0] + movement.x * speed * delta;
      const nextZ = playerPosition[2] + movement.z * speed * delta;
      const clampedX = THREE.MathUtils.clamp(nextX, -26, 26);
      const clampedZ = THREE.MathUtils.clamp(nextZ, -26, 26);
      const nextPos: [number, number, number] = [clampedX, 0.5, clampedZ];
      playerRef.current.position.set(nextPos[0], nextPos[1], nextPos[2]);
      setPlayerPosition(nextPos);
      playerRef.current.rotation.y = Math.atan2(movement.x, movement.z);
    }

    if (vehicleRef.current) {
      const carDist = playerRef.current.position.distanceTo(vehicleRef.current.position);
      setNearVehicle(carDist < 3.8);
    }

    if (isDriving) {
      const driveX = Number(keys.current.KeyD) - Number(keys.current.KeyA);
      const driveZ = Number(keys.current.KeyW) - Number(keys.current.KeyS);
      const driveVec = new THREE.Vector3(driveX, 0, driveZ);
      if (driveVec.lengthSq() > 0) {
        driveVec.normalize();
        const speed = running ? 12.5 : 8.5;
        const nextCarX = vehiclePosition[0] + driveVec.x * delta * speed;
        const nextCarZ = vehiclePosition[2] + driveVec.z * delta * speed;
        const clampedX = THREE.MathUtils.clamp(nextCarX, -24, 24);
        const clampedZ = THREE.MathUtils.clamp(nextCarZ, -24, 24);
        const nextVehicle: [number, number, number] = [clampedX, 0, clampedZ];
        vehicleRef.current.position.set(nextVehicle[0], nextVehicle[1], nextVehicle[2]);
        setVehiclePosition(nextVehicle);
        playerRef.current.position.set(nextVehicle[0], 0.5, nextVehicle[2] + 2.2);
        playerRef.current.rotation.y = Math.atan2(driveVec.x, driveVec.z);
      }
    }

    const missionDistance = new THREE.Vector3(playerPosition[0], 0, playerPosition[2]).distanceTo(
      new THREE.Vector3(missionPosition[0], 0, missionPosition[2])
    );

    if (!isMissionCompleted && missionDistance < 2.6) {
      onMissionComplete();
    }

    if (state.camera) {
      const desired = new THREE.Vector3(playerRef.current.position.x + 4, 5.5, playerRef.current.position.z + 9);
      state.camera.position.lerp(desired, 0.08);
      state.camera.lookAt(playerRef.current.position.x, 1.3, playerRef.current.position.z);
    }
  });

  const roadSegments = [
    [-15, 0, 0],
    [15, 0, 0],
    [0, 0, -15],
    [0, 0, 15],
    [-8, 0, -8],
    [8, 0, 8],
    [-8, 0, 8],
    [8, 0, -8],
  ] as const;

  const buildings = [
    { position: [-18, 0, -17] as [number, number, number], size: [4, 9, 4] as [number, number, number] },
    { position: [-12, 0, -17] as [number, number, number], size: [5, 12, 5] as [number, number, number] },
    { position: [-6, 0, -17] as [number, number, number], size: [4, 8, 4] as [number, number, number] },
    { position: [0, 0, -17] as [number, number, number], size: [5, 10, 5] as [number, number, number] },
    { position: [6, 0, -17] as [number, number, number], size: [4, 11, 4] as [number, number, number] },
    { position: [12, 0, -17] as [number, number, number], size: [4, 9, 4] as [number, number, number] },
    { position: [18, 0, -17] as [number, number, number], size: [4, 13, 4] as [number, number, number] },
    { position: [-18, 0, 17] as [number, number, number], size: [4, 11, 4] as [number, number, number] },
    { position: [-12, 0, 17] as [number, number, number], size: [5, 14, 5] as [number, number, number] },
    { position: [-6, 0, 17] as [number, number, number], size: [4, 10, 4] as [number, number, number] },
    { position: [0, 0, 17] as [number, number, number], size: [5, 9, 5] as [number, number, number] },
    { position: [6, 0, 17] as [number, number, number], size: [4, 12, 4] as [number, number, number] },
    { position: [12, 0, 17] as [number, number, number], size: [4, 8, 4] as [number, number, number] },
    { position: [18, 0, 17] as [number, number, number], size: [4, 15, 4] as [number, number, number] },
    { position: [-17, 0, -8] as [number, number, number], size: [4, 9, 4] as [number, number, number] },
    { position: [17, 0, 8] as [number, number, number], size: [4, 11, 4] as [number, number, number] },
  ];

  return (
    <>
      <Canvas shadows camera={{ position: [0, 8, 10], fov: 52 }} dpr={[1, 1.5]} className="game-canvas">
        <color attach="background" args={["#071b2d"]} />
        <fog attach="fog" args={["#071b2d", 28, 90]} />
        <ambientLight intensity={0.7} />
        <directionalLight
          castShadow
          position={[20, 24, 16]}
          intensity={1.5}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Stars radius={65} depth={32} count={4500} factor={4} saturation={0} fade speed={0.6} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.08, 0]}>
          <planeGeometry args={[90, 90]} />
          <meshStandardMaterial color="#152b22" />
        </mesh>

        {roadSegments.map(([x, y, z], index) => (
          <mesh key={index} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.03, z]} receiveShadow>
            <planeGeometry args={[4, 90]} />
            <meshStandardMaterial color="#2b2d35" />
          </mesh>
        ))}

        {buildings.map((building, index) => (
          <Building key={index} position={building.position} size={building.size} />
        ))}

        <mesh position={[0, 0.6, 0]} receiveShadow>
          <cylinderGeometry args={[0.65, 0.8, 1.2, 24]} />
          <meshStandardMaterial color="#62d3ff" emissive="#4bb6ff" emissiveIntensity={0.35} />
        </mesh>

        <NPC position={[-8, 0, 2]} color="#ffbe7d" />
        <NPC position={[14, 0, -4]} color="#8ff0cf" />
        <NPC position={[2, 0, 14]} color="#f2b2d7" />
        <MissionMarker position={missionPosition} active={!isMissionCompleted} />
        <Vehicle position={vehiclePosition} />
        <PlayerAvatar position={playerPosition} />
      </Canvas>
    </>
  );
}

export function RalphWorldScene({ country, username, onMissionComplete, isMissionCompleted }: GameSceneProps) {
  return <GameWorld country={country} username={username} onMissionComplete={onMissionComplete} isMissionCompleted={isMissionCompleted} />;
}
