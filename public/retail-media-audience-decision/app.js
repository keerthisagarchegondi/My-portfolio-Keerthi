"use strict";

const ROUTES = [
  ["overview", "Overview"],
  ["audiences", "Audience Studio"],
  ["activation", "Activation"],
  ["performance", "Performance"],
  ["incrementality", "Incrementality"],
  ["attribution", "Attribution"],
  ["data", "Data & Provenance"],
  ["methodology", "Settings"]
];

const COLORS = {
  blue: "#2f80ed",
  purple: "#7552e8",
  green: "#1da866",
  orange: "#ef8b2c",
  red: "#e55858",
  navy: "#12263f",
  muted: "#62748a",
  grid: "#e7edf4"
};

const state = {
  evidence: null,
  contract: null,

  audienceType: "ALL",
  audienceCategory: "ALL",

  activationAction: "ALL",

  performanceMetric:
    "impression_count",

  incrementalityTreatment:
    "ALL",

  attributionMethod:
    "First"
};

const MEDIA_LABELS = {
  impression_count:
    "Impressions",

  click_count:
    "Clicks",

  conversion_completion_count:
    "Conversion completions",

  media_cost_index:
    "Media Cost Index"
};

function escapeHtml(value) {
  return String(
    value ?? ""
  )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function integer(value) {
  return Math.round(
    Number(value || 0)
  ).toLocaleString(
    "en-US"
  );
}

function compact(value) {
  const number =
    Number(value || 0);

  if (
    Math.abs(number)
    >= 1000000
  ) {
    return (
      number / 1000000
    ).toFixed(2) + "M";
  }

  if (
    Math.abs(number)
    >= 1000
  ) {
    return (
      number / 1000
    ).toFixed(1) + "K";
  }

  return number.toLocaleString(
    "en-US",
    {
      maximumFractionDigits: 2
    }
  );
}

function percent(
  value,
  digits = 1
) {
  return (
    Number(value || 0)
    * 100
  ).toFixed(
    digits
  ) + "%";
}

function usd(value) {
  return Number(
    value || 0
  ).toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }
  );
}

function pageHeader(
  title,
  subtitle
) {
  return `
    <header class="page-header">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(subtitle)}</p>
    </header>
  `;
}

function kpi(
  label,
  value,
  note,
  className = ""
) {
  return `
    <article class="kpi-card ${className}">
      <div class="kpi-label">
        ${escapeHtml(label)}
      </div>

      <div class="kpi-value">
        ${escapeHtml(value)}
      </div>

      <div class="kpi-note">
        ${escapeHtml(note)}
      </div>
    </article>
  `;
}

function panel(
  title,
  subtitle,
  body
) {
  return `
    <section class="panel">
      <header class="panel-head">
        <div>
          <h2 class="panel-title">
            ${escapeHtml(title)}
          </h2>

          ${
            subtitle
              ? `
                <div class="panel-subtitle">
                  ${escapeHtml(subtitle)}
                </div>
              `
              : ""
          }
        </div>
      </header>

      <div class="panel-body">
        ${body}
      </div>
    </section>
  `;
}

