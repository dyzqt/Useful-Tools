# Useful-Tools — 实用工具聚合站

校园实用工具一站式平台，包含天气查询、备忘录、倒计时、随机工具、密码生成、单位换算等模块。

## 项目框架

```
Useful-Tools/
├── backend/                    # FastAPI 后端
│   ├── app/
│   │   ├── main.py             # 入口，CORS，路由注册
│   │   ├── config.py           # 数据库路径配置
│   │   ├── database.py         # SQLite 初始化 + 连接
│   │   ├── utils.py            # UTC 时间、行转字典
│   │   └── routers/
│   │       ├── memos.py        # 备忘录 CRUD
│   │       ├── countdowns.py   # 倒计时 CRUD
│   │       ├── tools.py        # 随机数/密码/单位换算
│   │       └── weather.py      # 天气查询 (Open-Meteo)
│   ├── tests/                  # pytest 自动化测试
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
│
└── web/                        # 前端 SPA
    ├── index.html              # 入口 (hash 路由)
    ├── css/
    │   └── style.css           # 全局样式
    └── js/
        ├── app.js              # 路由控制器 + 首页渲染
        ├── api.js              # 后端 API 封装
        ├── utils.js            # toast/日期/标签工具函数
        ├── weather.js          # 天气查询模块
        ├── memos.js            # 备忘录模块
        ├── countdowns.js       # 倒计时模块
        ├── random.js           # 随机数/抽签/骰子模块
        ├── password.js         # 密码生成模块
        └── convert.js          # 单位换算模块
```

## 启动方式

只需要启动后端服务，FastAPI 会在同一个 `8000` 端口同时提供前端页面和后端 API。

```powershell
# Windows PowerShell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

启动后访问：
- 前端首页：http://127.0.0.1:8000/
- API 文档：http://127.0.0.1:8000/docs
- 健康检查：http://127.0.0.1:8000/health

### 运行测试

```bash
cd backend
python -m pytest -q
```

> 前端已使用同源 API 请求，不需要单独启动 `web` 静态服务器。

## 后端 API 概览

| 模块 | 方法 | 路径 |
|---|---|---|
| 系统 | GET | `/health` |
| 天气 | GET | `/api/weather?city=Beijing` |
| 备忘录 | POST/GET/PUT/DELETE | `/api/memos` |
| 倒计时 | POST/GET/PUT/DELETE | `/api/countdowns` |
| 随机数 | POST | `/api/tools/random/number` |
| 抽签 | POST | `/api/tools/random/pick` |
| 骰子 | POST | `/api/tools/random/dice` |
| 密码 | POST | `/api/tools/password` |
| 换算 | POST | `/api/tools/convert` |

## 前端 Skills（Claude Code 辅助）

| Skill | 描述 | 适用场景 |
|---|---|---|
| agentation | 可视化反馈工具栏 | 在 React 项目中添加元素标注工具 |
| frontend-code-review | 前端代码全面审查 | PR 审查、代码质量检查、性能审计 |
| skill-creator | Skill 创建指南 | 创建新的 Claude Skills |
| ui-ux-pro-max | UI/UX 设计智能助手 | UI 设计、样式选择、配色、字体搭配 |

## 使用到的 MCP

- Playwright
- api-http
