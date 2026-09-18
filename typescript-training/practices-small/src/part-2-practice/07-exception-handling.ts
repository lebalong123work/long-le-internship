// PART I - EXCEPTION HANDLING & THE 'UNKNOWN' TYPE
//
// Mandatory JavaScript source reading:
// - js/api/storage.js -> Read any function (e.g., fetchTasks), pay attention to the try...catch block and how Error is thrown.
// - js/api/apiClient.js -> Read the line if (!response.ok) { throw new Error(...) }.
// - js/utils/errorHandler.js -> Read how error.message is accessed from the event.
// Requirements:
// 1. Write a function to simulate fetchAPI(endpoint: string) that can throw errors. If endpoint === "", throw new Error("Invalid endpoint");. If endpoint === "hack", throw "Malicious error string".
// 2. Write a fetchTasks() function using try...catch to call fetchAPI.
// 3. Declare catch as catch (error: unknown).
// 4. Inside the catch block, intentionally write console.log(error.message) to see TypeScript trigger an error.
// 5. Fix the error using Type Narrowing:
//    Use if (error instanceof Error) to log error.message.
//    In the else branch, cast the type or log String(error).
// 6. Add a finally block to log "Request finished".

function fetchAPI(endpoint: string) {
  if (endpoint === "") {
    throw new Error("Invalid endpoint");
  }
  if (endpoint === "hack") {
    throw "Malicious bug";
  }
  return "Success";
}

function fetchTasks() {
  try {
    fetchAPI("hack");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log("Standard error:", error.message);
    } else {
      console.log("Unknown error:", String(error));
    }
  } finally {
    console.log("Done request");
  }
}

fetchTasks();
export {};
