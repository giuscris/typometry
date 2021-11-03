function getFontProperty(options) {
    return `${options.fontStyle} ${options.fontWeight} ${options.fontSize}px "${options.fontFamily}"`;
}

function getPixelBoundaries(context) {
    const width = context.canvas.width;
    const height = context.canvas.height;

    const pixels = context.getImageData(0, 0, width, height).data;

    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let i = 4 * (x + width * y); // Get the index of the first channel of current pixel
            let alpha = pixels[i + 3];
            if (alpha === 0) {
                continue; // Ignore transparent pixels
            }
            minX = Math.min(x, minX);
            minY = Math.min(y, minY);
            maxX = Math.max(x, maxX);
            maxY = Math.max(y, maxY);
        }
    }

    return {
        top: minY,
        bottom: maxY,
        left: minX,
        right: maxX
    };
}

function getBoundingBox(options) {
    const canvas = document.createElement('canvas');
    canvas.width = 0;
    canvas.height = 0;
    const context = canvas.getContext('2d');
    context.font = getFontProperty(options);
    context.textBaseline = 'alphabetic';
    const obj = context.measureText('');
    return  {
        top: obj.fontBoundingBoxAscent || undefined,
        bottom: -obj.fontBoundingBoxDescent || undefined
    };
}

function getLineHeight(options) {
    const p = document.createElement('p');
    Object.assign(p.style, {
        font: getFontProperty(options),
        lineHeight: 'normal',
        position: 'absolute',
        left: '-9999px',
        padding: 0,
        border: 0
    });
    p.innerHTML = 'x';
    document.body.appendChild(p);
    const rect = p.getBoundingClientRect();
    document.body.removeChild(p);
    return rect.height / options.fontSize;
}

function measureText(text, options) {
    const canvas = document.createElement('canvas');
    const height = options.fontSize * options.lineHeight * 2;
    const width = options.fontSize * (text.length + 1);

    const context = canvas.getContext('2d');
    canvas.height = height;
    canvas.width = width;
    context.font = getFontProperty(options);
    context.textBaseline = options.baseline;
    context.textAlign = 'center';
    context.fillText(text, width / 2, height / 2);

    return {baseline: height / 2, ...getPixelBoundaries(context)};
}

function measureFont(options) {
    const bbox = getBoundingBox(options);
    const lineHeight = getLineHeight(options);

    const x = measureText('x', {...options, lineHeight, baseline: 'alphabetic'});
    const d = measureText('d', {...options, lineHeight, baseline: 'alphabetic'});
    const p = measureText('p', {...options, lineHeight, baseline: 'alphabetic'});
    const H = measureText('H', {...options, lineHeight, baseline: 'alphabetic'});
    const i = measureText('i', {...options, lineHeight, baseline: 'alphabetic'});

    const fig = measureText('1', {...options, lineHeight, baseline: 'alphabetic'});

    const top = measureText('x', {...options, lineHeight, baseline: 'top'});
    const btm = measureText('x', {...options, lineHeight, baseline: 'bottom'});

    return {
        baseline: 0,
        ascent: (x.baseline - d.top) / options.fontSize,
        descent: (x.baseline - p.bottom) / options.fontSize,
        xHeight: (x.baseline - x.top) / options.fontSize,
        capHeight: (H.baseline - H.top) / options.fontSize,
        figHeight: (fig.baseline - fig.top) / options.fontSize,
        tittleHeight: (x.baseline - i.top) / options.fontSize,
        emTop: (top.bottom - x.bottom) / options.fontSize,
        emBottom: (btm.bottom - x.bottom) / options.fontSize,
        emMiddle: ((top.bottom + btm.bottom) / 2 - x.bottom) / options.fontSize,
        emHeight: (top.bottom - btm.bottom) / options.fontSize,
        bboxTop: bbox.top / options.fontSize || undefined,
        bboxBottom: bbox.bottom / options.fontSize || undefined,
        bboxHeight: (bbox.top - bbox.bottom) / options.fontSize || undefined,
        lineHeight
    };
}

export { measureFont, measureText };