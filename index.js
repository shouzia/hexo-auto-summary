const axios = require('axios');
const { JSDOM } = require('jsdom'); // 用于解析 HTML

async function sendChatRequest(model, key, secret, content, retries = 5, delay = 3000) {
    const url = "https://spark-api-open.xf-yun.com/v1/chat/completions";
    const data = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": '帮我总结一下这文章,要求200字:' + content
            }
        ],
        "stream": false  // 设置为非流模式以方便直接获取结果
    };
    const headers = {
        "Authorization": `Bearer ${key}:${secret}`
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.post(url, data, { headers: headers });
            const result = response.data;

            if (result && result.choices && result.choices.length > 0) {
                return result.choices[0].message.content;
            } else {
                throw new Error('Failed to get summary from API.');
            }
        } catch (error) {
            if (attempt < retries) {
                console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay)); // 延迟再重试
            } else {
                console.error('All attempts failed:', error);
                throw error;
            }
        }
    }
}
hexo.log.info('Auto Summary Config:', hexo.config.auto_summary);
hexo.extend.filter.register('after_render:html', async function (str, data) {
    if (data.page && data.page.layout === 'post') {
        const config = hexo.config.auto_summary || {};
        if (!config.enabled || !config.api_key || !config.api_secret || !config.model || !config.content_selector) {
            hexo.log.warn('API Key, Secret, Model, or Content Selector is not configured for hexo-auto-summary.');
            return str;
        }

        const dom = new JSDOM(str);
        const document = dom.window.document;
        const articleContainer = document.querySelector(config.content_selector);

        if (articleContainer) {
            const content = articleContainer.textContent || articleContainer.innerHTML;

            try {
                // 获取摘要并处理重试
                const summary = await sendChatRequest(config.model, config.api_key, config.api_secret, content);
                const summaryHtml = `<div class="post-summary"><h3>文章总结:</h3><p>${summary}</p></div><hr/>`;

                // 在文章容器的开头插入摘要
                articleContainer.insertAdjacentHTML('afterbegin', summaryHtml);

                return dom.serialize(); // 返回修改后的 HTML
            } catch (error) {
                hexo.log.error('Failed to generate summary:', error);
                return str;
            }
        } else {
            hexo.log.warn(`Content container with selector "${config.content_selector}" not found in the post.`);
            return str;
        }
    }
    return str;
});
