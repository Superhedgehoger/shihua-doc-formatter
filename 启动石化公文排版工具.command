#!/bin/bash

# ============================================
# 石化公文自动排版工具 - 双击启动
# 沙盒模式：临时用户目录，无状态会话
# ============================================

cd "$(dirname "$0")"

# 设置窗口标题
echo -en "\033]0;石化公文排版工具\007"

clear
echo "🚀 启动石化公文排版工具..."
echo ""

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo "⚠️  首次运行，正在安装依赖..."
    npm install
    echo "✅ 依赖安装完成"
    echo ""
fi

# 停止已有的 Vite 服务
pkill -f "vite" 2>/dev/null || true
sleep 1

# 启动 Vite 服务
echo "🔧 启动开发服务器..."
npm run dev > /tmp/shihua-vite.log 2>&1 &
VITE_PID=$!

# 等待服务启动
echo "⏳ 等待服务就绪..."
for i in {1..30}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo "✅ 服务已启动"
        break
    fi
    sleep 1
    echo "   等待中... $i/30"
done

# 检查服务是否成功
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "❌ 服务启动失败"
    echo "   错误日志:"
    tail -20 /tmp/shihua-vite.log
    read -p "按回车键退出..."
    exit 1
fi

echo ""
echo "🌐 启动 Chrome 沙盒模式..."

# 创建临时用户目录
TEMP_DIR=$(mktemp -d -t shihua-chrome-XXXXXX)
CHROME_DATA="$TEMP_DIR/chrome-profile"

echo "📁 临时目录: $CHROME_DATA"
echo "   （退出后自动清理）"
echo ""

# 启动 Chrome
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
    --user-data-dir="$CHROME_DATA" \
    --no-first-run \
    --no-default-browser-check \
    --disable-extensions \
    --disable-sync \
    --app=http://localhost:5173 \
    --window-size=1400,900 &

CHROME_PID=$!

echo "✅ Chrome 已启动 (PID: $CHROME_PID)"
echo ""
echo "📋 特性："
echo "   • 无登录状态"
echo "   • 无 Cookie/缓存"
echo "   • 禁用扩展"
echo ""
echo "📱 应用地址: http://localhost:5173"
echo ""
echo "⚠️  关闭此窗口将停止服务"
echo ""

# 等待用户按键
echo "按回车键停止服务并退出..."
read

# 清理
echo ""
echo "🧹 正在清理..."
kill $CHROME_PID 2>/dev/null || true
kill $VITE_PID 2>/dev/null || true
rm -rf "$TEMP_DIR"
echo "✅ 已退出"

# 保持窗口打开
read -p "按回车键关闭窗口..."
