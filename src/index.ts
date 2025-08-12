#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { ConfigManager } from './config.js';
import { CodingApiClient } from './api-client.js';
import { UserTools } from './tools/user-tools.js';
import { ProjectTools } from './tools/project-tools.js';
import { TeamTools } from './tools/team-tools.js';
import { IssueTools } from './tools/issue-tools.js';

/**
 * CODING API MCP 服务器
 * 提供与 CODING DevOps 平台 API 的集成
 */
class CodingApiMcpServer {
  private server: Server;
  private configManager!: ConfigManager;
  private apiClient!: CodingApiClient;
  private userTools!: UserTools;
  private projectTools!: ProjectTools;
  private teamTools!: TeamTools;
  private issueTools!: IssueTools;

  constructor() {
    this.server = new Server(
      {
        name: 'coding-api-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupServer();
  }

  /**
   * 初始化配置和客户端
   */
  private initializeClients(apiBaseUrl?: string, personalAccessToken?: string): void {
    try {
      this.configManager = new ConfigManager(apiBaseUrl, personalAccessToken);
      this.apiClient = new CodingApiClient(this.configManager);
      this.userTools = new UserTools(this.apiClient);
      this.projectTools = new ProjectTools(this.apiClient);
      this.teamTools = new TeamTools(this.apiClient);
      this.issueTools = new IssueTools(this.apiClient);
    } catch (error: any) {
      console.error('初始化失败:', error.message);
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
      if (!this.userTools || !this.projectTools || !this.teamTools || !this.issueTools) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          '服务未初始化，请先提供 API 配置'
        );
      }

      return {
        tools: [
          // 配置工具
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
          // 健康检查工具
          {
            name: 'coding_health_check',
            description: '检查 CODING API 连接状态',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          // 用户工具
          ...this.userTools.getTools(),
          // 项目工具
          ...this.projectTools.getTools(),
          // 团队工具
          ...this.teamTools.getTools(),
          // 事项工具
          ...this.issueTools.getTools(),
        ],
      };
    });

    // 处理工具调用请求
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        // 配置工具
        if (name === 'coding_configure') {
          return await this.handleConfigureTool(args);
        }

        // 健康检查工具
        if (name === 'coding_health_check') {
          return await this.handleHealthCheckTool();
        }

        // 检查是否已初始化
        if (!this.userTools || !this.projectTools || !this.teamTools || !this.issueTools) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            '服务未初始化，请先使用 coding_configure 工具配置 API'
          );
        }

        // 用户工具
        if (name.startsWith('coding_get_current_user') ||
            name.startsWith('coding_get_user_') ||
            name.startsWith('coding_update_user_')) {
          const result = await this.userTools.executeTool(name, args);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // 项目工具
        if (name.startsWith('coding_') && 
            (name.includes('project') || name === 'coding_list_projects')) {
          const result = await this.projectTools.executeTool(name, args);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // 团队工具
        if (name.startsWith('coding_') && 
            (name.includes('team') || name.includes('Team'))) {
          const result = await this.teamTools.executeTool(name, args);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // 事项工具
        if (name.startsWith('coding_') && 
            (name.includes('issue') || name.includes('defect') || name.includes('my_'))) {
          const result = await this.issueTools.executeTool(name, args);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        throw new McpError(
          ErrorCode.MethodNotFound,
          `未知的工具: ${name}`
        );
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }

        console.error(`工具执行错误 [${name}]:`, error);
        throw new McpError(
          ErrorCode.InternalError,
          `工具执行失败: ${(error as any).message}`
        );
      }
    });
  }

  /**
   * 处理配置工具
   */
  private async handleConfigureTool(args: any) {
    try {
      this.initializeClients(args.apiBaseUrl, args.personalAccessToken);
      
      // 验证配置
      const isHealthy = await this.apiClient.healthCheck();
      if (!isHealthy) {
        throw new Error('API 连接验证失败，请检查配置');
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: '配置成功',
              config: {
                apiBaseUrl: this.configManager.getConfig().apiBaseUrl,
                hasToken: !!this.configManager.getConfig().personalAccessToken,
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

  /**
   * 处理健康检查工具
   */
  private async handleHealthCheckTool() {
    if (!this.apiClient) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              healthy: false,
              message: '服务未初始化',
            }, null, 2),
          },
        ],
      };
    }

    const isHealthy = await this.apiClient.healthCheck();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            healthy: isHealthy,
            message: isHealthy ? 'API 连接正常' : 'API 连接失败',
            config: {
              apiBaseUrl: this.configManager.getConfig().apiBaseUrl,
              hasToken: !!this.configManager.getConfig().personalAccessToken,
            },
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
    console.error('CODING API MCP 服务器已启动');
  }
}

// 启动服务器
async function main() {
  try {
    const server = new CodingApiMcpServer();
    await server.start();
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('未处理的错误:', error);
    process.exit(1);
  });
}

export { CodingApiMcpServer };
