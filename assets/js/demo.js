import { measureFont } from '../../typemetry.js';

const DPR = window.devicePixelRatio || 2;

const METRICS = {
    'georgia 400 normal': {
        baseline: 0,
        ascent: 0.756,
        descent: -0.216,
        xHeight: 0.482,
        capHeight: 0.693,
        figHeight: 0.54,
        tittleHeight: 0.74,
        roundOvershoot: 0.71,
        pointedOvershoot: 0.703,
        emTop: 0.778,
        emBottom: -0.222,
        emMiddle: 0.278,
        emHeight: 1,
        bboxTop: 0.917,
        bboxBottom: -0.219,
        bboxHeight: 1.136,
        lineHeight: 1.136
    }
};

const canvas = document.getElementById('canvas');
const header = document.querySelector('.header');
const controls = document.querySelector('.controls');

const inputs = controls.querySelectorAll('input, select');
const status = controls.querySelector('#status');
const fontSizeStatus = controls.querySelector('#fontSize');
const lineHeightStatus = controls.querySelector('#lineHeight');

const copyButton = controls.querySelector('#copyButton');
const copyBanner = controls.querySelector('#copyBanner');

function getOptions() {
    const options = {};
    for (const input of inputs) {
        if (input.type !== 'radio' && input.type !== 'checkbox') {
            options[input.name] = input.value;
        } else {
            options[input.name] = input.checked;
        }
    }
    return options;
}

function getMetrics(options) {
    const key = `${options.fontFamily} ${options.fontWeight} ${options.fontStyle}`.toLowerCase();
    return key in METRICS ? METRICS[key] : METRICS[key] = measureFont({...options, fontSize: 1000});
}

function getContext() {
    const context = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = Math.max(0, window.innerHeight - header.offsetHeight - controls.offsetHeight);

    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';

    canvas.width *= DPR;
    canvas.height *= DPR;

    context.scale(DPR, DPR);

    return context;
}

function drawLine(context, y, color) {
    const width = context.canvas.width / DPR;
    context.save();
    context.fillStyle = color;
    context.fillRect(0, y, width, 1);
    context.restore();
}

function round(number, decimals) {
    return +number.toFixed(decimals);
}

function render() {
    const options = getOptions();

    if (!options.fontFamily) {
        return;
    }

    const metrics = getMetrics({fontFamily: options.fontFamily, fontWeight: options.fontWeight, fontStyle: options.fontStyle});

    const context = getContext();

    const width = context.canvas.width / DPR;
    const height = context.canvas.height / DPR;

    const fontSize = Math.round(Math.min(width * 0.125, height / metrics.lineHeight * 0.5));
    const baseline = height / 2 + metrics.emMiddle * fontSize;

    context.clearRect(0, 0, width, height);

    // Draw baseline
    if (options.baseline) drawLine(context, baseline, options.baselineColor);

    // Draw ascent line
    if (options.ascent) drawLine(context, baseline - metrics.ascent * fontSize, options.ascentColor);

    // Draw descent line
    if (options.descent) drawLine(context, baseline - metrics.descent * fontSize, options.descentColor);

    // Draw x-height line
    if (options.xHeight) drawLine(context, baseline - metrics.xHeight * fontSize, options.xHeightColor);

    // Draw capital height line
    if (options.capHeight) drawLine(context, baseline - metrics.capHeight * fontSize, options.capHeightColor);

    // Draw figure height line
    if (options.figHeight) drawLine(context, baseline - metrics.figHeight * fontSize, options.figHeightColor);

    // Draw tittle line
    if (options.tittleHeight) drawLine(context, baseline - metrics.tittleHeight * fontSize, options.tittleHeightColor);

    // Draw round overshoot line
    if (options.roundOvershoot) drawLine(context, baseline - metrics.roundOvershoot * fontSize, options.roundOvershootColor);

    // Draw pointed overshoot line
    if (options.pointedOvershoot) drawLine(context, baseline - metrics.pointedOvershoot * fontSize, options.pointedOvershootColor);

    // Draw top line
    if (options.emTop) drawLine(context, baseline - metrics.emTop * fontSize, options.emTopColor);

    // Draw middle line
    if (options.emMiddle) drawLine(context, baseline - metrics.emMiddle * fontSize, options.emMiddleColor);

    // Draw bottom line
    if (options.emBottom) drawLine(context, baseline - metrics.emBottom * fontSize, options.emBottomColor);

    // Draw bbox top line
    if (options.bboxTop && metrics.bboxTop !== undefined) drawLine(context, baseline - metrics.bboxTop * fontSize, options.bboxTopColor);

    // Draw bbox bottom line
    if (options.bboxBottom && metrics.bboxBottom !== undefined) drawLine(context, baseline - metrics.bboxBottom * fontSize, options.bboxBottomColor);

    context.font = `${options.fontStyle} ${options.fontWeight} ${fontSize}px "${options.fontFamily}"`;
    context.textAlign = 'center';
    context.fillText('ÁOIl1Fdgpxi', width / 2, baseline);

    fontSizeStatus.innerHTML = `${fontSize}px`;
    lineHeightStatus.innerHTML = `${round(metrics.lineHeight * 100, 1)}%`;
    controls.querySelectorAll('.value').forEach((element) => element.innerHTML = metrics[element.getAttribute('data-of')]);
}

for (const input of inputs) {
    input.addEventListener('change', () => {
        status.innerHTML = '⏳';
        fontSizeStatus.innerHTML = '…';
        lineHeightStatus.innerHTML = '…';
        setTimeout(() => {
            render();
            status.innerHTML = '✅';
        }, 100);
    });
}

window.addEventListener('load', () => {
    render();
    status.innerHTML = '✅';
});

window.addEventListener('resize', render);

window.addEventListener('focus', render);

copyButton.addEventListener('click', () => {
    const options = getOptions();

    if (!options.fontFamily) {
        return;
    }

    const metrics = getMetrics({fontFamily: options.fontFamily, fontWeight: options.fontWeight, fontStyle: options.fontStyle});

    const text = JSON.stringify(metrics, null, 4);

    navigator.clipboard.writeText(text).then(() => {
        copyBanner.style.display = 'block';
        setTimeout(() => {
            copyBanner.style.display = 'none';
        }, 1500);
    });
});