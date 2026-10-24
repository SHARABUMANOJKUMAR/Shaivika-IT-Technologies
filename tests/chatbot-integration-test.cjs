const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Import the Netlify function handler
const { handler } = require('../netlify/functions/api.js');

async function runChatbotTests() {
  console.log('\n===============================================================');
  console.log('SHAIVIKA AI CHATBOT INTEGRATION & SECURITY TEST SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function record(desc, ok, details = '') {
    if (ok) {
      passed++;
      console.log(`✅ [PASS] ${desc}`);
      if (details) console.log(`   Evidence: ${details}`);
    } else {
      failed++;
      console.error(`❌ [FAIL] ${desc}`);
      if (details) console.error(`   Error details: ${details}`);
    }
  }

  // TC-CB-01: Reject empty message
  try {
    const res = await handler({
      httpMethod: 'POST',
      queryStringParameters: { action: 'chatMessage' },
      headers: { 'client-ip': '127.0.0.1' },
      body: JSON.stringify({ message: '   ' })
    }, {});
    const data = JSON.parse(res.body);
    record('TC-CB-01: Empty message rejected with HTTP 400', res.statusCode === 400 && data.error.includes('empty'), `HTTP ${res.statusCode}: ${data.error}`);
  } catch (err) {
    record('TC-CB-01: Empty message rejected with HTTP 400', false, err.message);
  }

  // TC-CB-02: Reject oversized message (> 1000 chars)
  try {
    const hugeMsg = 'A'.repeat(1005);
    const res = await handler({
      httpMethod: 'POST',
      queryStringParameters: { action: 'chatMessage' },
      headers: { 'client-ip': '127.0.0.1' },
      body: JSON.stringify({ message: hugeMsg })
    }, {});
    const data = JSON.parse(res.body);
    record('TC-CB-02: Message over 1,000 characters rejected with HTTP 400', res.statusCode === 400 && data.error.includes('1,000'), `HTTP ${res.statusCode}: ${data.error}`);
  } catch (err) {
    record('TC-CB-02: Message over 1,000 characters rejected with HTTP 400', false, err.message);
  }

  // TC-CB-03: Process valid query & return structured AI answer
  try {
    const res = await handler({
      httpMethod: 'POST',
      queryStringParameters: { action: 'chatMessage' },
      headers: { 'client-ip': '198.51.100.99' },
      body: JSON.stringify({ message: 'What services do you offer?', sessionId: 'test-session-1' })
    }, {});
    const data = JSON.parse(res.body);
    const hasReply = res.statusCode === 200 && typeof data.reply === 'string' && data.reply.length > 20;
    record('TC-CB-03: Valid query returns HTTP 200 with formatted reply', hasReply, `HTTP ${res.statusCode}, reply length: ${data.reply?.length || 0}`);
  } catch (err) {
    record('TC-CB-03: Valid query returns HTTP 200 with formatted reply', false, err.message);
  }

  // TC-CB-04: Process pricing plans quick action
  try {
    const res = await handler({
      httpMethod: 'POST',
      queryStringParameters: { action: 'chatMessage' },
      headers: { 'client-ip': '198.51.100.99' },
      body: JSON.stringify({ message: 'Pricing Plans', sessionId: 'test-session-1' })
    }, {});
    const data = JSON.parse(res.body);
    const mentionsPricing = res.statusCode === 200 && (data.reply.includes('5,000') || data.reply.includes('Starter') || data.reply.includes('₹'));
    record('TC-CB-04: Pricing query returns verified Shaivika package tiers', mentionsPricing, `Reply preview: ${data.reply?.substring(0, 100)}...`);
  } catch (err) {
    record('TC-CB-04: Pricing query returns verified Shaivika package tiers', false, err.message);
  }

  // TC-CB-05: Rate limiting blocks abusive flooding (> 25 req/min)
  try {
    const testIp = '203.0.113.88';
    let blocked = false;
    for (let i = 0; i < 30; i++) {
      const res = await handler({
        httpMethod: 'POST',
        queryStringParameters: { action: 'chatMessage' },
        headers: { 'client-ip': testIp },
        body: JSON.stringify({ message: 'Hello spam ' + i })
      }, {});
      if (res.statusCode === 429) {
        blocked = true;
        break;
      }
    }
    record('TC-CB-05: Rate limiting actively blocks burst/flood abuse with HTTP 429', blocked, 'Rate limiter triggered at threshold');
  } catch (err) {
    record('TC-CB-05: Rate limiting actively blocks burst/flood abuse with HTTP 429', false, err.message);
  }

  // TC-CB-06: No sensitive tokens or secrets leaked in frontend assets
  try {
    const cssContent = fs.readFileSync(path.resolve(__dirname, '../css/ai-chatbot.css'), 'utf8');
    const jsContent = fs.readFileSync(path.resolve(__dirname, '../js/ai-chatbot.js'), 'utf8');
    const hasOpenRouter = /openrouter|sk-or-|sk-ant-|ghp_/i.test(cssContent + jsContent);
    const hasAdminPass = /googlemanoj|shaivika_admin|shaivika_session/i.test(cssContent + jsContent);
    record('TC-CB-06: Zero credentials, private tokens, or LLM keys in chatbot client assets', !hasOpenRouter && !hasAdminPass, 'Verified js/ai-chatbot.js and css/ai-chatbot.css');
  } catch (err) {
    record('TC-CB-06: Zero credentials, private tokens, or LLM keys in chatbot client assets', false, err.message);
  }

  // TC-CB-07: Verify all 6 HTML files include chatbot CSS and JS
  try {
    const pages = ['index.html', 'about.html', 'services.html', 'portfolio.html', 'careers.html', 'contact.html'];
    let allLinked = true;
    for (const page of pages) {
      const pageContent = fs.readFileSync(path.resolve(__dirname, '..', page), 'utf8');
      if (!pageContent.includes('ai-chatbot.css') || !pageContent.includes('ai-chatbot.js')) {
        allLinked = false;
        break;
      }
    }
    record('TC-CB-07: All 6 customer-facing HTML pages link to ai-chatbot.css and ai-chatbot.js', allLinked, 'index, about, services, portfolio, careers, contact verified');
  } catch (err) {
    record('TC-CB-07: All 6 customer-facing HTML pages link to ai-chatbot.css and ai-chatbot.js', false, err.message);
  }

  // TC-CB-08: Verify WhatsApp float coordinate offset in ai-chatbot.css
  try {
    const css = fs.readFileSync(path.resolve(__dirname, '../css/ai-chatbot.css'), 'utf8');
    const hasOffset = css.includes('.whatsapp-float') && css.includes('bottom: 96px');
    record('TC-CB-08: Launcher coordinates defensively offset WhatsApp floating button to prevent UI overlap', hasOffset, 'whatsapp-float repositioned to bottom: 96px');
  } catch (err) {
    record('TC-CB-08: Launcher coordinates defensively offset WhatsApp floating button to prevent UI overlap', false, err.message);
  }

  console.log(`\n===============================================================`);
  console.log(`CHATBOT TESTS SUMMARY: ${passed}/${passed + failed} PASSED (${failed} FAILED)`);
  console.log(`===============================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runChatbotTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
