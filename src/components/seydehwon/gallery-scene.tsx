"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { artworks, type Artwork } from "@/lib/gallery-art";

/** One straight white room. The camera stays in the aisle, so both walls stay in view. */
const HALF_W = 1.5;
const HALL_H = 3.35;
const LENGTH = 15.5;
const EYE = 1.58;
const FOV = 74;

export type FocusedLook = {
  title: string;
  subtitle: string;
  productSlug: string;
  priceLabel: string;
};

export type GalleryView = { x: number; z: number } | null;

type GallerySceneProps = {
  progressRef: React.MutableRefObject<number>;
  targetProgressRef: React.MutableRefObject<number>;
  viewRef: React.MutableRefObject<GalleryView>;
  onFocusLook: (look: FocusedLook | null) => void;
};

export function GalleryCanvas({
  progressRef,
  targetProgressRef,
  viewRef,
  onFocusLook,
}: GallerySceneProps) {
  return (
    <div className="absolute inset-0 bg-white">
      <Canvas
        className="!absolute inset-0 h-full w-full touch-none"
        camera={{ position: [0, EYE, 0.4], fov: FOV, near: 0.08, far: 40 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#f7f7f4");
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.NoToneMapping;
        }}
      >
        <GalleryWorld
          progressRef={progressRef}
          targetProgressRef={targetProgressRef}
          viewRef={viewRef}
          onFocusLook={onFocusLook}
        />
      </Canvas>
    </div>
  );
}

function GalleryWorld({
  progressRef,
  targetProgressRef,
  viewRef,
  onFocusLook,
}: GallerySceneProps) {
  const { camera } = useThree();
  const textures = useTextures();
  const gaze = useMemo(() => new THREE.Vector3(0, EYE, 5), []);

  useFrame((_, dt) => {
    const k = 1 - Math.exp(-8 * dt);
    progressRef.current +=
      (targetProgressRef.current - progressRef.current) * k;

    const startZ = 0.4;
    const stations = Math.ceil(artworks.length / 2);
    const lastZ = 3.6 + Math.max(0, stations - 1) * 3.2;
    const endZ = Math.max(1.2, lastZ - 1.6);
    const walkZ = startZ + progressRef.current * (endZ - startZ);
    const view = viewRef.current;

    const stand = view
      ? new THREE.Vector3(0, EYE, view.z)
      : new THREE.Vector3(0, EYE, walkZ);
    const look = view
      ? new THREE.Vector3(view.x, EYE, view.z)
      : new THREE.Vector3(0, EYE - 0.08, walkZ + 4.5);

    camera.position.lerp(stand, k);
    gaze.lerp(look, k);
    camera.lookAt(gaze);
  });

  const pieces = useMemo(() => {
    const stations = Math.ceil(artworks.length / 2);
    const out: {
      art: Artwork;
      z: number;
      tex?: THREE.Texture;
      side: "left" | "right";
    }[] = [];

    for (let i = 0; i < stations; i++) {
      const z = 3.6 + i * 3.2;
      const left = artworks[i * 2];
      const right = artworks[i * 2 + 1];
      if (left) out.push({ art: left, z, tex: textures[left.id], side: "left" });
      if (right) out.push({ art: right, z, tex: textures[right.id], side: "right" });
    }
    return out;
  }, [textures]);

  return (
    <>
      <ambientLight intensity={1.15} color="#ffffff" />
      <hemisphereLight args={["#ffffff", "#f3f1ec", 0.35]} />

      <WhiteRoom />

      {pieces.map(({ art, z, tex, side }) => (
        <Picture
          key={`${side}-${art.id}`}
          art={art}
          z={z}
          texture={tex}
          side={side}
          viewRef={viewRef}
          onFocusLook={onFocusLook}
          onLook={() => {
            const x = side === "left" ? -(HALF_W - 0.04) : HALF_W - 0.04;
            const startZ = 0.4;
            const stations = Math.ceil(artworks.length / 2);
            const lastZ = 3.6 + Math.max(0, stations - 1) * 3.2;
            const endZ = Math.max(1.2, lastZ - 1.6);
            const p = THREE.MathUtils.clamp((z - startZ) / (endZ - startZ), 0, 1);
            progressRef.current = p;
            targetProgressRef.current = p;
            viewRef.current = { x, z };
            onFocusLook({
              title: art.title,
              subtitle: art.subtitle,
              productSlug: art.productSlug,
              priceLabel: art.priceLabel,
            });
          }}
        />
      ))}
    </>
  );
}

