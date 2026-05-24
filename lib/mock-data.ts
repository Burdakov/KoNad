// Mock data for КоНад — все модули

export type ViolationSeverity = "critical" | "warning" | "ok" | "unknown" | "info"

export interface KpiCard {
  id: string
  label: string
  value: number
  unit?: string
  severity: ViolationSeverity
  description: string
  delta?: { value: number; direction: "up" | "down" }
}

export interface HierarchyRow {
  id: string
  level: "company" | "field" | "area" | "cluster" | "well"
  name: string
  parentId: string | null
  violations: {
    spatial: number
    tsr: number
    land: number
    opo: number
    ker: number
    conservation: number
    license: number
    reporting: number
    hydro: number
  }
  status: ViolationSeverity
  isExpanded?: boolean
}

export interface CheckModule {
  id: string
  code: string
  title: string
  critical: number
  warning: number
  ok: number
  lastChecked: string
}

// ---------- SPATIAL MODULE ----------

export interface SpatialCheck {
  id: string
  wellId: string
  wellName: string
  company: string
  field: string
  checkType: "reserves" | "mining" | "land"
  checkTypeLabel: string
  status: ViolationSeverity
  bottomholeCoords: { x: number; y: number }
  reserveCategory?: string
  deviation?: number // metres outside boundary
  comment: string
  detectedAt: string
}

export const spatialChecks: SpatialCheck[] = [
  {
    id: "sp1",
    wellId: "w1",
    wellName: "Скважина 14А-7",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    checkType: "reserves",
    checkTypeLabel: "Контур запасов В1+В2",
    status: "critical",
    bottomholeCoords: { x: 68.2341, y: 61.8872 },
    reserveCategory: "В1+В2",
    deviation: 47,
    comment: "Забой скважины выходит за контур промышленных категорий В1+В2 на 47 м",
    detectedAt: "23.05.2026 07:45",
  },
  {
    id: "sp2",
    wellId: "w2",
    wellName: "Скважина 14А-12",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    checkType: "reserves",
    checkTypeLabel: "Контур запасов В1",
    status: "critical",
    bottomholeCoords: { x: 68.2389, y: 61.8894 },
    reserveCategory: "В1",
    deviation: 123,
    comment: "Забой скважины выходит за контур запасов В1 на 123 м в северо-восточном направлении",
    detectedAt: "23.05.2026 07:45",
  },
  {
    id: "sp3",
    wellId: "w3",
    wellName: "Скважина КП-14",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    checkType: "land",
    checkTypeLabel: "Граница земельного отвода",
    status: "warning",
    bottomholeCoords: { x: 68.2250, y: 61.8801 },
    deviation: 12,
    comment: "Объект обустройства КП-14 частично выходит за границу договора аренды №47/2021",
    detectedAt: "21.05.2026 14:00",
  },
  {
    id: "sp4",
    wellId: "w4",
    wellName: "Скважина 22Б-3",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    checkType: "mining",
    checkTypeLabel: "Горный отвод ПРГР-2024",
    status: "warning",
    bottomholeCoords: { x: 72.1120, y: 65.4430 },
    deviation: 8,
    comment: "Ствол скважины в интервале 1850–2100 м частично выходит за границу горного отвода",
    detectedAt: "22.05.2026 09:20",
  },
  {
    id: "sp5",
    wellId: "w5",
    wellName: "Скважина 31В-8",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    checkType: "reserves",
    checkTypeLabel: "Контур запасов С1",
    status: "warning",
    bottomholeCoords: { x: 72.1290, y: 65.4512 },
    reserveCategory: "С1",
    deviation: 22,
    comment: "Добыча ведётся из блока, в котором запасы переведены в категорию С1 (непромышленная)",
    detectedAt: "20.05.2026 16:00",
  },
  {
    id: "sp6",
    wellId: "w6",
    wellName: "Скважина 8Г-1",
    company: "ПАО «ТюменьРесурс»",
    field: "Центральное",
    checkType: "mining",
    checkTypeLabel: "Горный отвод ПРГР-2023",
    status: "ok",
    bottomholeCoords: { x: 68.9812, y: 60.3210 },
    comment: "Ствол скважины полностью в пределах горного отвода",
    detectedAt: "23.05.2026 08:00",
  },
]

// ──────────────────────────────────────────────────────────────────────────────
// ПРОСТРАНСТВЕННАЯ КАРТА: контуры запасов, горные отводы, плановые скважины
// Координаты — условные (lon/lat в системе WGS-84 для Западной Сибири).
// ──────────────────────────────────────────────────────────────────────────────

/** Контур категории запасов */
export interface ReserveContour {
  id: string
  fieldId: string
  fieldName: string
  company: string
  /** В1, В2, В1+В2, С1, С2 */
  category: string
  /** Цвет заливки (oklch) */
  color: string
  /** Полигон: массив [lon, lat] */
  polygon: [number, number][]
}

/** Горный отвод */
export interface MiningAllotment {
  id: string
  fieldId: string
  fieldName: string
  company: string
  docNumber: string
  polygon: [number, number][]
  status: "active" | "expired" | "pending"
}

/** Скважина на карте */
export interface MapWell {
  id: string
  wellName: string
  lon: number
  lat: number
  /** fact = фактическая; plan = плановый запуск */
  dataType: "fact" | "plan"
  /** true = входит в план добычи мастерфайла */
  inProductionPlan: boolean
  /** null = нет нарушений */
  violation: "critical" | "warning" | null
  company: string
  fieldId: string
  plannedLaunchDate?: string
  oilRateToday?: number | null
}

// ── Контуры запасов ───────────────────────────────────────────────────────────
export const reserveContours: ReserveContour[] = [
  // === Западно-Сибирское (ООО «НефтьГаз-Запад») ===
  {
    id: "rc1", fieldId: "mf1", fieldName: "Западно-Сибирское",
    company: "ООО «НефтьГаз-Запад»",
    category: "В1+В2",
    color: "oklch(0.62_0.18_145)",
    polygon: [
      [68.210, 61.870], [68.255, 61.870], [68.260, 61.895],
      [68.250, 61.905], [68.220, 61.903], [68.210, 61.890],
    ],
  },
  {
    id: "rc2", fieldId: "mf1", fieldName: "Западно-Сибирское",
    company: "ООО «НефтьГаз-Запад»",
    category: "В1",
    color: "oklch(0.72_0.18_145)",
    polygon: [
      [68.215, 61.875], [68.248, 61.875], [68.252, 61.893],
      [68.242, 61.900], [68.222, 61.898], [68.215, 61.887],
    ],
  },
  {
    id: "rc3", fieldId: "mf1", fieldName: "Западно-Сибирское",
    company: "ООО «НефтьГаз-Запад»",
    category: "С1",
    color: "oklch(0.65_0.15_210)",
    polygon: [
      [68.255, 61.870], [68.285, 61.870], [68.290, 61.895],
      [68.270, 61.905], [68.255, 61.895],
    ],
  },
  // === Северное (ООО «НефтьГаз-Запад») ===
  {
    id: "rc4", fieldId: "mf2", fieldName: "Северное",
    company: "ООО «НефтьГаз-Запад»",
    category: "В1+В2",
    color: "oklch(0.62_0.18_145)",
    polygon: [
      [70.300, 63.420], [70.360, 63.420], [70.365, 63.455],
      [70.340, 63.462], [70.305, 63.455], [70.300, 63.435],
    ],
  },
  {
    id: "rc5", fieldId: "mf2", fieldName: "Северное",
    company: "ООО «НефтьГаз-Запад»",
    category: "С1",
    color: "oklch(0.65_0.15_210)",
    polygon: [
      [70.360, 63.420], [70.395, 63.418], [70.400, 63.450],
      [70.370, 63.458], [70.360, 63.445],
    ],
  },
  // === Арктическое (АО «СеверДобыча») ===
  {
    id: "rc6", fieldId: "mf3", fieldName: "Арктическое",
    company: "АО «СеверДобыча»",
    category: "В1+В2",
    color: "oklch(0.62_0.18_145)",
    polygon: [
      [72.090, 65.435], [72.150, 65.432], [72.158, 65.465],
      [72.130, 65.472], [72.092, 65.465], [72.088, 65.448],
    ],
  },
  {
    id: "rc7", fieldId: "mf3", fieldName: "Арктическое",
    company: "АО «СеверДобыча»",
    category: "С1",
    color: "oklch(0.65_0.15_210)",
    polygon: [
      [72.150, 65.432], [72.180, 65.430], [72.185, 65.462],
      [72.160, 65.470], [72.150, 65.458],
    ],
  },
  // === Центральное (ПАО «ТюменьРесурс») ===
  {
    id: "rc8", fieldId: "mf4", fieldName: "Центральное",
    company: "ПАО «ТюменьРесурс»",
    category: "В1+В2",
    color: "oklch(0.62_0.18_145)",
    polygon: [
      [68.960, 60.308], [69.010, 60.308], [69.015, 60.338],
      [68.995, 60.345], [68.962, 60.338], [68.958, 60.320],
    ],
  },
  // === Арктическое Блок Д (АО «СеверДобыча», план 2027) ===
  {
    id: "rc9", fieldId: "mf5", fieldName: "Арктическое (Блок Д)",
    company: "АО «СеверДобыча»",
    category: "С1",
    color: "oklch(0.65_0.15_210)",
    polygon: [
      [72.200, 65.465], [72.240, 65.462], [72.245, 65.488],
      [72.215, 65.495], [72.198, 65.480],
    ],
  },
]

// ── Горные отводы ─────────────────────────────────────────────────────────────
export const miningAllotments: MiningAllotment[] = [
  {
    id: "ma1", fieldId: "mf1", fieldName: "Западно-Сибирское",
    company: "ООО «НефтьГаз-Запад»",
    docNumber: "ПРГР-ЗСМ-2022",
    status: "active",
    polygon: [
      [68.205, 61.865], [68.295, 61.865], [68.300, 61.910],
      [68.255, 61.918], [68.208, 61.908], [68.202, 61.882],
    ],
  },
  {
    id: "ma2", fieldId: "mf2", fieldName: "Северное",
    company: "ООО «НефтьГаз-Запад»",
    docNumber: "ПРГР-СЕВ-2021",
    status: "active",
    polygon: [
      [70.293, 63.412], [70.408, 63.410], [70.412, 63.468],
      [70.350, 63.475], [70.295, 63.462], [70.290, 63.430],
    ],
  },
  {
    id: "ma3", fieldId: "mf3", fieldName: "Арктическое",
    company: "АО «СеверДобыча»",
    docNumber: "ПРГР-АРК-2024",
    status: "active",
    polygon: [
      [72.082, 65.428], [72.192, 65.425], [72.195, 65.478],
      [72.140, 65.482], [72.085, 65.475], [72.080, 65.450],
    ],
  },
  {
    id: "ma4", fieldId: "mf4", fieldName: "Центральное",
    company: "ПАО «ТюменьРесурс»",
    docNumber: "ПРГР-ЦЕН-2023",
    status: "active",
    polygon: [
      [68.950, 60.300], [69.025, 60.300], [69.030, 60.352],
      [69.000, 60.358], [68.952, 60.348], [68.948, 60.318],
    ],
  },
  // Блок Д — горный отвод в стадии оформления (план 2027)
  {
    id: "ma5", fieldId: "mf5", fieldName: "Арктическое (Блок Д)",
    company: "АО «СеверДобыча»",
    docNumber: "ПРГР-АРК-Д-2026 (проект)",
    status: "pending",
    polygon: [
      [72.192, 65.458], [72.255, 65.455], [72.258, 65.500],
      [72.220, 65.505], [72.190, 65.492],
    ],
  },
]

