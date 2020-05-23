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
  router.post('/tech/start', controller.tech.start);
  // 指标标识计算程序
  router.post('/tech/data', controller.tech.data);
  // 指标标识计算程序
  router.post('/tech/mark', controller.tech.mark);
  // 趋势计算程序
  router.post('/tech/stage', controller.tech.stage);
  // 趋势计算程序
  router.post('/tech/stageSign', controller.tech.stageSign);
  // 信号数据收集程序
  router.post('/tech/sign', controller.tech.sign);
  // 样本数据收集程序
  router.post('/sample/start', controller.sample.start);
  // 趋势判断样本数据收集程序
  router.post('/sample/stage', controller.sample.stage);
  // // 样本数据的增删改查程序
  // router.resources('sample', '/sample', controller.sample);
  // 选择上升趋势的股票
  router.post('/selectStock/start', controller.selectStock.start);
  // // 策略回测程序
  // router.post('/backtest/start', controller.backtest.start);
};
