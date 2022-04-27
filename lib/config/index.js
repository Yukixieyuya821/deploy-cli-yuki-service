const fs = require('fs')
const os = require('os')
const path = require('path')

const devConfig = [
  {
    type: 'input',
    name: 'devName',
    message: '环境名称',
    default: '开发环境',
    when: (answers) => answers.deployEnvList.includes('dev')
  },
  {
    type: 'input',
    name: 'devScript',
    message: '打包命令',
    default: 'npm run build:dev',
    when: (answers) => answers.deployEnvList.includes('dev')
  },
  {
    type: 'input',
    name: 'devHost',
    message: '服务器地址',
    when: (answers) => answers.deployEnvList.includes('dev')
  },
  {
    type: 'number',
    name: 'devPort',
    message: '服务器端口号',
    default: 22,
    when: (answers) => answers.deployEnvList.includes('dev')
  },
  {
    type: 'input',
    name: 'devUsername',
    message: '用户名',
    default: 'root',
    when: (answers) => answers.deployEnvList.includes('dev')
  },
  {
    type: 'password',
    name: 'devPassword',
    message: '密码',
    when: (answers) => answers.deployEnvList.includes('dev')
  },
  {
    type: 'input',
    name: 'devDistPath',
    message: '本地打包目录',
    default: 'dist',
    when: (answers) => answers.deployEnvList.includes('dev')
  },
  {
    type: 'input',
    name: 'devWebDir',
    message: '部署路径',
    when: (answers) => answers.deployEnvList.includes('dev')
  },
  {
    type: 'input',
    name: 'devBakDir',
    message: '备份路径',
    when: (answers) => answers.deployEnvList.includes('dev')
  },
  {
    type: 'number',
    name: 'devMaxBackupVersionCount',
    message: '最多备份版本数',
    default: 3,
    when: (answers) => answers.deployEnvList.includes('dev')
  },
  {
    type: 'confirm',
    name: 'devIsRemoveRemoteFile',
    message: '是否删除远程文件',
    default: true,
    when: (answers) => answers.deployEnvList.includes('dev')
  },
  {
    type: 'confirm',
    name: 'devIsRemoveLocalFile',
    message: '是否删除本地打包文件',
    default: true,
    when: (answers) => answers.deployEnvList.includes('dev')
  },
  {
    type: 'confirm',
    name: 'devIsAll',
    message: '是否将项目整个目录上传，并执行一键启动(适用于服务端渲染项目。如(nuxt/next)',
    default: true,
    when: (answers) => answers.deployEnvList.includes('dev')
  },
  {
    type: 'input',
    name: 'devWebPath',
    message: '项目部署服务器的路径',
    when: (answers) => answers.deployEnvList.includes('dev') && answers.devIsAll
  },
  {
    type: 'confirm',
    name: 'devIsRemoteDeploy',
    message: '是否要支持远程下载部署(非本地上传部署)，并执行一键启动(适用于服务端渲染项目。如(nuxt/next)',
    default: true,
    when: (answers) => answers.deployEnvList.includes('dev')
  },
  {
    type: 'input',
    name: 'devCloneScript',
    message: '项目远程下载命令',
    when: (answers) => answers.deployEnvList.includes('dev') && answers.devIsRemoteDeploy
  },
  {
    type: 'input',
    name: 'devWebProjectPath',
    message: '远程下载项目至服务器路径',
    when: (answers) => answers.deployEnvList.includes('dev') && answers.devIsRemoteDeploy
  },
  {
    type: 'input',
    name: 'devDownloadDirName',
    message: '远程下载项目后文件夹名称',
    when: (answers) => answers.deployEnvList.includes('dev') && answers.devIsRemoteDeploy
  },
  {
    type: 'input',
    name: 'devInstall',
    message: '项目安装依赖命令',
    when: (answers) => answers.deployEnvList.includes('dev') && (answers.devIsAll || answers.devIsRemoteDeploy)
  },
  {
    type: 'input',
    name: 'devStartRemoteProgress',
    message: '项目启动命令',
    when: (answers) => answers.deployEnvList.includes('dev') && (answers.devIsAll || answers.devIsRemoteDeploy)
  }
]

