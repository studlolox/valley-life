// Valley Life - Procedural 3D Assets, Textures & Animations
// All 3D meshes, canvas textures, and animation helpers written from scratch.

import * as THREE from 'three';
import { CROPS, CHICKEN_VARIANTS } from './data.js';

// ============ Shared Material & Geometry Cache ============
const _matCache = new Map();
const _texCache = new Map();

function getMat(color, opts = {}) {
  const key = `${color}|${opts.roughness ?? 0.8}|${opts.metalness ?? 0.05}|${opts.emissive ?? 0}|${opts.transparent ?? false}|${opts.opacity ?? 1}`;
  if (_matCache.has(key)) return _matCache.get(key);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.8,
    metalness: opts.metalness ?? 0.05,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
  });
  _matCache.set(key, mat);
  return mat;
}

function makePart(geo, mat, pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1]) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.scale.set(scale[0], scale[1], scale[2]);
  return m;
}

// ============ 1. Procedural Canvas Textures ============
function makeCanvasTexture(key, size, drawFn) {
  if (_texCache.has(key)) return _texCache.get(key);
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  let ctx = null;
  try {
    ctx = canvas.getContext('2d');
  } catch {
    ctx = null;
  }
  if (!ctx) return null; // Headless JSDOM without node-canvas
  drawFn(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  _texCache.set(key, tex);
  return tex;
}

function seededNoise(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

export function createTileTextures() {
  return {
    grass: makeCanvasTexture('tile_grass', 64, (ctx, s) => {
      ctx.fillStyle = '#5fa83a';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 90; i++) {
        const x = Math.floor(seededNoise(i, 1) * s);
        const y = Math.floor(seededNoise(i, 2) * s);
        ctx.fillStyle = i % 3 === 0 ? '#72bf48' : '#4e8f2f';
        ctx.fillRect(x, y, 2, 4);
      }
    }),
    dirt: makeCanvasTexture('tile_dirt', 64, (ctx, s) => {
      ctx.fillStyle = '#9c7146';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 70; i++) {
        const x = Math.floor(seededNoise(i, 3) * s);
        const y = Math.floor(seededNoise(i, 4) * s);
        ctx.fillStyle = i % 2 === 0 ? '#875f39' : '#b08354';
        ctx.fillRect(x, y, 3, 2);
      }
    }),
    cobble: makeCanvasTexture('tile_cobble', 64, (ctx, s) => {
      ctx.fillStyle = '#75757a';
      ctx.fillRect(0, 0, s, s);
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const offset = (r % 2) * 8;
          ctx.fillStyle = (r + c) % 2 === 0 ? '#92949c' : '#82848c';
          ctx.fillRect((c * 16 + offset) % s + 1, r * 16 + 1, 13, 13);
        }
      }
    }),
    tilled: makeCanvasTexture('tile_tilled', 64, (ctx, s) => {
      ctx.fillStyle = '#7a4b26';
      ctx.fillRect(0, 0, s, s);
      for (let y = 4; y < s; y += 10) {
        ctx.fillStyle = '#5e3618';
        ctx.fillRect(0, y, s, 4);
        ctx.fillStyle = '#8f5a30';
        ctx.fillRect(0, y + 4, s, 2);
      }
    }),
    watered: makeCanvasTexture('tile_watered', 64, (ctx, s) => {
      ctx.fillStyle = '#472a14';
      ctx.fillRect(0, 0, s, s);
      for (let y = 4; y < s; y += 10) {
        ctx.fillStyle = '#311b0b';
        ctx.fillRect(0, y, s, 4);
        ctx.fillStyle = '#59371c';
        ctx.fillRect(0, y + 4, s, 2);
      }
    }),
    wood: makeCanvasTexture('tile_wood', 64, (ctx, s) => {
      ctx.fillStyle = '#9c6838';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#734822';
      for (let y = 0; y < s; y += 16) ctx.fillRect(0, y, s, 2);
      for (let x = 16; x < s; x += 32) ctx.fillRect(x, 0, 2, s);
    }),
    sand: makeCanvasTexture('tile_sand', 64, (ctx, s) => {
      ctx.fillStyle = '#e5cf8e';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 60; i++) {
        const x = Math.floor(seededNoise(i, 7) * s);
        const y = Math.floor(seededNoise(i, 8) * s);
        ctx.fillStyle = i % 2 === 0 ? '#d8be79' : '#f2dea0';
        ctx.fillRect(x, y, 2, 2);
      }
    }),
    cave: makeCanvasTexture('tile_cave', 64, (ctx, s) => {
      ctx.fillStyle = '#3d3c44';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 80; i++) {
        const x = Math.floor(seededNoise(i, 9) * s);
        const y = Math.floor(seededNoise(i, 10) * s);
        ctx.fillStyle = i % 2 === 0 ? '#2f2e36' : '#4f4e58';
        ctx.fillRect(x, y, 3, 3);
      }
    }),
    water: makeCanvasTexture('tile_water', 64, (ctx, s) => {
      ctx.fillStyle = '#2d7bb8';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#4fa3e0';
      for (let y = 8; y < s; y += 16) {
        ctx.fillRect(6, y, 20, 2);
        ctx.fillRect(36, y + 6, 18, 2);
      }
    }),
  };
}

