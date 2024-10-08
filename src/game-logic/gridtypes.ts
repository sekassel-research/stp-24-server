export class ClusterMap {
  levels: readonly Level[];
  size: readonly number[];
}

export class Level {
  points: readonly number[][]; //Points where clusters of systems will be placed
}

export class Grid {
  vertices: readonly Vertex[];
  intersecting_edges: readonly number[][][];
  system_range: readonly [number, number];
  cycle_percentage: number;
}

export class Vertex {
  id: number;
  x: number;
  y: number;
  neighbors: readonly number[];
}

export const MAPS = [
  {
    levels: [
      { points: [[3,3]] },
      { points: [[2,2], [4,2], [2,4], [4,4]] },
      { points: [[3,1], [1,3], [5,3], [3,5]] },
      { points: [[1,1], [5,1], [1,5], [5,5]] },
      { points: [[2,0], [4,0], [0,2], [6,2], [0,4], [6,4], [2,6], [4,6]] },
      { points: [[0,0], [6,0], [0,6], [6,6]] },
    ],
    size: [7, 7],
  }
] as const satisfies ClusterMap[];

export const GRIDS  = [
  {
    vertices: [
      { id: 0, x: 1, y: 0, neighbors: [1,2,3,4] },
      { id: 1, x: 2, y: 0, neighbors: [0,3,4,5] },
      { id: 2, x: 0, y: 1, neighbors: [0,3,6,7] },
      { id: 3, x: 1, y: 1, neighbors: [0,1,2,4,6,7,8] },
      { id: 4, x: 2, y: 1, neighbors: [0,1,3,5,7,8,9] },
      { id: 5, x: 3, y: 1, neighbors: [1,4,8,9] },
      { id: 6, x: 0, y: 2, neighbors: [2,3,7,10] },
      { id: 7, x: 1, y: 2, neighbors: [2,3,4,6,8,10,11] },
      { id: 8, x: 2, y: 2, neighbors: [3,4,5,7,9,10,11] },
      { id: 9, x: 3, y: 2, neighbors: [4,5,8,11] },
      { id: 10, x: 1, y: 3, neighbors: [6,7,8,11] },
      { id: 11, x: 2, y: 3, neighbors: [7,8,9,10] },
    ],
    intersecting_edges: [
      [[0,4], [1,3]],
      [[2,7], [3,6]],
      [[3,8], [4,7]],
      [[4,9], [5,8]],
      [[7,11], [8,10]],
    ],
    system_range: [9,12],
    cycle_percentage: 0.5,
  },
  {
    vertices: [
      { id: 0, x: 2, y: 0, neighbors: [1,2,4] },
      { id: 1, x: 1, y: 1, neighbors: [0,2,3,4,6] },
      { id: 2, x: 3, y: 1, neighbors: [0,1,4,5,7] },
      { id: 3, x: 0, y: 2, neighbors: [1,4,6] },
      { id: 4, x: 2, y: 2, neighbors: [0,1,2,3,5,6,7,8] },
      { id: 5, x: 4, y: 2, neighbors: [2,4,7] },
      { id: 6, x: 1, y: 3, neighbors: [1,3,4,7,8] },
      { id: 7, x: 3, y: 3, neighbors: [2,4,5,6,8] },
      { id: 8, x: 2, y: 4, neighbors: [4,6,7] },
    ],
    intersecting_edges: [
      [[0,4], [1,2]],
      [[1,6], [3,4]],
      [[2,7], [4,5]],
      [[4,8], [6,7]],
    ],
    system_range: [9,11],
    cycle_percentage: 0.5,
  },
] as const satisfies Grid[];

export const GRID_SCALING = 12;
export const MAX_SYSTEM_DISPLACEMENT = 0.45;
export const MAP_CYCLE_PERCENTAGE = 0.5;

export const CIRCLE_GENERATOR = {
  radius_steps: 0.01,
  angle_steps: 100,
  radius_angle_percentage: 3,
  collision_precision: 1.2, //The smaller the number the nearer the clusters are to each other
}
