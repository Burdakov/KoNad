# AGENTS.md

Инструкции для AI-агентов (Cursor, Codex и др.) при создании **прототипов** в монорепозитории. Прототипы делают аналитики; затем разработчики переносят решения в промышленные сервисы. Документ самодостаточен — по нему поднимают **новые** репозитории с нуля.

**Тесты не пишем** — ни backend, ни frontend.

**UI обязателен** в каждом прототипе, если в задаче явно не сказано обратное (только API, без экранов). Обычно прототип начинают с визуала.

**Git:** после каждого завершённого изменения — **коммит**; **`git push`** — только по явной просьбе пользователя (см. раздел Git).

---

## Проверка окружения (перед стартом и при первом запуске)

Перед созданием каркаса, установкой зависимостей или запуском прототипа агент **проверяет** наличие инструментов (команды в терминале ОС пользователя):

| Инструмент | Зачем | Обязательность |
|------------|--------|----------------|
| **Docker** + **Docker Compose** (`docker compose version`) | PostgreSQL и опционально весь стек | **Обязателен всегда** |
| **Git** | Коммиты, история | Обязателен |
| **Python 3.12** | Backend на хосте | Нужен при локальном режиме |
| **uv** | Зависимости Python | Нужен при локальном режиме |
| **Node.js** + **npm** | Frontend на хосте | Нужен при локальном режиме |

### Если Docker не установлен

Работа с БД невозможна. Агент **не продолжает** настройку проекта, пока Docker не появится:

1. Выдать **пошаговые инструкции** по установке Docker Desktop (Windows/macOS) или Docker Engine + Compose Plugin (Linux) — со ссылками на официальную документацию.
2. Кратко объяснить, зачем Docker нужен (сервис `db` в compose).
3. Дождаться подтверждения пользователя или успешной проверки `docker compose version`.

### Если Docker есть, но чего-то ещё не хватает

Спросить пользователя (одним сообщением, с вариантами):

> **A) Только Docker** — backend, frontend и БД поднимаются через `docker compose up`; на хосте Python/Node не обязательны.  
> **B) Локальная разработка** — backend и frontend на хосте (`scripts/run_dev.*`), БД по-прежнему в Docker (`docker compose up db -d`); нужно доустановить недостающее (Python, uv, Node).

**Выбор A:** дальше запуск и отладка **только через Docker** (`docker compose up`, логи `docker compose logs`). Не предлагать `scripts/run_dev.*` как основной путь. В **`README.md`** зафиксировать режим `RUN_MODE=docker`.

**Выбор B:** агент по возможности устанавливает недостающее (пакетные менеджеры ОС / официальные инсталляторы) **или** даёт точные команды установки (Python 3.12, `pip install uv` / standalone uv, Node LTS, `npm`). После установки — режим из раздела «Локальный запуск». В **`README.md`** — `RUN_MODE=local` и список версий инструментов.

Повторять проверку после установки. Результат проверки и выбранный режим кратко записать в **`README.md`** (блок «Требования к окружению»).

---

## Старт нового проекта

При создании репозитория: сначала **проверка окружения** (раздел выше), затем агент **обязан** заложить каркас:

| Файл / каталог | Назначение |
|----------------|------------|
| **`.gitignore`** | Секреты, артефакты сборки, кэши (см. шаблон) |
| **`.env.example`** | Все переменные без реальных секретов |
| **`README.md`** | Назначение; запуск всего проекта локально и через Docker |
| **`backend/app/pyproject.toml`** | Линтеры; **`[project].name`** — осмысленное имя прототипа |
| **`backend/requirements/`** | один `requirements.in` и lock `requirements.txt` (все зависимости вместе) |
| **`backend/app/di/`** | Дерево зависимостей (фабрики) |
| **`backend/app/migration/`** | Alembic — если нужна БД; **коммитить в git** |
| **`frontend/`** | Nuxt-приложение (см. Frontend) |
| **`docs/`** | По фиче: бизнес, для агента (связи/модули), для разработчика — в одном `.md` |
| **`scripts/run_dev.ps1`**, **`scripts/run_dev.sh`** | Локальный запуск **backend + frontend** |
| **`docker-compose.yml`** | db + backend + frontend |

