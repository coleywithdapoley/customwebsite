"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { artworks, type Artwork } from "@/lib/gallery-art";

/** Curved gallery hall. The camera walks the aisle so both walls stay in view. */
const HALF_W = 1.55;
const HALL_H = 3.2;
const EYE = 1.58;
const FOV = 58;
const STEPS = 64;
const WALK_START = 0.04;
const WALK_END = 0.74;
const WALK_SPAN = WALK_END - WALK_START;
const DOOR_T = 0.9;

const curve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 0, -2),
    new THREE.Vector3(0.05, 0, 4),
    new THREE.Vector3(0.45, 0, 10),
    new THREE.Vector3(0.85, 0, 16),
    new THREE.Vector3(0.4, 0, 22),
    new THREE.Vector3(0, 0, 28),
  ],
  false,
  "catmullrom",
  0.3,
);

const STATIONS = [0.34, 0.5, 0.66];

function frameAt(t: number) {
  const clamped = THREE.MathUtils.clamp(t, 0.001, 0.999);
  const point = curve.getPointAt(clamped);
  const tangent = curve.getTangentAt(clamped).normalize();
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), tangent).normalize();
  return { point, tangent, right };
}

export type FocusedLook = {
  title: string;
  subtitle: string;
  productSlug: string;
  priceLabel: string;
};

export type GalleryView = { x: number; z: number; sx: number; sz: number } | null;

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
  const start = frameAt(WALK_START);
  return (
    <div className="absolute inset-0 bg-[#141311]">
      <Canvas
        className="!absolute inset-0 h-full w-full touch-none"
        camera={{
          position: [start.point.x, EYE, start.point.z],
          fov: FOV,
          near: 0.08,
          far: 48,
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#141311");
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
  const gaze = useMemo(() => new THREE.Vector3(), []);
  const stand = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const k = 1 - Math.exp(-8 * dt);
    progressRef.current += (targetProgressRef.current - progressRef.current) * k;
    const view = viewRef.current;

    if (view) {
      stand.set(view.sx, EYE, view.sz);
      look.set(view.x, EYE, view.z);
    } else {
      const t = WALK_START + progressRef.current * WALK_SPAN;
      const here = frameAt(t);
      const ahead = frameAt(Math.min(t + 0.12, DOOR_T - 0.02));
      stand.set(here.point.x, EYE, here.point.z);
      look.set(ahead.point.x, EYE - 0.06, ahead.point.z);
    }

    camera.position.lerp(stand, k);
    gaze.lerp(look, k);
    camera.lookAt(gaze);
  });

  const pieces = useMemo(() => {
    const out: {
      art: Artwork;
      tex?: THREE.Texture;
      side: "left" | "right";
      t: number;
    }[] = [];
    STATIONS.forEach((t, i) => {
      const left = artworks[i * 2];
      const right = artworks[i * 2 + 1];
      if (left) out.push({ art: left, tex: textures[left.id], side: "left", t });
      if (right) out.push({ art: right, tex: textures[right.id], side: "right", t });
    });
    return out;
  }, [textures]);

  return (
    <>
      <ambientLight intensity={1} color="#ffffff" />
      <CurvedHall />
      <EndWall />
      <StoreDoor />
      {pieces.map(({ art, tex, side, t }) => (
        <Picture
          key={`${side}-${art.id}`}
          art={art}
          texture={tex}
          side={side}
          t={t}
          viewRef={viewRef}
          progressRef={progressRef}
          targetProgressRef={targetProgressRef}
          onFocusLook={onFocusLook}
        />
      ))}
    </>
  );
}

function useConcrete() {
  const [map, setMap] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load("/images/gallery/surfaces/floor_diff.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.anisotropy = 8;
      setMap(tex);
    });
  }, []);
  return map;
}

