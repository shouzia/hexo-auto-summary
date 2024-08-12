const axios = require('axios');
const { JSDOM } = require('jsdom'); // 用于解析 HTML

async function sendChatRequest(model, key, secret, content) {
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

    try {
        const response = await axios.post(url, data, { headers: headers });
        const result = response.data;

        if (result && result.choices && result.choices.length > 0) {
            return result.choices[0].message.content;
        } else {
            throw new Error('Failed to get summary from API.');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

hexo.extend.filter.register('after_render:html', async function (str, data) {
    if (data.page && data.page.layout === 'post') {
        const config = hexo.config.auto_summary || {};
        if (!config.api_key || !config.api_secret || !config.model) {
            hexo.log.warn('API Key, Secret, or Model is not configured for hexo-auto-summary.');
            return str;
        }

        // 使用 JSDOM 解析 HTML
        const dom = new JSDOM(str);
        const document = dom.window.document;
        const articleContainer = document.querySelector('#article-container');

        if (articleContainer) {
            const content = articleContainer.textContent || articleContainer.innerHTML;

            try {
                const summary = await sendChatRequest(config.model, config.api_key, config.api_secret, content);
                const summaryHtml = `<div class="post-summary"><h3>文章总结:</h3><p>${summary}</p></div><hr/>`;

                // 在文章容器的开头插入总结
                articleContainer.insertAdjacentHTML('afterbegin', summaryHtml);

                // 返回修改后的 HTML
                return dom.serialize();
            } catch (error) {
                hexo.log.error('Failed to generate summary:', error);
                return str;
            }
        } else {
            hexo.log.warn('#article-container not found in the post.');
            return str;
        }
    }
    return str;
});