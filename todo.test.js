const fs = require("fs");
const { execSync } = require("child_process");

let deleteFile = (path) => {
  try {
    fs.unlinkSync(path);
  } catch (err) {}
};

beforeEach(() => {
  deleteFile(`${__dirname}/todo.txt`);
  deleteFile(`${__dirname}/done.txt`);
});

let todoTxtCli = (...args) => [`${__dirname}/todo`, ...args].join(" ");

let usage = `Usage :-
$ ./todo add "todo item"  # Add a new todo
$ ./todo ls               # Show remaining todos
$ ./todo del NUMBER       # Delete a todo
$ ./todo done NUMBER      # Complete a todo
$ ./todo help             # Show usage
$ ./todo report           # Statistics`;

test("prints help when no additional args are provided", () => {
  let received = execSync(todoTxtCli()).toString("utf8");
  execSync(todoTxtCli("reset")).toString("utf8");
  expect(received).toEqual(expect.stringContaining(usage));
});

test("prints help", () => {
  let received = execSync(todoTxtCli("help")).toString("utf8");
  execSync(todoTxtCli("reset")).toString("utf8");
  expect(received).toEqual(expect.stringContaining(usage));
});

test("add a single todo", () => {
  let expected = 'Added todo: "the thing i need to do"';
  execSync(todoTxtCli("reset")).toString("utf8");
  let received = execSync(
    todoTxtCli("add", '"the thing i need to do"')
  ).toString("utf8");

  expect(received).toEqual(expect.stringContaining(expected));
});

test("show error message when add is not followed by a todo", () => {
  execSync(todoTxtCli("reset")).toString("utf8");
  let expected = "Error: Missing todo string. Nothing added!";
  let received = execSync(todoTxtCli("add")).toString("utf8");

  expect(received).toEqual(expect.stringContaining(expected));
});

test("add multiple todos", () => {
  execSync(todoTxtCli("reset")).toString("utf8");
  let todos = [
    "the thing i need to do",
    "water the plants",
    "find needle in the haystack",
  ];

  todos.forEach((todo, i) => {
    let expected = `Added todo: "${todo}"`;
    let received = execSync(todoTxtCli("add", `"${todo}"`)).toString("utf8");

    expect(received).toEqual(expect.stringContaining(expected));
  });
});

test("list todos in reverse order (added latest first)", () => {
  execSync(todoTxtCli("reset")).toString("utf8");
  let todos = [
    "the thing i need to do",
    "water the plants",
    "find needle in the haystack",
  ];
  todos.forEach((todo) => execSync(todoTxtCli("add", `"${todo}"`)));

  let expected = `[3] find needle in the haystack
[2] water the plants
[1] the thing i need to do
`;
  let received = execSync(todoTxtCli("ls")).toString("utf8");

  expect(received).toEqual(expect.stringContaining(expected));
});

test("list when there are no remaining todos", () => {
  execSync(todoTxtCli("reset")).toString("utf8");
  let expected = `There are no pending todos!`;
  let received = execSync(todoTxtCli("ls")).toString("utf8");

  expect(received).toEqual(expect.stringContaining(expected));
});

test("delete a todo", () => {
  execSync(todoTxtCli("reset")).toString("utf8");
  let todos = [
    "the thing i need to do",
    "water the plants",
    "find needle in the haystack",
  ];
  todos.forEach((todo) => execSync(todoTxtCli("add", `"${todo}"`)));

  let expected = "Deleted todo #2";
  let received = execSync(todoTxtCli("del", "2")).toString("utf8");

  expect(received).toEqual(expect.stringContaining(expected));
});

