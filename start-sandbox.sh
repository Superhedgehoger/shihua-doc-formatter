#!/bin/bash

# 石化公文自动排版工具 - 沙盒化启动脚本
# 特点：临时用户目录、无状态会话、隔离 Cookie/缓存

set -e

echo "🚀 启动石化公文排版工具 (沙盒模式)..."

# 项目目录
PROJECT_DIR="$HOME/Documents/hermesagent/shihua-doc-formatter"

# 创建临时 Chrome 用户目录（每次启动都是全新的）
TEMP_DIR=$(mktemp -d -t shihua-chrome-XXXXXX)
CHROME_USER_DATA="$TEMP_DIR/chrome-profile"

# 清理函数
cleanup() {
  echo ""
  echo "🧹 清理临时数据..."
  if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
    echo "   ✓ 已删除临时目录"
  fi
  
  # 停止 Vite 服务
  if [ -n "$VITE_PID" ]; then
    kill $VITE_PID 2>/dev/null || true
    echo "   ✓ 已停止 Vite 服务"
  fi
  echo ""
  echo "👋 已退出沙盒模式"
}

# 注册退出时清理
trap cleanup EXIT INT TERM

echo ""
echo "📁 临时用户目录: $CHROME_USER_DATA"
echo "   (会话结束后自动清理)"
echo ""

# 检查依赖
cd "$PROJECT_DIR"

if [ ! -d "node_modules" ]; then
  echo "⚠️  未找到 node_modules，正在安装依赖..."
  npm install
fi

# 启动 Vite 服务（后台运行）
echo "🔧 启动 Vite 开发服务器..."
nohup npm run dev > /tmp/shihua-vite.log 2>&1 &
VITE_PID=$!

# 等待服务启动
echo "⏳ 等待服务就绪..."
MAX_WAIT=30
WAITED=0
while ! curl -s http://localhost:5173 > /dev/null 2>&1; do
  if [ $WAITED -ge $MAX_WAIT ]; then
    echo "❌ 服务启动超时"
    echo "   日志: cat /tmp/shihua-vite.log"
    exit 1
  fi
  sleep 1
  WAITED=$((WAITED + 1))
  echo "   等待中... ($WAITED/$MAX_WAIT)"
done

echo "✅ Vite 服务已启动 (PID: $VITE_PID)"
echo ""

# 检测 Chrome 路径
if [ -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
  CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  BROWSER_NAME="Google Chrome"
elif [ -f "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" ]; then
  CHROME_PATH="/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
  BROWSER_NAME="Microsoft Edge"
elif [ -f "/Applications/Chromium.app/Contents/MacOS/Chromium" ]; then
  CHROME_PATH="/Applications/Chromium.app/Contents/MacOS/Chromium"
  BROWSER_NAME="Chromium"
else
  echo "⚠️  未检测到 Chrome/Edge/Chromium，使用系统默认浏览器"
  echo ""
  echo "📱 请在浏览器中访问: http://localhost:5173"
  echo ""
  echo "按 Ctrl+C 停止服务"
  wait $VITE_PID
  exit 0
fi

echo "🌐 启动 $BROWSER_NAME (沙盒模式)..."
echo ""

# 启动 Chrome（普通窗口模式，非 --app）
"$CHROME_PATH" \
  --user-data-dir="$CHROME_USER_DATA" \
  --no-first-run \
  --no-default-browser-check \
  --disable-extensions \
  --disable-sync \
  --disable-background-timer-throttling \
  --password-store=basic \
  --use-mock-keychain \
  --disable-features=TranslateUI,OptimizationHints,PrivacySandboxSettings \
  --new-window \
  "http://localhost:5173" &

CHROME_PID=$!

echo "✅ 浏览器已启动 (PID: $CHROME_PID)"
echo ""
echo "📋 沙盒配置:"
echo "   • 临时用户目录: ✓"
echo "   • 无 Cookie/缓存持久化: ✓"
echo "   • 无登录状态: ✓"
echo "   • 禁用扩展: ✓"
echo "   • 禁用同步: ✓"
echo ""
echo "📱 应用访问地址: http://localhost:5173"
echo ""
echo "快捷键:"
echo "   ⌘/Ctrl + Enter  - 开始解析"
echo "   ⌘/Ctrl + S      - 导出文档"
echo ""
echo "按 Ctrl+C 停止服务并清理临时数据"
echo ""

# 等待 Vite 服务结束（保持脚本运行）
wait $VITE_PID
