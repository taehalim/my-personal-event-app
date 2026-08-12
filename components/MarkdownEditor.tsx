'use client';

import {
  MDXEditor,
  headingsPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  contentEditableClassName?: string;
};

export default function MarkdownEditor({ value, onChange, className, contentEditableClassName }: MarkdownEditorProps) {
  return (
    <MDXEditor
      markdown={value}
      onChange={markdown => onChange(markdown)}
      className={className}
      contentEditableClassName={contentEditableClassName}
      placeholder="이벤트에서 다룰 내용과 참가자에게 필요한 안내를 적어 주세요."
      plugins={[
        headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
        listsPlugin(),
        quotePlugin(),
        linkPlugin(),
        markdownShortcutPlugin(),
      ]}
    />
  );
}
