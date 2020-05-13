'use strict';

const Controller = require('egg').Controller;

class SpiderController extends Controller {
  constructor(x) {
    super(x);
    this.service = this.ctx.service.spider;
  }
  async start() {
    const { ctx, service } = this;
    ctx.body = await service.spider.start();
  }
  async dayline() {
    const { ctx, service } = this;
    ctx.body = await service.spider.daylineInit();
  }

  // async stockInit() {
  //   const { ctx, service } = this;
  //   ctx.body = await service.spider.stockInit();
  // }
  // async adjInit() {
  //   const { ctx, service } = this;
  //   ctx.body = await service.spider.adjInit();
  // }
  // async daylineInit() {
  //   const { ctx, service } = this;
  //   ctx.body = await service.spider.daylineInit();
  // }
  // async daylineAdj() {
  //   const { ctx, service } = this;
  //   ctx.body = await service.spider.daylineAdj();
  // }
  // async bondsIssue() {
  //   const { ctx, service } = this;
  //   ctx.body = await service.spider.getBondsIssue();
  // }
}

module.exports = SpiderController;