// ============ 2. Articulated Characters & Tools ============
export const NPC_APPEARANCES = {
  elder:     { hairColor: '#d9d9d9', shirtColor: '#2c3e50', pantsColor: '#1f2937', skinColor: '#f0c4a0', hat: 'tophat' },
  baker:     { hairColor: '#c06c44', shirtColor: '#f8fafc', pantsColor: '#8b4513', skinColor: '#f5cfa8', hat: 'chef' },
  smith:     { hairColor: '#3b2416', shirtColor: '#5c3a21', pantsColor: '#2c2c34', skinColor: '#d99e75', hat: 'bandana' },
  farmer:    { hairColor: '#7c4722', shirtColor: '#3a863a', pantsColor: '#3b5998', skinColor: '#f2c6a0', hat: 'straw' },
  tailor:    { hairColor: '#9b59b6', shirtColor: '#e84393', pantsColor: '#2d3436', skinColor: '#f5cfb0', hat: 'beret' },
  librarian: { hairColor: '#2d2d2d', shirtColor: '#485460', pantsColor: '#1e272e', skinColor: '#eec6a8', hat: 'none' },
  carpenter: { hairColor: '#b55239', shirtColor: '#d35400', pantsColor: '#34495e', skinColor: '#f0c4a0', hat: 'cap' },
  angler:    { hairColor: '#7f8c8d', shirtColor: '#2980b9', pantsColor: '#2c3e50', skinColor: '#e2ad84', hat: 'beanie' },
  merchant:  { hairColor: '#d4a017', shirtColor: '#8e44ad', pantsColor: '#2c2c54', skinColor: '#f5cfa8', hat: 'none' },
  mystic:    { hairColor: '#4b0082', shirtColor: '#3c1361', pantsColor: '#1a0b2e', skinColor: '#e6c2a5', hat: 'wizard' },
  rancher:   { hairColor: '#a0522d', shirtColor: '#c0392b', pantsColor: '#3b5998', skinColor: '#f0c29c', hat: 'cowboy' },
  innkeeper: { hairColor: '#5c3317', shirtColor: '#b33939', pantsColor: '#2f3640', skinColor: '#ecc09c', hat: 'none' },
};

const TIER_COLORS = [0x95a5a6, 0xcd7f32, 0xbec2cb, 0xf1c40f, 0x9b59b6];

export function createToolMesh(toolName, level = 0) {
  const group = new THREE.Group();
  const handleMat = getMat(0x6e4726);
  const headMat = getMat(TIER_COLORS[Math.min(level, TIER_COLORS.length - 1)], { metalness: 0.5, roughness: 0.35 });

  if (toolName === 'water') {
    const can = makePart(new THREE.CylinderGeometry(0.14, 0.16, 0.24, 8), getMat(0x3498db, { metalness: 0.3 }), [0, 0, 0.14]);
    const spout = makePart(new THREE.CylinderGeometry(0.03, 0.05, 0.22, 6), getMat(0x2980b9), [0, 0.06, 0.28], [Math.PI / 3, 0, 0]);
    group.add(can, spout);
    return group;
  }

  // Handle for pole/blade tools
  const length = toolName === 'rod' ? 0.95 : 0.55;
  const handle = makePart(new THREE.CylinderGeometry(0.03, 0.03, length, 6), handleMat, [0, length * 0.45, 0]);
  group.add(handle);

  if (toolName === 'hoe') {
    group.add(makePart(new THREE.BoxGeometry(0.06, 0.05, 0.24), headMat, [0, length * 0.88, 0.08]));
  } else if (toolName === 'axe') {
    group.add(makePart(new THREE.BoxGeometry(0.05, 0.18, 0.2), headMat, [0, length * 0.84, 0.07]));
  } else if (toolName === 'pickaxe') {
    group.add(makePart(new THREE.BoxGeometry(0.05, 0.06, 0.34), headMat, [0, length * 0.88, 0]));
  } else if (toolName === 'scythe') {
    group.add(makePart(new THREE.BoxGeometry(0.03, 0.05, 0.32), headMat, [0, length * 0.88, 0.12], [0, 0.25, 0]));
  } else if (toolName === 'sword') {
    handle.scale.y = 0.4;
    group.add(makePart(new THREE.BoxGeometry(0.18, 0.04, 0.06), getMat(0xd4af37, { metalness: 0.6 }), [0, 0.24, 0]));
    group.add(makePart(new THREE.BoxGeometry(0.06, 0.58, 0.03), headMat, [0, 0.55, 0]));
  } else if (toolName === 'rod') {
    group.add(makePart(new THREE.CylinderGeometry(0.01, 0.01, 0.45, 4), getMat(0xecf0f1), [0, length * 0.72, 0.12]));
  }
  return group;
}

function createHatMesh(hatType, hairColor) {
  if (!hatType || hatType === 'none') return null;
  const g = new THREE.Group();
  if (hatType === 'tophat') {
    g.add(makePart(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 10), getMat(0x1f2937), [0, 0.24, 0]));
    g.add(makePart(new THREE.CylinderGeometry(0.18, 0.19, 0.24, 10), getMat(0x1f2937), [0, 0.38, 0]));
  } else if (hatType === 'chef') {
    g.add(makePart(new THREE.CylinderGeometry(0.22, 0.2, 0.14, 10), getMat(0xffffff), [0, 0.28, 0]));
    g.add(makePart(new THREE.SphereGeometry(0.23, 10, 8), getMat(0xffffff), [0, 0.38, 0]));
  } else if (hatType === 'straw' || hatType === 'cowboy') {
    const col = hatType === 'straw' ? 0xe6c25b : 0x7c4a26;
    g.add(makePart(new THREE.CylinderGeometry(0.36, 0.38, 0.04, 12), getMat(col), [0, 0.23, 0]));
    g.add(makePart(new THREE.CylinderGeometry(0.18, 0.21, 0.18, 10), getMat(col), [0, 0.32, 0]));
  } else if (hatType === 'wizard') {
    g.add(makePart(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 12), getMat(0x4b0082), [0, 0.22, 0]));
    g.add(makePart(new THREE.ConeGeometry(0.22, 0.48, 10), getMat(0x4b0082), [0, 0.46, 0]));
  } else if (hatType === 'beret' || hatType === 'beanie' || hatType === 'cap' || hatType === 'bandana') {
    const col = hatType === 'beret' ? 0xc0392b : hatType === 'beanie' ? 0x2980b9 : hatType === 'bandana' ? 0xb03a2e : 0xd35400;
    g.add(makePart(new THREE.SphereGeometry(0.24, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), getMat(col), [0, 0.18, 0]));
    if (hatType === 'cap') {
      g.add(makePart(new THREE.BoxGeometry(0.26, 0.03, 0.18), getMat(col), [0, 0.2, 0.18]));
    }
  }
  return g;
}

