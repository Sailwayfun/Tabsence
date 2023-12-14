export interface SpaceDoc {
  title: string;
  isArchived?: boolean;
}

export interface Space extends SpaceDoc {
  id: string;
  isEditing: boolean;
}
