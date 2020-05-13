'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  // 启动爬虫程序
  router.post('/spider/start', controller.spider.start);
  // 启动爬虫程序
  router.post('/spider/dayline', controller.spider.dayline);
  // 指标信息计算程序
  // router.post('/ta/start', controller.ta.start);
  // // 信号数据收集程序
  // router.post('/sign/start', controller.sign.start);
  // // 样本数据收集程序
  // router.post('/sample/start', controller.sample.start);
  // // 样本数据的增删改查程序
  // router.resources('sample', '/sample', controller.sample);
  // // 策略回测程序
  // router.post('/backtest/start', controller.backtest.start);
};
