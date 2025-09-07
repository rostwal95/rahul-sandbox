import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

function FakeRich() { return <div style={{border:'1px solid #e5e7eb', padding:12, borderRadius:12}}>RichEditor Preview (see web app)</div> }
const meta: Meta<typeof FakeRich> = { title: 'Editors/RichEditor (web)', component: FakeRich };
export default meta;
export const Preview: StoryObj<typeof FakeRich> = { args: {} };
