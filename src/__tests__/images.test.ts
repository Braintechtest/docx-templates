/* eslint-env jest */

import path from 'path';
import fs from 'fs';
import { createReport } from '../index';
import { Image } from '../types';

it('001: Issue #61 Correctly renders an SVG image', async () => {
  const template = await fs.promises.readFile(
    path.join(__dirname, 'fixtures', 'imagesSVG.docx')
  );

  // Use a random png file as a thumbnail
  const thumbnail: Image = {
    data: await fs.promises.readFile(
      path.join(__dirname, 'fixtures', 'sample.png')
    ),
    extension: '.png',
  };

  const opts = {
    template,
    data: {},
    additionalJsContext: {
      svgImgFile: async () => {
        const data = await fs.promises.readFile(
          path.join(__dirname, 'fixtures', 'sample.svg')
        );
        return {
          width: 6,
          height: 6,
          data,
          extension: '.svg',
          thumbnail,
        };
      },
      svgImgStr: () => {
        const data = Buffer.from(
          `<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                  <rect x="10" y="10" height="100" width="100" style="stroke:#ff0000; fill: #0000ff"/>
                              </svg>`,
          'utf-8'
        );
        return {
          width: 6,
          height: 6,
          data,
          extension: '.svg',
          thumbnail,
        };
      },
    },
  };

  const result = await createReport(opts, 'JS');
  expect(result).toMatchSnapshot();
});

it('002: throws when thumbnail is incorrectly provided when inserting an SVG', async () => {
  const template = await fs.promises.readFile(
    path.join(__dirname, 'fixtures', 'imagesSVG.docx')
  );
  const thumbnail = {
    data: await fs.promises.readFile(
      path.join(__dirname, 'fixtures', 'sample.png')
    ),
    // extension: '.png', extension is not given
  };

  const opts = {
    template,
    data: {},
    additionalJsContext: {
      svgImgFile: async () => {
        const data = await fs.promises.readFile(
          path.join(__dirname, 'fixtures', 'sample.svg')
        );
        return {
          width: 6,
          height: 6,
          data,
          extension: '.svg',
          thumbnail,
        };
      },
      svgImgStr: () => {
        const data = Buffer.from(
          `<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                  <rect x="10" y="10" height="100" width="100" style="stroke:#ff0000; fill: #0000ff"/>
                              </svg>`,
          'utf-8'
        );
        return {
          width: 6,
          height: 6,
          data,
          extension: '.svg',
          thumbnail,
        };
      },
    },
  };

  return expect(createReport(opts)).rejects.toMatchSnapshot();
});

it('003: can inject an svg without a thumbnail', async () => {
  const template = await fs.promises.readFile(
    path.join(__dirname, 'fixtures', 'imagesSVG.docx')
  );

  const opts = {
    template,
    data: {},
    additionalJsContext: {
      svgImgFile: async () => {
        const data = await fs.promises.readFile(
          path.join(__dirname, 'fixtures', 'sample.svg')
        );
        return {
          width: 6,
          height: 6,
          data,
          extension: '.svg',
        };
      },
      svgImgStr: () => {
        const data = Buffer.from(
          `<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                  <rect x="10" y="10" height="100" width="100" style="stroke:#ff0000; fill: #0000ff"/>
                              </svg>`,
          'utf-8'
        );
        return {
          width: 6,
          height: 6,
          data,
          extension: '.svg',
        };
      },
    },
  };
  const result = await createReport(opts, 'JS');
  expect(result).toMatchSnapshot();
});

it('004: can inject an image in the document header (regression test for #113)', async () => {
  const template = await fs.promises.readFile(
    path.join(__dirname, 'fixtures', 'imageHeader.docx')
  );

  const opts = {
    template,
    data: {},
    additionalJsContext: {
      image: async () => {
        const data = await fs.promises.readFile(
          path.join(__dirname, 'fixtures', 'sample.png')
        );
        return {
          width: 6,
          height: 6,
          data,
          extension: '.png',
        };
      },
    },
  };

  // NOTE: bug does not happen when using debug probe arguments ('JS' or 'XML'),
  // as these exit before the headers are parsed.
  // TODO: build a snapshot test once _probe === 'XML' properly includes all document XMLs, not just
  // the main document
  return expect(createReport(opts)).resolves.toBeInstanceOf(Uint8Array);
});

it('005: IMAGE in FOR loop bug', async () => {
  // Repro case for https://github.com/guigrpa/docx-templates/issues/128
  const template = await fs.promises.readFile(
    path.join(__dirname, 'fixtures', 'imageInForLoop.docx')
  );

  // TODO: removeme
  await fs.promises.writeFile(
    'test.docx',
    await createReport({
      template,
      data: {
        companies: ['a', 'b'],
      },
    })
  );
});
