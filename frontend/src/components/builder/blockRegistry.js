import HeroBlock from '../blocks/hero/HeroBlock';
import HeroEditor from '../blocks/hero/HeroEditor';

import SectionBlock from '../blocks/section/SectionBlock';
import SectionEditor from '../blocks/section/SectionEditor';

import HeadingBlock from '../blocks/heading/HeadingBlock';
import HeadingEditor from '../blocks/heading/HeadingEditor';

import TextBlock from '../blocks/text/TextBlock';
import TextEditor from '../blocks/text/TextEditor';

import QuoteBlock from '../blocks/quote/QuoteBlock';
import QuoteEditor from '../blocks/quote/QuoteEditor';

import CodeBlock from '../blocks/code/CodeBlock';
import CodeEditor from '../blocks/code/CodeEditor';

import ButtonBlock from '../blocks/button/ButtonBlock';
import ButtonEditor from '../blocks/button/ButtonEditor';

export const BLOCKS = {
  hero: { Render: HeroBlock, Editor: HeroEditor },
  section: { Render: SectionBlock, Editor: SectionEditor },
  heading: { Render: HeadingBlock, Editor: HeadingEditor },
  text: { Render: TextBlock, Editor: TextEditor },
  quote: { Render: QuoteBlock, Editor: QuoteEditor },
  code: { Render: CodeBlock, Editor: CodeEditor },
  button: { Render: ButtonBlock, Editor: ButtonEditor },
};