// ── Скважины на карте (объединяют факт + план + нарушения) ────────────────────
export const mapWells: MapWell[] = [
  // ─── Западно-Сибирское (факт) ───────────────────────────────────────────────
  { id: "mwp1",  wellName: "14А-7",  lon: 68.2341, lat: 61.8872, dataType: "fact", inProductionPlan: true,  violation: "critical", company: "ООО «НефтьГаз-Запад»", fieldId: "mf1", oilRateToday: 42.1 },
  { id: "mwp2",  wellName: "14А-12", lon: 68.2389, lat: 61.8894, dataType: "fact", inProductionPlan: true,  violation: "critical", company: "ООО «НефтьГаз-Запад»", fieldId: "mf1", oilRateToday: 28.5 },
  { id: "mwp3",  wellName: "14А-15", lon: 68.2420, lat: 61.8850, dataType: "fact", inProductionPlan: true,  violation: null,       company: "ООО «НефтьГаз-Запад»", fieldId: "mf1", oilRateToday: 31.4 },
  { id: "mwp4",  wellName: "7Д-4",   lon: 68.2600, lat: 61.8760, dataType: "fact", inProductionPlan: false, violation: null,       company: "ООО «НефтьГаз-Запад»", fieldId: "mf1", oilRateToday: null },
  { id: "mwp5",  wellName: "7Д-9",   lon: 68.2630, lat: 61.8788, dataType: "fact", inProductionPlan: false, violation: null,       company: "ООО «НефтьГаз-Запад»", fieldId: "mf1", oilRateToday: null },
  { id: "mwp6",  wellName: "КП-14",  lon: 68.2250, lat: 61.8801, dataType: "fact", inProductionPlan: false, violation: "warning",  company: "ООО «НефтьГаз-Запад»", fieldId: "mf1", oilRateToday: null },
  // Плановый куст 18Б (2026)
  { id: "mwp7",  wellName: "18Б-1",  lon: 68.2750, lat: 61.8920, dataType: "plan", inProductionPlan: true,  violation: null,       company: "ООО «НефтьГаз-Запад»", fieldId: "mf1", plannedLaunchDate: "01.09.2026" },
  { id: "mwp8",  wellName: "18Б-2",  lon: 68.2770, lat: 61.8938, dataType: "plan", inProductionPlan: true,  violation: null,       company: "ООО «НефтьГаз-Запад»", fieldId: "mf1", plannedLaunchDate: "15.09.2026" },

  // ─── Северное (факт + план) ──────────────────────────────────────────────────
  { id: "mwp9",  wellName: "3А-17",  lon: 70.3120, lat: 63.4280, dataType: "fact", inProductionPlan: false, violation: null,       company: "ООО «НефтьГаз-Запад»", fieldId: "mf2", oilRateToday: null },
  { id: "mwp10", wellName: "8Е-1",   lon: 70.3350, lat: 63.4420, dataType: "fact", inProductionPlan: true,  violation: null,       company: "ООО «НефтьГаз-Запад»", fieldId: "mf2", oilRateToday: 55.2 },
  { id: "mwp11", wellName: "8Е-2",   lon: 70.3380, lat: 63.4440, dataType: "fact", inProductionPlan: true,  violation: null,       company: "ООО «НефтьГаз-Запад»", fieldId: "mf2", oilRateToday: 48.7 },
  // Плановый куст 11Ж (2027)
  { id: "mwp12", wellName: "11Ж-1",  lon: 70.3750, lat: 63.4380, dataType: "plan", inProductionPlan: true,  violation: null,       company: "ООО «НефтьГаз-Запад»", fieldId: "mf2", plannedLaunchDate: "01.03.2027" },
  { id: "mwp13", wellName: "11Ж-2",  lon: 70.3780, lat: 63.4400, dataType: "plan", inProductionPlan: true,  violation: null,       company: "ООО «НефтьГаз-Запад»", fieldId: "mf2", plannedLaunchDate: "15.03.2027" },
  { id: "mwp14", wellName: "11Ж-3",  lon: 70.3800, lat: 63.4360, dataType: "plan", inProductionPlan: true,  violation: null,       company: "ООО «НефтьГаз-Запад»", fieldId: "mf2", plannedLaunchDate: "01.04.2027" },

  // ─── Арктическое (факт + план) ──────────────────────────────────────────────
  { id: "mwp15", wellName: "22Б-3",  lon: 72.1120, lat: 65.4430, dataType: "fact", inProductionPlan: true,  violation: "warning",  company: "АО «СеверДобыча»",     fieldId: "mf3", oilRateToday: 78.3 },
  { id: "mwp16", wellName: "31В-8",  lon: 72.1290, lat: 65.4512, dataType: "fact", inProductionPlan: true,  violation: "warning",  company: "АО «СеверДобыча»",     fieldId: "mf3", oilRateToday: 61.0 },
  { id: "mwp17", wellName: "45Г-1",  lon: 72.1050, lat: 65.4380, dataType: "fact", inProductionPlan: true,  violation: null,       company: "АО «СеверДобыча»",     fieldId: "mf3", oilRateToday: 92.4 },
  { id: "mwp18", wellName: "45Г-2",  lon: 72.1080, lat: 65.4400, dataType: "fact", inProductionPlan: true,  violation: null,       company: "АО «СеверДобыча»",     fieldId: "mf3", oilRateToday: 87.1 },
  // Плановый куст 52Д (2026)
  { id: "mwp19", wellName: "52Д-1",  lon: 72.1580, lat: 65.4480, dataType: "plan", inProductionPlan: true,  violation: null,       company: "АО «СеверДобыча»",     fieldId: "mf3", plannedLaunchDate: "01.11.2026" },
  { id: "mwp20", wellName: "52Д-2",  lon: 72.1610, lat: 65.4500, dataType: "plan", inProductionPlan: true,  violation: null,       company: "АО «СеверДобыча»",     fieldId: "mf3", plannedLaunchDate: "15.11.2026" },

  // ─── Центральное (факт) ─────────────────────────────────────────────────────
  { id: "mwp21", wellName: "8Г-1",   lon: 68.9812, lat: 60.3210, dataType: "fact", inProductionPlan: true,  violation: null,       company: "ПАО «ТюменьРесурс»",   fieldId: "mf4", oilRateToday: 35.8 },
  { id: "mwp22", wellName: "8Г-3",   lon: 68.9840, lat: 60.3230, dataType: "fact", inProductionPlan: false, violation: null,       company: "ПАО «ТюменьРесурс»",   fieldId: "mf4", oilRateToday: null },
  // Плановая скважина 8Г-5 (2026)
  { id: "mwp23", wellName: "8Г-5",   lon: 68.9870, lat: 60.3250, dataType: "plan", inProductionPlan: true,  violation: null,       company: "ПАО «ТюменьРесурс»",   fieldId: "mf4", plannedLaunchDate: "01.08.2026" },
  // Плановый куст 12В (2027)
  { id: "mwp24", wellName: "12В-1",  lon: 68.9950, lat: 60.3300, dataType: "plan", inProductionPlan: true,  violation: null,       company: "ПАО «ТюменьРесурс»",   fieldId: "mf4", plannedLaunchDate: "01.09.2027" },
  { id: "mwp25", wellName: "12В-2",  lon: 68.9975, lat: 60.3320, dataType: "plan", inProductionPlan: true,  violation: null,       company: "ПАО «ТюменьРесурс»",   fieldId: "mf4", plannedLaunchDate: "15.09.2027" },

  // ─── Арктическое Блок Д (план 2027) ─────────────────────────────────────────
  { id: "mwp26", wellName: "67А-1",  lon: 72.2180, lat: 65.4720, dataType: "plan", inProductionPlan: true,  violation: null,       company: "АО «СеверДобыча»",     fieldId: "mf5", plannedLaunchDate: "01.06.2027" },
  { id: "mwp27", wellName: "67А-2",  lon: 72.2200, lat: 65.4740, dataType: "plan", inProductionPlan: true,  violation: null,       company: "АО «СеверДобыча»",     fieldId: "mf5", plannedLaunchDate: "15.06.2027" },
]

// ---------- TSR MODULE ----------

export interface TsrIndicator {
  id: string
  company: string
  field: string
  indicator: string
  unit: string
  planTsr: number
  factYtd: number
  deviation: number // %
  status: ViolationSeverity
  controlled: boolean // контролируемый показатель
  tsrDoc: string
  year: number
}

export interface TsrResearchProgram {
  id: string
  company: string
  field: string
  workType: string
  plannedQ: string
  actualQ: string
  status: ViolationSeverity
  comment: string
}

export const tsrIndicators: TsrIndicator[] = [
  {
    id: "tsr1",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    indicator: "Добыча нефти",
    unit: "тыс.т/год",
    planTsr: 241,
    factYtd: 285,
    deviation: 18.3,
    status: "critical",
    controlled: true,
    tsrDoc: "ТСР-АРК-2023",
    year: 2026,
  },
  {
    id: "tsr2",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    indicator: "Утилизация ПНГ",
    unit: "%",
    planTsr: 95,
    factYtd: 84,
    deviation: -11.6,
    status: "critical",
    controlled: true,
    tsrDoc: "ТСР-АРК-2023",
    year: 2026,
  },
  {
    id: "tsr3",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    indicator: "Добыча жидкости",
    unit: "тыс.т/год",
    planTsr: 1240,
    factYtd: 1318,
    deviation: 6.3,
    status: "warning",
    controlled: false,
    tsrDoc: "ТСР-АРК-2023",
    year: 2026,
  },
  {
    id: "tsr4",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    indicator: "Закачка воды",
    unit: "тыс.м³/год",
    planTsr: 2100,
    factYtd: 1950,
    deviation: -7.1,
    status: "warning",
    controlled: false,
    tsrDoc: "ТСР-АРК-2023",
    year: 2026,
  },
  {
    id: "tsr5",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    indicator: "Добыча нефти",
    unit: "тыс.т/год",
    planTsr: 480,
    factYtd: 471,
    deviation: -1.9,
    status: "ok",
    controlled: true,
    tsrDoc: "ТСР-ЗСМ-2024",
    year: 2026,
  },
  {
    id: "tsr6",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    indicator: "Утилизация ПНГ",
    unit: "%",
    planTsr: 95,
    factYtd: 96.2,
    deviation: 1.3,
    status: "ok",
    controlled: true,
    tsrDoc: "ТСР-ЗСМ-2024",
    year: 2026,
  },
  {
    id: "tsr7",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    indicator: "Добыча нефти",
    unit: "тыс.т/год",
    planTsr: 320,
    factYtd: 341,
    deviation: 6.6,
    status: "warning",
    controlled: true,
    tsrDoc: "ТСР-ЗСМ-2024",
    year: 2026,
  },
  {
    id: "tsr8",
    company: "ПАО «ТюменьРесурс»",
    field: "Центральное",
    indicator: "Добыча нефти",
    unit: "тыс.т/год",
    planTsr: 155,
    factYtd: 153,
    deviation: -1.3,
    status: "ok",
    controlled: true,
    tsrDoc: "ТСР-ЦНТ-2022",
    year: 2026,
  },
]

export const tsrResearchPrograms: TsrResearchProgram[] = [
  {
    id: "rp1",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    workType: "КВД (кривая восстановления давления)",
    plannedQ: "8 скважин",
    actualQ: "3 скважины",
    status: "critical",
    comment: "Выполнено 38% плана. Срок — 01.06.2026",
  },
  {
    id: "rp2",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    workType: "Гидродинамические исследования",
    plannedQ: "12 скважин",
    actualQ: "9 скважин",
    status: "warning",
    comment: "Выполнено 75% плана",
  },
  {
    id: "rp3",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    workType: "Отбор керна",
    plannedQ: "2 скважины",
    actualQ: "2 скважины",
    status: "ok",
    comment: "Выполнено в срок",
  },
  {
    id: "rp4",
    company: "ООО «НефтьГаз-Запад»",
    field: "Северное",
    workType: "3D сейсмика",
    plannedQ: "120 км²",
    actualQ: "0 км²",
    status: "critical",
    comment: "Работы не начаты. Срок — 31.07.2026",
  },
]

// ---------- LAND MODULE ----------

export interface LandDocument {
  id: string
  docType: "lease" | "easement" | "allotment" | "permit"
  docTypeLabel: string
  docNumber: string
  company: string
  field: string
  object: string
  area: number // га
  validFrom: string
  validTo: string
  daysLeft: number
  status: ViolationSeverity
  comment: string
}

export const landDocuments: LandDocument[] = [
  {
    id: "ld1",
    docType: "lease",
    docTypeLabel: "Договор аренды",
    docNumber: "№47/2021",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    object: "Кустовая площадка 14А",
    area: 3.2,
    validFrom: "01.03.2021",
    validTo: "01.03.2031",
    daysLeft: 1773,
    status: "warning",
    comment: "Объект КП-14 выходит за границу договора аренды на 12 м",
  },
  {
    id: "ld2",
    docType: "allotment",
    docTypeLabel: "Землеотводный акт",
    docNumber: "ЗА-2019-88",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    object: "Нефтепровод НП-14-ДНС",
    area: 8.7,
    validFrom: "15.07.2019",
    validTo: "15.07.2024",
    daysLeft: -308,
    status: "critical",
    comment: "Документ просрочен 308 дней назад. Нефтепровод эксплуатируется без действующего акта",
  },
  {
    id: "ld3",
    docType: "easement",
    docTypeLabel: "Сервитут",
    docNumber: "СРВ-2023-14",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    object: "Линия ЛЭП-10кВ к КП-14А",
    area: 0.8,
    validFrom: "01.01.2023",
    validTo: "01.01.2028",
    daysLeft: 588,
    status: "ok",
    comment: "Документ действителен",
  },
  {
    id: "ld4",
    docType: "lease",
    docTypeLabel: "Договор аренды",
    docNumber: "№12/2022",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    object: "Буровая площадка 22Б",
    area: 5.1,
    validFrom: "10.04.2022",
    validTo: "10.04.2025",
    daysLeft: -44,
    status: "critical",
    comment: "Документ просрочен 44 дня назад. Буровые работы продолжаются",
  },
  {
    id: "ld5",
    docType: "permit",
    docTypeLabel: "Разрешение на использование",
    docNumber: "РИЗ-2024-07",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    object: "Вахтовый посёлок ВП-3",
    area: 12.4,
    validFrom: "01.06.2024",
    validTo: "01.06.2029",
    daysLeft: 1105,
    status: "ok",
    comment: "Документ действителен",
  },
  {
    id: "ld6",
    docType: "lease",
    docTypeLabel: "Договор аренды",
    docNumber: "№91/2023",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    object: "Кустовая площадка 31В",
    area: 2.9,
    validFrom: "15.09.2023",
    validTo: "15.03.2027",
    daysLeft: 297,
    status: "ok",
    comment: "Документ действителен",
  },
  {
    id: "ld7",
    docType: "lease",
    docTypeLabel: "Договор аренды",
    docNumber: "№05/2020",
    company: "ПАО «ТюменьРесурс»",
    field: "Центральное",
    object: "ДНС «Центральная-2»",
    area: 6.3,
    validFrom: "01.02.2020",
    validTo: "01.02.2030",
    daysLeft: 1350,
    status: "ok",
    comment: "Документ действителен",
  },
]

// ---------- OPO MODULE ----------

export interface OpoObject {
  id: string
  name: string
  opoClass: "I" | "II" | "III" | "IV"
  company: string
  field: string
  docType: string
  docNumber: string
  validTo: string
  daysLeft: number
  status: ViolationSeverity
  comment: string
}

export const opoObjects: OpoObject[] = [
  {
    id: "opo1",
    name: "ДКС-2 (Компрессорная станция)",
    opoClass: "II",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    docType: "Разрешение на эксплуатацию ОПО",
    docNumber: "Р-ОПО-ЗСМ-0042",
    validTo: "01.04.2026",
    daysLeft: -52,
    status: "critical",
    comment: "Разрешение просрочено на 52 дня. Объект продолжает работу.",
  },
  {
    id: "opo2",
    name: "ФУ-1 (Факельная установка)",
    opoClass: "II",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    docType: "Разрешение на эксплуатацию ОПО",
    docNumber: "Р-ОПО-ЗСМ-0018",
    validTo: "15.11.2026",
    daysLeft: 176,
    status: "ok",
    comment: "Разрешение действительно",
  },
  {
    id: "opo3",
    name: "ЦППН-14 (Установка подготовки нефти)",
    opoClass: "III",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    docType: "Разрешение на эксплуатацию ОПО",
    docNumber: "Р-ОПО-ЗСМ-0031",
    validTo: "30.06.2026",
    daysLeft: 38,
    status: "warning",
    comment: "Срок истекает чере�� 38 дней",
  },
  {
    id: "opo4",
    name: "ДКС-1 (Дожимная компрессорная ст.)",
    opoClass: "II",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    docType: "Разрешение на эксплуатацию ОПО",
    docNumber: "Р-ОПО-АРК-0007",
    validTo: "01.12.2027",
    daysLeft: 557,
    status: "ok",
    comment: "Разреше������ие действительно",
  },
  {
    id: "opo5",
    name: "ФУ-3 (Факельная установка)",
    opoClass: "I",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    docType: "Разрешение на эксплуатацию ОПО",
    docNumber: "Р-ОПО-АРК-0019",
    validTo: "15.02.2027",
    daysLeft: 268,
    status: "ok",
    comment: "Разрешение действительно",
  },
  {
    id: "opo6",
    name: "КС-Арктик (Компрессорная ст.)",
    opoClass: "II",
    company: "А���� «СеверДобыча»",
    field: "Арктическое",
    docType: "Разрешение на эксплуатацию ОПО",
    docNumber: "Р-ОПО-АРК-0031",
    validTo: "10.07.2026",
    daysLeft: 48,
    status: "warning",
    comment: "Срок истекает через 48 дней",
  },
  {
    id: "opo7",
    name: "ДНС «Центральная-2»",
    opoClass: "III",
    company: "ПАО «ТюменьРесурс»",
    field: "Центральное",
    docType: "Разрешение на эксплуатацию ОПО",
    docNumber: "Р-ОПО-ЦТ-0012",
    validTo: "20.08.2027",
    daysLeft: 454,
    status: "ok",
    comment: "Разрешение действительно",
  },
]

// ---------- KER MODULE ----------

export interface KerEmissionSource {
  id: string
  sourceName: string
  sourceType: "flare" | "stationary" | "mobile"
  sourceTypeLabel: string
  company: string
  field: string
  kerDoc: string
  pollutant: string
  limitTonYear: number
  factYtd: number
  projectedYear: number
  exceedance: number // %
  status: ViolationSeverity
  kerPresent: boolean
  comment: string
}