### Шаблон `.gitignore`

```gitignore
# Python
backend/.venv/
backend/venv/
**/__pycache__/
*.py[cod]
**/.ruff_cache/
.ipynb_checkpoints

# Секреты
.env
**/.env.local

# Локальные дампы БД (не схема)
db_dumps/

# IDE / ОС
.idea/
.vscode/
.DS_Store
*.log

# Frontend
frontend/node_modules/
frontend/.nuxt/
frontend/.output/
frontend/dist/
```

**Не игнорировать:** `backend/app/migration/`, `.xlsx` в `backend/app/data/` (выгрузки могут лежать в репозитории).

---

## Структура монорепозитория

```text
/
├── AGENTS.md
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
├── docs/
├── scripts/
│   ├── run_dev.ps1          # backend + frontend
│   └── run_dev.sh
├── backend/
│   ├── app/                 # Python-пакет FastAPI
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── pyproject.toml
│   │   ├── di/
│   │   ├── migration/       # Alembic — в git
│   │   ├── data/            # xlsx и др. — в git при необходимости
│   │   ├── <домен>/
│   │   └── shared/
│   ├── requirements/
│   │   ├── requirements.in
│   │   └── requirements.txt   # lock (uv pip compile)
│   └── Dockerfile           # для compose
└── frontend/                # Nuxt 3 — обязателен по умолчанию
    ├── nuxt.config.ts
    ├── package.json
    └── ...
```

**Код** backend и frontend — в своих каталогах. **Документация** — общая в **`docs/`** (см. раздел «Документация»).

---

## Backend

Код — в **`backend/app/`**, зависимости — в **`backend/requirements/`**.

### Стек

| Область | Технология |
|--------|------------|
| API | **FastAPI** (async), **Uvicorn** |
| Контракты | **Pydantic v2**, **pydantic-settings** |
| БД | **PostgreSQL** только в **Docker** (`db` в compose); **SQLAlchemy 2.x** (async: `asyncpg`) |
| Миграции | **Alembic** в `backend/app/migration/` — версии **в git** |
| Таблицы / расчёты | **Polars**, **NumPy** |
| Excel | **openpyxl**, Polars `read_excel` |
| Зависимости | **uv** |
| Python | **3.12** (`>=3.12.2,<3.13`) |

Kafka, Celery, ClickHouse, ML — только по явной задаче. Новые пакеты — после согласования.

### Подход к архитектуре

Это **не** чистая архитектура (без портов, адаптеров и интерфейсов «на будущее»):

- **Не** вводить `Protocol`, `ABC`, `IUserRepository` и т.п.
- Сразу писать **конкретные классы**: `WellsRepository`, `TelemetryExportUseCase`.
- Слои нужны для **разделения ответственности** и удобного переноса в промышленный код, а не для подменяемости реализаций.

Поток: **router → use case → service / gateway / repository → Pydantic-схемы**. Между слоями — типизированные модели, не «сырые» `dict`.

| Слой | Ответственность |
|------|-----------------|
| **Router** | HTTP, вызов use case / service |
| **Use case** | Один сценарий, `execute(...)` |
| **Service** | Расчёты и правила предметной области |
| **Gateway** | Внешние системы, файлы, Excel |
| **Repository** | PostgreSQL или чтение файлов |
| **Schemas** | API и границы слоёв |

Имена: `*UseCase`, `*Repository`, `*Gateway`, `*Service`, `*Schema`.

### Данные из Excel

Нормально использовать `.xlsx` как источник данных (выгрузка «как БД»):

- Файлы в **`backend/app/data/`** — **можно коммитить** в git.
- Чтение только в **repository** / **gateway**, не в router.
- Схему колонок описать в **`docs/`**.
- При переходе на PostgreSQL меняется repository; use case и схемы API по возможности те же.

### Зависимости (uv)

Один файл **`backend/requirements/requirements.in`** — runtime, линтеры (**black**, **isort**, **ruff**) и прочее **вместе**, без `requirements-dev.in`.

