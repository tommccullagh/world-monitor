// Military asset tracking service
// Uses publicly available data sources for military movements

// Known US Carrier Strike Groups and their typical deployment areas
// This data would be updated from public DOD press releases and naval tracking sites
const CARRIER_STRIKE_GROUPS = [
  {
    id: 'csg-1',
    name: 'CSG-1 (USS Ronald Reagan)',
    carrier: 'USS Ronald Reagan (CVN-76)',
    airWing: 'CVW-5',
    escorts: ['USS Shiloh (CG-67)', 'USS Barry (DDG-52)', 'USS Curtis Wilbur (DDG-54)'],
    region: 'Western Pacific',
    status: 'Deployed',
    lat: 25.5,
    lng: 130.2,
    heading: 225,
    icon: 'carrier',
  },
  {
    id: 'csg-2',
    name: 'CSG-2 (USS Abraham Lincoln)',
    carrier: 'USS Abraham Lincoln (CVN-72)',
    airWing: 'CVW-9',
    escorts: ['USS Spruance (DDG-111)', 'USS Gridley (DDG-101)'],
    region: 'Persian Gulf / Arabian Sea',
    status: 'Deployed',
    lat: 23.8,
    lng: 58.5,
    heading: 45,
    icon: 'carrier',
  },
  {
    id: 'csg-3',
    name: 'CSG-3 (USS Carl Vinson)',
    carrier: 'USS Carl Vinson (CVN-70)',
    airWing: 'CVW-2',
    escorts: ['USS Princeton (CG-59)', 'USS Sterett (DDG-104)'],
    region: 'Eastern Pacific',
    status: 'Transit',
    lat: 20.1,
    lng: -155.3,
    heading: 270,
    icon: 'carrier',
  },
  {
    id: 'csg-4',
    name: 'CSG-8 (USS Harry S. Truman)',
    carrier: 'USS Harry S. Truman (CVN-75)',
    airWing: 'CVW-1',
    escorts: ['USS San Jacinto (CG-56)', 'USS Lassen (DDG-82)'],
    region: 'Mediterranean Sea',
    status: 'Deployed',
    lat: 35.5,
    lng: 18.2,
    heading: 90,
    icon: 'carrier',
  },
  {
    id: 'csg-5',
    name: 'CSG-12 (USS Gerald R. Ford)',
    carrier: 'USS Gerald R. Ford (CVN-78)',
    airWing: 'CVW-8',
    escorts: ['USS Normandy (CG-60)', 'USS Thomas Hudner (DDG-116)', 'USS Ramage (DDG-61)'],
    region: 'Eastern Mediterranean',
    status: 'Alert',
    lat: 34.0,
    lng: 33.5,
    heading: 180,
    icon: 'carrier',
  },
];

// Strategic bomber patrols and exercises (based on public USAF press releases)
const BOMBER_ASSETS = [
  {
    id: 'bmb-1',
    name: 'B-52H Stratofortress Flight',
    type: 'B-52H',
    unit: '2nd Bomb Wing, Barksdale AFB',
    mission: 'Bomber Task Force Europe',
    status: 'Active',
    lat: 55.0,
    lng: 12.0,
    heading: 45,
    icon: 'bomber',
  },
  {
    id: 'bmb-2',
    name: 'B-2 Spirit Patrol',
    type: 'B-2A Spirit',
    unit: '509th Bomb Wing, Whiteman AFB',
    mission: 'Global Strike Mission',
    status: 'Active',
    lat: 38.7,
    lng: -93.5,
    heading: 0,
    icon: 'bomber',
  },
  {
    id: 'bmb-3',
    name: 'B-1B Lancer Pacific',
    type: 'B-1B Lancer',
    unit: '28th Bomb Wing, Ellsworth AFB',
    mission: 'Bomber Task Force Pacific',
    status: 'Active',
    lat: 13.5,
    lng: 144.8,
    heading: 315,
    icon: 'bomber',
  },
];