export const kerEmissionSources: KerEmissionSource[] = [
  {
    id: "ker1",
    sourceName: "ФУ-3 Арктическое",
    sourceType: "flare",
    sourceTypeLabel: "Факельная установка",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    kerDoc: "КЭР-АРК-2024",
    pollutant: "Диоксид серы (SO₂)",
    limitTonYear: 85.0,
    factYtd: 121.6,
    projectedYear: 204.0,
    exceedance: 140.0,
    status: "critical",
    kerPresent: true,
    comment: "Фактические выбросы в 2.4 раза превышают норматив КЭР. Требуется немедленная остановка сверхнормативного сжигания.",
  },
  {
    id: "ker2",
    sourceName: "ФУ-3 Арктическое",
    sourceType: "flare",
    sourceTypeLabel: "Факельная установка",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    kerDoc: "КЭР-АРК-2024",
    pollutant: "Оксид углерода (CO)",
    limitTonYear: 320.0,
    factYtd: 198.0,
    projectedYear: 332.0,
    exceedance: 3.8,
    status: "warning",
    kerPresent: true,
    comment: "Прогнозируемое превышение к концу года на 3.8%",
  },
  {
    id: "ker3",
    sourceName: "ДКС-2 ЗСМ",
    sourceType: "stationary",
    sourceTypeLabel: "Стационарный источник",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    kerDoc: "КЭР-ЗСМ-2022",
    pollutant: "Азот диоксид (NO₂)",
    limitTonYear: 48.0,
    factYtd: 21.4,
    projectedYear: 44.0,
    exceedance: 0,
    status: "ok",
    kerPresent: true,
    comment: "В пределах норматива",
  },
  {
    id: "ker4",
    sourceName: "ЦППН-14",
    sourceType: "stationary",
    sourceTypeLabel: "Стационарный источник",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    kerDoc: "КЭР-ЗСМ-2022",
    pollutant: "Углеводороды предельные",
    limitTonYear: 120.0,
    factYtd: 67.0,
    projectedYear: 112.0,
    exceedance: 0,
    status: "ok",
    kerPresent: true,
    comment: "В пределах норматива",
  },
  {
    id: "ker5",
    sourceName: "КС-Арктик",
    sourceType: "stationary",
    sourceTypeLabel: "Стационарный источник",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    kerDoc: "КЭР-АРК-2024",
    pollutant: "Метан (CH₄)",
    limitTonYear: 650.0,
    factYtd: 410.0,
    projectedYear: 688.0,
    exceedance: 5.8,
    status: "warning",
    kerPresent: true,
    comment: "Прогнозируемое превышение к концу года на 5.8%",
  },
  {
    id: "ker6",
    sourceName: "ДНС «Центральная-2»",
    sourceType: "stationary",
    sourceTypeLabel: "Стационарный источник",
    company: "ПАО «ТюменьРесурс»",
    field: "Центральное",
    kerDoc: "КЭР-ЦНТ-2023",
    pollutant: "Диоксид серы (SO₂)",
    limitTonYear: 42.0,
    factYtd: 18.3,
    projectedYear: 38.0,
    exceedance: 0,
    status: "ok",
    kerPresent: true,
    comment: "В пределах норматива",
  },
]

// ---------- WELLS MODULE (Консервация и ликвидация) ----------

export interface WellConservation {
  id: string
  wellName: string
  wellType: "production" | "injection" | "monitoring" | "appraisal"
  wellTypeLabel: string
  company: string
  field: string
  status: "active" | "conservation" | "liquidation" | "mothballed"
  statusLabel: string
  conservationDoc: string | null
  conservationDate: string | null
  requiredAction: string | null
  violationSeverity: ViolationSeverity
  comment: string
}

export const wellConservations: WellConservation[] = [
  {
    id: "wc1",
    wellName: "Скважина 7Д-4",
    wellType: "production",
    wellTypeLabel: "Добывающая",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    status: "mothballed",
    statusLabel: "Бездействующая",
    conservationDoc: null,
    conservationDate: null,
    requiredAction: "Оформить акт консервации или ввести в эксплуатацию",
    violationSeverity: "critical",
    comment: "Бездействует 847 дней без акта консервации. Нарушение пп. 5.3 Правил охраны недр.",
  },
  {
    id: "wc2",
    wellName: "Скважина 7Д-9",
    wellType: "production",
    wellTypeLabel: "Добывающая",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    status: "mothballed",
    statusLabel: "Бездействующая",
    conservationDoc: null,
    conservationDate: null,
    requiredAction: "Оформить акт консервации или ввести в эксплуатацию",
    violationSeverity: "warning",
    comment: "Бездействует 214 дней. Требует оформления документа консервации.",
  },
  {
    id: "wc3",
    wellName: "Скважина 3А-17",
    wellType: "monitoring",
    wellTypeLabel: "Наблюдательная",
    company: "ООО «НефтьГаз-Запад»",
    field: "Северное",
    status: "conservation",
    statusLabel: "Консервация",
    conservationDoc: "АКТ-КОНС-СЕВ-2024-03",
    conservationDate: "01.03.2024",
    requiredAction: "Плановая консервация до 01.03.2026 — срок истёк",
    violationSeverity: "warning",
    comment: "Срок плановой консервации истёк 23.03.2026. Необходимо продлить или принять решение о ликвидации.",
  },
  {
    id: "wc4",
    wellName: "Скважина 22Б-1",
    wellType: "appraisal",
    wellTypeLabel: "Разведочная",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    status: "liquidation",
    statusLabel: "Ликвидация",
    conservationDoc: "ЛИК-АРК-2025-07",
    conservationDate: "15.07.2025",
    requiredAction: null,
    violationSeverity: "ok",
    comment: "Ликвидация оформлена в соответствии с требованиями",
  },
  {
    id: "wc5",
    wellName: "Скважина 31В-2",
    wellType: "injection",
    wellTypeLabel: "Нагнетательная",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    status: "active",
    statusLabel: "В эксплуатации",
    conservationDoc: null,
    conservationDate: null,
    requiredAction: null,
    violationSeverity: "ok",
    comment: "Работает штатно",
  },
  {
    id: "wc6",
    wellName: "Скважина 8Г-3",
    wellType: "production",
    wellTypeLabel: "Добывающая",
    company: "ПАО «ТюменьРесурс»",
    field: "Центральное",
    status: "conservation",
    statusLabel: "Консервация",
    conservationDoc: "АКТ-КОНС-ЦНТ-2025-11",
    conservationDate: "10.11.2025",
    requiredAction: null,
    violationSeverity: "ok",
    comment: "Консервация оформлена, срок до 10.11.2027",
  },
]

// ---------- LICENSE MODULE ----------

export interface License {
  id: string
  licenseNumber: string
  company: string
  field: string
  licenseType: "НЭ" | "НП" | "НЭ+НП" | "ГЗ"
  licenseTypeLabel: string
  issuedDate: string
  expiryDate: string
  daysLeft: number
  status: ViolationSeverity
  geStudyDeadline?: string
  geStudyStatus?: ViolationSeverity
  workProgram: { item: string; deadline: string; done: boolean; status: ViolationSeverity }[]
  comment: string
}

export const licenses: License[] = [
  {
    id: "lic1",
    licenseNumber: "ТЮМ-12345-НЭ",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    licenseType: "НЭ",
    licenseTypeLabel: "Добыча",
    issuedDate: "15.04.2008",
    expiryDate: "04.07.2026",
    daysLeft: 42,
    status: "critical",
    workProgram: [
      { item: "Бурение 12 скважин", deadline: "31.12.2025", done: true, status: "ok" },
      { item: "Геологическое изучение пласта ЮВ-1", deadline: "01.06.2026", done: false, status: "critical" },
      { item: "Постановка запасов на баланс", deadline: "01.04.2027", done: false, status: "warning" },
    ],
    comment: "До окончания лицензии 42 дня. Пункт программы работ по геологическому изучению не выполнен.",
  },
  {
    id: "lic2",
    licenseNumber: "ТЮМ-04821-НЭ",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    licenseType: "НЭ",
    licenseTypeLabel: "Добыча",
    issuedDate: "10.11.2005",
    expiryDate: "10.11.2030",
    daysLeft: 1632,
    status: "ok",
    workProgram: [
      { item: "Бурение 18 скважин", deadline: "31.12.2027", done: false, status: "ok" },
      { item: "КВД на 5 скважинах", deadline: "31.12.2026", done: false, status: "ok" },
    ],
    comment: "Лицензия действительна, нарушений нет",
  },
  {
    id: "lic3",
    licenseNumber: "ТЮМ-09901-НП",
    company: "АО «СеверДобыча»",
    field: "Арктическое (Блок Д)",
    licenseType: "НП",
    licenseTypeLabel: "Геологическое изучение",
    issuedDate: "20.01.2022",
    expiryDate: "20.01.2027",
    daysLeft: 607,
    status: "critical",
    geStudyDeadline: "01.01.2027",
    geStudyStatus: "warning",
    workProgram: [
      { item: "2D сейсмика 250 км", deadline: "31.12.2024", done: true, status: "ok" },
      { item: "Бурение 2 параметрических скважин", deadline: "01.07.2026", done: false, status: "critical" },
      { item: "ГРР и подготовка запасов", deadline: "01.01.2027", done: false, status: "warning" },
    ],
    comment: "Бурение параметрических скважин сорвано — срок истёк. Риск нарушения лицензионных условий.",
  },
  {
    id: "lic4",
    licenseNumber: "ТЮМ-17204-НЭ",
    company: "ООО «НефтьГаз-Запад»",
    field: "Северное",
    licenseType: "НЭ",
    licenseTypeLabel: "Добыча",
    issuedDate: "05.06.2014",
    expiryDate: "05.06.2029",
    daysLeft: 1109,
    status: "warning",
    workProgram: [
      { item: "Бурение 6 скважин", deadline: "31.12.2025", done: false, status: "warning" },
      { item: "Ввод 2 скважин из консервации", deadline: "01.07.2026", done: false, status: "ok" },
    ],
    comment: "Программа бурения за 2025 год не выполнена — нарушение условий лицензии.",
  },
  {
    id: "lic5",
    licenseNumber: "ТЮМ-22100-НЭ",
    company: "ПАО «ТюменьРесурс»",
    field: "Центральное",
    licenseType: "НЭ",
    licenseTypeLabel: "Добыча",
    issuedDate: "28.03.2010",
    expiryDate: "28.03.2035",
    daysLeft: 3232,
    status: "ok",
    workProgram: [
      { item: "КВД на 3 скважинах", deadline: "30.09.2026", done: false, status: "ok" },
    ],
    comment: "Лицензия действительна, программа выполняется в срок",
  },
]

// ---------- REPORTING MODULE ----------

export interface ReportingObligation {
  id: string
  reportType: string
  regulatoryBase: string
  company: string
  field: string
  deadline: string
  submittedDate: string | null
  status: ViolationSeverity
  discrepancy: string | null
  comment: string
}

export const reportingObligations: ReportingObligation[] = [
  {
    id: "rep1",
    reportType: "6-ГР (нефть) I кв. 2026",
    regulatoryBase: "Приказ Росстата №414",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    deadline: "15.04.2026",
    submittedDate: null,
    status: "critical",
    discrepancy: null,
    comment: "Отчёт не представлен. Просрочено на 38 дней.",
  },
  {
    id: "rep2",
    reportType: "Баланс газа 2025",
    regulatoryBase: "Приказ Минэнерго №200",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    deadline: "01.03.2026",
    submittedDate: "28.02.2026",
    status: "critical",
    discrepancy: "Данные по утилизации ПНГ расходятся с КЭР на 11.6% (84% vs 95.6% по КЭР)",
    comment: "Отчёт представлен в срок, но данные расходятся с КЭР и ТСР. Требуется пересмотр.",
  },
  {
    id: "rep3",
    reportType: "5-ГР (скважинный фонд) 2025",
    regulatoryBase: "Приказ Росстата №287",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    deadline: "01.02.2026",
    submittedDate: "31.01.2026",
    status: "warning",
    discrepancy: "Фонд бездействующих скважин расходится с данными ИС ИПР на 3 единицы",
    comment: "Отчёт в срок, выявлены расхождения с системой ИПР по бездействующему фонду.",
  },
  {
    id: "rep4",
    reportType: "1-ЛС (лицензированные скважины)",
    regulatoryBase: "Приказ Роснедра №112",
    company: "ООО «НефтьГаз-Запад»",
    field: "Северное",
    deadline: "01.04.2026",
    submittedDate: null,
    status: "critical",
    discrepancy: null,
    comment: "Отчёт не представлен. Просрочено на 52 дня.",
  },
  {
    id: "rep5",
    reportType: "4-ОС (выбросы в атмосферу) 2025",
    regulatoryBase: "Приказ Росстата №315",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    deadline: "25.01.2026",
    submittedDate: "23.01.2026",
    status: "warning",
    discrepancy: "Данные по SO₂ расходятся с фактом выбросов по ФУ-3 на 32.4%",
    comment: "Отчёт в срок, расхождение с фактическими данными по факельной установке.",
  },
  {
    id: "rep6",
    reportType: "6-ГР (нефть) I кв. 2026",
    regulatoryBase: "Приказ Росстата №414",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    deadline: "15.04.2026",
    submittedDate: "14.04.2026",
    status: "ok",
    discrepancy: null,
    comment: "Отчёт представлен в срок, данные соответствуют ТСР",
  },
  {
    id: "rep7",
    reportType: "Баланс газа 2025",
    regulatoryBase: "Приказ Минэнерго №200",
    company: "ПАО «ТюменьРесурс»",
    field: "Центральное",
    deadline: "01.03.2026",
    submittedDate: "28.02.2026",
    status: "ok",
    discrepancy: null,
    comment: "Отчёт в срок, данные совпадают с КЭР и ТСР",
  },
]

// ============================================================
// МАСТЕРФАЙЛ — центральный источник данных о добыче
// ============================================================

export type MasterfileWellStatus = "producing" | "injection" | "idle" | "conservation" | "liquidated"
/** fact = фактически запущен и добывает; plan = плановый запуск (бурение/строительство ещё не завершено) */
export type MasterfileDataType = "fact" | "plan"

export interface MasterfileWell {
  id: string
  wellName: string
  /** fact / plan */
  dataType: MasterfileDataType
  wellStatus: MasterfileWellStatus
  wellStatusLabel: string
  wellType: "production" | "injection" | "monitoring" | "appraisal"
  wellTypeLabel: string
  clusterId: string
  clusterName: string
  fieldId: string
  fieldName: string
  company: string
  /** Дата фактического запуска в добычу (первый замер) — только для fact */
  launchDate: string
  /** Плановая дата запуска — только для plan */
  plannedLaunchDate?: string
  /** Плановый начальный дебит нефти, т/сут */
  plannedOilRate?: number
  /** Плановая добыча в первый полный год, тыс.т */
  plannedOilYear?: number
  /** Накопленная добыча нефти, тыс.т (только fact) */
  oilCumTst: number
  /** Суточный дебит нефти, т/сут (только fact) */
  oilRateToday: number | null
  /** Месяц последнего замера (только fact) */
  lastMeasured: string
  /**
   * Покрытие документами по модулям.
   * true = документ присутствует и актуален
   * false = отсутствует / требует оформления / не соответствует
   */
  docCoverage: {
    spatial: boolean
    tsr: boolean
    land: boolean
    opo: boolean
    ker: boolean
    conservation: boolean
    license: boolean
    reporting: boolean
    hydro: boolean
  }
}

