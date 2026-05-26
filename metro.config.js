const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const STRIPE_STUB = path.resolve(__dirname, 'src/mocks/stripeStub.ts');

// Provide a stub for @stripe/stripe-react-native when running in Expo Go.
// The real package requires native modules only available in a custom dev build.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@stripe/stripe-react-native') {
    try {
      return context.resolveRequest(context, moduleName, platform);
    } catch {
      return { filePath: STRIPE_STUB, type: 'sourceFile' };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
