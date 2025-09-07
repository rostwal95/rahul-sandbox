import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

function BlockRenderer({ blocks }:{ blocks:any[] }){
  return <div style={{maxWidth:720, margin:'0 auto'}}>
    {blocks.sort((a,b)=>a.order-b.order).map((b:any)=>(
      <section key={b.id} dangerouslySetInnerHTML={{__html: b.data_json.html}} />
    ))}
  </div>;
}

const meta: Meta<typeof BlockRenderer> = { title: 'Web/BlockRenderer', component: BlockRenderer };
export default meta;
export const Preview: StoryObj<typeof BlockRenderer> = {
  args: { blocks: [
    { id:1, order:0, data_json:{ html: '<h1>Hello</h1><p>Welcome</p>' } },
    { id:2, order:1, data_json:{ html: '<p><a href="#">Subscribe</a></p>' } }
  ] }
};