export function createCharacterMesh(options = {}) {
  const role = options.role || 'player';
  if (role === 'mosskin') {
    const g = new THREE.Group();
    const body = makePart(new THREE.SphereGeometry(0.32, 12, 10), getMat(0x6bd46b, { emissive: 0x1b4d1b, emissiveIntensity: 0.4 }), [0, 0.4, 0]);
    const leaf = makePart(new THREE.ConeGeometry(0.1, 0.24, 5), getMat(0x2ecc71), [0, 0.78, 0], [0, 0, 0.2]);
    const eyeL = makePart(new THREE.SphereGeometry(0.04, 6, 6), getMat(0x111111), [-0.1, 0.45, 0.28]);
    const eyeR = makePart(new THREE.SphereGeometry(0.04, 6, 6), getMat(0x111111), [0.1, 0.45, 0.28]);
    g.add(body, leaf, eyeL, eyeR);
    g.userData = { role, animState: 'idle', body };
    return g;
  }

  const preset = NPC_APPEARANCES[role] || {};
  const hairColor = options.hairColor || preset.hairColor || '#5C3A21';
  const shirtColor = options.shirtColor || preset.shirtColor || '#4169E1';
  const pantsColor = options.pantsColor || preset.pantsColor || '#2c3e50';
  const skinColor = options.skinColor || preset.skinColor || '#f2c6a0';
  const hatType = options.hat || preset.hat || 'none';
  const isChild = role === 'child';

  const group = new THREE.Group();
  const scaleFactor = isChild ? 0.68 : 1;

  const torso = makePart(new THREE.BoxGeometry(0.52, 0.62, 0.3), getMat(shirtColor), [0, 0.78, 0]);
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.32, 0);
  const head = makePart(new THREE.BoxGeometry(0.42, 0.42, 0.42), getMat(skinColor), [0, 0, 0]);
  const hair = makePart(new THREE.BoxGeometry(0.45, 0.18, 0.45), getMat(hairColor), [0, 0.16, -0.02]);
  const eyeL = makePart(new THREE.BoxGeometry(0.06, 0.07, 0.04), getMat(0x1e293b), [-0.1, 0.02, 0.21]);
  const eyeR = makePart(new THREE.BoxGeometry(0.06, 0.07, 0.04), getMat(0x1e293b), [0.1, 0.02, 0.21]);
  headGroup.add(head, hair, eyeL, eyeR);

  const hat = createHatMesh(hatType, hairColor);
  if (hat) headGroup.add(hat);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.34, 1.02, 0);
  leftArm.add(makePart(new THREE.BoxGeometry(0.16, 0.52, 0.16), getMat(shirtColor), [0, -0.22, 0]));
  leftArm.add(makePart(new THREE.BoxGeometry(0.14, 0.12, 0.14), getMat(skinColor), [0, -0.48, 0]));

  const rightArm = new THREE.Group();
  rightArm.position.set(0.34, 1.02, 0);
  rightArm.add(makePart(new THREE.BoxGeometry(0.16, 0.52, 0.16), getMat(shirtColor), [0, -0.22, 0]));
  rightArm.add(makePart(new THREE.BoxGeometry(0.14, 0.12, 0.14), getMat(skinColor), [0, -0.48, 0]));

  const toolMount = new THREE.Group();
  toolMount.position.set(0, -0.48, 0.08);
  toolMount.rotation.x = Math.PI / 2;
  rightArm.add(toolMount);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.14, 0.48, 0);
  leftLeg.add(makePart(new THREE.BoxGeometry(0.2, 0.46, 0.22), getMat(pantsColor), [0, -0.23, 0]));

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.14, 0.48, 0);
  rightLeg.add(makePart(new THREE.BoxGeometry(0.2, 0.46, 0.22), getMat(pantsColor), [0, -0.23, 0]));

  group.add(torso, headGroup, leftArm, rightArm, leftLeg, rightLeg);
  group.scale.setScalar(scaleFactor);

  group.userData = {
    role,
    head: headGroup,
    torso,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    toolMount,
    heldTool: null,
    iconBadge: null,
    animState: 'idle',
    swingTimer: 0,
  };

  if (options.tool) {
    setCharacterTool(group, options.tool, options.toolLevel || 0);
  }
  return group;
}

export function setCharacterTool(charGroup, toolName, level = 0) {
  if (!charGroup?.userData?.toolMount) return;
  const mount = charGroup.userData.toolMount;
  while (mount.children.length) mount.remove(mount.children[0]);
  if (!toolName) {
    charGroup.userData.heldTool = null;
    return;
  }
  const toolMesh = createToolMesh(toolName, level);
  mount.add(toolMesh);
  charGroup.userData.heldTool = toolMesh;
}

export function setCharacterIcon(charGroup, iconType) {
  if (!charGroup?.userData) return;
  if (charGroup.userData.iconBadge) {
    charGroup.remove(charGroup.userData.iconBadge);
    charGroup.userData.iconBadge = null;
  }
  if (!iconType) return;

  const badge = new THREE.Group();
  badge.position.set(0, 1.95, 0);
  if (iconType === 'heart') {
    const mat = getMat(0xe74c3c, { emissive: 0x550000, emissiveIntensity: 0.4 });
    badge.add(makePart(new THREE.SphereGeometry(0.1, 8, 8), mat, [-0.07, 0.05, 0]));
    badge.add(makePart(new THREE.SphereGeometry(0.1, 8, 8), mat, [0.07, 0.05, 0]));
    badge.add(makePart(new THREE.ConeGeometry(0.15, 0.2, 4), mat, [0, -0.07, 0], [Math.PI, Math.PI / 4, 0]));
  } else {
    const color = iconType === '!' ? 0xf1c40f : 0x3498db;
    const mat = getMat(color, { emissive: color, emissiveIntensity: 0.3 });
    badge.add(makePart(new THREE.BoxGeometry(0.09, 0.24, 0.09), mat, [0, 0.08, 0]));
    badge.add(makePart(new THREE.BoxGeometry(0.09, 0.09, 0.09), mat, [0, -0.11, 0]));
  }
  charGroup.add(badge);
  charGroup.userData.iconBadge = badge;
}

