#!/bin/bash

# 石化公文自动排版工具 - 启动脚本
# 使用独立的 Guest 模式浏览器，不影响正常浏览器使用

set -e

echo "🚀 启动石化公文自动排版工具..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目目录
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  首次运行，正在安装依赖...${NC}"
    npm install
    echo ""
fi

# 查找 Chrome 路径
CHROME_PATH=""
if [ -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
    CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
elif [ -f "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary" ]; then
    CHROME_PATH="/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"
elif [ -f "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" ]; then
    CHROME_PATH="/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
elif [ -f "/Applications/Arc.app/Contents/MacOS/Arc" ]; then
    CHROME_PATH="/Applications/Arc.app/Contents/MacOS/Arc"
fi

# 创建临时用户数据目录（确保完全隔离）
TEMP_PROFILE_DIR="/tmp/shihua-doc-formatter-profile-$(date +%s)"
mkdir -p "$TEMP_PROFILE_DIR"

# 启动浏览器的函数
launch_browser() {
    local URL=$1
    local BROWSER_NAME=""
    
    if [ -n "$CHROME_PATH" ]; then
        BROWSER_NAME=$(basename "$CHROME_PATH" .app)
        echo -e "${BLUE}🌐 正在启动 Guest 模式浏览器: $BROWSER_NAME${NC}"
        echo ""
        
        # 使用 --guest 模式（完全独立的访客模式）
        # 或使用 --user-data-dir 创建独立配置
        "$CHROME_PATH" \
            --guest \
            --no-first-run \
            --no-default-browser-check \
            --disable-extensions \
            --disable-plugins \
            --window-size=1400,900 \
            --window-position=100,50 \
            "$URL" \
            > /dev/null 2>&1 &
    else
        echo -e "${YELLOW}⚠️  未找到 Chrome，尝试使用默认浏览器...${NC}"
        open "$URL"
    fi
}

# 启动 Vite 开发服务器
echo -e "${GREEN}📦 启动 Vite 开发服务器...${NC}"
echo ""

# 使用 Vite 的 --open 功能，但我们会在后台启动
# 然后等待服务器就绪后手动打开 Guest 浏览器
npm run dev -- --host &

VITE_PID=$!

# 等待服务器启动（检查端口 5173）
echo -e "${BLUE}⏳ 等待服务器启动...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        break
    fi
    sleep 0.5
    echo -n "."
done
echo ""

# 检查服务器是否成功启动
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${YELLOW}❌ 服务器启动失败${NC}"
    kill $VITE_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}✅ 服务器已启动: http://localhost:5173${NC}"
echo ""

# 启动 Guest 模式浏览器
launch_browser "http://localhost:5173"

echo ""
echo -e "${GREEN}🎉 启动完成！${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  本地地址: http://localhost:5173"
echo "  网络地址: http://$(ifconfig | grep 'inet ' | grep -v '127.0.0.1' | head -1 | awk '{print $2}'):5173"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 等待 Vite 进程
wait $VITE_PID

# 清理临时目录
rm -rf "$TEMP_PROFILE_DIR" 2>/dev/null || true