export interface MasterfileCluster {
  id: string
  clusterName: string
  /** fact / plan */
  dataType: MasterfileDataType
  fieldId: string
  fieldName: string
  company: string
  launchDate: string
  plannedLaunchDate?: string
  wellCount: number
  producingCount: number
  idleCount: number
  /** Суммарный суточный дебит куста, т/сут */
  totalOilRate: number
  /** Плановый суточный дебит куста (для plan), т/сут */
  plannedTotalOilRate?: number
  /** Плановый год запуска куста */
  plannedYear?: 2026 | 2027
  docCoverage: {
    spatial: boolean
    tsr: boolean
    land: boolean
    opo: boolean
    ker: boolean
    conservation: boolean
    license: boolean
    reporting: boolean
    hydro: boolean
  }
}

export const masterfileWells: MasterfileWell[] = [
  // ═══════════════════════════════════════════════════════════
  // ФАКТИЧЕСКИЕ ОБЪЕКТЫ (dataType: "fact")
  // ═══════════════════════════════════════════════════════════

  // --- ООО «НефтьГаз-Запад», Западно-Сибирское, Куст 14А ---
  {
    id: "mw1", wellName: "14А-7", dataType: "fact", wellStatus: "producing", wellStatusLabel: "В добыче",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "mc1", clusterName: "Куст 14А", fieldId: "mf1", fieldName: "Западно-Сибирское",
    company: "ООО «НефтьГаз-Запад»", launchDate: "12.03.2021",
    oilCumTst: 48.7, oilRateToday: 42.1, lastMeasured: "23.05.2026",
    docCoverage: { spatial: false, tsr: true, land: true, opo: true, ker: true, conservation: true, license: true, reporting: true, hydro: false },
  },
  {
    id: "mw2", wellName: "14А-12", dataType: "fact", wellStatus: "producing", wellStatusLabel: "В добыче",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "mc1", clusterName: "Куст 14А", fieldId: "mf1", fieldName: "Западно-Сибирское",
    company: "ООО «НефтьГаз-Запад»", launchDate: "18.06.2021",
    oilCumTst: 36.2, oilRateToday: 28.5, lastMeasured: "23.05.2026",
    docCoverage: { spatial: false, tsr: true, land: false, opo: true, ker: true, conservation: true, license: true, reporting: true, hydro: false },
  },
  {
    id: "mw3", wellName: "14А-15", dataType: "fact", wellStatus: "producing", wellStatusLabel: "В добыче",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "mc1", clusterName: "Куст 14А", fieldId: "mf1", fieldName: "Западно-Сибирское",
    company: "ООО «НефтьГаз-Запад»", launchDate: "02.11.2022",
    oilCumTst: 22.1, oilRateToday: 31.4, lastMeasured: "23.05.2026",
    docCoverage: { spatial: true, tsr: true, land: true, opo: true, ker: true, conservation: true, license: true, reporting: true, hydro: true },
  },
  // --- ООО «НефтьГаз-Запад», Западно-Сибирское, Куст 7Д ---
  {
    id: "mw4", wellName: "7Д-4", dataType: "fact", wellStatus: "idle", wellStatusLabel: "Бездействующая",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "mc2", clusterName: "Куст 7Д", fieldId: "mf1", fieldName: "Западно-Сибирское",
    company: "ООО «НефтьГаз-Запад»", launchDate: "01.04.2019",
    oilCumTst: 88.4, oilRateToday: null, lastMeasured: "01.08.2023",
    docCoverage: { spatial: true, tsr: true, land: true, opo: true, ker: true, conservation: false, license: true, reporting: false, hydro: false },
  },
  {
    id: "mw5", wellName: "7Д-9", dataType: "fact", wellStatus: "idle", wellStatusLabel: "Бездействующая",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "mc2", clusterName: "Куст 7Д", fieldId: "mf1", fieldName: "Западно-Сибирское",
    company: "ООО «НефтьГаз-Запад»", launchDate: "15.09.2020",
    oilCumTst: 31.0, oilRateToday: null, lastMeasured: "15.10.2025",
    docCoverage: { spatial: true, tsr: true, land: true, opo: true, ker: true, conservation: false, license: true, reporting: false, hydro: false },
  },
  // --- ООО «НефтьГаз-Запад», Северное, Куст 3А ---
  {
    id: "mw6", wellName: "3А-17", dataType: "fact", wellStatus: "conservation", wellStatusLabel: "На консервации",
    wellType: "monitoring", wellTypeLabel: "Наблюдательная",
    clusterId: "mc3", clusterName: "Куст 3А", fieldId: "mf2", fieldName: "Северное",
    company: "ООО «НефтьГаз-Запад»", launchDate: "10.02.2018",
    oilCumTst: 0.0, oilRateToday: null, lastMeasured: "01.03.2024",
    docCoverage: { spatial: true, tsr: false, land: true, opo: true, ker: true, conservation: true, license: true, reporting: true, hydro: false },
  },
  // --- Новый куст СЕВ-8Е — запущен в добычу, пакета документов нет ---
  {
    id: "mw7", wellName: "8Е-1", dataType: "fact", wellStatus: "producing", wellStatusLabel: "В добыче",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "mc4", clusterName: "Куст 8Е", fieldId: "mf2", fieldName: "Северное",
    company: "ООО «НефтьГаз-Запад»", launchDate: "05.04.2026",
    oilCumTst: 3.1, oilRateToday: 55.2, lastMeasured: "23.05.2026",
    docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: false, reporting: false, hydro: false },
  },
  {
    id: "mw8", wellName: "8Е-2", dataType: "fact", wellStatus: "producing", wellStatusLabel: "В добыче",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "mc4", clusterName: "Куст 8Е", fieldId: "mf2", fieldName: "Северное",
    company: "ООО «НефтьГаз-Запад»", launchDate: "12.04.2026",
    oilCumTst: 2.4, oilRateToday: 48.7, lastMeasured: "23.05.2026",
    docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: false, reporting: false, hydro: false },
  },
  // --- АО «СеверДобыча», Арктическое ---
  {
    id: "mw9", wellName: "22Б-3", dataType: "fact", wellStatus: "producing", wellStatusLabel: "В добыче",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "mc5", clusterName: "Куст 22Б", fieldId: "mf3", fieldName: "Арктическое",
    company: "АО «СеверДобыча»", launchDate: "20.07.2020",
    oilCumTst: 112.8, oilRateToday: 78.3, lastMeasured: "23.05.2026",
    docCoverage: { spatial: false, tsr: true, land: false, opo: true, ker: true, conservation: true, license: true, reporting: true, hydro: false },
  },
  {
    id: "mw10", wellName: "31В-8", dataType: "fact", wellStatus: "producing", wellStatusLabel: "В добыче",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "mc6", clusterName: "Куст 31В", fieldId: "mf3", fieldName: "Арктическое",
    company: "АО «СеверДобыча»", launchDate: "14.11.2021",
    oilCumTst: 67.4, oilRateToday: 61.0, lastMeasured: "23.05.2026",
    docCoverage: { spatial: false, tsr: true, land: true, opo: true, ker: true, conservation: true, license: true, reporting: true, hydro: false },
  },
  // --- Куст 45Г — запущен, частично без документов ---
  {
    id: "mw11", wellName: "45Г-1", dataType: "fact", wellStatus: "producing", wellStatusLabel: "В добыче",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "mc7", clusterName: "Куст 45Г", fieldId: "mf3", fieldName: "Арктическое",
    company: "АО «СеверДобыча»", launchDate: "01.03.2026",
    oilCumTst: 5.8, oilRateToday: 92.4, lastMeasured: "23.05.2026",
    docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: true, reporting: false, hydro: false },
  },
  {
    id: "mw12", wellName: "45Г-2", dataType: "fact", wellStatus: "producing", wellStatusLabel: "В добыче",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "mc7", clusterName: "Куст 45Г", fieldId: "mf3", fieldName: "Арктическое",
    company: "АО «СеверДобыча»", launchDate: "07.03.2026",
    oilCumTst: 5.1, oilRateToday: 87.1, lastMeasured: "23.05.2026",
    docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: true, reporting: false, hydro: false },
  },
  // --- ПАО «ТюменьРесурс», Центральное ---
  {
    id: "mw13", wellName: "8Г-1", dataType: "fact", wellStatus: "producing", wellStatusLabel: "В добыче",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "mc8", clusterName: "Куст 8Г", fieldId: "mf4", fieldName: "Центральное",
    company: "ПАО «ТюменьРесурс»", launchDate: "03.06.2018",
    oilCumTst: 201.3, oilRateToday: 35.8, lastMeasured: "23.05.2026",
    docCoverage: { spatial: true, tsr: true, land: true, opo: true, ker: true, conservation: true, license: true, reporting: true, hydro: true },
  },
  {
    id: "mw14", wellName: "8Г-3", dataType: "fact", wellStatus: "conservation", wellStatusLabel: "На консервации",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "mc8", clusterName: "Куст 8Г", fieldId: "mf4", fieldName: "Центральное",
    company: "ПАО «ТюменьРесурс»", launchDate: "17.09.2019",
    oilCumTst: 44.1, oilRateToday: null, lastMeasured: "10.11.2025",
    docCoverage: { spatial: true, tsr: true, land: true, opo: true, ker: true, conservation: true, license: true, reporting: true, hydro: true },
  },

  // ═══════════════════════════════════════════════════════════
  // ПЛАНОВЫЕ ОБЪЕКТЫ 2026 (dataType: "plan", plannedYear: 2026)
  // ═══════════════════════════════════════════════════════════

  // --- ООО «НефтьГаз-Запад», Западно-Сибирское, плановый Куст 18Б (Q3 2026) ---
  {
    id: "pw1", wellName: "18Б-1", dataType: "plan", wellStatus: "producing", wellStatusLabel: "Плановый запуск",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "pmc1", clusterName: "Куст 18Б", fieldId: "mf1", fieldName: "Западно-Сибирское",
    company: "ООО «НефтьГаз-Запад»", launchDate: "",
    plannedLaunchDate: "01.09.2026", plannedOilRate: 52.0, plannedOilYear: 8.2,
    oilCumTst: 0, oilRateToday: null, lastMeasured: "",
    docCoverage: { spatial: false, tsr: true, land: false, opo: false, ker: false, conservation: true, license: true, reporting: false, hydro: false },
  },
  {
    id: "pw2", wellName: "18Б-2", dataType: "plan", wellStatus: "producing", wellStatusLabel: "Плановый запуск",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "pmc1", clusterName: "Куст 18Б", fieldId: "mf1", fieldName: "Западно-Сибирское",
    company: "ООО «НефтьГаз-Запад»", launchDate: "",
    plannedLaunchDate: "15.09.2026", plannedOilRate: 48.0, plannedOilYear: 7.6,
    oilCumTst: 0, oilRateToday: null, lastMeasured: "",
    docCoverage: { spatial: false, tsr: true, land: false, opo: false, ker: false, conservation: true, license: true, reporting: false, hydro: false },
  },
  // --- АО «СеверДобыча», Арктическое, плановый Куст 52Д (Q4 2026) ---
  {
    id: "pw3", wellName: "52Д-1", dataType: "plan", wellStatus: "producing", wellStatusLabel: "Плановый запуск",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "pmc2", clusterName: "Куст 52Д", fieldId: "mf3", fieldName: "Арктическое",
    company: "АО «СеверДобыча»", launchDate: "",
    plannedLaunchDate: "01.11.2026", plannedOilRate: 110.0, plannedOilYear: 14.3,
    oilCumTst: 0, oilRateToday: null, lastMeasured: "",
    docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: true, reporting: false, hydro: false },
  },
  {
    id: "pw4", wellName: "52Д-2", dataType: "plan", wellStatus: "producing", wellStatusLabel: "Плановый запуск",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "pmc2", clusterName: "Куст 52Д", fieldId: "mf3", fieldName: "Арктическое",
    company: "АО «СеверДобыча»", launchDate: "",
    plannedLaunchDate: "15.11.2026", plannedOilRate: 98.0, plannedOilYear: 12.8,
    oilCumTst: 0, oilRateToday: null, lastMeasured: "",
    docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: true, reporting: false, hydro: false },
  },
  // --- ПАО «ТюменьРесурс», Центральное, плановая скважина 8Г-5 (Q3 2026) ---
  {
    id: "pw5", wellName: "8Г-5", dataType: "plan", wellStatus: "producing", wellStatusLabel: "Плановый запуск",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "mc8", clusterName: "Куст 8Г", fieldId: "mf4", fieldName: "Центральное",
    company: "ПАО «ТюменьРесурс»", launchDate: "",
    plannedLaunchDate: "01.08.2026", plannedOilRate: 38.0, plannedOilYear: 6.1,
    oilCumTst: 0, oilRateToday: null, lastMeasured: "",
    docCoverage: { spatial: false, tsr: true, land: true, opo: true, ker: true, conservation: true, license: true, reporting: false, hydro: false },
  },

  // ═══════════════════════════════════════════════════════════
  // ПЛАНОВЫЕ ОБЪЕКТЫ 2027 (dataType: "plan", plannedYear: 2027)
  // ═══════════════════════════════════════════════════════════

  // --- ООО «НефтьГаз-Запад», Северное, плановый Куст 11Ж (Q1 2027) ---
  {
    id: "pw6", wellName: "11Ж-1", dataType: "plan", wellStatus: "producing", wellStatusLabel: "Плановый запуск",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "pmc3", clusterName: "Куст 11Ж", fieldId: "mf2", fieldName: "Северное",
    company: "ООО «НефтьГаз-Запад»", launchDate: "",
    plannedLaunchDate: "01.03.2027", plannedOilRate: 64.0, plannedOilYear: 16.5,
    oilCumTst: 0, oilRateToday: null, lastMeasured: "",
    docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: false, reporting: false, hydro: false },
  },
  {
    id: "pw7", wellName: "11Ж-2", dataType: "plan", wellStatus: "producing", wellStatusLabel: "Плановый запуск",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "pmc3", clusterName: "Куст 11Ж", fieldId: "mf2", fieldName: "Северное",
    company: "ООО «НефтьГаз-Запад»", launchDate: "",
    plannedLaunchDate: "15.03.2027", plannedOilRate: 58.0, plannedOilYear: 15.1,
    oilCumTst: 0, oilRateToday: null, lastMeasured: "",
    docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: false, reporting: false, hydro: false },
  },
  {
    id: "pw8", wellName: "11Ж-3", dataType: "plan", wellStatus: "producing", wellStatusLabel: "Плановый запуск",
    wellType: "injection", wellTypeLabel: "Нагнетательная",
    clusterId: "pmc3", clusterName: "Куст 11Ж", fieldId: "mf2", fieldName: "Северное",
    company: "ООО «НефтьГаз-Запад»", launchDate: "",
    plannedLaunchDate: "01.04.2027", plannedOilYear: 0,
    oilCumTst: 0, oilRateToday: null, lastMeasured: "",
    docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: false, reporting: false, hydro: false },
  },
  // --- АО «СеверДобыча», Арктическое (Блок Д), плановый Куст 67А (Q2 2027) ---
  {
    id: "pw9", wellName: "67А-1", dataType: "plan", wellStatus: "producing", wellStatusLabel: "Плановый запуск",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "pmc4", clusterName: "Куст 67А", fieldId: "mf5", fieldName: "Арктическое (Блок Д)",
    company: "АО «СеверДобыча»", launchDate: "",
    plannedLaunchDate: "01.06.2027", plannedOilRate: 145.0, plannedOilYear: 22.4,
    oilCumTst: 0, oilRateToday: null, lastMeasured: "",
    docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: false, reporting: false, hydro: false },
  },
  {
    id: "pw10", wellName: "67А-2", dataType: "plan", wellStatus: "producing", wellStatusLabel: "Плановый запуск",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "pmc4", clusterName: "Куст 67А", fieldId: "mf5", fieldName: "Арктическое (Блок Д)",
    company: "АО «СеверДобыча»", launchDate: "",
    plannedLaunchDate: "15.06.2027", plannedOilRate: 138.0, plannedOilYear: 21.0,
    oilCumTst: 0, oilRateToday: null, lastMeasured: "",
    docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: false, reporting: false, hydro: false },
  },
  // --- ПАО «ТюменьРесурс», Центральное, плановый Куст 12В (Q3 2027) ---
  {
    id: "pw11", wellName: "12В-1", dataType: "plan", wellStatus: "producing", wellStatusLabel: "Плановый запуск",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "pmc5", clusterName: "Куст 12В", fieldId: "mf4", fieldName: "Центральное",
    company: "ПАО «ТюменьРесурс»", launchDate: "",
    plannedLaunchDate: "01.09.2027", plannedOilRate: 44.0, plannedOilYear: 8.7,
    oilCumTst: 0, oilRateToday: null, lastMeasured: "",
    docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: true, reporting: false, hydro: false },
  },
  {
    id: "pw12", wellName: "12В-2", dataType: "plan", wellStatus: "producing", wellStatusLabel: "Плановый запуск",
    wellType: "production", wellTypeLabel: "Добывающая",
    clusterId: "pmc5", clusterName: "Куст 12В", fieldId: "mf4", fieldName: "Центральное",
    company: "ПАО «ТюменьРесурс»", launchDate: "",
    plannedLaunchDate: "15.09.2027", plannedOilRate: 41.0, plannedOilYear: 8.1,
    oilCumTst: 0, oilRateToday: null, lastMeasured: "",
    docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: true, reporting: false, hydro: false },
  },
]

