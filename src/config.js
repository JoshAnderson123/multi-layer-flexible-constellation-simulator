//// GENERAL ////

export const defaultInputs_2 = {
  scenario: {
    r: '0|0.05|0.55',  // '0.1|0.1|0.6'
    rec: '0|0.05|0.5', // '0.2,0.5
    σ: '0.2', // '0.1|0.1|0.5'
    S: '1'
  },
  strategy: {
    J: '1.25|0.25|10', // 1.5|0.5|5
    Lm: '2|1|5' // 2|1|5
  },
  architecture: {
    D: '2|0.5|4',
    P: '200|200|1200',
    f: '15,50',
    I: 'None,Mesh,Ring',
    a: '400|25|1600',
    e: '10|10|60',
  }
}

export const defaultInputs = {
  scenario: {
    r: '0|0.1|0.5',  // '0.1|0.1|0.6'
    rec: '0.2', // '0.2,0.5
    σ: '0.2', // '0.1|0.1|0.5'
    S: '10'
  },
  strategy: {
    J: '1.5', // 1.5|0.5|5
    Lm: '2', // 2|1|5
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

export const defaultInputs_3 = {
  scenario: {
    r: '0|0.05|0.5',  // '0.1|0.1|0.6'
    rec: '0|0.05|0.5', // '0.2,0.5
    σ: '0.2', // '0.1|0.1|0.5'
    S: '1'
  },
  strategy: {
    J: '1.5|0.5|5', // 1.5|0.5|5
    Lm: '2|1|5' // 2|1|5
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
  'r': 'Discount Rate',
  'rec': 'Reconfig Cost',
  'σ': 'Volatility',
  'S': 'Num Scenarios',
  'J': 'Capacity Jump',
  'Lm': 'Max Layers',
  'D': 'Antenna Diameter',
  'P': 'Transmitter Power',
  'f': 'Transmitter Frequency',
  'I': 'Inter Satellite Links',
  'a': 'Altitude',
  'e': 'Min.Elev.Angle',
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
  formatParam['Lm']
]

export const cBad = '#ff8888'
export const cGood = '#88ff88'

export const layerColors = ['00eeee', '4444ff', 'c300ff', 'ff003c', 'fc7f03']

export const defaultSim = {
  T: 10,             // Simulation time (Years)
  μ: 0.77119,    // Annual expected rate of return 
  σ: 0.2,            // Volatility 
  steps: 480,        // Steps in each scenario (480 in 10 years = 1 step/week (approx))
  start: 50000,      // Start demand
  numScenarios: 100, // Number of scenarios
  r: 0.55,           // Discount rate
  capMax: 15e6,      // Maximum capacity
  reconCost: 0.20    // Reconfiguration cost (% of production cost (per reconfiguration))
}

export const replaceStrs = new Array(20).fill(0).map((_, i) => i.toString())


//// GRAPHS ////

//// ARCTS GRAPH ////
export const CANVAS_WIDTH = 1400;
export const CANVAS_HEIGHT = 800;
export const CP_TOP = 0;
export const CP_RIGHT = 0; //40;
export const CP_BOTTOM = 100;
export const CP_LEFT = 200;
export const GRAPH_WIDTH = CANVAS_WIDTH - CP_LEFT - CP_RIGHT;
export const GRAPH_HEIGHT = CANVAS_HEIGHT - CP_TOP - CP_BOTTOM;

//// VISUALISER GRAPH ////
export const VP_TOP = 0;
export const VP_RIGHT = 0;
export const VP_BOTTOM = 70;
export const VP_LEFT = 80;



//// VISUALISER ////

// Earth
export const SCALE_FACTOR = 1000;
export const EARTH_RADIUS = 6371;
export const EARTH_RADIUS_SCALED = EARTH_RADIUS / SCALE_FACTOR;
export const OVERLAPPING_FOOTPRINT_FACTOR = 2 / (3 ** 0.5); // 2/root3 will achieve full coverage, 1 will make radius just touch
export const EARTH_ROTATION_SPEED = 0.0002
const GEOSYNC_ORBIT_RADIUS = (EARTH_RADIUS*6.61701)
export const GRAVITY_CONSTANT = 4*(EARTH_ROTATION_SPEED**2)*(GEOSYNC_ORBIT_RADIUS**3)*Math.PI

// Default Render
export const RENDER_CONES = true
export const RENDER_FOOTPRINTS = true
export const RENDER_SATELLITES = true
export const RENDER_ORBITS = true

// Orbit
export const ORBIT_RESOLUTION = 100 // Number of segments in orbit geometry

// Footprint
export const FOOTPRINT_RESOLUTION = 100 // Number of segments in footprint geometry
export const FOOTPRINT_SCALE_FACTOR = 1.002 // Cosmetic scale of footprint radius to make it visually smooth in simulator


export const render = {
  cones: RENDER_CONES,
  footprints: RENDER_FOOTPRINTS,
  satellites: RENDER_SATELLITES,
  orbits: RENDER_ORBITS,
  lighting: true,
  stars: true,
  satelliteSize: 0.065,
  orbitOpacity: 0.6 //0.35
}