const testConfig = [
  {
    type: 'input',
    name: 'testName',
    message: '环境名称',
    default: '测试环境',
    when: (answers) => answers.deployEnvList.includes('test')
  },
  {
    type: 'input',
    name: 'testScript',
    message: '打包命令',
    default: 'npm run build:test',
    when: (answers) => answers.deployEnvList.includes('test')
  },
  {
    type: 'input',
    name: 'testHost',
    message: '服务器地址',
    when: (answers) => answers.deployEnvList.includes('test')
  },
  {
    type: 'number',
    name: 'testPort',
    message: '服务器端口号',
    default: 22,
    when: (answers) => answers.deployEnvList.includes('test')
  },
  {
    type: 'input',
    name: 'testUsername',
    message: '用户名',
    default: 'root',
    when: (answers) => answers.deployEnvList.includes('test')
  },
  {
    type: 'password',
    name: 'testPassword',
    message: '密码',
    when: (answers) => answers.deployEnvList.includes('test')
  },
  {
    type: 'input',
    name: 'testDistPath',
    message: '本地打包目录',
    default: 'dist',
    when: (answers) => answers.deployEnvList.includes('test')
  },
  {
    type: 'input',
    name: 'testWebDir',
    message: '部署路径',
    when: (answers) => answers.deployEnvList.includes('test')
  },
  {
    type: 'input',
    name: 'testBakDir',
    message: '备份路径',
    when: (answers) => answers.deployEnvList.includes('test')
  },
  {
    type: 'number',
    name: 'testMaxBackupVersionCount',
    message: '最多备份版本数',
    default: 3,
    when: (answers) => answers.deployEnvList.includes('test')
  },
  {
    type: 'confirm',
    name: 'testIsRemoveRemoteFile',
    message: '是否删除远程文件',
    default: true,
    when: (answers) => answers.deployEnvList.includes('test')
  },
  {
    type: 'confirm',
    name: 'testIsRemoveLocalFile',
    message: '是否删除本地打包文件',
    default: true,
    when: (answers) => answers.deployEnvList.includes('test')
  },
  {
    type: 'confirm',
    name: 'testIsAll',
    message: '是否将项目整个目录上传，并执行一键启动(适用于服务端渲染项目。如(nuxt/next)',
    default: true,
    when: (answers) => answers.deployEnvList.includes('test')
  },
  {
    type: 'input',
    name: 'testWebPath',
    message: '项目部署服务器的路径',
    when: (answers) => answers.deployEnvList.includes('test') && answers.testIsAll
  },
  {
    type: 'confirm',
    name: 'testIsRemoteDeploy',
    message: '是否要支持远程下载部署(非本地上传部署)，并执行一键启动(适用于服务端渲染项目。如(nuxt/next)',
    default: true,
    when: (answers) => answers.deployEnvList.includes('test')
  },
  {
    type: 'input',
    name: 'testCloneScript',
    message: '项目远程下载命令',
    when: (answers) => answers.deployEnvList.includes('test') && answers.testIsRemoteDeploy
  },
  {
    type: 'input',
    name: 'testWebProjectPath',
    message: '远程下载项目至服务器路径',
    when: (answers) => answers.deployEnvList.includes('test') && answers.testIsRemoteDeploy
  },
  {
    type: 'input',
    name: 'testDownloadDirName',
    message: '远程下载项目后文件夹名称',
    when: (answers) => answers.deployEnvList.includes('test') && answers.testIsRemoteDeploy
  },
  {
    type: 'input',
    name: 'testInstall',
    message: '项目安装依赖命令',
    when: (answers) => answers.deployEnvList.includes('test') && (answers.testIsAll || answers.testIsRemoteDeploy)
  },
  {
    type: 'input',
    name: 'testStartRemoteProgress',
    message: '项目启动命令',
    when: (answers) => answers.deployEnvList.includes('test') && (answers.testIsAll || answers.testIsRemoteDeploy)
  }
]

