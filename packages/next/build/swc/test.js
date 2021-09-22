/* eslint-disable */
const { transform } = require('../../dist/build/swc')
const { transform: trnsfrm } = require('@babel/core')

const swc = async (code) => {
  let output = await transform(code, {
    jsc: { parser: { dynamicImport: true, jsx: true } },
  })
  return output.code
}
const trim = (s) => s.join('\n').trim().replace(/^\s+/gm, '')

const babel = (code, esm = false, presetOptions = {}, filename = 'noop.js') =>
  trnsfrm(code, {
    filename,
    plugins: ['@babel/plugin-syntax-jsx', 'styled-jsx/babel'],
    babelrc: false,
    configFile: false,
    sourceType: 'module',
    compact: true,
    caller: {
      name: 'tests',
      supportsStaticESM: true,
      isDev: false,
    },
  }).code

async function testSwc() {
  try {
    const output = await swc(
      trim`
      import React from 'react';

    const Component = ({
    }) => {
      return (
        <div>
          <style jsx>{\`
            @media only screen and (max-device-width: 780px) and (-webkit-min-device-pixel-ratio: 0) {
              button {
                \${inputSize ? 'height: calc(2 * var(--gap)) !important;' : ''}
              }
            }
          \`}</style>
        </div>
      );
    };
      `
    )
    console.log(output)
  } catch (err) {
    console.log('CAUGHT ERROR')
    if (!err.message.includes('Handled next-swc transform error')) {
      throw err
    }
  }
}

async function testBabel() {
  const output = await babel(
    trim`
    import React from 'react';

    const Component = ({
    }) => {
      return (
        <div>
          <style jsx>{\`
            @media only screen and (max-device-width: 780px) and (-webkit-min-device-pixel-ratio: 0) {
              button {
                \${inputSize ? 'height: calc(2 * var(--gap)) !important;' : ''}
              }
            }
          \`}</style>
        </div>
      );
    };
    `
  )
  console.log(output)
}

testSwc()
