import * as migration_20260826_175201_initial from './20260826_175201_initial';

export const migrations = [
  {
    up: migration_20260826_175201_initial.up,
    down: migration_20260826_175201_initial.down,
    name: '20260826_175201_initial'
  },
];
