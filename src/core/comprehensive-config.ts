import { ComprehensiveConfig, ComprehensiveConfigSchema, ModuleConfig } from '../types/comprehensive-types.js';

/**
 * 增强的配置管理器
 * 支持模块化配置、缓存、监控等高级功能
 */
export class ComprehensiveConfigManager {
  private config: ComprehensiveConfig;
  private moduleConfigs: Map<string, ModuleConfig> = new Map();

  constructor(
    apiBaseUrl?: string,
    personalAccessToken?: string,
    options?: Partial<ComprehensiveConfig>
  ) {
    // 从环境变量或参数中获取配置
    const rawConfig = {
      apiBaseUrl: apiBaseUrl || process.env.CODING_API_BASE_URL || 'https://e.coding.net/open-api',
      personalAccessToken: personalAccessToken || process.env.CODING_PERSONAL_ACCESS_TOKEN || '',
      timeout: options?.timeout || parseInt(process.env.CODING_API_TIMEOUT || '30000'),
      retryAttempts: options?.retryAttempts || parseInt(process.env.CODING_API_RETRY_ATTEMPTS || '3'),
      maxConcurrentRequests: options?.maxConcurrentRequests || parseInt(process.env.CODING_MAX_CONCURRENT_REQUESTS || '10'),
      enableCache: options?.enableCache || (process.env.CODING_ENABLE_CACHE === 'true'),
      cacheTTL: options?.cacheTTL || parseInt(process.env.CODING_CACHE_TTL || '300'),
    };

    // 验证配置
    const result = ComprehensiveConfigSchema.safeParse(rawConfig);
    if (!result.success) {
      throw new Error(`配置验证失败: ${result.error.message}`);
    }

    this.config = result.data;
    this.initializeModuleConfigs();
  }

  /**
   * 初始化模块配置
   */
  private initializeModuleConfigs(): void {
    const modules: ModuleConfig[] = [
      {
        name: 'cd-devops',
        description: 'CD/DevOps 持续部署功能',
        enabled: true,
        tools: [
          { name: 'cd_host_server_groups', description: '主机组管理', module: 'cd-devops', enabled: true, permissions: ['cd:host:read', 'cd:host:write'] },
          { name: 'cd_cloud_accounts', description: '云账号管理', module: 'cd-devops', enabled: true, permissions: ['cd:cloud:read', 'cd:cloud:write'] },
          { name: 'cd_pipelines', description: '流水线管理', module: 'cd-devops', enabled: true, permissions: ['cd:pipeline:read', 'cd:pipeline:write'] },
          { name: 'cd_applications', description: '应用部署', module: 'cd-devops', enabled: true, permissions: ['cd:app:read', 'cd:app:write'] },
          { name: 'cd_tasks', description: '任务管理', module: 'cd-devops', enabled: true, permissions: ['cd:task:read', 'cd:task:write'] },
        ]
      },
      {
        name: 'git-management',
        description: 'Git 代码仓库管理',
        enabled: true,
        tools: [
          { name: 'git_repositories', description: '仓库管理', module: 'git-management', enabled: true, permissions: ['git:repo:read', 'git:repo:write'] },
          { name: 'git_commits', description: '提交管理', module: 'git-management', enabled: true, permissions: ['git:commit:read', 'git:commit:write'] },
          { name: 'git_branches', description: '分支管理', module: 'git-management', enabled: true, permissions: ['git:branch:read', 'git:branch:write'] },
          { name: 'git_files', description: '文件管理', module: 'git-management', enabled: true, permissions: ['git:file:read', 'git:file:write'] },
          { name: 'git_tags', description: '标签管理', module: 'git-management', enabled: true, permissions: ['git:tag:read', 'git:tag:write'] },
        ]
      },
      {
        name: 'issue-management',
        description: '事项协同管理',
        enabled: true,
        tools: [
          { name: 'issues', description: '事项管理', module: 'issue-management', enabled: true, permissions: ['issue:read', 'issue:write'] },
          { name: 'issue_comments', description: '事项评论', module: 'issue-management', enabled: true, permissions: ['issue:comment:read', 'issue:comment:write'] },
          { name: 'issue_modules', description: '事项模块', module: 'issue-management', enabled: true, permissions: ['issue:module:read', 'issue:module:write'] },
          { name: 'issue_filters', description: '事项筛选', module: 'issue-management', enabled: true, permissions: ['issue:filter:read'] },
        ]
      },
      {
        name: 'ci-build',
        description: 'CI 持续集成构建',
        enabled: true,
        tools: [
          { name: 'ci_jobs', description: '构建任务', module: 'ci-build', enabled: true, permissions: ['ci:job:read', 'ci:job:write'] },
          { name: 'ci_builds', description: '构建记录', module: 'ci-build', enabled: true, permissions: ['ci:build:read', 'ci:build:write'] },
          { name: 'ci_logs', description: '构建日志', module: 'ci-build', enabled: true, permissions: ['ci:log:read'] },
        ]
      },
      {
        name: 'artifact-registry',
        description: '制品库管理',
        enabled: true,
        tools: [
          { name: 'artifact_repositories', description: '制品仓库', module: 'artifact-registry', enabled: true, permissions: ['artifact:repo:read', 'artifact:repo:write'] },
          { name: 'artifact_packages', description: '制品包', module: 'artifact-registry', enabled: true, permissions: ['artifact:package:read', 'artifact:package:write'] },
          { name: 'artifact_versions', description: '制品版本', module: 'artifact-registry', enabled: true, permissions: ['artifact:version:read', 'artifact:version:write'] },
        ]
      },
      {
        name: 'wiki-docs',
        description: 'Wiki 文档管理',
        enabled: true,
        tools: [
          { name: 'wiki_pages', description: 'Wiki页面', module: 'wiki-docs', enabled: true, permissions: ['wiki:read', 'wiki:write'] },
        ]
      },
      {
        name: 'user-team',
        description: '用户和团队管理',
        enabled: true,
        tools: [
          { name: 'users', description: '用户管理', module: 'user-team', enabled: true, permissions: ['user:read', 'user:write'] },
          { name: 'teams', description: '团队管理', module: 'user-team', enabled: true, permissions: ['team:read', 'team:write'] },
          { name: 'projects', description: '项目管理', module: 'user-team', enabled: true, permissions: ['project:read', 'project:write'] },
        ]
      },
      {
        name: 'service-hooks',
        description: '服务钩子管理',
        enabled: true,
        tools: [
          { name: 'service_hooks', description: '服务钩子', module: 'service-hooks', enabled: true, permissions: ['hook:read', 'hook:write'] },
        ]
      },
      {
        name: 'merge-requests',
        description: '合并请求管理',
        enabled: true,
        tools: [
          { name: 'merge_requests', description: '合并请求', module: 'merge-requests', enabled: true, permissions: ['mr:read', 'mr:write'] },
        ]
      },
      {
        name: 'monitoring-stats',
        description: '监控统计功能',
        enabled: true,
        tools: [
          { name: 'health_check', description: '健康检查', module: 'monitoring-stats', enabled: true, permissions: ['monitor:read'] },
          { name: 'metrics', description: '指标统计', module: 'monitoring-stats', enabled: true, permissions: ['monitor:read'] },
        ]
      }
    ];

    modules.forEach(module => {
      this.moduleConfigs.set(module.name, module);
    });
  }