export const masterfileClusters: MasterfileCluster[] = [
  // ─── ФАКТ ───────────────────────────────────────────────────────────────────
  { id: "mc1", clusterName: "Куст 14А", dataType: "fact", fieldId: "mf1", fieldName: "Западно-Сибирское", company: "ООО «НефтьГаз-Запад»", launchDate: "12.03.2021", wellCount: 3, producingCount: 3, idleCount: 0, totalOilRate: 102.0, docCoverage: { spatial: false, tsr: true, land: false, opo: true, ker: true, conservation: true, license: true, reporting: true, hydro: false } },
  { id: "mc2", clusterName: "Куст 7Д",  dataType: "fact", fieldId: "mf1", fieldName: "Западно-Сибирское", company: "ООО «НефтьГаз-Запад»", launchDate: "01.04.2019", wellCount: 2, producingCount: 0, idleCount: 2, totalOilRate: 0, docCoverage: { spatial: true, tsr: true, land: true, opo: true, ker: true, conservation: false, license: true, reporting: false, hydro: false } },
  { id: "mc3", clusterName: "Куст 3А",  dataType: "fact", fieldId: "mf2", fieldName: "Северное",           company: "ООО «НефтьГаз-Запад»", launchDate: "10.02.2018", wellCount: 1, producingCount: 0, idleCount: 0, totalOilRate: 0, docCoverage: { spatial: true, tsr: false, land: true, opo: true, ker: true, conservation: true, license: true, reporting: true, hydro: false } },
  { id: "mc4", clusterName: "Куст 8Е",  dataType: "fact", fieldId: "mf2", fieldName: "Северное",           company: "ООО «НефтьГаз-Запад»", launchDate: "05.04.2026", wellCount: 2, producingCount: 2, idleCount: 0, totalOilRate: 103.9, docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: false, reporting: false, hydro: false } },
  { id: "mc5", clusterName: "Куст 22Б", dataType: "fact", fieldId: "mf3", fieldName: "Арктическое",        company: "АО «СеверДобыча»",     launchDate: "20.07.2020", wellCount: 2, producingCount: 2, idleCount: 0, totalOilRate: 139.3, docCoverage: { spatial: false, tsr: true, land: false, opo: true, ker: true, conservation: true, license: true, reporting: true, hydro: false } },
  { id: "mc6", clusterName: "Куст 31В", dataType: "fact", fieldId: "mf3", fieldName: "Арктическое",        company: "АО «СеверДобыча»",     launchDate: "14.11.2021", wellCount: 2, producingCount: 2, idleCount: 0, totalOilRate: 61.0,  docCoverage: { spatial: false, tsr: true, land: true, opo: true, ker: true, conservation: true, license: true, reporting: true, hydro: false } },
  { id: "mc7", clusterName: "Куст 45Г", dataType: "fact", fieldId: "mf3", fieldName: "Арктическое",        company: "АО «СеверДобыча»",     launchDate: "01.03.2026", wellCount: 2, producingCount: 2, idleCount: 0, totalOilRate: 179.5, docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: true, reporting: false, hydro: false } },
  { id: "mc8", clusterName: "Куст 8Г",  dataType: "fact", fieldId: "mf4", fieldName: "Центральное",        company: "ПАО «ТюменьРесурс»",   launchDate: "03.06.2018", wellCount: 2, producingCount: 1, idleCount: 0, totalOilRate: 35.8,  docCoverage: { spatial: true, tsr: true, land: true, opo: true, ker: true, conservation: true, license: true, reporting: true, hydro: true } },

  // ─── ПЛАН 2026 ──────────────────────────────────────────────────────────────
  {
    id: "pmc1", clusterName: "Куст 18Б", dataType: "plan", plannedYear: 2026,
    fieldId: "mf1", fieldName: "Западно-Сибирское", company: "ООО «НефтьГаз-Запад»",
    launchDate: "", plannedLaunchDate: "01.09.2026",
    wellCount: 2, producingCount: 0, idleCount: 0,
    totalOilRate: 0, plannedTotalOilRate: 100.0,
    docCoverage: { spatial: false, tsr: true, land: false, opo: false, ker: false, conservation: true, license: true, reporting: false, hydro: false },
  },
  {
    id: "pmc2", clusterName: "Куст 52Д", dataType: "plan", plannedYear: 2026,
    fieldId: "mf3", fieldName: "Арктическое", company: "АО «СеверДобыча»",
    launchDate: "", plannedLaunchDate: "01.11.2026",
    wellCount: 2, producingCount: 0, idleCount: 0,
    totalOilRate: 0, plannedTotalOilRate: 208.0,
    docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: true, reporting: false, hydro: false },
  },

  // ─── ПЛАН 2027 ──────────────────────────────────────────────────────────────
  {
    id: "pmc3", clusterName: "Куст 11Ж", dataType: "plan", plannedYear: 2027,
    fieldId: "mf2", fieldName: "Северное", company: "ООО «НефтьГаз-Запад»",
    launchDate: "", plannedLaunchDate: "01.03.2027",
    wellCount: 3, producingCount: 0, idleCount: 0,
    totalOilRate: 0, plannedTotalOilRate: 122.0,
    docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: false, reporting: false, hydro: false },
  },
  {
    id: "pmc4", clusterName: "Куст 67А", dataType: "plan", plannedYear: 2027,
    fieldId: "mf5", fieldName: "Арктическое (Блок Д)", company: "АО «СеверДобыча»",
    launchDate: "", plannedLaunchDate: "01.06.2027",
    wellCount: 2, producingCount: 0, idleCount: 0,
    totalOilRate: 0, plannedTotalOilRate: 283.0,
    docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: false, reporting: false, hydro: false },
  },
  {
    id: "pmc5", clusterName: "Куст 12В", dataType: "plan", plannedYear: 2027,
    fieldId: "mf4", fieldName: "Центральное", company: "ПАО «ТюменьРесурс»",
    launchDate: "", plannedLaunchDate: "01.09.2027",
    wellCount: 2, producingCount: 0, idleCount: 0,
    totalOilRate: 0, plannedTotalOilRate: 85.0,
    docCoverage: { spatial: false, tsr: false, land: false, opo: false, ker: false, conservation: true, license: true, reporting: false, hydro: false },
  },
]

// ── Дорожная карта ────────────────────────────────────────────────────────────
// Для каждого модуля: какие шаги нужны, если объект не покрыт документами.
// plannedDeadline (опциональн��): для плановы�� объектов — крайний срок до запуска.

export type RoadmapModule = keyof MasterfileWell["docCoverage"]

export interface RoadmapStep {
  order: number
  action: string
  department: string
  daysToComplete: number
}

export const roadmapTemplates: Record<RoadmapModule, { title: string; steps: RoadmapStep[] }> = {
  spatial: {
    title: "Проверка пространственных координат",
    steps: [
      { order: 1, action: "Запросить инклинометрические ��анные и данные ГТИ по скважине у буровой службы", department: "Буровой отдел", daysToComplete: 5 },
      { order: 2, action: "Актуализировать векторный контур запасов в ГИС-системе (подсчётный план)", department: "Геологическая служба", daysToComplete: 10 },
      { order: 3, action: "Выполнить пространственную проверку совпадения за��оя с контуром в ГИС", department: "Служба геолого-маркшейдерского контроля", daysToComplete: 5 },
      { order: 4, action: "Оформить акт пространственной проверки / протокол нарушения", department: "Служба надзора", daysToComplete: 3 },
    ],
  },
  tsr: {
    title: "Включение в технологическую схему разработки (ТСР)",
    steps: [
      { order: 1, action: "Подготовить геолого-технические обоснования включения объекта в ТСР", department: "Геологическая служба", daysToComplete: 15 },
      { order: 2, action: "Сформировать проектные показатели добычи (дебит, обводнённость, ГФ) для нового объекта", department: "Отдел разработки", daysToComplete: 10 },
      { order: 3, action: "Внести изменения в действующий документ ТСР (дополнение / пересмотр)", department: "Отдел разработки", daysToComplete: 20 },
      { order: 4, action: "Согласовать изменения ТСР с Роснедра (экспертиза)", department: "Юридический отдел / Управление лицензирования", daysToComplete: 60 },
      { order: 5, action: "Получить утверждённый протокол ЦКР / ТКР", department: "Управление лицензирования", daysToComplete: 30 },
    ],
  },
  land: {
    title: "Оформление документов на земельный отвод",
    steps: [
      { order: 1, action: "Провести землеустроительные работы, подготовить межевой план по объекту", department: "Земельный отдел", daysToComplete: 20 },
      { order: 2, action: "Подать заявление на аренду / установление сервитута в орган исполнительной власти субъекта", department: "Земельный отдел", daysToComplete: 5 },
      { order: 3, action: "Получить разрешение на использование земель (временное), при необходимости", department: "Земельный отдел", daysToComplete: 30 },
      { order: 4, action: "Заключить и зарегистрировать договор аренды земельного участка в Росреестре", department: "Юридический отдел", daysToComplete: 30 },
      { order: 5, action: "Загрузить правоустанавливающий документ в систему КоНад", department: "ОГД (учёт документов)", daysToComplete: 2 },
    ],
  },
  opo: {
    title: "Получение разрешения на эксплуатацию ОПО",
    steps: [
      { order: 1, action: "Провести идентификацию объекта как ОПО, определит�� класс опасности (I–IV)", department: "Служба промышленной безопасности", daysToComplete: 10 },
      { order: 2, action: "Разработать декларацию промышленной безопасности (если класс I–II)", department: "Служба ПБ / проектная организация", daysToComplete: 30 },
      { order: 3, action: "Поставить объект на учёт в Ростехнадзор (ФГИС ОПО)", department: "Служба ПБ", daysToComplete: 15 },
      { order: 4, action: "Провести первичный технический осмотр / экспертизу промышленной безопасности", department: "Аккредитованная экспертная организация", daysToComplete: 20 },
      { order: 5, action: "Получить разрешение на эксплуатацию ОПО в Ростехнадзоре", department: "Служба ПБ", daysToComplete: 30 },
    ],
  },
  ker: {
    title: "Получение комплексного экологического разрешения (КЭР)",
    steps: [
      { order: 1, action: "Разработать / актуализировать инвентаризацию источников выбросов по объекту", department: "Экологическая служба", daysToComplete: 20 },
      { order: 2, action: "Выполнить расчёт нормативов допустимых выбросов (НДВ / ВСВ)", department: "Экологическая служба / специализированная организация", daysToComplete: 30 },
      { order: 3, action: "Подготовить заявку на получение КЭР, приложить НДВ и ПНООЛР", department: "Экологическая служба", daysToComplete: 15 },
      { order: 4, action: "Подать заявку в Росприроднадзор через ГИСП / личный кабинет", department: "Экологическая служб��", daysToComplete: 5 },
      { order: 5, action: "Получить КЭР (рассмотрение Росприроднадзором)", department: "Экологическая служба", daysToComplete: 90 },
    ],
  },
  conservation: {
    title: "Оформление акта консервации скважины",
    steps: [
      { order: 1, action: "Подготовить план-программу консервации скважины", department: "Отдел разработки / Геологическая служба", daysToComplete: 7 },
      { order: 2, action: "Согласовать план-программу консервации с территориальным органом Роснедра", department: "Управление лицензирования", daysToComplete: 20 },
      { order: 3, action: "Провести технические мероприятия по консервации (установка пробок, герметизация)", department: "Буровой отдел / ТКРС", daysToComplete: 10 },
      { order: 4, action: "Оформить и подписать Акт консервации, утвердить у главного инженера", department: "Технический отдел", daysToComplete: 5 },
      { order: 5, action: "Загрузить акт консервации в систему КоНад и обновить статус скважины", department: "ОГД (учёт документов)", daysToComplete: 2 },
    ],
  },
  license: {
    title: "Подтверждение покрытия объекта лицензией / внесение в программу работ",
    steps: [
      { order: 1, action: "Проверить координаты объекта на соответствие границам лицензионного участка", department: "Управление лицензирования / Геологическая служба", daysToComplete: 5 },
      { order: 2, action: "В случае выхода за границы: подать заявление об измене��ии границ ЛУ в Роснедра", department: "Управление лицензирования / Юридический отдел", daysToComplete: 90 },
      { order: 3, action: "Внести объект в программу работ по лицензии (корректировка ПР)", department: "Управление лицензирования", daysToComplete: 20 },
      { order: 4, action: "Согласовать изменения в программе работ с Роснедра", department: "Управление лицензирования", daysToComplete: 30 },
    ],
  },
  reporting: {
    title: "Включение в регламентную отчётность (6-ГР)",
    steps: [
      { order: 1, action: "Проверить наличие скважины / куста в реестре объектов 6-ГР в системе учёта", department: "Отдел геологической документации", daysToComplete: 2 },
      { order: 2, action: "Добавить объект в форму 6-ГР, внести данные добычи начиная с даты запуска", department: "Отдел геологической документации", daysToComplete: 5 },
      { order: 3, action: "Представить корректировочный / уточняющий отчёт 6-ГР в Роснедра", department: "Отдел геологической документации / Юридический отдел", daysToComplete: 15 },
    ],
  },
  hydro: {
    title: "Гидрогеологическое сопровождение объекта добычи",
    steps: [
      { order: 1, action: "Проверить актуальность подсчёта запасов и программы ПГИН по данному месторождению", department: "Геологическая служба / Отдел гидрогеологии", daysToComplete: 5 },
      { order: 2, action: "Получить / актуализировать программу гидрогеологических исследований (ПГИН)", department: "Отдел гидрогеологии", daysToComplete: 30 },
      { order: 3, action: "Скорректировать / переоформить проект размещения (захоронения) подземных вод", department: "Отдел гидрогеологии / Юридический отдел", daysToComplete: 45 },
      { order: 4, action: "Включить объект в программу мониторинга подземных вод и установить пункты наблюдений", department: "Отдел экологии / Гидрогеологическая лаборатория", daysToComplete: 20 },
      { order: 5, action: "Согласовать откорректированный том ТСР (водный раздел) с ЦКР Роснедра", department: "Технологический отдел / ЦКР", daysToComplete: 60 },
    ],
  },
}

