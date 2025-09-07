import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

function BlockRendererPreview(){
  const blocks = [
    { id:1, kind:'hero', order:0, data_json:{ html: '<h1>Hello</h1><p>Welcome</p>' } },
    { id:2, kind:'cta', order:1, data_json:{ html: '<p><a href="#">Subscribe</a></p>' } }
  ];
  return <div style={{maxWidth:720, margin:'0 auto'}}>
    {blocks.map(b=>(<section key={b.id} dangerouslySetInnerHTML={{__html: b.data_json.html}} />))}
  </div>;
}

const meta: Meta<typeof BlockRendererPreview> = { title: 'Pages/BlockRenderer (web)', component: BlockRendererPreview };
export default meta;
export const Preview: StoryObj<typeof BlockRendererPreview> = { args: {} };