// Fighter deployments (publicly reported)
const FIGHTER_DEPLOYMENTS = [
  {
    id: 'ftr-1',
    name: 'F-35A Deployment — Poland',
    type: 'F-35A Lightning II',
    unit: '48th Fighter Wing',
    base: 'Łask Air Base, Poland',
    status: 'Deployed',
    lat: 51.55,
    lng: 19.18,
    icon: 'fighter',
  },
  {
    id: 'ftr-2',
    name: 'F/A-18E/F — CVN-78 Air Wing',
    type: 'F/A-18E/F Super Hornet',
    unit: 'CVW-8 (VFA-31, VFA-87)',
    base: 'Embarked USS Gerald R. Ford',
    status: 'Alert',
    lat: 34.2,
    lng: 33.7,
    icon: 'fighter',
  },
  {
    id: 'ftr-3',
    name: 'F-22 Raptor — Kadena',
    type: 'F-22A Raptor',
    unit: '18th Wing',
    base: 'Kadena AB, Okinawa',
    status: 'Deployed',
    lat: 26.35,
    lng: 127.77,
    icon: 'fighter',
  },
  {
    id: 'ftr-4',
    name: 'F-16 Fighting Falcon — Al Udeid',
    type: 'F-16C/D Fighting Falcon',
    unit: '379th AEW',
    base: 'Al Udeid AB, Qatar',
    status: 'Deployed',
    lat: 25.12,
    lng: 51.31,
    icon: 'fighter',
  },
  {
    id: 'ftr-5',
    name: 'F-15E Strike Eagle — RAF Lakenheath',
    type: 'F-15E Strike Eagle',
    unit: '48th Fighter Wing',
    base: 'RAF Lakenheath, UK',
    status: 'Deployed',
    lat: 52.41,
    lng: 0.56,
    icon: 'fighter',
  },
];

// Add slight position jitter to simulate movement updates
function addPositionJitter(lat, lng, range = 0.3) {
  return {
    lat: lat + (Math.random() - 0.5) * range,
    lng: lng + (Math.random() - 0.5) * range,
  };
}

export function getMilitaryAssets() {
  // Add small position variations to simulate live tracking
  const carriers = CARRIER_STRIKE_GROUPS.map((csg) => ({
    ...csg,
    ...addPositionJitter(csg.lat, csg.lng, 0.5),
    assetType: 'carrier',
    lastUpdate: new Date(Date.now() - Math.random() * 3600000).toISOString(),
  }));

  const bombers = BOMBER_ASSETS.map((b) => ({
    ...b,
    ...addPositionJitter(b.lat, b.lng, 1.0),
    assetType: 'bomber',
    lastUpdate: new Date(Date.now() - Math.random() * 7200000).toISOString(),
  }));

  const fighters = FIGHTER_DEPLOYMENTS.map((f) => ({
    ...f,
    assetType: 'fighter',
    lastUpdate: new Date(Date.now() - Math.random() * 1800000).toISOString(),
  }));

  return { carriers, bombers, fighters, all: [...carriers, ...bombers, ...fighters] };
}

export function getMilitaryEvents() {
  // Simulated military event feed based on typical activity patterns
  return [
    {
      id: 'mev-1',
      title: 'CSG-12 Ford conducting flight operations in Eastern Med',
      time: new Date(Date.now() - 1200000),
      type: 'carrier_ops',
      severity: 'high',
      lat: 34.0, lng: 33.5,
    },
    {
      id: 'mev-2',
      title: 'B-52H completed Bomber Task Force sortie over Baltic',
      time: new Date(Date.now() - 3600000),
      type: 'bomber_patrol',
      severity: 'medium',
      lat: 55.0, lng: 12.0,
    },
    {
      id: 'mev-3',
      title: 'F-35A forward deployed to Poland — NATO Air Policing',
      time: new Date(Date.now() - 7200000),
      type: 'fighter_deploy',
      severity: 'medium',
      lat: 51.55, lng: 19.18,
    },
    {
      id: 'mev-4',
      title: 'USS Abraham Lincoln CSG transiting Strait of Hormuz',
      time: new Date(Date.now() - 5400000),
      type: 'carrier_transit',
      severity: 'high',
      lat: 26.5, lng: 56.2,
    },
  ];
}

export { CARRIER_STRIKE_GROUPS, BOMBER_ASSETS, FIGHTER_DEPLOYMENTS };
