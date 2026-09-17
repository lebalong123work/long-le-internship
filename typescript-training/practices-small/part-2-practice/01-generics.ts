// PART I - GENERICS IN DEPTH
//
// Required JavaScript source to read:
// - js/api/apiClient.js -> read the fetchAPI function which currently returns response.json() with an unknown data type.
// - js/storage/localDB.js -> read the LocalDB object which handles storing arrays of data.
// Requirements:
// 1. Generic Functions & Defaults:
//    Rewrite the function `fetchAPI<T = any>(endpoint: string): Promise<T>`.
//    This function will return type `T`, which defaults to `any` if no type is passed in.
// 2. Generic Classes & Interfaces:
//    Create an `interface IStorage<T>` with 2 methods: `getItems(): T[]` and `saveItems(items: T[]): void`.
//    Write `class GenericLocalDB<T> implements IStorage<T>` with logic similar to the original `LocalDB`, but reusable for any type `T`.
// 3. Generic Constraints with Classes:
//    Create class `Task { id: string; name: string; }`. Instantiate `const taskDB = new GenericLocalDB<Task>()`.
//    Try calling `taskDB.saveItems([{ id: "1", name: "Learn TS" }])`.
// 4. Using Type Parameters in Generic Constraints (`keyof`):
//    Write the function `getProperty<T, K extends keyof T>(obj: T, key: K): T[K]`.
//    Use this function to get `name` from a `Task` object.
// 5. Variance Annotations (Simulation):
//    Declare `interface Producer<out T> { make(): T; }`.
//    This is an interface that only produces `T` (covariance), using the `out` keyword so TypeScript can optimize type comparison.

async function fetchAPI<T = any>(endpoint: string): Promise<T> {
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("Wrong connet API");
  }
  return response.json();
}

interface IStorage<T> {
  getItems(): T[];
  saveItems(items: T[]): void;
}

class GenericLocalDB<T> implements IStorage<T> {
  getItems(): T[] {
    const data = localStorage.getItem("app_data");
    return data ? JSON.parse(data) : [];
  }

  saveItems(items: T[]): void {
    localStorage.setItem("app_data", JSON.stringify(items));
  }
}

class Task {
  constructor(
    public id: string,
    public name: string,
  ) {}
}

const taskDB = new GenericLocalDB<Task>();
taskDB.saveItems([{ id: "1", name: "Learn TS" }]);

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const myTask = new Task("1", "Learn TS");
const taskName = getProperty(myTask, "name"); // Hợp lệ

interface Producer<out T> {
  make(): T;
}

export {};