function tableHtml(
  columns,
  rows
) {
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            ${columns.map(
              column => `
                <th>
                  ${escapeHtml(column.label)}
                </th>
              `
            ).join("")}
          </tr>
        </thead>

        <tbody>
          ${rows.map(
            row => `
              <tr>
                ${columns.map(
                  column => `
                    <td>
                      ${escapeHtml(
                        row[column.key]
                      )}
                    </td>
                  `
                ).join("")}
              </tr>
            `
          ).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function actionBadge(
  action
) {
  const classes = {
    SCALE:
      "badge-scale",

    MAINTAIN_HOLDOUT:
      "badge-holdout",

    RETEST:
      "badge-retest",

    INVESTIGATE:
      "badge-investigate"
  };

  return `
    <span
      class="badge ${classes[action] || ""}"
    >
      ${escapeHtml(action)}
    </span>
  `;
}

function plotLayout(
  extra = {}
) {
  return {
    paper_bgcolor:
      "rgba(0,0,0,0)",

    plot_bgcolor:
      "rgba(0,0,0,0)",

    font: {
      family:
        'Inter,"Segoe UI",Arial,sans-serif',
      color:
        COLORS.navy,
      size:
        11
    },

    margin: {
      l: 42,
      r: 14,
      t: 24,
      b: 38
    },

    xaxis: {
      gridcolor:
        COLORS.grid,
      zerolinecolor:
        COLORS.grid
    },

    yaxis: {
      gridcolor:
        COLORS.grid,
      zerolinecolor:
        COLORS.grid
    },

    legend: {
      orientation:
        "h",
      x:
        0,
      y:
        1.13
    },

    ...extra
  };
}

const plotConfig = {
  responsive:
    true,

  displayModeBar:
    false
};

function mediaTotals() {
  return state.evidence
    .media_timeseries
    .reduce(
      (
        totals,
        row
      ) => {
        totals.impressions +=
          Number(
            row.impression_count
          );

        totals.clicks +=
          Number(
            row.click_count
          );

        totals.conversions +=
          Number(
            row.conversion_completion_count
          );

        totals.mci +=
          Number(
            row.media_cost_index
          );

        return totals;
      },
      {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        mci: 0
      }
    );
}

function recommendationCounts() {
  const counts = {
    SCALE: 0,
    MAINTAIN_HOLDOUT: 0,
    RETEST: 0,
    INVESTIGATE: 0
  };

  state.evidence
    .activation_recommendations
    .forEach(
      row => {
        counts[
          row.next_action
        ] += 1;
      }
    );

  return counts;
}

function currentRoute() {
  const route =
    window.location.hash
      .replace(
        /^#\//,
        ""
      );

  return ROUTES.some(
    item =>
      item[0] === route
  )
    ? route
    : "overview";
}

function renderNav() {
  const nav =
    document.getElementById(
      "primary-nav"
    );

  nav.innerHTML =
    ROUTES.map(
      route => `
        <a
          href="#/${route[0]}"
          class="nav-link"
          data-route="${route[0]}"
        >
          ${escapeHtml(route[1])}
        </a>
      `
    ).join("");
}

function setActiveNav(
  route
) {
  document
    .querySelectorAll(
      ".nav-link"
    )
    .forEach(
      link => {
        link.classList.toggle(
          "active",
          link.dataset.route
            === route
        );
      }
    );
}

function overviewPage() {
  const retail =
    state.contract.retail;

  const totals =
    mediaTotals();

  const efficiency =
    totals.conversions
    / totals.mci;

  return `
    ${pageHeader(
      "Overview",
      "Executive summary across retail behavior, media performance, experimentation, attribution, and governed recommendations."
    )}

    <div class="kpi-grid">
      ${kpi(
        "Customers",
        compact(retail.customers),
        "validated retail customers",
        "kpi-purple"
      )}

      ${kpi(
        "Orders / Baskets",
        compact(retail.baskets),
        "validated retail baskets"
      )}

      ${kpi(
        "Retail Sales",
        usd(retail.sales),
        "dunnhumby sales value",
        "kpi-green"
      )}

      ${kpi(
        "Ad Impressions",
        compact(totals.impressions),
        "Criteo descriptive media",
        "kpi-purple"
      )}

      ${kpi(
        "Ad Clicks",
        compact(totals.clicks),
        "Criteo descriptive media"
      )}

      ${kpi(
        "Media Cost Index",
        totals.mci.toFixed(2),
        "transformed index · not currency",
        "kpi-orange"
      )}

      ${kpi(
        "Attributed Efficiency",
        efficiency.toFixed(1),
        "conversion completions / MCI",
        "kpi-green"
      )}
    </div>

    <div class="page-stack">
      <div class="grid grid-2">
        ${panel(
          "Audience Performance Trend",
          "Criteo source-relative validated evidence",
          `
            <div
              id="overview-media-chart"
              class="chart"
            ></div>
          `
        )}

        ${panel(
          "Primary Audience Mix",
          "exclusive primary retail audiences",
          `
            <div
              id="overview-audience-chart"
              class="chart"
            ></div>
          `
        )}
      </div>

      <div class="grid grid-2">
        ${panel(
          "Top Value Audiences",
          "primary and secondary audiences ranked by average monetary value",
          `
            <div id="overview-audience-table"></div>
          `
        )}

        ${panel(
          "Top Recommendations",
          "Step 8 governed actions",
          `
            <div
              id="overview-actions-chart"
              class="chart-sm"
            ></div>
          `
        )}
      </div>
    </div>
  `;
}

function drawOverview() {
  const media =
    state.evidence
      .media_timeseries;

  Plotly.newPlot(
    "overview-media-chart",
    [
      {
        x:
          media.map(
            row =>
              row.source_relative_day
          ),

        y:
          media.map(
            row =>
              row.impression_count
          ),

        name:
          "Impressions",

        type:
          "scatter",

        mode:
          "lines",

        line: {
          color:
            COLORS.purple,
          width:
            2
        }
      },

      {
        x:
          media.map(
            row =>
              row.source_relative_day
          ),

        y:
          media.map(
            row =>
              row.click_count
          ),

        name:
          "Clicks",

        type:
          "scatter",

        mode:
          "lines",

        line: {
          color:
            COLORS.blue,
          width:
            2
        }
      },

      {
        x:
          media.map(
            row =>
              row.source_relative_day
          ),

        y:
          media.map(
            row =>
              row.conversion_completion_count
          ),

        name:
          "Conversion completions",

        type:
          "scatter",

        mode:
          "lines",

        line: {
          color:
            COLORS.green,
          width:
            2
        }
      }
    ],
    plotLayout(),
    plotConfig
  );

  const primary =
    state.evidence
      .audience_profiles
      .filter(
        row =>
          String(
            row.audience_type
          )
            .toLowerCase()
            .includes(
              "primary"
            )
      );

  const primaryRows =
    primary.length > 0
      ? primary
      : state.evidence
          .audience_profiles
          .slice(
            0,
            3
          );

  Plotly.newPlot(
    "overview-audience-chart",
    [
      {
        labels:
          primaryRows.map(
            row =>
              row.audience_name
          ),

        values:
          primaryRows.map(
            row =>
              row.member_count
          ),

        type:
          "pie",

        hole:
          0.52,

        marker: {
          colors: [
            COLORS.blue,
            COLORS.green,
            COLORS.orange,
            COLORS.purple
          ]
        },

        textinfo:
          "label+percent",

        hovertemplate:
          "%{label}<br>%{value:,}<extra></extra>"
      }
    ],
    plotLayout({
      margin: {
        l: 10,
        r: 10,
        t: 10,
        b: 10
      },

      showlegend:
        false
    }),
    plotConfig
  );

  const top =
    [...state.evidence
      .audience_profiles]
      .sort(
        (
          left,
          right
        ) =>
          Number(
            right.average_monetary_value
          )
          - Number(
              left.average_monetary_value
            )
      )
      .slice(
        0,
        5
      );

  document
    .getElementById(
      "overview-audience-table"
    )
    .innerHTML =
      tableHtml(
        [
          {
            key:
              "audience",
            label:
              "Audience"
          },

          {
            key:
              "members",
            label:
              "Members"
          },

          {
            key:
              "value",
            label:
              "Avg value"
          },

          {
            key:
              "frequency",
            label:
              "Frequency"
          }
        ],
        top.map(
          row => ({
            audience:
              row.audience_name,

            members:
              integer(
                row.member_count
              ),

            value:
              Number(
                row.average_monetary_value
              ).toFixed(
                2
              ),

            frequency:
              Number(
                row.average_order_frequency
              ).toFixed(
                2
              )
          })
        )
      );

  const counts =
    recommendationCounts();

  Plotly.newPlot(
    "overview-actions-chart",
    [
      {
        x:
          [
            "Scale",
            "Maintain",
            "Retest",
            "Investigate"
          ],

        y:
          [
            counts.SCALE,
            counts.MAINTAIN_HOLDOUT,
            counts.RETEST,
            counts.INVESTIGATE
          ],

        type:
          "bar",

        marker: {
          color: [
            COLORS.green,
            COLORS.orange,
            COLORS.blue,
            COLORS.purple
          ]
        },

        hovertemplate:
          "%{x}: %{y}<extra></extra>"
      }
    ],
    plotLayout({
      margin: {
        l: 35,
        r: 10,
        t: 15,
        b: 40
      }
    }),
    plotConfig
  );
}

function audiencesPage() {
  const categories =
    [
      ...new Set(
        state.evidence
          .audience_profiles
          .map(
            row =>
              row.dominant_category
          )
          .filter(Boolean)
      )
    ]
      .sort();

  return `
    ${pageHeader(
      "Audience Studio",
      "Explore exclusive primary segments and overlapping activation audiences from validated retail behavior."
    )}

    <div class="controls">
      <div class="control">
        <label>
          Audience type
        </label>

        <select id="audience-type-filter">
          <option value="ALL">
            All audiences
          </option>

          <option value="primary">
            Primary
          </option>

          <option value="secondary">
            Secondary
          </option>
        </select>
      </div>

      <div class="control control-grow">
        <label>
          Dominant category
        </label>

        <select id="audience-category-filter">
          <option value="ALL">
            All categories
          </option>

          ${categories.map(
            category => `
              <option value="${escapeHtml(category)}">
                ${escapeHtml(category)}
              </option>
            `
          ).join("")}
        </select>
      </div>

      <button
        id="audience-reset"
        class="button"
      >
        Reset
      </button>
    </div>

    <div class="page-stack">
      <div class="grid grid-2">
        ${panel(
          "Primary Segment Value–Frequency Map",
          "average monetary value × order frequency · marker size = segment members",
          `
            <div
              id="audience-segment-chart"
              class="chart"
            ></div>
          `
        )}

        ${panel(
          "Customer Value",
          "average monetary value by validated audience",
          `
            <div
              id="audience-value-chart"
              class="chart"
            ></div>
          `
        )}
      </div>

      <div class="grid grid-2">
        ${panel(
          "Order Frequency",
          "average validated order frequency",
          `
            <div
              id="audience-frequency-chart"
              class="chart-sm"
            ></div>
          `
        )}

        ${panel(
          "Activation Audience Size",
          "secondary audiences may overlap",
          `
            <div
              id="audience-secondary-chart"
              class="chart-sm"
            ></div>
          `
        )}
      </div>

      ${panel(
        "Audience Profiles",
        "governed audience evidence",
        `
          <div id="audience-table"></div>
        `
      )}
    </div>
  `;
}

function filteredAudienceRows() {
  let rows =
    [...state.evidence
      .audience_profiles];

  if (
    state.audienceType
    !== "ALL"
  ) {
    rows =
      rows.filter(
        row =>
          String(
            row.audience_type
          )
            .toLowerCase()
            .includes(
              state.audienceType
            )
      );
  }

  if (
    state.audienceCategory
    !== "ALL"
  ) {
    rows =
      rows.filter(
        row =>
          row.dominant_category
          === state.audienceCategory
      );
  }

  return rows;
}

function drawAudiences() {
  const rows =
    filteredAudienceRows();

  const primary =
    rows.filter(
      row =>
        String(
          row.audience_type
        )
          .toLowerCase()
          .includes(
            "primary"
          )
    );

  const secondary =
    rows.filter(
      row =>
        !String(
          row.audience_type
        )
          .toLowerCase()
          .includes(
            "primary"
          )
    );

  const scatterRows =
    primary.length > 0
      ? primary
      : rows;

  Plotly.newPlot(
    "audience-segment-chart",
    [
      {
        x:
          scatterRows.map(
            row =>
              Number(
                row.average_monetary_value
              )
          ),

        y:
          scatterRows.map(
            row =>
              Number(
                row.average_order_frequency
              )
          ),

        text:
          scatterRows.map(
            row =>
              row.audience_name
          ),

        type:
          "scatter",

        mode:
          "markers+text",

        textposition:
          "top center",

        marker: {
          size:
            scatterRows.map(
              row =>
                Math.max(
                  14,
                  Math.sqrt(
                    Number(
                      row.member_count
                    )
                  )
                  * 0.85
                )
            ),

          color:
            [
              COLORS.blue,
              COLORS.green,
              COLORS.orange,
              COLORS.purple,
              COLORS.blue,
              COLORS.green,
              COLORS.orange,
              COLORS.purple,
              COLORS.blue,
              COLORS.green,
              COLORS.orange,
              COLORS.purple
            ],

          opacity:
            0.83
        },

        hovertemplate:
          "%{text}<br>Value %{x:.2f}<br>Frequency %{y:.2f}<extra></extra>"
      }
    ],
    plotLayout({
      xaxis: {
        title:
          "Average monetary value",
        gridcolor:
          COLORS.grid
      },

      yaxis: {
        title:
          "Average order frequency",
        gridcolor:
          COLORS.grid
      }
    }),
    plotConfig
  );

  Plotly.newPlot(
    "audience-value-chart",
    [
      {
        x:
          rows.map(
            row =>
              row.audience_name
          ),

        y:
          rows.map(
            row =>
              row.average_monetary_value
          ),

        type:
          "bar",

        marker: {
          color:
            COLORS.blue
        }
      }
    ],
    plotLayout({
      xaxis: {
        tickangle:
          -25,
        gridcolor:
          COLORS.grid
      }
    }),
    plotConfig
  );

  Plotly.newPlot(
    "audience-frequency-chart",
    [
      {
        x:
          rows.map(
            row =>
              row.audience_name
          ),

        y:
          rows.map(
            row =>
              row.average_order_frequency
          ),

        type:
          "bar",

        marker: {
          color:
            COLORS.green
        }
      }
    ],
    plotLayout({
      xaxis: {
        tickangle:
          -25,
        gridcolor:
          COLORS.grid
      }
    }),
    plotConfig
  );

  Plotly.newPlot(
    "audience-secondary-chart",
    [
      {
        x:
          secondary.map(
            row =>
              row.audience_name
          ),

        y:
          secondary.map(
            row =>
              row.member_count
          ),

        type:
          "bar",

        marker: {
          color:
            COLORS.purple
        }
      }
    ],
    plotLayout({
      xaxis: {
        tickangle:
          -25,
        gridcolor:
          COLORS.grid
      }
    }),
    plotConfig
  );

  document
    .getElementById(
      "audience-table"
    )
    .innerHTML =
      tableHtml(
        [
          {
            key:
              "audience",
            label:
              "Audience"
          },

          {
            key:
              "type",
            label:
              "Type"
          },

          {
            key:
              "members",
            label:
              "Members"
          },

          {
            key:
              "share",
            label:
              "Customer share"
          },

          {
            key:
              "recency",
            label:
              "Median recency"
          },

          {
            key:
              "frequency",
            label:
              "Avg frequency"
          },

          {
            key:
              "value",
            label:
              "Avg value"
          },

          {
            key:
              "category",
            label:
              "Dominant category"
          }
        ],
        rows.map(
          row => ({
            audience:
              row.audience_name,

            type:
              row.audience_type,

            members:
              integer(
                row.member_count
              ),

            share:
              percent(
                row.customer_share
              ),

            recency:
              Number(
                row.median_recency_days
              ).toFixed(
                1
              ),

            frequency:
              Number(
                row.average_order_frequency
              ).toFixed(
                2
              ),

            value:
              Number(
                row.average_monetary_value
              ).toFixed(
                2
              ),

            category:
              row.dominant_category
          })
        )
      );

  const typeFilter =
    document.getElementById(
      "audience-type-filter"
    );

  const categoryFilter =
    document.getElementById(
      "audience-category-filter"
    );

  typeFilter.value =
    state.audienceType;

  categoryFilter.value =
    state.audienceCategory;

  typeFilter.onchange =
    event => {
      state.audienceType =
        event.target.value;

      drawAudiences();
    };

  categoryFilter.onchange =
    event => {
      state.audienceCategory =
        event.target.value;

      drawAudiences();
    };

  document
    .getElementById(
      "audience-reset"
    )
    .onclick =
      () => {
        state.audienceType =
          "ALL";

        state.audienceCategory =
          "ALL";

        drawAudiences();
      };
}

function activationPage() {
  const counts =
    recommendationCounts();

  return `
    ${pageHeader(
      "Activation",
      "Turn validated causal and descriptive evidence into governed audience actions."
    )}

    <div class="kpi-grid kpi-grid-5">
      ${kpi(
        "Recommendations",
        "16",
        "Step 8 governed decisions"
      )}

      ${kpi(
        "Scale",
        counts.SCALE,
        "causal scale decision",
        "kpi-green"
      )}

      ${kpi(
        "Maintain",
        counts.MAINTAIN_HOLDOUT,
        "holdout-preserving",
        "kpi-orange"
      )}

      ${kpi(
        "Retest",
        counts.RETEST,
        "insufficient evidence"
      )}

      ${kpi(
        "Investigate",
        counts.INVESTIGATE,
        "descriptive follow-up",
        "kpi-purple"
      )}
    </div>

    <div class="controls">
      <div class="control">
        <label>
          Recommendation action
        </label>

        <select id="activation-filter">
          <option value="ALL">
            All actions
          </option>

          <option value="SCALE">
            Scale
          </option>

          <option value="MAINTAIN_HOLDOUT">
            Maintain Holdout
          </option>

          <option value="RETEST">
            Retest
          </option>

          <option value="INVESTIGATE">
            Investigate
          </option>
        </select>
      </div>

      <button
        id="activation-reset"
        class="button"
      >
        Reset
      </button>
    </div>

    <div class="page-stack">
      ${panel(
        "Recommended Actions",
        "click a recommendation row for detail",
        `
          <div id="activation-table"></div>
        `
      )}

      <div class="split-detail">
        ${panel(
          "Recommendation Detail",
          "evidence rationale and guardrails",
          `
            <div
              id="activation-detail"
              class="detail-card"
            ></div>
          `
        )}

        ${panel(
          "Decision Distribution",
          "Step 8 governed recommendation classes",
          `
            <div
              id="activation-chart"
              class="chart-sm"
            ></div>
          `
        )}
      </div>
    </div>
  `;
}

function activationRows() {
  const rows =
    state.evidence
      .activation_recommendations;

  if (
    state.activationAction
    === "ALL"
  ) {
    return rows;
  }

  return rows.filter(
    row =>
      row.next_action
      === state.activationAction
  );
}

function drawActivation() {
  const rows =
    activationRows();

  const tableContainer =
    document.getElementById(
      "activation-table"
    );

  tableContainer.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Audience</th>
            <th>Action</th>
            <th>Size</th>
            <th>Evidence domain</th>
            <th>Recommendation class</th>
          </tr>
        </thead>

        <tbody>
          ${rows.map(
            (
              row,
              index
            ) => `
              <tr
                class="clickable-row activation-row"
                data-index="${index}"
              >
                <td>
                  ${escapeHtml(row.audience_name)}
                </td>

                <td>
                  ${actionBadge(row.next_action)}
                </td>

                <td>
                  ${integer(row.audience_size)}
                </td>

                <td>
                  ${escapeHtml(row.evidence_domain)}
                </td>

                <td>
                  ${escapeHtml(row.recommendation_class)}
                </td>
              </tr>
            `
          ).join("")}
        </tbody>
      </table>
    </div>
  `;

  const detail =
    document.getElementById(
      "activation-detail"
    );

  function showDetail(
    row
  ) {
    if (!row) {
      detail.innerHTML = `
        <h3>
          No recommendation selected
        </h3>

        <p>
          Select a recommendation row to inspect
          governed evidence.
        </p>
      `;

      return;
    }

    detail.innerHTML = `
      <h3>
        ${escapeHtml(row.audience_name)}
      </h3>

      <p>
        ${actionBadge(row.next_action)}
      </p>

      <div class="metric-list">
        <div class="metric-row">
          <strong>
            Audience size
          </strong>

          <span>
            ${integer(row.audience_size)}
          </span>
        </div>

        <div class="metric-row">
          <strong>
            Causal evidence
          </strong>

          <span>
            ${escapeHtml(row.causal_evidence_present)}
          </span>
        </div>

        <div class="metric-row">
          <strong>
            Privacy threshold
          </strong>

          <span>
            ${escapeHtml(row.privacy_threshold_pass)}
          </span>
        </div>

        <div class="metric-row">
          <strong>
            Activation threshold
          </strong>

          <span>
            ${escapeHtml(row.activation_size_pass)}
          </span>
        </div>
      </div>

      <p>
        <strong>Reason:</strong>
        ${escapeHtml(row.recommendation_reason)}
      </p>

      <p>
        <strong>Guardrail:</strong>
        ${escapeHtml(row.guardrail_reason)}
      </p>
    `;
  }

  showDetail(
    rows[0]
    || null
  );

  tableContainer
    .querySelectorAll(
      ".activation-row"
    )
    .forEach(
      element => {
        element.onclick =
          () => {
            const index =
              Number(
                element.dataset.index
              );

            showDetail(
              rows[index]
            );
          };
      }
    );

  const counts =
    recommendationCounts();

  Plotly.newPlot(
    "activation-chart",
    [
      {
        labels: [
          "Scale",
          "Maintain Holdout",
          "Retest",
          "Investigate"
        ],

        values: [
          counts.SCALE,
          counts.MAINTAIN_HOLDOUT,
          counts.RETEST,
          counts.INVESTIGATE
        ],

        type:
          "pie",

        hole:
          0.56,

        marker: {
          colors: [
            COLORS.green,
            COLORS.orange,
            COLORS.blue,
            COLORS.purple
          ]
        },

        textinfo:
          "label+value"
      }
    ],
    plotLayout({
      margin: {
        l: 5,
        r: 5,
        t: 5,
        b: 5
      },

      showlegend:
        false
    }),
    plotConfig
  );

  const filter =
    document.getElementById(
      "activation-filter"
    );

  filter.value =
    state.activationAction;

  filter.onchange =
    event => {
      state.activationAction =
        event.target.value;

      drawActivation();
    };

  document
    .getElementById(
      "activation-reset"
    )
    .onclick =
      () => {
        state.activationAction =
          "ALL";

        drawActivation();
      };
}

function performancePage() {
  const totals =
    mediaTotals();

  const ctr =
    totals.clicks
    / totals.impressions;

  const efficiency =
    totals.conversions
    / totals.mci;

  return `
    ${pageHeader(
      "Performance",
      "Monitor descriptive media performance and behavioral-funnel evidence without cross-source identity stitching."
    )}

    <div class="kpi-grid kpi-grid-6">
      ${kpi(
        "Impressions",
        compact(totals.impressions),
        "Criteo",
        "kpi-purple"
      )}

      ${kpi(
        "Clicks",
        compact(totals.clicks),
        "Criteo"
      )}

      ${kpi(
        "CTR",
        percent(ctr),
        "clicks / impressions",
        "kpi-green"
      )}

      ${kpi(
        "Conversions",
        compact(totals.conversions),
        "completion evidence",
        "kpi-orange"
      )}

      ${kpi(
        "Media Cost Index",
        totals.mci.toFixed(2),
        "not currency / spend",
        "kpi-orange"
      )}

      ${kpi(
        "Attributed Efficiency",
        efficiency.toFixed(1),
        "conversion completions / MCI",
        "kpi-green"
      )}
    </div>

    <div class="controls">
      <div class="control">
        <label>
          Media metric
        </label>

        <select id="performance-filter">
          ${Object.entries(
            MEDIA_LABELS
          ).map(
            entry => `
              <option value="${entry[0]}">
                ${escapeHtml(entry[1])}
              </option>
            `
          ).join("")}
        </select>
      </div>

      <button
        id="performance-reset"
        class="button"
      >
        Reset
      </button>
    </div>

    <div class="grid grid-2">
      ${panel(
        "Performance Trend",
        "source-relative Criteo media evidence",
        `
          <div
            id="performance-chart"
            class="chart-lg"
          ></div>
        `
      )}

      ${panel(
        "Retailrocket Funnel",
        "event-volume ratios · not person-level conversion",
        `
          <div
            id="performance-funnel"
            class="chart-lg"
          ></div>
        `
      )}
    </div>

    <div
      class="callout"
      style="margin-top:10px;"
    >
      Media Cost Index is transformed source cost
      evidence. It is not currency, spend, CPA or ROAS.
    </div>
  `;
}

function drawPerformance() {
  const rows =
    state.evidence
      .media_timeseries;

  const metric =
    state.performanceMetric;

  Plotly.newPlot(
    "performance-chart",
    [
      {
        x:
          rows.map(
            row =>
              row.source_relative_day
          ),

        y:
          rows.map(
            row =>
              row[metric]
          ),

        type:
          "scatter",

        mode:
          "lines",

        name:
          MEDIA_LABELS[metric],

        line: {
          color:
            metric === "impression_count"
              ? COLORS.purple
              : metric === "click_count"
                ? COLORS.blue
                : metric === "conversion_completion_count"
                  ? COLORS.green
                  : COLORS.orange,

          width:
            2
        },

        hovertemplate:
          "Day %{x}<br>"
          + MEDIA_LABELS[metric]
          + ": %{y:,.2f}<extra></extra>"
      }
    ],
    plotLayout(),
    plotConfig
  );

  const funnel =
    [...state.evidence
      .conversion_funnel]
      .sort(
        (
          left,
          right
        ) =>
          Number(
            left.stage_order
          )
          - Number(
              right.stage_order
            )
      );

  Plotly.newPlot(
    "performance-funnel",
    [
      {
        y:
          funnel.map(
            row =>
              row.stage
          ),

        x:
          funnel.map(
            row =>
              row.event_count
          ),

        type:
          "funnel",

        marker: {
          color: [
            COLORS.purple,
            COLORS.blue,
            COLORS.green
          ]
        },

        textinfo:
          "value+percent initial"
      }
    ],
    plotLayout({
      margin: {
        l: 95,
        r: 15,
        t: 10,
        b: 15
      }
    }),
    plotConfig
  );

  const filter =
    document.getElementById(
      "performance-filter"
    );

  filter.value =
    state.performanceMetric;

  filter.onchange =
    event => {
      state.performanceMetric =
        event.target.value;

      drawPerformance();
    };

  document
    .getElementById(
      "performance-reset"
    )
    .onclick =
      () => {
        state.performanceMetric =
          "impression_count";

        drawPerformance();
      };
}

function incrementalityPage() {
  return `
    ${pageHeader(
      "Incrementality",
      "Separate randomized treatment-level lift from held-out targeting-model evaluation."
    )}

    <div class="controls">
      <div class="control">
        <label>
          Treatment
        </label>

        <select id="incrementality-filter">
          <option value="ALL">
            All treatments
          </option>

          <option value="Mens E-Mail">
            Mens E-Mail
          </option>

          <option value="Womens E-Mail">
            Womens E-Mail
          </option>
        </select>
      </div>

      <button
        id="incrementality-reset"
        class="button"
      >
        Reset
      </button>
    </div>

    <div class="page-stack">
      <div class="grid grid-2">
        ${panel(
          "Randomized ITT Effect",
          "95% confidence intervals · treatment-level randomized evidence",
          `
            <div
              id="incrementality-effect-chart"
              class="chart"
            ></div>
          `
        )}

        ${panel(
          "Held-out Uplift Evaluation",
          "targeting discrimination · not randomized subgroup effects",
          `
            <div id="incrementality-metrics"></div>
          `
        )}
      </div>

      ${panel(
        "Treatment Effects",
        "validated randomized estimates",
        `
          <div id="incrementality-effects"></div>
        `
      )}

      <div class="callout">
        Overall randomized ITT belongs to the
        treatment-level experiment. Held-out uplift and
        Qini evaluate targeting discrimination and are
        not subgroup randomized estimates.
      </div>
    </div>
  `;
}

function incrementalityRows() {
  const treatment =
    state.incrementalityTreatment;

  if (
    treatment
    === "ALL"
  ) {
    return {
      effects:
        state.evidence
          .incrementality_effects,

      metrics:
        state.evidence
          .incrementality_metrics
    };
  }

  return {
    effects:
      state.evidence
        .incrementality_effects
        .filter(
          row =>
            row.treatment
            === treatment
        ),

    metrics:
      state.evidence
        .incrementality_metrics
        .filter(
          row =>
            row.treatment
            === treatment
        )
  };
}

function drawIncrementality() {
  const rows =
    incrementalityRows();

  Plotly.newPlot(
    "incrementality-effect-chart",
    [
      {
        x:
          rows.effects.map(
            row =>
              row.incremental_conversion_rate
          ),

        y:
          rows.effects.map(
            row =>
              row.treatment
          ),

        type:
          "scatter",

        mode:
          "markers",

        marker: {
          color:
            COLORS.green,

          size:
            10
        },

        error_x: {
          type:
            "data",

          symmetric:
            false,

          array:
            rows.effects.map(
              row =>
                Number(
                  row.incremental_conversion_rate_ci_upper
                )
                - Number(
                    row.incremental_conversion_rate
                  )
            ),

          arrayminus:
            rows.effects.map(
              row =>
                Number(
                  row.incremental_conversion_rate
                )
                - Number(
                    row.incremental_conversion_rate_ci_lower
                  )
            )
        }
      }
    ],
    plotLayout({
      margin: {
        l: 92,
        r: 18,
        t: 24,
        b: 42
      },

      xaxis: {
        title:
          "Incremental conversion rate",

        tickformat:
          ".1%",

        gridcolor:
          COLORS.grid
      }
    }),
    plotConfig
  );

  document
    .getElementById(
      "incrementality-metrics"
    )
    .innerHTML =
      tableHtml(
        [
          {
            key:
              "treatment",
            label:
              "Treatment"
          },

          {
            key:
              "model",
            label:
              "Model"
          },

          {
            key:
              "customers",
            label:
              "Test customers"
          },

          {
            key:
              "uplift",
            label:
              "Uplift @20%"
          },

          {
            key:
              "qini",
            label:
              "Qini"
          }
        ],
        rows.metrics.map(
          row => ({
            treatment:
              row.treatment,

            model:
              row.model,

            customers:
              integer(
                row.test_customers
              ),

            uplift:
              percent(
                row.uplift_at_20pct,
                2
              ),

            qini:
              Number(
                row.qini_statistic
              ).toFixed(
                3
              )
          })
        )
      );

  document
    .getElementById(
      "incrementality-effects"
    )
    .innerHTML =
      tableHtml(
        [
          {
            key:
              "treatment",
            label:
              "Treatment"
          },

          {
            key:
              "control",
            label:
              "Control"
          },

          {
            key:
              "estimand",
            label:
              "Estimand"
          },

          {
            key:
              "visit",
            label:
              "Incremental visit"
          },

          {
            key:
              "conversion",
            label:
              "Incremental conversion"
          },

          {
            key:
              "lower",
            label:
              "CI lower"
          },

          {
            key:
              "upper",
            label:
              "CI upper"
          }
        ],
        rows.effects.map(
          row => ({
            treatment:
              row.treatment,

            control:
              row.control,

            estimand:
              row.estimand,

            visit:
              percent(
                row.incremental_visit_rate,
                2
              ),

            conversion:
              percent(
                row.incremental_conversion_rate,
                2
              ),

            lower:
              percent(
                row.incremental_conversion_rate_ci_lower,
                2
              ),

            upper:
              percent(
                row.incremental_conversion_rate_ci_upper,
                2
              )
          })
        )
      );

  const filter =
    document.getElementById(
      "incrementality-filter"
    );

  filter.value =
    state.incrementalityTreatment;

  filter.onchange =
    event => {
      state.incrementalityTreatment =
        event.target.value;

      drawIncrementality();
    };

  document
    .getElementById(
      "incrementality-reset"
    )
    .onclick =
      () => {
        state.incrementalityTreatment =
          "ALL";

        drawIncrementality();
      };
}

const ATTRIBUTION_COPY = {
  First:
    "100% of each conversion is assigned to the first eligible touch inside the validated 30-day lookback.",

  Last:
    "100% of each conversion is assigned to the last eligible touch before conversion.",

  Linear:
    "Credit is distributed equally across all eligible touches in each validated journey.",

  Position:
    "Credit is weighted toward the first and last eligible touches, with remaining credit distributed across middle touches.",

  "Time Decay":
    "Credit increases as eligible touches occur closer to conversion using the validated 7-day half-life."
};

function attributionPage() {
  return `
    <section class="page-intro">
      <div>
        <div class="eyebrow">
          Retail Media Measurement
        </div>

        <h1>
          Campaign Attribution Performance
        </h1>

        <p>
          Descriptive allocation of observed dunnhumby basket value
          across active household campaign assignments. Change the
          attribution method to see how Sales, AOV, Items / Order and campaign
          rank redistribute across the same eligible retail universe.
        </p>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Attribution Method</h2>

          <p>
            Campaign assignment is not an observed impression or click.
            Campaign START_DAY is used only as an ordering proxy.
          </p>
        </div>

        <div class="control-row">
          <label>
            Method
            <select id="attribution-method-select"></select>
          </label>

          <label>
            Search
            <input
              id="attribution-campaign-search"
              type="search"
              placeholder="Campaign ID or type"
              autocomplete="off"
            />
          </label>

          <label>
            Rows
            <select id="attribution-row-limit">
              <option value="10">10</option>
              <option value="25" selected>25</option>
              <option value="30">30</option>
            </select>
          </label>
        </div>
      </div>

      <div
        id="attribution-kpi-grid"
        class="kpi-grid"
      ></div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Campaign Performance</h2>

          <p>
            Business metrics recalculate under the selected attribution
            method. Attributed Households is non-additive across campaigns.
          </p>
        </div>
      </div>

      <div class="table-scroll attribution-table-scroll">
        <table
          class="data-table attribution-performance-table"
          id="attribution-performance-table"
        >
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Campaign Type</th>
              <th>Eligible Assigned HH</th>
              <th>Attributed HH</th>
              <th>Attributed Orders</th>
              <th>Attributed Sales</th>
              <th>Attributed Items</th>
              <th>AOV</th>
              <th>Items / Order</th>
              <th>Sales / HH</th>
              <th>Sales Share</th>
              <th>Rank</th>
            </tr>
          </thead>

          <tbody id="attribution-performance-body"></tbody>
        </table>
      </div>

      <div class="panel-footnote">
        Eligible Assigned Households are assigned households represented
        by at least one eligible basket path inside the active campaign
        window. Attribution is descriptive, not causal incrementality.
      </div>
    </section>

    <div class="attribution-analysis-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Top Campaigns by Attributed Sales</h2>

            <p id="attribution-ranking-subtitle">
              Top campaigns under First Touch.
            </p>
          </div>
        </div>

        <div
          id="attribution-ranking-chart"
          class="chart chart-tall"
        ></div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Selected Campaign</h2>

            <p>
              Click a table row or ranking bar to inspect the same
              campaign under the selected method.
            </p>
          </div>
        </div>

        <div
          id="attribution-campaign-detail"
          class="attribution-campaign-detail"
        ></div>
      </section>
    </div>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>How Attribution Method Changes Campaign Value</h2>

          <p>
            The same campaign can receive different Sales, AOV, Items / Order,
            Sales / Household and rank under different attribution rules.
          </p>
        </div>
      </div>

      <div class="attribution-comparison-layout">
        <div
          id="attribution-method-comparison-chart"
          class="chart"
        ></div>

        <div
          class="attribution-insight-callout"
          id="attribution-sensitivity-explanation"
        ></div>
      </div>
    </section>

    <div class="attribution-disclosure-grid">
      <section class="panel attribution-disclosure">
        <div class="callout-label">
          Source semantics
        </div>

        <strong>
          Household campaign assignment, not ad exposure.
        </strong>

        <p>
          The rebuilt page uses dunnhumby Complete Journey only.
          Campaign START_DAY orders active campaign assignments; it is
          not an observed exposure timestamp.
        </p>
      </section>

      <section class="panel attribution-disclosure">
        <div class="callout-label">
          Interpretation
        </div>

        <strong>
          Descriptive attribution, not causal incrementality.
        </strong>

        <p>
          Use the Incrementality page for randomized treatment effects.
          This page redistributes observed retail value across eligible
          campaigns and does not establish incremental lift.
        </p>
      </section>

      <section class="panel attribution-disclosure">
        <div class="callout-label">
          Metric semantics
        </div>

        <strong>
          Ratios are calculated after attribution.
        </strong>

        <p>
          AOV is Attributed Sales divided by Attributed Orders. Items / Order is
          Attributed Items divided by Attributed Orders. Raw source QUANTITY
          remains governed evidence but is not presented as conventional UPT.
        </p>
      </section>
    </div>
  `;
}

async function drawAttribution() {
  const response = await fetch(
    "data/attribution_dashboard_payload.json",
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to load Attribution evidence: ${response.status}`
    );
  }

  const payload = await response.json();

  if (
    payload.status !== "PASS"
    || payload.source?.dataset !== "DUNNHUMBY_COMPLETE_JOURNEY"
    || payload.governance?.campaign_identity_alignment !== "PASS"
    || payload.governance?.b18b26_reconciliation !== "PASS"
    || payload.governance?.criteo_media_metrics_on_page !== false
    || payload.governance?.cross_source_identity_join !== false
  ) {
    throw new Error(
      "Attribution payload failed governed integration checks."
    );
  }

  const methodSelect =
    document.querySelector(
      "#attribution-method-select"
    );

  const searchInput =
    document.querySelector(
      "#attribution-campaign-search"
    );

  const rowLimit =
    document.querySelector(
      "#attribution-row-limit"
    );

  const tableBody =
    document.querySelector(
      "#attribution-performance-body"
    );

  const kpiGrid =
    document.querySelector(
      "#attribution-kpi-grid"
    );

  const detail =
    document.querySelector(
      "#attribution-campaign-detail"
    );

  const rankingSubtitle =
    document.querySelector(
      "#attribution-ranking-subtitle"
    );

  const sensitivityRoot =
    document.querySelector(
      "#attribution-sensitivity-explanation"
    );

  const rankingChart =
    document.querySelector(
      "#attribution-ranking-chart"
    );

  const comparisonChart =
    document.querySelector(
      "#attribution-method-comparison-chart"
    );

  if (
    !methodSelect
    || !searchInput
    || !rowLimit
    || !tableBody
    || !kpiGrid
    || !detail
    || !rankingSubtitle
    || !sensitivityRoot
    || !rankingChart
    || !comparisonChart
  ) {
    throw new Error(
      "Attribution page controls are incomplete."
    );
  }

  const integerFormat =
    new Intl.NumberFormat(
      "en-US",
      {
        maximumFractionDigits: 0,
      }
    );

  const oneDecimalFormat =
    new Intl.NumberFormat(
      "en-US",
      {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }
    );

  const twoDecimalFormat =
    new Intl.NumberFormat(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  const currencyFormat =
    new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  const percentFormat =
    new Intl.NumberFormat(
      "en-US",
      {
        style: "percent",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }
    );

  const escapeLocal = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const methodLabels =
    Object.fromEntries(
      (payload.methods || []).map(
        (method) => [
          method.id,
          method.label,
        ]
      )
    );

  const methodIds =
    (payload.methods || []).map(
      (method) => method.id
    );

  const canonicalMethods = [
    "FIRST_TOUCH",
    "LAST_TOUCH",
    "LINEAR",
    "POSITION_BASED",
    "TIME_DECAY",
  ];

  if (
    JSON.stringify(methodIds)
    !== JSON.stringify(canonicalMethods)
  ) {
    throw new Error(
      "Attribution method order drifted."
    );
  }

  methodSelect.innerHTML =
    (payload.methods || [])
      .map(
        (method) => `
          <option value="${escapeLocal(method.id)}">
            ${escapeLocal(method.label)}
          </option>
        `
      )
      .join("");

  let selectedMethod =
    payload.default_method
    || "FIRST_TOUCH";

  methodSelect.value =
    selectedMethod;

  let selectedCampaignId = null;

  const getMethodRows = () =>
    [
      ...(
        payload.campaigns_by_method?.[
          selectedMethod
        ]
        || []
      ),
    ].sort(
      (left, right) =>
        Number(left.attribution_rank)
        - Number(right.attribution_rank)
        || Number(right.attributed_sales)
        - Number(left.attributed_sales)
        || Number(left.campaign)
        - Number(right.campaign)
    );

  const findSelectedRow = () => {
    const rows =
      getMethodRows();

    if (
      selectedCampaignId !== null
    ) {
      const match =
        rows.find(
          (row) =>
            Number(row.campaign)
            === Number(selectedCampaignId)
        );

      if (match) {
        return match;
      }
    }

    const fallback =
      rows[0]
      || null;

    selectedCampaignId =
      fallback
        ? Number(
            fallback.campaign
          )
        : null;

    return fallback;
  };

  const renderKpis = () => {
    const row =
      findSelectedRow();

    if (!row) {
      kpiGrid.innerHTML =
        `<div class="empty-state">No campaign selected.</div>`;

      return;
    }

    kpiGrid.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-label">
          Attributed Sales
        </div>

        <div class="kpi-value">
          ${currencyFormat.format(
            Number(row.attributed_sales)
          )}
        </div>

        <div class="kpi-helper">
          ${escapeLocal(
            methodLabels[selectedMethod]
          )}
          • ${escapeLocal(row.campaign_label)}
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">
          Attributed Orders
        </div>

        <div class="kpi-value">
          ${oneDecimalFormat.format(
            Number(row.attributed_orders)
          )}
        </div>

        <div class="kpi-helper">
          Fractional orders reflect attribution weights
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">
          AOV
        </div>

        <div class="kpi-value">
          ${currencyFormat.format(
            Number(row.aov)
          )}
        </div>

        <div class="kpi-helper">
          Attributed Sales / Attributed Orders
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">
          Sales / Household
        </div>

        <div class="kpi-value">
          ${currencyFormat.format(
            Number(row.sales_per_household)
          )}
        </div>

        <div class="kpi-helper">
          ${integerFormat.format(
            Number(row.attributed_households)
          )}
          attributed households
        </div>
      </div>
    `;
  };

  const renderDetail = () => {
    const row =
      findSelectedRow();

    if (!row) {
      detail.innerHTML =
        `<div class="empty-state">No campaign selected.</div>`;

      return;
    }

    detail.innerHTML = `
      <div class="attribution-detail-title">
        ${escapeLocal(row.campaign_label)}
        <span>
          ${escapeLocal(row.campaign_type)}
        </span>
      </div>

      <div class="attribution-detail-grid">
        <div>
          <span>Attributed Sales</span>
          <strong>
            ${currencyFormat.format(
              Number(row.attributed_sales)
            )}
          </strong>
        </div>

        <div>
          <span>Attributed Orders</span>
          <strong>
            ${oneDecimalFormat.format(
              Number(row.attributed_orders)
            )}
          </strong>
        </div>

        <div>
          <span>Attributed Items</span>
          <strong>
            ${oneDecimalFormat.format(
              Number(row.attributed_items)
            )}
          </strong>
        </div>

        <div>
          <span>Eligible Assigned HH</span>
          <strong>
            ${integerFormat.format(
              Number(row.eligible_assigned_households)
            )}
          </strong>
        </div>

        <div>
          <span>Attributed Households</span>
          <strong>
            ${integerFormat.format(
              Number(row.attributed_households)
            )}
          </strong>
        </div>

        <div>
          <span>AOV</span>
          <strong>
            ${currencyFormat.format(
              Number(row.aov)
            )}
          </strong>
        </div>

        <div>
          <span>Items / Order</span>
          <strong>
            ${twoDecimalFormat.format(
              Number(row.items_per_order)
            )}
          </strong>
        </div>

        <div>
          <span>Sales / Household</span>
          <strong>
            ${currencyFormat.format(
              Number(row.sales_per_household)
            )}
          </strong>
        </div>

        <div>
          <span>Sales Share</span>
          <strong>
            ${percentFormat.format(
              Number(row.sales_share)
            )}
          </strong>
        </div>

        <div>
          <span>Order Share</span>
          <strong>
            ${percentFormat.format(
              Number(row.order_share)
            )}
          </strong>
        </div>

        <div>
          <span>Units Share</span>
          <strong>
            ${percentFormat.format(
              Number(row.units_share)
            )}
          </strong>
        </div>

        <div>
          <span>Attribution Rank</span>
          <strong>
            ${integerFormat.format(
              Number(row.attribution_rank)
            )}
          </strong>
        </div>
      </div>
    `;
  };

  const renderRanking = () => {
    const rows =
      getMethodRows()
        .slice(
          0,
          12
        );

    rankingSubtitle.textContent =
      `Top campaigns under ${
        methodLabels[selectedMethod]
        || selectedMethod
      }.`;

    Plotly.react(
      rankingChart,
      [
        {
          type: "bar",
          x: rows.map(
            (row) =>
              row.campaign_label
          ),
          y: rows.map(
            (row) =>
              Number(
                row.attributed_sales
              )
          ),
          customdata: rows.map(
            (row) =>
              Number(
                row.campaign
              )
          ),
          hovertemplate:
            "<b>%{x}</b><br>"
            + "Attributed Sales: $%{y:,.2f}"
            + "<extra></extra>",
        },
      ],
      {
        margin: {
          l: 70,
          r: 24,
          t: 18,
          b: 72,
        },
        xaxis: {
          title: "",
          tickangle: -35,
        },
        yaxis: {
          title: "Attributed Sales",
          tickprefix: "$",
          separatethousands: true,
        },
        showlegend: false,
      },
      {
        displayModeBar: false,
        responsive: true,
      }
    );

    if (
      typeof rankingChart.removeAllListeners
      === "function"
    ) {
      rankingChart.removeAllListeners(
        "plotly_click"
      );
    }

    if (
      typeof rankingChart.on
      === "function"
    ) {
      rankingChart.on(
        "plotly_click",
        (event) => {
          const campaign =
            event?.points?.[0]?.customdata;

          if (
            campaign === undefined
            || campaign === null
          ) {
            return;
          }

          selectedCampaignId =
            Number(campaign);

          renderAll(
            false
          );
        }
      );
    }
  };

  const renderComparison = () => {
    const selected =
      findSelectedRow();

    if (!selected) {
      return;
    }

    const campaignEntry =
      (payload.campaign_index || [])
        .find(
          (item) =>
            Number(item.campaign)
            === Number(selected.campaign)
        );

    if (!campaignEntry) {
      throw new Error(
        "Selected campaign is missing from campaign_index."
      );
    }

    const comparisonRows =
      (payload.methods || [])
        .map(
          (method) => ({
            method:
              method.label,

            id:
              method.id,

            values:
              campaignEntry.methods?.[
                method.id
              ],
          })
        );

    Plotly.react(
      comparisonChart,
      [
        {
          type: "bar",
          x: comparisonRows.map(
            (row) =>
              row.method
          ),
          y: comparisonRows.map(
            (row) =>
              Number(
                row.values?.attributed_sales
                || 0
              )
          ),
          customdata:
            comparisonRows.map(
              (row) => [
                Number(
                  row.values?.aov
                  || 0
                ),
                Number(
                  row.values?.items_per_order
                  || 0
                ),
                Number(
                  row.values?.sales_per_household
                  || 0
                ),
                Number(
                  row.values?.attribution_rank
                  || 0
                ),
              ]
            ),
          hovertemplate:
            "<b>%{x}</b><br>"
            + "Sales: $%{y:,.2f}<br>"
            + "AOV: $%{customdata[0]:,.2f}<br>"
            + "Items / Order: %{customdata[1]:,.2f}<br>"
            + "Sales / HH: $%{customdata[2]:,.2f}<br>"
            + "Rank: %{customdata[3]:,.0f}"
            + "<extra></extra>",
        },
      ],
      {
        margin: {
          l: 70,
          r: 24,
          t: 18,
          b: 56,
        },
        xaxis: {
          title: "",
        },
        yaxis: {
          title: "Attributed Sales",
          tickprefix: "$",
          separatethousands: true,
        },
        showlegend: false,
      },
      {
        displayModeBar: false,
        responsive: true,
      }
    );
  };

  const renderSensitivity = () => {
    const sensitivity =
      payload.method_sensitivity
      || {};

    const example =
      sensitivity.strongest_sales_sensitivity_example
      || {};

    sensitivityRoot.innerHTML = `
      <div class="callout-label">
        Measured method sensitivity
      </div>

      <strong>
        Attribution method changes real campaign value.
      </strong>

      <p>
        All ${integerFormat.format(
          Number(
            sensitivity.campaigns_with_sales_sensitivity
            || 0
          )
        )} campaigns change in attributed Sales.
        ${integerFormat.format(
          Number(
            sensitivity.campaigns_with_rank_sensitivity
            || 0
          )
        )} campaigns change rank.
      </p>

      <p>
        The strongest observed example is Campaign
        ${escapeLocal(example.campaign)}:
        ${currencyFormat.format(
          Number(
            example.first_touch_sales
            || 0
          )
        )}
        under First Touch versus
        ${currencyFormat.format(
          Number(
            example.last_touch_sales
            || 0
          )
        )}
        under Last Touch.
      </p>

      <p>
        That same campaign moves from rank
        ${integerFormat.format(
          Number(
            example.first_touch_rank
            || 0
          )
        )}
        to rank
        ${integerFormat.format(
          Number(
            example.last_touch_rank
            || 0
          )
        )}.
      </p>
    `;
  };

  const renderTable = () => {
    const query =
      searchInput.value
        .trim()
        .toLowerCase();

    const limit =
      Number(
        rowLimit.value
      )
      || 25;

    const filtered =
      getMethodRows()
        .filter(
          (row) => {
            if (!query) {
              return true;
            }

            const searchable = [
              row.campaign,
              row.campaign_label,
              row.campaign_type,
            ]
              .join(" ")
              .toLowerCase();

            return searchable.includes(
              query
            );
          }
        )
        .slice(
          0,
          limit
        );

    tableBody.innerHTML =
      filtered
        .map(
          (row) => `
            <tr
              class="clickable-row attribution-row${
                Number(row.campaign)
                === Number(selectedCampaignId)
                  ? " is-selected"
                  : ""
              }"
              data-campaign="${escapeLocal(row.campaign)}"
            >
              <td>
                ${escapeLocal(row.campaign_label)}
              </td>

              <td>
                ${escapeLocal(row.campaign_type)}
              </td>

              <td>
                ${integerFormat.format(
                  Number(row.eligible_assigned_households)
                )}
              </td>

              <td>
                ${integerFormat.format(
                  Number(row.attributed_households)
                )}
              </td>

              <td>
                ${oneDecimalFormat.format(
                  Number(row.attributed_orders)
                )}
              </td>

              <td>
                ${currencyFormat.format(
                  Number(row.attributed_sales)
                )}
              </td>

              <td>
                ${oneDecimalFormat.format(
                  Number(row.attributed_items)
                )}
              </td>

              <td>
                ${currencyFormat.format(
                  Number(row.aov)
                )}
              </td>

              <td>
                ${twoDecimalFormat.format(
                  Number(row.items_per_order)
                )}
              </td>

              <td>
                ${currencyFormat.format(
                  Number(row.sales_per_household)
                )}
              </td>

              <td>
                ${percentFormat.format(
                  Number(row.sales_share)
                )}
              </td>

              <td>
                ${integerFormat.format(
                  Number(row.attribution_rank)
                )}
              </td>
            </tr>
          `
        )
        .join("");

    tableBody
      .querySelectorAll(
        "[data-campaign]"
      )
      .forEach(
        (element) => {
          element.onclick =
            () => {
              selectedCampaignId =
                Number(
                  element.dataset.campaign
                );

              renderAll(
                false
              );
            };
        }
      );
  };

  const renderAll = (
    rerenderRanking = true
  ) => {
    findSelectedRow();
    renderKpis();
    renderTable();
    renderDetail();

    if (rerenderRanking) {
      renderRanking();
    }

    renderComparison();
    renderSensitivity();

    window.__P25_ATTRIBUTION_PAGE__ = {
      payloadLoaded: true,
      source:
        payload.source.dataset,
      campaignRows:
        getMethodRows().length,
      methods:
        payload.methods.length,
      selectedMethod,
      selectedCampaignId,
      campaignIdentityAlignment:
        payload.governance.campaign_identity_alignment,
      b18b26Reconciliation:
        payload.governance.b18b26_reconciliation,
      criteoMediaMetricsOnPage:
        payload.governance.criteo_media_metrics_on_page,
      crossSourceIdentityJoin:
        payload.governance.cross_source_identity_join,
      strongestCampaign:
        payload.method_sensitivity
          .strongest_sales_sensitivity_example
          .campaign,
    };
  };

  methodSelect.onchange =
    () => {
      selectedMethod =
        methodSelect.value;

      renderAll(
        true
      );
    };

  searchInput.oninput =
    () => {
      renderTable();
    };

  rowLimit.onchange =
    () => {
      renderTable();
    };

  renderAll(
    true
  );
}

function dataPage() {
  const canonicalSourceNames = [
    "dunnhumby",
    "Hillstrom",
    "Criteo",
    "Retailrocket"
  ];

  const rawBoundaries =
    state.evidence
      .source_boundaries;

  const entries =
    Array.isArray(
      rawBoundaries
    )
      ? rawBoundaries.map(
          (
            value,
            index
          ) => [
            canonicalSourceNames[index]
              || `Source ${index + 1}`,
            value
          ]
        )
      : Object.entries(
          rawBoundaries
        ).map(
          (
            entry,
            index
          ) => {
            const rawName =
              String(
                entry[0]
              );

            const displayName =
              /^\d+$/.test(
                rawName
              )
                ? (
                    canonicalSourceNames[index]
                    || rawName
                  )
                : rawName;

            return [
              displayName,
              entry[1]
            ];
          }
        );

  return `
    ${pageHeader(
      "Data & Provenance",
      "Inspect validated source domains, evidence classes, artifact lineage, and governance boundaries."
    )}

    <div class="source-grid">
      ${entries.map(
        entry => {
          const name =
            entry[0];

          const value =
            entry[1];

          return `
            <article class="source-card">
              <strong>
                ${escapeHtml(name)}
              </strong>

              <small>
                ${escapeHtml(
                  value.evidence_class
                  || ""
                )}
              </small>

              <p>
                ${escapeHtml(
                  value.permitted_use
                  || ""
                )}
              </p>
            </article>
          `;
        }
      ).join("")}
    </div>

    <div
      class="grid grid-2"
      style="margin-top:10px;"
    >
      ${panel(
        "Validated Artifact Inventory",
        "",
        `
          <div class="metric-list">
            <div class="metric-row">
              <strong>Step 4</strong>
              <span>12 audience profile rows</span>
            </div>

            <div class="metric-row">
              <strong>Step 5</strong>
              <span>2 treatment-effect rows</span>
            </div>

            <div class="metric-row">
              <strong>Step 6</strong>
              <span>61 media time buckets</span>
            </div>

            <div class="metric-row">
              <strong>Step 8</strong>
              <span>16 activation recommendations</span>
            </div>
          </div>
        `
      )}

      ${panel(
        "Dashboard Governance",
        "",
        `
          <div class="metric-list">
            <div class="metric-row">
              <strong>
                Cross-source identity joins
              </strong>
              <span>Prohibited</span>
            </div>

            <div class="metric-row">
              <strong>
                Analytical retraining
              </strong>
              <span>Prohibited</span>
            </div>

            <div class="metric-row">
              <strong>
                New causal estimation
              </strong>
              <span>Prohibited</span>
            </div>

            <div class="metric-row">
              <strong>
                Mock metrics
              </strong>
              <span>Prohibited</span>
            </div>

            <div class="metric-row">
              <strong>
                Media Cost currency semantics
              </strong>
              <span>Prohibited</span>
            </div>

            <div class="metric-row">
              <strong>
                Attribution is causal
              </strong>
              <span>Prohibited</span>
            </div>
          </div>
        `
      )}
    </div>

    <div
      class="callout"
      style="margin-top:10px;"
    >
      Sources are intentionally isolated. The executive
      experience combines insights, not customer-level rows.
    </div>
  `;
}

function methodologyPage() {
  const contract =
    state.contract;

  return `
    ${pageHeader(
      "Settings / Methodology",
      "Review frozen analytical assumptions and governance settings. Documentation only — no production controls."
    )}

    <div class="grid grid-4">
      ${kpi(
        "Primary Segmentation",
        "KMeans · k="
          + contract.segmentation.selected_k,
        "deterministic evaluation across "
          + contract.segmentation.candidate_k_min
          + "–"
          + contract.segmentation.candidate_k_max,
        "kpi-purple"
      )}

      ${kpi(
        "Privacy Minimum",
        integer(
          contract.activation.privacy_minimum
        ),
        "minimum governed audience size",
        "kpi-purple"
      )}

      ${kpi(
        "Activation Minimum",
        integer(
          contract.activation.activation_minimum
        ),
        "minimum activation-ready audience",
        "kpi-purple"
      )}

      ${kpi(
        "Confidence",
        percent(
          contract.incrementality.confidence_level,
          0
        ),
        "randomized-effect confidence intervals",
        "kpi-purple"
      )}

      ${kpi(
        "Uplift Model",
        "TwoModels / T-learner",
        "logistic-regression baseline",
        "kpi-purple"
      )}

      ${kpi(
        "Attribution Lookback",
        contract.attribution.lookback_days
          + " days",
        "eligible touch window",
        "kpi-purple"
      )}

      ${kpi(
        "Time-decay Half-life",
        contract.attribution.time_decay_half_life_days
          + " days",
        "descriptive attribution setting",
        "kpi-purple"
      )}

      ${kpi(
        "PCA",
        "Visualization only",
        "not used to define business segment meaning",
        "kpi-purple"
      )}
    </div>

    <div style="margin-top:10px;">
      ${panel(
        "Methodology Boundaries",
        "",
        `
          <div class="detail-card">
            <ul>
              <li>
                No analytical retraining inside the dashboard.
              </li>

              <li>
                No new causal estimation inside the dashboard.
              </li>

              <li>
                No cross-source identity stitching.
              </li>

              <li>
                Media Cost Index is not currency or spend.
              </li>

              <li>
                Attribution is descriptive, not causal.
              </li>

              <li>
                PCA is visualization only.
              </li>
            </ul>
          </div>
        `
      )}
    </div>
  `;
}

function renderPage() {
  /* P25_MIGRATION_RENDERPAGE_GUARD_V2 */
  if (window.location.hash === "#/migration") {
    return;
  }

  const route =
    currentRoute();

  setActiveNav(
    route
  );

  const root =
    document.getElementById(
      "page-root"
    );

  let html = "";
  let draw = null;

  switch (route) {
    case "overview":
      html =
        overviewPage();

      draw =
        drawOverview;

      break;

    case "audiences":
      html =
        audiencesPage();

      draw =
        drawAudiences;

      break;

    case "activation":
      html =
        activationPage();

      draw =
        drawActivation;

      break;

    case "performance":
      html =
        performancePage();

      draw =
        drawPerformance;

      break;

    case "incrementality":
      html =
        incrementalityPage();

      draw =
        drawIncrementality;

      break;

    case "attribution":
      html =
        attributionPage();

      draw =
        drawAttribution;

      break;

    case "data":
      html =
        dataPage();

      break;

    case "methodology":
      html =
        methodologyPage();

      break;

    default:
      html =
        overviewPage();

      draw =
        drawOverview;
  }

  root.innerHTML = `
    <div class="page">
      ${html}
    </div>
  `;

  if (draw) {
    window.requestAnimationFrame(
      draw
    );
  }
}

async function loadJson(
  path
) {
  const response =
    await fetch(
      path,
      {
        cache:
          "no-store"
      }
    );

  if (!response.ok) {
    throw new Error(
      "Failed to load "
      + path
      + ": "
      + response.status
    );
  }

  return response.json();
}

async function bootstrap() {


  const results =
    await Promise.all(
      [
        loadJson(
          "./data/evidence.json"
        ),

        loadJson(
          "./data/presentation_contract.json"
        )
      ]
    );

  state.evidence =
    results[0];

  state.contract =
    results[1];

  renderNav();

  window.addEventListener(
    "hashchange",
    renderPage
  );

  if (!window.location.hash) {
    window.location.hash =
      "#/overview";

    return;
  }

  renderPage();
}

bootstrap().catch(
  error => {
    console.error(
      error
    );

    document
      .getElementById(
        "page-root"
      )
      .innerHTML = `
        <div class="page">
          <div class="callout">
            The portfolio application could not load
            its governed evidence.
          </div>
        </div>
      `;
  }
);

/* P25_ATTRIBUTION_MCI_SEMANTICS_V1 */
(function installAttributionMciSemantics() {
  const NOTE_ID = "attribution-mci-governance-note";

  function ensureAttributionMciSemantics() {
    if (window.location.hash !== "#/attribution") {
      return;
    }

    const root =
      document.getElementById("page-root");

    if (!root) {
      return;
    }

    if (root.querySelector(`#${NOTE_ID}`)) {
      return;
    }

    const headings =
      Array.from(
        root.querySelectorAll("h1, h2")
      );

    const heading =
      headings.find(
        (element) =>
          element.textContent
            ?.trim()
            .includes(
              "Campaign Attribution Performance"
            )
      ) ||
      headings[0];

    if (!heading) {
      return;
    }

    const note =
      document.createElement("p");

    note.id = NOTE_ID;

    note.className =
      "page-subtitle attribution-governance-note";

    note.textContent =
      "Media Cost Index (MCI) represents the transformed Criteo cost field. " +
      "It is an index, not dollars or media spend, and should not be interpreted " +
      "as CPA or ROAS. Attribution results on this page are descriptive, not causal.";

    heading.insertAdjacentElement(
      "afterend",
      note
    );
  }

  window.addEventListener(
    "hashchange",
    () => {
      window.setTimeout(
        ensureAttributionMciSemantics,
        0
      );
    }
  );

  const observer =
    new MutationObserver(
      () => {
        ensureAttributionMciSemantics();
      }
    );

  observer.observe(
    document.documentElement,
    {
      childList: true,
      subtree: true,
    }
  );

  ensureAttributionMciSemantics();
})();

