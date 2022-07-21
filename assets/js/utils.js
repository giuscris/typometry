const serifWidth = getFontWidth('serif');
const sansWidth = getFontWidth('sans-serif');

function quoteFontFamily(fontFamily) {
    return fontFamily.match(/[^a-z\-]/i) ? `"${fontFamily}"` : fontFamily;
}

function getFontWidth(font) {
    const p = document.createElement('p');
    Object.assign(p.style, {
        font: `normal 400 16px ${font}`,
        position: 'absolute',
        left: '-9999px',
        padding: 0,
        border: 0
    });
    p.innerHTML = 'ÁIl1Fdgpxi';
    document.body.appendChild(p);
    const rect = p.getBoundingClientRect();
    document.body.removeChild(p);
    return rect.width;
}

function detectFont(fontFamily) {
    const fontWidth1 = getFontWidth(`${quoteFontFamily(fontFamily)}, serif`);
    const fontWidth2 = getFontWidth(`${quoteFontFamily(fontFamily)}, sans-serif`);
    return fontWidth1 !== serifWidth || fontWidth2 !== sansWidth;
}

function getTestCanvas(options) {
    const canvas = document.createElement('canvas');
    const height = 300;
    const width = 200;

    const context = canvas.getContext('2d');
    canvas.height = height;
    canvas.width = width;
    context.font = `${options.fontStyle} ${options.fontWeight} 100px ${quoteFontFamily(options.fontFamily)}`;
    context.textBaseline = 'alphabetic';
    context.textAlign = 'center';
    context.fillText('x', 150, 100);

    return context;
}

function sameCanvas(context1, context2) {
    const data1 = context1.getImageData(0, 0, 200, 300).data;
    const data2 = context2.getImageData(0, 0, 200, 300).data;

    for (let i = 0; i < data1.length; i++) {
        if (data1[i] !== data2[i]) {
            return false;
        }
    }

    return true;
}

function detectFontWeights(options) {
    const lighterWeights = [100, 200, 300, 400];
    const heavierWeights = [400, 500, 600, 700, 800, 900];

    const weights = [];

    const canvases = {
        100: getTestCanvas({fontFamily: options.fontFamily, fontStyle: options.fontStyle, fontWeight: 100}),
        200: getTestCanvas({fontFamily: options.fontFamily, fontStyle: options.fontStyle, fontWeight: 200}),
        300: getTestCanvas({fontFamily: options.fontFamily, fontStyle: options.fontStyle, fontWeight: 300}),
        400: getTestCanvas({fontFamily: options.fontFamily, fontStyle: options.fontStyle, fontWeight: 400}),
        500: getTestCanvas({fontFamily: options.fontFamily, fontStyle: options.fontStyle, fontWeight: 500}),
        600: getTestCanvas({fontFamily: options.fontFamily, fontStyle: options.fontStyle, fontWeight: 600}),
        700: getTestCanvas({fontFamily: options.fontFamily, fontStyle: options.fontStyle, fontWeight: 700}),
        800: getTestCanvas({fontFamily: options.fontFamily, fontStyle: options.fontStyle, fontWeight: 800}),
        900: getTestCanvas({fontFamily: options.fontFamily, fontStyle: options.fontStyle, fontWeight: 900})
    };

    for (let i = 0; i < lighterWeights.length - 1; i++) {
        if (!sameCanvas(canvases[lighterWeights[i]], canvases[lighterWeights[i + 1]])) {
            weights.push(lighterWeights[i]);
        }
    }

    weights.push(400);

    for (let i = 0; i < heavierWeights.length - 1; i++) {
        if (!sameCanvas(canvases[heavierWeights[i]], canvases[heavierWeights[i + 1]])) {
            weights.push(heavierWeights[i + 1]);
        }
    }

    return weights;
}

export { quoteFontFamily, detectFont, detectFontWeights };
