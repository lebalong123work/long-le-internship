// PART I - FUNCTIONS
// Requirements:
// 1. Create a signature for parsePomodoro:
//    input can be string | number | null | undefined;
//    output is number | null.
// 2. Create a signature for addTask keeping the JS concept:
//    taskName is a string, estPomodoros is a string | number,
//    async function returns Promise<Task | null>.
// 3. Create a signature for editTask and clearly explain why the output is Promise<boolean>.
// 4. Create a callback type for timer tick: takes timeString: string and returns void.
// 5. Write an anonymous callback inside a context TypeScript already knows,
//    for example a string[] forEach; no need to write types if context is clear.
// 6. Keep all original JS validation branches; do not split logic into a new flow.
interface Task {
  id: string;
  name: string;
  est: number;
  act: number;
  isDone: boolean;
}
function parsePomodoro(
  value: string | number | null | undefined,
): number | null {
  if (value === undefined || value === "" || value === null) {
    return null;
  }
  let finalVal = Number(value);
  if (Number.isNaN(finalVal) || finalVal < 0) {
    return null;
  }
  return Math.floor(finalVal);
}

async function addTask(
  taskName: string,
  estPomodoros: string | number,
): Promise<Task | null> {
  if (typeof taskName !== "string" || taskName.trim() === "") {
    return null;
  }

  let finalEst = parsePomodoro(estPomodoros);
  if (finalEst === null) {
    return null;
  }

  const newTask: Task = {
    id: crypto.randomUUID(),
    name: taskName.trim(),
    est: finalEst,
    act: 0,
    isDone: false,
  };

  return newTask;
}
async function editTask(
  id: string,
  newName: string,
  newAct: string | number,
  newEst: string | number,
): Promise<boolean> {
  return true;
}

type TimerTickCallback = (timeString: string) => void;

function setTimerCallback(callback: TimerTickCallback): 
void {
  callback("25:00");
}

const taskList: string[] = ["Code", "Review", "Deploy"];
taskList.forEach(function (name) {
  console.log(name.toUpperCase());
});

export {};