export function animateCharacter(charGroup, dt = 0.016, time = 0, opts = {}) {
  const ud = charGroup?.userData;
  if (!ud) return;
  if (ud.role === 'mosskin' && ud.body) {
    ud.body.position.y = 0.4 + Math.sin(time * 3.5) * 0.08;
    return;
  }
  if (!ud.leftLeg) return;

  const moving = !!opts.moving;
  const fishing = !!opts.fishing;

  if (ud.swingTimer > 0) {
    ud.swingTimer = Math.max(0, ud.swingTimer - dt);
    const p = Math.sin((ud.swingTimer / 0.28) * Math.PI);
    ud.rightArm.rotation.x = -p * 1.4;
  } else if (fishing) {
    ud.rightArm.rotation.x = -0.9 + Math.sin(time * 2) * 0.05;
    ud.leftArm.rotation.x = -0.3;
  } else if (moving) {
    const s = Math.sin(time * 10);
    ud.leftLeg.rotation.x = s * 0.55;
    ud.rightLeg.rotation.x = -s * 0.55;
    ud.leftArm.rotation.x = -s * 0.45;
    ud.rightArm.rotation.x = s * 0.45;
  } else {
    ud.leftLeg.rotation.x *= 0.8;
    ud.rightLeg.rotation.x *= 0.8;
    ud.leftArm.rotation.x *= 0.8;
    ud.rightArm.rotation.x *= 0.8;
  }

  if (ud.iconBadge) {
    ud.iconBadge.position.y = 1.95 + Math.sin(time * 4) * 0.07;
    ud.iconBadge.rotation.y = time * 1.5;
  }
}

// ============ 3. Nature, Foliage, Rocks, Ores & Forageables ============
const SEASON_FOLIAGE = {
  Spring: [0xffb7c5, 0x6ab04c, 0x82cc58],
  Summer: [0x2ecc71, 0x27ae60, 0x1e8449],
  Autumn: [0xe67e22, 0xd35400, 0xc0392b],
  Winter: [0xdce6f0, 0xa8c0d4, 0x6d8299],
};

export function createTreeMesh(season = 'Spring') {
  const group = new THREE.Group();
  const trunk = makePart(new THREE.CylinderGeometry(0.18, 0.28, 1.3, 8), getMat(0x6e4726), [0, 0.65, 0]);
  group.add(trunk);

  const canopy = new THREE.Group();
  canopy.position.set(0, 1.2, 0);
  const cols = SEASON_FOLIAGE[season] || SEASON_FOLIAGE.Spring;
  canopy.add(makePart(new THREE.ConeGeometry(0.85, 1.1, 8), getMat(cols[0]), [0, 0.35, 0]));
  canopy.add(makePart(new THREE.ConeGeometry(0.68, 0.95, 8), getMat(cols[1]), [0, 0.95, 0]));
  canopy.add(makePart(new THREE.ConeGeometry(0.45, 0.75, 8), getMat(cols[2]), [0, 1.48, 0]));
  group.add(canopy);
  group.userData = { kind: 'tree', canopy, shakeTimer: 0 };
  return group;
}

export function createRockMesh() {
  const g = new THREE.Group();
  g.add(makePart(new THREE.IcosahedronGeometry(0.48, 0), getMat(0x7f8c8d, { roughness: 0.9 }), [0, 0.34, 0], [0.2, 0.4, 0.1], [1.1, 0.78, 1]));
  g.add(makePart(new THREE.IcosahedronGeometry(0.24, 0), getMat(0x636e72, { roughness: 0.9 }), [0.28, 0.18, 0.2]));
  return g;
}

export function createOreNodeMesh(oreType = 'copperOre') {
  const g = createRockMesh();
  const crystalColor = oreType === 'goldOre' ? 0xf1c40f : oreType === 'ironOre' ? 0xbec2cb : 0xd37538;
  const mat = getMat(crystalColor, { metalness: 0.55, roughness: 0.25, emissive: crystalColor, emissiveIntensity: 0.15 });
  g.add(makePart(new THREE.OctahedronGeometry(0.18, 0), mat, [-0.15, 0.52, 0.18], [0.4, 0.2, 0.3]));
  g.add(makePart(new THREE.OctahedronGeometry(0.15, 0), mat, [0.16, 0.45, -0.14], [-0.3, 0.5, 0.2]));
  return g;
}

export function createWeedMesh() {
  const g = new THREE.Group();
  const mat = getMat(0x6ab04c);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    g.add(makePart(new THREE.ConeGeometry(0.1, 0.42, 4), mat, [Math.cos(a) * 0.15, 0.21, Math.sin(a) * 0.15], [Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35]));
  }
  return g;
}

export function createWildflowerMesh(season = 'Spring') {
  const g = new THREE.Group();
  const col = season === 'Autumn' ? 0xe67e22 : season === 'Winter' ? 0x74b9ff : 0xfdcb6e;
  g.add(makePart(new THREE.CylinderGeometry(0.03, 0.03, 0.28, 5), getMat(0x27ae60), [0, 0.14, 0]));
  g.add(makePart(new THREE.DodecahedronGeometry(0.12, 0), getMat(col), [0, 0.3, 0]));
  return g;
}

export function createBushMesh(season = 'Spring') {
  const g = new THREE.Group();
  const col = (SEASON_FOLIAGE[season] || SEASON_FOLIAGE.Spring)[1];
  g.add(makePart(new THREE.SphereGeometry(0.38, 8, 6), getMat(col), [0, 0.3, 0], [0, 0, 0], [1.2, 0.85, 1.1]));
  g.add(makePart(new THREE.SphereGeometry(0.26, 8, 6), getMat(col), [0.24, 0.22, 0.12]));
  return g;
}

export function createFenceMesh() {
  const g = new THREE.Group();
  const mat = getMat(0x8d5b2d);
  g.add(makePart(new THREE.BoxGeometry(0.16, 0.72, 0.16), mat, [-0.45, 0.36, 0]));
  g.add(makePart(new THREE.BoxGeometry(0.16, 0.72, 0.16), mat, [0.45, 0.36, 0]));
  g.add(makePart(new THREE.BoxGeometry(1.1, 0.1, 0.08), mat, [0, 0.52, 0]));
  g.add(makePart(new THREE.BoxGeometry(1.1, 0.1, 0.08), mat, [0, 0.26, 0]));
  return g;
}

export function createLanternPostMesh(isNight = false) {
  const g = new THREE.Group();
  g.add(makePart(new THREE.CylinderGeometry(0.08, 0.11, 1.7, 6), getMat(0x2d3436), [0, 0.85, 0]));
  g.add(makePart(new THREE.BoxGeometry(0.32, 0.08, 0.08), getMat(0x2d3436), [0.14, 1.66, 0]));
  const lampMat = isNight
    ? getMat(0xffeaa7, { emissive: 0xfdcb6e, emissiveIntensity: 1.2 })
    : getMat(0xdfe6e9);
  g.add(makePart(new THREE.BoxGeometry(0.2, 0.26, 0.2), lampMat, [0.26, 1.48, 0]));
  return g;
}

