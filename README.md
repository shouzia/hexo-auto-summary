# Hexo自动总结插件

**Hexo 自动总结** 插件为 Hexo 博客自动生成文章总结，并在每篇文章的开头展示。

## 特性

- **自动总结**: 使用 AI API 自动生成文章总结。
- **可定制输出**: 在文章开头显示总结，支持自定义 HTML 结构。
- **配置简便**: 通过 Hexo 配置文件进行简单配置。

## 安装

   ```bash
   npm i hexo-auto-summary
   ```

## 配置

在 Hexo 的 `_config.yml` 文件中添加以下配置：

```yaml
# Hexo 自动总结插件配置
auto_summary:
  api_key: YOUR_API_KEY      # 密钥
  api_secret: YOUR_API_SECRET  # SECRET
  model: YOUR_MODEL_NAME # 模型
```

