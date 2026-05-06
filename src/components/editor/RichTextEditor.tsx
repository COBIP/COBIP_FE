'use client';

import { useCallback, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import type { Editor, JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import FileHandler from '@tiptap/extension-file-handler';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Underline,
  Undo2,
  Video,
} from 'lucide-react';
import type {
  AdminGrammarMediaResponse,
  AdminGrammarMediaType,
} from '@/types/AdminGrammarTemplateTypes';
import { adminImageExtension, adminVideoExtension } from './AdminMediaExtensions';

interface RichTextEditorProps {
  value: JSONContent;
  onChange: (content: JSONContent) => void;
  onMediaUpload: (file: File, mediaType: AdminGrammarMediaType) => Promise<AdminGrammarMediaResponse>;
}

interface RichTextToolbarProps {
  editor: Editor;
  isUploading: boolean;
  onPickImage: () => void;
  onPickVideo: () => void;
}

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

const defaultTextColor = '#111827';
const defaultHighlightColor = '#fef3c7';

function selectMediaType(file: File): AdminGrammarMediaType | null {
  if (file.type.startsWith('image/')) {
    return 'IMAGE';
  }

  if (file.type.startsWith('video/')) {
    return 'VIDEO';
  }

  return null;
}

function buildMediaNode(
  uploadedMedia: AdminGrammarMediaResponse,
  file: File,
  mediaType: AdminGrammarMediaType,
) {
  if (mediaType === 'IMAGE') {
    return {
      type: 'image',
      attrs: {
        src: uploadedMedia.fileUrl,
        key: uploadedMedia.fileKey,
        alt: file.name,
        caption: '',
        align: 'center',
        width: 100,
      },
    };
  }

  return {
    type: 'video',
    attrs: {
      src: uploadedMedia.fileUrl,
      key: uploadedMedia.fileKey,
      caption: '',
      align: 'center',
      width: 100,
      poster: '',
    },
  };
}

function RichTextToolbar({
  editor,
  isUploading,
  onPickImage,
  onPickVideo,
}: RichTextToolbarProps) {
  const handleHeadingChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run();
      return;
    }

    editor
      .chain()
      .focus()
      .toggleHeading({ level: Number(value) as 1 | 2 | 3 })
      .run();
  };

  const handleTextColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    editor.chain().focus().setColor(event.target.value).run();
  };

  const handleHighlightChange = (event: ChangeEvent<HTMLInputElement>) => {
    editor.chain().focus().toggleHighlight({ color: event.target.value }).run();
  };

  const handleLinkClick = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const nextUrl = window.prompt('링크 URL', previousUrl ?? 'https://');

    if (nextUrl === null) {
      return;
    }

    if (nextUrl.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: nextUrl.trim() }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-white px-3 py-2">
      <select
        title="문단 스타일"
        onChange={handleHeadingChange}
        defaultValue="paragraph"
        className="h-9 rounded border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
      >
        <option value="paragraph">본문</option>
        <option value="1">제목</option>
        <option value="2">소제목</option>
        <option value="3">작은 제목</option>
      </select>

      <button type="button" title="본문" onClick={() => editor.chain().focus().setParagraph().run()} className="admin-editor-tool-button">
        <Pilcrow size={17} />
      </button>
      <button type="button" title="제목" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="admin-editor-tool-button">
        <Heading1 size={17} />
      </button>
      <button type="button" title="소제목" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="admin-editor-tool-button">
        <Heading2 size={17} />
      </button>
      <button type="button" title="작은 제목" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="admin-editor-tool-button">
        <Heading3 size={17} />
      </button>

      <span className="mx-1 h-6 w-px bg-slate-200" />

      <button type="button" title="굵게" onClick={() => editor.chain().focus().toggleBold().run()} className="admin-editor-tool-button">
        <Bold size={17} />
      </button>
      <button type="button" title="기울임" onClick={() => editor.chain().focus().toggleItalic().run()} className="admin-editor-tool-button">
        <Italic size={17} />
      </button>
      <button type="button" title="밑줄" onClick={() => editor.chain().focus().toggleUnderline().run()} className="admin-editor-tool-button">
        <Underline size={17} />
      </button>
      <button type="button" title="인라인 코드" onClick={() => editor.chain().focus().toggleCode().run()} className="admin-editor-tool-button">
        <Code size={17} />
      </button>

      <label className="admin-editor-tool-button" title="글자색">
        <span className="sr-only">글자색</span>
        <input
          type="color"
          defaultValue={defaultTextColor}
          onChange={handleTextColorChange}
          className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
        />
      </label>
      <label className="admin-editor-tool-button" title="배경색">
        <Highlighter size={17} />
        <input
          type="color"
          defaultValue={defaultHighlightColor}
          onChange={handleHighlightChange}
          className="h-0 w-0 opacity-0"
        />
      </label>

      <span className="mx-1 h-6 w-px bg-slate-200" />

      <button type="button" title="왼쪽 정렬" onClick={() => editor.chain().focus().setTextAlign('left').run()} className="admin-editor-tool-button">
        <AlignLeft size={17} />
      </button>
      <button type="button" title="가운데 정렬" onClick={() => editor.chain().focus().setTextAlign('center').run()} className="admin-editor-tool-button">
        <AlignCenter size={17} />
      </button>
      <button type="button" title="오른쪽 정렬" onClick={() => editor.chain().focus().setTextAlign('right').run()} className="admin-editor-tool-button">
        <AlignRight size={17} />
      </button>

      <span className="mx-1 h-6 w-px bg-slate-200" />

      <button type="button" title="목록" onClick={() => editor.chain().focus().toggleBulletList().run()} className="admin-editor-tool-button">
        <List size={17} />
      </button>
      <button type="button" title="번호 목록" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="admin-editor-tool-button">
        <ListOrdered size={17} />
      </button>
      <button type="button" title="코드 블록" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="admin-editor-tool-button">
        <Code size={17} />
      </button>
      <button type="button" title="인용문" onClick={() => editor.chain().focus().toggleBlockquote().run()} className="admin-editor-tool-button">
        <Quote size={17} />
      </button>
      <button type="button" title="구분선" onClick={() => editor.chain().focus().setHorizontalRule().run()} className="admin-editor-tool-button">
        <Minus size={17} />
      </button>
      <button type="button" title="링크" onClick={handleLinkClick} className="admin-editor-tool-button">
        <LinkIcon size={17} />
      </button>

      <span className="mx-1 h-6 w-px bg-slate-200" />

      <button type="button" title="이미지 업로드" onClick={onPickImage} disabled={isUploading} className="admin-editor-tool-button">
        <ImageIcon size={17} />
      </button>
      <button type="button" title="영상 업로드" onClick={onPickVideo} disabled={isUploading} className="admin-editor-tool-button">
        <Video size={17} />
      </button>

      <span className="mx-1 h-6 w-px bg-slate-200" />

      <button type="button" title="실행 취소" onClick={() => editor.chain().focus().undo().run()} className="admin-editor-tool-button">
        <Undo2 size={17} />
      </button>
      <button type="button" title="다시 실행" onClick={() => editor.chain().focus().redo().run()} className="admin-editor-tool-button">
        <Redo2 size={17} />
      </button>
    </div>
  );
}

