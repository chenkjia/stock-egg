'use strict';

const Controller = require('egg').Controller;

class TechController extends Controller {
  constructor(x) {
    super(x);
    this.service = this.ctx.service.stage;
  }
  async start() {
    const { ctx, service } = this;
    ctx.body = await service.stage.start();
  }
}

module.exports = TechController;