function WhiteRoom() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, LENGTH / 2]}>
        <planeGeometry args={[HALF_W * 2, LENGTH]} />
        <meshBasicMaterial color="#f4f2ee" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, HALL_H, LENGTH / 2]}>
        <planeGeometry args={[HALF_W * 2, LENGTH]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-HALF_W, HALL_H / 2, LENGTH / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[LENGTH, HALL_H]} />
        <meshBasicMaterial color="#f7f6f3" />
      </mesh>
      <mesh position={[HALF_W, HALL_H / 2, LENGTH / 2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[LENGTH, HALL_H]} />
        <meshBasicMaterial color="#f7f6f3" />
      </mesh>
      <mesh position={[0, HALL_H / 2, LENGTH]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[HALF_W * 2, HALL_H]} />
        <meshBasicMaterial color="#f7f6f3" />
      </mesh>
    </group>
  );
}

function useTextures() {
  const [textures, setTextures] = useState<Record<string, THREE.Texture>>({});

  useEffect(() => {
    let alive = true;
    const loader = new THREE.TextureLoader();
    const next: Record<string, THREE.Texture> = {};
    let pending = artworks.length;

    artworks.forEach((art) => {
      loader.load(art.image, (tex) => {
        if (!alive) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        tex.needsUpdate = true;
        next[art.id] = tex;
        pending -= 1;
        if (pending <= 0 || Object.keys(next).length % 2 === 0) {
          setTextures((prev) => ({ ...prev, ...next }));
        }
      });
    });

    return () => {
      alive = false;
    };
  }, []);

  return textures;
}

function Picture({
  art,
  z,
  texture,
  side,
  viewRef,
  onFocusLook,
  onLook,
}: {
  art: Artwork;
  z: number;
  texture?: THREE.Texture;
  side: "left" | "right";
  viewRef: React.MutableRefObject<GalleryView>;
  onFocusLook: (look: FocusedLook | null) => void;
  onLook: () => void;
}) {
  const img = texture?.image as { width?: number; height?: number } | undefined;
  const aspect =
    img?.width && img?.height ? img.width / img.height : 0.75;
  const h = 1.45;
  const w = Math.min(2.05, Math.max(0.85, h * aspect));
  const x = side === "left" ? -HALF_W + 0.04 : HALF_W - 0.04;
  const rotY = side === "left" ? Math.PI / 2 : -Math.PI / 2;

  const caption = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 96;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, 512, 96);
    ctx.fillStyle = "#111111";
    ctx.font = "500 26px Helvetica Neue, Helvetica, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(art.title.slice(0, 28), 256, 48);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [art.title]);

  return (
    <group position={[x, EYE, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[w + 0.12, h + 0.12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh
        position={[0, 0, 0.03]}
        onPointerDown={(e) => {
          e.stopPropagation();
          onLook();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onLook();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          onFocusLook({
            title: art.title,
            subtitle: art.subtitle,
            productSlug: art.productSlug,
            priceLabel: art.priceLabel,
          });
        }}
        onPointerOut={() => {
          if (viewRef.current && Math.abs(viewRef.current.z - z) < 0.05) return;
          document.body.style.cursor = "grab";
          onFocusLook(null);
        }}
      >
        <planeGeometry args={[w, h]} />
        {texture ? (
          <meshBasicMaterial
            key={texture.uuid}
            map={texture}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        ) : (
          <meshBasicMaterial color="#ecece8" />
        )}
      </mesh>
      <mesh position={[0, -h / 2 - 0.16, 0.03]}>
        <planeGeometry args={[w, 0.16]} />
        <meshBasicMaterial map={caption} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}
