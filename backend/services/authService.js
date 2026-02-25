/**
 * 用户认证服务
 * 支持手机号+验证码登录
 */

import crypto from 'crypto';
import { RedisService } from './redisService.js';

// 内存存储（Redis不可用时使用）
const memoryStore = {
  codes: new Map(),
  sessions: new Map(),
  users: new Map(),
};

export class AuthService {
  constructor(smsService, redisService) {
    this.sms = smsService;
    this.redis = redisService;
    this.useRedis = redisService && redisService.isConnected();
    
    // 配置
    this.CODE_EXPIRE_MINUTES = 5;  // 验证码5分钟有效
    this.TOKEN_EXPIRE_DAYS = 7;     // Token 7天有效
    this.MAX_ATTEMPTS = 3;          // 最多尝试3次
    
    // 阿里云短信配置
    this.signName = process.env.ALIYUN_SMS_SIGN_NAME || '求职AI助手';
    this.templateCode = process.env.ALIYUN_SMS_TEMPLATE_CODE || 'SMS_12345678';
    
    if (this.useRedis) {
      console.log('[Auth] 使用Redis存储');
    } else {
      console.log('[Auth] 使用内存存储');
    }
    
    // 开发模式：未配置短信服务时，验证码打印到控制台
    this.devMode = !smsService;
    if (this.devMode) {
      console.log('[Auth] 开发模式：验证码将打印到控制台');
    }
  }

  /**
   * 生成6位验证码
   */
  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 生成Token
   */
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 保存验证码
   */
  async _saveCode(phone, codeData) {
    const key = `code:${phone}`;
    const value = JSON.stringify(codeData);
    
    if (this.useRedis) {
      await this.redis.set(
        this.redis.key('auth', key), 
        value, 
        this.CODE_EXPIRE_MINUTES * 60
      );
    } else {
      memoryStore.codes.set(phone, {
        ...codeData,
        expireTime: Date.now() + this.CODE_EXPIRE_MINUTES * 60 * 1000,
      });
    }
  }

  /**
   * 获取验证码
   */
  async _getCode(phone) {
    if (this.useRedis) {
      const data = await this.redis.get(this.redis.key('auth', `code:${phone}`));
      return data ? JSON.parse(data) : null;
    } else {
      const codeData = memoryStore.codes.get(phone);
      if (codeData && Date.now() > codeData.expireTime) {
        memoryStore.codes.delete(phone);
        return null;
      }
      return codeData || null;
    }
  }

  /**
   * 删除验证码
   */
  async _deleteCode(phone) {
    if (this.useRedis) {
      await this.redis.del(this.redis.key('auth', `code:${phone}`));
    } else {
      memoryStore.codes.delete(phone);
    }
  }

  /**
   * 保存会话
   */
  async _saveSession(token, sessionData) {
    const key = `session:${token}`;
    const value = JSON.stringify(sessionData);
    
    if (this.useRedis) {
      await this.redis.set(
        this.redis.key('auth', key),
        value,
        this.TOKEN_EXPIRE_DAYS * 24 * 3600
      );
    } else {
      memoryStore.sessions.set(token, {
        ...sessionData,
        expireTime: Date.now() + this.TOKEN_EXPIRE_DAYS * 24 * 3600 * 1000,
      });
    }
  }

  /**
   * 获取会话
   */
  async _getSession(token) {
    if (this.useRedis) {
      const data = await this.redis.get(this.redis.key('auth', `session:${token}`));
      return data ? JSON.parse(data) : null;
    } else {
      const session = memoryStore.sessions.get(token);
      if (session && Date.now() > session.expireTime) {
        memoryStore.sessions.delete(token);
        return null;
      }
      return session || null;
    }
  }

  /**
   * 发送验证码
   * @param {string} phone - 手机号
   * @returns {Promise<{success: boolean, message: string, devCode?: string}>}
   */
  async sendCode(phone) {
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return { success: false, message: '手机号格式不正确' };
    }

    // 检查是否已发送（防止频繁发送）
    const existingCode = await this._getCode(phone);
    if (existingCode && Date.now() - existingCode.sendTime < 60000) {
      return { success: false, message: '请稍后再试（60秒）' };
    }

    // 生成验证码
    const code = this.generateCode();
    
    // 保存验证码
    await this._saveCode(phone, {
      code,
      attempts: 0,
      sendTime: Date.now(),
    });

    // 开发模式：直接返回验证码
    if (this.devMode) {
      console.log(`\n[DEV MODE] 验证码: ${code}\n`);
      return { 
        success: true, 
        message: '验证码已发送（开发模式）',
        devCode: code,
      };
    }

    // 生产模式：发送短信
    const result = await this.sms.sendVerifyCode(
      phone,
      this.signName,
      this.templateCode,
      { code, min: this.CODE_EXPIRE_MINUTES.toString() }
    );

    if (result.success) {
      return { success: true, message: '验证码已发送' };
    } else {
      return { success: false, message: result.message };
    }
  }

  /**
   * 验证验证码并登录
   * @param {string} phone - 手机号
   * @param {string} code - 验证码
   * @returns {Promise<{success: boolean, message: string, token?: string, user?: object}>}
   */
  async verifyCode(phone, code) {
    const codeData = await this._getCode(phone);
    
    if (!codeData) {
      return { success: false, message: '验证码已过期，请重新获取' };
    }

    // 检查尝试次数
    if (codeData.attempts >= this.MAX_ATTEMPTS) {
      await this._deleteCode(phone);
      return { success: false, message: '尝试次数过多，请重新获取验证码' };
    }

    // 验证验证码
    if (codeData.code !== code) {
      codeData.attempts += 1;
      await this._saveCode(phone, codeData);
      return { 
        success: false, 
        message: `验证码错误，还剩 ${this.MAX_ATTEMPTS - codeData.attempts} 次机会` 
      };
    }

    // 验证成功，删除验证码
    await this._deleteCode(phone);

    // 创建或获取用户
    const userId = this._generateUserId(phone);
    const user = {
      userId,
      phone,
      createdAt: new Date().toISOString(),
    };

    // 生成Token
    const token = this.generateToken();
    
    // 保存会话
    await this._saveSession(token, {
      userId,
      phone,
      loginTime: new Date().toISOString(),
    });

    return {
      success: true,
      message: '登录成功',
      token,
      user,
    };
  }

  /**
   * 验证Token
   * @param {string} token - Token
   * @returns {Promise<object|null>} - 用户信息或null
   */
  async validateToken(token) {
    if (!token) return null;
    const session = await this._getSession(token);
    return session ? { userId: session.userId, phone: session.phone } : null;
  }

  /**
   * 退出登录
   * @param {string} token - Token
   */
  async logout(token) {
    if (this.useRedis) {
      await this.redis.del(this.redis.key('auth', `session:${token}`));
    } else {
      memoryStore.sessions.delete(token);
    }
    return true;
  }

  /**
   * 生成用户ID（基于手机号）
   */
  _generateUserId(phone) {
    return crypto.createHash('md5').update(phone).digest('hex').substring(0, 16);
  }
}

export default AuthService;
