const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add GLB/GLTF as asset extensions for 3D model loading
config.resolver.assetExts.push('glb', 'gltf', 'bin', 'png', 'jpg', 'mp3', 'wav');

module.exports = config;
