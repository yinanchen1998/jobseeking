/**
 * Redis 服务
 * 用于存储验证码、会话等
 */

import Redis from 'ioredis';

export class RedisService {
  constructor(config = {}) {
    this.client = null;
    this.enabled = false;
    
    const redisConfig = {
      host: config.host || process.env.REDIS_HOST || 'localhost',
      port: config.port || parseInt(process.env.REDIS_PORT) || 6379,
      password: config.password || process.env.REDIS_PASSWORD || undefined,
      db: config.db || parseInt(process.env.REDIS_DB) || 0,
      connectTimeout: 5000,
      maxRetriesPerRequest: 3,
    };

    try {
      this.client = new Redis(redisConfig);
      this.enabled = true;
      
      this.client.on('connect', () => {
        console.log('[Redis] 连接成功');
      });
      
      this.client.on('error', (err) => {
        console.error('[Redis] 错误:', err.message);
        this.enabled = false;
      });
      
    } catch (error) {
      console.error('[Redis] 初始化失败:', error.message);
      this.enabled = false;
    }
  }

  /**
   * 设置键值（带过期时间）
   * @param {string} key - 键
   * @param {string} value - 值
   * @param {number} ttlSeconds - 过期时间（秒）
   */
  async set(key, value, ttlSeconds) {
    if (!this.enabled) return false;
    try {
      await this.client.setex(key, ttlSeconds, value);
      return true;
    } catch (error) {
      console.error('[Redis] set error:', error);
      return false;
    }
  }

  /**
   * 获取键值
   * @param {string} key - 键
   * @returns {Promise<string|null>}
   */
  async get(key) {
    if (!this.enabled) return null;
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('[Redis] get error:', error);
      return null;
    }
  }

  /**
   * 删除键
   * @param {string} key - 键
   */
  async del(key) {
    if (!this.enabled) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('[Redis] del error:', error);
      return false;
    }
  }

  /**
   * 检查连接状态
   */
  isConnected() {
    return this.enabled && this.client.status === 'ready';
  }

  /**
   * 生成带前缀的键名
   * @param {string} prefix - 前缀
   * @param {string} key - 键
   */
  key(prefix, key) {
    return `jobseeking:${prefix}:${key}`;
  }
}

export default RedisService;