export function createForageMesh(forageType = 'wildRoot') {
  const g = new THREE.Group();
  if (forageType === 'mushroom') {
    g.add(makePart(new THREE.CylinderGeometry(0.07, 0.09, 0.22, 6), getMat(0xf5eedc), [0, 0.11, 0]));
    g.add(makePart(new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), getMat(0xc0392b), [0, 0.2, 0]));
  } else if (forageType === 'seashell') {
    g.add(makePart(new THREE.ConeGeometry(0.2, 0.26, 7), getMat(0xf8c291), [0, 0.12, 0], [Math.PI / 2, 0, 0]));
  } else if (forageType === 'berry' || forageType === 'snowBerry') {
    const col = forageType === 'snowBerry' ? 0x74b9ff : 0x8e44ad;
    g.add(makePart(new THREE.SphereGeometry(0.18, 7, 6), getMat(0x27ae60), [0, 0.16, 0]));
    g.add(makePart(new THREE.SphereGeometry(0.07, 6, 6), getMat(col), [-0.09, 0.25, 0.1]));
    g.add(makePart(new THREE.SphereGeometry(0.07, 6, 6), getMat(col), [0.1, 0.22, -0.06]));
  } else if (forageType === 'purpleHerb' || forageType === 'springOnion') {
    const col = forageType === 'purpleHerb' ? 0x9b59b6 : 0x2ecc71;
    g.add(makePart(new THREE.CylinderGeometry(0.05, 0.08, 0.34, 6), getMat(col), [0, 0.17, 0]));
    g.add(makePart(new THREE.SphereGeometry(0.11, 6, 6), getMat(0xe84393), [0, 0.35, 0]));
  } else {
    g.add(makePart(new THREE.DodecahedronGeometry(0.16, 0), getMat(0xb8860b), [0, 0.14, 0]));
    g.add(makePart(new THREE.ConeGeometry(0.08, 0.22, 5), getMat(0x2ecc71), [0, 0.3, 0]));
  }
  return g;
}

// ============ 4. Multi-Stage 3D Crops (All 16 Crops × 4 Stages) ============
const CROP_VISUALS = {
  turnip:      { color: 0xecf0f1, accent: 0x8e44ad, shape: 'bulb' },
  strawberry:  { color: 0xe74c3c, accent: 0x27ae60, shape: 'berry' },
  potato:      { color: 0xb88652, accent: 0x2ecc71, shape: 'bulb' },
  cauliflower: { color: 0xf5f6fa, accent: 0x27ae60, shape: 'head' },
  bean:        { color: 0x2ecc71, accent: 0x8d5b2d, shape: 'trellis' },
  melon:       { color: 0xf78fb3, accent: 0x27ae60, shape: 'melon' },
  tomato:      { color: 0xe74c3c, accent: 0x8d5b2d, shape: 'trellis' },
  blueberry:   { color: 0x2980b9, accent: 0x27ae60, shape: 'berry' },
  squash:      { color: 0xf39c12, accent: 0x27ae60, shape: 'melon' },
  pumpkin:     { color: 0xe67e22, accent: 0x27ae60, shape: 'melon' },
  corn:        { color: 0xf1c40f, accent: 0x27ae60, shape: 'stalk' },
  cranberry:   { color: 0xc0392b, accent: 0x27ae60, shape: 'berry' },
  root:        { color: 0x74b9ff, accent: 0xdff9fb, shape: 'bulb' },
  frostherb:   { color: 0x81ecec, accent: 0x00cec9, shape: 'stalk' },
  snowdrop:    { color: 0xffffff, accent: 0x74b9ff, shape: 'head' },
  iceberry:    { color: 0x0984e3, accent: 0xdff9fb, shape: 'berry' },
};

export function createCropMesh(cropKey = 'turnip', stage = 0) {
  const g = new THREE.Group();
  const s = Math.max(0, Math.min(3, stage));
  const spec = CROP_VISUALS[cropKey] || CROP_VISUALS.turnip;

  if (s === 0) {
    // Stage 0: scattered seed mounds
    const mat = getMat(0xd4b483);
    g.add(makePart(new THREE.SphereGeometry(0.06, 5, 4), mat, [-0.15, 0.04, -0.1]));
    g.add(makePart(new THREE.SphereGeometry(0.06, 5, 4), mat, [0.14, 0.04, 0.08]));
    g.add(makePart(new THREE.SphereGeometry(0.06, 5, 4), mat, [-0.04, 0.04, 0.16]));
  } else if (s === 1) {
    // Stage 1: tiny twin-leaf sprout
    const leafMat = getMat(0x6ab04c);
    g.add(makePart(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 5), leafMat, [0, 0.09, 0]));
    g.add(makePart(new THREE.BoxGeometry(0.18, 0.04, 0.09), leafMat, [-0.08, 0.18, 0], [0, 0, 0.35]));
    g.add(makePart(new THREE.BoxGeometry(0.18, 0.04, 0.09), leafMat, [0.08, 0.18, 0], [0, 0, -0.35]));
  } else if (s === 2) {
    // Stage 2: leafy bush / vine
    const leafMat = getMat(0x27ae60);
    if (spec.shape === 'trellis') {
      g.add(makePart(new THREE.CylinderGeometry(0.04, 0.04, 0.72, 5), getMat(0x8d5b2d), [0, 0.36, 0]));
    }
    g.add(makePart(new THREE.SphereGeometry(0.24, 7, 6), leafMat, [0, 0.24, 0], [0, 0, 0], [1.1, 0.9, 1.1]));
  } else {
    // Stage 3: ripe produce model
    const fruitMat = getMat(spec.color);
    const leafMat = getMat(spec.accent);
    if (spec.shape === 'trellis') {
      g.add(makePart(new THREE.CylinderGeometry(0.04, 0.04, 0.88, 5), leafMat, [0, 0.44, 0]));
      g.add(makePart(new THREE.SphereGeometry(0.22, 7, 6), getMat(0x27ae60), [0, 0.45, 0]));
      g.add(makePart(new THREE.SphereGeometry(0.11, 6, 6), fruitMat, [0.14, 0.52, 0.14]));
      g.add(makePart(new THREE.SphereGeometry(0.11, 6, 6), fruitMat, [-0.14, 0.38, 0.12]));
    } else if (spec.shape === 'melon') {
      g.add(makePart(new THREE.SphereGeometry(0.28, 10, 8), fruitMat, [0, 0.25, 0], [0, 0, 0], [1.1, 0.9, 1.1]));
      g.add(makePart(new THREE.CylinderGeometry(0.04, 0.05, 0.14, 5), leafMat, [0, 0.52, 0]));
    } else if (spec.shape === 'stalk') {
      g.add(makePart(new THREE.CylinderGeometry(0.06, 0.08, 0.65, 6), leafMat, [0, 0.32, 0]));
      g.add(makePart(new THREE.CylinderGeometry(0.08, 0.08, 0.26, 6), fruitMat, [0.1, 0.48, 0], [0, 0, -0.3]));
    } else if (spec.shape === 'berry') {
      g.add(makePart(new THREE.SphereGeometry(0.26, 8, 6), leafMat, [0, 0.24, 0]));
      g.add(makePart(new THREE.SphereGeometry(0.09, 6, 6), fruitMat, [-0.14, 0.32, 0.14]));
      g.add(makePart(new THREE.SphereGeometry(0.09, 6, 6), fruitMat, [0.14, 0.28, 0.14]));
      g.add(makePart(new THREE.SphereGeometry(0.09, 6, 6), fruitMat, [0, 0.42, -0.1]));
    } else if (spec.shape === 'head') {
      g.add(makePart(new THREE.SphereGeometry(0.24, 9, 7), fruitMat, [0, 0.24, 0]));
      g.add(makePart(new THREE.BoxGeometry(0.55, 0.08, 0.55), leafMat, [0, 0.1, 0]));
    } else {
      // bulb (turnip, potato, root)
      g.add(makePart(new THREE.SphereGeometry(0.2, 8, 7), fruitMat, [0, 0.18, 0]));
      g.add(makePart(new THREE.ConeGeometry(0.14, 0.3, 5), leafMat, [0, 0.44, 0]));
    }
  }

  g.userData = { kind: 'crop', cropKey, stage: s };
  return g;
}

