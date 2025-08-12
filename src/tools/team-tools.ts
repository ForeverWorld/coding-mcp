import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CodingApiClient } from '../api-client.js';
import type { ComprehensiveApiClient } from '../core/comprehensive-api-client.js';
import { TeamInfo } from '../types.js';

/**
 * 团队相关的 MCP 工具
 */
export class TeamTools {
  constructor(private apiClient: CodingApiClient | ComprehensiveApiClient) {}

  /**
   * 获取所有团队相关的工具定义
   */
  getTools(): Tool[] {
    return [
      {
        name: 'coding_get_current_team',
        description: '获取当前用户所在的团队信息',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'coding_get_team',
        description: '获取指定团队的详细信息',
        inputSchema: {
          type: 'object',
          properties: {
            teamGlobalKey: {
              type: 'string',
              description: '团队全局标识符',
            },
          },
          required: ['teamGlobalKey'],
        },
      },
      {
        name: 'coding_list_team_members',
        description: '获取团队成员列表',
        inputSchema: {
          type: 'object',
          properties: {
            teamGlobalKey: {
              type: 'string',
              description: '团队全局标识符',
            },
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
            keyword: {
              type: 'string',
              description: '搜索关键词（可选）',
            },
          },
          required: ['teamGlobalKey'],
        },
      },
      {
        name: 'coding_invite_team_member',
        description: '邀请用户加入团队',
        inputSchema: {
          type: 'object',
          properties: {
            teamGlobalKey: {
              type: 'string',
              description: '团队全局标识符',
            },
            email: {
              type: 'string',
              description: '被邀请用户的邮箱',
            },
            role: {
              type: 'string',
              description: '用户角色（ADMIN, MEMBER）',
              enum: ['ADMIN', 'MEMBER'],
              default: 'MEMBER',
            },
          },
          required: ['teamGlobalKey', 'email'],
        },
      },
      {
        name: 'coding_remove_team_member',
        description: '移除团队成员',
        inputSchema: {
          type: 'object',
          properties: {
            teamGlobalKey: {
              type: 'string',
              description: '团队全局标识符',
            },
            userId: {
              type: 'number',
              description: '用户 ID',
            },
          },
          required: ['teamGlobalKey', 'userId'],
        },
      },
    ];
  }

  /**
   * 执行团队工具
   */
  async executeTool(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case 'coding_get_current_team':
        return this.getCurrentTeam();
      
      case 'coding_get_team':
        return this.getTeam(args.teamGlobalKey);
      
      case 'coding_list_team_members':
        return this.listTeamMembers(args);
      
      case 'coding_invite_team_member':
        return this.inviteTeamMember(args);
      
      case 'coding_remove_team_member':
        return this.removeTeamMember(args);
      
      default:
        throw new Error(`未知的团队工具: ${toolName}`);
    }
  }

  /**
   * 获取当前团队信息
   */
  private async getCurrentTeam(): Promise<TeamInfo> {
    const response = await this.apiClient.request<{ Team: TeamInfo }>('DescribeCodingCurrentTeam');
    return response.Team;
  }

  /**
   * 获取团队详细信息
   */
  private async getTeam(teamGlobalKey: string): Promise<TeamInfo> {
    const params = {
      TeamGlobalKey: teamGlobalKey,
    };

    const response = await this.apiClient.request<{ Team: TeamInfo }>('DescribeCodingTeam', params);
    return response.Team;
  }

  /**
   * 获取团队成员列表
   */
  private async listTeamMembers(args: {
    teamGlobalKey: string;
    pageNumber?: number;
    pageSize?: number;
    keyword?: string;
  }) {
    const params: any = {
      TeamGlobalKey: args.teamGlobalKey,
      PageNumber: args.pageNumber || 1,
      PageSize: args.pageSize || 20,
    };

    if (args.keyword) {
      params.Keyword = args.keyword;
    }

    const response = await this.apiClient.request<{
      TotalCount: number;
      PageNumber: number;
      PageSize: number;
      Members: Array<{
        UserId: number;
        UserGlobalKey: string;
        UserName: string;
        UserAvatar: string;
        UserEmail: string;
        Role: string;
        Status: string;
        JoinedAt: number;
      }>;
    }>('DescribeCodingTeamMembers', params);

    return {
      totalCount: response.TotalCount,
      pageNumber: response.PageNumber,
      pageSize: response.PageSize,
      members: response.Members,
    };
  }

  /**
   * 邀请团队成员
   */
  private async inviteTeamMember(args: {
    teamGlobalKey: string;
    email: string;
    role?: string;
  }) {
    const params = {
      TeamGlobalKey: args.teamGlobalKey,
      Email: args.email,
      Role: args.role || 'MEMBER',
    };

    const response = await this.apiClient.request<{
      Success: boolean;
      InvitationId: number;
    }>('CreateCodingTeamMemberInvitation', params);

    return {
      success: response.Success,
      invitationId: response.InvitationId,
      message: '邀请已发送',
    };
  }

  /**
   * 移除团队成员
   */
  private async removeTeamMember(args: {
    teamGlobalKey: string;
    userId: number;
  }) {
    const params = {
      TeamGlobalKey: args.teamGlobalKey,
      UserId: args.userId,
    };

    await this.apiClient.request('DeleteCodingTeamMember', params);

    return {
      success: true,
      message: '成员已移除',
    };
  }
}
