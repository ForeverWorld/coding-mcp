import { z } from 'zod';

// 配置模式定义
export const ConfigSchema = z.object({
  apiBaseUrl: z.string().url().default('https://e.coding.net/open-api'),
  personalAccessToken: z.string().min(1, '个人访问令牌不能为空'),
  timeout: z.number().positive().default(30000),
  retryAttempts: z.number().min(0).default(3),
});

export type Config = z.infer<typeof ConfigSchema>;

// API 响应基础结构
export interface CodingApiResponse<T = any> {
  Response: {
    Error?: {
      Code: string;
      Message: string;
    };
    RequestId: string;
  } & T;
}

// 用户信息结构
export interface UserInfo {
  Id: number;
  GlobalKey: string;
  Name: string;
  NamePinyin: string;
  Email: string;
  Phone: string;
  Avatar: string;
  Status: number;
  TeamGlobalKey: string;
  TeamName: string;
  CreatedAt: number;
  UpdatedAt: number;
}

// 项目信息结构
export interface ProjectInfo {
  Id: number;
  Name: string;
  DisplayName: string;
  Description: string;
  Icon: string;
  CreatedAt: number;
  UpdatedAt: number;
  Type: string;
  Status: string;
  Visibility: number;
}

// 团队信息结构
export interface TeamInfo {
  Id: number;
  GlobalKey: string;
  Name: string;
  DisplayName: string;
  Avatar: string;
  Description: string;
  Location: string;
  Website: string;
  CreatedAt: number;
  UpdatedAt: number;
}

// API 请求参数基础结构
export interface CodingApiRequest {
  Action: string;
  [key: string]: any;
}

// 工具错误类型
export class CodingApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public requestId?: string
  ) {
    super(message);
    this.name = 'CodingApiError';
  }
}
