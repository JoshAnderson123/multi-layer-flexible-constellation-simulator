//// SIMULATOR ////

export const CANVAS_WIDTH = 1400;
export const CANVAS_HEIGHT = 800;
export const CP_TOP = 0;
export const CP_RIGHT = 0; //40;
export const CP_BOTTOM = 100;
export const CP_LEFT = 200;
export const GRAPH_WIDTH = CANVAS_WIDTH - (CP_LEFT + CP_RIGHT);
export const GRAPH_HEIGHT = CANVAS_HEIGHT - (CP_TOP + CP_BOTTOM);

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
    Ld: '0'
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






//// VISUALISER ////

// Earth
export const SCALE_FACTOR = 1000;
export const EARTH_RADIUS = 6371;
export const EARTH_RADIUS_SCALED = EARTH_RADIUS / SCALE_FACTOR;
export const OVERLAPPING_FOOTPRINT_FACTOR = 2 / (3 ** 0.5);
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
// 2/root3 will achieve full coverage, 1 will make radius just touch

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

export const constellationTest1 = {
  name: "Test Constellation",
  data: [
    { planes: 6, satellitesPerPlane: 12, MEA: 25, altitude: 500, inclination: 54, color: "#ff0000" },
    { planes: 4, satellitesPerPlane: 6, MEA: 25, altitude: 1500, inclination: 55, color: "#00ff00" }
  ]
}

export const constellationTest2 = {
  name: "Test Constellation 2",
  data: [
    { planes: 2, satellitesPerPlane: 100, MEA: 25, altitude: 1000, inclination: 55, color: "#ff00ff" }
  ]
}

export const constellationTest3 = {
  name: "Test Constellation 3",
  data: [
    { planes: 20, satellitesPerPlane: 20, MEA: 20, altitude: 500, inclination: 86.4, color: "#ff0000", halfRotation: true, spacingType: "cross" }
  ]
}

export const constellationTest4 = {
  name: "Test Constellation 4",
  data: [
    { planes: 1, satellitesPerPlane: 3, MEA: 20, altitude: 35786, inclination: 45, color: "#00ff00" }
  ]
}

export const constellationSoC = {
  name: "Street of Coverage",
  data: [
    { planes: 18, satellitesPerPlane: 36, MEA: 30, altitude: 550, inclination: 85, color: "#ff3333", halfRotation: true, spacingType: "cross" } //FC7671
  ]
}

export const constellationWalker = {
  name: "Walker",
  data: [
    { planes: 20, satellitesPerPlane: 40, MEA: 40, altitude: 550, inclination: 40, color: "#00eeee", spacingType: "drift" }
  ]
}

export const constellationGPS = {
  name: "GPS",
  data: [
    { planes: 6, satellitesPerPlane: 6, MEA: 25, altitude: 20200, inclination: 55, color: "#00ffff" }
  ]
}

export const constellationStarlink = {
  name: "Starlink (SpaceX) Full",
  data: [
    { planes: 42, satellitesPerPlane: 61, MEA: 40, altitude: 346, inclination: 53, color: "#00ff00", spacingType: "drift" },
    { planes: 42, satellitesPerPlane: 59, MEA: 25, altitude: 341, inclination: 48, color: "#00ff00", spacingType: "drift" },
    { planes: 42, satellitesPerPlane: 59, MEA: 25, altitude: 336, inclination: 42, color: "#00ff00", spacingType: "drift" },
    { planes: 24, satellitesPerPlane: 66, MEA: 40, altitude: 550, inclination: 53, color: "#ffffff", spacingType: "drift" },
    { planes: 32, satellitesPerPlane: 50, MEA: 25, altitude: 1100, inclination: 54, color: "#00ffff", spacingType: "drift" },
    { planes: 16, satellitesPerPlane: 25, MEA: 25, altitude: 1130, inclination: 74, color: "#00ffff", spacingType: "drift" },
    { planes: 10, satellitesPerPlane: 37, MEA: 25, altitude: 1275, inclination: 81, color: "#00ffff", spacingType: "drift" },
    { planes: 12, satellitesPerPlane: 38, MEA: 25, altitude: 1325, inclination: 70, color: "#00ffff", spacingType: "drift" }
  ]
}

