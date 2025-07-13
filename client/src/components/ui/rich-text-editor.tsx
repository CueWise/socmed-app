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
import { useState, useCallback, useEffect } from 'react'
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
  Type,
  MoreHorizontal
} from 'lucide-react'

interface RichTextEditorProps {
  content?: string
  onChange?: (content: string, isHtml?: boolean) => void
  placeholder?: string
  className?: string
  onSend?: () => void
  autoFocus?: boolean
}

export default function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Start typing...',
  className = '',
  onSend,
  autoFocus = false
}: RichTextEditorProps) {
  const [showSource, setShowSource] = useState(false)
  const [sourceContent, setSourceContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)
  const [showToolbar, setShowToolbar] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable all formatting by default - user can enable via ellipsis menu
        bold: false,
        italic: false,
        heading: false,
        codeBlock: false,
        strike: false,
        bulletList: false,
        orderedList: false,
        code: false
      }),
      // Only add extensions when user wants rich text
      ...(showToolbar ? [
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
        })
      ] : []),
      Placeholder.configure({
        placeholder
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      if (showToolbar) {
        // Rich text mode - send HTML
        const html = editor.getHTML()
        onChange?.(html, true)
      } else {
        // Plain text mode - send text only
        const text = editor.getText()
        onChange?.(text, false)
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[50px] max-h-[100px] p-2 text-sm',
        'data-placeholder': placeholder
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault()
          handleSend()
          return true
        }
        return false
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

  const clearEditor = useCallback(() => {
    if (!editor) return
    editor.commands.clearContent()
  }, [editor])

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

  // Handle autoFocus
  useEffect(() => {
    if (autoFocus && editor) {
      setTimeout(() => {
        editor.commands.focus()
      }, 100)
    }
  }, [autoFocus, editor])

  // Handle clearing editor after sending
  const handleSend = useCallback(() => {
    if (onSend && editor) {
      // Clear editor first, then call onSend
      editor.commands.clearContent()
      onSend()
      // Refocus after a brief delay
      setTimeout(() => {
        if (editor) {
          editor.commands.focus()
        }
      }, 50)
    }
  }, [onSend, editor])

  if (!editor) {
    return null
  }

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden mx-2 ${className}`}>
      {/* Simple header with just ellipsis button */}
      <div className="bg-white p-2 flex justify-end">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowToolbar(!showToolbar)}
            className="p-1 h-6 w-6"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
          
          {/* Scrollable Dropdown Toolbar */}
          {showToolbar && (
            <div className="absolute bottom-full right-0 mb-1 bg-white border border-gray-300 rounded-lg shadow-lg z-[140] p-3 min-w-[280px] max-h-[300px] overflow-y-auto">
              <div className="space-y-3">
                {/* Text Formatting */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Text Formatting</div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={`p-2 ${editor.isActive('bold') ? 'bg-blue-100' : ''}`}
                    >
                      <Bold className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      className={`p-2 ${editor.isActive('italic') ? 'bg-blue-100' : ''}`}
                    >
                      <Italic className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleUnderline().run()}
                      className={`p-2 ${editor.isActive('underline') ? 'bg-blue-100' : ''}`}
                    >
                      <UnderlineIcon className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleStrike().run()}
                      className={`p-2 ${editor.isActive('strike') ? 'bg-blue-100' : ''}`}
                    >
                      <Strikethrough className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Headings */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Headings</div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                      className={`p-2 ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100' : ''}`}
                    >
                      <Heading1 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                      className={`p-2 ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100' : ''}`}
                    >
                      <Heading2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                      className={`p-2 ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100' : ''}`}
                    >
                      <Heading3 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Lists */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Lists</div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                      className={`p-2 ${editor.isActive('bulletList') ? 'bg-blue-100' : ''}`}
                    >
                      <List className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleOrderedList().run()}
                      className={`p-2 ${editor.isActive('orderedList') ? 'bg-blue-100' : ''}`}
                    >
                      <ListOrdered className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Code */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Code</div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleCode().run()}
                      className={`p-2 ${editor.isActive('code') ? 'bg-blue-100' : ''}`}
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                      className={`p-2 ${editor.isActive('codeBlock') ? 'bg-blue-100' : ''}`}
                    >
                      <Type className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Media & Links */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Insert</div>
                  <div className="flex gap-1">
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
                </div>

                {/* View Toggle */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">View</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSource}
                    className="p-2"
                  >
                    {showSource ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="bg-blue-50 border-b border-gray-300 p-3 flex gap-2 z-[9999] relative">
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
        <div className="bg-green-50 border-b border-gray-300 p-3 flex gap-2 z-[9999] relative">
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
            className="w-full min-h-[50px] max-h-[100px] p-2 font-mono text-sm border-none resize-none focus:outline-none"
            placeholder="HTML source..."
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      {/* Minimal Status Bar - Only show when toolbar is active */}
      {showToolbar && (
        <div className="bg-gray-50 border-t border-gray-300 px-3 py-1 text-xs text-gray-400 flex justify-between">
          <span>
            {editor.storage.characterCount?.characters() || 0} chars
          </span>
          <span>{showSource ? 'HTML' : 'Text'}</span>
        </div>
      )}
    </div>
  )
}