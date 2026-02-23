export interface Workspace {
  name: string;
  description: string;
  color: string;
  items: string[]; // List of item IDs
}

export function constructEmptyWorkspace(): Workspace {
  return {
    name: '',
    description: '',
    color: '#000000',
    items: []
  }
}

export interface Item {
  name: string;
  description: string;
  'start-date': Date;
  'end-date': Date;
  color: string;
}

export function constructEmptyItem(): Item {
  return {
    name: '',
    description: '',
    'start-date': new Date(),
    'end-date': new Date(),
    color: '#000000',
  }
}