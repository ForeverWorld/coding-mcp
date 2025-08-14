# 🚀 coding-mcp

一个覆盖 **413+ CODING API** 接口的简洁易用 Model Context Protocol (MCP) 服务器，提供与 CODING DevOps 平台的全面集成。

> **特别感谢** [CODING](https://coding.net/) 平台提供的强大 DevOps 服务！CODING 是腾讯云旗下的一站式软件研发管理平台，为研发团队提供项目协同、代码托管、持续集成、制品库等全链路工具。本项目通过 MCP 协议让 AI 助手也能轻松使用这些专业服务。

## 🚀 **快速开始**

```bash
# 1. 确认你的 CODING 团队地址
# 例如：https://your-team.coding.net (私有部署)
# 或者：https://e.coding.net (公有云)

# 2. 获取 CODING 个人访问令牌
# 登录 CODING → 个人设置 → 访问令牌 → 新建令牌

# 3. 配置 Claude Desktop
# 编辑配置文件，添加 coding-mcp 服务器配置
# 无需手动安装，npx 会自动下载最新版本
```

**⚠️ 重要：必须正确配置 API 基础地址**

根据你的 CODING 部署类型选择对应的配置：

### 📊 **私有部署团队**（推荐）
```json
{
  "mcpServers": {
    "coding-mcp": {
      "command": "npx",
      "args": ["-y", "coding-mcp@latest"],
      "env": {
        "CODING_API_BASE_URL": "https://your-team.coding.net/open-api",
        "CODING_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

### ☁️ **公有云部署**
```json
{
  "mcpServers": {
    "coding-mcp": {
      "command": "npx",
      "args": ["-y", "coding-mcp@latest"],
      "env": {
        "CODING_API_BASE_URL": "https://e.coding.net/open-api",
        "CODING_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

## 📊 项目概览

### 🎯 功能特性

- ✅ **完整覆盖**：支持 CODING 平台全部 413+ API 接口
- 🔐 **安全认证**：基于个人访问令牌的安全认证  
- ⚡ **高性能**：智能缓存、并发控制、自动重试
- 📊 **监控完善**：详细的调用统计和健康检查
- 🔄 **模块化**：12 个功能模块，可独立启用/禁用
- 🛠️ **易于使用**：友好的 AI Agent 自然语言交互

### 📋 支持的功能模块

| 模块 | API 数量 | 主要功能 |
|------|----------|----------|
| **CD/DevOps** | 50+ | 主机组、云账号、流水线、应用部署 |
| **Git 管理** | 80+ | 仓库、提交、分支、文件、标签 |
| **CI/Build** | 40+ | 构建任务、构建记录、日志、制品 |
| **Issue 管理** | 20+ | 事项、缺陷、需求、评论 |
| **用户管理** | 15+ | 用户信息、通知、权限 |
| **项目管理** | 25+ | 项目、成员、配置 |
| **团队管理** | 15+ | 团队、成员、邀请 |
| **制品库** | 30+ | 制品仓库、包管理、版本控制 |
| **Wiki 文档** | 10+ | Wiki 页面、文档管理 |
| **Service Hook** | 15+ | 服务钩子、事件通知 |
| **合并请求** | 25+ | MR 管理、代码审查 |
| **监控统计** | 20+ | 指标、健康检查、分析 |

## 🛠️ 安装和配置

### 1. 无需手动安装

通过 `npx` 使用，无需手动安装，始终使用最新版本。

### 2. 获取个人访问令牌

1. 登录 CODING 平台
2. 进入【个人账户设置】>【访问令牌】
3. 点击【新建访问令牌】
4. 勾选以下权限：
   - ✅ `user:profile:ro` - 用户信息只读
   - ✅ `project:profile:rw` - 项目信息读写
   - ✅ `team:profile:ro` - 团队信息只读
   - ✅ `team:member:rw` - 团队成员管理
   - ✅ `project_issue_rw` - 项目协同
   - ✅ `depot_read` - 读取代码仓库
   - ✅ `depot_write` - 推送至代码仓库
5. 生成并复制令牌

### 2. 配置 MCP 客户端

#### Claude Desktop 配置

**配置文件位置：**
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**⚠️ 重要：API 基础地址配置**

`CODING_API_BASE_URL` 是**必需配置项**，必须根据你的团队设置正确的地址：

- **私有部署团队**：`https://your-team.coding.net/open-api`
- **公有云团队**：`https://e.coding.net/open-api`

### **私有部署配置示例**：

```json
{
  "mcpServers": {
    "coding-mcp": {
      "command": "npx",
      "args": ["-y", "coding-mcp@latest"],
      "env": {
        "CODING_API_BASE_URL": "https://your-team.coding.net/open-api",
        "CODING_PERSONAL_ACCESS_TOKEN": "your_personal_access_token_here"
      }
    }
  }
}
```

### **高级配置（推荐）**：

```json
{
  "mcpServers": {
    "coding-mcp": {
      "command": "npx",
      "args": ["-y", "coding-mcp@latest"],
      "env": {
        "CODING_API_BASE_URL": "https://your-team.coding.net/open-api",
        "CODING_PERSONAL_ACCESS_TOKEN": "your_personal_access_token_here",
        "CODING_ENABLE_CACHE": "true",
        "CODING_MAX_CONCURRENT_REQUESTS": "15",
        "CODING_API_TIMEOUT": "30000",
        "CODING_API_RETRY_ATTEMPTS": "3"
      }
    }
  }
}
```

#### 其他 MCP 客户端配置

```json
{
  "mcpServers": {
    "coding-mcp": {
      "command": "npx",
      "args": ["-y", "coding-mcp@latest"],
      "env": {
        "CODING_API_BASE_URL": "https://your-team.coding.net/open-api",
        "CODING_PERSONAL_ACCESS_TOKEN": "your_personal_access_token_here"
      }
    }
  }
}
```

### 🔍 **如何确认你的 API 基础地址**

1. **查看你的 CODING 登录地址**：
   - 如果是 `https://your-team.coding.net`，则 API 地址为 `https://your-team.coding.net/open-api`
   - 如果是 `https://e.coding.net`，则 API 地址为 `https://e.coding.net/open-api`

2. **测试 API 连接**：
   ```bash
   curl "https://your-team.coding.net/open-api/?Action=DescribeTeam" \
     -H "Authorization: token your_token_here"
   ```

3. **常见配置错误**：
   - ❌ 忘记配置 `CODING_API_BASE_URL`
   - ❌ 使用错误的团队地址（如用公有云地址访问私有部署）
   - ❌ API 地址缺少 `/open-api` 后缀

### 3. 使用说明

配置完成后，重启 Claude Desktop，服务会自动通过 npx 启动。

启动成功后会显示：
```
🚀 CODING API MCP 服务器已启动 (v0.1.0)
✅ 配置状态: 已配置
📊 支持 413+ API 接口，覆盖完整 DevOps 流程
🎉 服务器就绪，可以开始使用所有功能！
```

## 💡 使用示例

### 🐛 缺陷管理

```
👤 帮我看下我名下有几个缺陷

🤖 我来为你查询缺陷情况...

📊 **你的缺陷汇总**：
- **总计**：12 个缺陷
- **按状态分布**：待处理 3个，处理中 5个，测试中 2个，已完成 2个
- **按优先级分布**：高优先级 2个，中优先级 7个，低优先级 3个

**高优先级缺陷**：
1. DEFECT-2024 - 支付系统异常 (处理中)
2. DEFECT-2023 - 用户登录失败 (待处理)

需要我帮你处理这些高优先级缺陷吗？
```

### 🏗️ CI/CD 管理

```
👤 我想查看项目的构建情况，然后触发一次新的构建

🤖 📈 **构建任务概览**：
- **活跃任务** (3个)：前端构建、后端API、移动端打包
- **最近构建记录**：
  - ✅ Build #245 - 前端构建 - 成功 (耗时 3分钟)
  - ❌ Build #244 - 移动端打包 - 失败 (耗时 8分钟)

🚀 **新构建已触发**：
- 构建 ID: #246
- 任务: 前端构建
- 分支: master
- 状态: 运行中
```

### 📦 Git 仓库管理

```
👤 我需要在主仓库创建一个新分支，然后添加一些文件

🤖 📊 **仓库信息**：
- 仓库名: web-frontend
- 默认分支: master
- 总提交数: 1,247

✅ **新分支创建成功**：
- 分支名: feature/user-dashboard
- 基于: master (latest commit)

现在你可以开始添加文件了，请告诉我具体需要添加的文件内容。
```

### 🏢 团队项目管理

```
👤 帮我创建一个新项目，然后邀请几个团队成员

🤖 ✅ **项目创建成功**：
- 项目名: mobile-app-v2
- 显示名: 移动应用 2.0
- 项目 ID: 156
- 可见性: 私有

请提供要邀请的成员邮箱地址，我将为他们发送邀请。
```

## 🔧 配置选项

### 环境变量

| 变量名 | 说明 | 默认值 | 是否必需 |
|--------|------|--------|----------|
| `CODING_PERSONAL_ACCESS_TOKEN` | 个人访问令牌 | - | ✅ **必需** |
| `CODING_API_BASE_URL` | API 基础地址<br/>私有部署：`https://your-team.coding.net/open-api`<br/>公有云：`https://e.coding.net/open-api` | `https://e.coding.net/open-api` | ✅ **必需** |
| `CODING_ENABLE_CACHE` | 是否启用缓存 | `false` | 可选 |
| `CODING_MAX_CONCURRENT_REQUESTS` | 最大并发请求数 | `10` | 可选 |
| `CODING_API_TIMEOUT` | 请求超时时间（毫秒） | `30000` | 可选 |
| `CODING_API_RETRY_ATTEMPTS` | 重试次数 | `3` | 可选 |

**⚠️ 重要提醒**：
- `CODING_API_BASE_URL` 必须与你的团队地址匹配
- 私有部署团队不能使用公有云 API 地址，反之亦然
- 配置错误会导致所有 API 调用失败

### 高性能配置示例

```json
{
  "env": {
    "CODING_API_BASE_URL": "https://your-team.coding.net/open-api",
    "CODING_PERSONAL_ACCESS_TOKEN": "your_token_here",
    "CODING_ENABLE_CACHE": "true",
    "CODING_MAX_CONCURRENT_REQUESTS": "20",
    "CODING_API_TIMEOUT": "45000",
    "CODING_API_RETRY_ATTEMPTS": "5"
  }
}
```

## 🎯 完整工具列表

### 🔧 核心管理工具 (7个)
- `coding_configure` - 配置服务
- `coding_health_check` - 健康检查
- `coding_get_metrics` - 获取指标
- `coding_reset_metrics` - 重置指标
- `coding_clear_cache` - 清理缓存
- `coding_get_module_status` - 模块状态
- `coding_toggle_module` - 切换模块

### 🏗️ CD/DevOps 工具 (50+个)
- **主机组管理**: `coding_cd_*_host_server_group*`
- **云账号管理**: `coding_cd_*_cloud_account*`
- **流水线管理**: `coding_cd_*_pipeline*`
- **应用管理**: `coding_cd_*_application*`
- **任务管理**: `coding_cd_*_task*`

### 📦 Git 管理工具 (80+个)
- **仓库管理**: `coding_git_*_repository*`
- **提交管理**: `coding_git_*_commit*`
- **分支管理**: `coding_git_*_branch*`
- **文件管理**: `coding_git_*_file*`
- **标签管理**: `coding_git_*_tag*`

### 🏗️ CI/Build 工具 (40+个)
- **任务管理**: `coding_ci_*_job*`
- **构建管理**: `coding_ci_*_build*`
- **日志管理**: `coding_ci_*_log*`
- **统计分析**: `coding_ci_*_statistics*`

### 🐛 Issue 管理工具 (20+个)
- `coding_list_my_issues` - 获取我负责的事项列表
- `coding_get_defects_summary` - 获取我的缺陷汇总统计
- `coding_get_issue_detail` - 获取事项详细信息
- `coding_create_issue` - 创建新事项
- `coding_update_issue_status` - 更新事项状态

### 👤 用户团队项目工具 (55+个)
- **用户管理**: `coding_*_user*`
- **团队管理**: `coding_*_team*`
- **项目管理**: `coding_*_project*`

## 🚨 故障排除

### 常见问题

**Q: 提示 "配置状态: 待配置"**
- **解决**: 检查 `CODING_PERSONAL_ACCESS_TOKEN` 环境变量是否正确设置

**Q: 提示 "环境变量配置失败"**
- **解决**: 重新生成访问令牌，确保权限充足

**Q: API 调用失败 / 无法连接**
- **解决步骤**：
  1. 确认 `CODING_API_BASE_URL` 配置正确
  2. 私有部署使用：`https://your-team.coding.net/open-api`
  3. 公有云使用：`https://e.coding.net/open-api`
  4. 检查网络连接，验证令牌有效性

**Q: 私有部署团队无法连接**
- **常见错误**: 使用了公有云 API 地址 `https://e.coding.net/open-api`
- **正确配置**: 必须使用 `https://your-team.coding.net/open-api`
- **验证方法**: 
  ```bash
  curl "https://your-team.coding.net/open-api/?Action=DescribeTeam" \
    -H "Authorization: token your_token"
  ```

**Q: 公有云团队无法连接**
- **常见错误**: 使用了私有部署格式的 API 地址
- **正确配置**: 使用 `https://e.coding.net/open-api`

### 调试技巧

1. **查看启动日志**：注意服务器启动时的状态信息
2. **健康检查**：使用 AI Agent 执行 "检查 CODING API 连接状态"
3. **逐步验证**：从简单的用户信息查询开始测试
4. **检查权限**：确保访问令牌包含所需权限

## 🏗️ 项目架构

### 📁 项目结构

```
coding-mcp/
├── src/
│   ├── comprehensive-mcp-server.ts     # 主服务器入口
│   ├── core/
│   │   ├── comprehensive-config.ts     # 增强配置管理器
│   │   └── comprehensive-api-client.ts # 高性能API客户端
│   ├── types/
│   │   └── comprehensive-types.ts      # 完整类型定义
│   ├── modules/
│   │   ├── cd-devops-tools.ts         # CD/DevOps模块 (50+ APIs)
│   │   ├── git-management-tools.ts    # Git管理模块 (80+ APIs)
│   │   └── ci-build-tools.ts          # CI/Build模块 (40+ APIs)
│   └── tools/
│       ├── issue-tools.ts             # Issue管理 (20+ APIs)
│       ├── user-tools.ts              # 用户管理 (15+ APIs)
│       ├── project-tools.ts           # 项目管理 (25+ APIs)
│       └── team-tools.ts              # 团队管理 (15+ APIs)
├── claude-desktop-config.json         # Claude Desktop 配置示例
├── package.json                       # 项目配置 (v2.0.0)
└── README.md                          # 本文档
```

### 🎨 架构特点

- **分层设计**：清晰的职责分离
- **模块化**：12 个功能模块，可独立控制
- **高性能**：缓存、并发控制、重试机制
- **类型安全**：完整的 TypeScript 类型系统
- **监控完善**：详细的指标收集和健康检查

## 📊 性能特性

### ⚡ 性能优化
- **智能缓存**：只读操作自动缓存，TTL 可配置
- **并发控制**：最大并发数可配置，防止API限流
- **重试策略**：指数退避算法，智能错误识别

### 📈 监控指标
- **调用统计**：每个模块的请求/成功/错误计数
- **响应时间**：平均响应时间监控
- **健康检查**：实时状态监控和模块可用性检测

## 🎉 使用场景

### 开发团队
- "帮我查看今天的构建情况"
- "创建一个新的功能分支"
- "分配这个缺陷给张三处理"

### 项目经理
- "生成本周的项目进度报告"
- "查看团队成员的工作负载"
- "创建新的里程碑计划"

### DevOps 工程师
- "部署应用到生产环境"
- "查看流水线执行状态"
- "配置新的构建任务"

### 质量保证
- "查看所有待测试的事项"
- "创建测试用例和缺陷报告"
- "分析缺陷趋势和质量指标"

## 🔮 版本信息

- **当前版本**: v0.1.0
- **API 覆盖**: 413+ 接口
- **模块数量**: 12 个
- **MCP 工具**: 200+ 个
- **npm 包**: [coding-mcp@0.1.0](https://www.npmjs.com/package/coding-mcp)

## 📄 许可证

Apache-2.0 License

## 🙏 特别鸣谢

**感谢 [CODING](https://coding.net/) 提供的优秀 DevOps 平台！**

CODING 是腾讯云旗下的一站式软件研发管理平台，提供：
- 🏢 **项目协同**：高效的团队协作和需求管理
- 📦 **代码托管**：安全可靠的 Git/SVN 代码仓库
- 🔄 **持续集成**：自动化测试与构建流水线
- 📋 **制品库**：完善的构建产物管理
- ☁️ **云原生**：现代化的开发和部署工具

本项目通过 MCP 协议将这些强大功能带给 AI 助手，让开发更简单！

## 🆘 支持

如有问题：
1. 查看启动日志和错误信息
2. 验证访问令牌权限配置
3. 检查网络连接状态
4. 提交 Issue 获得帮助

---

🚀 **立即开始使用：**
```bash
# 无需手动安装，直接配置 Claude Desktop
# 在配置文件中添加以下配置：
```

```json
{
  "mcpServers": {
    "coding-mcp": {
      "command": "npx",
      "args": ["-y", "coding-mcp@latest"],
      "env": {
        "CODING_API_BASE_URL": "https://your-team.coding.net/open-api",
        "CODING_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

## ✅ **配置验证清单**

在开始使用前，请确认以下配置：

1. **✅ 确认团队类型**
   - [ ] 私有部署：`https://your-team.coding.net/open-api`
   - [ ] 公有云：`https://e.coding.net/open-api`

2. **✅ 验证 API 连接**
   ```bash
   curl "https://your-team.coding.net/open-api/?Action=DescribeTeam" \
     -H "Authorization: token your_token_here"
   ```

3. **✅ 检查令牌权限**
   - [ ] `collaboration:issue:rw` - 事项管理
   - [ ] `project:profile:rw` - 项目信息
   - [ ] `team:profile:ro` - 团队信息
   - [ ] `vcs:repository:rw` - 代码仓库

4. **✅ 测试 MCP 服务器**
   ```
   "你好，帮我检查一下 CODING API 连接状态"
   ```

## 📦 **npm 包信息**

- **包名**: `coding-mcp`
- **当前版本**: `v0.1.0`
- **使用方式**: `npx -y coding-mcp@latest`（无需手动安装）
- **GitHub**: [https://github.com/ForeverWorld/coding-mcp](https://github.com/ForeverWorld/coding-mcp)
- **npm 页面**: [https://www.npmjs.com/package/coding-mcp](https://www.npmjs.com/package/coding-mcp)

**现在你可以通过自然语言与 AI Agent 交互，使用 CODING 平台的全部功能！** ✨