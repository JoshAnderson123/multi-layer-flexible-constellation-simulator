import { CANVAS_WIDTH, CANVAS_HEIGHT, GRAPH_WIDTH, GRAPH_HEIGHT, CP_TOP, CP_RIGHT, CP_BOTTOM, CP_LEFT } from '../config'
import { calcBoundaries } from './architectures';
import { findxFlex, findxTrad } from './utilGeneral';

export function drawArchTradespace(inputs, results, params) { //tradespace, inputs, xTrad, xFlexS, xFlexM

  const tradespace = results.tradespace
  const boundaries = calcBoundaries(tradespace)
  const c = document.getElementById("main-canvas");
  const ctx = c.getContext("2d");

  const xTrad = findxTrad(params, results)
  const xFlexS = findxFlex(params, results, 'single')
  const xFlexM = findxFlex(params, results, 'multi')

  drawGraphBackground(ctx, c);

  ////-- Datapoints --////
  drawArchitectures(ctx, tradespace, boundaries, { opacity: 0.35, radius: 1.5 });
  drawCap(ctx, inputs.capMax, boundaries);
  drawCap(ctx, inputs.start, boundaries);
  drawFamilyLines(ctx, tradespace, inputs, boundaries, { opacity: 1, lineWidth: 2 });
  drawXFlex(ctx, tradespace, xFlexS, boundaries, { lineWidth: 2, radius: 2.5, color: 'rgba(0,0,0,1)' })
  drawXFlex(ctx, tradespace, xFlexM, boundaries, { lineWidth: 2, radius: 2.5, color: 'rgba(0,0,255,1)' })
  drawXTrad(ctx, xTrad, boundaries, { radius: 7 })

  ////-- Labelling --////
  drawAxis(ctx);
  drawTicks(ctx, boundaries)
  drawLabels(ctx, ['Capacity (Channels)', 0, 0], ['ELCC ($K)', -10, 0]);
}


function drawCap(ctx, capMax, boundaries) {
  ctx.strokeStyle = 'rgba(0,100,255,1)';
  ctx.lineWidth = 1;
  const { x, y } = calcPositions({ cap: capMax, LCC: boundaries.minCost }, boundaries);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, 0);
  ctx.stroke();
}


function drawGraphBackground(ctx, c) {
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = `rgba(255,255,255,0.4)`;
  ctx.fillRect(CP_LEFT, 0, GRAPH_WIDTH + CP_RIGHT, GRAPH_HEIGHT);
}


