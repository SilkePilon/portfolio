import * as migration_20260826_175201_initial from './20260826_175201_initial';
import * as migration_20260827_083528_full_cms from './20260827_083528_full_cms';

export const migrations = [
  {
    up: migration_20260826_175201_initial.up,
    down: migration_20260826_175201_initial.down,
    name: '20260826_175201_initial',
  },
  {
    up: migration_20260827_083528_full_cms.up,
    down: migration_20260827_083528_full_cms.down,
    name: '20260827_083528_full_cms'
  },
];
