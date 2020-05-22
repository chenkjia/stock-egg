'use strict';

const Service = require('egg').Service;

class CommomService extends Service {
  constructor(x) {
    super(x);
    this.model = this.ctx.model.Stock;
  }
  async index({ filter = {}, select = null, query = {} }) {
    return await this.model.find(filter, select, query);
  }
  async show({ filter = {}, select = null, query = { lean: true } }) {
    return await this.model.findOne(filter, select, query);
  }
  async create(body) {
    const result = new this.model(body);
    await result.save();
    return result;
  }
  async insertMany(body) {
    const result = await this.model.insertMany(body);
    return result;
  }
  async update(query, body) {
    const result = await this.model.updateOne(query, body);
    return result;
  }
  async destory(query) {
    const result = await this.model.deleteOne(query);
    return result;
  }
  async aggregate(query) {
    const result = await this.model.aggregate(query);
    return result;
  }
}

module.exports = CommomService;
