(() => {
  "use strict";

  const ROUTE = "#/migration";
  const DATA_URL = "./data/migration.json";

  const state = {
    payload: null,
    method: "RFM",
    level: "GROUP",
    grain: "YEAR",
    fromOrdinal: null,
    toOrdinal: null,
    selectedTransition: null,
    rendering: false,
  };

  function formatNumber(value) {
    return new Intl.NumberFormat("en-US").format(Number(value || 0));
  }

  function formatPercent(value) {
    return `${(Number(value || 0) * 100).toFixed(1)}%`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function findRoot() {
    return (
      document.querySelector("#page-root") ||
      document.querySelector("main") ||
      document.querySelector("#app") ||
      document.querySelector("[data-app-main]") ||
      document.querySelector("[data-main]")
    );
  }

  function ensureNavLink() {
    if (document.querySelector('a[href="#/migration"]')) {
      return;
    }

    const methodology = document.querySelector('a[href="#/methodology"]');

    if (!methodology) {
      return;
    }

    const parent = methodology.parentElement;

    if (parent && parent.tagName === "LI") {
      const clone = parent.cloneNode(true);
      const link = clone.querySelector("a");

      if (link) {
        link.href = ROUTE;
        link.textContent = "Migration";
        link.setAttribute("data-route", "migration");
        parent.after(clone);
      }
      return;
    }

    const link = methodology.cloneNode(true);
    link.href = ROUTE;
    link.textContent = "Migration";
    link.setAttribute("data-route", "migration");
    methodology.after(link);
  }

  function routeActive() {
    return window.location.hash === ROUTE;
  }

  async function loadPayload() {
    if (state.payload) {
      return state.payload;
    }

    const response = await fetch(DATA_URL, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Migration payload request failed: ${response.status}`,
      );
    }

    state.payload = await response.json();

    if (state.payload.status !== "PASS") {
      throw new Error("Migration payload is not governed PASS.");
    }

    return state.payload;
  }

  function getPeriods() {
    return state.payload.periods
      .filter((row) => row.time_grain === state.grain)
      .sort((a, b) => a.period_ordinal - b.period_ordinal);
  }

  function getMaximumPeriods() {
    return Number(
      state.payload.controls.maximum_periods[state.grain],
    );
  }

  function periodLabel(period) {
    const grainLabel = {
      YEAR: "Year",
      QUARTER: "Quarter",
      MONTH: "Month",
    }[period.time_grain];

    const partial = period.is_partial_final_period ? " • partial" : "";

    return `${grainLabel} ${period.period_ordinal} · DAY ${period.period_start_day}–${period.period_end_day}${partial}`;
  }

  function initializeRange() {
    const periods = getPeriods();
    const maximum = getMaximumPeriods();

    const fromIndex = Math.max(
      0,
      periods.length - maximum,
    );

    state.fromOrdinal = periods[fromIndex].period_ordinal;
    state.toOrdinal = periods[periods.length - 1].period_ordinal;
  }

  function normalizeRange() {
    const periods = getPeriods();
    const maximum = getMaximumPeriods();
    const ordinals = periods.map((row) => row.period_ordinal);

    if (!ordinals.includes(state.fromOrdinal)) {
      initializeRange();
      return;
    }

    const fromIndex = ordinals.indexOf(state.fromOrdinal);

    const maxToIndex = Math.min(
      periods.length - 1,
      fromIndex + maximum - 1,
    );

    const minimumToIndex = Math.min(
      periods.length - 1,
      fromIndex + 1,
    );

    if (
      !ordinals.includes(state.toOrdinal) ||
      state.toOrdinal <= state.fromOrdinal ||
      ordinals.indexOf(state.toOrdinal) > maxToIndex
    ) {
      state.toOrdinal = periods[
        Math.max(minimumToIndex, maxToIndex)
      ].period_ordinal;
    }
  }

  function selectedPeriods() {
    normalizeRange();

    return getPeriods().filter(
      (period) =>
        period.period_ordinal >= state.fromOrdinal &&
        period.period_ordinal <= state.toOrdinal,
    );
  }

  function selectedMatrixRows() {
    return state.payload.matrix_rows.filter(
      (row) =>
        row.method_id === state.method &&
        row.state_level === state.level &&
        row.time_grain === state.grain &&
        row.from_period_ordinal >= state.fromOrdinal &&
        row.to_period_ordinal <= state.toOrdinal,
    );
  }

  function selectedKpis() {
    return state.payload.kpis.filter(
      (row) =>
        row.method_id === state.method &&
        row.state_level === state.level &&
        row.time_grain === state.grain &&
        row.from_period_ordinal >= state.fromOrdinal &&
        row.to_period_ordinal <= state.toOrdinal,
    );
  }

  function getStateOrder() {
    const wrapper = state.payload.taxonomy.matrix_state_order;

    return wrapper.state_order[state.method][state.level];
  }

  function migrationDisplayLabel(technicalState) {
    return (
      state.payload.display_labels
        ?.state_display
        ?.[state.method]
        ?.[state.level]
        ?.[technicalState] ||
      technicalState
    );
  }

  function migrationColorForState(technicalState) {
    const palettes = {
      RFM: {
        NOT_YET_ACQUIRED: "#94a3b8",
        New: "#2563eb",
        Retained: "#16a34a",
        Reactivated: "#d97706",
        Lapsed: "#dc2626",
      },

      ML_KMEANS: {
        NOT_YET_ACQUIRED: "#94a3b8",
        P01: "#2563eb",
        P02: "#16a34a",
        P03: "#d97706",
      },
    };

    let parent = technicalState;

    if (state.method === "ML_KMEANS") {
      const match =
        String(technicalState).match(
          /^(P0[1-3])/
        );

      if (match) {
        parent = match[1];
      }
    }

    if (
      state.method === "RFM" &&
      state.level === "SUBGROUP"
    ) {
      if (technicalState.startsWith("New")) {
        parent = "New";
      } else if (
        technicalState.startsWith("Retained")
      ) {
        parent = "Retained";
      } else if (
        technicalState.startsWith("Reactivated")
      ) {
        parent = "Reactivated";
      } else if (
        technicalState.includes("Lapsed")
      ) {
        parent = "Lapsed";
      }
    }

    return (
      palettes[state.method]?.[parent] ||
      "#64748b"
    );
  }

  function migrationRgba(hex, alpha) {
    const clean = hex.replace("#", "");

    const red =
      parseInt(clean.slice(0, 2), 16);

    const green =
      parseInt(clean.slice(2, 4), 16);

    const blue =
      parseInt(clean.slice(4, 6), 16);

    return (
      `rgba(${red}, ${green}, ${blue}, ${alpha})`
    );
  }

  function migrationClusterExplanation(technicalState) {
    if (state.method !== "ML_KMEANS") {
      return (
        state.payload.display_labels
          ?.explanations
          ?.RFM ||
        ""
      );
    }

    const match =
      String(technicalState).match(
        /^(P0[1-3])/
      );

    if (!match) {
      return "";
    }

    return (
      state.payload.display_labels
        ?.explanations
        ?.[match[1]] ||
      ""
    );
  }

  function buildControlsHtml() {
    const periods = getPeriods();
    normalizeRange();

    const maximum = getMaximumPeriods();

    const methodButtons = state.payload.controls.methods
      .map(
        (option) => `
          <button
            type="button"
            data-migration-method="${escapeHtml(option.id)}"
            aria-pressed="${option.id === state.method ? "true" : "false"}"
          >
            ${escapeHtml(option.label)}
          </button>
        `,
      )
      .join("");

    const levelButtons = state.payload.controls.levels
      .map(
        (option) => `
          <button
            type="button"
            data-migration-level="${escapeHtml(option.id)}"
            aria-pressed="${option.id === state.level ? "true" : "false"}"
          >
            ${escapeHtml(option.label)}
          </button>
        `,
      )
      .join("");

    const grainButtons = state.payload.controls.grains
      .map(
        (option) => `
          <button
            type="button"
            data-migration-grain="${escapeHtml(option.id)}"
            aria-pressed="${option.id === state.grain ? "true" : "false"}"
          >
            ${escapeHtml(option.label)}
          </button>
        `,
      )
      .join("");

    const fromOptions = periods
      .slice(0, -1)
      .map(
        (period) => `
          <option
            value="${period.period_ordinal}"
            ${period.period_ordinal === state.fromOrdinal ? "selected" : ""}
          >
            ${escapeHtml(periodLabel(period))}
          </option>
        `,
      )
      .join("");

    const fromIndex = periods.findIndex(
      (row) => row.period_ordinal === state.fromOrdinal,
    );

    const maxToIndex = Math.min(
      periods.length - 1,
      fromIndex + maximum - 1,
    );

    const toOptions = periods
      .filter(
        (period, index) =>
          index > fromIndex &&
          index <= maxToIndex,
      )
      .map(
        (period) => `
          <option
            value="${period.period_ordinal}"
            ${period.period_ordinal === state.toOrdinal ? "selected" : ""}
          >
            ${escapeHtml(periodLabel(period))}
          </option>
        `,
      )
      .join("");

    return `
      <section class="migration-controls" aria-label="Migration controls">
        <div class="migration-control">
          <span class="migration-control-label">Segmentation Method</span>
          <div class="migration-segmented" id="migration-method">
            ${methodButtons}
          </div>
        </div>

        <div class="migration-control">
          <span class="migration-control-label">Migration Level</span>
          <div class="migration-segmented" id="migration-level">
            ${levelButtons}
          </div>
        </div>

        <div class="migration-control">
          <span class="migration-control-label">Time Grain</span>
          <div class="migration-segmented" id="migration-grain">
            ${grainButtons}
          </div>
        </div>

        <label class="migration-control" for="migration-from">
          <span class="migration-control-label">From period</span>
          <select class="migration-select" id="migration-from">
            ${fromOptions}
          </select>
        </label>

        <label class="migration-control" for="migration-to">
          <span class="migration-control-label">To period</span>
          <select class="migration-select" id="migration-to">
            ${toOptions}
          </select>
        </label>

        <p class="migration-range-note">
          Range is chronological and contiguous. Every intermediate adjacent
          transition is included. Maximum visible range:
          ${maximum} ${state.grain.toLowerCase()} periods.
        </p>
      </section>
    `;
  }

  function computeKpis() {
    const rows = selectedKpis();

    const opportunities = rows.reduce(
      (sum, row) => sum + Number(row.population || 0),
      0,
    );

    const movers = rows.reduce(
      (sum, row) => sum + Number(row.mover_count || 0),
      0,
    );

    const stayers = rows.reduce(
      (sum, row) => sum + Number(row.stayer_count || 0),
      0,
    );

    const entries = rows.reduce(
      (sum, row) => sum + Number(row.entry_count || 0),
      0,
    );

    const periodPairs = rows.length;

    return {
      opportunities,
      movers,
      stayers,
      entries,
      periodPairs,
      moverRate: opportunities > 0 ? movers / opportunities : 0,
    };
  }

  function buildKpisHtml() {
    const values = computeKpis();

    const cards = [
      {
        label: "Households / snapshot",
        value: "2,500",
        note: "Fixed governed customer universe",
      },
      {
        label: "Adjacent period pairs",
        value: formatNumber(values.periodPairs),
        note: "Every period between From and To",
      },
      {
        label: "Movement events",
        value: formatNumber(values.movers),
        note: "State changes across selected adjacent pairs",
      },
      {
        label: "Movement rate",
        value: formatPercent(values.moverRate),
        note: "Movers / transition opportunities",
      },
      {
        label: "Acquisition entries",
        value: formatNumber(values.entries),
        note: "NOT_YET_ACQUIRED → acquired state",
      },
    ];

    return `
      <section class="migration-kpis" aria-label="Migration KPIs">
        ${cards
          .map(
            (card) => `
              <article class="migration-kpi">
                <p class="migration-kpi-label">${escapeHtml(card.label)}</p>
                <p class="migration-kpi-value">${escapeHtml(card.value)}</p>
                <p class="migration-kpi-note">${escapeHtml(card.note)}</p>
              </article>
            `,
          )
          .join("")}
      </section>
    `;
  }

  function aggregateTransitions() {
    const aggregated = new Map();

    for (const row of selectedMatrixRows()) {
      const key = `${row.from_state}|||${row.to_state}`;

      if (!aggregated.has(key)) {
        aggregated.set(key, {
          fromState: row.from_state,
          toState: row.to_state,
          count: 0,
          fromPopulation: 0,
        });
      }

      const item = aggregated.get(key);
      item.count += Number(row.customer_count || 0);
      item.fromPopulation += Number(row.from_state_population || 0);
    }

    return Array.from(aggregated.values()).map((item) => ({
      ...item,
      rate:
        item.fromPopulation > 0
          ? item.count / item.fromPopulation
          : 0,
    }));
  }

  function largestMovement() {
    const movements = aggregateTransitions()
      .filter(
        (row) =>
          row.fromState !== row.toState &&
          row.count > 0,
      )
      .sort((a, b) => b.count - a.count);

    return movements[0] || null;
  }

function buildInsightsHtml() {
    const largest =
      largestMovement();

    if (
      !state.selectedTransition ||
      !aggregateTransitions().some(
        (row) =>
          row.fromState ===
            state.selectedTransition.fromState &&
          row.toState ===
            state.selectedTransition.toState,
      )
    ) {
      state.selectedTransition =
        largest;
    }

    const selected =
      state.selectedTransition;

    const technicalStates =
      getStateOrder();

    const displayStates =
      technicalStates.map(
        (technicalState) =>
          migrationDisplayLabel(
            technicalState,
          ),
      );

    const methodTitle =
      state.method === "RFM"
        ? "RFM — Lifecycle segmentation"
        : "ML — Behavioral clustering";

    const methodCopy =
      state.method === "RFM"
        ? (
            "Lifecycle states use governed point-in-time " +
            "acquisition and activity behavior. " +
            "The underlying RFM logic is unchanged."
          )
        : (
            "Behavioral names summarize the accepted Step 4 " +
            "P01/P02/P03 profiles. Historical assignments still " +
            "use the frozen scorer; no KMeans or centroid refit occurs."
          );

    const largestHtml =
      largest
        ? `
          <p class="migration-insight-title">
            ${escapeHtml(
              migrationDisplayLabel(
                largest.fromState
              )
            )}
            →
            ${escapeHtml(
              migrationDisplayLabel(
                largest.toState
              )
            )}
          </p>

          <p class="migration-insight-copy">
            ${formatNumber(
              largest.count
            )}
            movement events across the selected contiguous range ·
            ${formatPercent(
              largest.rate
            )}
            of transitions originating from
            ${escapeHtml(
              migrationDisplayLabel(
                largest.fromState
              )
            )}.
          </p>
        `
        : `
          <p class="migration-insight-title">
            No off-diagonal movement
          </p>

          <p class="migration-insight-copy">
            The selected range contains no observed state changes.
          </p>
        `;

    const selectedHtml =
      selected
        ? `
          <p class="migration-insight-title">
            ${escapeHtml(
              migrationDisplayLabel(
                selected.fromState
              )
            )}
            →
            ${escapeHtml(
              migrationDisplayLabel(
                selected.toState
              )
            )}
          </p>

          <div class="migration-detail-grid">
            <div class="migration-detail-metric">
              <strong>
                ${formatNumber(
                  selected.count
                )}
              </strong>

              <span>
                selected-range events
              </span>
            </div>

            <div class="migration-detail-metric">
              <strong>
                ${formatPercent(
                  selected.rate
                )}
              </strong>

              <span>
                row-normalized rate
              </span>
            </div>
          </div>

          <p class="migration-insight-copy">
            Technical transition:
            ${escapeHtml(
              selected.fromState
            )}
            →
            ${escapeHtml(
              selected.toState
            )}.
          </p>
        `
        : "";

    const explanationState =
      selected?.fromState ||
      technicalStates[0];

    const explanation =
      migrationClusterExplanation(
        explanationState,
      );

    return `
      <aside
        class="migration-panel"
        aria-label="Migration insights"
      >
        <section class="migration-insight">
          <p class="migration-insight-label">
            Largest movement
          </p>

          ${largestHtml}
        </section>

        <section
          class="migration-insight"
          id="migration-selected-detail"
        >
          <p class="migration-insight-label">
            Selected transition
          </p>

          ${selectedHtml}
        </section>

        <section class="migration-insight">
          <p class="migration-insight-label">
            Method taxonomy
          </p>

          <p class="migration-insight-title">
            ${escapeHtml(
              methodTitle
            )}
          </p>

          <p class="migration-insight-copy">
            ${escapeHtml(
              methodCopy
            )}
          </p>

          ${
            explanation
              ? `
                <p class="migration-insight-copy">
                  <strong>
                    Why this name:
                  </strong>
                  ${escapeHtml(
                    explanation
                  )}
                </p>
              `
              : ""
          }

          <div class="migration-taxonomy-list">
            ${displayStates
              .map(
                (item) => `
                  <span class="migration-taxonomy-chip">
                    ${escapeHtml(
                      item
                    )}
                  </span>
                `,
              )
              .join("")}
          </div>
        </section>
      </aside>
    `;
  }

  function buildPageHtml() {
    return `
      <div class="migration-shell">
        <header class="migration-hero">
          <div>
            <p class="migration-eyebrow">Customer Migration Decision Studio</p>
            <h1 class="migration-title">Customer Migration</h1>
            <p class="migration-subtitle">
              Explore how the same governed 2,500-household universe moves
              between RFM lifecycle states or frozen ML — KMeans states across
              relative Year, Quarter, and Month periods.
            </p>
          </div>

          <div class="migration-governance" aria-label="Governance">
            <span class="migration-badge">2,500 fixed households</span>
            <span class="migration-badge">34 governed snapshots</span>
            <span class="migration-badge">No future leakage</span>
            <span class="migration-badge">Descriptive, not causal</span>
          </div>
        </header>

        ${buildControlsHtml()}

        <div id="migration-kpis-container">
          ${buildKpisHtml()}
        </div>

        <section class="migration-grid">
          <article class="migration-panel">
            <div class="migration-panel-head">
              <div>
                <h2 class="migration-panel-title">Multi-period migration flow</h2>
                <p class="migration-panel-copy">
                  Each vertical column is an explicit governed period. Links
                  connect adjacent periods only; X position is fixed by period.
                </p>
              </div>
            </div>
            <div
              id="migration-sankey"
              class="migration-chart"
              aria-label="Customer migration Sankey"
            ></div>
          </article>

          ${buildInsightsHtml()}
        </section>

        <section class="migration-panel">
          <div class="migration-panel-head">
            <div>
              <h2 class="migration-panel-title">Selected-range transition matrix</h2>
              <p class="migration-panel-copy">
                Counts aggregate every adjacent transition inside the selected
                contiguous range. Hover for count and row-normalized rate.
              </p>
            </div>
          </div>
          <div
            id="migration-matrix"
            class="migration-matrix-chart"
            aria-label="Transition matrix"
          ></div>
        </section>

        <p class="migration-footnote">
          Time is project-relative source DAY, not calendar time. RFM and
          ML — KMeans are alternative descriptive segmentation views of the
          same household universe. Migration should not be interpreted as
          causal treatment effect.
        </p>
      </div>
    `;
  }

  function plotConfig() {
    return {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: [
        "lasso2d",
        "select2d",
      ],
    };
  }

function renderSankey() {
    const container =
      document.querySelector(
        "#migration-sankey"
      );

    if (!container || !window.Plotly) {
      return;
    }

    const periods = selectedPeriods();

    const rows =
      selectedMatrixRows().filter(
        (row) =>
          Number(
            row.customer_count
          ) > 0,
      );

    const governedStates =
      getStateOrder();

    const activeByPeriod =
      new Map();

    for (const period of periods) {
      activeByPeriod.set(
        period.period_id,
        new Set(),
      );
    }

    for (const row of rows) {
      activeByPeriod
        .get(row.from_period_id)
        ?.add(row.from_state);

      activeByPeriod
        .get(row.to_period_id)
        ?.add(row.to_state);
    }

    const nodeIndex =
      new Map();

    const labels = [];
    const x = [];
    const nodeColors = [];
    const nodeCustom = [];

    periods.forEach(
      (
        period,
        periodIndex,
      ) => {
        const activeStates =
          governedStates.filter(
            (technicalState) =>
              activeByPeriod
                .get(period.period_id)
                ?.has(
                  technicalState
                ),
          );

        for (
          const technicalState
          of activeStates
        ) {
          const key =
            `${period.period_id}|||${technicalState}`;

          nodeIndex.set(
            key,
            labels.length,
          );

          labels.push(
            migrationDisplayLabel(
              technicalState,
            ),
          );

          const periodX =
            periods.length > 1
              ? (
                  0.025 +
                  (
                    periodIndex /
                    (
                      periods.length
                      - 1
                    )
                  ) *
                    0.95
                )
              : 0.5;

          x.push(
            periodX
          );

          nodeColors.push(
            migrationColorForState(
              technicalState,
            ),
          );

          nodeCustom.push([
            periodLabel(
              period
            ),
            technicalState,
            migrationDisplayLabel(
              technicalState,
            ),
          ]);
        }
      },
    );

    const sources = [];
    const targets = [];
    const values = [];
    const linkColors = [];
    const linkCustom = [];

    for (const row of rows) {
      const sourceKey =
        `${row.from_period_id}|||${row.from_state}`;

      const targetKey =
        `${row.to_period_id}|||${row.to_state}`;

      if (
        !nodeIndex.has(
          sourceKey
        ) ||
        !nodeIndex.has(
          targetKey
        )
      ) {
        continue;
      }

      sources.push(
        nodeIndex.get(
          sourceKey
        ),
      );

      targets.push(
        nodeIndex.get(
          targetKey
        ),
      );

      values.push(
        Number(
          row.customer_count
        ),
      );

      linkColors.push(
        migrationRgba(
          migrationColorForState(
            row.from_state,
          ),
          0.38,
        ),
      );

      linkCustom.push([
        migrationDisplayLabel(
          row.from_state,
        ),
        migrationDisplayLabel(
          row.to_state,
        ),
        Number(
          row.customer_count
        ),
        Number(
          row.transition_rate || 0
        ),
        row.from_period_id,
        row.to_period_id,
        row.from_state,
        row.to_state,
      ]);
    }

    const trace = {
      type: "sankey",
      orientation: "h",

      // Plotly owns vertical placement.
      // We provide only governed period X columns.
      arrangement: "snap",

      node: {
        pad: 20,
        thickness: 20,

        line: {
          color:
            "rgba(15,23,42,0.36)",
          width: 0.7,
        },

        label:
          labels,

        x,

        color:
          nodeColors,

        customdata:
          nodeCustom,

        hovertemplate:
          "%{customdata[0]}" +
          "<br><b>%{customdata[2]}</b>" +
          "<br>Technical state: %{customdata[1]}" +
          "<extra></extra>",
      },

      link: {
        source:
          sources,

        target:
          targets,

        value:
          values,

        color:
          linkColors,

        customdata:
          linkCustom,

        hovertemplate:
          "<b>%{customdata[0]} → %{customdata[1]}</b>" +
          "<br>Customers: %{customdata[2]:,}" +
          "<br>Source-state rate: %{customdata[3]:.1%}" +
          "<br>%{customdata[4]} → %{customdata[5]}" +
          "<extra></extra>",
      },
    };

    const annotations =
      periods.map(
        (
          period,
          index,
        ) => ({
          x:
            periods.length > 1
              ? (
                  0.025 +
                  (
                    index /
                    (
                      periods.length
                      - 1
                    )
                  ) *
                    0.95
                )
              : 0.5,

          y: 1.07,
          xref: "paper",
          yref: "paper",

          text:
            `${state.grain[0]}${period.period_ordinal}`,

          showarrow: false,

          font: {
            size: 12,
            family: "inherit",
          },
        }),
      );

    const layout = {
      margin: {
        l:
          window.innerWidth < 760
            ? 18
            : 30,

        r:
          window.innerWidth < 760
            ? 18
            : 30,

        t: 68,
        b: 30,
      },

      height:
        window.innerWidth < 760
          ? 520
          : 560,

      font: {
        family: "inherit",

        size:
          window.innerWidth < 760
            ? 9
            : 11,
      },

      paper_bgcolor:
        "rgba(0,0,0,0)",

      plot_bgcolor:
        "rgba(0,0,0,0)",

      annotations,
    };

    window.Plotly.react(
      container,
      [trace],
      layout,
      plotConfig(),
    );

    container.removeAllListeners?.(
      "plotly_click",
    );

    container.on?.(
      "plotly_click",
      (event) => {
        const custom =
          event?.points?.[0]
            ?.customdata;

        if (
          !Array.isArray(
            custom
          ) ||
          custom.length < 8
        ) {
          return;
        }

        state.selectedTransition = {
          fromState:
            custom[6],

          toState:
            custom[7],

          count:
            Number(
              custom[2]
            ),

          rate:
            Number(
              custom[3]
            ),
        };

        refreshInsightsOnly();
      },
    );
  }

function renderMatrix() {
    const container =
      document.querySelector(
        "#migration-matrix"
      );

    if (!container || !window.Plotly) {
      return;
    }

    const states =
      getStateOrder();

    const displayStates =
      states.map(
        (technicalState) =>
          migrationDisplayLabel(
            technicalState,
          ),
      );

    const aggregate =
      aggregateTransitions();

    const lookup =
      new Map(
        aggregate.map(
          (row) => [
            `${row.fromState}|||${row.toState}`,
            row,
          ],
        ),
      );

    const z = [];
    const customdata = [];
    const text = [];

    for (
      const fromState
      of states
    ) {
      const zRow = [];
      const customRow = [];
      const textRow = [];

      for (
        const toState
        of states
      ) {
        const row =
          lookup.get(
            `${fromState}|||${toState}`,
          ) || {
            fromState,
            toState,
            count: 0,
            rate: 0,
          };

        zRow.push(
          row.count
        );

        customRow.push([
          fromState,
          toState,
          migrationDisplayLabel(
            fromState,
          ),
          migrationDisplayLabel(
            toState,
          ),
          row.count,
          row.rate,
        ]);

        textRow.push(
          row.count > 0
            ? formatNumber(
                row.count
              )
            : "",
        );
      }

      z.push(
        zRow
      );

      customdata.push(
        customRow
      );

      text.push(
        textRow
      );
    }

    const trace = {
      type: "heatmap",

      x:
        displayStates,

      y:
        displayStates,

      z,

      customdata,

      text,

      texttemplate:
        "%{text}",

      hovertemplate:
        "<b>%{customdata[2]} → %{customdata[3]}</b>" +
        "<br>Events: %{customdata[4]:,}" +
        "<br>Row rate: %{customdata[5]:.1%}" +
        "<br>Technical: %{customdata[0]} → %{customdata[1]}" +
        "<extra></extra>",

      hoverongaps:
        false,

      showscale:
        true,

      colorbar: {
        title:
          "Events",

        thickness:
          12,
      },
    };

    const longest =
      Math.max(
        ...displayStates.map(
          (value) =>
            value.length,
        ),
      );

    const leftMargin =
      window.innerWidth < 760
        ? Math.min(
            190,
            72 +
              longest * 3,
          )
        : Math.min(
            325,
            110 +
              longest * 4,
          );

    const bottomMargin =
      window.innerWidth < 760
        ? Math.min(
            190,
            72 +
              longest * 3,
          )
        : Math.min(
            280,
            90 +
              longest * 3,
          );

    const layout = {
      margin: {
        l:
          leftMargin,

        r:
          52,

        t:
          30,

        b:
          bottomMargin,
      },

      height:
        window.innerWidth < 760
          ? 540
          : 580,

      xaxis: {
        title:
          "To state",

        tickangle:
          -32,

        automargin:
          true,
      },

      yaxis: {
        title:
          "From state",

        automargin:
          true,

        autorange:
          "reversed",
      },

      font: {
        family:
          "inherit",

        size:
          window.innerWidth < 760
            ? 8
            : 10,
      },

      paper_bgcolor:
        "rgba(0,0,0,0)",

      plot_bgcolor:
        "rgba(0,0,0,0)",
    };

    window.Plotly.react(
      container,
      [trace],
      layout,
      plotConfig(),
    );

    container.removeAllListeners?.(
      "plotly_click",
    );

    container.on?.(
      "plotly_click",
      (event) => {
        const custom =
          event?.points?.[0]
            ?.customdata;

        if (
          !Array.isArray(
            custom
          ) ||
          custom.length < 6
        ) {
          return;
        }

        state.selectedTransition = {
          fromState:
            custom[0],

          toState:
            custom[1],

          count:
            Number(
              custom[4]
            ),

          rate:
            Number(
              custom[5]
            ),
        };

        refreshInsightsOnly();
      },
    );
  }

  function refreshInsightsOnly() {
    const existing = document.querySelector(
      '.migration-panel[aria-label="Migration insights"]',
    );

    if (!existing) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.innerHTML = buildInsightsHtml().trim();

    const replacement = wrapper.firstElementChild;

    if (replacement) {
      existing.replaceWith(replacement);
    }
  }

  function attachControlHandlers() {
    document
      .querySelectorAll("[data-migration-method]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          state.method = button.dataset.migrationMethod;
          state.selectedTransition = null;
          render();
        });
      });

    document
      .querySelectorAll("[data-migration-level]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          state.level = button.dataset.migrationLevel;
          state.selectedTransition = null;
          render();
        });
      });

    document
      .querySelectorAll("[data-migration-grain]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          state.grain = button.dataset.migrationGrain;
          state.selectedTransition = null;
          initializeRange();
          render();
        });
      });

    const fromSelect = document.querySelector("#migration-from");
    const toSelect = document.querySelector("#migration-to");

    fromSelect?.addEventListener("change", () => {
      state.fromOrdinal = Number(fromSelect.value);
      state.selectedTransition = null;
      normalizeRange();
      render();
    });

    toSelect?.addEventListener("change", () => {
      state.toOrdinal = Number(toSelect.value);
      state.selectedTransition = null;
      normalizeRange();
      render();
    });
  }

  async function render() {
    if (!routeActive() || state.rendering) {
      return;
    }

    const root = findRoot();

    if (!root) {
      throw new Error(
        "Migration route could not locate the application's main content root.",
      );
    }

    state.rendering = true;

    try {
      root.innerHTML = `
        <div class="migration-loading">
          Loading governed customer migration…
        </div>
      `;

      await loadPayload();

      if (state.fromOrdinal === null || state.toOrdinal === null) {
        initializeRange();
      }

      normalizeRange();

      root.innerHTML = buildPageHtml();

      attachControlHandlers();

      renderSankey();
      renderMatrix();

      document.body.setAttribute(
        "data-active-route",
        "migration",
      );

      document.dispatchEvent(
        new CustomEvent(
          "migration:rendered",
          {
            detail: {
              method: state.method,
              level: state.level,
              grain: state.grain,
              fromOrdinal: state.fromOrdinal,
              toOrdinal: state.toOrdinal,
            },
          },
        ),
      );
    } catch (error) {
      root.innerHTML = `
        <div class="migration-error">
          <strong>Customer Migration could not render.</strong>
          <p>${escapeHtml(error?.message || error)}</p>
        </div>
      `;

      console.error(error);
    } finally {
      state.rendering = false;
    }
  }

  function handleRoute() {
    ensureNavLink();

    if (routeActive()) {
      window.setTimeout(
        () => {
          render();
        },
        0,
      );
    }
  }

  window.addEventListener(
    "hashchange",
    handleRoute,
  );

  window.addEventListener(
    "resize",
    () => {
      if (!routeActive()) {
        return;
      }

      const sankey = document.querySelector("#migration-sankey");
      const matrix = document.querySelector("#migration-matrix");

      if (window.Plotly) {
        if (sankey) {
          window.Plotly.Plots.resize(sankey);
        }

        if (matrix) {
          window.Plotly.Plots.resize(matrix);
        }
      }
    },
  );

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      handleRoute,
      {
        once: true,
      },
    );
  } else {
    handleRoute();
  }

  const observer = new MutationObserver(() => {
    ensureNavLink();

    if (
      routeActive() &&
      !state.rendering &&
      !document.querySelector(".migration-shell")
    ) {
      window.setTimeout(
        () => {
          render();
        },
        0,
      );
    }
  });

  observer.observe(
    document.documentElement,
    {
      childList: true,
      subtree: true,
    },
  );

  window.__migrationDashboard = {
    getState: () => ({
      method: state.method,
      level: state.level,
      grain: state.grain,
      fromOrdinal: state.fromOrdinal,
      toOrdinal: state.toOrdinal,
    }),
    getPayload: () => state.payload,
    render,
  };
})();