Рабочая директория — **`backend/`**:

```bash
cd backend
uv venv
uv pip compile requirements/requirements.in -o requirements/requirements.txt
uv pip sync requirements/requirements.txt
```

`.venv` в `backend/` не коммитить.

### `backend/app/pyproject.toml`

Создаётся при старте. Поле **`[project].name`** обязательно заполнить **осмысленным именем прототипа** (slug латиницей, например `field_development_prototype`), не оставлять заглушку.

```toml
[project]
name = "<имя_прототипа>"   # обязательно: уникальное имя проекта
version = "0.1.0"
requires-python = ">=3.12.2,<3.13"
dependencies = []

[tool.black]
line-length = 120
target-version = ["py312"]
include = '\.pyi?$'
exclude = 'migration|\.venv'

[tool.isort]
profile = "black"
line_length = 120
multi_line_output = 3
skip_glob = ["**/migration", ".venv/*"]
known_first_party = "app"
include_trailing_comma = true
use_parentheses = true

[tool.ruff]
exclude = [".venv", "migration"]
line-length = 120
```

### Линтеры

Из каталога **`backend/`** (с активированным `.venv`):

```bash
uv run black ./app
uv run isort ./app
uv run ruff check --fix ./app
uv run ruff check ./app
```

### Внедрение зависимостей (`backend/app/di/`)

Каталог **`di/` обязателен** — дерево зависимостей описывается всегда.

**Без Dishka (по умолчанию):**

- Фабрики: `create_<name>_repository`, `create_<name>_usecase` в `di/factories.py`.
- В router **допустимо**: `use_case = create_foo_usecase()` → `await use_case.execute(...)`.
- Router не открывает сессии БД и не читает Excel.

**С Dishka** — только если пакет уже был в проекте изначально; в новый прототип Dishka не добавлять.

### Транзакции (SQLAlchemy async)

- Один репозиторий — сессия и commit/rollback внутри него.
- Несколько репозиториев — сессия на use case, один commit/rollback на сценарий.

### Миграции

- Каталог: **`backend/app/migration/`**.
- Все revision-файлы и `alembic.ini` — **в git**, не в `.gitignore`.
- Линтеры исключают `migration/` из проверки стиля, но сами файлы миграций коммитятся.

### REST API

Префикс: `/api` (`root_path="/api"`).

| Операция | Путь |
|----------|------|
| Создание | `POST /api/<resource>` |
| Список | `GET /api/<resource>/list` |
| По id | `GET/PUT/PATCH/DELETE /api/<resource>/{id}` |
| Импорт | `POST /api/<resource>/import` |
| Экспорт | `GET` или `POST /api/<resource>/export` |

Query: `start_date`, `end_date`, `year_from`, `year_to`. OpenAPI = фактическое поведение API.

### Стиль кода (Python)

1. Типизация аргументов и возвратов.
2. Докстринги у классов и функций (кроме пустого `__init__`).
3. Один модуль — одна зона ответственности.
4. Понятные сообщения об ошибках для пользователя API.
5. Валидация через Pydantic; граничные случаи учитывать явно.
6. Функции до ~30–50 строк.
7. `async`/`await` для I/O.
8. Polars для таблиц; NumPy для векторной математики.
9. `HTTPException` — в router.

### Конфигурация

- Секреты в **`.env`** (корень монорепы), не в git.
- **`/.env.example`** в корне.
- **`backend/app/config.py`** — pydantic-settings.

### Чего не делать (backend)

- Абстрактные интерфейсы репозиториев и «порты».
- SQL, парсинг Excel, httpx в router (кроме `create_*_usecase()`).
- Use case с типами FastAPI.
- Нетипизированные `dict` между слоями.
- Секреты в коде.
- Dishka в новом прототипе без необходимости.
- **Тесты**.

---

## Frontend

Создаётся **вместе с backend**, если задача не ограничена явно только API.

### Стек