// ── Вычислить дорожные карты для объектов без покрытия ──────────────────────
export interface RoadmapItem {
  module: RoadmapModule
  moduleTitle: string
  steps: (RoadmapStep & { targetDate: string })[]
  totalDays: number
  /**
   * Для плановых объектов — крайний срок завершения всех документов (= дата запуска).
   * null для фактических объектов.
   */
  plannedDeadline: string | null
  /**
   * ok   — документы успевают оформить до запуска
   * warn — меньше 30 р.д. до запуска
   * critical — документы не успевают оформить до запуска
   */
  deadlineStatus: "ok" | "warn" | "critical" | null
}

function addWorkingDays(from: Date, days: number): string {
  let d = new Date(from)
  let added = 0
  while (added < days) {
    d.setDate(d.getDate() + 1)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) added++
  }
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function countWorkingDaysBetween(from: Date, to: Date): number {
  let count = 0
  let d = new Date(from)
  while (d < to) {
    d.setDate(d.getDate() + 1)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) count++
  }
  return count
}

function parseDDMMYYYY(s: string): Date | null {
  if (!s) return null
  const [dd, mm, yyyy] = s.split(".")
  if (!dd || !mm || !yyyy) return null
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd))
}

function buildRoadmapItems(
  modules: [RoadmapModule, boolean][],
  startDate: Date,
  plannedLaunchDate: string | null,
): RoadmapItem[] {
  const items: RoadmapItem[] = []
  const launchDate = plannedLaunchDate ? parseDDMMYYYY(plannedLaunchDate) : null

  for (const [mod, covered] of modules) {
    if (covered) continue
    const tpl = roadmapTemplates[mod]
    let cursor = startDate
    const steps = tpl.steps.map((s) => {
      const targetDate = addWorkingDays(cursor, s.daysToComplete)
      cursor = new Date(cursor)
      cursor.setDate(cursor.getDate() + s.daysToComplete)
      return { ...s, targetDate }
    })
    const totalDays = tpl.steps.reduce((acc, s) => acc + s.daysToComplete, 0)

    let plannedDeadline: string | null = null
    let deadlineStatus: RoadmapItem["deadlineStatus"] = null

    if (launchDate) {
      plannedDeadline = launchDate.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
      const workingDaysAvailable = countWorkingDaysBetween(startDate, launchDate)
      const slack = workingDaysAvailable - totalDays
      if (slack < 0) {
        deadlineStatus = "critical"
      } else if (slack < 30) {
        deadlineStatus = "warn"
      } else {
        deadlineStatus = "ok"
      }
    }

    items.push({ module: mod, moduleTitle: tpl.title, steps, totalDays, plannedDeadline, deadlineStatus })
  }
  return items
}

export function buildRoadmapForWell(well: MasterfileWell): RoadmapItem[] {
  const today = new Date(2026, 4, 23) // 23.05.2026
  const modules = Object.entries(well.docCoverage) as [RoadmapModule, boolean][]
  const startDate = well.dataType === "plan" ? today : today
  const plannedLaunch = well.dataType === "plan" ? (well.plannedLaunchDate ?? null) : null
  return buildRoadmapItems(modules, startDate, plannedLaunch)
}

export function buildRoadmapForCluster(cluster: MasterfileCluster): RoadmapItem[] {
  const today = new Date(2026, 4, 23)
  const modules = Object.entries(cluster.docCoverage) as [RoadmapModule, boolean][]
  const plannedLaunch = cluster.dataType === "plan" ? (cluster.plannedLaunchDate ?? null) : null
  return buildRoadmapItems(modules, today, plannedLaunch)
}

// ── Хелперы ──────────────────────────────────────────────────────────────────

/** Только фактические скважины */
export const masterfileFactWells = masterfileWells.filter((w) => w.dataType === "fact")
/** Только плановые скважины */
export const masterfilePlanWells = masterfileWells.filter((w) => w.dataType === "plan")
/** Плановые скважины 2026 */
export const masterfilePlanWells2026 = masterfileWells.filter(
  (w) => w.dataType === "plan" && w.plannedLaunchDate?.endsWith("2026"),
)
/** Плановые скважины 2027 */
export const masterfilePlanWells2027 = masterfileWells.filter(
  (w) => w.dataType === "plan" && w.plannedLaunchDate?.endsWith("2027"),
)

/** Только фактические кусты */
export const masterfileFactClusters = masterfileClusters.filter((c) => c.dataType === "fact")
/** Плановые кусты 2026 */
export const masterfilePlanClusters2026 = masterfileClusters.filter(
  (c) => c.dataType === "plan" && c.plannedYear === 2026,
)
/** Плановые кусты 2027 */
export const masterfilePlanClusters2027 = masterfileClusters.filter(
  (c) => c.dataType === "plan" && c.plannedYear === 2027,
)

// ── Список всех объектов с пропущенными документами ──────────────────────────
export function getUncoveredObjects() {
  return masterfileWells.filter((w) =>
    Object.values(w.docCoverage).some((v) => !v)
  )
}

export function getUncoveredClusters() {
  return masterfileClusters.filter((c) =>
    Object.values(c.docCoverage).some((v) => !v)
  )
}

// ---------- SHARED ----------

export const kpiCards: KpiCard[] = [
  {
    id: "1",
    label: "Критические нарушения",
    value: 23,
    severity: "critical",
    description: "Требуют немедленного реагирования",
    delta: { value: 3, direction: "up" },
  },
  {
    id: "2",
    label: "Предупреждения",
    value: 47,
    severity: "warning",
    description: "Нарушения в стадии устранения",
    delta: { value: 2, direction: "down" },
  },
  {
    id: "3",
    label: "Объектов под ��адзором",
    value: 312,
    severity: "ok",
    description: "Лицензионных участков и месторождений",
  },
  {
    id: "4",
    label: "Скважин без замечаний",
    value: 1847,
    unit: "/ 2104",
    severity: "info",
    description: "Из общего фонда скважин",
  },
]

export const hierarchyRows: HierarchyRow[] = [
  {
    id: "c1",
    level: "company",
    name: "ООО «НефтьГаз-Запад»",
    parentId: null,
    violations: { spatial: 3, tsr: 5, land: 2, opo: 1, ker: 0, conservation: 2, license: 1, reporting: 3, hydro: 4 },
    status: "critical",
    isExpanded: true,
  },
  {
    id: "f1",
    level: "field",
    name: "Западно-Сибирское м-е",
    parentId: "c1",
    violations: { spatial: 2, tsr: 3, land: 1, opo: 1, ker: 0, conservation: 1, license: 1, reporting: 2, hydro: 3 },
    status: "critical",
    isExpanded: true,
  },
  {
    id: "a1",
    level: "area",
    name: "Участок недр №14",
    parentId: "f1",
    violations: { spatial: 2, tsr: 1, land: 0, opo: 1, ker: 0, conservation: 0, license: 1, reporting: 1, hydro: 3 },
    status: "critical",
  },
  {
    id: "cl1",
    level: "cluster",
    name: "Куст 14А",
    parentId: "a1",
    violations: { spatial: 2, tsr: 0, land: 0, opo: 1, ker: 0, conservation: 0, license: 0, reporting: 0, hydro: 2 },
    status: "critical",
  },
  {
    id: "w1",
    level: "well",
    name: "Скважина 14А-7 (доб.)",
    parentId: "cl1",
    violations: { spatial: 1, tsr: 0, land: 0, opo: 0, ker: 0, conservation: 0, license: 0, reporting: 0, hydro: 1 },
    status: "critical",
  },
  {
    id: "w2",
    level: "well",
    name: "Скважина 14А-12 (доб.)",
    parentId: "cl1",
    violations: { spatial: 1, tsr: 0, land: 0, opo: 1, ker: 0, conservation: 0, license: 0, reporting: 0, hydro: 1 },
    status: "critical",
  },
  {
    id: "f2",
    level: "field",
    name: "Северное м-е",
    parentId: "c1",
    violations: { spatial: 0, tsr: 2, land: 1, opo: 0, ker: 0, conservation: 1, license: 0, reporting: 1, hydro: 2 },
    status: "warning",
  },
  {
    id: "c2",
    level: "company",
    name: "АО «СеверДобыча»",
    parentId: null,
    violations: { spatial: 0, tsr: 4, land: 3, opo: 0, ker: 2, conservation: 0, license: 2, reporting: 1, hydro: 1 },
    status: "warning",
  },
  {
    id: "f3",
    level: "field",
    name: "Арктическое м-е",
    parentId: "c2",
    violations: { spatial: 0, tsr: 2, land: 2, opo: 0, ker: 2, conservation: 0, license: 1, reporting: 0, hydro: 0 },
    status: "warning",
  },
  {
    id: "c3",
    level: "company",
    name: "ПАО «ТюменьРесурс»",
    parentId: null,
    violations: { spatial: 0, tsr: 0, land: 0, opo: 0, ker: 0, conservation: 0, license: 0, reporting: 0, hydro: 0 },
    status: "ok",
  },
]

export const checkModules: CheckModule[] = [
  { id: "1", code: "ПРОСТ", title: "Пространственные проверки", critical: 6, warning: 4, ok: 302, lastChecked: "23.05.2026 08:00" },
  { id: "2", code: "ТСР", title: "Технологические схемы разработки", critical: 3, warning: 12, ok: 297, lastChecked: "23.05.2026 08:00" },
  { id: "3", code: "ЗЕМЛЯ", title: "Земельные отводы и аренда", critical: 2, warning: 8, ok: 302, lastChecked: "22.05.2026 22:00" },
  { id: "4", code: "ОПО", title: "Опасные производственные объекты", critical: 2, warning: 5, ok: 305, lastChecked: "23.05.2026 08:00" },
  { id: "5", code: "КЭР", title: "Комплексные экологич��ские разрешения", critical: 4, warning: 7, ok: 301, lastChecked: "22.05.2026 18:00" },
  { id: "6", code: "КОНС", title: "Консервация и ликвидация скважин", critical: 2, warning: 6, ok: 304, lastChecked: "23.05.2026 08:00" },
  { id: "7", code: "ЛИЦ", title: "Лицензирование недропользования", critical: 2, warning: 3, ok: 307, lastChecked: "21.05.2026 12:00" },
  { id: "8", code: "ОТЧЁТ", title: "Регламентная отчётность", critical: 2, warning: 2, ok: 308, lastChecked: "23.05.2026 08:00" },
]

export const recentAlerts = [
  { id: "1", severity: "critical" as ViolationSeverity, module: "ПРОСТ", text: "Забой скв. 14А-7 выходит за контур промышленных категорий запасов (В1+В2)", company: "ООО «НефтГаз-Запад»", field: "Западно-Сибирское", time: "сегодня, 07:45" },
  { id: "2", severity: "critical" as ViolationSeverity, module: "КЭР", text: "Превышение нормативных выбросов на ФУ-3 в 2.4 раза. Объект: факельная уст��новка", company: "АО «СеверДобыча»", field: "Арктическое", time: "вчера, 22:10" },
  { id: "3", severity: "critical" as ViolationSeverity, module: "ОПО", text: "Отсутствует разрешение на эксплуатацию ОПО «ДКС-2». Документ истёк 01.04.2026", company: "ООО «НефтьГаз-Запад»", field: "Западно-Сибирское", time: "вчера, 14:30" },
  { id: "4", severity: "warning" as ViolationSeverity, module: "ТСР", text: "Фактическая добыча нефти превышает плановую по ТСР на 18%: 285 тыс.т/год vs 241 тыс.т/год", company: "АО «СеверДобыча»", field: "Арктическое", time: "22.05.2026" },
  { id: "5", severity: "warning" as ViolationSeverity, module: "ЗЕМЛЯ", text: "Объект обустройства «КП-14» расположен за пределами границ договора аренды №47/2021", company: "ООО «НефтьГаз-Запад»", field: "Западно-Сибирское", time: "21.05.2026" },
  { id: "6", severity: "warning" as ViolationSeverity, module: "ЛИЦ", text: "До окончания лицензии на разведку и добычу ТЮМ-12345-НЭ осталось 42 дня", company: "АО «СеверДобыча»", field: "Арктическое", time: "20.05.2026" },
]

// ──────────────────────────────────────────────────────────────────────────────
// MONTHLY PRODUCTION TIMESERIES (для графика сравнения с ТСР и КЭР)
// Январь–Май 2026 (5 месяцев факт) + прогноз до декабря
// ──────────────────────────────────────────────────────────────────────────────

export interface MonthlyProductionPoint {
  month: string        // "янв", "фев", …
  monthIndex: number   // 1–12
  /** Добыча нефти, тыс.т */
  oilFact: number | null   // null = прогноз
  oilPlanTsr: number
  oilForecast: number | null  // null = до этого месяца
  /** Утилизация ПНГ, % */
  gasUtilFact: number | null
  gasUtilPlanTsr: number
  /** КЭР: выбросы SO₂ факельной уст., т */
  emissionFact: number | null
  emissionLimit: number       // нормативный предел за месяц
  emissionForecast: number | null
  isFact: boolean             // true = факт, false = прогноз/план
}

export interface FieldProductionSeries {
  fieldId: string
  fieldName: string
  company: string
  tsrDoc: string
  kerDoc: string
  /** Допустимое превышение добычи, % */
  oilTolerancePct: number
  /** Допустимое снижение утилизации ПНГ, % */
  gasUtilTolerancePct: number
  months: MonthlyProductionPoint[]
}

// Расчёт статуса по превышению допуска
export function getDeviationStatus(
  fact: number,
  plan: number,
  tolerancePct: number,
  direction: "over" | "under" | "both" = "both"
): ViolationSeverity {
  const dev = ((fact - plan) / plan) * 100
  if (direction === "over" && dev > tolerancePct) return dev > tolerancePct * 2 ? "critical" : "warning"
  if (direction === "under" && dev < -tolerancePct) return Math.abs(dev) > tolerancePct * 2 ? "critical" : "warning"
  if (direction === "both") {
    if (Math.abs(dev) > tolerancePct * 2) return "critical"
    if (Math.abs(dev) > tolerancePct) return "warning"
  }
  return "ok"
}

