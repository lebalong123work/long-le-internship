let tasks = [];

export const getTasks = () => {
  return tasks;
};

export const addTask = (taskName, estPomodoros) => {
  const newId = crypto.randomUUID(); // Random ID

  const newTask = {
    id: newId,
    name: taskName,
    est: estPomodoros,
    act: 0,
    isDone: false,
  };

  tasks.push(newTask);
  console.log("Current Tasks List:", tasks);
};
