fork自[https://github.com/qier222/YesPlayMusic](https://github.com/qier222/YesPlayMusic)。

在其基础上增加了查看评论、发布评论、回复评论、点赞评论的功能。

## ⚙️ 部署至 Vercel

除了下载安装包使用，你还可以将本项目部署到 Vercel 或你的服务器上。下面是部署到 Vercel 的方法。

本项目的 Demo (https://player.lxqnsys.com/) 就是部署在 Vercel 上的网站。

[![Powered by Vercel](https://www.datocms-assets.com/31049/1618983297-powered-by-vercel.svg)](https://vercel.com/?utm_source=ohmusic&utm_campaign=oss)

1. 部署网易云 API，详情参见 [Binaryify/NeteaseCloudMusicApi](https://neteasecloudmusicapi.vercel.app/#/?id=%e5%ae%89%e8%a3%85)
   。你也可以将 API 部署到 Vercel。

2. 点击本仓库右上角的 Fork，复制本仓库到你的 GitHub 账号。

3. 点击仓库的 Add File，选择 Create new file，输入 `vercel.json`，将下面的内容复制粘贴到文件中，并将 `https://your-netease-api.example.com` 替换为你刚刚部署的网易云 API 地址：

```json
{
  "rewrites": [
    {
      "source": "/api/:match*",
      "destination": "https://your-netease-api.example.com/:match*"
    }
  ]
}
```

4. 打开 [Vercel.com](https://vercel.com)，使用 GitHub 登录。

5. 点击 Import Git Repository 并选择你刚刚复制的仓库并点击 Import。

6. 点击 PERSONAL ACCOUNT 旁边的 Select。

7. 点击 Environment Variables，填写 Name 为 `VUE_APP_NETEASE_API_URL`，Value 为 `/api`，点击 Add。最后点击底部的 Deploy 就可以部署到
   Vercel 了。

## ⚙️ 部署到自己的服务器

除了部署到 Vercel，你还可以部署到自己的服务器上

1. 部署网易云 API，详情参见 [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)
2. 克隆本仓库

```sh
git clone --recursive https://github.com/wanglin2/YesPlayMusic.git
```

3. 安装依赖

```sh
yarn install

```

4. （可选）使用 Nginx 反向代理 API，将 API 路径映射为 `/api`，如果 API 和网页不在同一个域名下的话（跨域），会有一些 bug。

5. 复制 `/.env.example` 文件为 `/.env`，修改里面 `VUE_APP_NETEASE_API_URL` 的值为网易云 API 地址。本地开发的话可以填写 API 地址为 `http://localhost:3000`，YesPlayMusic 地址为 `http://localhost:8080`。如果你使用了反向代理 API，可以填写 API 地址为 `/api`。

```
VUE_APP_NETEASE_API_URL=http://localhost:3000
```

6. 编译打包

```sh
yarn run build
```

7. 将 `/dist` 目录下的文件上传到你的 Web 服务器

## ⚙️ Docker 部署

1. 构建 Docker Image

```sh
docker build -t yesplaymusic .
```

2. 启动 Docker Container

```sh
docker run -d --name YesPlayMusic -p 80:80 yesplaymusic
```

3. Docker Compose 启动

```sh
docker-compose up -d
```

YesPlayMusic 地址为 `http://localhost`

## 👷‍♂️ 打包客户端

如果在 Release 页面没有找到适合你的设备的安装包的话，你可以根据下面的步骤来打包自己的客户端。

1. 打包 Electron 需要用到 Node.js 和 Yarn。可前往 [Node.js 官网](https://nodejs.org/zh-cn/) 下载安装包。安装 Node.js
   后可在终端里执行 `npm install -g yarn` 来安装 Yarn。

2. 使用 `git clone --recursive https://github.com/wanglin2/YesPlayMusic.git` 克隆本仓库到本地。

3. 使用 `yarn install` 安装项目依赖。

4. 复制 `/.env.example` 文件为 `/.env` 。

5. 选择下列表格的命令来打包适合的你的安装包，打包出来的文件在 `/dist_electron` 目录下。了解更多信息可访问 [electron-builder 文档](https://www.electron.build/cli)

| 命令                                       | 说明                      |
| ------------------------------------------ | ------------------------- |
| `yarn run electron:build`  | 打包所有平台             |
| `yarn electron:build --windows nsis:ia32`  | Windows 32 位             |
| `yarn electron:build --windows nsis:arm64` | Windows ARM               |
| `yarn electron:build --linux deb:armv7l`   | Debian armv7l（树莓派等） |
| `yarn electron:build --macos dir:arm64`    | macOS ARM                 |

## :computer: 配置开发环境

本项目由 [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) 提供 API。

运行本项目

```shell
# 安装依赖
yarn install

# 创建本地环境变量
cp .env.example .env

# 运行（网页端）
yarn serve

# 运行（electron）
yarn electron:serve
```

本地运行 NeteaseCloudMusicApi，或者将 API [部署至 Vercel](#%EF%B8%8F-部署至-vercel)

```shell
# 运行 API （默认 3000 端口）
yarn netease_api:run
```