// ============ 5. Buildings & Interactive Props ============
export function createBuildingMesh(type = 'farmhouse', options = {}) {
  const g = new THREE.Group();
  const isNight = !!options.isNight;
  const winMat = isNight
    ? getMat(0xffeaa7, { emissive: 0xfdcb6e, emissiveIntensity: 0.9 })
    : getMat(0x81ecec);

  if (type === 'shippingBin') {
    g.add(makePart(new THREE.BoxGeometry(1.1, 0.72, 0.85), getMat(0x8d5b2d), [0, 0.36, 0]));
    const lid = makePart(new THREE.BoxGeometry(1.16, 0.1, 0.9), getMat(0xa06b38), [0, 0.76, 0]);
    g.add(lid);
    g.userData = { kind: 'shippingBin', lid };
    return g;
  }

  if (type === 'furnace') {
    g.add(makePart(new THREE.CylinderGeometry(0.36, 0.44, 0.9, 8), getMat(0x636e72), [0, 0.45, 0]));
    const emberMat = getMat(0xe67e22, { emissive: 0xd35400, emissiveIntensity: options.active ? 1.4 : 0.2 });
    const ember = makePart(new THREE.BoxGeometry(0.24, 0.22, 0.1), emberMat, [0, 0.28, 0.38]);
    g.add(ember);
    g.userData = { kind: 'furnace', ember };
    return g;
  }

  if (['mayoPress', 'cheesePress', 'loom', 'preservesJar'].includes(type)) {
    const col = type === 'mayoPress' ? 0xf5f6fa : type === 'cheesePress' ? 0xf1c40f : type === 'loom' ? 0xa06b38 : 0x9b59b6;
    g.add(makePart(new THREE.BoxGeometry(0.55, 0.7, 0.55), getMat(col), [0, 0.35, 0]));
    g.add(makePart(new THREE.CylinderGeometry(0.2, 0.24, 0.22, 8), getMat(0x7f8c8d), [0, 0.8, 0]));
    return g;
  }

  if (type === 'bulletinBoard') {
    g.add(makePart(new THREE.BoxGeometry(0.12, 1.3, 0.12), getMat(0x6e4726), [-0.65, 0.65, 0]));
    g.add(makePart(new THREE.BoxGeometry(0.12, 1.3, 0.12), getMat(0x6e4726), [0.65, 0.65, 0]));
    g.add(makePart(new THREE.BoxGeometry(1.4, 0.85, 0.1), getMat(0xd4a373), [0, 1.0, 0]));
    return g;
  }

  if (type === 'mineEntrance') {
    g.add(makePart(new THREE.BoxGeometry(0.6, 2.0, 0.8), getMat(0x636e72), [-0.9, 1.0, 0]));
    g.add(makePart(new THREE.BoxGeometry(0.6, 2.0, 0.8), getMat(0x636e72), [0.9, 1.0, 0]));
    g.add(makePart(new THREE.BoxGeometry(2.5, 0.6, 0.9), getMat(0x525c60), [0, 2.1, 0]));
    g.add(makePart(new THREE.BoxGeometry(1.2, 1.8, 0.2), getMat(0x111116), [0, 0.9, -0.2]));
    return g;
  }

  // Standard pitched-roof buildings: farmhouse, coop, barn, shed, stable, willowbrookHall, generalStore, smithy, bakery, archive
  const specs = {
    farmhouse:       { w: 3.4, h: 1.9, d: 2.8, wall: 0xe6ccb2, roof: 0xb03a2e },
    coop:            { w: 2.4, h: 1.5, d: 2.0, wall: 0xd4a373, roof: 0xc0392b },
    barn:            { w: 3.2, h: 2.2, d: 2.6, wall: 0xc0392b, roof: 0x5d4037 },
    shed:            { w: 2.2, h: 1.6, d: 2.0, wall: 0xa06b38, roof: 0x4e342e },
    stable:          { w: 2.4, h: 1.7, d: 2.0, wall: 0x8d5b2d, roof: 0x6d4c41 },
    willowbrookHall: { w: 4.0, h: 2.2, d: 3.0, wall: 0xf5eedc, roof: options.restored ? 0xd4af37 : 0x7f8c8d },
    generalStore:    { w: 3.2, h: 2.0, d: 2.6, wall: 0xf3e5ab, roof: 0x2e86de },
    smithy:          { w: 3.0, h: 1.9, d: 2.4, wall: 0x636e72, roof: 0x2d3436 },
    bakery:          { w: 2.8, h: 1.9, d: 2.4, wall: 0xfdebd0, roof: 0xe67e22 },
    archive:         { w: 3.4, h: 2.1, d: 2.6, wall: 0xd5d8dc, roof: 0x34495e },
  };
  const sp = specs[type] || specs.farmhouse;

  // Stone base
  g.add(makePart(new THREE.BoxGeometry(sp.w + 0.14, 0.3, sp.d + 0.14), getMat(0x7f8c8d), [0, 0.15, 0]));
  // Walls
  g.add(makePart(new THREE.BoxGeometry(sp.w, sp.h, sp.d), getMat(sp.wall), [0, 0.3 + sp.h / 2, 0]));
  // Pitched roof
  g.add(makePart(new THREE.ConeGeometry(Math.max(sp.w, sp.d) * 0.78, 1.25, 4), getMat(sp.roof), [0, 0.3 + sp.h + 0.58, 0], [0, Math.PI / 4, 0]));
  // Door
  g.add(makePart(new THREE.BoxGeometry(0.65, 1.05, 0.12), getMat(0x5c3a21), [0, 0.82, sp.d / 2 + 0.02]));
  // Windows
  g.add(makePart(new THREE.BoxGeometry(0.5, 0.45, 0.1), winMat, [-sp.w * 0.28, 1.2, sp.d / 2 + 0.02]));
  g.add(makePart(new THREE.BoxGeometry(0.5, 0.45, 0.1), winMat, [sp.w * 0.28, 1.2, sp.d / 2 + 0.02]));

  if (type === 'farmhouse' || type === 'smithy' || type === 'bakery') {
    g.add(makePart(new THREE.BoxGeometry(0.45, 0.9, 0.45), getMat(0x525c60), [sp.w * 0.3, 0.3 + sp.h + 0.7, -sp.d * 0.2]));
  }

  g.userData = { kind: 'building', buildingType: type };
  return g;
}

