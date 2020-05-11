/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1588823301237_6759';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    protocol: 'mongodb',
    user: 'chenkj',
    password: '44039159',
    target: 'localhost:27017',
    database: 'stock',
  };
  config.mongoose = {
    url: `${userConfig.protocol}://${userConfig.target}`,
    options: {
      dbName: userConfig.database,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  };

  return {
    ...config,
    ...userConfig,
  };
};
