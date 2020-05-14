'use strict';

const Controller = require('egg').Controller;

class TechController extends Controller {
  constructor(x) {
    super(x);
    this.service = this.ctx.service.tech;
  }
  async start() {
    const { ctx, service } = this;
    ctx.body = await service.tech.start();
  }
}

module.exports = TechController;
