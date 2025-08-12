#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { ComprehensiveConfigManager } from './core/comprehensive-config.js';
import { ComprehensiveApiClient } from './core/comprehensive-api-client.js';

// 导入所有功能模块
import { CdDevOpsTools } from './modules/cd-devops-tools.js';
import { GitManagementTools } from './modules/git-management-tools.js';
import { CiBuildTools } from './modules/ci-build-tools.js';
import { IssueTools } from './tools/issue-tools.js';
import { UserTools } from './tools/user-tools.js';
import { ProjectTools } from './tools/project-tools.js';
import { TeamTools } from './tools/team-tools.js';

import { 
  ComprehensiveCodingApiError,
  HealthStatus,
  ModuleMetrics
} from './types/comprehensive-types.js';

/**
 * 完整的 CODING API MCP 服务器
 * 支持所有 413 个 CODING API 接口，提供全面的 DevOps 功能
 */
class ComprehensiveCodingApiMcpServer {
  private server: Server;
  private configManager!: ComprehensiveConfigManager;
  private apiClient!: ComprehensiveApiClient;
  
  // 所有功能模块
  private cdDevOpsTools!: CdDevOpsTools;
  private gitManagementTools!: GitManagementTools;
  private ciBuildTools!: CiBuildTools;
  private issueTools!: IssueTools;
  private userTools!: UserTools;
  private projectTools!: ProjectTools;
  private teamTools!: TeamTools;