| Область | Технология |
|--------|------------|
| Framework | **Nuxt 3**, **Vue 3**, `<script setup lang="ts">` |
| UI | **Naive UI**, **Tailwind CSS** |
| Состояние | **Pinia** |
| Таблицы | **AG Grid** — обёртка в `frontend/core/components/table` |
| HTTP | **axios** / **`$apiFetch`** — только из `services` модулей |
| Пакеты | **npm** |

**SPA:** `ssr: false`. Прокси API в `nuxt.config.ts`: `server.proxy['/api']` → URL backend (`PROXY_SERVER` в `.env`).

### Структура `frontend/`

```text
frontend/
├── nuxt.config.ts
├── package.json
├── .eslintrc.js
├── assets/css/
├── pages/
├── modules/<domain>/
│   ├── components/
│   ├── composables/
│   ├── services/
│   ├── store/
│   └── models/
├── core/
│   ├── components/
│   ├── store/
│   └── service/
├── composables/
├── layouts/
└── public/
```

### Правила

- Composition API; **`any` запрещён**.
- Запросы к API — **`modules/<domain>/services/`** или **`core/service`**, не в `.vue`.
- Состояние — **`modules/<domain>/store/`** или **`core/store`**.
- Логика — **`composables/use*.ts`**.
- Переиспользуемые UI — **`core/components`**.
- Формы — **`<n-form>`**, **`FormInst.validate()`** перед отправкой.
- Уведомления — **`useMessage()`** / **`useNotification()`**, не `alert`.
- JSDoc на экспортируемых функциях и у компонентов.
- `npm run lint` перед сдачей.

### Конфигурация

- **`PROXY_SERVER`** в `.env` / `.env.example` (например `http://127.0.0.1:9003`).
- `.env` фронта не коммитить; примеры — в корневом `.env.example`.

### Чего не делать (frontend)

- API из `.vue` напрямую.
- Options API, мутация props.
- `console.log` (допустимы `warn`/`error` по ESLint).
- Тесты, Playwright, husky — без явного запроса.

---

## Локальный запуск (режим `RUN_MODE=local`)

Используется, если при проверке окружения пользователь выбрал **локальную разработку** и на хосте установлены Python, uv, Node.

Прототип поднимается **целиком** — backend и frontend — одной командой, чтобы сразу открыть UI и «потыкать» сценарий.

**`scripts/run_dev.sh`** / **`scripts/run_dev.ps1`** (в корне монорепы):

1. Проверить `.env` (из `.env.example`).
2. Поднять **PostgreSQL**: `docker compose up db -d` (БД **только** в Docker, локальная установка Postgres не используется).
3. При необходимости: `cd backend && uv venv && uv pip sync requirements/requirements.txt`.
4. Запустить **backend** на хосте: `uvicorn app.main:app --reload` из `backend/` (в `.env`: хост БД `localhost`, порт из проброса compose, обычно `5432`).
5. Параллельно **frontend**: `cd frontend && npm install` (при первом запуске) → `npm run dev`.
6. Вывести URL: Swagger (`http://localhost:9003/docs`), UI (`http://localhost:3000`).

В **README**: сначала **`scripts/run_dev.*`** (db в Docker + backend/frontend на хосте), затем полный **`docker compose up`** (всё в контейнерах).

---

## Docker (режим `RUN_MODE=docker` или сервис `db`)

Один **`docker-compose.yml`** в корне, **без** отдельных `docker-compose.*.yml` и **без** секции `networks`.

При **`RUN_MODE=docker`** — единственный способ запуска всего прототипа: `docker compose up --build` (не использовать гибрид с хостом).

```yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    working_dir: /srv
    command: uvicorn app.main:app --host 0.0.0.0 --port 9003 --reload
    env_file: ../.env
    ports:
      - "9003:9003"
    volumes:
      - ./backend:/srv
    depends_on:
      - db

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    command: npm run dev
    env_file: ../.env
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/srv
    depends_on:
      - backend

volumes:
  pgdata:
```

Сервисы: **`db`**, **`backend`**, **`frontend`**. **`db`** — единственный способ запустить PostgreSQL. Запуск: `docker compose up --build`.

---

## Документация

