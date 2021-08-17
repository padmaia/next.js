const { transform } = require('../../dist/build/swc')
const { transform: trnsfrm } = require('@babel/core')

const swc = async (code) => {
  let output = await transform(code, {
    jsc: { parser: { dynamicImport: true }, target: 'es3' },
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
    console.log('HMM')
    const output = await swc(
      trim`
      var x = [
        'x',
      ]
      `
    )
    console.log(output)
  } catch (err) {
    throw err
  }
}

async function testBabel() {
  const output = await babel(
    trim`
    <div>
      <div className="hmm">
        <p>only this paragraph will get the style :)</p>
        <div>
          <p>shouldn't have styling</p>
          <div>
            <p>how deep does it go</p>
          </div>
          
        </div>
        <p>I don't know</p>

        <style jsx>{\`
      p {
        color: red;
      }
    \`}</style>

      </div>
    </div>
    `
  )
  console.log(output)
}

testSwc()
