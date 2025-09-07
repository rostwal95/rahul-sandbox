import { render } from '@react-email/components';
import React from 'react';
import WelcomeEmail from '../src/welcome.js';
const html = render(React.createElement(WelcomeEmail, { name: 'Creator' }));
console.log(html);
