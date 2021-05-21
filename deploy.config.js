const config = {
    projectName: "heg-h5",
    cluster: [],
    dev: {
      name: "dev-h5",
      script: "yarn build",
      host: "172.16.16.45",
      port: 22,
      username: "root",
      password: "Heg@local_life",
      distPath: ".nuxt",
      webDir: "/var/webapp/vue-nuxt/.nuxt",
      bakDir: "/var/webapp/vue-nuxt/backup",
      isRemoveRemoteFile: true,
      isRemoveLocalFile: true,
      isAll: true,
      exclude: [],
      attachUploadFiles: ["package.json", "yarn.lock"],
      webPath: "/var/webapp/test",
      install: "yarn"
    }
  };
  
  module.exports = config;