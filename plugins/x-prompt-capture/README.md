# x-prompt-capture

Chrome extension for capturing prompt threads from X/Twitter and exporting daily deduplicated JSON files compatible with AI Image Prompt Gallery import.

## Features

- One-click capture from the current tweet thread.
- Popup has 4 actions: `Capture Tweet`, `Export Today's JSON`, `Open Json Dictory`, `Settings`.
- Uses OpenAI-compatible LLM extraction to understand the thread.
- Supports prompt text in the main tweet or up to the first 100 comments/replies.
- Extracts images from the main tweet and comments.
- Formats output into importable JSON.
- Daily export file naming: `YYYY-MM-DD.json`.
- Multiple templates in one day file.
- Deduplication within each day.
- Export path configurable to a subdirectory under Downloads.

## Output JSON format

```json
{
  "templates": [
    {
      "slug": "...",
      "title": "...",
      "desc": "...",
      "prompt_template": "...",
      "image_urls": ["..."],
      "tags": ["..."],
      "author": "@username",
      "source_url": "https://x.com/.../status/...",
      "style": "Illustration",
      "final_prompt": "",
      "variables": [],
      "edit_mode": "direct_only"
    }
  ]
}
```

## Install (developer mode)

1. Open Chrome Extensions page: `chrome://extensions/`
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select folder: `plugins/x-prompt-capture/chrome-extension`.

## Settings

- `Export Directory`: relative folder under Downloads.
- `OpenAI Base URL`: OpenAI-compatible endpoint.
- `OpenAI API Key`: your key.
- `OpenAI Model`: model name used for extraction.

## Usage

1. Browse X/Twitter.
2. Hover or click the target thread.
3. Open extension popup and click **Capture Tweet**.
4. After capture, a modal shows the structured prompt JSON preview; close with `×`.
5. Click **Export Today's JSON** to force-export current day data.
6. Click **Open Json Dictory** to open the latest exported file location (or Downloads folder if none).
7. JSON is exported to:
   - `[Downloads]/x-prompt-json/YYYY-MM-DD.json` by default
   - or your custom directory in extension settings.

## Notes

- The extension writes to the browser Downloads folder via Chrome Downloads API.
- Daily deduplication uses the captured thread fingerprint, not the LLM output.
- The LLM is instructed to choose a style from a fixed enumeration and to avoid generic tags like `x` or `prompt`.
