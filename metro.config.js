const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// expo-sqlite web support: treat .wasm files as assets, not source
config.resolver.assetExts = [...(config.resolver.assetExts || []), 'wasm'];
config.resolver.sourceExts = (config.resolver.sourceExts || []).filter(
  (ext) => ext !== 'wasm'
);

module.exports = config;
