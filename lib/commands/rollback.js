const { NodeSSH } = require('node-ssh');
const inquirer = require('inquirer')
// const childProcess = require('child_process');
const { deployConfigPath } = require('../config');
const {
    checkDeployConfigExists,
    log,
    succeed,
    error,
    underline
  } = require('../utils');
const ssh = new NodeSSH();
// 任务列表
let taskList

// 是否确认部署
const confirmRollback = (message) => {
    return inquirer.prompt([
        {
        type: 'confirm',
        name: 'confirm',
        message
        }
    ])
}
// 检查环境是否正确
const checkEnvCorrect = (config, env) => {
    const keys = ['name', 'host', 'port', 'username', 'distPath', 'webDir']
  
    if (config) {
      keys.forEach((key) => {
        if (!config[env][key] || config[env][key] === '/') {
          error(
            `配置错误: ${underline(`${env}环境`)} ${underline(
              `${key}属性`
            )} 配置不正确`
          )
          process.exit(1)
        }
      })
    } else {
      error('配置错误: 未指定回滚环境或指定回滚环境不存在')
      process.exit(1)
    }
}
// 连接ssh
const connectSSH = async (config, index) => {
    try {
      log(`(${index}) ssh连接 ${underline(config.host)}`)
  
      const { privateKey, passphrase, password } = config
      if (!privateKey && !password) {
        const answers = await inquirer.prompt([
          {
            type: 'password',
            name: 'password',
            message: '请输入服务器密码'
          }
        ])
  
        config.password = answers.password
      }
  
      !privateKey && delete config.privateKey
      !passphrase && delete config.passphrase
  
      await ssh.connect(config)
      succeed('ssh连接成功')
    } catch (e) {
      error(e)
      process.exit(1)
    }
}



// 读取备份文件夹下所有文件名并选择回滚版本
const selectRollbackVersion = async (config) => {
    try {
        const { bakDir, isAll } = config;
        const dirName = bakDir.split('/')[bakDir.split('/').length - 1]
        log(`读取远程备份文件夹 ${underline(bakDir)}下所有文件名`)
    
        const result = await ssh.execCommand(
          `ls ${bakDir}`
        )
        if(result.stdout) {
            const fileZips = result.stdout.split('\n').filter(item => item.includes(isAll ? dirName : '.zip'));
            
            const answers = await inquirer.prompt([
                {
                  type: 'list',
                  name: 'rollbackVersion',
                  message: '请选择回滚版本',
                  choices: fileZips
                }
            ])
            config.rollbackVersion = answers.rollbackVersion;
            if(isAll) {
                const currentVersionResult = await ssh.execCommand(
                    `ls -a ${bakDir}/${answers.rollbackVersion}`
                )
                if(currentVersionResult.stdout) {
                    config.currentVersionFiles = currentVersionResult.stdout.split('\n').filter(item => item !== '.').filter(item => item !== '..');
                }
            }
            succeed('读取成功')
        }
    } catch (e) {
        error(e)
        process.exit(1)
    }
}

// 解压远程文件
const unzipRemoteFile = async (config, index) => {
    try {
      const { webDir, bakDir, rollbackVersion } = config
      const remoteFileName = `${bakDir}/${rollbackVersion}`
      log(`(${index}) 解压远程回滚版本文件 ${underline(remoteFileName)} 至 ${underline(webDir)}`)
      await ssh.execCommand(`unzip -o ${remoteFileName} -d /`)
      succeed('解压成功')
    } catch (e) {
      error(e)
      process.exit(1)
    }
}

