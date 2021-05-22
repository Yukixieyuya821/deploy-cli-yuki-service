const config = {
    projectName: "heg-h5",
    cluster: [],
    dev: {
      name: "dev-h5",
      script: "yarn build",
      host: "127.0.0.1",
      port: 22,
      username: "root",
      password: "123",
      distPath: ".nuxt",
      webDir: "/var/webapp/vue-nuxt/.nuxt",
      bakDir: "/var/webapp/vue-nuxt/backup",
      isRemoveRemoteFile: true,
      isRemoveLocalFile: true,
      isAll: true,
      exclude: [],
      webPath: "/var/webapp/test",
      isRemoteDeploy: true,
      cloneScript: "git clone git@gitlab.***.com:***/***.git",
      webProjectPath: "/var/webapp/test",
      downloadDirName: "***",
      install: "yarn",
      startRemoteProgress: "yarn start",
    }
  };
  
  module.exports = config;