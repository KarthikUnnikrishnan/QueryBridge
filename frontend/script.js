/* =====================================================
   QUERY SUGGESTIONS (GENERIC)
===================================================== */
const templates = [
    "show students",
    "show teachers",
    "show courses",
    "show students where age greater than 20",
    "add student name Arun age 21",
    "delete students where age equal to 21",
    "SELECT * FROM students;"
];

/* =====================================================
   HELPERS
===================================================== */
function normalize(q) {
    return q.toLowerCase().trim();
}

function isDirectSQL(q) {
    q = q.toLowerCase();
    return q.startsWith("select") || q.startsWith("insert") || q.startsWith("delete");
}

/* =====================================================
   ENGLISH → SQL (GENERIC RULE-BASED)
===================================================== */
function englishToSQL(input) {
    const q = normalize(input);

    // show <table>
    let match = q.match(/^show (\w+)$/);
    if (match) {
        return `SELECT * FROM ${match[1]};`;
    }

    // show <table> where <column> greater than <value>
    match = q.match(/^show (\w+) where (\w+) greater than (\d+)$/);
    if (match) {
        return `SELECT * FROM ${match[1]} WHERE ${match[2]} > ${match[3]};`;
    }

    // show <table> where <column> equal to <value>
    match = q.match(/^show (\w+) where (\w+) equal to (\d+)$/);
    if (match) {
        return `SELECT * FROM ${match[1]} WHERE ${match[2]} = ${match[3]};`;
    }

    // delete <table> where <column> equal to <value>
    match = q.match(/^delete (\w+) where (\w+) equal to (\d+)$/);
    if (match) {
        return `DELETE FROM ${match[1]} WHERE ${match[2]} = ${match[3]};`;
    }

    return null;
}

/* =====================================================
   EXECUTE QUERY
===================================================== */
function executeQuery() {
    const input = document.getElementById("queryInput").value.trim();
    const sqlBox = document.getElementById("sqlOutput");

    if (!input) {
        alert("Enter a query");
        return;
    }

    let sql = input;

    if (!isDirectSQL(input)) {
        const converted = englishToSQL(input);
        if (!converted) {
            alert("Unsupported English query format");
            return;
        }
        sql = converted;
    }

    if (!confirm("Execute this query?")) return;

    sqlBox.innerText = sql;

    fetch("http://127.0.0.1:8000/api/execute/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: sql })
    })
    .then(res => res.json())
    .then(data => renderResult(data))
    .catch(() => alert("Backend error"));
}

/* =====================================================
   RENDER RESULT (DYNAMIC)
===================================================== */
function renderResult(data) {
    const head = document.getElementById("resultHead");
    const body = document.getElementById("resultBody");
    const status = document.getElementById("statusMessage");

    head.innerHTML = "";
    body.innerHTML = "";
    status.innerText = "";

    if (data.status !== "success") {
        status.innerText = data.message;
        return;
    }

    if (data.type === "select") {
        const tr = document.createElement("tr");
        data.columns.forEach(c => {
            const th = document.createElement("th");
            th.innerText = c;
            tr.appendChild(th);
        });
        head.appendChild(tr);

        data.rows.forEach(r => {
            const tr = document.createElement("tr");
            data.columns.forEach(c => {
                const td = document.createElement("td");
                td.innerText = r[c];
                tr.appendChild(td);
            });
            body.appendChild(tr);
        });
    } else {
        status.innerText = data.message;
    }
}
