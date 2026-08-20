/** UI strings for the attachments feature. The zh dictionary is the key-set
 * source of truth; en is the fallback. */

/** Simplified Chinese dictionary. */
export const zh: Record<string, string> = {
  'http.413': '文件超过大小限制',
  'http.415': '文件类型不被允许',
  'http.403': '会话校验失败，请刷新页面重试',
  'http.429': '上传太频繁，请稍后再试',
  'upload.busy': '上传中…',
  'upload.label': '上传文件',
  'drag.title': '松开以添加文件',
  'drag.desc': '文件/文件夹将上传到当前会话,agent 可读取其内容',
  'card.remove': '移除',
  'card.close': '关闭',
  'image.native': '当前模型支持图像输入,请用 read_image 工具查看 {path}',
  'image.description': '图片讲解(自动生成):\n{description}\n原始文件: {path}',
  'image.file': '图片以文件形式上传({path});未生成讲解,请用 read_document 工具读取',
  'image.tag': '[图片: {name}] {description}',
  'menu.button': '添加',
  'menu.upload.files': '上传文件'
}

/** English dictionary, checked complete against the zh key set (fallback). */
export const en: Record<string, string> = {
  'http.413': 'File exceeds the size limit',
  'http.415': 'File type not allowed',
  'http.403': 'Session validation failed; refresh the page and try again',
  'http.429': 'Uploading too frequently; try again later',
  'upload.busy': 'Uploading…',
  'upload.label': 'Upload file',
  'drag.title': 'Release to add files',
  'drag.desc': 'Files/folders upload to the current session; the agent can read their contents',
  'card.remove': 'Remove',
  'card.close': 'Close',
  'image.native': 'The current model supports image input; use the read_image tool to view {path}',
  'image.description': 'Image description (auto-generated):\n{description}\nOriginal file: {path}',
  'image.file': 'Image uploaded as a file ({path}); no description generated, use the read_document tool to read it',
  'image.tag': '[image: {name}] {description}',
  'menu.button': 'Add',
  'menu.upload.files': 'Upload files'
}