test("delete todos numbered 3, 2 & 1", () => {
  execSync(todoTxtCli("reset")).toString("utf8");
  let todos = [
    "the thing i need to do",
    "water the plants",
    "find needle in the haystack",
  ];
  todos.forEach((todo) => execSync(todoTxtCli("add", `"${todo}"`)));

  [3, 2, 1].forEach((n) => {
    let expected = `Deleted todo #${n}`;
    let received = execSync(todoTxtCli("del", n.toString())).toString("utf8");

    expect(received).toEqual(expect.stringContaining(expected));
  });
});

test("delete first todo item 3 times", () => {
  execSync(todoTxtCli("reset")).toString("utf8");
  let todos = [
    "the thing i need to do",
    "water the plants",
    "find needle in the haystack",
  ];
  todos.forEach((todo) => execSync(todoTxtCli("add", `"${todo}"`)));

  [1, 1, 1].forEach((n) => {
    let expected = `Deleted todo #${n}`;
    let received = execSync(todoTxtCli("del", n.toString())).toString("utf8");

    expect(received).toEqual(expect.stringContaining(expected));
  });
});

test("delete non-existent todos", () => {
  execSync(todoTxtCli("reset")).toString("utf8");
  let todos = [
    "the thing i need to do",
    "water the plants",
    "find needle in the haystack",
  ];
  todos.forEach((todo) => execSync(todoTxtCli("add", `"${todo}"`)));

  [0, 4, 5].forEach((n) => {
    let expected = `Error: todo #${n} does not exist. Nothing deleted.`;
    let received = execSync(todoTxtCli("del", n.toString())).toString("utf8");

    expect(received).toEqual(expect.stringContaining(expected));
  });
});

test("delete does not have enough arguments", () => {
  execSync(todoTxtCli("reset")).toString("utf8");
  let expected = "Error: Missing NUMBER for deleting todo.";
  let received = execSync(todoTxtCli("del")).toString("utf8");

  expect(received).toEqual(expect.stringContaining(expected));
});

test("mark a todo as done", () => {
  execSync(todoTxtCli("reset")).toString("utf8");
  let todos = [
    "the thing i need to do",
    "water the plants",
    "find needle in the haystack",
  ];
  todos.forEach((todo) => execSync(todoTxtCli("add", `"${todo}"`)));

  let expected = "Marked todo #2 as done.";
  let received = execSync(todoTxtCli("done", "2")).toString("utf8");

  expect(received).toEqual(expect.stringContaining(expected));
});

test("mark as done a todo which does not exist", () => {
  execSync(todoTxtCli("reset")).toString("utf8");
  let todos = [
    "the thing i need to do",
    "water the plants",
    "find needle in the haystack",
  ];
  todos.forEach((todo) => execSync(todoTxtCli("add", `"${todo}"`)));

  let expected = "Error: todo #0 does not exist.";
  let received = execSync(todoTxtCli("done", "0")).toString("utf8");

  expect(received).toEqual(expect.stringContaining(expected));
});

test("mark as done without providing a todo number", () => {
	execSync(todoTxtCli("reset")).toString("utf8");
  let todos = [
    "the thing i need to do",
    "water the plants",
    "find needle in the haystack",
  ];
  todos.forEach((todo) => execSync(todoTxtCli("add", `"${todo}"`)));

  let expected = "Error: Missing NUMBER for marking todo as done.";
  let received = execSync(todoTxtCli("done")).toString("utf8");

  expect(received).toEqual(expect.stringContaining(expected));
});

test("report pending & completed todos", () => {
	execSync(todoTxtCli("reset")).toString("utf8");
  let todos = [
    "the thing i need to do",
    "water the plants",
    "find needle in the haystack",
  ];
  todos.forEach((todo) => execSync(todoTxtCli("add", `"${todo}"`)));

  execSync(todoTxtCli("done", "1"));
  execSync(todoTxtCli("done", "2"));

  let date = new Date();
  let expected = `${date.toISOString().slice(0, 10)} Pending : 1 Completed : 2`;
  let received = execSync(todoTxtCli("report")).toString("utf8");

  expect(received).toEqual(expect.stringContaining(expected));
});
