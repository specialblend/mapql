export type Json = {
  [k: string]: string | number | boolean | null | Json | Json[];
};

export interface MapArgs {
  from?: string;
  fromConst?: string;
  fromRoot?: string;
  defaultTo?: any;
}
