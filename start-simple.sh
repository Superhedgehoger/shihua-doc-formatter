#!/bin/bash

# 石化公文自动排版工具 - 简化启动脚本
# 特点：临时用户目录、无状态会话

echo "🚀 启动石化公文排版工具..."

# 项目目录
PROJECT_DIR="$HOME/Documents/hermesagent/shihua-doc-formatter"
cd "$PROJECT_DIR"

# 检查并清理现有进程
echo "🔍 检查现有服务..."
EXISTING_PID=$(lsof -ti :5173 2>/dev/null)
if [ -n "$EXISTING_PID" ]; then
  echo "   停止现有服务 (PID: $EXISTING_PID)"
  kill $EXISTING_PID 2>/dev/null
  sleep 2
fi

# 创建临时目录
TEMP_DIR=$(mktemp -d -t shihua-XXXXXX)
CHROME_DATA="$TEMP_DIR/chrome"
mkdir -p "$CHROME_DATA"

echo "📁 临时目录: $TEMP_DIR"

# 清理函数
cleanup() {
  echo ""
  echo "🧹 清理中..."
  rm -rf "$TEMP_DIR" 2>/dev/null
  pkill -f "vite" 2>/dev/null || true
  echo "✅ 已清理"
}
trap cleanup EXIT INT TERM

# 启动 Vite（后台）
echo "🔧 启动 Vite 服务..."
npm run dev -- --host > /dev/null 2>&1 &
VITE_PID=$!
echo "   Vite PID: $VITE_PID"

# 简单等待
echo "⏳ 等待服务启动 (5秒)..."
sleep 5

# 检查服务是否启动
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
  echo "⚠️  服务可能未启动，继续尝试打开浏览器..."
fi

# 检测浏览器
if [ -d "/Applications/Google Chrome.app" ]; then
  BROWSER="Chrome"
  BROWSER_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
elif [ -d "/Applications/Microsoft Edge.app" ]; then
  BROWSER="Edge"
  BROWSER_PATH="/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
else
  echo "🌐 使用系统默认浏览器..."
  open http://localhost:5173
  echo ""
  echo "✅ 应用已启动: http://localhost:5173"
  echo ""
  echo "按 Ctrl+C 停止"
  wait
  exit 0
fi

echo "🌐 启动 $BROWSER (沙盒模式)..."

# 启动浏览器（沙盒参数）
"$BROWSER_PATH" \
  --user-data-dir="$CHROME_DATA" \
  --no-first-run \
  --no-default-browser-check \
  --disable-extensions \
  --disable-sync \
  --password-store=basic \
  --use-mock-keychain \
  --app=http://localhost:5173 \
  --window-size=1400,900 \
  > /dev/null 2>&1 &

BROWSER_PID=$!
echo "   浏览器 PID: $BROWSER_PID"
echo ""
echo "✅ 应用已启动!"
echo ""
echo "📱 http://localhost:5173"
echo ""
echo "🛡️ 沙盒配置:"
echo "   • 临时用户数据: $CHROME_DATA"
echo "   • 无登录状态 / 无扩展"
echo ""
echo "快捷键: ⌘+Enter 解析  |  ⌘+S 导出"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

wait
