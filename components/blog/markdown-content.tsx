'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

export function MarkdownContent({ content, className }: { content: string; className?: string }) {
  return (
    <div
      className={cn(
        'max-w-none text-gray-700 [&_p]:mb-4 [&_p]:leading-7 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-[#163300] [&_a]:underline [&_strong]:font-semibold [&_strong]:text-gray-900',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ node, ...props }) => (
            <h2 id={slugify(props.children?.toString() ?? '')} className="scroll-mt-24 mt-8 border-b border-gray-100 pb-2 text-xl font-semibold text-[#163300]" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 id={slugify(props.children?.toString() ?? '')} className="mt-6 text-lg font-semibold text-[#163300]" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}
