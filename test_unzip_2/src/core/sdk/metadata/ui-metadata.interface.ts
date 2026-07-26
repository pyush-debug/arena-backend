export interface IUiMetadata {
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  sidebar?: {
    menus: IMenuDefinition[];
  };
  dashboards?: IDashboardWidget[];
  shortcuts?: IShortcut[];
}

export interface IMenuDefinition {
  id: string;
  label: string;
  icon: string;
  route: string;
  requiresPermission?: string[];
  requiresFeatureFlag?: string;
  submenus?: IMenuDefinition[];
  orderIndex?: number;
}

export interface IDashboardWidget {
  id: string;
  title: string;
  componentName: string;
  gridSpan: number;
}

export interface IShortcut {
  keyCombo: string;
  actionRoute: string;
  description: string;
}