function ribbonGeometry(kind: "floor" | "ceiling" | "left" | "right") {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const { point, right } = frameAt(i / STEPS);
    if (kind === "floor" || kind === "ceiling") {
      const y = kind === "floor" ? 0 : HALL_H;
      const a = point.clone().addScaledVector(right, -HALF_W);
      const b = point.clone().addScaledVector(right, HALF_W);
      positions.push(a.x, y, a.z, b.x, y, b.z);
      const v = (i / STEPS) * 10;
      uvs.push(0, v, 2.4, v);
    } else {
      const edge = point.clone().addScaledVector(right, kind === "left" ? -HALF_W : HALF_W);
      positions.push(edge.x, 0, edge.z, edge.x, HALL_H, edge.z);
      const v = (i / STEPS) * 8;
      uvs.push(v, 0, v, 1);
    }
  }
  for (let i = 0; i < STEPS; i++) {
    const o = i * 2;
    if (kind === "ceiling" || kind === "right") {
      indices.push(o, o + 2, o + 1, o + 1, o + 2, o + 3);
    } else {
      indices.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function coveGeometry(side: -1 | 1) {
  const positions: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const { point, right } = frameAt(i / STEPS);
    const outer = point.clone().addScaledVector(right, side * (HALF_W - 0.02));
    const inner = point.clone().addScaledVector(right, side * (HALF_W - 0.34));
    positions.push(outer.x, HALL_H - 0.16, outer.z, inner.x, HALL_H - 0.16, inner.z);
  }
  for (let i = 0; i < STEPS; i++) {
    const o = i * 2;
    indices.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  return geometry;
}

function CurvedHall() {
  const floor = useConcrete();
  const geos = useMemo(
    () => ({
      floor: ribbonGeometry("floor"),
      ceiling: ribbonGeometry("ceiling"),
      left: ribbonGeometry("left"),
      right: ribbonGeometry("right"),
      coveL: coveGeometry(-1),
      coveR: coveGeometry(1),
    }),
    [],
  );
  const doors = useMemo(() => {
    return [0.33, 0.59].flatMap((t) =>
      ([-1, 1] as const).map((side) => {
        const { point, right, tangent } = frameAt(t);
        const spot = point.clone().addScaledVector(right, side * (HALF_W - 0.04));
        return {
          key: `${t}-${side}`,
          position: [spot.x, 1.35, spot.z] as [number, number, number],
          rotation: Math.atan2(tangent.x, tangent.z) + (side < 0 ? Math.PI / 2 : -Math.PI / 2),
        };
      }),
    );
  }, []);

  return (
    <group>
      <mesh geometry={geos.floor}>
        <meshBasicMaterial
          key={floor?.uuid ?? "plain"}
          map={floor ?? undefined}
          color="#ffffff"
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={geos.ceiling}>
        <meshBasicMaterial color="#161412" side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geos.left}>
        <meshBasicMaterial color="#3a342f" side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geos.right}>
        <meshBasicMaterial color="#3a342f" side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geos.coveL}>
        <meshBasicMaterial color="#f0d2a4" side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geos.coveR}>
        <meshBasicMaterial color="#f0d2a4" side={THREE.DoubleSide} />
      </mesh>
      {doors.map((door) => (
        <mesh key={door.key} position={door.position} rotation={[0, door.rotation, 0]}>
          <planeGeometry args={[0.95, 2.15]} />
          <meshBasicMaterial color="#d7e0da" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function EndWall() {
  const { point, tangent } = frameAt(0.965);
  const yaw = Math.atan2(tangent.x, tangent.z) + Math.PI;
  return (
    <mesh position={[point.x, HALL_H / 2, point.z]} rotation={[0, yaw, 0]}>
      <planeGeometry args={[HALF_W * 2 + 0.4, HALL_H]} />
      <meshBasicMaterial color="#2c2824" side={THREE.DoubleSide} />
    </mesh>
  );
}

function StoreDoor() {
  const router = useRouter();
  const { point, tangent } = frameAt(DOOR_T);
  const yaw = Math.atan2(tangent.x, tangent.z) + Math.PI;
  const label = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#f7f4ef";
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = "#1a1918";
    ctx.font = "500 48px Helvetica Neue, Helvetica, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Store", 256, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
  return (
    <group position={[point.x, 1.35, point.z]} rotation={[0, yaw, 0]}>
      <mesh
        onPointerDown={(e) => {
          e.stopPropagation();
          router.push("/");
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "grab";
        }}
      >
        <planeGeometry args={[1.35, 2.35]} />
        <meshBasicMaterial color="#d5ddd8" />
      </mesh>
      <mesh
        position={[0, 0, 0.05]}
        onPointerDown={(e) => {
          e.stopPropagation();
          router.push("/");
        }}
      >
        <planeGeometry args={[1.05, 0.26]} />
        <meshBasicMaterial map={label} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Picture({
  art,
  texture,
  side,
  t,
  viewRef,
  progressRef,
  targetProgressRef,
  onFocusLook,
}: {
  art: Artwork;
  texture?: THREE.Texture;
  side: "left" | "right";
  t: number;
  viewRef: React.MutableRefObject<GalleryView>;
  progressRef: React.MutableRefObject<number>;
  targetProgressRef: React.MutableRefObject<number>;
  onFocusLook: (look: FocusedLook | null) => void;
}) {
  const { point, right, tangent } = frameAt(t);
  const sign = side === "left" ? -1 : 1;
  const spot = point.clone().addScaledVector(right, sign * (HALF_W - 0.06));
  const yaw = Math.atan2(tangent.x, tangent.z);
  const img = texture?.image as { width?: number; height?: number } | undefined;
  const aspect = img?.width && img?.height ? img.width / img.height : 0.8;
  const h = 1.25;
  const w = Math.min(1.05, Math.max(0.72, h * aspect));

  const plaque = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 640;
    c.height = 180;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#f6f3ee";
    ctx.fillRect(0, 0, 640, 180);
    ctx.fillStyle = "#1a1918";
    ctx.font = "500 42px Helvetica Neue, Helvetica, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(art.title.slice(0, 24), 320, 78);
    ctx.fillStyle = "#6a6a6a";
    ctx.font = "400 24px Helvetica Neue, Helvetica, Arial, sans-serif";
    ctx.fillText(art.subtitle, 320, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [art.subtitle, art.title]);

  const lookAtPiece = () => {
    const p = THREE.MathUtils.clamp((t - WALK_START) / WALK_SPAN, 0, 1);
    progressRef.current = p;
    targetProgressRef.current = p;
    viewRef.current = {
      x: spot.x,
      z: spot.z,
      sx: point.x,
      sz: point.z,
    };
    onFocusLook({
      title: art.title,
      subtitle: art.subtitle,
      productSlug: art.productSlug,
      priceLabel: art.priceLabel,
    });
  };

  return (
    <group position={[spot.x, EYE + 0.15, spot.z]} rotation={[0, yaw + (side === "left" ? Math.PI / 2 : -Math.PI / 2), 0]}>
      <mesh position={[0, h / 2 + 0.16, 0.05]}>
        <boxGeometry args={[w * 0.7, 0.045, 0.06]} />
        <meshBasicMaterial color="#1a1918" />
      </mesh>
      <mesh position={[0, h / 2 + 0.16, 0.09]}>
        <boxGeometry args={[w * 0.55, 0.02, 0.02]} />
        <meshBasicMaterial color="#ffe7c4" />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[w + 0.12, h + 0.12, 0.05]} />
        <meshBasicMaterial color="#141312" />
      </mesh>
      <mesh
        position={[0, 0, 0.06]}
        onPointerDown={(e) => {
          e.stopPropagation();
          lookAtPiece();
        }}
        onClick={(e) => {
          e.stopPropagation();
          lookAtPiece();
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
          const view = viewRef.current;
          if (view && Math.abs(view.x - spot.x) < 0.05 && Math.abs(view.z - spot.z) < 0.05) return;
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
          <meshBasicMaterial color="#3a3834" />
        )}
      </mesh>
      <mesh position={[0, -h / 2 - 0.28, 0.05]}>
        <planeGeometry args={[w * 0.92, 0.32]} />
        <meshBasicMaterial map={plaque} toneMapped={false} />
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
