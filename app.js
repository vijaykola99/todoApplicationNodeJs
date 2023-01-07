const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    process.exit(1);
    console.log("DB Error");
  }
};

initializeDBAndServer();

const hasPriorityStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriority = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status === undefined
  );
};

const haStatus = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority === undefined
  );
};

const hasCategoryStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryPriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasCategory = (requestQuery) => {
  return (
    requestQuery.category !== undefined &&
    requestQuery.priority === undefined &&
    requestQuery.status === undefined
  );
};
//GET API 1

app.get("/todos/", async (request, response) => {
  const { status, search_q = "", priority, category } = request.query;
  let dbQuery = "";
  switch (true) {
    case hasPriorityStatus(request.query):
      dbQuery = ` 
  SELECT 
    * 
  FROM 
    todo 
  WHERE 
    todo LIKE '%${search_q}%' AND
    status = '${status.replace("%20", " ")}'
    AND 
    priority = '${priority.replace("%20", " ")}'`;
      break;
    case hasCategory(request.query):
      dbQuery = ` 
          SELECT 
          * 
          FROM 
          todo 
          WHERE 
          category = '${category}'
          `;
      break;
    case hasPriority(request.query):
      dbQuery = ` 
    SELECT 
    * 
    FROM 
    todo 
    WHERE 
    todo LIKE '%${search_q}%'
    AND 
    priority = '${priority}' 
    `;
      break;
    case haStatus(request.query):
      dbQuery = ` 
          SELECT 
          * 
          FROM 
          todo 
          WHERE 
          todo LIKE '%${search_q}%'
          AND 
          status = '${status.replace("%20", " ")}'`;
      break;
    case hasCategoryStatus(request.query):
      dbQuery = `
          SELECT 
          *
          FROM 
          todo 
          WHERE 
          category = '${category}'
          AND 
          status = '${status}'
          `;
      break;
    case hasCategoryPriority(request.query):
      dbQuery = ` 
              SELECT 
              *
              FROM 
              todo 
              WHERE 
              category = '${category}'
              AND 
              priority = '${priority}';`;
      break;
    default:
      dbQuery = `
        SELECT 
        * 
        FROM 
        todo 
        WHERE 
        todo LIKE '%${search_q}%'
        `;
  }

  const todoStatusData = await db.all(
    `SELECT * FROM todo WHERE todo LIKE ${"BUY"}`
  );
  response.send(todoStatusData);
});

//API2

app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const dbQuery = ` 
    SELECT 
    * 
    FROM 
    todo 
    WHERE 
    id = ${todoId};`;
  const todoData = await db.get(dbQuery);
  response.send({
    id: todoData.id,
    todo: todoData.todo,
    priority: todoData.priority,
    status: todoData.priority,
    category: todoData.category,
    dueDate: todoData.due_date,
  });
});

//Todo API6 DELETE

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = ` 
    DELETE FROM 
    todo 
    WHERE 
    id = ${todoId}
    `;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});