const prodConfig = [
  {
    type: 'input',
    name: 'prodName',
    message: '环境名称',
    default: '生产环境',
    when: (answers) => answers.deployEnvList.includes('prod')
  },
  {
    type: 'input',
    name: 'prodScript',
    message: '打包命令',
    default: 'npm run build:prod',
    when: (answers) => answers.deployEnvList.includes('prod')
  },
  {
    type: 'input',
    name: 'prodHost',
    message: '服务器地址',
    when: (answers) => answers.deployEnvList.includes('prod')
  },
  {
    type: 'number',
    name: 'prodPort',
    message: '服务器端口号',
    default: 22,
    when: (answers) => answers.deployEnvList.includes('prod')
  },
  {
    type: 'input',
    name: 'prodUsername',
    message: '用户名',
    default: 'root',
    when: (answers) => answers.deployEnvList.includes('prod')
  },
  {
    type: 'password',
    name: 'prodPassword',
    message: '密码',
    when: (answers) => answers.deployEnvList.includes('prod')
  },
  {
    type: 'input',
    name: 'prodDistPath',
    message: '本地打包目录',
    default: 'dist',
    when: (answers) => answers.deployEnvList.includes('prod')
  },
  {
    type: 'input',
    name: 'prodWebDir',
    message: '部署路径',
    when: (answers) => answers.deployEnvList.includes('prod')
  },
  {
    type: 'input',
    name: 'prodBakDir',
    message: '备份路径',
    when: (answers) => answers.deployEnvList.includes('prod')
  },
  {
    type: 'number',
    name: 'prodMaxBackupVersionCount',
    message: '最多备份版本数',
    default: 3,
    when: (answers) => answers.deployEnvList.includes('prod')
  },
  {
    type: 'confirm',
    name: 'prodIsRemoveRemoteFile',
    message: '是否删除远程文件',
    default: true,
    when: (answers) => answers.deployEnvList.includes('prod')
  },
  {
    type: 'confirm',
    name: 'prodIsRemoveLocalFile',
    message: '是否删除本地打包文件',
    default: true,
    when: (answers) => answers.deployEnvList.includes('prod')
  },
  {
    type: 'confirm',
    name: 'prodIsAll',
    message: '是否将项目整个目录上传，并执行一键启动(适用于服务端渲染项目。如(nuxt/next)',
    default: true,
    when: (answers) => answers.deployEnvList.includes('prod')
  },
  {
    type: 'input',
    name: 'prodWebPath',
    message: '项目部署服务器的路径',
    when: (answers) => answers.deployEnvList.includes('prod') && answers.prodIsAll
  },
  {
    type: 'confirm',
    name: 'prodIsRemoteDeploy',
    message: '是否要支持远程下载部署(非本地上传部署)，并执行一键启动(适用于服务端渲染项目。如(nuxt/next)',
    default: true,
    when: (answers) => answers.deployEnvList.includes('prod')
  },
  {
    type: 'input',
    name: 'prodCloneScript',
    message: '项目远程下载命令',
    when: (answers) => answers.deployEnvList.includes('prod') && answers.prodIsRemoteDeploy
  },
  {
    type: 'input',
    name: 'prodWebProjectPath',
    message: '远程下载项目至服务器路径',
    when: (answers) => answers.deployEnvList.includes('prod') && answers.prodIsRemoteDeploy
  },
  {
    type: 'input',
    name: 'prodDownloadDirName',
    message: '远程下载项目后文件夹名称',
    when: (answers) => answers.deployEnvList.includes('prod') && answers.prodIsRemoteDeploy
  },
  {
    type: 'input',
    name: 'prodInstall',
    message: '项目安装依赖命令',
    when: (answers) => answers.deployEnvList.includes('prod') && answers.prodIsAll
  },
  {
    type: 'input',
    name: 'prodStartRemoteProgress',
    message: '项目启动命令',
    when: (answers) => answers.deployEnvList.includes('prod') && answers.prodIsAll
  }
]

module.exports = {
  packageInfo: require('../../../package.json'),
  deployConfigPath: `${path.join(process.cwd())}/deploy.config.js`,
  inquirerConfig: [
    {
      type: 'input',
      name: 'projectName',
      message: '请输入项目名称',
      default: fs.existsSync(`${path.join(process.cwd())}/package.json`)
        ? require(`${process.cwd()}/package.json`).name
        : ''
    },
    {
      type: 'input',
      name: 'privateKey',
      message: '请输入本地私钥地址',
      default: `${os.homedir()}/.ssh/id_rsa`
    },
    {
      type: 'password',
      name: 'passphrase',
      message: '请输入本地私钥密码',
      default: ''
    },
    {
      type: 'checkbox',
      name: 'deployEnvList',
      message: '请选择需要部署的环境',
      choices: [
        {
          name: 'dev',
          checked: true
        },
        {
          name: 'test'
        },
        {
          name: 'prod'
        }
      ]
    },
    ...devConfig,
    ...testConfig,
    ...prodConfig
  ]
}
