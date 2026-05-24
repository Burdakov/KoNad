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
    field: "Северное",
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
    comment: "Срок истекает через 38 дней",
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
    comment: "Разрешение действительно",
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
    company: "АО «СеверДобыча»",
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
    label: "Объектов под надзором",
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
    violations: { spatial: 3, tsr: 5, land: 2, opo: 1, ker: 0, conservation: 2, license: 1, reporting: 3 },
    status: "critical",
    isExpanded: true,
  },
  {
    id: "f1",
    level: "field",
    name: "Западно-Сибирское м-е",
    parentId: "c1",
    violations: { spatial: 2, tsr: 3, land: 1, opo: 1, ker: 0, conservation: 1, license: 1, reporting: 2 },
    status: "critical",
    isExpanded: true,
  },
  {
    id: "a1",
    level: "area",
    name: "Участок недр №14",
    parentId: "f1",
    violations: { spatial: 2, tsr: 1, land: 0, opo: 1, ker: 0, conservation: 0, license: 1, reporting: 1 },
    status: "critical",
  },
  {
    id: "cl1",
    level: "cluster",
    name: "Куст 14А",
    parentId: "a1",
    violations: { spatial: 2, tsr: 0, land: 0, opo: 1, ker: 0, conservation: 0, license: 0, reporting: 0 },
    status: "critical",
  },
  {
    id: "w1",
    level: "well",
    name: "Скважина 14А-7 (доб.)",
    parentId: "cl1",
    violations: { spatial: 1, tsr: 0, land: 0, opo: 0, ker: 0, conservation: 0, license: 0, reporting: 0 },
    status: "critical",
  },
  {
    id: "w2",
    level: "well",
    name: "Скважина 14А-12 (доб.)",
    parentId: "cl1",
    violations: { spatial: 1, tsr: 0, land: 0, opo: 1, ker: 0, conservation: 0, license: 0, reporting: 0 },
    status: "critical",
  },
  {
    id: "f2",
    level: "field",
    name: "Северное м-е",
    parentId: "c1",
    violations: { spatial: 0, tsr: 2, land: 1, opo: 0, ker: 0, conservation: 1, license: 0, reporting: 1 },
    status: "warning",
  },
  {
    id: "c2",
    level: "company",
    name: "АО «СеверДобыча»",
    parentId: null,
    violations: { spatial: 0, tsr: 4, land: 3, opo: 0, ker: 2, conservation: 0, license: 2, reporting: 1 },
    status: "warning",
  },
  {
    id: "f3",
    level: "field",
    name: "Арктическое м-е",
    parentId: "c2",
    violations: { spatial: 0, tsr: 2, land: 2, opo: 0, ker: 2, conservation: 0, license: 1, reporting: 0 },
    status: "warning",
  },
  {
    id: "c3",
    level: "company",
    name: "ПАО «ТюменьРесурс»",
    parentId: null,
    violations: { spatial: 0, tsr: 0, land: 0, opo: 0, ker: 0, conservation: 0, license: 0, reporting: 0 },
    status: "ok",
  },
]

export const checkModules: CheckModule[] = [
  { id: "1", code: "ПРОСТ", title: "Пространственные проверки", critical: 6, warning: 4, ok: 302, lastChecked: "23.05.2026 08:00" },
  { id: "2", code: "ТСР", title: "Технологические схемы разработки", critical: 3, warning: 12, ok: 297, lastChecked: "23.05.2026 08:00" },
  { id: "3", code: "ЗЕМЛЯ", title: "Земельные отводы и аренда", critical: 2, warning: 8, ok: 302, lastChecked: "22.05.2026 22:00" },
  { id: "4", code: "ОПО", title: "Опасные производственные объекты", critical: 2, warning: 5, ok: 305, lastChecked: "23.05.2026 08:00" },
  { id: "5", code: "КЭР", title: "Комплексные экологические разрешения", critical: 4, warning: 7, ok: 301, lastChecked: "22.05.2026 18:00" },
  { id: "6", code: "КОНС", title: "Консервация и ликвидация скважин", critical: 2, warning: 6, ok: 304, lastChecked: "23.05.2026 08:00" },
  { id: "7", code: "ЛИЦ", title: "Лицензирование недропользования", critical: 2, warning: 3, ok: 307, lastChecked: "21.05.2026 12:00" },
  { id: "8", code: "ОТЧЁТ", title: "Регламентная отчётность", critical: 2, warning: 2, ok: 308, lastChecked: "23.05.2026 08:00" },
]

export const recentAlerts = [
  { id: "1", severity: "critical" as ViolationSeverity, module: "ПРОСТ", text: "Забой скв. 14А-7 выходит за контур промышленных категорий запасов (В1+В2)", company: "ООО «НефтГаз-Запад»", field: "Западно-Сибирское", time: "сегодня, 07:45" },
  { id: "2", severity: "critical" as ViolationSeverity, module: "КЭР", text: "Превышение нормативных выбросов на ФУ-3 в 2.4 раза. Объект: факельная установка", company: "АО «СеверДобыча»", field: "Арктическое", time: "вчера, 22:10" },
  { id: "3", severity: "critical" as ViolationSeverity, module: "ОПО", text: "Отсутствует разрешение на эксплуатацию ОПО «ДКС-2». Документ истёк 01.04.2026", company: "ООО «НефтьГаз-Запад»", field: "Западно-Сибирское", time: "вчера, 14:30" },
  { id: "4", severity: "warning" as ViolationSeverity, module: "ТСР", text: "Фактическая добыча нефти превышает плановую по ТСР на 18%: 285 тыс.т/год vs 241 тыс.т/год", company: "АО «СеверДобыча»", field: "Арктическое", time: "22.05.2026" },
  { id: "5", severity: "warning" as ViolationSeverity, module: "ЗЕМЛЯ", text: "Объект обустройства «КП-14» расположен за пределами границ договора аренды №47/2021", company: "ООО «НефтьГаз-Запад»", field: "Западно-Сибирское", time: "21.05.2026" },
  { id: "6", severity: "warning" as ViolationSeverity, module: "ЛИЦ", text: "До окончания лицензии на разведку и добычу ТЮМ-12345-НЭ осталось 42 дня", company: "АО «СеверДобыча»", field: "Арктическое", time: "20.05.2026" },
]