Единый каталог **`docs/`** на всю монорепу. **Не** дробить на `docs/backend/` и `docs/frontend/` и не заводить отдельные README по фичам в `app/` или `frontend/`.

| Место | Содержание |
|-------|------------|
| **`README.md`** (корень) | Назначение прототипа, окружение (`RUN_MODE`), запуск, ссылка на `docs/` |
| **`docs/<feature>.md`** | Одна фича — **три обязательных раздела** (см. ниже) |

При реализации или изменении фичи агент **обновляет один** файл `docs/<feature>.md`, синхронно с кодом backend и frontend.

### Структура `docs/<feature>.md`

Каждый документ по фиче **обязан** содержать три раздела (заголовки можно на русском):

#### 1. Бизнес-описание

Для аналитика и заказчика, **без кода и имён файлов**:

- зачем нужна фича, какую задачу решает;
- кто пользуется, в каком сценарии;
- входные данные и ожидаемый результат с точки зрения предметной области;
- ограничения, допущения, что **не** входит в scope.

Язык простой, по делу, без жаргона разработки.

#### 2. Описание для агента

Для AI и последующей доработки прототипа — **структура и связи**:

- сущности предметной области и поля (таблицы, Excel-листы, ключи);
- связи между сущностями (один-ко-многим, справочники, агрегации);
- модули монорепы: `backend/app/<домен>/`, `frontend/modules/<domain>/`, что за что отвечает;
- поток данных: UI → service → API → use case → repository/gateway;
- эндпоинты, основные Pydantic-схемы, страницы/компоненты (имена путей и файлов);
- зависимости от других фич или внешних источников;
- известные edge cases и где они обработаны в коде.

Цель — чтобы другой агент мог продолжить работу **без угадывания** архитектуры.

#### 3. Описание для разработчика

Кратко, для переноса в промышленный сервис:

- что реализовано в прототипе (2–5 пунктов);
- ключевые файлы и точки входа (router, use case, page, service);
- отличия от целевого продакшена (если есть): заглушки, Excel вместо БД, упрощения;
- миграции, переменные `.env`, команды запуска/проверки;
- что проверить при переносе (контракт API, контракт UI, данные).

Без дублирования всего раздела 2 — только то, что нужно человеку для ревью и merge.

### Пример оглавления файла

```markdown
# <Название фичи>

## Бизнес-описание
…

## Описание для агента
…

## Описание для разработчика
…
```

---

## Git

### Коммиты

После **каждого логически завершённого изменения** (фича, исправление, рефакторинг, обновление `docs/`, каркас проекта) агент выполняет **локальный коммит**:

```bash
git add <релевантные файлы>
git commit -m "Краткое описание: зачем сделано изменение."
```

- Сообщение — полное предложение на русском или английском (как в задаче), смысл важнее перечисления файлов.
- Не коммитить: `.env`, секреты, `.venv`, `node_modules`, артефакты сборки.
- Несколько мелких правок одной задачи можно объединить в **один** коммит по завершении задачи, но **не оставлять** незакоммиченные изменения в конце сессии без причины.

### Push

- **`git push` не выполнять** по умолчанию.
- Push — **только** если пользователь **явно** просит выложить изменения (например: «запушь», «отправь на remote», «опубликуй ветку»).
- Перед push при необходимости напомнить, что коммиты уже локальные; не делать force-push без явного запроса.

---

## Общее для агентов

1. Читать **`AGENTS.md`** и код репозитория перед правками.
2. Новый проект: **проверка окружения** → каркас **`backend/`** + **`frontend/`** → зафиксировать `RUN_MODE` в README.
3. Минимальный diff; слои и конкретные классы без лишних абстракций.
4. После фичи: код + **`docs/<feature>.md`** (бизнес + агент + разработчик) + **`.env.example`** → **git commit**.
5. Перед сдачей: линтеры backend; проект запускается в выбранном режиме (Docker или `scripts/run_dev.*` + `db` в Docker); Swagger и UI открываются.
6. **Push** — только по явной просьбе.
7. Исключение без UI — только если пользователь **явно** попросил backend-only.
