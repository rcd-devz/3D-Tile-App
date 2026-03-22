import * as THREE from 'three';
import { TileObject, TileObjectType } from '../types';
import { OBJECT_METADATA } from '../config/levels';
import { COLORS } from '../config/constants';

// ============================================================
// 3D SCENE MANAGER
// ============================================================
// Manages the Three.js scene for the tile pile.
// Uses colored geometric shapes as placeholders until
// GLB models are loaded.
// ============================================================

export class GameScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer | null = null;
  tileMeshes: Map<string, THREE.Mesh> = new Map();
  raycaster: THREE.Raycaster;
  selectedHighlight: THREE.Mesh | null = null;

  // Lighting
  ambientLight: THREE.AmbientLight;
  directionalLight: THREE.DirectionalLight;
  pointLight: THREE.PointLight;

  constructor(width: number, height: number) {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // Camera - orthographic-ish perspective for top-down pile view
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, -2, 12);
    this.camera.lookAt(0, 0, 0);

    // Lighting setup
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(5, -5, 10);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);

    this.pointLight = new THREE.PointLight(0xffd700, 0.3, 20);
    this.pointLight.position.set(0, 0, 8);
    this.scene.add(this.pointLight);

    // Background plane (dark pit where tiles fall into)
    const bgGeometry = new THREE.PlaneGeometry(12, 16);
    const bgMaterial = new THREE.MeshStandardMaterial({
      color: 0x0d0d1a,
      roughness: 0.9,
    });
    const bgPlane = new THREE.Mesh(bgGeometry, bgMaterial);
    bgPlane.position.z = -2;
    this.scene.add(bgPlane);

    // Add subtle vignette edges
    this.addVignetteEdges();

    this.raycaster = new THREE.Raycaster();
  }

  private addVignetteEdges() {
    // Dark gradient edges using transparent planes
    const edgeMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.5,
    });

    // Left edge
    const leftEdge = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 16),
      edgeMaterial
    );
    leftEdge.position.set(-6, 0, 5);
    this.scene.add(leftEdge);

    // Right edge
    const rightEdge = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 16),
      edgeMaterial
    );
    rightEdge.position.set(6, 0, 5);
    this.scene.add(rightEdge);
  }

  /**
   * Create 3D meshes for tile objects.
   * Uses placeholder geometries with colors matching the tile type.
   * Replace with GLB model loading for production.
   */
  createTileMeshes(tiles: TileObject[]) {
    // Remove existing meshes
    this.tileMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.tileMeshes.clear();

    for (const tile of tiles) {
      const mesh = this.createTileMesh(tile);
      this.tileMeshes.set(tile.id, mesh);
      this.scene.add(mesh);
    }
  }

  private createTileMesh(tile: TileObject): THREE.Mesh {
    const metadata = OBJECT_METADATA[tile.type];
    const color = new THREE.Color(metadata.color);

    // Choose geometry based on object type for visual variety
    const geometry = this.getGeometryForType(tile.type);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.4,
      metalness: 0.1,
      emissive: color,
      emissiveIntensity: 0.05,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(tile.position.x, tile.position.y, tile.position.z);
    mesh.rotation.set(tile.rotation.x, tile.rotation.y, tile.rotation.z);
    mesh.scale.setScalar(tile.scale);
    mesh.userData = { tileId: tile.id, tileType: tile.type };
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  private getGeometryForType(type: TileObjectType): THREE.BufferGeometry {
    // Distinct shapes for each type so they're visually recognizable
    switch (type) {
      case 'burger':
        return new THREE.CylinderGeometry(0.5, 0.55, 0.4, 16);
      case 'volleyball':
      case 'beach_ball':
        return new THREE.SphereGeometry(0.45, 16, 16);
      case 'toilet_paper':
        return new THREE.TorusGeometry(0.35, 0.15, 8, 16);
      case 'grapes':
        return new THREE.DodecahedronGeometry(0.4);
      case 'train':
        return new THREE.BoxGeometry(0.9, 0.4, 0.5);
      case 'eggplant':
        // Elongated shape
        return new THREE.CylinderGeometry(0.15, 0.3, 0.8, 12);
      case 'tire':
        return new THREE.TorusGeometry(0.4, 0.18, 12, 20);
      case 'cake':
        return new THREE.CylinderGeometry(0.45, 0.45, 0.5, 8);
      case 'chair':
        return new THREE.BoxGeometry(0.5, 0.6, 0.5);
      case 'crate':
        return new THREE.BoxGeometry(0.55, 0.55, 0.55);
      case 'drum':
        return new THREE.CylinderGeometry(0.4, 0.4, 0.55, 12);
      case 'hippo':
        return new THREE.SphereGeometry(0.5, 12, 10);
      case 'tiger':
        return new THREE.ConeGeometry(0.4, 0.7, 8);
      case 'zebra':
        return new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8);
      default:
        return new THREE.BoxGeometry(0.5, 0.5, 0.5);
    }
  }

  /**
   * Update mesh visibility and highlight state based on tile data.
   */
  updateTiles(tiles: TileObject[]) {
    for (const tile of tiles) {
      const mesh = this.tileMeshes.get(tile.id);
      if (!mesh) continue;

      mesh.visible = tile.isVisible;

      // Update material based on state
      const mat = mesh.material as THREE.MeshStandardMaterial;

      if (tile.isSelected) {
        // Highlight selected/hint tiles
        mat.emissiveIntensity = 0.4;
        mat.emissive = new THREE.Color(0xffd700);
      } else if (!tile.isAccessible) {
        // Dim inaccessible tiles
        mat.emissiveIntensity = 0.0;
        mat.opacity = 0.7;
        mat.transparent = true;
      } else {
        // Normal accessible tile
        mat.emissiveIntensity = 0.05;
        mat.opacity = 1.0;
        mat.transparent = false;
      }
    }
  }

  /**
   * Raycast from screen coordinates to find which tile was tapped.
   */
  getTileAtScreenPos(
    screenX: number,
    screenY: number,
    viewWidth: number,
    viewHeight: number
  ): string | null {
    // Convert screen coords to normalized device coords (-1 to 1)
    const ndcX = (screenX / viewWidth) * 2 - 1;
    const ndcY = -(screenY / viewHeight) * 2 + 1;

    this.raycaster.setFromCamera(
      new THREE.Vector2(ndcX, ndcY),
      this.camera
    );

    const intersects = this.raycaster.intersectObjects(
      Array.from(this.tileMeshes.values()),
      false
    );

    // Return the topmost (closest to camera) visible tile
    for (const hit of intersects) {
      const tileId = hit.object.userData.tileId;
      if (tileId && hit.object.visible) {
        return tileId;
      }
    }

    return null;
  }

  /**
   * Flash a tile with a brief white glow to confirm a tap before it disappears.
   * Call this immediately before selectTile() so the player sees feedback.
   */
  flashTile(tileId: string): void {
    const mesh = this.tileMeshes.get(tileId);
    if (!mesh) return;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.emissive = new THREE.Color(0xffffff);
    mat.emissiveIntensity = 0.8;
    // The tile will be hidden by updateTiles() after ~1 frame, so no cleanup needed
  }

  /**
   * Animate a tile being removed (scale down + fade out).
   */
  animateTileRemoval(tileId: string, duration: number = 300): Promise<void> {
    const mesh = this.tileMeshes.get(tileId);
    if (!mesh) return Promise.resolve();

    return new Promise((resolve) => {
      const startScale = mesh.scale.x;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

        mesh.scale.setScalar(startScale * (1 - eased));

        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.opacity = 1 - eased;
        mat.transparent = true;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          mesh.visible = false;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Dispose all Three.js resources.
   */
  dispose() {
    this.tileMeshes.forEach((mesh) => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      this.scene.remove(mesh);
    });
    this.tileMeshes.clear();

    this.scene.clear();
    this.renderer?.dispose();
  }
}
