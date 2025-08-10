#!/bin/bash
# Puppeteer test helper script for codebot container

# Function to check Chrome is working
check_chrome() {
    echo "🔍 Checking Chrome installation..."
    
    if ! command -v google-chrome-stable &> /dev/null; then
        echo "❌ Google Chrome not found!"
        return 1
    fi
    
    # Get Chrome version
    CHROME_VERSION=$(google-chrome-stable --version)
    echo "✅ Chrome installed: $CHROME_VERSION"
    
    # Test Chrome can launch in headless mode
    echo "🧪 Testing Chrome headless mode..."
    if timeout 10s google-chrome-stable \
        --headless \
        --no-sandbox \
        --disable-setuid-sandbox \
        --disable-dev-shm-usage \
        --disable-gpu \
        --dump-dom \
        https://example.com > /dev/null 2>&1; then
        echo "✅ Chrome headless mode working"
    else
        echo "❌ Chrome headless mode failed"
        return 1
    fi
    
    # Check shared memory
    echo "📊 Checking shared memory..."
    df -h /dev/shm 2>/dev/null || echo "⚠️  /dev/shm not available (using disk-based shared memory)"
    
    # Check fonts
    echo "🔤 Checking fonts..."
    fc-list | wc -l | xargs -I {} echo "   {} fonts available"
    
    return 0
}

# Function to run a simple Puppeteer test
test_puppeteer() {
    echo "🧪 Running Puppeteer test..."
    
    cat > /tmp/puppeteer-test.js << 'EOF'
const puppeteer = require('puppeteer-core');

(async () => {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable',
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1280,720'
      ],
      defaultViewport: { width: 1280, height: 720 }
    });

    console.log('Creating page...');
    const page = await browser.newPage();
    
    console.log('Navigating to example.com...');
    await page.goto('https://example.com', { waitUntil: 'networkidle2' });
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: '/tmp/puppeteer-test.png' });
    
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    await browser.close();
    console.log('✅ Puppeteer test successful!');
    
    // Show screenshot info
    const fs = require('fs');
    const stats = fs.statSync('/tmp/puppeteer-test.png');
    console.log(`📷 Screenshot saved: /tmp/puppeteer-test.png (${stats.size} bytes)`);
    
  } catch (error) {
    console.error('❌ Puppeteer test failed:', error);
    process.exit(1);
  }
})();
EOF

    node /tmp/puppeteer-test.js
}

# Main script
echo "🤖 Codebot Puppeteer Test Helper"
echo "================================"

case "${1:-check}" in
    check)
        check_chrome
        ;;
    test)
        check_chrome && test_puppeteer
        ;;
    *)
        echo "Usage: $0 {check|test}"
        echo "  check - Check Chrome installation and configuration"
        echo "  test  - Run a simple Puppeteer test"
        exit 1
        ;;
esac