// ============ 6. All 13 Animals & Mine Monsters ============
const CHICKEN_COLORS = {
  white: 0xf8fafc,
  brown: 0xa06b38,
  blue: 0x5dade2,
  void: 0x2c2c34,
  golden: 0xf1c40f,
};

export function createAnimalMesh(type = 'chicken', variant = 'white') {
  const g = new THREE.Group();
  const v = CHICKEN_VARIANTS.includes(variant) ? variant : 'white';

  if (type === 'chicken' || type === 'duck') {
    const col = type === 'duck' ? 0x2ecc71 : CHICKEN_COLORS[v];
    g.add(makePart(new THREE.SphereGeometry(0.24, 8, 7), getMat(col), [0, 0.28, 0], [0, 0, 0], [0.9, 0.85, 1.15]));
    g.add(makePart(new THREE.SphereGeometry(0.14, 7, 6), getMat(col), [0, 0.48, 0.18]));
    g.add(makePart(new THREE.ConeGeometry(0.05, 0.12, 4), getMat(0xf39c12), [0, 0.46, 0.32], [Math.PI / 2, 0, 0]));
    if (type === 'chicken') {
      g.add(makePart(new THREE.BoxGeometry(0.04, 0.09, 0.1), getMat(0xe74c3c), [0, 0.62, 0.18]));
    }
  } else if (type === 'cow' || type === 'goat' || type === 'pig') {
    const col = type === 'cow' ? 0xf5f6fa : type === 'goat' ? 0xdcdde1 : 0xf78fb3;
    g.add(makePart(new THREE.BoxGeometry(0.52, 0.44, 0.78), getMat(col), [0, 0.46, 0]));
    g.add(makePart(new THREE.BoxGeometry(0.34, 0.32, 0.32), getMat(col), [0, 0.56, 0.48]));
    if (type === 'cow') {
      g.add(makePart(new THREE.BoxGeometry(0.2, 0.2, 0.24), getMat(0x2d3436), [0.18, 0.52, 0.1]));
    } else if (type === 'goat') {
      g.add(makePart(new THREE.ConeGeometry(0.04, 0.18, 5), getMat(0x7f8c8d), [-0.1, 0.78, 0.48]));
      g.add(makePart(new THREE.ConeGeometry(0.04, 0.18, 5), getMat(0x7f8c8d), [0.1, 0.78, 0.48]));
    }
    for (const [lx, lz] of [[-0.18, -0.26], [0.18, -0.26], [-0.18, 0.26], [0.18, 0.26]]) {
      g.add(makePart(new THREE.BoxGeometry(0.1, 0.26, 0.1), getMat(col), [lx, 0.13, lz]));
    }
  } else if (type === 'sheep') {
    g.add(makePart(new THREE.SphereGeometry(0.36, 9, 8), getMat(0xf8fafc), [0, 0.45, 0]));
    g.add(makePart(new THREE.SphereGeometry(0.24, 8, 7), getMat(0xf8fafc), [0, 0.5, -0.2]));
    g.add(makePart(new THREE.SphereGeometry(0.16, 7, 6), getMat(0x2d3436), [0, 0.52, 0.36]));
  } else if (type === 'rabbit') {
    g.add(makePart(new THREE.SphereGeometry(0.2, 8, 7), getMat(0xf5f6fa), [0, 0.22, 0]));
    g.add(makePart(new THREE.CylinderGeometry(0.04, 0.04, 0.24, 5), getMat(0xf8a5c2), [-0.07, 0.46, 0.08]));
    g.add(makePart(new THREE.CylinderGeometry(0.04, 0.04, 0.24, 5), getMat(0xf8a5c2), [0.07, 0.46, 0.08]));
  } else if (type === 'dinosaur') {
    g.add(makePart(new THREE.SphereGeometry(0.28, 8, 7), getMat(0x27ae60), [0, 0.32, 0], [0, 0, 0], [0.9, 0.9, 1.3]));
    g.add(makePart(new THREE.BoxGeometry(0.2, 0.22, 0.28), getMat(0x2ecc71), [0, 0.54, 0.28]));
    g.add(makePart(new THREE.ConeGeometry(0.08, 0.2, 4), getMat(0xf1c40f), [0, 0.58, -0.05]));
  } else if (type === 'ostrich') {
    g.add(makePart(new THREE.SphereGeometry(0.32, 8, 7), getMat(0x2c3e50), [0, 0.65, 0]));
    g.add(makePart(new THREE.CylinderGeometry(0.06, 0.08, 0.55, 6), getMat(0xf5b7b1), [0, 1.02, 0.18]));
    g.add(makePart(new THREE.CylinderGeometry(0.04, 0.04, 0.52, 5), getMat(0xf5b7b1), [-0.12, 0.26, 0]));
    g.add(makePart(new THREE.CylinderGeometry(0.04, 0.04, 0.52, 5), getMat(0xf5b7b1), [0.12, 0.26, 0]));
  } else if (type === 'turtle') {
    g.add(makePart(new THREE.SphereGeometry(0.28, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), getMat(0x1e8449), [0, 0.08, 0]));
    g.add(makePart(new THREE.SphereGeometry(0.1, 6, 6), getMat(0x52be80), [0, 0.14, 0.3]));
  } else if (type === 'cat' || type === 'dog') {
    const col = type === 'cat' ? 0xf39c12 : 0xa06b38;
    g.add(makePart(new THREE.BoxGeometry(0.28, 0.24, 0.44), getMat(col), [0, 0.24, 0]));
    g.add(makePart(new THREE.BoxGeometry(0.22, 0.2, 0.22), getMat(col), [0, 0.38, 0.24]));
    g.add(makePart(new THREE.ConeGeometry(0.05, 0.1, 4), getMat(col), [-0.07, 0.52, 0.24]));
    g.add(makePart(new THREE.ConeGeometry(0.05, 0.1, 4), getMat(col), [0.07, 0.52, 0.24]));
  } else {
    // horse
    g.add(makePart(new THREE.BoxGeometry(0.52, 0.52, 0.96), getMat(0x7c4a26), [0, 0.72, 0]));
    g.add(makePart(new THREE.BoxGeometry(0.24, 0.46, 0.26), getMat(0x7c4a26), [0, 1.06, 0.44], [-0.35, 0, 0]));
    for (const [lx, lz] of [[-0.18, -0.34], [0.18, -0.34], [-0.18, 0.34], [0.18, 0.34]]) {
      g.add(makePart(new THREE.BoxGeometry(0.1, 0.48, 0.1), getMat(0x5c3317), [lx, 0.24, lz]));
    }
  }

  g.userData = { kind: 'animal', animalType: type, baseY: 0 };
  return g;
}