  constructor() {
    this.server = new Server(
      {
        name: 'comprehensive-coding-api-server',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    // 自动从环境变量初始化配置
    this.initializeFromEnvironment();
    this.setupServer();
  }

  /**
   * 从环境变量自动初始化配置
   */
  private initializeFromEnvironment(): void {
    const apiBaseUrl = process.env.CODING_API_BASE_URL;
    const personalAccessToken = process.env.CODING_PERSONAL_ACCESS_TOKEN;

    if (personalAccessToken) {
      try {
        this.initializeClients(apiBaseUrl, personalAccessToken);
        console.log('✅ 已从环境变量自动配置 CODING API');
      } catch (error: any) {
        console.warn('⚠️ 环境变量配置失败:', error.message);
        console.log('💡 请使用 coding_configure 工具手动配置');
      }
    } else {
      console.log('💡 未检测到环境变量中的访问令牌，请使用 coding_configure 工具配置');
    }
  }

  /**
   * 初始化配置和客户端
   */
  private initializeClients(apiBaseUrl?: string, personalAccessToken?: string): void {
    try {
      this.configManager = new ComprehensiveConfigManager(apiBaseUrl, personalAccessToken);
      this.apiClient = new ComprehensiveApiClient(this.configManager);
      
      // 初始化所有功能模块
      this.cdDevOpsTools = new CdDevOpsTools(this.apiClient);
      this.gitManagementTools = new GitManagementTools(this.apiClient);
      this.ciBuildTools = new CiBuildTools(this.apiClient);
      this.issueTools = new IssueTools(this.apiClient);
      this.userTools = new UserTools(this.apiClient);
      this.projectTools = new ProjectTools(this.apiClient);
      this.teamTools = new TeamTools(this.apiClient);

      console.log('✅ 所有模块初始化完成');
    } catch (error: any) {
      console.error('❌ 初始化失败:', error.message);
      throw new McpError(
        ErrorCode.InvalidRequest,
        `配置初始化失败: ${error.message}`
      );
    }
  }

  /**
   * 设置服务器处理程序
   */
  private setupServer(): void {
    // 处理工具列表请求
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      // 如果未初始化，只返回配置相关的工具
      if (!this.isInitialized()) {
        return {
          tools: [
            {
              name: 'coding_configure',
              description: '配置 CODING API 的基础设置（API Base URL 和个人访问令牌）',
              inputSchema: {
                type: 'object',
                properties: {
                  apiBaseUrl: {
                    type: 'string',
                    description: 'CODING API 基础 URL，默认为 https://e.coding.net/open-api',
                    default: 'https://e.coding.net/open-api',
                  },
                  personalAccessToken: {
                    type: 'string',
                    description: 'CODING 个人访问令牌',
                  },
                },
                required: ['personalAccessToken'],
              },
            },
            {
              name: 'coding_health_check',
              description: '检查 CODING API 连接状态',
              inputSchema: {
                type: 'object',
                properties: {},
                required: [],
              },
            },
          ],
        };
      }

      const allTools = [
        // 核心管理工具
        {
          name: 'coding_configure',
          description: '配置 CODING API 的基础设置（API Base URL 和个人访问令牌）',
          inputSchema: {
            type: 'object',
            properties: {
              apiBaseUrl: {
                type: 'string',
                description: 'CODING API 基础 URL，默认为 https://e.coding.net/open-api',
                default: 'https://e.coding.net/open-api',
              },
              personalAccessToken: {
                type: 'string',
                description: 'CODING 个人访问令牌',
              },
              enableCache: {
                type: 'boolean',
                description: '是否启用缓存',
                default: false,
              },
              maxConcurrentRequests: {
                type: 'number',
                description: '最大并发请求数',
                default: 10,
              },
            },
            required: ['personalAccessToken'],
          },
        },
        {
          name: 'coding_health_check',
          description: '检查 CODING API 连接状态和服务健康度',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'coding_get_metrics',
          description: '获取 API 调用监控指标',
          inputSchema: {
            type: 'object',
            properties: {
              module: {
                type: 'string',
                description: '指定模块名称（可选）',
              },
            },
          },
        },
        {
          name: 'coding_reset_metrics',
          description: '重置监控指标',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'coding_clear_cache',
          description: '清空所有缓存',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'coding_get_module_status',
          description: '获取所有模块的启用状态',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'coding_toggle_module',
          description: '启用或禁用指定模块',
          inputSchema: {
            type: 'object',
            properties: {
              moduleName: {
                type: 'string',
                description: '模块名称',
              },
              enabled: {
                type: 'boolean',
                description: '是否启用',
              },
            },
            required: ['moduleName', 'enabled'],
          },
        },

        // CD/DevOps 工具 (50+ 个)
        ...this.cdDevOpsTools.getTools(),
        
        // Git 管理工具 (80+ 个)
        ...this.gitManagementTools.getTools(),
        
        // CI/Build 工具 (40+ 个)
        ...this.ciBuildTools.getTools(),
        
        // Issue 管理工具 (原有的)
        ...this.issueTools.getTools(),
        
        // 用户管理工具 (原有的)
        ...this.userTools.getTools(),
        
        // 项目管理工具 (原有的)
        ...this.projectTools.getTools(),
        
        // 团队管理工具 (原有的)
        ...this.teamTools.getTools(),
      ];

      console.log(`📊 提供 ${allTools.length} 个工具，覆盖 CODING 平台全部功能`);

      return { tools: allTools };
    });

    // 处理工具调用请求
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        // 核心管理工具
        if (name === 'coding_configure') {
          return await this.handleConfigureTool(args);
        }
        if (name === 'coding_health_check') {
          return await this.handleHealthCheckTool();
        }
        if (name === 'coding_get_metrics') {
          return await this.handleGetMetricsTool(args);
        }
        if (name === 'coding_reset_metrics') {
          return await this.handleResetMetricsTool();
        }
        if (name === 'coding_clear_cache') {
          return await this.handleClearCacheTool();
        }
        if (name === 'coding_get_module_status') {
          return await this.handleGetModuleStatusTool();
        }
        if (name === 'coding_toggle_module') {
          return await this.handleToggleModuleTool(args);
        }

        // 检查是否已初始化
        if (!this.isInitialized()) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            '服务未初始化，请先使用 coding_configure 工具配置 API'
          );
        }

        // 路由到对应的模块
        const result = await this.routeToolCall(name, args);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };

      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }

        console.error(`❌ 工具执行错误 [${name}]:`, error);
        
        if (error instanceof ComprehensiveCodingApiError) {
          throw new McpError(
            ErrorCode.InternalError,
            `CODING API 错误 [${error.code}]: ${error.message}`
          );
        }

        throw new McpError(
          ErrorCode.InternalError,
          `工具执行失败: ${(error as any).message}`
        );
      }
    });
  }

  /**
   * 检查是否已初始化
   */
  private isInitialized(): boolean {
    return !!(this.configManager && 
              this.apiClient && 
              this.cdDevOpsTools && 
              this.gitManagementTools && 
              this.ciBuildTools &&
              this.issueTools &&
              this.userTools &&
              this.projectTools &&
              this.teamTools);
  }

  /**
   * 路由工具调用到对应模块
   */
  private async routeToolCall(toolName: string, args: any): Promise<any> {
    // CD/DevOps 工具
    if (toolName.startsWith('coding_cd_')) {
      const moduleName = 'cd-devops';
      if (!this.configManager.isToolEnabled(moduleName, toolName)) {
        throw new Error(`工具 ${toolName} 在模块 ${moduleName} 中已被禁用`);
      }
      return this.cdDevOpsTools.executeTool(toolName, args);
    }

    // Git 管理工具
    if (toolName.startsWith('coding_git_')) {
      const moduleName = 'git-management';
      if (!this.configManager.isToolEnabled(moduleName, 'git_repositories')) {
        throw new Error(`工具 ${toolName} 在模块 ${moduleName} 中已被禁用`);
      }
      return this.gitManagementTools.executeTool(toolName, args);
    }

    // CI/Build 工具
    if (toolName.startsWith('coding_ci_')) {
      const moduleName = 'ci-build';
      if (!this.configManager.isToolEnabled(moduleName, 'ci_jobs')) {
        throw new Error(`工具 ${toolName} 在模块 ${moduleName} 中已被禁用`);
      }
      return this.ciBuildTools.executeTool(toolName, args);
    }

    // Issue 管理工具
    if (toolName.includes('issue') || toolName.includes('defect') || toolName.includes('my_')) {
      return this.issueTools.executeTool(toolName, args);
    }

    // 用户工具
    if (toolName.startsWith('coding_get_current_user') ||
        toolName.startsWith('coding_get_user_') ||
        toolName.startsWith('coding_update_user_')) {
      return this.userTools.executeTool(toolName, args);
    }

    // 项目工具
    if (toolName.startsWith('coding_') && 
        (toolName.includes('project') || toolName === 'coding_list_projects')) {
      return this.projectTools.executeTool(toolName, args);
    }

    // 团队工具
    if (toolName.startsWith('coding_') && 
        (toolName.includes('team') || toolName.includes('Team'))) {
      return this.teamTools.executeTool(toolName, args);
    }

    throw new Error(`未知的工具: ${toolName}`);
  }

  // ===== 核心管理工具实现 =====

  private async handleConfigureTool(args: any) {
    try {
      this.initializeClients(args.apiBaseUrl, args.personalAccessToken);
      
      // 更新配置选项
      if (args.enableCache !== undefined) {
        this.configManager.getConfig().enableCache = args.enableCache;
      }
      if (args.maxConcurrentRequests !== undefined) {
        this.configManager.getConfig().maxConcurrentRequests = args.maxConcurrentRequests;
      }
      
      // 验证配置
      const isHealthy = await this.apiClient.healthCheck();
      if (!isHealthy) {
        throw new Error('API 连接验证失败，请检查配置');
      }

      const enabledModules = this.configManager.getEnabledModules();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: '✅ 配置成功，服务器已就绪',
              config: {
                apiBaseUrl: this.configManager.getConfig().apiBaseUrl,
                hasToken: !!this.configManager.getConfig().personalAccessToken,
                enableCache: this.configManager.getConfig().enableCache,
                maxConcurrentRequests: this.configManager.getConfig().maxConcurrentRequests,
              },
              modules: {
                total: enabledModules.length,
                enabled: enabledModules.map(m => ({
                  name: m.name,
                  description: m.description,
                  toolCount: m.tools.length,
                })),
              },
            }, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `配置失败: ${error.message}`
      );
    }
  }

  private async handleHealthCheckTool() {
    if (!this.apiClient) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              healthy: false,
              message: '❌ 服务未初始化',
            }, null, 2),
          },
        ],
      };
    }

    const healthStatus = this.apiClient.getHealthStatus();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            ...healthStatus,
            message: healthStatus.healthy ? '✅ 服务运行正常' : '⚠️ 服务存在问题',
            uptime: `${Math.floor(healthStatus.uptime / 1000)} 秒`,
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetMetricsTool(args: any) {
    if (!this.apiClient) {
      throw new Error('服务未初始化');
    }

    const metrics = args.module ? 
      { [args.module]: this.apiClient.getModuleMetrics(args.module) } :
      this.apiClient.getMetrics();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            metrics,
            timestamp: new Date().toISOString(),
            uptime: this.apiClient.getUptime(),
          }, null, 2),
        },
      ],
    };
  }

  private async handleResetMetricsTool() {
    if (!this.apiClient) {
      throw new Error('服务未初始化');
    }

    this.apiClient.resetMetrics();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: '✅ 监控指标已重置',
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  private async handleClearCacheTool() {
    if (!this.apiClient) {
      throw new Error('服务未初始化');
    }

    await this.apiClient.clearCache();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: '✅ 缓存已清空',
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetModuleStatusTool() {
    if (!this.configManager) {
      throw new Error('服务未初始化');
    }

    const modules = this.configManager.getAllModuleConfigs();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            modules: modules.map(module => ({
              name: module.name,
              description: module.description,
              enabled: module.enabled,
              tools: module.tools.map(tool => ({
                name: tool.name,
                description: tool.description,
                enabled: tool.enabled,
                permissions: tool.permissions,
              })),
            })),
          }, null, 2),
        },
      ],
    };
  }

  private async handleToggleModuleTool(args: any) {
    if (!this.configManager) {
      throw new Error('服务未初始化');
    }

    this.configManager.setModuleEnabled(args.moduleName, args.enabled);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `✅ 模块 ${args.moduleName} 已${args.enabled ? '启用' : '禁用'}`,
            moduleName: args.moduleName,
            enabled: args.enabled,
          }, null, 2),
        },
      ],
    };
  }

  /**
   * 启动服务器
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    const isConfigured = this.isInitialized();
    const statusIcon = isConfigured ? '✅' : '⚠️';
    const statusText = isConfigured ? '已配置' : '待配置';
    
    console.error(`
🚀 CODING API MCP 服务器已启动 (v2.0.0)
${statusIcon} 配置状态: ${statusText}
📊 支持 413+ API 接口，覆盖完整 DevOps 流程
🔧 包含模块：CD/DevOps、Git、CI/Build、Issue、User、Project、Team

${isConfigured ? 
  '🎉 服务器就绪，可以开始使用所有功能！' : 
  '💡 请在 MCP 配置中设置 CODING_PERSONAL_ACCESS_TOKEN 环境变量'}
    `);
  }
}

// 启动服务器
async function main() {
  try {
    const server = new ComprehensiveCodingApiMcpServer();
    await server.start();
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 未处理的错误:', error);
    process.exit(1);
  });
}

export { ComprehensiveCodingApiMcpServer };
