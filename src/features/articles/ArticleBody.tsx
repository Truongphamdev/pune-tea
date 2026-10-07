import Image from 'next/image';
import Link from 'next/link';
import type { ArticleBlock, ArticleInline } from '@/data/types';

function Inline({ part }: { part: ArticleInline }) {
  if (typeof part === 'string') return <>{part}</>;

  return (
    <Link href={part.href} className="font-semibold text-accent underline underline-offset-2">
      {part.text}
    </Link>
  );
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case 'heading':
      return block.level === 2 ? (
        <h2 className="mt-6 text-2xl font-bold text-brand-700">{block.text}</h2>
      ) : (
        <h3 className="mt-2 text-lg font-bold">{block.text}</h3>
      );
    case 'paragraph':
      return (
        <p className="leading-relaxed">
          {block.content.map((part, index) => (
            <Inline key={index} part={part} />
          ))}
        </p>
      );
    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag
          className={`flex flex-col gap-1.5 ps-6 leading-relaxed ${block.ordered ? 'list-decimal' : 'list-disc'}`}
        >
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ListTag>
      );
    }
    case 'image':
      return (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-card bg-raised">
          <Image
            src={block.src}
            alt={block.alt}
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover"
          />
        </div>
      );
  }
}

/**
 * Thân bài viết — dựng từ mảng khối có kiểu, không có HTML thô nào đi qua đây (NFR-05).
 */
export function ArticleBody({ blocks }: { blocks: readonly ArticleBlock[] }) {
  return (
    <div className="flex flex-col gap-4 text-base">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}