export const constellationStarlinkPhase1 = {
  name: "Starlink (SpaceX) Phase 1",
  data: [
    { planes: 24, satellitesPerPlane: 66, MEA: 40, altitude: 550, inclination: 53, color: "#ffffff", spacingType: "drift" }
  ]
}

export const constellationIridium = {
  name: "Iridium",
  data: [
    { planes: 6, satellitesPerPlane: 11, MEA: 8, altitude: 781, inclination: 86.4, color: "#f7d600", halfRotation: true, spacingType: "cross" }
  ]
}

export const constellationOneWeb = {
  name: "OneWeb",
  data: [
    { planes: 18, satellitesPerPlane: 36, MEA: 50, altitude: 1200, inclination: 85, color: "#FC7671", halfRotation: true, spacingType: "cross" } //FC7671
  ]
}

export const constellationKuiper = {
  name: "Kuiper (Amazon)",
  data: [
    { planes: 34, satellitesPerPlane: 34, MEA: 45, altitude: 630, inclination: 51.9, color: "#ff6a00", spacingType: "drift" },
    { planes: 36, satellitesPerPlane: 36, MEA: 45, altitude: 610, inclination: 42, color: "#FF9900", spacingType: "drift" },
    { planes: 28, satellitesPerPlane: 28, MEA: 45, altitude: 590, inclination: 33, color: "#ffc800", spacingType: "drift" }
  ]
}


export const recon1 = {
  name: "Recon1",
  data: [{ planes: 8, satellitesPerPlane: 16, MEA: 30, altitude: 1400, inclination: 85, color: "#00e83a", halfRotation: true, spacingType: "cross" }]
}

export const recon2 = {
  name: "Recon2",
  data: [{ planes: 15, satellitesPerPlane: 30, MEA: 40, altitude: 900, inclination: 85, color: "#00e83a", halfRotation: true, spacingType: "cross" }]
}

export const recon3 = {
  name: "Recon3",
  data: [{ planes: 30, satellitesPerPlane: 50, MEA: 50, altitude: 600, inclination: 85, color: "#00e83a", halfRotation: true, spacingType: "cross" }]
}

export const add1 = {
  name: "Add1",
  data: [{ planes: 8, satellitesPerPlane: 16, MEA: 30, altitude: 1400, inclination: 85, color: "#cc1fff", halfRotation: true, spacingType: "cross" }]
}

export const add2 = {
  name: "Add2",
  data: [
    { planes: 8, satellitesPerPlane: 16, MEA: 30, altitude: 1400, inclination: 85, color: "#cc1fff", halfRotation: true, spacingType: "cross" },
    { planes: 15, satellitesPerPlane: 30, MEA: 40, altitude: 900, inclination: 85, color: "#e8008b", halfRotation: true, spacingType: "cross" }
  ]
}

export const add3 = {
  name: "Add3",
  data: [
    { planes: 8, satellitesPerPlane: 16, MEA: 30, altitude: 1400, inclination: 85, color: "#cc1fff", halfRotation: true, spacingType: "cross" },
    { planes: 15, satellitesPerPlane: 30, MEA: 40, altitude: 900, inclination: 85, color: "#e8008b", halfRotation: true, spacingType: "cross" },
    { planes: 30, satellitesPerPlane: 50, MEA: 50, altitude: 600, inclination: 85, color: "#e80000", halfRotation: true, spacingType: "cross" }
  ]
}


// export const constellationInventory = [
//   recon1,
//   recon2,
//   recon3,
//   add1,
//   add2,
//   add3
// ]

export const constellationInventory = [
  constellationOneWeb,
  constellationIridium,
  constellationKuiper,
  constellationStarlinkPhase1,
  constellationStarlink,
  constellationGPS,
]

// export const constellationInventory = [
//   constellationWalker,
//   constellationSoC,
// ]