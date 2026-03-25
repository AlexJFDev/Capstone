import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()

export function renderMarkdown(text: string): string {
  return md.render(text)
}
