import { Config, ConfigSchema } from './types.js';

/**
 * 配置管理器
 * 负责处理 MCP 服务的配置参数
 */
export class ConfigManager {
  private config: Config;

  constructor(
    apiBaseUrl?: string,
    personalAccessToken?: string,
    options?: Partial<Config>
  ) {
    // 从环境变量或参数中获取配置
    const rawConfig = {
      apiBaseUrl: apiBaseUrl || process.env.CODING_API_BASE_URL || 'https://e.coding.net/open-api',
      personalAccessToken: personalAccessToken || process.env.CODING_PERSONAL_ACCESS_TOKEN || '',
      timeout: options?.timeout || parseInt(process.env.CODING_API_TIMEOUT || '30000'),
      retryAttempts: options?.retryAttempts || parseInt(process.env.CODING_API_RETRY_ATTEMPTS || '3'),
    };

    // 验证配置
    const result = ConfigSchema.safeParse(rawConfig);
    if (!result.success) {
      throw new Error(`配置验证失败: ${result.error.message}`);
    }

    this.config = result.data;
  }

  /**
   * 获取配置
   */
  getConfig(): Config {
    return { ...this.config };
  }

  /**
   * 更新个人访问令牌
   */
  updatePersonalAccessToken(token: string): void {
    const result = ConfigSchema.shape.personalAccessToken.safeParse(token);
    if (!result.success) {
      throw new Error(`令牌验证失败: ${result.error.message}`);
    }
    this.config.personalAccessToken = token;
  }

  /**
   * 更新 API Base URL
   */
  updateApiBaseUrl(url: string): void {
    const result = ConfigSchema.shape.apiBaseUrl.safeParse(url);
    if (!result.success) {
      throw new Error(`URL 验证失败: ${result.error.message}`);
    }
    this.config.apiBaseUrl = url;
  }

  /**
   * 验证配置是否完整
   */
  validateConfig(): boolean {
    try {
      ConfigSchema.parse(this.config);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取认证头信息
   */
  getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `token ${this.config.personalAccessToken}`,
      'Content-Type': 'application/json',
    };
  }
}
