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
}

module.exports = SpiderController;