export function RichTextEditor({ value, onChange, onMediaUpload }: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleInsertMediaFiles = useCallback(
    async (targetEditor: Editor, files: File[]) => {
      const mediaFiles = files
        .map((file) => ({ file, mediaType: selectMediaType(file) }))
        .filter((item): item is { file: File; mediaType: AdminGrammarMediaType } => item.mediaType !== null);

      if (mediaFiles.length === 0) {
        setUploadError('지원하는 이미지 또는 영상 파일만 업로드할 수 있습니다.');
        return;
      }

      setIsUploading(true);
      setUploadError('');

      try {
        for (const { file, mediaType } of mediaFiles) {
          const uploadedMedia = await onMediaUpload(file, mediaType);
          targetEditor.chain().focus().insertContent(buildMediaNode(uploadedMedia, file, mediaType)).run();
        }
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : '미디어 업로드에 실패했습니다.');
      } finally {
        setIsUploading(false);
      }
    },
    [onMediaUpload],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: {
          openOnClick: false,
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      adminImageExtension,
      adminVideoExtension,
      FileHandler.configure({
        allowedMimeTypes,
        onPaste: (targetEditor, files) => {
          void handleInsertMediaFiles(targetEditor, files);
        },
        onDrop: (targetEditor, files, position) => {
          targetEditor.chain().focus().setTextSelection(position).run();
          void handleInsertMediaFiles(targetEditor, files);
        },
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'min-h-[34rem] px-6 py-5 outline-none',
      },
    },
    onUpdate: ({ editor: updatedEditor }) => {
      onChange(updatedEditor.getJSON());
    },
  });

  const handlePickImage = () => {
    imageInputRef.current?.click();
  };

  const handlePickVideo = () => {
    videoInputRef.current?.click();
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!editor || !event.target.files?.length) {
      return;
    }

    void handleInsertMediaFiles(editor, Array.from(event.target.files));
    event.target.value = '';
  };

  if (!editor) {
    return (
      <div className="flex min-h-[38rem] items-center justify-center rounded-md border border-slate-200 bg-white text-sm text-slate-500">
        에디터를 준비하고 있습니다.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <RichTextToolbar
        editor={editor}
        isUploading={isUploading}
        onPickImage={handlePickImage}
        onPickVideo={handlePickVideo}
      />
      <EditorContent editor={editor} className="admin-rich-editor" />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileInputChange}
      />
      <div className="flex min-h-10 items-center justify-between gap-3 border-t border-slate-200 px-4 py-2 text-xs text-slate-500">
        <span>{isUploading ? '미디어를 업로드하는 중입니다.' : '이미지와 영상을 드롭하거나 붙여넣을 수 있습니다.'}</span>
        {uploadError ? <span className="font-medium text-rose-600">{uploadError}</span> : null}
      </div>
    </div>
  );
}
