// Wraps markdown-it to expose a single renderMarkdown(text) function that converts Markdown to HTML.
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()

export function renderMarkdown(text: string): string {
  return md.render(text)
}