export function animateAnimal(animalGroup, time = 0, seed = 0) {
  if (!animalGroup) return;
  const t = time * 2.5 + seed;
  animalGroup.position.y = (animalGroup.userData?.baseY || 0) + Math.abs(Math.sin(t)) * 0.08;
  animalGroup.rotation.y = Math.sin(time * 0.7 + seed) * 0.4;
}

export function createMonsterMesh(type = 'slime', variant = 'green') {
  const g = new THREE.Group();
  if (type === 'bat') {
    const body = makePart(new THREE.SphereGeometry(0.22, 8, 7), getMat(0x4a235a), [0, 0.85, 0]);
    const wingL = makePart(new THREE.BoxGeometry(0.45, 0.04, 0.22), getMat(0x6c3483), [-0.32, 0.88, 0]);
    const wingR = makePart(new THREE.BoxGeometry(0.45, 0.04, 0.22), getMat(0x6c3483), [0.32, 0.88, 0]);
    g.add(body, wingL, wingR);
    g.userData = { kind: 'monster', monsterType: 'bat', wingL, wingR };
  } else if (type === 'golem') {
    g.add(makePart(new THREE.DodecahedronGeometry(0.46, 0), getMat(0x636e72), [0, 0.65, 0]));
    g.add(makePart(new THREE.SphereGeometry(0.08, 6, 6), getMat(0xe74c3c, { emissive: 0xe74c3c }), [-0.14, 0.76, 0.38]));
    g.add(makePart(new THREE.SphereGeometry(0.08, 6, 6), getMat(0xe74c3c, { emissive: 0xe74c3c }), [0.14, 0.76, 0.38]));
    g.userData = { kind: 'monster', monsterType: 'golem' };
  } else {
    const col = variant === 'purple' ? 0x8e44ad : variant === 'blue' ? 0x2980b9 : 0x2ecc71;
    const body = makePart(new THREE.SphereGeometry(0.36, 10, 8), getMat(col, { transparent: true, opacity: 0.9 }), [0, 0.34, 0], [0, 0, 0], [1.1, 0.85, 1.1]);
    g.add(body);
    g.add(makePart(new THREE.SphereGeometry(0.06, 6, 6), getMat(0x111111), [-0.12, 0.42, 0.3]));
    g.add(makePart(new THREE.SphereGeometry(0.06, 6, 6), getMat(0x111111), [0.12, 0.42, 0.3]));
    g.userData = { kind: 'monster', monsterType: 'slime', body };
  }

  // Floating 3D HP bar
  const hpBg = makePart(new THREE.PlaneGeometry(0.7, 0.1), getMat(0x222222), [0, 1.35, 0]);
  const hpFill = makePart(new THREE.PlaneGeometry(0.66, 0.07), getMat(0xe74c3c, { emissive: 0x900000 }), [0, 1.35, 0.01]);
  g.add(hpBg, hpFill);
  g.userData.hpFill = hpFill;
  return g;
}

export function setMonsterHP(monsterGroup, ratio) {
  const fill = monsterGroup?.userData?.hpFill;
  if (!fill) return;
  const r = Math.max(0, Math.min(1, ratio));
  fill.scale.x = Math.max(0.001, r);
  fill.position.x = -(1 - r) * 0.33;
}

export function animateMonster(monsterGroup, time = 0) {
  const ud = monsterGroup?.userData;
  if (!ud) return;
  if (ud.monsterType === 'bat' && ud.wingL && ud.wingR) {
    const flap = Math.sin(time * 12) * 0.5;
    ud.wingL.rotation.z = flap;
    ud.wingR.rotation.z = -flap;
  } else if (ud.monsterType === 'slime' && ud.body) {
    ud.body.position.y = 0.34 + Math.abs(Math.sin(time * 4)) * 0.22;
  }
}