// 批量解压/移动远程文件 
const batchUnzipRemoteFile = async (config, index) => {
    try {
        const { webPath, bakDir, rollbackVersion, currentVersionFiles } = config
        const remoteVersionDirPath = `${bakDir}/${rollbackVersion}`
        const fileNames = currentVersionFiles.map(item => {
            if(item.includes('.zip')) {
                const dirName = item.split('.zip')[0]
                return {
                    remoteName: `${remoteVersionDirPath}/${item}`,
                    targetFileName: `${webPath}/${dirName}`
                  }
            } else {
                return {
                    isFile: true,
                    remoteName: `${remoteVersionDirPath}/${item}`,
                    targetFileName: `${webPath}/${item}`
                }
            }
        })
        for(let i = 0; i < fileNames.length; i++) {
          const item = fileNames[i];
          const j = i + 1;
          log(`(${index}${j ? `.${j}` : ''}) ${item.isFile ? '移动远程文件' : '解压远程文件夹'} ${underline(item.remoteName)}`)
          if(item.isFile) await ssh.execCommand(`cp  ${item.remoteName} ${item.targetFileName}`)
          else await ssh.execCommand(`unzip -o ${item.remoteName} -d ${item.targetFileName}`)
          succeed(` ${item.isFile ? '移动远程文件' : '解压远程文件夹'}成功`)
        }
        
    } catch (e) {
        error(e)
        process.exit(1)
    }
}

// 断开ssh
const disconnectSSH = () => {
    ssh.dispose()
}
// 执行任务列表
const executeTaskList = async (config) => {
    for (const [index, execute] of new Map(
      taskList.map((execute, index) => [index, execute])
    )) {
      await execute(config, index + 1)
    }
}
// 创建任务列表
const createTaskList = (config) => {
    const {
      script,
      isAll,
      install,
      startRemoteProgress,
    //   isRemoteDeploy
    } = config
  
    taskList = []
    if(isAll) {
        taskList.push(connectSSH)
        taskList.push(selectRollbackVersion)
        taskList.push(batchUnzipRemoteFile)
        install && taskList.push(execRemoatInstall)
        script && taskList.push(execRemoatBuild)
        startRemoteProgress && taskList.push(execRemoatService)
    } else {
        taskList.push(connectSSH)
        taskList.push(selectRollbackVersion)
        taskList.push(unzipRemoteFile)
    }
    taskList.push(disconnectSSH)
}
module.exports = {
    description: '回滚项目',
    apply: async (env) => {
      if (checkDeployConfigExists()) {
        const config = require(deployConfigPath)
        const cluster = config.cluster
        const projectName = config.projectName
        const currentTime = new Date().getTime()
  
        const createdEnvConfig = (env) => {
          checkEnvCorrect(config, env)
  
          return Object.assign(config[env], {
            privateKey: config.privateKey,
            passphrase: config.passphrase
          })
        }
  
        if (env) {
          const envConfig = createdEnvConfig(env)
  
          const answers = await confirmRollback(
            `${underline(projectName)} 项目是否回滚?`
          )
  
          if (answers.confirm) {
            createTaskList(envConfig)
  
            await executeTaskList(envConfig)
  
            succeed(
              `恭喜您，${underline(projectName)}项目已在${underline(
                envConfig.name
              )}回滚成功 耗时${(new Date().getTime() - currentTime) / 1000}s\n`
            )
            process.exit(0)
          } else {
            process.exit(1)
          }
        } else if (cluster && cluster.length > 0) {
          const answers = await confirmRollback(
            `${underline(projectName)} 项目是否确认在所有环境回滚?`
          )
  
          if (answers.confirm) {
            for (const env of cluster) {
              const envConfig = createdEnvConfig(env)
  
              createTaskList(envConfig)
  
              await executeTaskList(envConfig)
  
              succeed(
                `恭喜您，${underline(projectName)}项目已在${underline(
                  envConfig.name
                )}回滚成功`
              )
            }
  
            succeed(
              `恭喜您，${underline(projectName)}项目已在${underline(
                '集群环境'
              )}回滚成功 耗时${(new Date().getTime() - currentTime) / 1000}s\n`
            )
          } else {
            process.exit(1)
          }
        } else {
          error(
            '请使用 deploy-cli-service -mode 指定回滚环境或在配置文件中指定 cluster（集群）地址'
          )
          process.exit(1)
        }
      } else {
        error(
          'deploy.config.js 文件不存，请使用 deploy-cli-service init 命令创建'
        )
        process.exit(1)
      }
    }
  }