const fetch = require('electron-fetch').default;
const { isAuthorized, isTokenExpired } = require('../auth/helpers');
const logsHandler = require('../logs');
const { config, LOG } = require('../../common');
const Net = require('net');
const { internalTCPServer, externalTCPServer } = require('../../tcp-listener');
const { execCommand } = require('../../process-manager');


const isOnline = async () => {
  const isOnlineFlag = await fetch('https://api.cinemataztic.com', {
    method: 'GET',
    cache: 'no-cache',
    headers: { 'Content-Type': 'application/json' },
    referrerPolicy: 'no-referrer',
  })
    .then(() => true)
    .catch(() => false);
  return isOnlineFlag;
};

const checkInternalTcpValues = () => {
  return new Promise((resolve, reject) => {
    const client = new Net.Socket();
    const port = process.env.INTERNAL_TCP_SERVER_PORT;
    const host = '127.0.0.1';
    client.connect(({ port: port, host: host }), function () {
      // If there is no error, the server has accepted the request and created a new 
      // socket dedicated to us.

      // The client can now send data to the server by writing to its socket.
      client.write('{"action":"getDeviceInfo"}');
    })

    client.on('data', function (chunk) {

      let data = JSON.parse(chunk.toString().trim().split('#')[1]);
      data = JSON.parse(data);
      client.end();
      // Request an end to the connection after the data has been received.
      if (data) {
        resolve({
          internalTCP: data.status && data.status === 'success' ? true : false,
          deviceId: data.deviceId && data.deviceId !== '' ? true : false,
          screenId: data.screenId && data.screenId !== '' ? true : false,
          accessToken: data.accessToken && data.accessToken !== '' ? true : false,
          networkName: data.networkName && data.networkName !== '' ? true : false,
          market: data.market && data.market !== '' ? true : false,
          countryCode: data.countryCode && data.countryCode !== '' ? true : false,
          clusterName: data.clusterName && data.clusterName !== '' ? true : false,
        })
      } else {
        resolve({
          internalTCP: false,
          deviceId: false,
          screenId: false,
          accessToken: false,
          networkName: false,
          market: false,
          countryCode: false,
          clusterName: false,
        })
      }
    });
  })
}

const checkInternalTcp = async () => {
  if (internalTCPServer.listening) {
    return await checkInternalTcpValues()
  } else {
    return {
      internalTCP: false,
    }
  }
}

const checkExternalTcp = () => {
  return {
    externalTCP: externalTCPServer.listening
  }
}

const isDependencyInstalled = (pkg) => {
  return new Promise(async (resolve, reject) => {
    await execCommand(
      `dpkg -s ${pkg} | grep Status`,
      (error, data) => {
        if (error) {
          logsHandler.log(`is dependency installed ${pkg} : ${error}`, LOG.SEVERITY.ERROR, [LOG.TARGET.CLOUD, LOG.TARGET.WINSTON], LOG.TYPE.GENERAL);
          resolve(false);
        } else {
          if (data.includes("install ok installed")) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      }
    );
  })
}

const isServiceActive = (service) => {
  return new Promise(async (resolve, reject) => {
    await execCommand(
      `systemctl is-active ${service}.service`,
      (error, data) => {
        if (error) {
          logsHandler.log(`is dependency service active ${service} : ${error}`, LOG.SEVERITY.ERROR, [LOG.TARGET.CLOUD, LOG.TARGET.WINSTON], LOG.TYPE.GENERAL);
          resolve(false);
        } else {
          if (data === "active") {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      }
    );
  })
}

const getConnectivity = async () => {
  let checkInternal = await checkInternalTcp();
  let checkExternal = checkExternalTcp();
  try {
    return {
      isOnline: await isOnline(),
      isAuthorized: await isAuthorized(),
      validToken: !await isTokenExpired(),
      cineadPInstalled: await isDependencyInstalled('cinead-p'),
      cineadDInstalled: await isDependencyInstalled('cinead-d'),
      cineadPService: await isServiceActive('cinead-p'),
      cineadDService: await isServiceActive('cinead-d'),
      ...checkInternal,
      ...checkExternal,
    };
  } catch (error) {
    logsHandler.log(`Error in getConnectivity : ${error.message}`, LOG.SEVERITY.ERROR, [LOG.TARGET.SENTRY, LOG.TARGET.WINSTON], LOG.TYPE.GENERAL);
  }
};

module.exports = {
  getConnectivity,
};
