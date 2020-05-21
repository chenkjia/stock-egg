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
  async data() {
    const { ctx, service } = this;
    ctx.body = await service.techData.init();
  }
  async stage() {
    const { ctx, service } = this;
    ctx.body = await service.techStage.init();
  }
  async stageSign() {
    const { ctx, service } = this;
    ctx.body = await service.techStage.sign();
  }
  async mark() {
    const { ctx, service } = this;
    ctx.body = await service.techMark.init();
  }
  async sign() {
    const { ctx, service } = this;
    await service.techSign.init();
    ctx.body = await this.ctx.service.sample.sample.start();
  }
}

module.exports = TechController;
