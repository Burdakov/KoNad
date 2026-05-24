// Mock data for КоНад dashboard

export type ViolationSeverity = "critical" | "warning" | "ok" | "unknown"

export interface KpiCard {
  id: string
  label: string
  value: number
  unit?: string
  severity: ViolationSeverity
  description: string
}

export interface HierarchyRow {
  id: string
  level: "company" | "field" | "area" | "cluster" | "well"
  name: string
  parentId: string | null
  violations: {
    spatial: number       // 1. Попадание в контуры запасов/горных отводов
    tsr: number           // 2. Нарушения ТСР/госплан
    land: number          // 3. Земельные отводы
    opo: number           // 4. ОПО
    ker: number           // 5. КЭР
    conservation: number  // 6. Консервация/ликвидация
    license: number       // 7. Лицензирование
    reporting: number     // 8. Отчётность
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

export const kpiCards: KpiCard[] = [
  {
    id: "1",
    label: "Критические нарушения",
    value: 23,
    severity: "critical",
    description: "Требуют немедленного реагирования",
  },
  {
    id: "2",
    label: "Предупреждения",
    value: 47,
    severity: "warning",
    description: "Нарушения в стадии устранения",
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
  {
    id: "1",
    code: "ПРОСТ",
    title: "Пространственные проверки",
    critical: 6,
    warning: 4,
    ok: 302,
    lastChecked: "23.05.2026 08:00",
  },
  {
    id: "2",
    code: "ТСР",
    title: "Технологические схемы разработки",
    critical: 3,
    warning: 12,
    ok: 297,
    lastChecked: "23.05.2026 08:00",
  },
  {
    id: "3",
    code: "ЗЕМЛЯ",
    title: "Земельные отводы и аренда",
    critical: 2,
    warning: 8,
    ok: 302,
    lastChecked: "22.05.2026 22:00",
  },
  {
    id: "4",
    code: "ОПО",
    title: "Опасные производственные объекты",
    critical: 2,
    warning: 5,
    ok: 305,
    lastChecked: "23.05.2026 08:00",
  },
  {
    id: "5",
    code: "КЭР",
    title: "Комплексные экологические разрешения",
    critical: 4,
    warning: 7,
    ok: 301,
    lastChecked: "22.05.2026 18:00",
  },
  {
    id: "6",
    code: "КОНС",
    title: "Консервация и ликвидация скважин",
    critical: 2,
    warning: 6,
    ok: 304,
    lastChecked: "23.05.2026 08:00",
  },
  {
    id: "7",
    code: "ЛИЦ",
    title: "Лицензирование недропользования",
    critical: 2,
    warning: 3,
    ok: 307,
    lastChecked: "21.05.2026 12:00",
  },
  {
    id: "8",
    code: "ОТЧЁТ",
    title: "Регламентная отчётность",
    critical: 2,
    warning: 2,
    ok: 308,
    lastChecked: "23.05.2026 08:00",
  },
]

export const recentAlerts = [
  {
    id: "1",
    severity: "critical" as ViolationSeverity,
    module: "ПРОСТ",
    text: "Забой скв. 14А-7 выходит за контур промышленных категорий запасов (В1+В2)",
    company: "ООО «НефтГаз-Запад»",
    field: "Западно-Сибирское",
    time: "сегодня, 07:45",
  },
  {
    id: "2",
    severity: "critical" as ViolationSeverity,
    module: "КЭР",
    text: "Превышение нормативных выбросов на ФУ-3 в 2.4 раза. Объект: факельная установка",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    time: "вчера, 22:10",
  },
  {
    id: "3",
    severity: "critical" as ViolationSeverity,
    module: "ОПО",
    text: "Отсутствует разрешение на эксплуатацию ОПО «ДКС-2». Документ истёк 01.04.2026",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    time: "вчера, 14:30",
  },
  {
    id: "4",
    severity: "warning" as ViolationSeverity,
    module: "ТСР",
    text: "Фактическая добыча нефти превышает плановую по ТСР на 18%: 285 тыс.т/год vs 241 тыс.т/год",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    time: "22.05.2026",
  },
  {
    id: "5",
    severity: "warning" as ViolationSeverity,
    module: "ЗЕМЛЯ",
    text: "Объект обустройства «КП-14» расположен за пределами границ договора аренды №47/2021",
    company: "ООО «НефтьГаз-Запад»",
    field: "Западно-Сибирское",
    time: "21.05.2026",
  },
  {
    id: "6",
    severity: "warning" as ViolationSeverity,
    module: "ЛИЦ",
    text: "До окончания лицензии на разведку и добычу ТЮМ-12345-НЭ осталось 42 дня",
    company: "АО «СеверДобыча»",
    field: "Арктическое",
    time: "20.05.2026",
  },
]