export const fieldProductionSeries: FieldProductionSeries[] = [
  // ── АО «СеверДобыча» — Арктическое ─────────────────────────────────────────
  {
    fieldId: "mf3", fieldName: "Арктическое", company: "АО «СеверДобыча»",
    tsrDoc: "ТСР-АРК-2023", kerDoc: "КЭР-АРК-2024",
    oilTolerancePct: 5, gasUtilTolerancePct: 3,
    months: [
      { month: "янв", monthIndex: 1,  isFact: true,  oilFact: 20.2, oilPlanTsr: 20.1, oilForecast: null, gasUtilFact: 90.1, gasUtilPlanTsr: 95, emissionFact: 10.2, emissionLimit: 85/12, emissionForecast: null },
      { month: "фев", monthIndex: 2,  isFact: true,  oilFact: 21.5, oilPlanTsr: 20.1, oilForecast: null, gasUtilFact: 87.3, gasUtilPlanTsr: 95, emissionFact: 12.1, emissionLimit: 85/12, emissionForecast: null },
      { month: "мар", monthIndex: 3,  isFact: true,  oilFact: 23.8, oilPlanTsr: 20.1, oilForecast: null, gasUtilFact: 85.0, gasUtilPlanTsr: 95, emissionFact: 14.8, emissionLimit: 85/12, emissionForecast: null },
      { month: "апр", monthIndex: 4,  isFact: true,  oilFact: 24.1, oilPlanTsr: 20.1, oilForecast: null, gasUtilFact: 83.2, gasUtilPlanTsr: 95, emissionFact: 17.3, emissionLimit: 85/12, emissionForecast: null },
      { month: "май", monthIndex: 5,  isFact: true,  oilFact: 25.4, oilPlanTsr: 20.1, oilForecast: null, gasUtilFact: 82.0, gasUtilPlanTsr: 95, emissionFact: 18.9, emissionLimit: 85/12, emissionForecast: null },
      { month: "июн", monthIndex: 6,  isFact: false, oilFact: null, oilPlanTsr: 20.1, oilForecast: 25.8, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 85/12, emissionForecast: 19.4 },
      { month: "июл", monthIndex: 7,  isFact: false, oilFact: null, oilPlanTsr: 20.1, oilForecast: 26.0, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 85/12, emissionForecast: 19.6 },
      { month: "авг", monthIndex: 8,  isFact: false, oilFact: null, oilPlanTsr: 20.1, oilForecast: 25.5, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 85/12, emissionForecast: 19.1 },
      { month: "сен", monthIndex: 9,  isFact: false, oilFact: null, oilPlanTsr: 20.1, oilForecast: 25.9, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 85/12, emissionForecast: 19.5 },
      { month: "окт", monthIndex: 10, isFact: false, oilFact: null, oilPlanTsr: 20.1, oilForecast: 26.2, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 85/12, emissionForecast: 19.8 },
      { month: "ноя", monthIndex: 11, isFact: false, oilFact: null, oilPlanTsr: 20.1, oilForecast: 25.7, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 85/12, emissionForecast: 19.3 },
      { month: "дек", monthIndex: 12, isFact: false, oilFact: null, oilPlanTsr: 20.1, oilForecast: 25.1, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 85/12, emissionForecast: 18.8 },
    ],
  },
  // ── ООО «НефтьГаз-Запад» — Западно-Сибирское ────────────────────────────────
  {
    fieldId: "mf1", fieldName: "Западно-Сибирское", company: "ООО «НефтьГаз-Запад»",
    tsrDoc: "ТСР-ЗСМ-2024", kerDoc: "КЭР-ЗСМ-2022",
    oilTolerancePct: 5, gasUtilTolerancePct: 3,
    months: [
      { month: "янв", monthIndex: 1,  isFact: true,  oilFact: 38.5, oilPlanTsr: 40.0, oilForecast: null, gasUtilFact: 95.8, gasUtilPlanTsr: 95, emissionFact: 1.8, emissionLimit: 48/12, emissionForecast: null },
      { month: "фев", monthIndex: 2,  isFact: true,  oilFact: 39.2, oilPlanTsr: 40.0, oilForecast: null, gasUtilFact: 96.0, gasUtilPlanTsr: 95, emissionFact: 1.7, emissionLimit: 48/12, emissionForecast: null },
      { month: "мар", monthIndex: 3,  isFact: true,  oilFact: 39.8, oilPlanTsr: 40.0, oilForecast: null, gasUtilFact: 95.5, gasUtilPlanTsr: 95, emissionFact: 1.9, emissionLimit: 48/12, emissionForecast: null },
      { month: "апр", monthIndex: 4,  isFact: true,  oilFact: 38.7, oilPlanTsr: 40.0, oilForecast: null, gasUtilFact: 96.3, gasUtilPlanTsr: 95, emissionFact: 1.8, emissionLimit: 48/12, emissionForecast: null },
      { month: "май", monthIndex: 5,  isFact: true,  oilFact: 39.3, oilPlanTsr: 40.0, oilForecast: null, gasUtilFact: 97.1, gasUtilPlanTsr: 95, emissionFact: 1.7, emissionLimit: 48/12, emissionForecast: null },
      { month: "июн", monthIndex: 6,  isFact: false, oilFact: null, oilPlanTsr: 40.0, oilForecast: 39.5, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 48/12, emissionForecast: 1.8 },
      { month: "июл", monthIndex: 7,  isFact: false, oilFact: null, oilPlanTsr: 40.0, oilForecast: 40.1, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 48/12, emissionForecast: 1.9 },
      { month: "авг", monthIndex: 8,  isFact: false, oilFact: null, oilPlanTsr: 40.0, oilForecast: 39.8, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 48/12, emissionForecast: 1.8 },
      { month: "сен", monthIndex: 9,  isFact: false, oilFact: null, oilPlanTsr: 40.0, oilForecast: 39.0, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 48/12, emissionForecast: 1.7 },
      { month: "окт", monthIndex: 10, isFact: false, oilFact: null, oilPlanTsr: 40.0, oilForecast: 38.8, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 48/12, emissionForecast: 1.7 },
      { month: "ноя", monthIndex: 11, isFact: false, oilFact: null, oilPlanTsr: 40.0, oilForecast: 39.2, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 48/12, emissionForecast: 1.8 },
      { month: "дек", monthIndex: 12, isFact: false, oilFact: null, oilPlanTsr: 40.0, oilForecast: 38.5, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 48/12, emissionForecast: 1.7 },
    ],
  },
  // ── ПАО «ТюменьРесурс» — Центральное ────────────────────────────────────────
  {
    fieldId: "mf4", fieldName: "Центральное", company: "ПАО «ТюменьРесурс»",
    tsrDoc: "ТСР-ЦНТ-2022", kerDoc: "КЭР-ЦНТ-2023",
    oilTolerancePct: 5, gasUtilTolerancePct: 3,
    months: [
      { month: "янв", monthIndex: 1,  isFact: true,  oilFact: 12.8, oilPlanTsr: 12.9, oilForecast: null, gasUtilFact: 94.2, gasUtilPlanTsr: 95, emissionFact: 1.5, emissionLimit: 42/12, emissionForecast: null },
      { month: "фев", monthIndex: 2,  isFact: true,  oilFact: 12.6, oilPlanTsr: 12.9, oilForecast: null, gasUtilFact: 95.1, gasUtilPlanTsr: 95, emissionFact: 1.6, emissionLimit: 42/12, emissionForecast: null },
      { month: "мар", monthIndex: 3,  isFact: true,  oilFact: 12.9, oilPlanTsr: 12.9, oilForecast: null, gasUtilFact: 95.8, gasUtilPlanTsr: 95, emissionFact: 1.5, emissionLimit: 42/12, emissionForecast: null },
      { month: "апр", monthIndex: 4,  isFact: true,  oilFact: 13.0, oilPlanTsr: 12.9, oilForecast: null, gasUtilFact: 95.3, gasUtilPlanTsr: 95, emissionFact: 1.6, emissionLimit: 42/12, emissionForecast: null },
      { month: "май", monthIndex: 5,  isFact: true,  oilFact: 12.7, oilPlanTsr: 12.9, oilForecast: null, gasUtilFact: 94.8, gasUtilPlanTsr: 95, emissionFact: 1.5, emissionLimit: 42/12, emissionForecast: null },
      { month: "июн", monthIndex: 6,  isFact: false, oilFact: null, oilPlanTsr: 12.9, oilForecast: 12.8, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 42/12, emissionForecast: 1.5 },
      { month: "июл", monthIndex: 7,  isFact: false, oilFact: null, oilPlanTsr: 12.9, oilForecast: 12.9, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 42/12, emissionForecast: 1.6 },
      { month: "авг", monthIndex: 8,  isFact: false, oilFact: null, oilPlanTsr: 12.9, oilForecast: 12.8, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 42/12, emissionForecast: 1.5 },
      { month: "сен", monthIndex: 9,  isFact: false, oilFact: null, oilPlanTsr: 12.9, oilForecast: 12.7, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 42/12, emissionForecast: 1.5 },
      { month: "окт", monthIndex: 10, isFact: false, oilFact: null, oilPlanTsr: 12.9, oilForecast: 12.9, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 42/12, emissionForecast: 1.6 },
      { month: "ноя", monthIndex: 11, isFact: false, oilFact: null, oilPlanTsr: 12.9, oilForecast: 12.8, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 42/12, emissionForecast: 1.5 },
      { month: "дек", monthIndex: 12, isFact: false, oilFact: null, oilPlanTsr: 12.9, oilForecast: 12.6, gasUtilFact: null, gasUtilPlanTsr: 95, emissionFact: null, emissionLimit: 42/12, emissionForecast: 1.4 },
    ],
  },
]

// ──────────────────────────────────────────────────────────────────────────────
// HYDROGEOLOGY MODULE
// ──────────────────────────────────────────────────────────────────────────────

export type HydroDocType = "reserves" | "tsr_water" | "pgin" | "water_placement" | "monitoring"

export interface HydroDocument {
  id: string
  company: string
  fieldId: string
  fieldName: string
  docType: HydroDocType
  docTypeLabel: string
  docNumber: string
  docTitle: string
  /** Орган, выдавший / утвердивший */
  approvedBy: string
  approvalDate: string
  expiryDate: string | null
  daysLeft: number | null
  status: ViolationSeverity
  comment: string
  /** Относится ли к подпиточной (технической) воде */
  isWaterDoc: boolean
}