  /**
   * 获取配置
   */
  getConfig(): ComprehensiveConfig {
    return { ...this.config };
  }

  /**
   * 获取模块配置
   */
  getModuleConfig(moduleName: string): ModuleConfig | undefined {
    return this.moduleConfigs.get(moduleName);
  }

  /**
   * 获取所有模块配置
   */
  getAllModuleConfigs(): ModuleConfig[] {
    return Array.from(this.moduleConfigs.values());
  }

  /**
   * 获取启用的模块
   */
  getEnabledModules(): ModuleConfig[] {
    return this.getAllModuleConfigs().filter(module => module.enabled);
  }

  /**
   * 启用/禁用模块
   */
  setModuleEnabled(moduleName: string, enabled: boolean): void {
    const module = this.moduleConfigs.get(moduleName);
    if (module) {
      module.enabled = enabled;
    }
  }

  /**
   * 启用/禁用工具
   */
  setToolEnabled(moduleName: string, toolName: string, enabled: boolean): void {
    const module = this.moduleConfigs.get(moduleName);
    if (module) {
      const tool = module.tools.find(t => t.name === toolName);
      if (tool) {
        tool.enabled = enabled;
      }
    }
  }

  /**
   * 检查工具是否启用
   */
  isToolEnabled(moduleName: string, toolName: string): boolean {
    const module = this.moduleConfigs.get(moduleName);
    if (!module || !module.enabled) {
      return false;
    }
    
    const tool = module.tools.find(t => t.name === toolName);
    return tool ? tool.enabled : false;
  }

  /**
   * 获取工具权限
   */
  getToolPermissions(moduleName: string, toolName: string): string[] {
    const module = this.moduleConfigs.get(moduleName);
    if (!module) {
      return [];
    }
    
    const tool = module.tools.find(t => t.name === toolName);
    return tool ? tool.permissions : [];
  }

  /**
   * 更新个人访问令牌
   */
  updatePersonalAccessToken(token: string): void {
    const result = ComprehensiveConfigSchema.shape.personalAccessToken.safeParse(token);
    if (!result.success) {
      throw new Error(`令牌验证失败: ${result.error.message}`);
    }
    this.config.personalAccessToken = token;
  }

  /**
   * 更新 API Base URL
   */
  updateApiBaseUrl(url: string): void {
    const result = ComprehensiveConfigSchema.shape.apiBaseUrl.safeParse(url);
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
      ComprehensiveConfigSchema.parse(this.config);
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
      'User-Agent': 'CODING-MCP-Client/1.0.0',
    };
  }

  /**
   * 获取缓存配置
   */
  getCacheConfig(): { enabled: boolean; ttl: number } {
    return {
      enabled: this.config.enableCache,
      ttl: this.config.cacheTTL,
    };
  }

  /**
   * 获取并发配置
   */
  getConcurrencyConfig(): { maxConcurrentRequests: number; timeout: number; retryAttempts: number } {
    return {
      maxConcurrentRequests: this.config.maxConcurrentRequests,
      timeout: this.config.timeout,
      retryAttempts: this.config.retryAttempts,
    };
  }

  /**
   * 导出配置为 JSON
   */
  exportConfig(): string {
    return JSON.stringify({
      config: this.config,
      modules: Array.from(this.moduleConfigs.values()),
    }, null, 2);
  }

  /**
   * 从 JSON 导入配置
   */
  importConfig(configJson: string): void {
    try {
      const imported = JSON.parse(configJson);
      
      if (imported.config) {
        const result = ComprehensiveConfigSchema.safeParse(imported.config);
        if (result.success) {
          this.config = result.data;
        }
      }
      
      if (imported.modules && Array.isArray(imported.modules)) {
        this.moduleConfigs.clear();
        imported.modules.forEach((module: ModuleConfig) => {
          this.moduleConfigs.set(module.name, module);
        });
      }
    } catch (error) {
      throw new Error(`配置导入失败: ${(error as Error).message}`);
    }
  }
}
