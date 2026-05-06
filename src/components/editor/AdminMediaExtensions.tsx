'use client';

/* eslint-disable @next/next/no-img-element */

import Image from '@tiptap/extension-image';
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import type { ChangeEvent } from 'react';
import { AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

type AdminMediaAlign = 'left' | 'center' | 'right';
type AdminMediaMoveDirection = 'up' | 'down';

interface AdminMediaNodeAttrs {
  src: string;
  key?: string;
  alt?: string;
  caption?: string;
  align?: AdminMediaAlign;
  width?: number;
  poster?: string;
}

function getMediaNodeAttrs(props: NodeViewProps): AdminMediaNodeAttrs {
  return props.node.attrs as AdminMediaNodeAttrs;
}

function getMediaNodePosition(props: NodeViewProps) {
  const position = props.getPos();

  return typeof position === 'number' ? position : null;
}

function applyMediaNodeMove(props: NodeViewProps, direction: AdminMediaMoveDirection) {
  const position = getMediaNodePosition(props);

  if (position === null) {
    return;
  }

  const { state, view } = props.editor;
  const resolvedPosition = state.doc.resolve(position);
  const nodeIndex = resolvedPosition.index();
  const parentNode = resolvedPosition.parent;

  if (direction === 'up') {
    if (nodeIndex === 0) {
      return;
    }

    const previousNode = parentNode.child(nodeIndex - 1);
    const insertPosition = position - previousNode.nodeSize;
    const transaction = state.tr
      .delete(position, position + props.node.nodeSize)
      .insert(insertPosition, props.node)
      .scrollIntoView();

    view.dispatch(transaction);
    return;
  }

  if (nodeIndex >= parentNode.childCount - 1) {
    return;
  }

  const nextNode = parentNode.child(nodeIndex + 1);
  const insertPosition = position + nextNode.nodeSize;
  const transaction = state.tr
    .delete(position, position + props.node.nodeSize)
    .insert(insertPosition, props.node)
    .scrollIntoView();

  view.dispatch(transaction);
}

function getMediaNodeMoveState(props: NodeViewProps) {
  const position = getMediaNodePosition(props);

  if (position === null) {
    return { canMoveUp: false, canMoveDown: false };
  }

  const resolvedPosition = props.editor.state.doc.resolve(position);
  const nodeIndex = resolvedPosition.index();

  return {
    canMoveUp: nodeIndex > 0,
    canMoveDown: nodeIndex < resolvedPosition.parent.childCount - 1,
  };
}

function getMediaAlignClass(align: AdminMediaAlign | undefined) {
  if (align === 'left') {
    return 'items-start';
  }

  if (align === 'right') {
    return 'items-end';
  }

  return 'items-center';
}

function AdminImageNodeView(props: NodeViewProps) {
  const attrs = getMediaNodeAttrs(props);
  const align = attrs.align ?? 'center';
  const width = attrs.width ?? 100;

  const handleAltChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.updateAttributes({ alt: event.target.value });
  };

  const handleCaptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.updateAttributes({ caption: event.target.value });
  };

  const handleWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.updateAttributes({ width: Number(event.target.value) });
  };

  const handleAlignChange = (nextAlign: AdminMediaAlign) => {
    props.updateAttributes({ align: nextAlign });
  };

  return (
    <NodeViewWrapper
      className={`my-4 flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-3 ${getMediaAlignClass(
        align,
      )}`}
    >
      <div className="flex w-full items-center justify-between gap-3" contentEditable={false}>
        <div className="min-w-0 text-xs font-semibold text-slate-500">이미지</div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            title="왼쪽 정렬"
            onClick={() => handleAlignChange('left')}
            className={`rounded p-1.5 ${align === 'left' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <AlignLeft size={15} />
          </button>
          <button
            type="button"
            title="가운데 정렬"
            onClick={() => handleAlignChange('center')}
            className={`rounded p-1.5 ${align === 'center' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <AlignCenter size={15} />
          </button>
          <button
            type="button"
            title="오른쪽 정렬"
            onClick={() => handleAlignChange('right')}
            className={`rounded p-1.5 ${align === 'right' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <AlignRight size={15} />
          </button>
          <button
            type="button"
            title="삭제"
            onClick={props.deleteNode}
            className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <img
        src={attrs.src}
        alt={attrs.alt ?? ''}
        className="max-h-96 rounded border border-slate-200 object-contain"
        style={{ width: `${width}%` }}
        draggable={false}
      />

      <div className="grid w-full gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_8rem]" contentEditable={false}>
        <input
          value={attrs.alt ?? ''}
          onChange={handleAltChange}
          placeholder="alt 텍스트"
          className="rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <input
          value={attrs.caption ?? ''}
          onChange={handleCaptionChange}
          placeholder="캡션"
          className="rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <label className="flex items-center gap-2 rounded border border-slate-200 px-3 py-2 text-xs text-slate-500">
          <span>{width}%</span>
          <input
            type="range"
            min="30"
            max="100"
            value={width}
            onChange={handleWidthChange}
            className="min-w-0 flex-1"
          />
        </label>
      </div>
    </NodeViewWrapper>
  );
}

function AdminVideoNodeView(props: NodeViewProps) {
  const attrs = getMediaNodeAttrs(props);
  const align = attrs.align ?? 'center';
  const width = attrs.width ?? 100;
  const { canMoveUp, canMoveDown } = getMediaNodeMoveState(props);

  const handleCaptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.updateAttributes({ caption: event.target.value });
  };

  const handlePosterChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.updateAttributes({ poster: event.target.value });
  };

  const handleWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.updateAttributes({ width: Number(event.target.value) });
  };

  const handleAlignChange = (nextAlign: AdminMediaAlign) => {
    props.updateAttributes({ align: nextAlign });
  };

  const handleMoveUp = () => {
    applyMediaNodeMove(props, 'up');
  };

  const handleMoveDown = () => {
    applyMediaNodeMove(props, 'down');
  };

  return (
    <NodeViewWrapper
      className={`my-4 flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-3 ${getMediaAlignClass(
        align,
      )}`}
    >
      <div className="flex w-full items-center justify-between gap-3" contentEditable={false}>
        <div className="min-w-0 text-xs font-semibold text-slate-500">영상</div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            title="위로 이동"
            onClick={handleMoveUp}
            disabled={!canMoveUp}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp size={15} />
          </button>
          <button
            type="button"
            title="아래로 이동"
            onClick={handleMoveDown}
            disabled={!canMoveDown}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowDown size={15} />
          </button>
          <button
            type="button"
            title="왼쪽 정렬"
            onClick={() => handleAlignChange('left')}
            className={`rounded p-1.5 ${align === 'left' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <AlignLeft size={15} />
          </button>
          <button
            type="button"
            title="가운데 정렬"
            onClick={() => handleAlignChange('center')}
            className={`rounded p-1.5 ${align === 'center' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <AlignCenter size={15} />
          </button>
          <button
            type="button"
            title="오른쪽 정렬"
            onClick={() => handleAlignChange('right')}
            className={`rounded p-1.5 ${align === 'right' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <AlignRight size={15} />
          </button>
          <button
            type="button"
            title="삭제"
            onClick={props.deleteNode}
            className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <video
        src={attrs.src}
        poster={attrs.poster}
        controls
        className="max-h-96 rounded border border-slate-200 bg-slate-950"
        style={{ width: `${width}%` }}
      />

      <div className="grid w-full gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_8rem]" contentEditable={false}>
        <input
          value={attrs.caption ?? ''}
          onChange={handleCaptionChange}
          placeholder="캡션"
          className="rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <input
          value={attrs.poster ?? ''}
          onChange={handlePosterChange}
          placeholder="썸네일 URL"
          className="rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <label className="flex items-center gap-2 rounded border border-slate-200 px-3 py-2 text-xs text-slate-500">
          <span>{width}%</span>
          <input
            type="range"
            min="30"
            max="100"
            value={width}
            onChange={handleWidthChange}
            className="min-w-0 flex-1"
          />
        </label>
      </div>
    </NodeViewWrapper>
  );
}

export const adminImageExtension = Image.extend({
  addAttributes() {
    const parentAttributes = this.parent?.() ?? {};

    return {
      ...parentAttributes,
      key: {
        default: null,
      },
      caption: {
        default: '',
      },
      align: {
        default: 'center',
      },
      width: {
        default: 100,
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(AdminImageNodeView);
  },
});

export const adminVideoExtension = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      key: {
        default: null,
      },
      caption: {
        default: '',
      },
      align: {
        default: 'center',
      },
      width: {
        default: 100,
      },
      poster: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes: htmlAttributes }) {
    return [
      'video',
      mergeAttributes(htmlAttributes, {
        controls: true,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AdminVideoNodeView);
  },
});