function drawArchitectures(ctx, tradespace, boundaries, config) {
  ctx.fillStyle = `rgba(0,0,0,${config.opacity})`;
  for (let fam of tradespace) {
    let radius = config.radius;
    for (let cfg of fam.cfgs) {
      const { x, y } = calcPositions(cfg, boundaries);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}


function drawFamilyLines(ctx, tradespace, inputs, boundaries, config) {
  ctx.lineWidth = config.lineWidth;
  for (let fam of tradespace) {
    //// Default Family Colouring
    // ctx.strokeStyle = `rgba(${randRGB()},128,${randRGB()},${config.opacity})`;
    ctx.strokeStyle = `rgba(128, 128, 128,0.5)`
    const arcStart = fam.cfgs[0]
    const arcEnd = fam.cfgs[fam.cfgs.length-1]
    if (arcStart.cap < inputs.start || arcEnd.cap < inputs.capMax) ctx.strokeStyle = `rgba(255, 128, 128,0.5)`

    //// Segmentng Colouring
    // ctx.strokeStyle = `rgba(0,0,0,0.5)`;
    // if (fam.D < 3) ctx.strokeStyle = `rgba(255,0,0,0.5)`;
    // if (fam.D >= 3) ctx.strokeStyle = `rgba(0,0,255,0.5)`;

    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let cfg of fam.cfgs) {
      const { x, y } = calcPositions(cfg, boundaries);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

// eslint-disable-next-line
function highlightFamily(tradespace, ctx, boundaries) {
  for (let fam of tradespace) {
    if (fam.D === 2 && fam.P === 1400 && fam.I === 'Ring' && fam.f === 13.5) {

      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let cfg of fam.cfgs) {
        const { x, y } = calcPositions(cfg, boundaries);
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = `rgba(0,0,0,1)`;
      for (let cfg of fam.cfgs) {
        const { x, y } = calcPositions(cfg, boundaries);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}


function drawAxis(ctx) {
  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.lineWidth = 1;
  //// X
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_HEIGHT - CP_BOTTOM);
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - CP_BOTTOM);
  ctx.stroke();
  //// Y
  ctx.beginPath();
  ctx.moveTo(CP_LEFT, 0);
  ctx.lineTo(CP_LEFT, CANVAS_HEIGHT);
  ctx.stroke();
}


function drawTicks(ctx, boundaries) {
  //// Draw Ticks
  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.fillStyle = `rgba(0,0,0,1)`;
  ctx.lineWidth = 4;
  const lineLen = 6;
  ctx.font = "20px Arial";
  //// X
  for (let point of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9]) {
    if (point < boundaries.minCap || point > boundaries.maxCap) continue
    const { x, y } = calcPositions({ cap: point, LCC: boundaries.minCost }, boundaries)
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + lineLen);
    ctx.stroke();
    ctx.fillText(point.toExponential(), x - 24, y + 30);
  }
  //// Y
  for (let point of [1e1, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9]) {
    if (point < boundaries.minCost || point > boundaries.maxCost) continue
    const { x, y } = calcPositions({ cap: boundaries.minCap, LCC: point }, boundaries)
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - lineLen, y);
    ctx.stroke();
    ctx.fillText(point.toExponential(), x - 60, y + 6);
  }
}


function drawLabels(ctx, xLabel, yLabel) {
  ctx.fillStyle = `rgba(0,0,0,1)`;
  ctx.font = "20px Arial";
  //// X Label
  ctx.fillText(xLabel[0], CP_LEFT + (GRAPH_WIDTH / 2) - 60 + xLabel[1], CANVAS_HEIGHT - 25 + xLabel[2]);
  //// Y Label
  ctx.fillText(yLabel[0], 60 + yLabel[1], CANVAS_HEIGHT / 2 - 40 + yLabel[2]);
}

// eslint-disable-next-line
function drawXTrad(ctx, xTrad, boundaries, config) {
  const { x, y } = calcPositions(xTrad, boundaries)
  ctx.fillStyle = `rgba(0,0,0,1)`;
  ctx.beginPath();
  ctx.arc(x, y, config.radius, 0, Math.PI * 2);
  ctx.fill();
}

// eslint-disable-next-line
function drawXFlex(ctx, tradespace, xFlex, boundaries, config) {

  const cfgs = tradespace.find(f =>
     f.D === xFlex.D &&
     f.P === xFlex.P &&
     f.f === xFlex.f &&
     f.I === xFlex.I
     ).cfgs

  ctx.strokeStyle = config.color;
  ctx.lineWidth = config.lineWidth;
  ctx.beginPath();
  for (let cfg of cfgs) {
    const { x, y } = calcPositions(cfg, boundaries);
    ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = config.color;
  for (let cfg of cfgs) {
    const { x, y } = calcPositions(cfg, boundaries);
    ctx.beginPath();
    ctx.arc(x, y, config.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}


//// Helper Functions ////

function calcPositions(a, b) {

  const scale = log

  const sx = (scale(a.cap) - scale(b.minCap)) / (scale(b.maxCap) - scale(b.minCap))
  const sy = (scale(a.LCC) - scale(b.minCost)) / (scale(b.maxCost) - scale(b.minCost))
  const x = CP_LEFT + (sx * GRAPH_WIDTH)
  const y = CP_TOP + (GRAPH_HEIGHT - (sy * GRAPH_HEIGHT))

  return { x, y }
}

// eslint-disable-next-line
function lin(x) {
  return x
}


function log(x) {
  return Math.log10(x)
}


function randRGB() {
  return Math.floor(Math.random() * 256)
}




///////// Draw demand Scenarios /////////

export function drawDemandScenarios(simulation) {
  const c = document.getElementById("main-canvas");
  const ctx = c.getContext("2d");

  const input = simulation.inputs
  const stochScenarios = simulation.stochasticScenarios
  const detScenario = simulation.deterministicScenario

  // console.log(stochScenarios)

  const SCALE_FACTOR = 1

  const xpad = 0 // Left Padding
  const xspace = (GRAPH_WIDTH - (xpad * 2)) / input.steps
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = `#ccc`;
  ctx.fillRect(CP_LEFT, CP_TOP, GRAPH_WIDTH, GRAPH_HEIGHT);

  ctx.strokeStyle = 'rgba(160, 0, 0, 0.05)'
  ctx.lineWidth = 3;

  for (let i = 0; i < input.numScenarios; i++) {
    ctx.beginPath();
    ctx.moveTo(CP_LEFT, CP_TOP + (GRAPH_HEIGHT - (stochScenarios[i][0] / (input.start / SCALE_FACTOR))));
    for (let s = 1; s <= input.steps; s++) {
      ctx.lineTo(CP_LEFT + s * xspace, CP_TOP + (GRAPH_HEIGHT - (stochScenarios[i][s] / (input.start / SCALE_FACTOR))));
    }
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.strokeStyle = "#FF0000";
  ctx.lineWidth = 3;
  ctx.moveTo(CP_LEFT, CP_TOP + (GRAPH_HEIGHT - (detScenario[0] / (input.start / SCALE_FACTOR))));
  for (let s = 1; s <= input.steps; s++) {
    ctx.lineTo(CP_LEFT + s * xspace, CP_TOP + (GRAPH_HEIGHT - (detScenario[s] / (input.start / SCALE_FACTOR))));
  }
  ctx.stroke();

  drawAxis(ctx);
  drawLabels(ctx, ['Year', 0, 0], ['Demand', -25, 0]);
  drawTickD(ctx, input, SCALE_FACTOR)
}


function drawTickD(ctx, inputs, SCALE_FACTOR) {
  // Draw Ticks
  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.fillStyle = `rgba(0,0,0,1)`;
  ctx.lineWidth = 4;
  const lineLen = 6;
  ctx.font = "20px Arial";

  const startYear = 2021

  // X
  for (let t = 0; t < inputs.T + 1; t++) {
    const x = CP_LEFT + ((GRAPH_WIDTH / inputs.T) * t)
    const y = CP_TOP + GRAPH_HEIGHT
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + lineLen);
    ctx.stroke();
    ctx.fillText(t + startYear, x - 24, y + 30);
  }
  // Y
  for (let point of [5e6, 10e6, 15e6, 20e6, 25e6, 30e6, 35e6, 40e6, 45e6, 50e6]) {
    const x = CP_LEFT
    const y = CP_TOP + (GRAPH_HEIGHT - (point / (inputs.start / SCALE_FACTOR)))
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - lineLen, y);
    ctx.stroke();
    ctx.fillText(`${point / 1e6}M`, x - 60, y + 6);
  }
}
