const paths = {
  cap: '<path d="m2 10 10-5 10 5-10 5-10-5Z"/><path d="M6 12v5c3.5 2.7 8.5 2.7 12 0v-5m4-2v6"/>',
  home: '<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/>',
  building: '<rect x="5" y="3" width="14" height="18" rx="1.4"/><path d="M10 21v-4h4v4M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 14h.01M15 14h.01"/>',
  book: '<path d="M12 7a5 5 0 0 0-5-3H3v15h4a5 5 0 0 1 5 2 5 5 0 0 1 5-2h4V4h-4a5 5 0 0 0-5 3Zm0 0v14"/>',
  code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-2-15-4 18"/>',
  folder: '<path d="M3 19V6a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="m10 12-2 2 2 2m4-4 2 2-2 2"/>',
  presentation: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v5m-4 0h8M8 12l2-2 2 1 3-3"/>',
  cards: '<rect x="5" y="3" width="16" height="14" rx="2"/><path d="M3 7v12a2 2 0 0 0 2 2h13m-9-12h8m-8 4h5"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M10 2h4m-2 11V9m6-3 1-1"/>',
  messages: '<path d="M20 13a3 3 0 0 1-3 3H9l-5 4v-7a3 3 0 0 1-1-2V6a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3Z"/><path d="M8 8h8m-8 4h5"/>',
  notebook: '<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M3 7h4m-4 5h4m-4 5h4m3-9h6m-6 4h6"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  "arrow-left": '<path d="M20 12H5m6-6-6 6 6 6"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  play: '<path d="m8 5 12 7-12 7V5Z"/>',
  pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.5-3.3 1 1 0 0 1 .8-1.7H17a4 4 0 0 0 4-4 9 9 0 0 0-9-9Z"/><path d="M7.5 11h.01M10 7.5h.01m4 0h.01m3 3h.01"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 4 9 5 9-5"/>',
  grid: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18m-12 0v10m6-10v10"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3m6 0h4"/>',
  branch: '<circle cx="7" cy="5" r="2.5"/><circle cx="7" cy="19" r="2.5"/><circle cx="17" cy="6" r="2.5"/><path d="M7 8v8m0-2c0-4 10 0 10-5"/>',
  pencil: '<path d="m13 6 5 5M4 20l4.5-1 12-12a2 2 0 0 0-5-5l-12 12L3 20Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
  refresh: '<path d="M20 8a8 8 0 1 0 0 8m0-12v5h-5"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5m-16 7c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  shield: '<path d="M12 22s7-3.5 7-9V5l-7-3-7 3v8c0 5.5 7 9 7 9Z"/><path d="m9 12 2 2 4-4"/>',
  link: '<path d="M13 5h6v6m0-6-9 9m8 0v5H5V6h5"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
  trash: '<path d="M4 7h16m-14 0 1 13h10l1-13M9 7V4h6v3m-5 3v6m4-6v6"/>',
};

export function icon(name, extra = "") {
  return `<svg class="icon ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? ""}</svg>`;
}

export function iconTile(name, tone = "amber") {
  return `<span class="icon-tile tone-${tone}">${icon(name)}</span>`;
}