export const hydroDocs: HydroDocument[] = [
  // ── Подсчёты запасов ────────────────────────────────────────────────────────
  {
    id: "hd1", company: "АО «СеверДобыча»", fieldId: "mf3", fieldName: "Арктическое",
    docType: "reserves", docTypeLabel: "Подсчёт запасов",
    docNumber: "ГКЗ-АРК-2021-07", docTitle: "Подсчёт запасов нефти Арктического м-я, кат. В1+В2+С1",
    approvedBy: "ГКЗ Роснедра", approvalDate: "15.07.2021", expiryDate: null, daysLeft: null,
    status: "warning",
    comment: "Запасы поставлены на учёт. Требуется переоценка по результатам добычи 2023–2025 гг. — фактика существенно отклонилась от проектных значений.",
    isWaterDoc: false,
  },
  {
    id: "hd2", company: "ООО «НефтьГаз-Запад»", fieldId: "mf1", fieldName: "Западно-Сибирское",
    docType: "reserves", docTypeLabel: "Подсчёт запасов",
    docNumber: "ГКЗ-ЗСМ-2019-03", docTitle: "Пересчёт запасов нефти Западно-Сибирского м-я",
    approvedBy: "ГКЗ Роснедра", approvalDate: "20.03.2019", expiryDate: null, daysLeft: null,
    status: "ok",
    comment: "Актуален. Плановый пересчёт в 2027 г.",
    isWaterDoc: false,
  },
  {
    id: "hd3", company: "ООО «НефтьГаз-Запад»", fieldId: "mf2", fieldName: "Северное",
    docType: "reserves", docTypeLabel: "Подсчёт запасов",
    docNumber: "ГКЗ-СЕВ-2022-11", docTitle: "Подсчёт запасов нефти Северного м-я, кат. В1+В2+С1",
    approvedBy: "ГКЗ Роснедра", approvalDate: "08.11.2022", expiryDate: null, daysLeft: null,
    status: "ok",
    comment: "Актуален. Составление протокола ГКЗ в рамках плановой переоценки — 2028 г.",
    isWaterDoc: false,
  },
  {
    id: "hd4", company: "ПАО «ТюменьРесурс»", fieldId: "mf4", fieldName: "Центральное",
    docType: "reserves", docTypeLabel: "Подсчёт запасов",
    docNumber: "ГКЗ-ЦНТ-2017-05", docTitle: "Переоценка запасов Центрального м-я",
    approvedBy: "ТКЗ Тюмень", approvalDate: "14.05.2017", expiryDate: null, daysLeft: null,
    status: "critical",
    comment: "Устаревший подсчёт запасов — 9 лет без переоценки. Добыча с 2017 г. составила 40% от начальных запасов. Требуется пересчёт.",
    isWaterDoc: false,
  },
  // ── ТСР (вода) ──────────────────────────────────────────────────────────────
  {
    id: "hd5", company: "АО «СеверДобыча»", fieldId: "mf3", fieldName: "Арктическое",
    docType: "tsr_water", docTypeLabel: "ТСР (разработка водонасыщенных пластов)",
    docNumber: "ТСР-АРК-ВОДА-2023", docTitle: "Технологическая схема разработки водонасыщенных пластов Арктического м-я",
    approvedBy: "ЦКР Роснедра", approvalDate: "10.04.2023", expiryDate: "10.04.2028", daysLeft: 686,
    status: "ok",
    comment: "Актуален. Закачка воды в соответствии со схемой.",
    isWaterDoc: true,
  },
  {
    id: "hd6", company: "ООО «НефтьГаз-Запад»", fieldId: "mf1", fieldName: "Западно-Сибирское",
    docType: "tsr_water", docTypeLabel: "ТСР (разработка водонасыщенных пластов)",
    docNumber: "ТСР-ЗСМ-ВОДА-2020", docTitle: "Технологическая схема заводнения Западно-Сибирского м-я",
    approvedBy: "ЦКР Роснедра", approvalDate: "22.06.2020", expiryDate: "22.06.2025", daysLeft: -336,
    status: "critical",
    comment: "ИСТЁК 22.06.2025. Закачка воды ведётся без актуальной ТСР. Требуется немедленная разработка новой схемы.",
    isWaterDoc: true,
  },
  {
    id: "hd7", company: "ПАО «ТюменьРесурс»", fieldId: "mf4", fieldName: "Центральное",
    docType: "tsr_water", docTypeLabel: "ТСР (разработка водонасыщенных пластов)",
    docNumber: "ТСР-ЦНТ-ВОДА-2022", docTitle: "Проект поддержания пластового давления Центрального м-я",
    approvedBy: "ЦКР Роснедра", approvalDate: "15.09.2022", expiryDate: "15.09.2027", daysLeft: 479,
    status: "ok",
    comment: "Актуален.",
    isWaterDoc: true,
  },
  // ── ПГИН ────────────────────────────────────────────────────────────────────
  {
    id: "hd8", company: "АО «СеверДобыча»", fieldId: "mf3", fieldName: "Арктическое",
    docType: "pgin", docTypeLabel: "ПГИН (программа гидрогеологических исследований)",
    docNumber: "ПГИН-АРК-2024", docTitle: "Программа гидрогеологических исследований при добыче нефти, Арктическое м-е",
    approvedBy: "Территориальный орган Роснедра", approvalDate: "01.02.2024", expiryDate: "01.02.2027", daysLeft: 618,
    status: "ok",
    comment: "Соответствует действующим требованиям.",
    isWaterDoc: false,
  },
  {
    id: "hd9", company: "ООО «НефтьГаз-Запад»", fieldId: "mf1", fieldName: "Западно-Сибирское",
    docType: "pgin", docTypeLabel: "ПГИН (программа гидрогеологических исследований)",
    docNumber: "ПГИН-ЗСМ-2021", docTitle: "ПГИН Западно-Сибирского м-я",
    approvedBy: "Территориальный орган Роснедра", approvalDate: "14.03.2021", expiryDate: "14.03.2024", daysLeft: -806,
    status: "critical",
    comment: "ИСТЁК 14.03.2024. Гидрогеологические исследования не имеют действующей программы более 2 лет.",
    isWaterDoc: false,
  },
  {
    id: "hd10", company: "ООО «НефтьГаз-Запад»", fieldId: "mf2", fieldName: "Северное",
    docType: "pgin", docTypeLabel: "ПГИН (программа гидрогеологических исследований)",
    docNumber: "ПГИН-СЕВ-2023", docTitle: "ПГИН Северного м-я (2023–2026)",
    approvedBy: "Территориальный орган Роснедра", approvalDate: "05.05.2023", expiryDate: "05.05.2026", daysLeft: -19,
    status: "warning",
    comment: "Истёк 05.05.2026. Необходима разработка новой программы.",
    isWaterDoc: false,
  },
  {
    id: "hd11", company: "ПАО «ТюменьРесурс»", fieldId: "mf4", fieldName: "Центральное",
    docType: "pgin", docTypeLabel: "ПГИН (программа гидрогеологических исследований)",
    docNumber: "ПГИН-ЦНТ-2025", docTitle: "ПГИН Центрального м-я (2025–2028)",
    approvedBy: "Территориальный орган Роснедра", approvalDate: "20.01.2025", expiryDate: "20.01.2028", daysLeft: 606,
    status: "ok",
    comment: "Актуален.",
    isWaterDoc: false,
  },
  // ── Проекты размещения вод ───────────────────────────────────────────────────
  {
    id: "hd12", company: "АО «СеверДобыча»", fieldId: "mf3", fieldName: "Арктическое",
    docType: "water_placement", docTypeLabel: "Проект размещения подземных вод",
    docNumber: "ПРВ-АРК-2022-08", docTitle: "Проект закачки пластовых вод в поглощающий горизонт, Арктическое м-е",
    approvedBy: "Роснедра (Сибнедра)", approvalDate: "10.08.2022", expiryDate: "10.08.2027", daysLeft: 443,
    status: "ok",
    comment: "Закачка в пределах разрешённых объёмов.",
    isWaterDoc: true,
  },
  {
    id: "hd13", company: "ООО «НефтьГаз-Запад»", fieldId: "mf1", fieldName: "Западно-Сибирское",
    docType: "water_placement", docTypeLabel: "Проект размещения подземных вод",
    docNumber: "ПРВ-ЗСМ-2019-06", docTitle: "Проект захоронения попутно-пластовых вод Западно-Сибирского м-я",
    approvedBy: "Роснедра (Уралнедра)", approvalDate: "28.06.2019", expiryDate: "28.06.2024", daysLeft: -330,
    status: "critical",
    comment: "ИСТЁК 28.06.2024. Захоронение пластовых вод ведётся без действующего разрешения.",
    isWaterDoc: true,
  },
  {
    id: "hd14", company: "ООО «НефтьГаз-Запад»", fieldId: "mf2", fieldName: "Северное",
    docType: "water_placement", docTypeLabel: "Проект размещения подземных вод",
    docNumber: "ПРВ-СЕВ-2024-01", docTitle: "Проект размещения вод системы ППД, Северное м-е",
    approvedBy: "Роснедра (Уралнедра)", approvalDate: "15.01.2024", expiryDate: "15.01.2029", daysLeft: 966,
    status: "ok",
    comment: "Актуален.",
    isWaterDoc: true,
  },
  {
    id: "hd15", company: "ПАО «ТюменьРесурс»", fieldId: "mf4", fieldName: "Центральное",
    docType: "water_placement", docTypeLabel: "Проект размещения подземных вод",
    docNumber: "ПРВ-ЦНТ-2023-09", docTitle: "Проект захоронения попутно-пластовых вод Центрального м-я",
    approvedBy: "Роснедра (Сибнедра)", approvalDate: "12.09.2023", expiryDate: "12.09.2028", daysLeft: 841,
    status: "ok",
    comment: "Актуален.",
    isWaterDoc: true,
  },
  // ── Мониторинг подземных вод ─────────────────────────────────────────────────
  {
    id: "hd16", company: "АО «СеверДобыча»", fieldId: "mf3", fieldName: "Арктическое",
    docType: "monitoring", docTypeLabel: "Программа мониторинга подземных вод",
    docNumber: "МПВ-АРК-2024", docTitle: "Программа мониторинга подземных вод Арктического м-я",
    approvedBy: "Территориальный орган Роснедра", approvalDate: "01.03.2024", expiryDate: "01.03.2027", daysLeft: 646,
    status: "ok",
    comment: "Актуален. Отчёты сдаются своевременно.",
    isWaterDoc: true,
  },
  {
    id: "hd17", company: "ООО «НефтьГаз-Запад»", fieldId: "mf1", fieldName: "Западно-Сибирское",
    docType: "monitoring", docTypeLabel: "Программа мониторинга подземных вод",
    docNumber: "МПВ-ЗСМ-2022", docTitle: "Программа мониторинга подземных вод Западно-Сибирского м-я",
    approvedBy: "Территориальный орган Роснедра", approvalDate: "10.05.2022", expiryDate: "10.05.2025", daysLeft: -379,
    status: "critical",
    comment: "ИСТЁК 10.05.2025. Отчётность по мониторингу не ведётся.",
    isWaterDoc: true,
  },
  {
    id: "hd18", company: "ПАО «ТюменьРесурс»", fieldId: "mf4", fieldName: "Центральное",
    docType: "monitoring", docTypeLabel: "Программа мониторинга подземных вод",
    docNumber: "МПВ-ЦНТ-2024", docTitle: "Программа мониторинга подземных вод Центрального м-я",
    approvedBy: "Территориальный орган Роснедра", approvalDate: "18.02.2024", expiryDate: "18.02.2027", daysLeft: 635,
    status: "ok",
    comment: "Актуален.",
    isWaterDoc: true,
  },
]

// ── Водопользование: сравнение факт vs ТСР (подпиточная вода) ────────────────

export interface WaterUsagePoint {
  month: string
  monthIndex: number
  isFact: boolean
  /** Закачка для ППД (поддержание пластового давления), тыс.м³ */
  injectionFact: number | null
  injectionPlanTsr: number
  injectionForecast: number | null
  /** Водопотребление на технические нужды (подпиточная вода), тыс.м³ */
  techWaterFact: number | null
  techWaterPlanTsr: number
  techWaterForecast: number | null
  /** Разрешённый объём захоронения (ПРВ), тыс.м³ */
  disposalLimit: number
  disposalFact: number | null
  disposalForecast: number | null
}

export interface FieldWaterSeries {
  fieldId: string
  fieldName: string
  company: string
  tsrDoc: string
  prvDoc: string | null
  /** Допуск отклонения закачки от ТСР, % */
  injectionTolerancePct: number
  months: WaterUsagePoint[]
}

export const fieldWaterSeries: FieldWaterSeries[] = [
  {
    fieldId: "mf3", fieldName: "Арктическое", company: "АО «СеверДобыча»",
    tsrDoc: "ТСР-АРК-ВОДА-2023", prvDoc: "ПРВ-АРК-2022-08",
    injectionTolerancePct: 10,
    months: [
      { month: "янв", monthIndex: 1,  isFact: true,  injectionFact: 175, injectionPlanTsr: 175, injectionForecast: null, techWaterFact: 12.1, techWaterPlanTsr: 12, techWaterForecast: null, disposalLimit: 200, disposalFact: 155, disposalForecast: null },
      { month: "фев", monthIndex: 2,  isFact: true,  injectionFact: 168, injectionPlanTsr: 175, injectionForecast: null, techWaterFact: 11.8, techWaterPlanTsr: 12, techWaterForecast: null, disposalLimit: 200, disposalFact: 148, disposalForecast: null },
      { month: "мар", monthIndex: 3,  isFact: true,  injectionFact: 180, injectionPlanTsr: 175, injectionForecast: null, techWaterFact: 12.4, techWaterPlanTsr: 12, techWaterForecast: null, disposalLimit: 200, disposalFact: 160, disposalForecast: null },
      { month: "апр", monthIndex: 4,  isFact: true,  injectionFact: 162, injectionPlanTsr: 175, injectionForecast: null, techWaterFact: 11.5, techWaterPlanTsr: 12, techWaterForecast: null, disposalLimit: 200, disposalFact: 142, disposalForecast: null },
      { month: "май", monthIndex: 5,  isFact: true,  injectionFact: 159, injectionPlanTsr: 175, injectionForecast: null, techWaterFact: 11.2, techWaterPlanTsr: 12, techWaterForecast: null, disposalLimit: 200, disposalFact: 139, disposalForecast: null },
      { month: "июн", monthIndex: 6,  isFact: false, injectionFact: null, injectionPlanTsr: 175, injectionForecast: 160, techWaterFact: null, techWaterPlanTsr: 12, techWaterForecast: 11.3, disposalLimit: 200, disposalFact: null, disposalForecast: 140 },
      { month: "июл", monthIndex: 7,  isFact: false, injectionFact: null, injectionPlanTsr: 175, injectionForecast: 162, techWaterFact: null, techWaterPlanTsr: 12, techWaterForecast: 11.5, disposalLimit: 200, disposalFact: null, disposalForecast: 142 },
      { month: "авг", monthIndex: 8,  isFact: false, injectionFact: null, injectionPlanTsr: 175, injectionForecast: 165, techWaterFact: null, techWaterPlanTsr: 12, techWaterForecast: 11.8, disposalLimit: 200, disposalFact: null, disposalForecast: 145 },
      { month: "сен", monthIndex: 9,  isFact: false, injectionFact: null, injectionPlanTsr: 175, injectionForecast: 170, techWaterFact: null, techWaterPlanTsr: 12, techWaterForecast: 12.0, disposalLimit: 200, disposalFact: null, disposalForecast: 150 },
      { month: "окт", monthIndex: 10, isFact: false, injectionFact: null, injectionPlanTsr: 175, injectionForecast: 172, techWaterFact: null, techWaterPlanTsr: 12, techWaterForecast: 12.1, disposalLimit: 200, disposalFact: null, disposalForecast: 152 },
      { month: "ноя", monthIndex: 11, isFact: false, injectionFact: null, injectionPlanTsr: 175, injectionForecast: 168, techWaterFact: null, techWaterPlanTsr: 12, techWaterForecast: 11.9, disposalLimit: 200, disposalFact: null, disposalForecast: 148 },
      { month: "дек", monthIndex: 12, isFact: false, injectionFact: null, injectionPlanTsr: 175, injectionForecast: 165, techWaterFact: null, techWaterPlanTsr: 12, techWaterForecast: 11.6, disposalLimit: 200, disposalFact: null, disposalForecast: 145 },
    ],
  },
  {
    fieldId: "mf1", fieldName: "Западно-Сибирское", company: "ООО «НефтьГаз-Запад»",
    tsrDoc: "ТСР-ЗСМ-ВОДА-2020 (ИСТЁК)", prvDoc: null,
    injectionTolerancePct: 10,
    months: [
      { month: "янв", monthIndex: 1,  isFact: true,  injectionFact: 290, injectionPlanTsr: 250, injectionForecast: null, techWaterFact: 18.5, techWaterPlanTsr: 16, techWaterForecast: null, disposalLimit: 320, disposalFact: 255, disposalForecast: null },
      { month: "фев", monthIndex: 2,  isFact: true,  injectionFact: 305, injectionPlanTsr: 250, injectionForecast: null, techWaterFact: 19.2, techWaterPlanTsr: 16, techWaterForecast: null, disposalLimit: 320, disposalFact: 268, disposalForecast: null },
      { month: "мар", monthIndex: 3,  isFact: true,  injectionFact: 318, injectionPlanTsr: 250, injectionForecast: null, techWaterFact: 20.1, techWaterPlanTsr: 16, techWaterForecast: null, disposalLimit: 320, disposalFact: 280, disposalForecast: null },
      { month: "апр", monthIndex: 4,  isFact: true,  injectionFact: 312, injectionPlanTsr: 250, injectionForecast: null, techWaterFact: 19.8, techWaterPlanTsr: 16, techWaterForecast: null, disposalLimit: 320, disposalFact: 275, disposalForecast: null },
      { month: "май", monthIndex: 5,  isFact: true,  injectionFact: 322, injectionPlanTsr: 250, injectionForecast: null, techWaterFact: 20.4, techWaterPlanTsr: 16, techWaterForecast: null, disposalLimit: 320, disposalFact: 284, disposalForecast: null },
      { month: "июн", monthIndex: 6,  isFact: false, injectionFact: null, injectionPlanTsr: 250, injectionForecast: 325, techWaterFact: null, techWaterPlanTsr: 16, techWaterForecast: 20.6, disposalLimit: 320, disposalFact: null, disposalForecast: 287 },
      { month: "июл", monthIndex: 7,  isFact: false, injectionFact: null, injectionPlanTsr: 250, injectionForecast: 330, techWaterFact: null, techWaterPlanTsr: 16, techWaterForecast: 21.0, disposalLimit: 320, disposalFact: null, disposalForecast: 291 },
      { month: "авг", monthIndex: 8,  isFact: false, injectionFact: null, injectionPlanTsr: 250, injectionForecast: 328, techWaterFact: null, techWaterPlanTsr: 16, techWaterForecast: 20.8, disposalLimit: 320, disposalFact: null, disposalForecast: 289 },
      { month: "сен", monthIndex: 9,  isFact: false, injectionFact: null, injectionPlanTsr: 250, injectionForecast: 320, techWaterFact: null, techWaterPlanTsr: 16, techWaterForecast: 20.2, disposalLimit: 320, disposalFact: null, disposalForecast: 282 },
      { month: "окт", monthIndex: 10, isFact: false, injectionFact: null, injectionPlanTsr: 250, injectionForecast: 315, techWaterFact: null, techWaterPlanTsr: 16, techWaterForecast: 20.0, disposalLimit: 320, disposalFact: null, disposalForecast: 278 },
      { month: "ноя", monthIndex: 11, isFact: false, injectionFact: null, injectionPlanTsr: 250, injectionForecast: 310, techWaterFact: null, techWaterPlanTsr: 16, techWaterForecast: 19.6, disposalLimit: 320, disposalFact: null, disposalForecast: 273 },
      { month: "дек", monthIndex: 12, isFact: false, injectionFact: null, injectionPlanTsr: 250, injectionForecast: 308, techWaterFact: null, techWaterPlanTsr: 16, techWaterForecast: 19.5, disposalLimit: 320, disposalFact: null, disposalForecast: 271 },
    ],
  },
]
