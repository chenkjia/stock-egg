'use strict';

const Controller = require('egg').Controller;

class SampleController extends Controller {
  constructor(x) {
    super(x);
    this.service = this.ctx.service.sample;
  }
  async start() {
    const { ctx, service } = this;
    ctx.body = await service.sample.start();
  }
}

module.exports = SampleController;
