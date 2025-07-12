import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import CodeBlock from '@tiptap/extension-code-block'
import Heading from '@tiptap/extension-heading'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Eye,
  EyeOff,
  Type
} from 'lucide-react'

interface RichTextEditorProps {
  content?: string
  onChange?: (html: string, markdown?: string) => void
  placeholder?: string
  className?: string
}

export default function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Start typing...',
  className = ''
}: RichTextEditorProps) {
  const [showSource, setShowSource] = useState(false)
  const [sourceContent, setSourceContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // We'll use our own heading extension
        codeBlock: false, // We'll use our own code block extension
      }),
      Heading.configure({
        levels: [1, 2, 3]
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg'
        }
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300 w-full'
        }
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-50 px-3 py-2 font-semibold'
        }
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-3 py-2'
        }
      }),
      Underline,
      Strike,
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 rounded p-4 font-mono text-sm overflow-x-auto'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4'
      }
    }
  })

  const toggleSource = useCallback(() => {
    if (!editor) return
    
    if (showSource) {
      // Switch from source to rich text
      editor.commands.setContent(sourceContent)
      setShowSource(false)
    } else {
      // Switch from rich text to source
      setSourceContent(editor.getHTML())
      setShowSource(true)
    }
  }, [editor, showSource, sourceContent])

  const addLink = useCallback(() => {
    if (!editor || !linkUrl) return
    
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    }
    
    setLinkUrl('')
    setShowLinkInput(false)
  }, [editor, linkUrl])

  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return
    
    editor.chain().focus().setImage({ src: imageUrl }).run()
    setImageUrl('')
    setShowImageInput(false)
  }, [editor, imageUrl])

  const addTable = useCallback(() => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        {/* Code */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 ${editor.isActive('code') ? 'bg-gray-200' : ''}`}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
          >
            <Type className="h-4 w-4" />
          </Button>
        </div>

        {/* Media & Links */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLinkInput(!showLinkInput)}
            className="p-2"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowImageInput(!showImageInput)}
            className="p-2"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addTable}
            className="p-2"
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* View Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSource}
          className="p-2 ml-auto"
        >
          {showSource ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="bg-blue-50 border-b border-gray-300 p-3 flex gap-2">
          <Input
            placeholder="Enter URL..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addLink()}
            className="flex-1"
          />
          <Button onClick={addLink} size="sm">Add Link</Button>
          <Button variant="ghost" onClick={() => setShowLinkInput(false)} size="sm">Cancel</Button>
        </div>
      )}

      {/* Image Input */}
      {showImageInput && (
        <div className="bg-green-50 border-b border-gray-300 p-3 flex gap-2">
          <Input
            placeholder="Enter image URL..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addImage()}
            className="flex-1"
          />
          <Button onClick={addImage} size="sm">Add Image</Button>
          <Button variant="ghost" onClick={() => setShowImageInput(false)} size="sm">Cancel</Button>
        </div>
      )}

      {/* Editor Content */}
      <div className="bg-white">
        {showSource ? (
          <textarea
            value={sourceContent}
            onChange={(e) => setSourceContent(e.target.value)}
            className="w-full min-h-[200px] p-4 font-mono text-sm border-none resize-none focus:outline-none"
            placeholder="HTML source..."
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-xs text-gray-500 flex justify-between">
        <span>
          {editor.storage.characterCount?.characters() || 0} characters, {editor.storage.characterCount?.words() || 0} words
        </span>
        <span>{showSource ? 'HTML Source' : 'Rich Text'}</span>
      </div>
    </div>
  )
}