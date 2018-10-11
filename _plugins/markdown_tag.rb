
module Jekyll
  class MarkdownTag < Liquid::Tag
    def initialize(tag_name, text, tokens)
      super
      @text = text.strip
    end
    require "kramdown"
    def render(context)

      currentDir = context['page']['dir']
      fileDir = @text.match(/^\//) ? [Dir.pwd, @text] : [Dir.pwd, currentDir, @text]

      "#{Kramdown::Document.new(File.read(File.join(*fileDir))).to_html}"
    end
  end
end

Liquid::Template.register_tag('markdown', Jekyll::MarkdownTag)
