
/* MOCK DATABASE (FOR DYNAMIC RESULTS) */

const mockDB = {
    students: [
        { id: 1, name: "Arun", age: 20 },
        { id: 2, name: "Ravi", age: 21 },
        { id: 3, name: "Priya", age: 25 }
    ],
    teachers: [
        { id: 1, name: "Kumar", subject: "Math" }
    ]
};

/* QUERY SUGGESTION TEMPLATES (GUIDANCE) */

const templates = [
    "show tables",
    "describe students",
    "show students",
    "show all students",
    "show students where age greater than 20",
    "add student with id 10 name Arun age 21",
    "delete students where age equal to 21",
    "SELECT * FROM students;",
    "DELETE FROM students WHERE age > 56;"
];

/* SMART NON-AI CORRECTIONS */

function normalizeQuery(query) {
    let q = query.toLowerCase().trim();

    q = q.replace("grater than", "greater than");
    q = q.replace("les than", "less than");
    q = q.replace("were", "where");

    q = q.replace("display", "show");
    q = q.replace("list", "show");
    q = q.replace("remove", "delete");
    q = q.replace("insert", "add");

    q = q.replace("equals to", "equal to");
    q = q.replace("is equal to", "equal to");
    q = q.replace("more than", "greater than");
    q = q.replace("lesser than", "less than");

    return q;
}

/* SHOW SUGGESTIONS + STATUS */

function showSuggestions() {
    const rawInput = document.getElementById("queryInput").value;
    const input = normalizeQuery(rawInput);
    const box = document.getElementById("suggestions");
    const patternBox = document.getElementById("patternHint");

    box.innerHTML = "";
    patternBox.innerHTML = "";

    if (!input) {
        box.style.display = "none";
        return;
    }

    templates.forEach(t => {
        if (t.toLowerCase().startsWith(input)) {
            const div = document.createElement("div");
            div.textContent = t;
            div.onclick = () => {
                document.getElementById("queryInput").value = t;
                box.style.display = "none";
                showSuggestions();
            };
            box.appendChild(div);
        }
    });

    if (isDirectSQL(input)) {
        patternBox.innerHTML =
            "<span style='color:blue'>ℹ Direct SQL query detected</span>";
    } else if (isSupportedEnglish(input)) {
        patternBox.innerHTML =
            "<span style='color:green'>✔ Supported English pattern</span>";
    } else {
        patternBox.innerHTML =
            "<span style='color:orange'>⚠ Try suggested formats</span>";
    }

    box.style.display = box.children.length ? "block" : "none";
}

/* QUERY TYPE CHECKERS */

function isDirectSQL(query) {
    const q = query.toLowerCase();
    return (
        q.startsWith("select") ||
        q.startsWith("insert") ||
        q.startsWith("update") ||
        q.startsWith("delete") ||
        q.startsWith("show") ||
        q.startsWith("describe")
    );
}

function isSupportedEnglish(query) {
    const q = query.toLowerCase();
    return (
        q === "show tables" ||
        q.startsWith("describe ") ||
        q === "show students" ||
        q.startsWith("show all ") ||
        (q.startsWith("show ") && q.includes("where")) ||
        q.startsWith("add student") ||
        (q.startsWith("delete ") && q.includes("where"))
    );
}

/* ENGLISH → SQL CONVERSION */

function englishToSQL(query) {
    const q = query.toLowerCase();

    if (q === "show tables") return "SHOW TABLES;";

    if (q.startsWith("describe ")) {
        return `DESCRIBE ${q.replace("describe", "").trim()};`;
    }

    if (q === "show students") {
        return "SELECT * FROM students;";
    }

    if (q.startsWith("show all ")) {
        return `SELECT * FROM ${q.replace("show all", "").trim()};`;
    }

    if (q.startsWith("show ") && q.includes("where")) {
        const parts = q.split("where");
        const table = parts[0].replace("show", "").trim();
        const condition = parts[1]
            .replace("greater than", ">")
            .replace("less than", "<")
            .replace("equal to", "=")
            .trim();
        return `SELECT * FROM ${table} WHERE ${condition};`;
    }

    if (q.startsWith("add student")) {
        const id = q.match(/id (\d+)/)?.[1];
        const name = q.match(/name ([a-z]+)/)?.[1];
        const age = q.match(/age (\d+)/)?.[1];
        if (id && name && age) {
            return `INSERT INTO students VALUES (${id}, '${name}', ${age});`;
        }
    }

    if (q.startsWith("delete ") && q.includes("where")) {
        const parts = q.split("where");
        const table = parts[0].replace("delete", "").trim();
        const condition = parts[1].replace("equal to", "=").trim();
        return `DELETE FROM ${table} WHERE ${condition};`;
    }

    return null;
}

/* DYNAMIC TABLE RENDERING */

function renderTable(columns, rows) {
    const tbody = document.getElementById("resultBody");
    tbody.innerHTML = "";

    rows.forEach(row => {
        const tr = document.createElement("tr");
        columns.forEach(col => {
            const td = document.createElement("td");
            td.innerText = row[col];
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

/* EXECUTE MOCK RESULTS (DYNAMIC) */

function executeMockResult(sql) {
    const status = document.getElementById("statusMessage");
    status.innerText = "";

    const q = sql.toLowerCase();

    if (q.startsWith("show tables")) {
        renderTable(
            ["Table Name"],
            Object.keys(mockDB).map(t => ({ "Table Name": t }))
        );
        return;
    }

    if (q.startsWith("describe")) {
        const table = q.split(" ")[1].replace(";", "");
        const cols = Object.keys(mockDB[table][0]);
        renderTable(["Column"], cols.map(c => ({ Column: c })));
        return;
    }

    if (q.startsWith("select")) {
        if (q.includes("students")) {
            renderTable(["id", "name", "age"], mockDB.students);
            return;
        }
    }

    status.innerText = "✔ Query executed successfully";
    document.getElementById("resultBody").innerHTML = "";
}

/* EXECUTE QUERY */

function executeQuery() {
    const rawInput = document.getElementById("queryInput").value;
    const input = normalizeQuery(rawInput);
    const sqlBox = document.getElementById("sqlOutput");

    sqlBox.innerText = "";

    if (!input) {
        alert("Please enter a query");
        return;
    }

    let sql;

    if (isDirectSQL(input)) {
        sql = rawInput.trim().endsWith(";")
            ? rawInput.trim()
            : rawInput.trim() + ";";
    } else if (isSupportedEnglish(input)) {
        sql = englishToSQL(input);
    } else {
        alert("Unsupported query format");
        return;
    }

    if (!confirm("Execute this query?")) return;

    sqlBox.innerText = sql;
    executeMockResult(sql);
}
