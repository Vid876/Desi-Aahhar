const fs = require('node:fs');

module.exports = ({ config }) => {
  const androidFile = process.env.GOOGLE_SERVICES_JSON || './google-services.json';
  const iosFile = process.env.GOOGLE_SERVICE_INFO_PLIST || './GoogleService-Info.plist';
  return {
    ...config,
    android: {
      ...config.android,
      ...(fs.existsSync(androidFile) ? { googleServicesFile: androidFile } : {}),
    },
    ios: {
      ...config.ios,
      ...(fs.existsSync(iosFile) ? { googleServicesFile: iosFile } : {}),
    },
  };
};
