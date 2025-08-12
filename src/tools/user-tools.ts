import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CodingApiClient } from '../api-client.js';
import type { ComprehensiveApiClient } from '../core/comprehensive-api-client.js';
import { UserInfo } from '../types.js';

/**
 * 用户相关的 MCP 工具
 */
export class UserTools {
  constructor(private apiClient: CodingApiClient | ComprehensiveApiClient) {}

  /**
   * 获取所有用户相关的工具定义
   */
  getTools(): Tool[] {
    return [
      {
        name: 'coding_get_current_user',
        description: '获取当前用户信息',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'coding_get_user_profile',
        description: '获取指定用户的详细信息',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'number',
              description: '用户 ID',
            },
            globalKey: {
              type: 'string',
              description: '用户全局标识符（可选，与 userId 二选一）',
            },
          },
          anyOf: [
            { required: ['userId'] },
            { required: ['globalKey'] },
          ],
        },
      },
      {
        name: 'coding_update_user_profile',
        description: '更新当前用户信息',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: '用户名称',
            },
            email: {
              type: 'string',
              description: '邮箱地址',
            },
            phone: {
              type: 'string',
              description: '手机号码',
            },
            avatar: {
              type: 'string',
              description: '头像 URL',
            },
          },
          required: [],
        },
      },
      {
        name: 'coding_get_user_notifications',
        description: '获取用户通知列表',
        inputSchema: {
          type: 'object',
          properties: {
            pageNumber: {
              type: 'number',
              description: '页码，默认为 1',
              default: 1,
            },
            pageSize: {
              type: 'number',
              description: '每页数量，默认为 20',
              default: 20,
            },
            status: {
              type: 'string',
              description: '通知状态（READ, UNREAD）',
              enum: ['READ', 'UNREAD'],
            },
          },
          required: [],
        },
      },
    ];
  }

  /**
   * 执行用户工具
   */
  async executeTool(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case 'coding_get_current_user':
        return this.getCurrentUser();
      
      case 'coding_get_user_profile':
        return this.getUserProfile(args.userId, args.globalKey);
      
      case 'coding_update_user_profile':
        return this.updateUserProfile(args);
      
      case 'coding_get_user_notifications':
        return this.getUserNotifications(args);
      
      default:
        throw new Error(`未知的用户工具: ${toolName}`);
    }
  }

  /**
   * 获取当前用户信息
   */
  private async getCurrentUser(): Promise<UserInfo> {
    const response = await this.apiClient.request<{ User: UserInfo }>('DescribeCodingCurrentUser');
    return response.User;
  }

  /**
   * 获取用户详细信息
   */
  private async getUserProfile(userId?: number, globalKey?: string): Promise<UserInfo> {
    const params: any = {};
    
    if (userId) {
      params.UserId = userId;
    } else if (globalKey) {
      params.GlobalKey = globalKey;
    } else {
      throw new Error('必须提供 userId 或 globalKey 参数');
    }

    const response = await this.apiClient.request<{ User: UserInfo }>('DescribeCodingUser', params);
    return response.User;
  }

  /**
   * 更新用户信息
   */
  private async updateUserProfile(updateData: Partial<UserInfo>): Promise<UserInfo> {
    const params: any = {};
    
    if (updateData.Name) params.Name = updateData.Name;
    if (updateData.Email) params.Email = updateData.Email;
    if (updateData.Phone) params.Phone = updateData.Phone;
    if (updateData.Avatar) params.Avatar = updateData.Avatar;

    const response = await this.apiClient.request<{ User: UserInfo }>('ModifyCodingCurrentUser', params);
    return response.User;
  }

  /**
   * 获取用户通知
   */
  private async getUserNotifications(args: {
    pageNumber?: number;
    pageSize?: number;
    status?: string;
  }) {
    const params: any = {
      PageNumber: args.pageNumber || 1,
      PageSize: args.pageSize || 20,
    };

    if (args.status) {
      params.Status = args.status;
    }

    const response = await this.apiClient.request<{
      TotalCount: number;
      PageNumber: number;
      PageSize: number;
      Notifications: Array<{
        Id: number;
        Title: string;
        Content: string;
        Status: string;
        CreatedAt: number;
        UpdatedAt: number;
      }>;
    }>('DescribeCodingUserNotifications', params);

    return {
      totalCount: response.TotalCount,
      pageNumber: response.PageNumber,
      pageSize: response.PageSize,
      notifications: response.Notifications,
    };
  }
}
