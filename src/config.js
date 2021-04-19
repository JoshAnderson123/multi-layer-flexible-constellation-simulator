export const CANVAS_WIDTH = 1400;
export const CANVAS_HEIGHT = 800;
export const CP_TOP = 0;
export const CP_RIGHT = 0; //40;
export const CP_BOTTOM = 100;
export const CP_LEFT = 200;
export const GRAPH_WIDTH = CANVAS_WIDTH - (CP_LEFT + CP_RIGHT);
export const GRAPH_HEIGHT = CANVAS_HEIGHT - (CP_TOP + CP_BOTTOM);

export const SCALE_FACTOR = 1000;
export const EARTH_RADIUS = 6371;
export const EARTH_RADIUS_SCALED = EARTH_RADIUS / SCALE_FACTOR;
export const OVERLAPPING_FOOTPRINT_FACTOR = 2 / (3 ** 0.5);

export const defaultInputs = {
  scenario: {
    r: '0|0.1|0.5',  // '0.1|0.1|0.6'
    rec: '0.2,0.5', // '0.05|0.05|0.5'
    σ: '0.2', // '0.1|0.1|0.5'
    S: '10'
  },
  strategy: {
    J: '1.5|0.5|5', // 1.5,2,5,10
    Lm: '2|1|5', // 2|1|4
    Ld: '0' // 0|0.5|1
  },
  architecture: {
    D: '2|0.5|4',
    P: '200|400|2200',
    f: '15,50',
    I: 'None,Mesh,Ring',
    a: '400|50|1600',
    e: '15|15|60',
  }
}

export const formatParam = {
  r: 'Discount Rate',
  rec: 'Reconfig Cost',
  σ: 'Volatility',
  S: 'Num Scenarios',
  J: 'Capacity Jump',
  Lm: 'Max Layers',
  Ld: 'Layer Deployment',
  D: 'Antenna Diameter',
  P: 'Transmitter Power',
  f: 'Transmitter Frequency',
  I: 'Inter Satellite Links',
  a: 'Altitude',
  e: 'Min.Elev.Angle',
}

export const invertParam = Object.keys(formatParam).reduce((ip, param) => ({...ip, [formatParam[param]]: param }), {})

export const outputOptions = [
  'xTrad.LCC',
  'flexS.ELCC',
  'flexS.avgR',
  'flexM.ELCC',
  'flexM.avgN',
  'flexM.avgR',
  'flexM.avgR + flexM.avgN',
  'flexS.ELCC / xTrad.LCC',
  'flexM.ELCC / xTrad.LCC',
  'flexM.ELCC / flexS.ELCC',
  'flexM.avgR / flexS.avgR'
]

export const inputOptions = [
  formatParam['r'],
  formatParam['rec'],
  formatParam['σ'],
  formatParam['J'],
  formatParam['Lm'],
  formatParam['Ld'],
  // formatParam['D'],    // These have to be removed because it's not guarenteed that this family will be xFlex
  // formatParam['P'],
  // formatParam['f'],
  // formatParam['I'],
]

export const cBad = '#ff8888'
export const cGood = '#88ff88'