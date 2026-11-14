# NavSphere Peiqi 导航

基于 NavSphere 二次开发的自托管导航站，使用 Cloudflare KV 存储数据，后台修改数据实时生效，无需重新部署。

## 🚀 快速部署

点击按钮一键部署到 Cloudflare Pages：

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/RunWang925/NavSphere-Peqi)

<details>
<summary>手动部署步骤（点不开一键部署时用这个）</summary>

1. Fork 本仓库到你的 GitHub
2. 进入 [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → 创建应用程序 → **Pages** → 连接到 Git → 选这个仓库
3. 构建命令填 `npx @cloudflare/next-on-pages@1`，输出目录填 `.vercel/output/static`
4. 部署完成后，在项目设置中配置 KV 和环境变量

</details>

部署后需要配置以下内容：

**绑定 KV 命名空间**
- 变量名：`NAV_KV`
- 作用：存储导航数据和站点配置，后台修改的数据都存在这里
- 不绑定：只能用默认数据做演示，无法在后台修改

**设置环境变量（都是可选的）**
- `ADMIN_PASSWORD`：管理员密码，不设默认 `admin`，登录后可在后台修改
- `SESSION_SECRET`：会话密钥，不设也能用（有默认值），想更安全可以自己填一串随机字符

> 详细步骤见 [DEPLOY.md](./DEPLOY.md)

## ✨ 和原项目的区别

原项目数据存在 GitHub 仓库文件里，改网址要重新部署；后台需要 GitHub 授权登录，比较麻烦。本项目针对这些痛点做了改进：

| | 原项目 | 本项目 |
|---|---|---|
| 数据存储 | GitHub 仓库文件 | Cloudflare KV |
| 改数据要重新部署？ | 要，等几分钟 | **不要，秒级生效** |
| 登录方式 | GitHub OAuth 授权 | 密码登录 |
| fork 能直接部署？ | 不能 | **能** |

适合经常修改或新增网址链接的人。

## 🙏 致谢

本项目基于原作者 [tianyaxiang](https://github.com/tianyaxiang) 的 [NavSphere](https://github.com/tianyaxiang/NavSphere) 项目修改而来，感谢原作者的开源贡献！

> 觉得有帮助的话，欢迎去 [原作者仓库](https://github.com/tianyaxiang/NavSphere) 点个 ⭐ Star

## 📄 License

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

本项目基于 [NavSphere](https://github.com/tianyaxiang/NavSphere) 二次开发，遵循 MIT 开源协议。
