import GithubSlugger from 'github-slugger';

import { defineDocumentType, defineNestedType, makeSource } from 'contentlayer/source-files';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import darkTheme from './src/themes/dark-theme.json';
import readingTime from 'reading-time';

/** @type {import('contentlayer/source-files').ComputedFields} */
const computedFields = {
  slug: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath
  },
  duration: {
    type: 'string',
    resolve: (doc) => readingTime(doc.body.raw).text
  },
  headings: {
    type: 'json',
    resolve: async (doc) => {
      const regXHeader = /\n(?<flag>#{1,6})\s+(?<content>.+)/g;
      const slugger = new GithubSlugger();
      return Array.from(doc.body.raw.matchAll(regXHeader)).map(({ groups }) => {
        const flag = groups?.flag;
        const content = groups?.content;
        return {
          level: flag?.length,
          content,
          id: content ? slugger.slug(content) : undefined
        };
      });
    }
  }
};

const Image = defineNestedType(() => ({
  name: 'Image',
  fields: {
    src: {
      type: 'string',
      required: true
    },
    alt: {
      type: 'string',
      required: true
    }
  }
}));

export const Blog = defineDocumentType(() => ({
  name: 'Blog',
  filePathPattern: `**/*.mdx`,
  contentType: 'mdx',
  fields: {
    draft: {
      type: 'boolean',
      default: false
    },
    title: {
      type: 'string',
      required: true
    },
    publishedAt: {
      type: 'string',
      required: true
    },
    summary: {
      type: 'string',
      required: true
    },
    image: {
      type: 'nested',
      required: true,
      of: Image
    },
    tags: {
      type: 'list',
      of: { type: 'string' },
      default: []
    },
    keywords: {
      type: 'list',
      of: { type: 'string' },
      default: []
    },
    showToc: {
      type: 'boolean',
      default: false
    }
  },
  computedFields
}));

export default makeSource({
  contentDirPath: './src/posts',
  documentTypes: [Blog],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: {
            dark: darkTheme,
            light: 'github-light'
          },
          keepBackground: false,
          onVisitLine(node) {
            // Prevent lines from collapsing in `display: grid` mode, and allow empty
            // lines to be copy/pasted
            if (node.children.length === 0) {
              node.children = [{ type: 'text', value: ' ' }];
            }
          }
        }
      ],
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ['heading-anchor']
          }
        }
      ]
    ]
  }
});
